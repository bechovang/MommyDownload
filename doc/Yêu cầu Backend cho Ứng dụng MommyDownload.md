### Yêu cầu Backend cho Ứng dụng MommyDownload

Dưới đây là các yêu cầu chi tiết cho phần backend để hỗ trợ ứng dụng tải nhạc từ YouTube:

## 1. API Endpoints

### 1.1. Lấy thông tin video

```plaintext
GET /api/video-info
```

- **Input**: URL YouTube (qua query param hoặc body)
- **Output**:

```json
{
  "title": "Tên video",
  "author": "Tên tác giả",
  "duration": "Thời lượng (mm:ss)",
  "thumbnail": "URL hình thu nhỏ",
  "videoId": "ID video YouTube"
}
```


- **Xử lý lỗi**: Trả về mã lỗi 400 nếu URL không hợp lệ, 404 nếu không tìm thấy video


### 1.2. Chuyển đổi video sang MP3

```plaintext
POST /api/convert
```

- **Input**: URL YouTube hoặc videoId
- **Output**:

```json
{
  "fileId": "ID file để tải xuống",
  "title": "Tên file",
  "size": "Kích thước file (bytes)",
  "duration": "Thời lượng (mm:ss)",
  "expiresAt": "Thời gian hết hạn (ISO 8601)"
}
```


- **Xử lý lỗi**: Trả về mã lỗi 400 nếu URL không hợp lệ, 500 nếu có lỗi khi chuyển đổi


### 1.3. Tải xuống file MP3

```plaintext
GET /api/download/:fileId
```

- **Input**: ID file (từ endpoint convert)
- **Output**: File MP3 (Content-Type: audio/mpeg)
- **Headers**:

- `Content-Disposition: attachment; filename="tên-file.mp3"`
- `Content-Length: kích-thước-file`



- **Xử lý lỗi**: Trả về mã lỗi 404 nếu không tìm thấy file, 410 nếu file đã hết hạn


## 2. Cơ sở dữ liệu

### 2.1. Bảng lưu trữ thông tin file

```plaintext
Files {
  id: string (primary key),
  videoId: string,
  title: string,
  author: string,
  filePath: string,
  fileSize: number,
  duration: string,
  thumbnail: string,
  createdAt: timestamp,
  expiresAt: timestamp,
  downloadCount: number
}
```

### 2.2. Bảng lưu trữ lịch sử tải xuống (tùy chọn, nếu có tài khoản người dùng)

```plaintext
Downloads {
  id: string (primary key),
  userId: string (foreign key, nếu có),
  fileId: string (foreign key),
  ip: string,
  userAgent: string,
  downloadedAt: timestamp
}
```

## 3. Xử lý và Lưu trữ File

### 3.1. Lưu trữ tạm thời

- Lưu trữ file MP3 đã chuyển đổi trong thư mục tạm thời
- Tự động xóa file sau một khoảng thời gian (ví dụ: 24 giờ)
- Đảm bảo đủ dung lượng ổ đĩa (tối thiểu 10GB cho lưu trữ tạm thời)


### 3.2. Định dạng file

- Định dạng MP3 với bitrate 128kbps hoặc 320kbps (tùy chọn chất lượng)
- Metadata đầy đủ (tên bài hát, nghệ sĩ, album art từ thumbnail)


## 4. Thư viện và Công nghệ

### 4.1. Thư viện xử lý YouTube

- **ytdl-core**: Để tải và phân tích video YouTube
- **ffmpeg**: Để chuyển đổi video sang MP3
- Hoặc sử dụng dịch vụ bên thứ ba như YouTube Data API


### 4.2. Công nghệ đề xuất

- **Node.js** với Express hoặc Next.js API Routes
- **Redis** để cache thông tin video và quản lý hàng đợi
- **PostgreSQL/MongoDB** để lưu trữ metadata và lịch sử
- **Docker** để đóng gói ứng dụng và các phụ thuộc


## 5. Xử lý Hiệu suất

### 5.1. Hàng đợi và Xử lý bất đồng bộ

- Sử dụng hệ thống hàng đợi (Bull, RabbitMQ) để xử lý các yêu cầu chuyển đổi
- Thông báo tiến trình chuyển đổi qua WebSocket hoặc Server-Sent Events


### 5.2. Caching

- Cache thông tin video để giảm số lượng yêu cầu đến YouTube
- Cache kết quả chuyển đổi để tránh chuyển đổi lại các video phổ biến


## 6. Bảo mật và Giới hạn

### 6.1. Giới hạn tốc độ

- Giới hạn số lượng yêu cầu API cho mỗi IP (ví dụ: 10 yêu cầu/phút)
- Giới hạn kích thước video (ví dụ: tối đa 10 phút hoặc 100MB)


### 6.2. Bảo mật

- Sử dụng HTTPS cho tất cả các API endpoints
- Xác thực fileId bằng token ngẫu nhiên hoặc JWT
- Kiểm tra và lọc URL đầu vào để tránh các cuộc tấn công


## 7. Xử lý Lỗi và Ghi nhật ký

### 7.1. Ghi nhật ký

- Ghi lại tất cả các yêu cầu API và kết quả
- Ghi lại lỗi chi tiết để dễ dàng gỡ lỗi
- Theo dõi hiệu suất hệ thống (thời gian phản hồi, sử dụng CPU/RAM)


### 7.2. Xử lý lỗi

- Xử lý lỗi từ YouTube API (video không có sẵn, bị giới hạn độ tuổi)
- Xử lý lỗi chuyển đổi (ffmpeg lỗi, file không hỗ trợ)
- Trả về thông báo lỗi thân thiện với người dùng


## 8. Triển khai và Môi trường

### 8.1. Yêu cầu máy chủ

- CPU: Tối thiểu 2 cores (đề xuất 4+ cores cho xử lý chuyển đổi)
- RAM: Tối thiểu 4GB (đề xuất 8GB+)
- Ổ cứng: SSD với ít nhất 20GB dung lượng trống
- Băng thông: Tối thiểu 100Mbps (đề xuất 1Gbps+)


### 8.2. Môi trường

- Hỗ trợ triển khai trên Docker
- Cấu hình cho các môi trường phát triển, thử nghiệm và sản xuất
- Tự động hóa triển khai với CI/CD


## 9. Vấn đề Pháp lý và Tuân thủ

### 9.1. Tuân thủ bản quyền

- Hiển thị thông báo về việc chỉ sử dụng cho mục đích cá nhân
- Không lưu trữ file MP3 lâu dài trên máy chủ
- Xem xét việc lọc nội dung có bản quyền nghiêm ngặt


### 9.2. Điều khoản dịch vụ

- Soạn thảo điều khoản dịch vụ rõ ràng
- Chính sách bảo mật về việc thu thập và sử dụng dữ liệu người dùng


## 10. Mã Nguồn Backend

### 10.1. Ví dụ mã nguồn cho API lấy thông tin video

```javascript
// api/video-info.js
import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL không hợp lệ' });
    }
    
    const videoId = ytdl.getVideoID(url);
    const videoInfo = await ytdl.getInfo(videoId);
    
    const { title, lengthSeconds, author, thumbnails } = videoInfo.videoDetails;
    
    // Chuyển đổi thời lượng từ giây sang định dạng mm:ss
    const minutes = Math.floor(lengthSeconds / 60);
    const seconds = lengthSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    return res.status(200).json({
      title,
      author: author.name,
      duration,
      thumbnail: thumbnails[thumbnails.length - 1].url,
      videoId
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin video:', error);
    return res.status(500).json({ error: 'Không thể lấy thông tin video' });
  }
}
```

### 10.2. Ví dụ mã nguồn cho API chuyển đổi video

```javascript
// api/convert.js
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Thư mục lưu trữ tạm thời
const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Database giả lập (trong thực tế sẽ sử dụng cơ sở dữ liệu thực)
const filesDB = new Map();

export default async function handler(req, res) {
  try {
    const { url } = req.body;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL không hợp lệ' });
    }
    
    const videoId = ytdl.getVideoID(url);
    const videoInfo = await ytdl.getInfo(videoId);
    
    const { title, lengthSeconds, author } = videoInfo.videoDetails;
    
    // Tạo ID file duy nhất
    const fileId = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${fileId}.mp3`);
    
    // Tải video và chuyển đổi sang MP3
    const videoStream = ytdl(url, { quality: 'highestaudio' });
    
    // Sử dụng Promise để đợi quá trình chuyển đổi hoàn tất
    await new Promise((resolve, reject) => {
      ffmpeg(videoStream)
        .audioBitrate(320)
        .format('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
    
    // Lấy kích thước file
    const stats = fs.statSync(outputPath);
    const fileSize = stats.size;
    
    // Tính thời gian hết hạn (24 giờ sau)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Lưu thông tin file vào database
    const fileInfo = {
      fileId,
      videoId,
      title,
      author: author.name,
      filePath: outputPath,
      fileSize,
      duration: formatDuration(lengthSeconds),
      createdAt: new Date(),
      expiresAt,
      downloadCount: 0
    };
    
    filesDB.set(fileId, fileInfo);
    
    // Lên lịch xóa file sau khi hết hạn
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      filesDB.delete(fileId);
    }, 24 * 60 * 60 * 1000); // 24 giờ
    
    return res.status(200).json({
      fileId,
      title,
      size: fileSize,
      duration: formatDuration(lengthSeconds),
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Lỗi khi chuyển đổi video:', error);
    return res.status(500).json({ error: 'Không thể chuyển đổi video' });
  }
}

// Hàm định dạng thời lượng
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
```

### 10.3. Ví dụ mã nguồn cho API tải xuống

```javascript
// api/download/[fileId].js
import fs from 'fs';

// Database giả lập (trong thực tế sẽ sử dụng cơ sở dữ liệu thực)
const filesDB = new Map();

export default function handler(req, res) {
  try {
    const { fileId } = req.query;
    
    // Kiểm tra xem file có tồn tại không
    if (!filesDB.has(fileId)) {
      return res.status(404).json({ error: 'Không tìm thấy file' });
    }
    
    const fileInfo = filesDB.get(fileId);
    
    // Kiểm tra xem file có hết hạn không
    if (new Date() > fileInfo.expiresAt) {
      return res.status(410).json({ error: 'File đã hết hạn' });
    }
    
    // Kiểm tra xem file có tồn tại trên ổ đĩa không
    if (!fs.existsSync(fileInfo.filePath)) {
      return res.status(404).json({ error: 'File không tồn tại' });
    }
    
    // Tăng số lượt tải xuống
    fileInfo.downloadCount += 1;
    
    // Thiết lập headers
    const fileName = fileInfo.title.replace(/[^\w\s]/gi, '') + '.mp3';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', fileInfo.fileSize);
    
    // Gửi file
    const fileStream = fs.createReadStream(fileInfo.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Lỗi khi tải xuống file:', error);
    return res.status(500).json({ error: 'Không thể tải xuống file' });
  }
}
```

## 11. Tài liệu API

Tạo tài liệu API đầy đủ cho backend, bao gồm:

- Mô tả chi tiết từng endpoint
- Các tham số đầu vào và đầu ra
- Mã lỗi và thông báo lỗi
- Ví dụ về cách sử dụng API


Tài liệu này sẽ giúp các nhà phát triển frontend dễ dàng tích hợp với backend.