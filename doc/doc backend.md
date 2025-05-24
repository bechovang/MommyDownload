# Planning Chi Tiết Backend - YouTube Downloader API

## 📋 Tổng Quan Dự Án
**Mục tiêu**: Xây dựng REST API Flask để xử lý tải video YouTube, tích hợp với frontend v0.dev có sẵn

**Tech Stack**:
- **Framework**: Flask (Python)
- **Core Library**: yt-dlp
- **Dependencies**: flask-cors, python-dotenv, requests
- **Storage**: File system (thư mục downloads)

---

## 🗂️ Cấu Trúc Thư Mục

```
youtube-downloader-backend/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── utils/
│   ├── __init__.py
│   ├── youtube_handler.py # yt-dlp wrapper functions
│   └── file_manager.py    # File operations utilities
├── routes/
│   ├── __init__.py
│   ├── video_info.py      # Video info endpoint
│   └── download.py        # Download endpoint
├── downloads/             # Temporary storage (auto-created)
├── logs/                  # Application logs
├── .env                   # Environment variables
├── .gitignore
└── README.md
```

---

## ⏱️ Timeline Chi Tiết (18-22 giờ)

### **Giai đoạn 1: Setup Environment (2-3 giờ)**

#### **Bước 1.1: Khởi tạo dự án (30 phút)**
```bash
# Tạo thư mục dự án
mkdir youtube-downloader-backend
cd youtube-downloader-backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Tạo cấu trúc thư mục
mkdir utils routes downloads logs
touch app.py config.py requirements.txt .env .gitignore
```

#### **Bước 1.2: Cài đặt dependencies (30 phút)**
```bash
# requirements.txt
pip install flask
pip install yt-dlp
pip install flask-cors
pip install python-dotenv
pip install gunicorn  # For production

# Generate requirements.txt
pip freeze > requirements.txt
```

#### **Bước 1.3: Cấu hình cơ bản (1-2 giờ)**
- Tạo file `.env` với các biến môi trường
- Cấu hình `.gitignore`
- Setup Flask app cơ bản
- Test server chạy thành công

### **Giai đoạn 2: Core Development (10-12 giờ)**

#### **Bước 2.1: Xây dựng YouTube Handler (3-4 giờ)**
**File**: `utils/youtube_handler.py`

**Chức năng cần implement**:
- `extract_video_info(url)`: Lấy metadata video
- `download_video(url, quality, output_path)`: Tải video
- `validate_youtube_url(url)`: Kiểm tra URL hợp lệ
- `get_available_formats(url)`: Lấy danh sách chất lượng có sẵn
- `cleanup_old_files(directory, max_age_hours)`: Dọn dẹp file cũ

**Chi tiết công việc**:
- Nghiên cứu yt-dlp API và options (1 giờ)
- Implement các function cơ bản (2 giờ)
- Error handling và logging (1 giờ)

#### **Bước 2.2: File Manager Utilities (1.5-2 giờ)**
**File**: `utils/file_manager.py`

**Chức năng**:
- Tạo unique filename để tránh conflict
- Quản lý temporary files
- File size validation
- Cleanup functions

#### **Bước 2.3: API Routes Development (4-5 giờ)**

##### **Route 1: `/api/video-info` (2-2.5 giờ)**
**File**: `routes/video_info.py`

**Specifications**:
```python
# Request
POST /api/video-info
Content-Type: application/json
{
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}

# Response Success (200)
{
    "success": true,
    "data": {
        "title": "Video Title",
        "duration": 180,
        "thumbnail": "https://...",
        "uploader": "Channel Name",
        "view_count": 1000000,
        "upload_date": "2024-01-01",
        "formats": [
            {
                "format_id": "22",
                "ext": "mp4",
                "quality": "720p",
                "filesize": 50000000
            }
        ]
    }
}

# Response Error (400/500)
{
    "success": false,
    "error": "Invalid YouTube URL",
    "code": "INVALID_URL"
}
```

##### **Route 2: `/api/download` (2-2.5 giờ)**
**File**: `routes/download.py`

**Specifications**:
```python
# Request
POST /api/download
Content-Type: application/json
{
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "format_id": "22",  # Optional
    "quality": "720p"   # Optional
}

# Response: File stream với proper headers
Content-Type: video/mp4
Content-Disposition: attachment; filename="video_title.mp4"
```

#### **Bước 2.4: Main Flask App (1-1.5 giờ)**
**File**: `app.py`

**Setup**:
- Flask app initialization
- CORS configuration
- Route registration
- Error handlers
- Health check endpoint

### **Giai đoạn 3: Testing & Debugging (4-5 giờ)**

#### **Bước 3.1: Unit Testing (2-2.5 giờ)**
- Test YouTube URL validation
- Test video info extraction
- Test error handling scenarios
- Test file cleanup functions

#### **Bước 3.2: Integration Testing (1.5-2 giờ)**
- Test API endpoints với Postman/curl
- Test CORS headers
- Test file download process
- Performance testing với video lớn

#### **Bước 3.3: Error Scenarios Testing (0.5-1 giờ)**
- Invalid URLs
- Private/restricted videos
- Network timeouts
- Disk space issues

### **Giai đoạn 4: Optimization & Security (2-3 giờ)**

#### **Bước 4.1: Performance Optimization (1-1.5 giờ)**
- Async processing cho video lớn
- Request timeout handling
- Memory usage optimization
- Concurrent download limiting

#### **Bước 4.2: Security Measures (1-1.5 giờ)**
- Input validation và sanitization
- Rate limiting
- File size limits
- Malicious URL protection

---

## 🔧 Implementation Details

### **Core Dependencies & Versions**
```txt
Flask==2.3.3
yt-dlp>=2023.10.13
flask-cors==4.0.0
python-dotenv==1.0.0
gunicorn==21.2.0
```

### **Environment Variables (.env)**
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# Download Configuration
DOWNLOAD_DIR=./downloads
MAX_FILE_SIZE_MB=500
CLEANUP_INTERVAL_HOURS=24
MAX_CONCURRENT_DOWNLOADS=3

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

### **Key yt-dlp Options**
```python
ydl_opts = {
    'format': 'best[height<=720]',  # Default quality
    'outtmpl': '%(title)s.%(ext)s',
    'noplaylist': True,
    'extractaudio': False,
    'audioformat': 'mp3',
    'embed_subs': False,
    'writesubtitles': False,
    'writeautomaticsub': False,
}
```

---

## 🚀 API Endpoints Specification

### **1. Health Check**
```
GET /api/health
Response: {"status": "ok", "timestamp": "2024-01-01T00:00:00Z"}
```

### **2. Video Information**
```
POST /api/video-info
Headers: Content-Type: application/json
Body: {"url": "youtube_url"}
```

### **3. Download Video**
```
POST /api/download  
Headers: Content-Type: application/json
Body: {
    "url": "youtube_url",
    "format_id": "22" (optional),
    "quality": "720p" (optional)
}
```

### **4. Available Formats**
```
POST /api/formats
Headers: Content-Type: application/json  
Body: {"url": "youtube_url"}
Response: {"formats": [...]}
```

---

## ⚠️ Error Handling Strategy

### **Error Codes & Messages**
```python
ERROR_CODES = {
    'INVALID_URL': 'URL không hợp lệ hoặc không phải YouTube',
    'VIDEO_NOT_FOUND': 'Video không tồn tại hoặc bị xóa',
    'PRIVATE_VIDEO': 'Video bị ẩn hoặc riêng tư',
    'DOWNLOAD_FAILED': 'Lỗi khi tải video',
    'FILE_TOO_LARGE': 'File quá lớn (>500MB)',
    'SERVER_ERROR': 'Lỗi server nội bộ',
    'RATE_LIMITED': 'Quá nhiều request, vui lòng thử lại sau'
}
```

### **HTTP Status Codes**
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Video not found
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## 🔄 Daily Tasks Breakdown

### **Ngày 1 (4-5 giờ): Foundation**
- [ ] Setup environment và dependencies
- [ ] Tạo cấu trúc thư mục
- [ ] Basic Flask app với health check
- [ ] CORS configuration
- [ ] Test server running

### **Ngày 2 (5-6 giờ): Core Logic**
- [ ] Implement YouTube handler utilities
- [ ] Video info extraction
- [ ] URL validation
- [ ] Basic error handling

### **Ngày 3 (4-5 giờ): API Endpoints**
- [ ] `/api/video-info` endpoint
- [ ] `/api/download` endpoint  
- [ ] Response formatting
- [ ] File streaming logic

### **Ngày 4 (3-4 giờ): Testing & Polish**
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security measures

### **Ngày 5 (2-3 giờ): Integration**
- [ ] Test với frontend v0.dev
- [ ] CORS fine-tuning
- [ ] Final debugging
- [ ] Documentation

---

## 🎯 Success Criteria

### **Functional Requirements**
- [ ] API trả về thông tin video chính xác
- [ ] Tải video thành công với quality options
- [ ] Error handling robust
- [ ] CORS working với frontend
- [ ] File cleanup tự động

### **Performance Requirements**
- [ ] Response time < 5s cho video info
- [ ] Support video up to 500MB
- [ ] Concurrent requests handling
- [ ] Memory usage < 1GB

### **Security Requirements**
- [ ] Input validation
- [ ] Rate limiting
- [ ] No arbitrary file access
- [ ] Proper error messages (no sensitive info)

---

## 🔗 Integration với Frontend v0.dev

### **Expected Frontend API Calls**
```javascript
// Get video info
const response = await fetch('http://localhost:5000/api/video-info', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({url: youtubeUrl})
});

// Download video
const downloadResponse = await fetch('http://localhost:5000/api/download', {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({url: youtubeUrl, quality: selectedQuality})
});
```

### **CORS Headers cần thiết**
```python
CORS(app, origins=[
    "http://localhost:3000",  # Next.js dev
    "https://your-v0-domain.vercel.app"  # v0.dev deployment
])
```

---

## 📝 Next Steps After Completion

1. **Deployment Options**:
   - Railway/Render cho easy deployment
   - DigitalOcean/AWS cho full control
   - Docker containerization

2. **Monitoring & Logging**:
   - Request logging
   - Error tracking
   - Performance metrics

3. **Advanced Features** (Phase 2):
   - Playlist support
   - Audio-only downloads
   - Batch processing
   - User authentication

Bạn muốn tôi detail thêm phần nào không? Hoặc cần code examples cụ thể cho bước nào?