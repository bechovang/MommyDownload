Dưới đây là bản **dịch tiếng Việt** của nội dung trong file bạn đã tải lên:

---

## Triển khai dự án với Cloud Run và Cloud Tasks để xử lý bất đồng bộ

Việc triển khai dự án của bạn với **Cloud Run** và **Cloud Tasks** để xử lý các tác vụ lâu dài như `ffmpeg` là một lựa chọn tuyệt vời, giúp bạn không bị chặn API hay hết thời gian chờ (timeout), đồng thời làm cho ứng dụng của bạn có khả năng mở rộng và phản hồi tốt hơn.

### I. Yêu cầu & Cài đặt ban đầu (Tóm tắt)

- **Tài khoản Google Cloud & Dự án:** Đảm bảo bạn đã tạo tài khoản GCP và dự án.
- **gcloud CLI:** Đã cài đặt và cấu hình (`gcloud init`, `gcloud auth login`, `gcloud config set project YOUR_PROJECT_ID`)
- **Docker:** Đã cài đặt trên máy
- **Bật APIs cần thiết:**
  - Cloud Build API
  - Artifact Registry API
  - Cloud Run API
  - Cloud Tasks API
  - Cloud Storage API (để dùng GCS)

---

### II. Tổng quan kiến trúc backend

Chúng ta sẽ có **2 service Cloud Run** phục vụ backend:

1. **`mommy-api-service` (Xử lý yêu cầu từ frontend):**
   - Nhận yêu cầu từ frontend (ví dụ: `/api/video-info`, `/api/initiate-download`)
   - Với chức năng tải xuống, nó sẽ tạo một task trong Cloud Tasks và trả lời ngay lập tức cho frontend
   - Sẽ có thêm một endpoint để cung cấp đường dẫn tải xuống (signed URL từ GCS) khi xử lý xong

2. **`mommy-task-processor-service` (Xử lý tác vụ):**
   - Được gọi bởi Cloud Tasks
   - Xử lý việc tải video từ YouTube, chuyển đổi bằng `ffmpeg`, và tải file MP3 lên Google Cloud Storage (GCS)

---

### III. Thiết lập Google Cloud Storage (GCS)

1. **Tạo một bucket GCS:** Bucket này sẽ lưu trữ các file MP3 được tạo ra:
   ```bash
   export GCS_BUCKET_NAME="mommydownload-mp3s-${PROJECT_ID}" # Tên bucket phải duy nhất toàn cầu
   gsutil mb -p ${PROJECT_ID} -l asia-southeast1 gs://${GCS_BUCKET_NAME}/ # Chọn region phù hợp
   ```

2. **Cấu hình CORS (nếu tải trực tiếp từ trình duyệt qua signed URL):**

   Tạo file `cors.json`:
   ```json
   [
     {
       "origin": ["YOUR_FRONTEND_CLOUD_RUN_URL", "http://localhost:3000"],
       "responseHeader": ["Content-Type", "Content-Disposition"],
       "method": ["GET"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

   Áp dụng vào bucket:
   ```bash
   gsutil cors set cors.json gs://${GCS_BUCKET_NAME}
   ```
   > Thay `YOUR_FRONTEND_CLOUD_RUN_URL` bằng URL thực tế sau khi deploy frontend

---

### IV. Backend Service 1: `mommy-api-service` (Xử lý yêu cầu)

#### 1. Cấu trúc thư mục (Backend)
Giả sử code backend nằm trong thư mục `backend_api_service`.

#### 2. Cập nhật `requirements.txt`
Thêm các thư viện cần thiết:
```
Flask
Flask-CORS
yt-dlp
google-cloud-tasks
google-cloud-storage
gunicorn
# ... các thư viện khác nếu cần
```

#### 3. Cập nhật Flask App (`app.py` hoặc tương tự)
- Khởi tạo client Cloud Tasks và Storage
- Cập nhật endpoint tải xuống để tạo task
- Thêm endpoint tạo signed URL để tải file từ GCS

> Phần code Python chi tiết đã có sẵn trong file gốc. Mục này chủ yếu tập trung vào logic tổng thể.

#### 4. Dockerfile cho `mommy-api-service`
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT 8080
ENV PYTHONUNBUFFERED TRUE
CMD exec gunicorn --bind :${PORT} --workers 1 --threads 8 --timeout 0 app:app
```

#### 5. Triển khai `mommy-api-service`
```bash
# Từ thư mục backend_api_service
export PROJECT_ID=$(gcloud config get-value project)
export REGION=asia-southeast1 # Ví dụ: us-central1
export API_SERVICE_NAME=mommy-api-service
export AR_REPO=mommydownload-repo # Kho Artifact Registry

# Build và đẩy image
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${API_SERVICE_NAME}:latest .

# Triển khai
gcloud run deploy ${API_SERVICE_NAME} \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${API_SERVICE_NAME}:latest \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --port=8080 \
    --set-env-vars GOOGLE_CLOUD_PROJECT=${PROJECT_ID},QUEUE_LOCATION=${REGION},QUEUE_ID=mommydownload-tasks,GCS_BUCKET_NAME=${GCS_BUCKET_NAME}
```

---

### V. Backend Service 2: `mommy-task-processor-service` (Xử lý tác vụ)

#### 1. Cấu trúc thư mục
Giả sử code nằm trong thư mục `backend_task_processor`.

#### 2. `requirements.txt`
```
Flask
Flask-CORS
yt-dlp
ffmpeg-python
google-cloud-storage
gunicorn
# ...
```

#### 3. Flask App (`processor_app.py` hoặc tương tự)

Endpoint chính nhận yêu cầu từ Cloud Tasks:
```python
@app.route('/process-task', methods=['POST']) # Đây là URL Cloud Tasks sẽ gọi
def process_task():
    task_payload = request.get_json()
    youtube_url = task_payload.get('youtube_url')
    gcs_output_filename = task_payload.get('output_filename')

    # Xử lý download + ffmpeg
    # Upload lên GCS
    return jsonify({"success": True}), 200
```

#### 4. Dockerfile cho `mommy-task-processor-service`
```dockerfile
FROM python:3.9-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT 8080
ENV PYTHONUNBUFFERED TRUE
CMD exec gunicorn --bind :${PORT} --workers 1 --threads 4 --timeout 900 processor_app:app
```

#### 5. Triển khai `mommy-task-processor-service`
```bash
# Từ thư mục backend_task_processor
export TASK_PROCESSOR_SERVICE_NAME=mommy-task-processor

# Build và đẩy image
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${TASK_PROCESSOR_SERVICE_NAME}:latest .

# Triển khai
gcloud run deploy ${TASK_PROCESSOR_SERVICE_NAME} \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${TASK_PROCESSOR_SERVICE_NAME}:latest \
    --platform=managed \
    --region=${REGION} \
    --no-allow-unauthenticated \
    --port=8080 \
    --set-env-vars GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GCS_BUCKET_NAME=${GCS_BUCKET_NAME}
```

---

### VI. Thiết lập Google Cloud Tasks

#### 1. Tạo hàng đợi (Queue):
```bash
gcloud tasks queues create mommydownload-tasks --location=${REGION}
```

#### 2. Phân quyền cho Cloud Tasks gọi service xử lý
```bash
gcloud run services add-iam-policy-binding ${TASK_PROCESSOR_SERVICE_NAME} \
  --member="serviceAccount:${CLOUD_TASKS_SA_EMAIL}" \
  --role="roles/run.invoker" \
  --platform=managed \
  --region=${REGION}
```

---

### VII. Triển khai Frontend (Next.js)

#### 1. Dockerfile cho frontend (giống hướng dẫn trước)

#### 2. Cập nhật mã frontend (`page.tsx`)
- Hàm `handleInitiateDownload()` sẽ gọi `/api/initiate-download`
- Sau đó sẽ poll đến `/api/get-download-link` để lấy đường dẫn tải về từ GCS
- Khi có link, sẽ kích hoạt tải xuống bằng thẻ `<a>` ẩn

#### 3. Triển khai frontend
```bash
gcloud run deploy mommy-frontend-service \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/mommy-frontend-service:latest \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --port=3000 \
    --set-env-vars NEXT_PUBLIC_API_URL=${API_SERVICE_URL}
```

---

### VIII. Kiểm tra và gỡ lỗi

- **Cloud Logging:** Kiểm tra log ở cả 3 service (`mommy-api-service`, `mommy-task-processor-service`, `mommy-frontend-service`) và Cloud Tasks
- **Cloud Tasks Console:** Theo dõi hàng đợi, số lần thử lại, lỗi
- **GCS Console:** Kiểm tra xem file MP3 đã xuất hiện trong bucket chưa
- **Phân quyền (IAM):** Kiểm tra kỹ phân quyền của tất cả service account liên quan

---

### IX. Kết luận

Đây là một hệ thống phức tạp nhưng rất đáng để xây dựng, vì đây là cách tiêu chuẩn để xử lý các tác vụ nền trên Google Cloud. Hãy làm từng bước một, kiểm tra từng dịch vụ riêng biệt trước khi tích hợp hoàn chỉnh.

Chúc bạn thành công!

--- 

Nếu bạn muốn mình giúp bạn:
- Viết file `cloudbuild.yaml` cho CI/CD
- Cấu hình Webhook thay vì polling
- Tự động dọn dẹp file cũ trên GCS
- Chuyển sang Compute Engine nếu cần xử lý nặng hơn

👉 Chỉ cần nói rõ bạn muốn bắt đầu từ đâu nhé!

---

# 🚀 Giải pháp: **Dùng Object Lifecycle Policy trên Google Cloud Storage**

Đây là cách đơn giản và hiệu quả nhất để tự động xóa các file cũ khỏi bucket mà không cần code thêm.

---

## 🔧 Bước 1: Tạo Lifecycle Policy cho Bucket

Mỗi bucket trên GCS có thể được cấu hình một **Lifecycle Policy**, cho phép bạn tự động xóa, chuyển vùng, hoặc chuyển lớp lưu trữ cho các object dựa trên tuổi đời hoặc trạng thái của chúng.

### Ví dụ: Xóa tất cả file cũ hơn 1 ngày

Tạo file JSON tên là `lifecycle.json`:

```json
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": {
        "age": 1, // số ngày kể từ khi tạo file
        "isLive": true
      }
    }
  ]
}
```

> 💡 Nếu bạn muốn giữ lại file trong 7 ngày → thay `age` thành `7`.

---

## 📦 Bước 2: Áp dụng Lifecycle Policy lên Bucket

Chạy lệnh sau bằng `gsutil`:

```bash
gsutil lifecycle set lifecycle.json gs://your-bucket-name
```

Thay `your-bucket-name` bằng tên bucket của bạn.

---

## 📋 Kiểm tra lại chính sách:

```bash
gsutil lifecycle get gs://your-bucket-name
```

---

## ✅ Lợi ích của phương pháp này:

| Điểm mạnh | Mô tả |
|----------|-------|
| Không cần code | Chỉ cần cấu hình một lần |
| Hoạt động nền | GCP tự động chạy mỗi vài phút |
| Hiệu quả | Rất nhẹ nhàng, không tốn tài nguyên |
| Phù hợp với kiến trúc Cloud Run | Không can thiệp logic backend |

---
