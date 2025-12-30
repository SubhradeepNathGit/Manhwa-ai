# backend/app/routers/generate_audio_story.py (GROQ VERSION)
"""
⚡ OPTIMIZED: Uses Groq (Llama 3.2 Vision) for ultra-fast generation.
"""

import asyncio
import io
import os
import base64
import tempfile
import traceback
from typing import List
import time

# ⚡ Groq AI
from groq import Groq

from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from pydub import AudioSegment

# --- Storage uploader ---
from ..utils.supabase_utils import supabase_upload

# --- PDF extraction ---
from ..utils.pdf_utils import extract_pdf_images_high_quality

# --- TTS (Neural) ---
from ..utils.tts_utils import generate_narration_audio

# --- LLM ---
from ..utils.openai_utils import generate_cinematic_script

router = APIRouter()

# Initialize Groq Client
# Ensure GROQ_API_KEY is in your .env file
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ------------------------------------------------------
# Convert PIL Images → list[bytes] (jpeg)
# ------------------------------------------------------
def pil_images_to_bytes(images: List) -> List[bytes]:
    """Convert PIL images to JPEG bytes with optimization"""
    out = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", optimize=True, quality=75)
        out.append(buf.getvalue())
    return out

# ------------------------------------------------------
# Helper: Visual Description (Groq Llama 3.2)
# ------------------------------------------------------
def generate_visual_description(image_bytes: bytes) -> str:
    """
    Uses Groq (Llama 4 Scout) to READ dialogue and describe action in Hindi.
    """
    try:
        # 1. Encode image to Base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # 2. Prompt for "Manga-Bhai" Style
        prompt = """
        ROLE: You are 'Manga-Bhai', an energetic Indian YouTuber narrating a manga story.
        TASK: Look at this image and describe it in 1 sentence using Hinglish (Hindi + English).
        
        RULES:
        1. Read any speech bubbles in the image and translate the core meaning to natural Hindi.
        2. Describe the action with excitement (e.g., "Aur tabhi Jin-Woo ne apni dagger nikali!").
        3. Do NOT simply translate. NARRATE it like a story.
        4. If it's a fight scene, use words like "Dhamaka", "Jordaar vaar", "Tezi se".
        
        OUTPUT: A single, punchy Hinglish sentence.
        """

        # 3. Call Groq API with NEW MODEL ID
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            # ⚡ FIXED: Updated to latest supported Vision model (Llama 4 Scout)
            model="meta-llama/llama-4-scout-17b-16e-instruct", 
            temperature=0.6,
            max_tokens=300,
        )

        text = chat_completion.choices[0].message.content.strip()
        print(f"   [Groq Vision Output]: {text}")

        if not text:
             return "Scene me kuch ajeeb ho raha hai..."
             
        return text

    except Exception as e:
        print(f"⚠ Visual description failed (Groq): {e}")
        return "Kahani aage badhti hai..."
# ------------------------------------------------------
# Helper: Upload Only (OCR Removed)
# ------------------------------------------------------
async def process_panel_parallel(
    img_bytes: bytes,
    idx: int,
    manga_folder: str
) -> str:
    """Process ONE panel: Upload only"""
    upload_path = f"{manga_folder}/images/page_{idx:02d}.jpg"
    image_url = await run_in_threadpool(supabase_upload, img_bytes, upload_path, "image/jpeg")
    return image_url


# =====================================================================
# MAIN ENDPOINT
# =====================================================================
@router.post("/generate_audio_story")
async def generate_audio_story(
    manga_name: str = Form(...),
    manga_genre: str = Form(...),
    manga_pdf: UploadFile = File(...)
):
    """
    ⚡ OPTIMIZED: Groq Version
    """
    temp_pdf_path = None
    merged_audio_tmp = None
    start_time = time.time()
    
    manga_folder = manga_name.replace(" ", "_").replace("/", "_").lower()

    try:
        # STEP 1: Save PDF
        pdf_data = await manga_pdf.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(pdf_data)
            temp_pdf_path = tmp.name
        print(f"✔ PDF saved")

        # STEP 2: Extract Images
        images = await run_in_threadpool(extract_pdf_images_high_quality, temp_pdf_path)
        if not images: raise HTTPException(400, "No images extracted")
        if len(images) > 50: raise HTTPException(400, "Too many panels (>50).")
        image_bytes = pil_images_to_bytes(images)
        print(f"✔ Extracted {len(image_bytes)} panels")

        # STEP 3: Upload (Throttled)
        print("✔ Uploading images to Supabase (Throttled)...")
        semaphore = asyncio.Semaphore(2) 

        async def upload_with_limit(img_bytes, idx):
            async with semaphore:
                return await process_panel_parallel(img_bytes, idx, manga_folder)
        
        parallel_tasks = [upload_with_limit(b, i) for i, b in enumerate(image_bytes)]
        image_urls = await asyncio.gather(*parallel_tasks)
        print(f"✔ Upload completed.")
        extracted_text = ""

        # STEP 4: Generate Script (Calls OpenAI Utils, which we must also update to Groq)
        print("✔ Generating narrative script...")
        llm_output = await run_in_threadpool(
            generate_cinematic_script,
            manga_name,
            manga_genre,
            extracted_text,
            image_bytes[:20], 
        )

        scenes = llm_output.get("scenes", [])
        print(f"--- [DEBUG] Main LLM returned {len(scenes)} scenes ---")

        # Backfill Logic
        if len(scenes) < len(image_urls):
            start_idx = len(scenes)
            print(f"⚠ [DEBUG] Missing {len(image_urls) - len(scenes)} scenes. Triggering Groq Backfill...")
            
            for i in range(start_idx, len(image_urls)):
                print(f"   ➤ [DEBUG] Backfilling Panel {i}...")
                visual_desc = await run_in_threadpool(generate_visual_description, image_bytes[i])
                
                scenes.append({
                    "narration_segment": visual_desc.strip() or "Kahani aage badhti hai.",
                    "image_page_index": i,
                    "animation_type": "zoom_pan",
                    "duration": 4.0 
                })

        # Ensure keys
        for i, sc in enumerate(scenes):
            sc.setdefault("image_page_index", min(i, len(image_urls) - 1))
            sc.setdefault("narration_segment", "")
            sc.setdefault("animation_type", "zoom_pan")
            sc.setdefault("duration", 3.0)

        # STEP 5: TTS
        print("✔ Generating Neural narration audio...")
        timeline = 0.0
        merged_audio = AudioSegment.empty()
        final_scenes = []

        for sc in scenes:
            narration = sc["narration_segment"].strip()
            if not narration:
                clip = AudioSegment.silent(duration=2000)
                duration = 2.0
            else:
                # Async TTS call
                audio_path, duration = await generate_narration_audio(narration)
                try:
                    clip = AudioSegment.from_mp3(audio_path)
                except:
                    clip = AudioSegment.silent(duration=duration * 1000)

            merged_audio += clip
            sc["start_time"] = round(timeline, 2)
            sc["duration"] = round(duration, 2)
            timeline += duration
            final_scenes.append(sc)

        # STEP 6: Merge & Finish
        print("✔ Exporting merged audio...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            merged_audio.export(tmp.name, format="mp3")
            merged_audio_tmp = tmp.name

        with open(merged_audio_tmp, "rb") as f:
            audio_bytes = f.read()

        audio_url = await run_in_threadpool(supabase_upload, audio_bytes, f"{manga_folder}/audio/master_audio.mp3", "audio/mpeg")
        processing_time = time.time() - start_time

        return JSONResponse({
            "manga_name": manga_name,
            "image_urls": image_urls,
            "audio_url": audio_url,
            "final_video_segments": final_scenes,
            "full_narration": llm_output.get("full_narration", ""),
            "processing_time": round(processing_time, 2),
            "total_panels": len(image_urls),
            "total_duration": round(timeline, 2)
        })

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Audio story failed: {str(e)}")

    finally:
        # Cleanup code...
        if temp_pdf_path and os.path.exists(temp_pdf_path):
             os.remove(temp_pdf_path)
        if merged_audio_tmp and os.path.exists(merged_audio_tmp):
             os.remove(merged_audio_tmp)