# backend/scripts/cleanup_supabase.py

import os
import sys
from supabase import create_client

# 1. Load Secrets directly from Environment (In GitHub Actions, these are injected)
URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Must use SERVICE ROLE key to delete
BUCKET = os.environ.get("SUPABASE_BUCKET_NAME", "Manhwa_ai")

if not URL or not KEY:
    print("❌ Error: Missing Supabase Credentials")
    sys.exit(1)

# 2. Connect to Supabase
supabase = create_client(URL, KEY)

def cleanup_bucket():
    print(f"🧹 Starting cleanup for bucket: {BUCKET}...")
    
    try:
        # 3. List all files in the bucket
        # Supabase 'list' returns a list of objects. We pass None to list root.
        # We might need to handle folders recursively if your structure is complex, 
        # but usually listing and deleting paths works.
        files = supabase.storage.from_(BUCKET).list()
        
        if not files:
            print("✔ Bucket is already empty.")
            return

        print(f"found {len(files)} items (folders/files).")

        # 4. Extract paths
        files_to_delete = []
        for f in files:
            name = f.get('name')
            if name and name != ".emptyFolderPlaceholder": # Don't delete placeholder if you use one
                files_to_delete.append(name)

        if not files_to_delete:
            print("✔ No files to delete.")
            return

        # 5. Delete them
        print(f"🔥 Deleting: {files_to_delete}")
        res = supabase.storage.from_(BUCKET).remove(files_to_delete)
        
        print("✔ Cleanup complete!")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    cleanup_bucket()