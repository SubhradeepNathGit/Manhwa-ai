import os
import platform
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# -----------------------------
# 1. STORAGE PATH SETUP (The Universal Fix ⚡)
# -----------------------------
# Detect OS: 'Windows' (Local) vs 'Linux' (Hugging Face / AWS / GCP)
SYSTEM_OS = platform.system()

if SYSTEM_OS == "Windows":
    # 💻 LOCAL WINDOWS: Use the project folder so you can see the files
    BASE_DIR = os.getcwd()
    print(f"💻 Running Locally (Windows): Using {BASE_DIR} for storage")
else:
    # ☁️ CLOUD (Linux): Always use /tmp (Safe for HF, AWS Lambda, GCP)
    BASE_DIR = "/tmp"
    print(f"🚀 Running on Server (Linux): Using /tmp for storage")

# Define paths
TTS_CACHE_DIR = os.path.join(BASE_DIR, "tts_cache")
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# Create directories immediately
os.makedirs(TTS_CACHE_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# -----------------------------
# 2. GOOGLE/GROQ API KEY
# -----------------------------
GOOGLE_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("⚠️ WARNING: GOOGLE_API_KEY/GROQ_API_KEY is missing.")

# -----------------------------
# 3. SUPABASE CONFIG
# -----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "manhwa-content")

if not SUPABASE_URL or not SUPABASE_KEY:
    # Don't crash immediately on import, but warn loudly
    print("❌ CRITICAL: Missing SUPABASE_URL or SUPABASE_KEY in env vars.")