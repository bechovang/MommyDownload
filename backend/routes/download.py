from flask import Blueprint, request, send_file, jsonify
import os
from utils.youtube_handler import download_video
from config import Config

download_bp = Blueprint('download', __name__)

ERROR_CODES = {
    'INVALID_URL': 'URL không hợp lệ hoặc không phải YouTube',
    'DOWNLOAD_FAILED': 'Lỗi khi tải video',
    'FILE_TOO_LARGE': 'File quá lớn (>500MB)',
    'SERVER_ERROR': 'Lỗi server nội bộ'
}

@download_bp.route('/api/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url')
    format_id = data.get('format_id')
    quality = data.get('quality')

    if not url:
        return jsonify({
            "success": False,
            "error": ERROR_CODES['INVALID_URL'],
            "code": "INVALID_URL"
        }), 400

    try:
        file_path = download_video(url, format_id or quality)
        if not os.path.exists(file_path):
            return jsonify({
                "success": False,
                "error": ERROR_CODES['DOWNLOAD_FAILED'],
                "code": "DOWNLOAD_FAILED"
            }), 500

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": ERROR_CODES['SERVER_ERROR'],
            "code": "SERVER_ERROR"
        }), 500