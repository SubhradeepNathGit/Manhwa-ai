import os
import io
import asyncio
import base64
import time
import traceback
import json
import requests
import tempfile 
from redis import Redis  # Required for the connection check
from celery import Celery
from groq import Groq
from pydub import AudioSegment

# Import utils
from .utils.supabase_utils import supabase_upload
from .utils.pdf_utils import extract_pdf_images_high_quality
from .utils.tts_utils import generate_narration_audio
from .utils.openai_utils import generate_cinematic_script

# -------------------------------------------------------------------
# 1. SETUP & REDIS CONNECTION CHECK
# -------------------------------------------------------------------
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

print(f"🔄 [Startup] Initializing Worker...")
print(f"🔄 [Startup] Testing Redis connection at: {redis_url}")

try:
    # Create a temporary Redis client just to test the connection
    test_client = Redis.from_url(redis_url, socket_connect_timeout=5)
    test_client.ping()
    print(f"✅ [Startup] Successfully connected to Redis!")
except Exception as e:
    print(f"❌ [Startup] Redis connection FAILED: {e}")
    print("   -> Is the 'manhwa_redis' container running?")
    print("   -> Is 'redis' listed in docker-compose.yml depends_on?")

# Initialize Celery App
celery_app = Celery(__name__, broker=redis_url, backend=redis_url)
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


# -------------------------------------------------------------------
# 2. HELPER FUNCTIONS
# -------------------------------------------------------------------
def pil_images_to_bytes(images):
    out = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", optimize=True, quality=75)
        out.append(buf.getvalue())
    return out

def run_async(coroutine):
    """Helper to run async code in sync Celery worker"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coroutine)

def generate_visual_description_sync(image_bytes):
    """Sync wrapper for Groq Vision"""
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        prompt = "ROLE: You are 'Manga-Bhai'. Describe this image in 1 energetic Hinglish sentence. Focus on action."
        
        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user", 
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            model="meta-llama/llama-3.2-11b-vision-preview",
            temperature=0.6,
            max_tokens=300,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Error: {e}")
        return "Scene aage badhta hai..."

# --- Parallel Uploader (Async) ---
async def upload_images_parallel(image_bytes, manga_folder):
    semaphore = asyncio.Semaphore(5)
    image_urls = [None] * len(image_bytes)
    loop = asyncio.get_running_loop()

    async def _upload(img, idx):
        async with semaphore:
            path = f"{manga_folder}/images/page_{idx:02d}.jpg"
            # Run sync supabase_upload in a thread to be non-blocking
            url = await loop.run_in_executor(None, supabase_upload, img, path, "image/jpeg")
            return idx, url

    tasks = [_upload(b, i) for i, b in enumerate(image_bytes)]
    results = await asyncio.gather(*tasks)
    
    for idx, url in results:
        image_urls[idx] = url
    return image_urls


# -------------------------------------------------------------------
# 3. MAIN BACKGROUND TASK
# -------------------------------------------------------------------
@celery_app.task(bind=True)
def process_manga_task(self, manga_name, manga_genre, pdf_url):
    temp_pdf_path = None
    try:
        manga_folder = manga_name.replace(" ", "_").lower()
        
        # 1. Download PDF (Sync)
        self.update_state(state='PROCESSING', meta={'progress': 5, 'message': 'Downloading PDF...'})
        response = requests.get(pdf_url)
        if response.status_code != 200: raise ValueError("Failed to download PDF")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(response.content)
            temp_pdf_path = tmp.name

        # 2. Extract Images (Sync - Direct Call)
        self.update_state(state='PROCESSING', meta={'progress': 10, 'message': 'Extracting Images...'})
        images = extract_pdf_images_high_quality(temp_pdf_path) 
        
        if not images: raise ValueError("No images extracted")
        image_bytes = pil_images_to_bytes(images)

        # 3. Upload Images (Async Wrapper Needed)
        self.update_state(state='PROCESSING', meta={'progress': 30, 'message': 'Uploading Images...'})
        image_urls = run_async(upload_images_parallel(image_bytes, manga_folder))

        # 4. Generate Script (Sync - Direct Call)
        self.update_state(state='PROCESSING', meta={'progress': 50, 'message': 'Writing Script...'})
        llm_output = generate_cinematic_script(
            manga_name, manga_genre, "", image_bytes[:20]
        )
        scenes = llm_output.get("scenes", [])

        # 5. Backfill Logic (Sync - Direct Call)
        if len(scenes) < len(image_urls):
            self.update_state(state='PROCESSING', meta={'progress': 60, 'message': 'Filling missing scenes...'})
            for i in range(len(scenes), len(image_urls)):
                desc = generate_visual_description_sync(image_bytes[i])
                scenes.append({
                    "narration_segment": desc,
                    "image_page_index": i,
                    "duration": 4.0
                })

        # 6. Generate Audio (Async Wrapper Needed for TTS)
        self.update_state(state='PROCESSING', meta={'progress': 80, 'message': 'Generating Audio...'})
        merged_audio = AudioSegment.empty()
        final_scenes = []
        timeline = 0.0

        for sc in scenes:
            text = sc.get("narration_segment", "").strip()
            if text:
                # generate_narration_audio is Async, so we wrap it
                path, dur = run_async(generate_narration_audio(text))
                merged_audio += AudioSegment.from_mp3(path)
            else:
                dur = 2.0
                merged_audio += AudioSegment.silent(duration=2000)
            
            sc["start_time"] = round(timeline, 2)
            sc["duration"] = round(dur, 2)
            timeline += dur
            final_scenes.append(sc)

        # 7. Save Final Audio (Sync - Direct Call)
        buf = io.BytesIO()
        merged_audio.export(buf, format="mp3")
        
        audio_url = supabase_upload(
            buf.getvalue(), 
            f"{manga_folder}/audio/master_audio.mp3", 
            "audio/mpeg"
        )

        return {
            "manga_name": manga_name,
            "image_urls": image_urls,
            "audio_url": audio_url,
            "final_video_segments": final_scenes,
            "total_duration": round(timeline, 2)
        }

    except Exception as e:
        print(f"❌ Task Failed: {e}")
        traceback.print_exc()
        return {"status": "FAILED", "error": str(e)}
        
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)