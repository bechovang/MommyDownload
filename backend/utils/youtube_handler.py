import yt_dlp
import os
from datetime import timedelta
from utils.file_manager import get_unique_filename, cleanup_old_files
from config import Config

def extract_video_info(url):
    ydl_opts = {
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title'),
                "duration": info.get('duration'),
                "thumbnail": info.get('thumbnail'),
                "uploader": info.get('uploader'),
                "view_count": info.get('view_count'),
                "upload_date": info.get('upload_date'),
                "formats": [
                    {
                        "format_id": f.get('format_id'),
                        "ext": f.get('ext'),
                        "quality": f"{f.get('width')}x{f.get('height')}" if f.get('width') and f.get('height') else 'audio',
                        "filesize": f.get('filesize') or 0
                    } for f in info.get('formats', [])
                ]
            }
    except Exception as e:
        raise ValueError(f"Invalid YouTube URL: {str(e)}")

def validate_youtube_url(url):
    try:
        extract_video_info(url)
        return True
    except:
        return False

def download_video(url, format_id=None, output_dir=None):
    output_dir = output_dir or Config.DOWNLOAD_DIR
    ydl_opts = {
        'format': format_id if format_id else 'best[height<=720]',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'quiet': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=True)
            original_title = result.get('title')
            ext = result.get('ext')
            original_path = os.path.join(output_dir, f"{original_title}.{ext}")
            unique_name = get_unique_filename(f"{original_title}.{ext}")
            final_path = os.path.join(output_dir, unique_name)

            os.rename(original_path, final_path)
            return final_path
    except Exception as e:
        raise RuntimeError(f"Download failed: {str(e)}")