import os
import uuid
import shutil
from datetime import datetime, timedelta
from config import Config

def get_unique_filename(basename):
    ext = os.path.splitext(basename)[1]
    filename = f"{uuid.uuid4()}_{os.path.splitext(basename)[0]}{ext}"
    return filename

def cleanup_old_files(directory, max_age_hours):
    now = datetime.now()
    for f in os.listdir(directory):
        path = os.path.join(directory, f)
        if os.path.isfile(path):
            age = now - datetime.fromtimestamp(os.path.getmtime(path))
            if age > timedelta(hours=max_age_hours):
                os.remove(path)

def is_valid_file_size(filepath, max_mb):
    return os.path.getsize(filepath) <= max_mb * 1024 * 1024