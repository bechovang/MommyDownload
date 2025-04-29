Okay, let's break down the backend design for the MommyDownload application based on the provided file. This description will elaborate on the components, logic, and rationale behind the design choices.

**I. Tổng quan về Hệ thống Backend**

Hệ thống backend này được thiết kế như một ứng dụng web RESTful sử dụng **Spring Boot**, một framework Java phổ biến để xây dựng các ứng dụng độc lập, cấp độ sản xuất. Nó đóng vai trò là bộ não của ứng dụng MommyDownload, xử lý logic nghiệp vụ, tương tác với cơ sở dữ liệu và cung cấp các API cho frontend hoặc các client khác.

Mục tiêu chính của backend là:

1.  **Tiếp nhận URL YouTube:** Nhận URL video từ người dùng.
2.  **Lấy thông tin video:** Trích xuất siêu dữ liệu (metadata) như tiêu đề, tác giả, thời lượng, ảnh thumbnail từ URL YouTube.
3.  **Chuyển đổi sang MP3:** Tải xuống luồng âm thanh từ video YouTube và chuyển đổi nó sang định dạng MP3.
4.  **Lưu trữ tạm thời:** Lưu trữ file MP3 đã chuyển đổi trên server trong một khoảng thời gian giới hạn.
5.  **Cung cấp link tải:** Cung cấp một liên kết duy nhất để người dùng tải xuống file MP3.
6.  **Quản lý file:** Tự động dọn dẹp các file đã hết hạn lưu trữ.
7.  **Xử lý lỗi và giới hạn:** Cung cấp cơ chế xử lý lỗi và giới hạn tỷ lệ truy cập (rate limiting) để đảm bảo sự ổn định.

**II. Công nghệ Cốt lõi**

*   **Framework:** Spring Boot (Web, Data JPA, Validation, Cache) - Cung cấp nền tảng vững chắc, cấu hình tự động và hệ sinh thái phong phú.
*   **Ngôn ngữ:** Java 17 (dựa trên Dockerfile)
*   **Cơ sở dữ liệu:** PostgreSQL - Một hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy và mã nguồn mở.
*   **ORM:** Hibernate (thông qua Spring Data JPA) - Đơn giản hóa việc tương tác với cơ sở dữ liệu bằng cách ánh xạ các đối tượng Java tới các bảng trong CSDL.
*   **Xử lý YouTube:**
    *   `com.github.axet:java-video-downloader`: Thư viện để lấy thông tin video từ YouTube.
    *   `net.bramp.ffmpeg:ffmpeg`: Thư viện Java để tương tác với công cụ FFmpeg (cần cài đặt FFmpeg trên server) cho việc chuyển đổi định dạng audio/video.
*   **Caching:** Spring Cache với Caffeine - Cải thiện hiệu suất bằng cách lưu trữ kết quả của các hoạt động tốn kém (như lấy thông tin video).
*   **Tiện ích:**
    *   Lombok: Giảm mã soạn sẵn (boilerplate code) trong các lớp Java (getter, setter, constructor,...).
    *   Commons IO: Cung cấp các tiện ích xử lý file và I/O.
*   **Build Tool:** Maven - Quản lý phụ thuộc và quá trình build dự án.
*   **Containerization:** Docker & Docker Compose - Đóng gói và triển khai ứng dụng cùng với cơ sở dữ liệu một cách nhất quán trên các môi trường khác nhau.

**III. Cấu trúc Dự án (Giải thích)**

Cấu trúc dự án theo chuẩn Maven và Spring Boot, phân chia rõ ràng các lớp theo trách nhiệm (Layered Architecture):

*   `com.mommydownload`: Gói gốc của ứng dụng.
    *   `config`: Chứa các lớp cấu hình (ví dụ: WebConfig cho CORS, RateLimitConfig, cấu hình Cache).
    *   `controller`: Các lớp Spring MVC Controller, chịu trách nhiệm xử lý các yêu cầu HTTP đến, gọi các Service tương ứng và trả về phản hồi (JSON hoặc file).
    *   `dto` (Data Transfer Object): Các lớp POJO đơn giản dùng để truyền dữ liệu giữa các tầng (đặc biệt là giữa Controller và Service) và làm hợp đồng API. Chúng giúp tách biệt mô hình dữ liệu nội bộ (Entity) khỏi cấu trúc dữ liệu phơi bày ra bên ngoài.
    *   `exception`: Chứa các lớp ngoại lệ tùy chỉnh (custom exceptions) và bộ xử lý ngoại lệ toàn cục (`GlobalExceptionHandler`) để xử lý lỗi một cách nhất quán và trả về phản hồi lỗi thân thiện.
    *   `model`: Các lớp Entity, đại diện cho các bảng trong cơ sở dữ liệu (`File`, `Download`). Chúng được đánh dấu bằng các annotation JPA (`@Entity`, `@Table`, `@Id`, `@Column`,...).
    *   `repository`: Các interface mở rộng từ `JpaRepository` (Spring Data JPA). Chúng định nghĩa các phương thức để truy cập và thao tác dữ liệu trong CSDL mà không cần viết mã SQL thủ công cho các hoạt động CRUD cơ bản. Các truy vấn phức tạp hơn có thể được định nghĩa bằng `@Query`.
    *   `service`: Chứa logic nghiệp vụ cốt lõi của ứng dụng.
        *   `impl`: Các lớp triển khai (implementation) của các interface Service. Tách biệt interface và implementation giúp dễ dàng thay đổi hoặc kiểm thử (testing).
    *   `util`: Các lớp tiện ích dùng chung trong toàn bộ ứng dụng (ví dụ: định dạng thời gian, xử lý chuỗi,...).
    *   `MommyDownloadApplication.java`: Lớp chính để khởi chạy ứng dụng Spring Boot.
*   `resources`: Chứa các tài nguyên không phải mã Java.
    *   `static`: Chứa các tài nguyên tĩnh (CSS, JS, ảnh) - ít dùng trong API backend thuần túy.
    *   `templates`: Chứa các template (ví dụ: Thymeleaf, Freemarker) - không cần thiết nếu chỉ xây dựng API.
    *   `application.yml`: File cấu hình chính cho ứng dụng (cổng server, kết nối CSDL, cấu hình cache, cấu hình tùy chỉnh của ứng dụng).
    *   `application-dev.yml`: File cấu hình dành riêng cho môi trường phát triển (có thể ghi đè cấu hình trong `application.yml`). Spring Profiles được sử dụng để quản lý cấu hình cho các môi trường khác nhau (dev, prod, test,...).

**IV. Cấu hình Ứng dụng (`application.yml`)**

File này là trung tâm cấu hình của ứng dụng:

*   `server`: Cấu hình máy chủ nhúng (Tomcat mặc định): cổng (`port: 8080`), đường dẫn gốc cho các API (`context-path: /api`).
*   `spring.datasource`: Thông tin kết nối đến CSDL PostgreSQL (URL, username, password, driver).
*   `spring.jpa`: Cấu hình liên quan đến JPA và Hibernate:
    *   `ddl-auto: update`: Hibernate sẽ tự động cập nhật schema CSDL dựa trên các Entity khi khởi động (hữu ích trong dev, cẩn thận khi dùng trong prod).
    *   `properties.hibernate.dialect`: Chỉ định phương ngữ SQL cụ thể cho PostgreSQL.
    *   `format_sql: true`, `show-sql: true`: Hiển thị và định dạng các câu lệnh SQL được Hibernate tạo ra trong log (hữu ích cho việc debug).
*   `spring.cache`: Kích hoạt và cấu hình caching:
    *   `type: caffeine`: Sử dụng Caffeine làm nhà cung cấp cache.
    *   `caffeine.spec`: Cấu hình chi tiết cho Caffeine cache (kích thước tối đa, thời gian hết hạn sau khi ghi).
*   `app`: Phần cấu hình tùy chỉnh riêng của ứng dụng MommyDownload:
    *   `storage`: Đường dẫn thư mục tạm (`temp-dir`), thời lượng video tối đa cho phép (`max-duration`), thời gian file tồn tại (`expire-hours`), số lượt tải đồng thời tối đa (`max-concurrent-downloads`).
    *   `youtube`: Khóa API YouTube (quan trọng nếu cần gọi API chính thức của YouTube), số lần thử lại, độ trễ giữa các lần thử.
*   `logging.level`: Cấu hình mức độ log cho các gói khác nhau (INFO, DEBUG) để kiểm soát lượng thông tin log được ghi lại.

**V. Thiết kế Cơ sở dữ liệu (PostgreSQL)**

Hai bảng chính được đề xuất:

1.  **`files` Table:** Bảng trung tâm lưu trữ thông tin về mỗi file MP3 đã được chuyển đổi thành công.
    *   `id` (VARCHAR(36), PK): UUID, định danh duy nhất cho mỗi bản ghi file.
    *   `video_id` (VARCHAR(50), NOT NULL): ID gốc của video YouTube, giúp tránh xử lý lại cùng một video (có thể kết hợp với `status` để kiểm tra).
    *   `title` (VARCHAR(255), NOT NULL): Tiêu đề video.
    *   `author` (VARCHAR(100)): Tên kênh/tác giả.
    *   `file_path` (VARCHAR(255), NOT NULL): Tên file hoặc đường dẫn tương đối đến file MP3 được lưu trữ trên server (trong `temp-dir`). **Quan trọng:** Không nên lưu đường dẫn tuyệt đối đầy đủ. Tên file thường là `id` + `.mp3`.
    *   `file_size` (BIGINT, NOT NULL): Kích thước file MP3 (tính bằng byte).
    *   `duration` (VARCHAR(10)): Thời lượng video/audio (định dạng như "HH:MM:SS" hoặc "MM:SS").
    *   `thumbnail_url` (VARCHAR(255)): URL ảnh thumbnail của video.
    *   `created_at` (TIMESTAMP WITH TIME ZONE): Thời điểm bản ghi được tạo.
    *   `expires_at` (TIMESTAMP WITH TIME ZONE, NOT NULL): Thời điểm file MP3 hết hạn và có thể bị xóa.
    *   `download_count` (INTEGER): Bộ đếm số lượt file này được tải xuống.
    *   `status` (VARCHAR(20)): Trạng thái của quá trình chuyển đổi (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`). `chk_status` đảm bảo giá trị hợp lệ.
    *   `error_message` (TEXT): Lưu thông báo lỗi nếu quá trình chuyển đổi thất bại.
    *   **Indices:**
        *   `idx_files_video_id`: Tăng tốc tìm kiếm file dựa trên `video_id`.
        *   `idx_files_expires_at`: Tăng tốc tìm kiếm các file đã hết hạn để dọn dẹp.
        *   `idx_files_status`: Tăng tốc truy vấn dựa trên trạng thái (ví dụ: tìm các file đang xử lý).

2.  **`downloads` Table (Tùy chọn):** Dùng để ghi lại lịch sử mỗi lượt tải xuống. Hữu ích cho việc phân tích hoặc giới hạn tải xuống theo người dùng/IP trong tương lai.
    *   `id` (VARCHAR(36), PK): UUID, định danh duy nhất cho mỗi lượt tải.
    *   `user_id` (VARCHAR(36)): ID người dùng (nếu có hệ thống xác thực).
    *   `file_id` (VARCHAR(36), FK references `files(id)`): Liên kết đến file đã được tải.
    *   `ip_address` (VARCHAR(45)): Địa chỉ IP của người tải.
    *   `user_agent` (TEXT): Thông tin trình duyệt/client của người tải.
    *   `downloaded_at` (TIMESTAMP WITH TIME ZONE): Thời điểm tải xuống.
    *   **Indices:** Tăng tốc truy vấn theo `file_id` hoặc `user_id`.

**VI. Luồng xử lý Dữ liệu và Logic Nghiệp vụ**

**A. Luồng Lấy thông tin Video (`GET /api/video/info`)**

1.  `VideoController` nhận yêu cầu GET với tham số `url`.
2.  Controller gọi `YouTubeService.getVideoInfo(url)`.
3.  `YouTubeService`:
    *   Kiểm tra cache (`@Cacheable(value = "videoInfo", key = "#url")`) xem thông tin cho URL này đã có chưa.
    *   Nếu có trong cache, trả về thông tin từ cache.
    *   Nếu không có trong cache:
        *   Sử dụng thư viện `java-video-downloader` để kết nối đến YouTube và lấy metadata (tiêu đề, tác giả, thời lượng, thumbnail, videoId).
        *   Định dạng lại thời lượng (`formatDuration`).
        *   Tạo đối tượng `VideoInfoDTO`.
        *   Lưu kết quả vào cache.
        *   Trả về `VideoInfoDTO`.
    *   Nếu có lỗi xảy ra (URL không hợp lệ, lỗi mạng,...), ném ra `YoutubeProcessingException`.
4.  `VideoController` nhận `VideoInfoDTO` từ Service và trả về ResponseEntity 200 (OK) với DTO trong body.
5.  Nếu `YoutubeProcessingException` bị ném, `GlobalExceptionHandler` sẽ bắt và trả về ResponseEntity 400 (Bad Request).

**B. Luồng Chuyển đổi sang MP3 (`POST /api/download/convert`)**

1.  `DownloadController` nhận yêu cầu POST với body là `ConvertRequestDTO` (chứa `url` và `quality`).
2.  Controller gọi `ConversionService.convertToMp3(url, quality)`.
3.  `ConversionService`:
    *   **Bước 1: Lấy thông tin video:** Gọi `YouTubeService.getVideoInfo(url)` (sử dụng cache nếu có). Nếu lỗi, ném `YoutubeProcessingException` (sẽ được gói trong `ConversionException`).
    *   **Bước 2: Tải audio:** Gọi `YouTubeService.downloadAudio(videoId, quality)` (Đây là phần *cần triển khai chi tiết* hơn, có thể dùng `java-video-downloader` hoặc một thư viện như `youtube-dl-java-wrapper` để tải luồng audio phù hợp với `quality`). Kết quả là một file tạm (ví dụ: `.webm`, `.m4a`).
    *   **Bước 3: Chuyển đổi FFmpeg (Giả định):**
        *   Sử dụng thư viện `net.bramp.ffmpeg`.
        *   Tạo `FFmpegBuilder` để định nghĩa lệnh FFmpeg:
            *   Input: File audio tạm đã tải ở Bước 2.
            *   Output: Một file đích mới với đuôi `.mp3`.
            *   Options: Chỉ định codec âm thanh (`libmp3lame`), bitrate (dựa trên `quality`),...
        *   Thực thi lệnh FFmpeg bằng `FFmpegExecutor`. Nếu lỗi, xử lý và ném `ConversionException`.
        *   Kết quả là một file MP3 trong một đường dẫn tạm thời khác.
    *   **Bước 4: Lưu trữ file:**
        *   Mở `InputStream` từ file MP3 đã tạo ở Bước 3.
        *   Gọi `FileStorageService.storeFile(inputStream, videoInfo.getTitle() + ".mp3")`.
        *   `FileStorageService.storeFile` tạo một UUID làm `fileId`, tạo đường dẫn đích trong `temp-dir` (`./temp/{fileId}.mp3`), sao chép nội dung InputStream vào file đích và trả về `fileId`.
        *   Đóng InputStream.
    *   **Bước 5: Lấy thông tin file:** Tính toán kích thước file MP3 (`Files.size`).
    *   **Bước 6: Lưu metadata vào CSDL:**
        *   Tạo một đối tượng `File` (Entity).
        *   Điền thông tin: `videoId`, `title`, `author`, `filePath` (chính là `fileId`), `fileSize`, `duration`, `thumbnailUrl`.
        *   Tính toán `expiresAt` (thời gian hiện tại + `app.storage.expire-hours`).
        *   Đặt `status` là `File.Status.COMPLETED`.
        *   Gọi `fileRepository.save(file)` để lưu vào bảng `files`.
    *   **Bước 7: Tạo phản hồi:**
        *   Tạo đối tượng `ConvertResponseDTO`.
        *   Điền thông tin: `fileId`, `title`, `size`, `duration`, `expiresAt`.
        *   Trả về `ConvertResponseDTO`.
    *   Nếu bất kỳ bước nào thất bại, ném `ConversionException` với thông báo lỗi phù hợp. Các file tạm nên được dọn dẹp trong khối `finally` hoặc bằng cơ chế quản lý tài nguyên (try-with-resources).
4.  `DownloadController` nhận `ConvertResponseDTO` và trả về ResponseEntity 200 (OK).
5.  Nếu `ConversionException` bị ném, `GlobalExceptionHandler` bắt và trả về ResponseEntity 500 (Internal Server Error).

**C. Luồng Tải file MP3 (`GET /api/download/{fileId}`)**

1.  `DownloadController` nhận yêu cầu GET với `fileId` từ đường dẫn.
2.  Controller gọi `FileStorageService.loadFileAsPath(fileId)` để lấy đối tượng `Path` trỏ đến file `{fileId}.mp3` trong thư mục tạm.
3.  Tạo một `UrlResource` từ `Path`.
4.  Kiểm tra xem `resource` có tồn tại (`exists()`) và có thể đọc được (`isReadable()`) không. Nếu không, trả về ResponseEntity 404 (Not Found). *Lưu ý: Có thể cần kiểm tra xem file có hết hạn trong CSDL không trước khi trả về.*
5.  *(Tùy chọn)* Gọi `fileRepository.incrementDownloadCount(fileId)` để tăng bộ đếm tải xuống trong CSDL. Nếu có bảng `downloads`, tạo và lưu một bản ghi `Download`.
6.  Tạo `HttpHeaders`:
    *   `Content-Disposition: attachment; filename="{original_filename}.mp3"`: Yêu cầu trình duyệt tải file xuống thay vì hiển thị nội tuyến. Tên file gốc có thể lấy từ CSDL (`file.getTitle()`) hoặc dùng `resource.getFilename()`.
    *   `Content-Type: application/octet-stream` (hoặc `audio/mpeg`): Chỉ định kiểu MIME của file.
    *   `Content-Length`: Kích thước file (lấy từ `resource.contentLength()`).
7.  Trả về `ResponseEntity.ok()` với các headers đã thiết lập và `resource` làm body. Spring Boot sẽ tự động stream nội dung file cho client.
8.  Nếu có lỗi xảy ra (ví dụ: `IOException` khi đọc file), `GlobalExceptionHandler` (hoặc một handler cụ thể hơn) sẽ bắt và trả về ResponseEntity 500 (Internal Server Error).

**D. Luồng Dọn dẹp File (`@Scheduled`)**

1.  Phương thức `FileStorageServiceImpl.cleanupExpiredFiles()` được đánh dấu `@Scheduled(fixedRate = 3600000)` sẽ tự động chạy mỗi giờ.
2.  **Cách triển khai hiện tại (dùng `FileUtils.cleanDirectory`):** Xóa *tất cả* nội dung trong thư mục `tempDir`. **Cách này đơn giản nhưng có thể xóa cả các file đang được xử lý hoặc chưa hết hạn nếu không cẩn thận.**
3.  **Cách triển khai tốt hơn:**
    *   Query CSDL: Gọi `fileRepository.findByExpiresAtBeforeAndStatus(LocalDateTime.now(), File.Status.COMPLETED)` để lấy danh sách các bản ghi `File` đã hết hạn và đã hoàn thành.
    *   Lặp qua danh sách:
        *   Với mỗi `File`, lấy `fileId` (chính là `filePath`).
        *   Gọi `fileStorageService.deleteFile(fileId)` để xóa file vật lý tương ứng.
        *   (Tùy chọn) Xóa bản ghi `File` khỏi CSDL hoặc cập nhật trạng thái thành `EXPIRED`.

**VII. Xử lý Ngoại lệ**

*   **Custom Exceptions:** `YoutubeProcessingException`, `ConversionException`, `ResourceNotFoundException` được tạo ra để biểu thị các loại lỗi cụ thể trong ứng dụng.
*   **GlobalExceptionHandler (`@ControllerAdvice`):** Tập trung logic xử lý lỗi. Các phương thức `@ExceptionHandler` bắt các exception cụ thể, tạo một cấu trúc phản hồi JSON nhất quán (thường chứa timestamp và thông báo lỗi) và trả về `ResponseEntity` với mã trạng thái HTTP phù hợp (400, 500, 404). Điều này giúp Controller gọn gàng hơn.

**VIII. Hiệu năng và Khả năng mở rộng**

*   **Caching (Caffeine):** Giảm tải đáng kể cho việc lấy thông tin video lặp đi lặp lại.
*   **Rate Limiting (Guava RateLimiter):** `RateLimitInterceptor` chặn các yêu cầu quá nhanh từ cùng một nguồn (dựa trên instance của RateLimiter, không phân biệt IP trong ví dụ này), bảo vệ server khỏi bị quá tải hoặc lạm dụng. Cần cấu hình rate phù hợp.
*   **Database Indexing:** Các chỉ mục được tạo trên các cột thường xuyên được truy vấn (`video_id`, `expires_at`, `status`) giúp tăng tốc độ đọc dữ liệu.
*   **Asynchronous Processing (Tiềm năng):** Quá trình tải và chuyển đổi video (Bước 2 và 3 trong luồng chuyển đổi) là các tác vụ I/O và CPU-bound, tốn thời gian. Chuyển chúng sang xử lý bất đồng bộ (`@Async` của Spring, kết hợp với `ExecutorService` hoặc Message Queue như RabbitMQ/Kafka) sẽ giúp giải phóng luồng xử lý request chính, cải thiện khả năng đáp ứng của API `/convert`. Người dùng sẽ nhận phản hồi ngay lập tức (ví dụ: trạng thái `PROCESSING`) và kiểm tra lại sau hoặc nhận thông báo khi hoàn thành.
*   **File Cleanup:** Tác vụ dọn dẹp định kỳ ngăn chặn việc đầy ổ đĩa.

**IX. Bảo mật**

*   **CORS Configuration:** `WebConfig` cho phép các yêu cầu từ các nguồn gốc khác (ví dụ: frontend chạy trên domain khác) tương tác với API backend một cách an toàn. Cấu hình `allowedOrigins("*")` là khá lỏng lẻo, nên giới hạn chỉ cho phép domain của frontend trong môi trường production.
*   **Input Validation:** `@Valid` trên DTO trong Controller và các annotation như `@NotBlank` trong DTO đảm bảo dữ liệu đầu vào hợp lệ trước khi xử lý.
*   **Rate Limiting:** Ngăn chặn tấn công DoS cơ bản.
*   **Không có Xác thực/Phân quyền:** Thiết kế hiện tại không bao gồm cơ chế đăng nhập người dùng hay phân quyền. Mọi người đều có thể truy cập các API. Đây là một điểm cần cải thiện nếu ứng dụng yêu cầu.

**X. Triển khai (Docker)**

*   **`Dockerfile`:** Định nghĩa cách xây dựng image cho ứng dụng Spring Boot:
    *   Sử dụng multi-stage build: Stage 1 (`build`) dùng Maven để build file JAR, Stage 2 (`run`) dùng base image OpenJDK nhỏ gọn hơn, chỉ copy file JAR đã build và định nghĩa cách chạy ứng dụng. Tối ưu hóa kích thước image và bảo mật.
*   **`docker-compose.yml`:** Định nghĩa và quản lý việc chạy các container liên quan:
    *   `app` service: Build từ `Dockerfile`, ánh xạ cổng 8080, thiết lập biến môi trường (quan trọng nhất là URL CSDL để kết nối đến container `db`), mount volume `./temp` để lưu trữ file tạm bên ngoài container (giúp dữ liệu không bị mất khi container khởi động lại), và khai báo phụ thuộc vào `db`.
    *   `db` service: Sử dụng image PostgreSQL chính thức, thiết lập biến môi trường để tạo CSDL, user, password, mount volume `pgdata` để lưu trữ dữ liệu CSDL بشكل دائم.
    *   Cho phép khởi chạy toàn bộ backend (ứng dụng + CSDL) chỉ bằng lệnh `docker-compose up`.

**XI. Kết luận**

Thiết kế backend này cung cấp một nền tảng vững chắc và khá đầy đủ cho chức năng cốt lõi của ứng dụng MommyDownload. Nó áp dụng các pattern và công nghệ phổ biến trong hệ sinh thái Spring Boot, tuân theo kiến trúc phân lớp rõ ràng, có cơ chế xử lý lỗi, caching, và sẵn sàng cho việc đóng gói và triển khai bằng Docker.

Các điểm mạnh bao gồm cấu trúc rõ ràng, sử dụng ORM, caching, và có kế hoạch dọn dẹp file. Các điểm cần cải thiện hoặc xem xét thêm trong tương lai bao gồm: triển khai chi tiết phần tải audio và chuyển đổi FFmpeg, chuyển sang xử lý bất đồng bộ cho tác vụ chuyển đổi, thêm xác thực người dùng, và cấu hình CORS chặt chẽ hơn cho môi trường production.