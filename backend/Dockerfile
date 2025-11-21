# ============================
# 1. Base Image
# ============================
FROM python:3.11-slim

# =============================
# 2. Install system dependencies (SIMPLIFIED - No FFmpeg!)
# =============================
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    tesseract-ocr \
    poppler-utils \
    libsm6 \
    libxext6 \
    libgl1 \
    build-essential \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*



# ============================
# 3. Set work directory
# ============================
WORKDIR /app

# ============================
# 4. Copy requirements first (better caching)
# ============================
COPY requirements.txt .

# ============================
# 5. Install Python dependencies
# ============================
RUN pip install --no-cache-dir -r requirements.txt

# ============================
# 6. Copy application code
# ============================
COPY app ./app

# ============================
# 7. Expose default port (Cloud Run uses $PORT)
# ============================
EXPOSE 8080

# ============================
# 8. Start FastAPI with Uvicorn
# ============================
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]