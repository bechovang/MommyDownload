Tuyệt vời! Dựa trên cả hai file mô tả backend/DB và frontend, đây là mô tả chi tiết về cơ chế hoạt động tổng thể của ứng dụng MommyDownload, làm rõ sự tương tác giữa Frontend, Backend và Database.

**I. Tổng quan Luồng Hoạt động Chính (Từ góc nhìn người dùng)**

1.  **Truy cập:** Người dùng mở trang web MommyDownload (Frontend).
2.  **Nhập liệu:** Người dùng dán (hoặc gõ) một URL video YouTube vào ô nhập liệu.
3.  **Khởi tạo Chuyển đổi:** Người dùng nhấn nút "Chuyển đổi sang MP3".
4.  **Chờ xử lý:** Giao diện hiển thị trạng thái đang tải ("Đang tải thông tin...", "Đang chuyển đổi...").
5.  **Hiển thị Kết quả:** Giao diện hiển thị thông tin video (thumbnail, tiêu đề, tác giả, thời lượng) và nút "Tải nhạc về máy".
6.  **Tải xuống:** Người dùng nhấn nút "Tải nhạc về máy", trình duyệt bắt đầu tải file MP3.
7.  **(Tùy chọn) Xem Lịch sử:** Các lượt tải thành công có thể được hiển thị trong phần "Đã tải gần đây".
8.  **(Tùy chọn) Đổi Theme:** Người dùng có thể chuyển đổi giữa giao diện Sáng và Tối.

**II. Chi tiết Tương tác Giữa Các Thành phần**

Hãy chia nhỏ từng bước và xem Frontend (FE), Backend (BE), và Database (DB) làm gì:

**Bước 1: Truy cập Trang Web**

*   **FE (Next.js - Browser):**
    *   Người dùng truy cập URL của ứng dụng (ví dụ: `https://mommydownload.vercel.app`).
    *   Next.js server (hoặc Vercel edge) render trang chính (`/app/page.tsx`) và layout (`/app/layout.tsx`).
    *   Gửi HTML, CSS (Tailwind), và JavaScript ban đầu xuống trình duyệt.
    *   Các component React (như `YouTubeForm`, `Instructions`, `RecentDownloads`, `ThemeToggle`) được render.
    *   Component `RecentDownloads` sử dụng hook `useLocalStorage` để đọc danh sách các lượt tải gần đây (nếu có) từ `localStorage` của trình duyệt và hiển thị chúng.
    *   `ThemeProvider` đọc theme đã lưu (từ `localStorage`) và áp dụng class tương ứng (sáng/tối) cho thẻ `<html>`.
*   **BE (Spring Boot - Server):** Không hoạt động, đang chờ request.
*   **DB (PostgreSQL - Server):** Không hoạt động.

**Bước 2: Người dùng Nhập/Dán URL**

*   **FE:**
    *   Component `YouTubeForm` quản lý state `url` bằng `useState`.
    *   Khi người dùng gõ, sự kiện `onChange` cập nhật state `url`.
    *   *(Tối ưu hóa)* Có thể có validation URL phía client (hàm `isYouTubeUrl`) và debounce để hiển thị lỗi nếu URL không hợp lệ sau một khoảng trễ ngắn.
    *   Khi nhấn nút "Dán", `handlePaste` sử dụng `navigator.clipboard.readText()` để đọc clipboard và cập nhật state `url`.
*   **BE:** Vẫn không hoạt động.
*   **DB:** Vẫn không hoạt động.

**Bước 3 & 4: Nhấn "Chuyển đổi" & Xử lý (Giai đoạn 1: Lấy thông tin Video)**

*   **FE:**
    *   Sự kiện `onSubmit` trên `YouTubeForm` được kích hoạt, gọi hàm `handleConvert` trong `page.tsx`.
    *   `handleConvert` thực hiện validation cơ bản (URL không rỗng, định dạng YouTube hợp lệ). Nếu lỗi, cập nhật state `error` và hiển thị `Alert` trong `YouTubeForm`.
    *   Nếu hợp lệ:
        *   Đặt `isLoading = true`, `error = null`, `showResult = false`. Component `LoadingIndicator` được hiển thị với thông báo "Đang tải thông tin video...".
        *   Gọi hàm `getVideoInfo(url)` từ custom hook `useYoutubeConverter`.
        *   `getVideoInfo` thực hiện một **HTTP GET request** bất đồng bộ đến Backend API: `GET /api/video-info?url={encoded_youtube_url}`.
*   **BE:**
    *   `VideoController` nhận request `GET /api/video-info`.
    *   Controller gọi `YouTubeService.getVideoInfo(url)`.
    *   `YouTubeService`:
        *   Kiểm tra **Cache (Caffeine)** xem thông tin cho `url` này đã tồn tại và còn hiệu lực chưa.
        *   **Cache Miss:** Sử dụng thư viện `java-video-downloader` để kết nối tới YouTube, phân tích trang hoặc gọi API (nếu có key) để lấy metadata (title, author, duration, thumbnail, videoId). Tạo `VideoInfoDTO`. Lưu DTO này vào cache với key là `url`.
        *   **Cache Hit:** Trả về `VideoInfoDTO` từ cache ngay lập tức.
        *   **Lỗi:** Nếu không lấy được thông tin (URL sai, video riêng tư, lỗi mạng...), ném `YoutubeProcessingException`.
    *   `VideoController` nhận DTO hoặc exception:
        *   **Thành công:** Trả về **HTTP Response 200 OK** với body là JSON của `VideoInfoDTO`.
        *   **Thất bại:** `GlobalExceptionHandler` bắt `YoutubeProcessingException`, trả về **HTTP Response 400 Bad Request** với body JSON chứa thông báo lỗi.
*   **DB:** Thường không tương tác ở bước này, trừ khi BE có logic kiểm tra xem `videoId` đã có trong DB với trạng thái `COMPLETED` chưa để tối ưu.

**Bước 4 (Tiếp): Xử lý (Giai đoạn 2: Chuyển đổi sang MP3)**

*   **FE:**
    *   Callback của `fetch` trong `getVideoInfo` nhận được response từ BE.
    *   **Thành công (BE trả về 200 OK với VideoInfoDTO):**
        *   Hook `useYoutubeConverter` cập nhật state `videoInfo` bằng dữ liệu nhận được.
        *   Cập nhật `loadingMessage` thành "Đang chuyển đổi video sang MP3...".
        *   Gọi hàm `convertVideo(url)` từ hook `useYoutubeConverter`.
        *   `convertVideo` thực hiện một **HTTP POST request** bất đồng bộ đến Backend API: `POST /api/convert` với request body là `{ "url": youtubeUrl, "quality": "high" }` (dạng JSON).
    *   **Thất bại (BE trả về 400 Bad Request):**
        *   Hook `useYoutubeConverter` cập nhật state `error` với thông báo lỗi từ BE.
        *   Đặt `isLoading = false`. `LoadingIndicator` biến mất, `Alert` lỗi hiển thị trong `YouTubeForm`. Luồng dừng lại.
*   **BE:**
    *   `DownloadController` nhận request `POST /api/convert`.
    *   Controller gọi `ConversionService.convertToMp3(request.getUrl(), request.getQuality())`.
    *   `ConversionService`:
        1.  Gọi `YouTubeService.getVideoInfo(url)` (thường sẽ lấy từ cache).
        2.  Gọi `YouTubeService.downloadAudio(videoId, quality)`: Sử dụng thư viện (có thể là `java-video-downloader` hoặc wrapper cho `youtube-dl`/`yt-dlp`) để tải luồng *chỉ âm thanh* chất lượng tốt nhất (hoặc theo `quality`) từ YouTube về server dưới dạng file tạm (ví dụ: `temp_audio.webm`).
        3.  **Sử dụng FFmpeg:** Gọi thư viện `net.bramp.ffmpeg` để thực thi lệnh `ffmpeg` trên server:
            *   Input: `temp_audio.webm`
            *   Output: `temp_output_{uuid}.mp3` (một file tạm khác)
            *   Options: `-codec:a libmp3lame -q:a 2` (hoặc bitrate tương ứng với `quality`)
        4.  **Lưu trữ:** Mở `InputStream` từ `temp_output_{uuid}.mp3`. Gọi `FileStorageService.storeFile(inputStream, videoInfo.getTitle() + ".mp3")`.
        5.  `FileStorageService.storeFile`: Tạo UUID mới (`fileId`), tạo đường dẫn `./temp/{fileId}.mp3`, sao chép dữ liệu từ `InputStream` vào file này, trả về `fileId`.
        6.  Tính toán `fileSize` của file `./temp/{fileId}.mp3`.
        7.  **Tương tác DB:** Tạo đối tượng `File` (Entity) với các thông tin: `id` (UUID mới), `videoId`, `title`, `author`, `filePath` (chính là `fileId`), `fileSize`, `duration`, `thumbnailUrl`, `createdAt` (tự động), `expiresAt` (hiện tại + `app.storage.expire-hours`), `status = COMPLETED`, `downloadCount = 0`.
        8.  Gọi `fileRepository.save(file)`.
        9.  **Tương tác DB (Thực thi):** Spring Data JPA/Hibernate tạo và thực thi câu lệnh `INSERT INTO files (...) VALUES (...)` vào PostgreSQL.
        10. Tạo `ConvertResponseDTO` chứa `fileId`, `title`, `size`, `duration`, `expiresAt`.
        11. Dọn dẹp các file tạm (`temp_audio.webm`, `temp_output_{uuid}.mp3`).
        12. Trả về `ConvertResponseDTO`.
    *   **Lỗi:** Nếu bất kỳ bước nào (tải audio, ffmpeg, lưu file, ghi DB) thất bại, ném `ConversionException`.
    *   `DownloadController`:
        *   **Thành công:** Trả về **HTTP Response 200 OK** với JSON của `ConvertResponseDTO`.
        *   **Thất bại:** `GlobalExceptionHandler` bắt `ConversionException`, trả về **HTTP Response 500 Internal Server Error** với JSON chứa lỗi.
*   **DB:**
    *   Nhận và thực thi câu lệnh `INSERT` vào bảng `files`. Lưu trữ thành công metadata của file MP3.

**Bước 5: Hiển thị Kết quả**

*   **FE:**
    *   Callback của `fetch` trong `convertVideo` nhận được response từ BE.
    *   **Thành công (BE trả về 200 OK với ConvertResponseDTO):**
        *   Hook `useYoutubeConverter` cập nhật state `fileId` bằng `fileId` nhận được.
        *   Đặt `isLoading = false`.
        *   Trong `page.tsx`, hàm `handleConvert` tiếp tục:
            *   Tạo object `newDownload` chứa thông tin (lấy từ `videoInfo` đã có).
            *   Cập nhật state `recentDownloads` (thêm `newDownload` vào đầu, giới hạn 10 mục).
            *   Sử dụng `setValue` từ `useLocalStorage` để lưu `recentDownloads` mới vào `localStorage`.
            *   Đặt `showResult = true`.
        *   Component `LoadingIndicator` biến mất. Component `VideoResult` được render, nhận `videoInfo` và hàm `handleDownload` làm props, hiển thị thông tin và nút "Tải nhạc về máy". Component `RecentDownloads` cũng tự động cập nhật danh sách.
    *   **Thất bại (BE trả về 500 Internal Server Error):**
        *   Hook `useYoutubeConverter` cập nhật state `error` với thông báo lỗi.
        *   Đặt `isLoading = false`. `LoadingIndicator` biến mất, `Alert` lỗi hiển thị.

**Bước 6: Tải File MP3**

*   **FE:**
    *   Người dùng nhấn nút "Tải nhạc về máy" trong `VideoResult`.
    *   Sự kiện `onClick` gọi hàm `handleDownload` trong `page.tsx`.
    *   `handleDownload` gọi `downloadFile(fileId)` từ hook `useYoutubeConverter`.
    *   `downloadFile` thực hiện: `window.location.href = /api/download/${fileId}`.
    *   **Trình duyệt** gửi một **HTTP GET request** trực tiếp đến BE theo đường dẫn này.
*   **BE:**
    *   `DownloadController` nhận request `GET /api/download/{fileId}`.
    *   Controller gọi `FileStorageService.loadFileAsPath(fileId)` để lấy `Path` tới file `./temp/{fileId}.mp3`.
    *   Tạo `UrlResource` từ `Path`.
    *   Kiểm tra resource tồn tại và đọc được.
    *   *(Nên làm)* Gọi `fileRepository.findById(fileId)` để lấy thông tin file từ DB (đặc biệt là `title` để đặt tên file tải về và kiểm tra `expiresAt`). Nếu không tìm thấy hoặc đã hết hạn, trả về 404 Not Found.
    *   *(Tùy chọn)* Gọi `fileRepository.incrementDownloadCount(fileId)` -> Gửi lệnh `UPDATE files SET download_count = download_count + 1 WHERE id = ?` tới DB.
    *   *(Tùy chọn)* Nếu dùng bảng `downloads`: Tạo entity `Download`, lấy IP/UserAgent từ request, lưu vào DB -> Gửi lệnh `INSERT INTO downloads (...) VALUES (...)` tới DB.
    *   Thiết lập **HTTP Headers** cho response:
        *   `Content-Disposition: attachment; filename="{title}.mp3"` (báo trình duyệt tải file với tên gợi ý)
        *   `Content-Type: audio/mpeg` (hoặc `application/octet-stream`)
        *   `Content-Length: {file_size}`
    *   Trả về `ResponseEntity<Resource>` chứa file MP3. Spring Boot sẽ stream nội dung file này xuống trình duyệt.
*   **DB:**
    *   *(Nên làm)* Nhận lệnh `SELECT` để kiểm tra file.
    *   *(Tùy chọn)* Nhận lệnh `UPDATE` để tăng `download_count`.
    *   *(Tùy chọn)* Nhận lệnh `INSERT` vào bảng `downloads`.

**Bước 7: Xem Lịch sử Tải xuống**

*   **FE:** Component `RecentDownloads` luôn hiển thị dữ liệu từ state `recentDownloads` (được đồng bộ với `localStorage`). Khi người dùng nhấn "Tải lại", nó gọi `handleDownloadAgain(item)`, hàm này đặt lại `youtubeUrl` bằng `item.url` và gọi lại `handleConvert`, bắt đầu lại quy trình từ Bước 3.

**Bước 8: Chuyển đổi Theme**

*   **FE:**
    *   Nhấn nút `ThemeToggle`.
    *   Sự kiện `onClick` gọi `setTheme` từ hook `useTheme` (của `next-themes`).
    *   `next-themes` cập nhật class trên thẻ `<html>` (ví dụ: thêm/xóa class `dark`) và lưu lựa chọn vào `localStorage`.
    *   Tailwind CSS tự động áp dụng các style `dark:` tương ứng. Các component sử dụng màu sắc từ biến CSS của Tailwind/shadcn cũng tự cập nhật.
*   **BE & DB:** Không liên quan.

**Bước Nền: Dọn dẹp File Hết Hạn**

*   **BE:**
    *   Tác vụ `@Scheduled` trong `FileStorageServiceImpl` (hoặc service riêng) tự động chạy định kỳ (ví dụ: mỗi giờ).
    *   **Logic tốt hơn:**
        1.  Gọi `fileRepository.findByExpiresAtBeforeAndStatus(LocalDateTime.now(), File.Status.COMPLETED)`. -> Gửi lệnh `SELECT * FROM files WHERE expires_at < NOW() AND status = 'COMPLETED'` tới DB.
        2.  Lặp qua danh sách các `File` entity hết hạn trả về từ DB.
        3.  Với mỗi `File`, gọi `fileStorageService.deleteFile(file.getFilePath())` -> Xóa file vật lý `./temp/{fileId}.mp3` khỏi ổ đĩa server.
        4.  *(Tùy chọn)* Gọi `fileRepository.delete(file)` hoặc `fileRepository.updateStatus(file.getId(), File.Status.EXPIRED)` -> Gửi lệnh `DELETE FROM files WHERE id = ?` hoặc `UPDATE files SET status = 'EXPIRED' WHERE id = ?` tới DB.
*   **DB:** Nhận lệnh `SELECT`, sau đó là các lệnh `DELETE` hoặc `UPDATE` tương ứng.
*   **FE:** Không bị ảnh hưởng trực tiếp. Nếu người dùng cố tải lại file đã bị xóa, BE sẽ trả về lỗi 404 ở Bước 6.

**III. Kết luận về Cơ chế Hoạt động**

Ứng dụng MommyDownload hoạt động theo mô hình Client-Server điển hình:

*   **Frontend (Next.js):** Đóng vai trò là client, chịu trách nhiệm hiển thị giao diện, thu thập input người dùng, quản lý trạng thái UI (loading, error, result), lưu trữ cục bộ (localStorage), và giao tiếp với Backend thông qua các HTTP request (API calls).
*   **Backend (Spring Boot):** Đóng vai trò là server, cung cấp REST API, thực hiện logic nghiệp vụ cốt lõi (tương tác với YouTube, chuyển đổi file bằng FFmpeg, quản lý file tạm), và tương tác với Database để lưu trữ/truy xuất dữ liệu lâu dài.
*   **Database (PostgreSQL):** Lưu trữ trạng thái bền vững của ứng dụng, cụ thể là thông tin về các file đã chuyển đổi, giúp quản lý file, tránh xử lý lại và hỗ trợ các tính năng như lịch sử tải xuống hoặc dọn dẹp.

Sự tương tác giữa các thành phần diễn ra chủ yếu qua các API call từ FE đến BE. BE sau đó điều phối công việc, sử dụng các thư viện bên ngoài (YouTube, FFmpeg) và giao tiếp với DB khi cần thiết để hoàn thành yêu cầu từ FE. Caching ở BE giúp giảm tải và tăng tốc độ phản hồi cho các yêu cầu lặp lại (lấy thông tin video).