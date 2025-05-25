import os
import uuid
import shutil
from datetime import datetime, timedelta
from config import Config
import time
import logging

def get_unique_filename(filename, directory="."):
    """Generates a unique filename by appending a counter if the file already exists in the specified directory."""
    base, ext = os.path.splitext(filename)
    counter = 1
    # Start with the original filename
    unique_filename_to_check = filename 
    # Construct the full path to check for existence within the given directory
    current_path_to_check = os.path.join(directory, unique_filename_to_check)

    while os.path.exists(current_path_to_check):
        unique_filename_to_check = f"{base} ({counter}){ext}"
        current_path_to_check = os.path.join(directory, unique_filename_to_check)
        counter += 1
    # Return only the filename (base + counter + ext), not the full path
    return unique_filename_to_check

def cleanup_old_files(directory, max_age_seconds):
    """Removes files older than max_age_seconds from the specified directory."""
    now = time.time() # Make sure to import time if not already
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            try:
                if os.path.getmtime(file_path) < now - max_age_seconds:
                    os.remove(file_path)
                    logging.info(f"Cleaned up old file: {file_path}")
            except Exception as e:
                logging.error(f"Error cleaning up file {file_path}: {e}")

def is_valid_file_size(filepath, max_mb):
    return os.path.getsize(filepath) <= max_mb * 1024 * 1024