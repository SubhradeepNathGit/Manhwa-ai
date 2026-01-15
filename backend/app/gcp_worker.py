import os
import json
import base64
import time
import requests
import uuid
import io
import asyncio
import traceback
from pydub import AudioSegment
from groq import Groq
from supabase import create_client

# Import Utils
from .utils.supabase_utils import supabase_upload
from .utils.pdf_utils import extract_pdf_images_high_quality
from .utils.tts_utils import generate_narration_audio
from .utils.openai_utils import generate_cinematic_script

# -------------------------------------------------------------------
# 0. SETUP CLIENTS
# -------------------------------------------------------------------
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
supabase = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
)

# -------------------------------------------------------------------
# 1. HELPER FUNCTIONS
# -------------------------------------------------------------------

async def upload_images_parallel(image_bytes, manga_folder):
    """
    Uploads images to Supabase concurrently.
    """
    semaphore = asyncio.Semaphore(5)
    image_urls = [None] * len(image_bytes)
    loop = asyncio.get_running_loop()

    async def _upload(img, idx):
        async with semaphore:
            path = f"{manga_folder}/images/page_{idx:02d}.jpg"
            # Supabase upload is sync, so we run it in a thread executor
            url = await loop.run_in_executor(None, supabase_upload, img, path, "image/jpeg")
            return idx, url

    tasks = [_upload(b, i) for i, b in enumerate(image_bytes)]
    results = await asyncio.gather(*tasks)
    
    for idx, url in results:
        image_urls[idx] = url
    return image_urls

def generate_visual_description_sync(image_bytes):
    """Sync wrapper for Groq Vision (Fill-in scenes)"""
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        prompt = "Describe this image in 1 energetic Hinglish sentence."
        
        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user", 
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            # ✅ FIXED: Use active Groq model
            model="llama-3.2-11b-vision-preview",
            temperature=0.6,
            max_tokens=300,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Groq Vision Error: {e}")
        return "Scene aage badhta hai..."

# -------------------------------------------------------------------
# 2. MAIN PROCESSING FUNCTION (Called by main.py)
# -------------------------------------------------------------------
async def process_task_directly(task_id, manga_name, manga_genre, pdf_url):
    """
    Core Logic: Downloads PDF, extracts images, generates audio, and updates DB.
    Now an ASYNC function called by FastAPI BackgroundTasks.
    """
    print(f"🚀 Starting Background Task: {task_id} | Manga: {manga_name}")

    try:
        # 1. Download PDF
        print("⬇️ Downloading PDF...")
        # requests is sync, but for a simple download it's acceptable in background task
        # For huge files, we'd use aiohttp, but this is fine for now.
        resp = requests.get(pdf_url)
        if resp.status_code != 200:
            raise ValueError("Failed to download PDF")

        temp_pdf = f"/tmp/{uuid.uuid4()}.pdf"
        with open(temp_pdf, "wb") as f:
            f.write(resp.content)

        # 2. Extract Panels (Using Force Splitter)
        print("🖼️ Extracting Images...")
        # CPU heavy operation
        images = extract_pdf_images_high_quality(temp_pdf)
        if not images:
             raise ValueError("No images extracted")

        image_bytes = []
        for img in images:
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=75, optimize=True)
            image_bytes.append(buf.getvalue())

        # 3. Upload Images
        str_id = str(task_id)
        manga_folder = f"{manga_name.replace(' ', '_').lower()}_{str_id[:8]}"
        
        # ✅ FIX: Directly await the async function (No run_async wrapper needed)
        image_urls = await upload_images_parallel(image_bytes, manga_folder)

        # 4. Generate Script
        print("📝 Generating Script...")
        llm_output = generate_cinematic_script(manga_name, manga_genre, "", image_bytes[:4])
        scenes = llm_output.get("scenes", [])

        # 5. Backfill Scenes
        if len(scenes) < len(image_urls):
            print("⚠️ Filling missing scenes...")
            for i in range(len(scenes), len(image_urls)):
                desc = generate_visual_description_sync(image_bytes[i])
                scenes.append({
                    "narration_segment": desc,
                    "image_page_index": i,
                    "duration": 4.0
                })

        # 6. Generate Audio
        print("🎤 Generating Audio...")
        merged_audio = AudioSegment.empty()
        final_scenes = []
        timeline = 0.0

        for sc in scenes:
            text = sc.get("narration_segment", "").strip()
            if text:
                # ✅ FIX: Directly await async TTS
                path, dur = await generate_narration_audio(text) 
                merged_audio += AudioSegment.from_mp3(path)
            else:
                dur = 2.0
                merged_audio += AudioSegment.silent(duration=2000)
            
            sc["start_time"] = round(timeline, 2)
            sc["duration"] = round(dur, 2)
            timeline += dur
            final_scenes.append(sc)

        # 7. Upload Audio
        buf = io.BytesIO()
        merged_audio.export(buf, format="mp3")
        audio_url = supabase_upload(buf.getvalue(), f"{manga_folder}/audio.mp3", "audio/mpeg")

        # 8. Save Result
        final_result = {
            "task_id": task_id,
            "status": "SUCCESS",
            "manga_name": manga_name,
            "image_urls": image_urls,
            "audio_url": audio_url,
            "final_video_segments": final_scenes,
            "total_duration": round(timeline, 2)
        }
        res_url = supabase_upload(json.dumps(final_result).encode(), f"{manga_folder}/result.json", "application/json")

        # 9. Update DB
        print("🔹 Updating Database...")
        supabase.table("jobs").update({
            "status": "SUCCESS",
            "result_url": res_url
        }).eq("id", task_id).execute()

        print("✅ Task Completed Successfully")
        return {"status": "ok"}

    except Exception as e:
        print(f"❌ Worker Failed: {e}")
        traceback.print_exc()
        if task_id:
            supabase.table("jobs").update({"status": "FAILED"}).eq("id", task_id).execute()
        return {"status": "error"}
    finally:
        # Cleanup /tmp
        if 'temp_pdf' in locals() and os.path.exists(temp_pdf):
            os.remove(temp_pdf)