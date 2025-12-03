import os
import sys
from supabase import create_client

# 1. Load Secrets
URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.environ.get("SUPABASE_BUCKET_NAME", "Manhwa_ai")

if not URL or not KEY:
    print("❌ Error: Missing Supabase Credentials")
    sys.exit(1)

# 2. Connect
supabase = create_client(URL, KEY)

def get_all_file_paths(path=""):
    """
    Recursively finds all files inside folders.
    """
    paths_to_delete = []
    
    try:
        # List items in the current path
        items = supabase.storage.from_(BUCKET).list(path)
    except Exception as e:
        print(f"⚠ Could not list path '{path}': {e}")
        return []

    for item in items:
        name = item.get("name")
        if not name or name == ".emptyFolderPlaceholder":
            continue

        # Construct the full path (e.g., "folder/image.jpg")
        full_path = f"{path}/{name}" if path else name

        # Logic: If it has an 'id', it's a file. If 'id' is None, it's a folder.
        if item.get("id"):
            # It's a file, add to delete list
            paths_to_delete.append(full_path)
        else:
            # It's a folder, recurse deeper
            print(f"📂 Found folder: {full_path}, looking inside...")
            paths_to_delete.extend(get_all_file_paths(full_path))
            
    return paths_to_delete

def cleanup_bucket():
    print(f"🧹 Starting Deep Cleanup for bucket: {BUCKET}...")
    
    try:
        # 1. Get ALL file paths recursively
        files_to_delete = get_all_file_paths("")
        
        if not files_to_delete:
            print("✔ Bucket is already empty.")
            return

        print(f"🔥 Found {len(files_to_delete)} files to delete.")
        
        # 2. Delete in batches (Supabase limit is usually 100-1000 per call)
        batch_size = 100
        for i in range(0, len(files_to_delete), batch_size):
            batch = files_to_delete[i : i + batch_size]
            print(f"   - Deleting batch {i+1} to {i+len(batch)}...")
            supabase.storage.from_(BUCKET).remove(batch)

        print("✔ Cleanup complete! All folders should be gone now.")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    cleanup_bucket()