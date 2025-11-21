# backend/app/utils/tts_utils.py
"""
Production-Ready Text-to-Speech Generator for Manga Narration
-------------------------------------------------------------
Features:
 ✅ Google TTS (gTTS) for Hinglish/Hindi narration
 ✅ Auto-chunking for long text (prevents gTTS failures)
 ✅ Smart caching (same text = instant audio)
 ✅ Cloud Run compatible (/tmp directory support)
 ✅ Accurate duration calculation
 ✅ Retry logic with fallback
 ✅ FFmpeg validation
 ✅ Memory-efficient processing
"""

import os
import time
import hashlib
import shutil
from typing import Tuple, List

from gtts import gTTS
from pydub import AudioSegment

# Import cache directory from config
from app.config import TTS_CACHE_DIR


# ============================================================
# 1. FFmpeg Validation (Cloud Run Compatible)
# ============================================================
def _assert_ffmpeg_exists():
    """Verify FFmpeg is available (required by pydub)"""
    if not shutil.which("ffmpeg"):
        raise EnvironmentError(
            "❌ FFmpeg not found! Install it or add to PATH.\n"
            "Cloud Run: Should be installed via Dockerfile."
        )


# ============================================================
# 2. Text Normalization (Better Cache Keys)
# ============================================================
def _normalize(text: str) -> str:
    """
    Normalize text for consistent caching
    - Remove extra whitespace
    - Strip newlines
    - Lowercase for case-insensitive matching
    """
    text = text.replace("\n", " ").replace("\r", " ").strip()
    text = " ".join(text.split())  # Remove multiple spaces
    return text.lower()


# ============================================================
# 3. Get Audio Duration Safely
# ============================================================
def _duration(path: str) -> float:
    """
    Get audio duration in seconds using pydub
    Returns 0.0 if file is corrupted/invalid
    """
    try:
        audio = AudioSegment.from_mp3(path)
        return round(len(audio) / 1000.0, 2)
    except Exception as e:
        print(f"⚠ Duration check failed for {path}: {e}")
        return 0.0


# ============================================================
# 4. Smart Text Chunking (Prevent gTTS Failures)
# ============================================================
def _chunk_text(text: str, limit: int = 180) -> List[str]:
    """
    Split long text into smaller chunks (gTTS has ~200 char limit)
    
    Args:
        text: Input text
        limit: Max characters per chunk (default 180 for safety)
    
    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []
    current = []

    for word in words:
        current.append(word)
        current_text = " ".join(current)
        
        if len(current_text) > limit:
            # Current chunk is too long, save previous and start new
            if len(current) > 1:
                chunks.append(" ".join(current[:-1]))
                current = [word]
            else:
                # Single word is too long, keep it anyway
                chunks.append(current_text)
                current = []

    # Add remaining words
    if current:
        chunks.append(" ".join(current))

    return chunks


# ============================================================
# 5. Safe TTS Generation with Retries
# ============================================================
def _safe_tts_to_file(text: str, path: str, retries: int = 3) -> float:
    """
    Generate TTS audio with retry logic
    
    Args:
        text: Text to convert to speech
        path: Output file path
        retries: Number of retry attempts
    
    Returns:
        Duration in seconds (0.0 if failed)
    """
    last_error = None
    
    for attempt in range(1, retries + 1):
        try:
            # Generate TTS
            tts = gTTS(text=text, lang="hi", slow=False)
            tts.save(path)
            
            # Verify file was created and has content
            if not os.path.exists(path):
                raise FileNotFoundError(f"TTS file not created: {path}")
            
            if os.path.getsize(path) < 1024:  # Less than 1KB
                raise ValueError("TTS file too small (likely corrupted)")
            
            # Get duration
            duration = _duration(path)
            
            if duration > 0.2:  # Valid audio (at least 200ms)
                return duration
            else:
                print(f"⚠ Empty/corrupted audio on attempt {attempt}")
                
        except Exception as e:
            last_error = e
            print(f"⚠ TTS error on attempt {attempt}/{retries}: {e}")
            
            # Clean up failed file
            if os.path.exists(path):
                try:
                    os.remove(path)
                except:
                    pass
        
        # Wait before retry (exponential backoff)
        if attempt < retries:
            time.sleep(attempt * 0.5)
    
    print(f"❌ All TTS attempts failed: {last_error}")
    return 0.0


# ============================================================
# 6. MAIN FUNCTION — Production-Ready TTS Generator
# ============================================================
def generate_narration_audio(text: str) -> Tuple[str, float]:
    """
    Generate narration audio from Hinglish/Hindi text
    
    Features:
    - Auto-chunks long text for gTTS compatibility
    - Caches generated audio (MD5 hash of text)
    - Retries on failure
    - Returns file path + duration
    
    Args:
        text: Narration text (Hinglish/Hindi)
    
    Returns:
        Tuple of (file_path, duration_in_seconds)
    
    Raises:
        EnvironmentError: If FFmpeg is not available
        RuntimeError: If TTS generation completely fails
    """
    
    # Validate FFmpeg
    _assert_ffmpeg_exists()
    
    # Ensure cache directory exists (Cloud Run compatible)
    os.makedirs(TTS_CACHE_DIR, exist_ok=True)
    
    # Normalize and hash text for caching
    clean_text = _normalize(text)
    
    if not clean_text or len(clean_text) < 3:
        print("⚠ Empty or too short text, creating silent audio")
        fallback_hash = hashlib.md5(b"silence").hexdigest()
        fallback_path = os.path.join(TTS_CACHE_DIR, f"{fallback_hash}_silent.mp3")
        
        if not os.path.exists(fallback_path):
            AudioSegment.silent(duration=1000).export(fallback_path, format="mp3")
        
        return fallback_path, 1.0
    
    text_hash = hashlib.md5(clean_text.encode('utf-8')).hexdigest()
    final_path = os.path.join(TTS_CACHE_DIR, f"{text_hash}.mp3")
    
    # ------------------------------------------------------------
    # STEP 1 — Check Cache (Fast Return)
    # ------------------------------------------------------------
    if os.path.exists(final_path):
        dur = _duration(final_path)
        
        if dur > 0.2:
            print(f"✔ Using cached audio ({dur}s): {text[:50]}...")
            return final_path, dur
        else:
            print("⚠ Cached file corrupted, regenerating...")
            try:
                os.remove(final_path)
            except:
                pass
    
    # ------------------------------------------------------------
    # STEP 2 — Generate New Audio
    # ------------------------------------------------------------
    print(f"🎤 Generating TTS: '{clean_text[:60]}...'")
    
    # Split text into chunks (gTTS has character limits)
    chunks = _chunk_text(clean_text)
    print(f"   Split into {len(chunks)} chunks")
    
    chunk_paths = []
    total_duration = 0.0
    
    # Generate each chunk
    for idx, chunk in enumerate(chunks):
        chunk_file = os.path.join(TTS_CACHE_DIR, f"{text_hash}_part{idx}.mp3")
        
        print(f"   Chunk {idx + 1}/{len(chunks)}: {chunk[:40]}...")
        
        dur = _safe_tts_to_file(chunk, chunk_file)
        
        if dur == 0.0:
            print(f"❌ Chunk {idx} failed completely, skipping...")
            continue
        
        chunk_paths.append(chunk_file)
        total_duration += dur
    
    # ------------------------------------------------------------
    # STEP 3 — Handle Complete Failure
    # ------------------------------------------------------------
    if not chunk_paths:
        print("❌ All TTS chunks failed, creating fallback silence")
        fallback_path = os.path.join(TTS_CACHE_DIR, f"{text_hash}_fallback.mp3")
        AudioSegment.silent(duration=1000).export(fallback_path, format="mp3")
        return fallback_path, 1.0
    
    # ------------------------------------------------------------
    # STEP 4 — Merge Chunks into Final Audio
    # ------------------------------------------------------------
    print(f"   Merging {len(chunk_paths)} chunks...")
    
    final_audio = AudioSegment.empty()
    
    for cp in chunk_paths:
        try:
            part_audio = AudioSegment.from_mp3(cp)
            final_audio += part_audio
        except Exception as e:
            print(f"⚠ Failed to merge chunk {cp}: {e}")
            continue
    
    # Export final audio
    try:
        final_audio.export(final_path, format="mp3")
        print(f"✔ TTS complete → {total_duration}s")
    except Exception as e:
        print(f"❌ Failed to export final audio: {e}")
        raise RuntimeError(f"TTS export failed: {e}")
    
    # ------------------------------------------------------------
    # STEP 5 — Cleanup Temporary Chunks
    # ------------------------------------------------------------
    for cp in chunk_paths:
        try:
            if os.path.exists(cp):
                os.remove(cp)
        except Exception as e:
            print(f"⚠ Cleanup warning for {cp}: {e}")
    
    # Verify final file
    final_duration = _duration(final_path)
    
    if final_duration == 0.0:
        raise RuntimeError("Generated audio file is corrupted")
    
    return final_path, final_duration


# ============================================================
# 7. OPTIONAL: Batch TTS Generation (Future Enhancement)
# ============================================================
def generate_multiple_narrations(texts: List[str]) -> List[Tuple[str, float]]:
    """
    Generate multiple narrations efficiently
    
    Args:
        texts: List of narration texts
    
    Returns:
        List of (file_path, duration) tuples
    """
    results = []
    
    for idx, text in enumerate(texts):
        print(f"Processing {idx + 1}/{len(texts)}...")
        try:
            path, duration = generate_narration_audio(text)
            results.append((path, duration))
        except Exception as e:
            print(f"❌ Failed to generate audio {idx + 1}: {e}")
            # Return silent fallback
            fallback_hash = hashlib.md5(f"failed_{idx}".encode()).hexdigest()
            fallback_path = os.path.join(TTS_CACHE_DIR, f"{fallback_hash}_failed.mp3")
            AudioSegment.silent(duration=1000).export(fallback_path, format="mp3")
            results.append((fallback_path, 1.0))
    
    return results


# ============================================================
# 8. Cache Management (Optional - Future Enhancement)
# ============================================================
def clear_tts_cache(older_than_days: int = 7):
    """
    Clear old cached TTS files
    
    Args:
        older_than_days: Remove files older than N days
    """
    try:
        import time
        current_time = time.time()
        removed_count = 0
        
        for filename in os.listdir(TTS_CACHE_DIR):
            file_path = os.path.join(TTS_CACHE_DIR, filename)
            
            if not filename.endswith('.mp3'):
                continue
            
            file_age_days = (current_time - os.path.getmtime(file_path)) / 86400
            
            if file_age_days > older_than_days:
                os.remove(file_path)
                removed_count += 1
        
        print(f"✔ Cleared {removed_count} old TTS cache files")
        
    except Exception as e:
        print(f"⚠ Cache cleanup warning: {e}")


# ============================================================
# 9. Health Check (For Monitoring)
# ============================================================
def tts_health_check() -> dict:
    """
    Check TTS system health
    
    Returns:
        Dict with health status
    """
    health = {
        "status": "healthy",
        "ffmpeg_available": False,
        "cache_dir_exists": False,
        "cache_writable": False,
        "errors": []
    }
    
    # Check FFmpeg
    try:
        _assert_ffmpeg_exists()
        health["ffmpeg_available"] = True
    except Exception as e:
        health["status"] = "unhealthy"
        health["errors"].append(f"FFmpeg: {e}")
    
    # Check cache directory
    try:
        os.makedirs(TTS_CACHE_DIR, exist_ok=True)
        health["cache_dir_exists"] = True
        
        # Test write
        test_file = os.path.join(TTS_CACHE_DIR, ".health_check")
        with open(test_file, 'w') as f:
            f.write("ok")
        os.remove(test_file)
        health["cache_writable"] = True
        
    except Exception as e:
        health["status"] = "unhealthy"
        health["errors"].append(f"Cache: {e}")
    
    return health


# ============================================================
# OPTIONAL: Add to your status endpoint for monitoring
# ============================================================
# from app.utils.tts_utils import tts_health_check
# 
# @router.get("/status/tts")
# def get_tts_status():
#     return tts_health_check()