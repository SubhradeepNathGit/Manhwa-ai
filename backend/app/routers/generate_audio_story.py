import uuid
import os
from fastapi import APIRouter, Form, UploadFile, File
from celery.result import AsyncResult
from ..celery_worker import celery_app, process_manga_task
from ..utils.supabase_utils import supabase_upload 

router = APIRouter()

@router.post("/generate_audio_story")
async def start_generation(
    manga_name: str = Form(...),
    manga_genre: str = Form(...),
    manga_pdf: UploadFile = File(...)
):
    # 1. Read file bytes
    file_bytes = await manga_pdf.read()
    
    # 2. Upload PDF to Supabase
    unique_filename = f"uploads/{uuid.uuid4()}.pdf"
    
    # ⚡ FIX: Removed 'await' because supabase_upload is synchronous
    pdf_url = supabase_upload(file_bytes, unique_filename, "application/pdf")

    # 3. Send the URL to the worker
    task = process_manga_task.delay(manga_name, manga_genre, pdf_url)

    return {"task_id": task.id, "message": "Processing started"}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    response = {"task_id": task_id, "state": task_result.state}

    if task_result.state == 'PROCESSING':
        response.update(task_result.info or {})
    elif task_result.state == 'SUCCESS':
        response["result"] = task_result.result
        response["progress"] = 100
    elif task_result.state == 'FAILURE':
        response["error"] = str(task_result.info)
        
    return response