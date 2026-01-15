import os
import random
import asyncio
from fastapi import FastAPI, BackgroundTasks, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.gcp_worker import process_task_directly # We will create this helper next
from app.utils.supabase_utils import supabase_upload
from supabase import create_client

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def home():
    return {"status": "Manhwa AI Running on Hugging Face"}

@app.post("/api/v1/generate_audio_story")
async def start_generation(
    background_tasks: BackgroundTasks,
    manga_name: str = Form(...),
    manga_genre: str = Form(...),
    manga_pdf: UploadFile = File(...)
):
    try:
        # 1. Generate ID
        task_id = random.getrandbits(63)
        
        # 2. Upload PDF
        file_bytes = await manga_pdf.read()
        unique_filename = f"uploads/{str(task_id)}_{manga_name[:10].replace(' ', '_')}.pdf"
        pdf_url = supabase_upload(file_bytes, unique_filename, "application/pdf")

        # 3. Create DB Entry
        supabase.table("jobs").insert({
            "id": task_id,
            "status": "PROCESSING",
            "manga_name": manga_name,
            "pdf_url": pdf_url,
            "created_at": "now()"
        }).execute()

        # 4. Start Processing in Background (No Queue needed!)
        background_tasks.add_task(
            process_task_directly, 
            task_id, 
            manga_name, 
            manga_genre, 
            pdf_url
        )

        return {"task_id": str(task_id), "status": "PROCESSING"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/status/{task_id}")
def get_status(task_id: str):
    res = supabase.table("jobs").select("*").eq("id", task_id).execute()
    if not res.data: raise HTTPException(404, "Task not found")
    rec = res.data[0]
    return {
        "task_id": str(rec["id"]),
        "state": rec["status"],
        "result": rec.get("result_url")
    }