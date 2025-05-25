import yt_dlp
import os
import logging
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
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logging.info(f"yt-dlp options: {ydl_opts}")
            result = ydl.extract_info(url, download=True)
            final_file_info = result.get('requested_downloads', [{}])[0]
            downloaded_file_path = final_file_info.get('filepath')

            if not downloaded_file_path or not os.path.exists(downloaded_file_path):
                logging.warning(f"Filepath not found in yt-dlp result, attempting fallback construction for {result.get('title')}")
                original_title = result.get('title', 'downloaded_audio')
                expected_filename_after_pp = f"{original_title}.mp3"
                downloaded_file_path = os.path.join(output_dir, expected_filename_after_pp)
            
            logging.info(f"Downloaded file path (intermediate): {downloaded_file_path}")

            if os.path.exists(downloaded_file_path):
                base_filename = os.path.basename(downloaded_file_path)
                unique_filename_base = get_unique_filename(base_filename, output_dir)
                final_path = os.path.join(output_dir, unique_filename_base)
                
                logging.info(f"Original downloaded path: {downloaded_file_path}, Unique final path: {final_path}")

                if downloaded_file_path != final_path:
                    os.rename(downloaded_file_path, final_path)
                return final_path
            else:
                logging.error(f"CRITICAL: MP3 file not found at expected path after yt-dlp processing: {downloaded_file_path}")
                raise RuntimeError(f"MP3 file not found after processing: {downloaded_file_path}")

    except Exception as e:
        logging.error(f"yt-dlp/ffmpeg download_video exception for URL {url}: {str(e)}", exc_info=True)
        raise RuntimeError(f"Download failed: {str(e)}")