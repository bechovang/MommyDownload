from flask import Blueprint, request, jsonify
from utils.youtube_handler import extract_video_info, validate_youtube_url

video_info_bp = Blueprint('video_info', __name__)

ERROR_CODES = {
    'INVALID_URL': 'URL không hợp lệ hoặc không phải YouTube',
    'VIDEO_NOT_FOUND': 'Video không tồn tại hoặc bị xóa',
    'PRIVATE_VIDEO': 'Video bị ẩn hoặc riêng tư',
    'SERVER_ERROR': 'Lỗi server nội bộ'
}

@video_info_bp.route('/api/video-info', methods=['POST'])
def get_video_info():
    data = request.get_json()
    url = data.get('url')

    if not url or not validate_youtube_url(url):
        return jsonify({
            "success": False,
            "error": ERROR_CODES['INVALID_URL'],
            "code": "INVALID_URL"
        }), 400

    try:
        info = extract_video_info(url)
        return jsonify({
            "success": True,
            "data": info
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": ERROR_CODES['SERVER_ERROR'],
            "code": "SERVER_ERROR"
        }), 500