import os
import logging
from datetime import datetime
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.video_info import video_info_bp
from routes.download import download_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Tạo thư mục downloads nếu chưa có
    os.makedirs(app.config['DOWNLOAD_DIR'], exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    # Cấu hình logging
    logging.basicConfig(
        filename=app.config['LOG_FILE'],
        level=app.config['LOG_LEVEL'],
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    # CORS
    CORS(app, origins=app.config['ALLOWED_ORIGINS'])

    # Đăng ký route
    app.register_blueprint(video_info_bp)
    app.register_blueprint(download_bp)

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {"status": "ok", "timestamp": datetime.now().isoformat()}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=app.config['DEBUG'])