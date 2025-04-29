Okay, đây là mô tả chi tiết về thiết kế cơ sở dữ liệu PostgreSQL cho ứng dụng MommyDownload, dựa trên file bạn đã cung cấp, với giải thích cặn kẽ từng yếu tố:

**I. Tổng quan và Lựa chọn Công nghệ**

*   **Hệ quản trị CSDL:** PostgreSQL được chọn. Đây là một lựa chọn mạnh mẽ vì:
    *   **Mã nguồn mở và Miễn phí:** Không tốn chi phí bản quyền.
    *   **Ổn định và Tin cậy:** Được biết đến với sự ổn định cao trong môi trường production.
    *   **Tính năng phong phú:** Hỗ trợ các kiểu dữ liệu nâng cao (JSONB, Array,...), transaction ACID, các loại index đa dạng, full-text search, và các tính năng SQL chuẩn.
    *   **Khả năng mở rộng:** Hoạt động tốt với lượng dữ liệu lớn và tải cao.
    *   **Kiểu dữ liệu `TIMESTAMP WITH TIME ZONE`:** Rất quan trọng cho các ứng dụng web cần xử lý thời gian chính xác trên nhiều múi giờ.
*   **Mục đích chính:** Cơ sở dữ liệu này lưu trữ thông tin quan trọng về các file âm thanh đã được chuyển đổi từ video YouTube, trạng thái của chúng, và (tùy chọn) lịch sử tải xuống.

**II. Chi tiết Bảng `files`**

Bảng này là trái tim của cơ sở dữ liệu, lưu trữ mọi thông tin liên quan đến một file MP3 đã được xử lý hoặc đang được xử lý.

```sql
CREATE TABLE files (
    id VARCHAR(36) PRIMARY KEY,          -- Khóa chính, dùng UUID
    video_id VARCHAR(50) NOT NULL,       -- ID gốc của video YouTube
    title VARCHAR(255) NOT NULL,        -- Tiêu đề video
    author VARCHAR(100),                -- Tên kênh/tác giả video
    file_path VARCHAR(255) NOT NULL,    -- **Quan trọng**: Thường là ID file (UUID) dùng để tạo đường dẫn, không phải đường dẫn đầy đủ
    file_size BIGINT NOT NULL,          -- Kích thước file MP3 (bytes)
    duration VARCHAR(10),               -- Thời lượng video/audio (định dạng MM:SS hoặc HH:MM:SS)
    thumbnail_url VARCHAR(255),         -- URL ảnh thumbnail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo bản ghi
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Thời điểm file hết hạn lưu trữ
    download_count INTEGER DEFAULT 0,   -- Số lượt tải xuống
    status VARCHAR(20) DEFAULT 'PENDING', -- Trạng thái xử lý file
    error_message TEXT,                 -- Thông báo lỗi nếu xử lý thất bại
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) -- Ràng buộc trạng thái hợp lệ
);
```

**Giải thích chi tiết từng cột của bảng `files`:**

1.  **`id` (VARCHAR(36) PRIMARY KEY):**
    *   **Kiểu dữ liệu:** `VARCHAR(36)` phù hợp để lưu trữ Chuỗi Định danh Duy nhất Toàn cầu (UUID - Universally Unique Identifier). UUID thường có độ dài 36 ký tự (bao gồm dấu gạch nối).
    *   **Ràng buộc:** `PRIMARY KEY` đảm bảo mỗi bản ghi file có một định danh duy nhất, không thể trùng lặp và không thể là `NULL`.
    *   **Mục đích:** Là khóa chính để định danh và liên kết đến bản ghi này từ các bảng khác (nếu có, như bảng `downloads`). Sử dụng UUID giúp tránh việc phải đoán ID tuần tự và dễ dàng tạo ID ở phía ứng dụng mà không cần truy vấn CSDL.
2.  **`video_id` (VARCHAR(50) NOT NULL):**
    *   **Kiểu dữ liệu:** `VARCHAR(50)`. ID video YouTube hiện tại thường có 11 ký tự, nhưng để `VARCHAR(50)` cho phép sự linh hoạt nếu YouTube thay đổi định dạng hoặc cho các nền tảng video khác trong tương lai.
    *   **Ràng buộc:** `NOT NULL` vì mỗi file MP3 phải được liên kết với một video gốc.
    *   **Mục đích:** Lưu ID gốc của video YouTube. Có thể dùng để kiểm tra xem video này đã được xử lý trước đó chưa (kết hợp với `status = 'COMPLETED'`), tránh xử lý lại tốn tài nguyên.
3.  **`title` (VARCHAR(255) NOT NULL):**
    *   **Kiểu dữ liệu:** `VARCHAR(255)` là độ dài tiêu chuẩn cho các tiêu đề hoặc tên ngắn.
    *   **Ràng buộc:** `NOT NULL` vì tiêu đề là thông tin quan trọng để hiển thị cho người dùng.
    *   **Mục đích:** Lưu tiêu đề của video, thường dùng để hiển thị cho người dùng và đặt tên file gợi ý khi tải xuống.
4.  **`author` (VARCHAR(100)):**
    *   **Kiểu dữ liệu:** `VARCHAR(100)` đủ cho hầu hết tên kênh/tác giả.
    *   **Ràng buộc:** Có thể là `NULL` nếu thông tin tác giả không lấy được hoặc không quan trọng.
    *   **Mục đích:** Lưu tên người tải lên video hoặc tên kênh.
5.  **`file_path` (VARCHAR(255) NOT NULL):**
    *   **Kiểu dữ liệu:** `VARCHAR(255)`.
    *   **Ràng buộc:** `NOT NULL`.
    *   **Mục đích:** **Cực kỳ quan trọng:** Cột này *không* nên lưu đường dẫn tuyệt đối trên hệ thống file (ví dụ: `/var/www/app/temp/xyz.mp3`). Thay vào đó, nó thường lưu chính giá trị `id` của file (UUID) hoặc một định danh duy nhất khác. Phía backend sẽ sử dụng giá trị này kết hợp với đường dẫn thư mục tạm (`app.storage.temp-dir` trong cấu hình) để xây dựng đường dẫn đầy đủ khi cần truy cập file (ví dụ: `Paths.get(tempDir).resolve(file.getFilePath() + ".mp3")`). Cách này giúp ứng dụng linh hoạt hơn khi thay đổi vị trí lưu trữ file.
6.  **`file_size` (BIGINT NOT NULL):**
    *   **Kiểu dữ liệu:** `BIGINT` (số nguyên 64-bit) để lưu kích thước file lớn (tính bằng byte). `INTEGER` (32-bit) có thể không đủ cho các file MP3 dài.
    *   **Ràng buộc:** `NOT NULL`.
    *   **Mục đích:** Lưu trữ kích thước chính xác của file MP3 sau khi chuyển đổi. Thông tin này hữu ích để hiển thị cho người dùng hoặc để trình duyệt ước tính thời gian tải.
7.  **`duration` (VARCHAR(10)):**
    *   **Kiểu dữ liệu:** `VARCHAR(10)`.
    *   **Ràng buộc:** Có thể là `NULL`.
    *   **Mục đích:** Lưu trữ thời lượng của video/audio dưới dạng chuỗi đã định dạng (ví dụ: "10:35", "01:15:22"). Dễ dàng hiển thị trực tiếp. Một lựa chọn khác là lưu dưới dạng số nguyên (tổng số giây) và định dạng ở phía ứng dụng khi cần.
8.  **`thumbnail_url` (VARCHAR(255)):**
    *   **Kiểu dữ liệu:** `VARCHAR(255)` đủ cho hầu hết các URL.
    *   **Ràng buộc:** Có thể là `NULL`.
    *   **Mục đích:** Lưu URL của ảnh thumbnail video gốc, dùng để hiển thị cho người dùng.
9.  **`created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP):**
    *   **Kiểu dữ liệu:** `TIMESTAMP WITH TIME ZONE`. Lưu trữ cả ngày giờ và thông tin múi giờ. Rất quan trọng để tránh nhầm lẫn thời gian nếu server hoặc người dùng ở các múi giờ khác nhau.
    *   **Ràng buộc:** `DEFAULT CURRENT_TIMESTAMP` tự động gán thời gian hiện tại của CSDL khi một bản ghi mới được tạo mà không cần chỉ định giá trị này từ ứng dụng.
    *   **Mục đích:** Ghi lại thời điểm yêu cầu chuyển đổi được tạo hoặc hoàn thành (tùy logic).
10. **`expires_at` (TIMESTAMP WITH TIME ZONE NOT NULL):**
    *   **Kiểu dữ liệu:** `TIMESTAMP WITH TIME ZONE`.
    *   **Ràng buộc:** `NOT NULL`. Thời điểm hết hạn là thông tin bắt buộc để cơ chế dọn dẹp hoạt động.
    *   **Mục đích:** Xác định thời điểm file MP3 không còn hợp lệ và có thể bị xóa khỏi bộ nhớ tạm. Giá trị này thường được tính bằng `created_at` + khoảng thời gian lưu trữ (ví dụ: 24 giờ).
11. **`download_count` (INTEGER DEFAULT 0):**
    *   **Kiểu dữ liệu:** `INTEGER` đủ để đếm số lượt tải.
    *   **Ràng buộc:** `DEFAULT 0` đảm bảo giá trị mặc định là 0 khi tạo bản ghi mới.
    *   **Mục đích:** Theo dõi mức độ phổ biến của file hoặc phục vụ cho việc giới hạn (nếu có). Cần được tăng lên mỗi khi có lượt tải thành công.
12. **`status` (VARCHAR(20) DEFAULT 'PENDING'):**
    *   **Kiểu dữ liệu:** `VARCHAR(20)`.
    *   **Ràng buộc:** `DEFAULT 'PENDING'` đặt trạng thái ban đầu khi yêu cầu mới được tạo. `CONSTRAINT chk_status` đảm bảo rằng chỉ các giá trị được liệt kê (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) mới được chấp nhận, giúp duy trì tính nhất quán dữ liệu.
    *   **Mục đích:** Theo dõi trạng thái của quá trình chuyển đổi:
        *   `PENDING`: Yêu cầu đã được nhận nhưng chưa bắt đầu xử lý.
        *   `PROCESSING`: Quá trình tải và/hoặc chuyển đổi đang diễn ra.
        *   `COMPLETED`: Quá trình chuyển đổi thành công, file MP3 đã sẵn sàng.
        *   `FAILED`: Quá trình chuyển đổi gặp lỗi.
13. **`error_message` (TEXT):**
    *   **Kiểu dữ liệu:** `TEXT` cho phép lưu trữ các thông báo lỗi dài, chi tiết mà không bị giới hạn độ dài như `VARCHAR`.
    *   **Ràng buộc:** Có thể là `NULL` nếu không có lỗi.
    *   **Mục đích:** Lưu thông tin chi tiết về lỗi xảy ra trong quá trình xử lý (nếu `status` là `FAILED`), giúp cho việc gỡ lỗi.

**Indices trên bảng `files`:**

*   **`CREATE INDEX idx_files_video_id ON files(video_id);`**
    *   **Mục đích:** Tăng tốc độ tìm kiếm các bản ghi file dựa trên `video_id`. Hữu ích khi kiểm tra xem một video đã được xử lý trước đó chưa.
*   **`CREATE INDEX idx_files_expires_at ON files(expires_at);`**
    *   **Mục đích:** Tăng tốc độ truy vấn tìm kiếm các file đã hết hạn (`WHERE expires_at < NOW()`). Rất quan trọng cho tác vụ dọn dẹp file định kỳ.
*   **`CREATE INDEX idx_files_status ON files(status);`**
    *   **Mục đích:** Tăng tốc độ tìm kiếm các file theo trạng thái cụ thể (ví dụ: tìm tất cả các file `PROCESSING` hoặc `FAILED`).

**III. Chi tiết Bảng `downloads` (Tùy chọn)**

Bảng này dùng để ghi lại log chi tiết của từng lượt tải xuống. Nó không bắt buộc cho chức năng cốt lõi (tải file) nhưng hữu ích cho việc phân tích, thống kê, hoặc triển khai các tính năng nâng cao như giới hạn lượt tải theo IP/người dùng.

```sql
CREATE TABLE downloads (
    id VARCHAR(36) PRIMARY KEY,          -- Khóa chính, dùng UUID
    user_id VARCHAR(36),                -- ID người dùng (nếu có hệ thống login)
    file_id VARCHAR(36) NOT NULL REFERENCES files(id), -- Khóa ngoại trỏ đến file được tải
    ip_address VARCHAR(45),             -- Địa chỉ IP của người tải
    user_agent TEXT,                    -- Thông tin trình duyệt/client
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm tải xuống
);
```

**Giải thích chi tiết từng cột của bảng `downloads`:**

1.  **`id` (VARCHAR(36) PRIMARY KEY):**
    *   Khóa chính duy nhất cho mỗi bản ghi lịch sử tải xuống, sử dụng UUID.
2.  **`user_id` (VARCHAR(36)):**
    *   Lưu ID của người dùng đã đăng nhập thực hiện tải xuống.
    *   Có thể là `NULL` nếu ứng dụng không yêu cầu đăng nhập hoặc lượt tải được thực hiện bởi khách truy cập ẩn danh.
    *   Cần có bảng `users` riêng nếu muốn lưu thông tin chi tiết về người dùng.
3.  **`file_id` (VARCHAR(36) NOT NULL REFERENCES files(id)):**
    *   **Ràng buộc:** `NOT NULL` và `REFERENCES files(id)` định nghĩa đây là một khóa ngoại (Foreign Key).
    *   **Mục đích:** Liên kết bản ghi tải xuống này với bản ghi `file` tương ứng trong bảng `files`. Ràng buộc khóa ngoại đảm bảo rằng không thể có bản ghi `downloads` nào trỏ đến một `file` không tồn tại, giúp duy trì sự toàn vẹn dữ liệu.
4.  **`ip_address` (VARCHAR(45)):**
    *   Lưu địa chỉ IP của client thực hiện yêu cầu tải xuống.
    *   `VARCHAR(45)` đủ để chứa cả địa chỉ IPv4 và IPv6.
    *   Hữu ích cho việc phân tích địa lý, phát hiện lạm dụng hoặc giới hạn lượt tải từ cùng một IP.
5.  **`user_agent` (TEXT):**
    *   Lưu chuỗi User-Agent mà trình duyệt hoặc client gửi lên.
    *   Có thể chứa thông tin về trình duyệt, hệ điều hành, loại thiết bị.
    *   Hữu ích cho việc phân tích thói quen người dùng hoặc xác định các bot.
6.  **`downloaded_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP):**
    *   Ghi lại thời điểm chính xác khi lượt tải xuống xảy ra (thường là khi server bắt đầu gửi file).
    *   Sử dụng `TIMESTAMP WITH TIME ZONE` và `DEFAULT CURRENT_TIMESTAMP`.

**Indices trên bảng `downloads`:**

*   **`CREATE INDEX idx_downloads_file_id ON downloads(file_id);`**
    *   **Mục đích:** Tăng tốc độ tìm kiếm tất cả các lượt tải xuống cho một file cụ thể (ví dụ: để tính tổng lượt tải hoặc xem lịch sử tải của một file).
*   **`CREATE INDEX idx_downloads_user_id ON downloads(user_id);`**
    *   **Mục đích:** Tăng tốc độ tìm kiếm tất cả các lượt tải xuống được thực hiện bởi một người dùng cụ thể (nếu có hệ thống user).

**IV. Mối quan hệ giữa các bảng**

*   Có một mối quan hệ **Một-Nhiều (One-to-Many)** giữa bảng `files` và bảng `downloads`.
    *   Một bản ghi trong bảng `files` (một file MP3) có thể có nhiều bản ghi liên quan trong bảng `downloads` (nhiều lượt tải xuống cho file đó).
    *   Mối quan hệ này được thiết lập thông qua khóa ngoại `file_id` trong bảng `downloads` tham chiếu đến khóa chính `id` trong bảng `files`.

**V. Chiến lược Cập nhật Schema**

*   Cấu hình `spring.jpa.hibernate.ddl-auto: update` trong `application.yml` cho phép Hibernate tự động cố gắng cập nhật cấu trúc bảng trong CSDL để khớp với định nghĩa Entity trong mã Java khi ứng dụng khởi động.
    *   **Ưu điểm:** Tiện lợi trong quá trình phát triển, không cần viết script SQL thủ công cho mỗi thay đổi nhỏ.
    *   **Nhược điểm (Rất quan trọng):** **Không an toàn cho môi trường production.** Nó có thể gây mất dữ liệu hoặc thay đổi schema không mong muốn. Ví dụ, đổi tên cột có thể khiến Hibernate xóa cột cũ và tạo cột mới, làm mất dữ liệu cột đó.
    *   **Khuyến nghị cho Production:** Sử dụng các công cụ quản lý migration CSDL chuyên dụng như **Flyway** hoặc **Liquibase**. Các công cụ này cho phép bạn viết các script SQL hoặc XML/YAML để quản lý các thay đổi schema một cách tường minh, có phiên bản và an toàn hơn nhiều.

**VI. Kết luận về Thiết kế Database**

Thiết kế cơ sở dữ liệu này khá chuẩn mực và đáp ứng tốt các yêu cầu cốt lõi của ứng dụng MommyDownload:

*   Lưu trữ đầy đủ thông tin cần thiết về file MP3.
*   Theo dõi trạng thái xử lý một cách rõ ràng.
*   Hỗ trợ cơ chế dọn dẹp file hết hạn hiệu quả thông qua cột `expires_at` và index tương ứng.
*   Sử dụng kiểu dữ liệu phù hợp (UUID, BIGINT, TIMESTAMP WITH TIME ZONE).
*   Có các chỉ mục (indices) cần thiết để tối ưu hiệu suất truy vấn.
*   Cung cấp tùy chọn để mở rộng với bảng `downloads` cho các tính năng nâng cao.
*   Thiết kế này là nền tảng tốt, có thể dễ dàng mở rộng trong tương lai nếu cần thêm các tính năng mới.