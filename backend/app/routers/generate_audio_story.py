# backend/app/routers/generate_audio_story.py (FIXED: Visual Descriptions for Rich Audio)
"""
⚡ OPTIMIZED: Only generates audio story data
Frontend handles video generation using ffmpeg.wasm
"""

import asyncio
import io
import os
import tempfile
import traceback
from typing import List, Tuple
import time

# ⚡ Added for Visual Description
import google.generativeai as genai

from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from pydub import AudioSegment

# --- Storage uploader ---
from ..utils.supabase_utils import supabase_upload

# --- PDF extraction ---
from ..utils.pdf_utils import extract_pdf_images_high_quality

# --- OCR ---
from ..utils.vision_utils import ocr_image_bytes

# --- TTS ---
from ..utils.tts_utils import generate_narration_audio

# --- LLM ---
from ..utils.openai_utils import generate_cinematic_script

router = APIRouter()


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
# Helper: Visual Description (Gemini Vision)
# ------------------------------------------------------
def generate_visual_description(image_bytes: bytes) -> str:
    """
    Uses Gemini Vision to generate a dramatic 1-sentence description 
    of the panel action for audio narration.
    """
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠ No Google API Key found for visual description")
            return ""
        
        genai.configure(api_key=api_key)
        # Use Flash for speed and low cost
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content([
            "Describe the action and emotion in this manga panel in exactly one short, dramatic sentence suitable for an audiobook narration. Do not mention text bubbles or panels.",
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        
        return response.text.strip() if response.text else ""
    except Exception as e:
        print(f"⚠ Visual description failed: {e}")
        return ""


# ------------------------------------------------------
# Helper: Process OCR + Upload in Parallel
# ------------------------------------------------------
async def process_panel_parallel(
    img_bytes: bytes,
    idx: int,
    manga_folder: str
) -> Tuple[str, str]:
    """Process ONE panel: Upload + OCR at the SAME TIME!"""
    upload_path = f"{manga_folder}/images/page_{idx:02d}.jpg"
    
    upload_task = run_in_threadpool(supabase_upload, img_bytes, upload_path, "image/jpeg")
    ocr_task = run_in_threadpool(ocr_image_bytes, img_bytes)
    
    image_url, ocr_text = await asyncio.gather(upload_task, ocr_task)
    
    return image_url, ocr_text


# =====================================================================
# MAIN ENDPOINT: Generate Audio Story (OPTIMIZED FOR FRONTEND VIDEO)
# =====================================================================
@router.post("/generate_audio_story")
async def generate_audio_story(
    manga_name: str = Form(...),
    manga_genre: str = Form(...),
    manga_pdf: UploadFile = File(...)
):
    """
    ⚡ OPTIMIZED: Returns everything needed for FRONTEND video generation
    """
    temp_pdf_path = None
    merged_audio_tmp = None
    start_time = time.time()
    
    manga_folder = manga_name.replace(" ", "_").replace("/", "_").lower()

    try:
        # ------------------------------------------------------
        # STEP 1 — Save PDF temporarily
        # ------------------------------------------------------
        pdf_data = await manga_pdf.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(pdf_data)
            temp_pdf_path = tmp.name

        print(f"✔ PDF saved, starting extraction")

        # ------------------------------------------------------
        # STEP 2 — Extract images (with strict limits!)
        # ------------------------------------------------------
        images = await run_in_threadpool(extract_pdf_images_high_quality, temp_pdf_path)

        if not images:
            raise HTTPException(400, "No images extracted from PDF")
        
        # ⚡ CRITICAL: Prevent too many panels
        if len(images) > 50:
            raise HTTPException(
                400,
                f"Too many panels extracted ({len(images)}). Please use a cleaner manga PDF."
            )

        image_bytes = pil_images_to_bytes(images)
        print(f"✔ Extracted {len(image_bytes)} panels")

        # ------------------------------------------------------
        # STEP 3 — Parallel OCR + Upload
        # ------------------------------------------------------
        print("✔ Running parallel OCR + Upload...")
        
        parallel_tasks = [
            process_panel_parallel(img_bytes, idx, manga_folder)
            for idx, img_bytes in enumerate(image_bytes)
        ]
        
        results = await asyncio.gather(*parallel_tasks)
        
        image_urls = [url for url, _ in results]
        ocr_results = [text for _, text in results]
        
        extracted_text = "\n\n--- PAGE BREAK ---\n\n".join([t for t in ocr_results if t])
        print(f"✔ OCR + Upload completed")

        # ------------------------------------------------------
        # STEP 4 — Generate LLM script
        # ------------------------------------------------------
        print("✔ Generating narrative script...")
        llm_output = await run_in_threadpool(
            generate_cinematic_script,
            manga_name,
            manga_genre,
            extracted_text,
            image_bytes[:15],  # ⚡ Limit images sent to LLM
        )

        scenes = llm_output.get("scenes", [])
        if not scenes:
            scenes = []

        # ⚡ FIX 1: Smart Visual Backfilling
        # If LLM generates fewer scenes than images, use Vision AI + OCR
        if len(scenes) < len(image_urls):
            print(f"⚠ LLM generated {len(scenes)} scenes for {len(image_urls)} images. Backfilling with Visual AI...")
            start_idx = len(scenes)
            
            for i in range(start_idx, len(image_urls)):
                # 1. Get Visual Description (The "Instruction" requested)
                # We run this in threadpool to avoid blocking
                visual_desc = await run_in_threadpool(generate_visual_description, image_bytes[i])
                
                # 2. Get Text Content (OCR)
                text_content = ""
                if i < len(ocr_results) and ocr_results[i]:
                     # Clean up text
                     text_content = " ".join(ocr_results[i].split())
                
                # 3. Combine for rich audio
                # Format: [Action Description]. [Character Dialogue]
                full_narration = f"{visual_desc} {text_content}".strip()
                
                if not full_narration:
                    print(f"   • Panel {i}: No visual or text content found.")
                    full_narration = "" # Will fallback to silence

                scenes.append({
                    "narration_segment": full_narration,
                    "image_page_index": i,
                    "animation_type": "zoom_pan",
                    "duration": 4.0 # Slightly longer for descriptive audio
                })

        # Ensure required keys
        for i, sc in enumerate(scenes):
            sc.setdefault("image_page_index", min(i, len(image_urls) - 1))
            sc.setdefault("narration_segment", "")
            sc.setdefault("animation_type", "zoom_pan")
            sc.setdefault("duration", 3.0)

        # ------------------------------------------------------
        # STEP 5 — Generate TTS audio
        # ------------------------------------------------------
        print("✔ Generating narration audio...")

        timeline = 0.0
        merged_audio = AudioSegment.empty()
        final_scenes = []

        for sc in scenes:
            narration = sc["narration_segment"].strip()
            
            # ⚡ FIX 2: Handle Audio Generation
            if not narration:
                # If absolutely no text (even after Visual+OCR fallback), use 2s silence
                duration = 2.0 
                clip = AudioSegment.silent(duration=2000)
                print(f"   • Scene {len(final_scenes)+1}: [Silent]")
            else:
                # Generate audio
                print(f"   • Scene {len(final_scenes)+1}: Generating TTS ({len(narration)} chars)...")
                audio_path, duration = await run_in_threadpool(generate_narration_audio, narration)
                try:
                    clip = AudioSegment.from_mp3(audio_path)
                except:
                    print("⚠ Audio damaged — using silent fallback")
                    clip = AudioSegment.silent(duration=duration * 1000)

            merged_audio += clip

            sc["start_time"] = round(timeline, 2)
            sc["duration"] = round(duration, 2)
            timeline += duration

            final_scenes.append(sc)

        if not final_scenes:
            raise HTTPException(500, "No scenes with audio generated")

        # ------------------------------------------------------
        # STEP 6 — Save merged audio → upload
        # ------------------------------------------------------
        print("✔ Exporting merged audio...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            merged_audio.export(tmp.name, format="mp3")
            merged_audio_tmp = tmp.name

        audio_storage_path = f"{manga_folder}/audio/master_audio.mp3"

        with open(merged_audio_tmp, "rb") as f:
            audio_bytes = f.read()

        audio_url = await run_in_threadpool(
            supabase_upload,
            audio_bytes,
            audio_storage_path,
            "audio/mpeg"
        )

        processing_time = time.time() - start_time
        print(f"✔ Completed in {processing_time:.2f}s")

        # ------------------------------------------------------
        # RESPONSE
        # ------------------------------------------------------
        return JSONResponse({
            "manga_name": manga_name,
            "image_urls": image_urls,
            "audio_url": audio_url,
            "final_video_segments": final_scenes,
            "full_narration": llm_output.get("full_narration", ""),
            "processing_time": round(processing_time, 2),
            "total_panels": len(image_urls),
            "total_duration": round(timeline, 2),
            "note": "Video generation happens in frontend using ffmpeg.wasm"
        })

    except HTTPException:
        raise

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Audio story failed: {str(e)}")

    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except:
                pass

        if merged_audio_tmp and os.path.exists(merged_audio_tmp):
            try:
                os.remove(merged_audio_tmp)
            except:
                pass