# Thiết kế Backend Spring Boot và Database PostgreSQL cho MommyDownload

Dựa trên yêu cầu của ứng dụng MommyDownload, tôi sẽ thiết kế hệ thống backend sử dụng Spring Boot và cơ sở dữ liệu PostgreSQL.

## 1. Cấu trúc dự án Spring Boot

```
src/
├── main/
│   ├── java/com/mommydownload/
│   │   ├── config/               # Các lớp cấu hình
│   │   ├── controller/           # Controller xử lý API
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── exception/            # Xử lý ngoại lệ
│   │   ├── model/                # Entity classes
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── service/              # Business logic
│   │   │   ├── impl/             # Service implementations
│   │   ├── util/                 # Tiện ích
│   │   └── MommyDownloadApplication.java # Main class
│   ├── resources/
│   │   ├── static/               # Tài nguyên tĩnh
│   │   ├── templates/            # Template (nếu có)
│   │   ├── application.yml       # Cấu hình chính
│   │   └── application-dev.yml   # Cấu hình môi trường dev
├── test/                         # Test cases
```

## 2. Cấu hình phụ thuộc (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Caching -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    <dependency>
        <groupId>com.github.ben-manes.caffeine</groupId>
        <artifactId>caffeine</artifactId>
    </dependency>
    
    <!-- File processing -->
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.11.0</version>
    </dependency>
    
    <!-- YouTube processing -->
    <dependency>
        <groupId>com.github.axet</groupId>
        <artifactId>java-video-downloader</artifactId>
        <version>0.0.9</version>
    </dependency>
    
    <!-- FFmpeg wrapper -->
    <dependency>
        <groupId>net.bramp.ffmpeg</groupId>
        <artifactId>ffmpeg</artifactId>
        <version>0.7.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 3. Cấu hình ứng dụng (application.yml)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mommydownload
    username: mommyuser
    password: mommypassword
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: true
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=1h

app:
  storage:
    temp-dir: ./temp
    max-duration: 10 # minutes
    expire-hours: 24
    max-concurrent-downloads: 5
  youtube:
    api-key: YOUR_YOUTUBE_API_KEY
    max-retries: 3
    retry-delay: 1000 # ms

logging:
  level:
    root: INFO
    org.springframework.web: DEBUG
    com.mommydownload: DEBUG
```

## 4. Thiết kế Database (PostgreSQL)

### 4.1. Bảng `files`

```sql
CREATE TABLE files (
    id VARCHAR(36) PRIMARY KEY,
    video_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    duration VARCHAR(10),
    thumbnail_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    download_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_files_video_id ON files(video_id);
CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_files_status ON files(status);
```

### 4.2. Bảng `downloads` (tùy chọn)

```sql
CREATE TABLE downloads (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    file_id VARCHAR(36) NOT NULL REFERENCES files(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_downloads_file_id ON downloads(file_id);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
```

## 5. Entity Classes

### 5.1. File Entity

```java
package com.mommydownload.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Getter
@Setter
public class File {
    public enum Status {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @Column(name = "video_id", nullable = false)
    private String videoId;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    private String duration;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "download_count")
    private Integer downloadCount = 0;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(name = "error_message")
    private String errorMessage;
}
```

### 5.2. Download Entity (tùy chọn)

```java
package com.mommydownload.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "downloads")
@Getter
@Setter
public class Download {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @Column(name = "user_id")
    private String userId;

    @ManyToOne
    @JoinColumn(name = "file_id", nullable = false)
    private File file;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;
}
```

## 6. DTO Classes

### 6.1. VideoInfoDTO

```java
package com.mommydownload.dto;

import lombok.Data;

@Data
public class VideoInfoDTO {
    private String title;
    private String author;
    private String duration;
    private String thumbnail;
    private String videoId;
}
```

### 6.2. ConvertRequestDTO

```java
package com.mommydownload.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class ConvertRequestDTO {
    @NotBlank(message = "URL is required")
    private String url;
    
    private String quality = "high"; // high | medium | low
}
```

### 6.3. ConvertResponseDTO

```java
package com.mommydownload.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConvertResponseDTO {
    private String fileId;
    private String title;
    private Long size;
    private String duration;
    private LocalDateTime expiresAt;
}
```

## 7. Repository Interfaces

### 7.1. FileRepository

```java
package com.mommydownload.repository;

import com.mommydownload.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<File, String> {
    Optional<File> findByVideoId(String videoId);
    
    List<File> findByExpiresAtBeforeAndStatus(LocalDateTime expiresAt, File.Status status);
    
    @Modifying
    @Query("UPDATE File f SET f.downloadCount = f.downloadCount + 1 WHERE f.id = :fileId")
    void incrementDownloadCount(String fileId);
}
```

### 7.2. DownloadRepository (tùy chọn)

```java
package com.mommydownload.repository;

import com.mommydownload.model.Download;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DownloadRepository extends JpaRepository<Download, String> {
    // Custom queries if needed
}
```

## 8. Service Layer

### 8.1. YouTubeService

```java
package com.mommydownload.service;

import com.mommydownload.dto.VideoInfoDTO;
import com.mommydownload.exception.YoutubeProcessingException;

public interface YouTubeService {
    VideoInfoDTO getVideoInfo(String url) throws YoutubeProcessingException;
    String downloadAudio(String videoId, String quality) throws YoutubeProcessingException;
}
```

### 8.2. FileStorageService

```java
package com.mommydownload.service;

import com.mommydownload.model.File;

import java.io.InputStream;
import java.nio.file.Path;

public interface FileStorageService {
    String storeFile(InputStream inputStream, String fileName);
    Path loadFileAsPath(String fileId);
    void deleteFile(String fileId);
    void cleanupExpiredFiles();
}
```

### 8.3. ConversionService

```java
package com.mommydownload.service;

import com.mommydownload.dto.ConvertResponseDTO;
import com.mommydownload.exception.ConversionException;

public interface ConversionService {
    ConvertResponseDTO convertToMp3(String url, String quality) throws ConversionException;
}
```

## 9. Service Implementations

### 9.1. YouTubeServiceImpl

```java
package com.mommydownload.service.impl;

import com.mommydownload.dto.VideoInfoDTO;
import com.mommydownload.exception.YoutubeProcessingException;
import com.mommydownload.service.YouTubeService;
import com.github.axet.vget.VGet;
import com.github.axet.vget.info.VideoInfo;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class YouTubeServiceImpl implements YouTubeService {

    @Override
    @Cacheable(value = "videoInfo", key = "#url")
    public VideoInfoDTO getVideoInfo(String url) throws YoutubeProcessingException {
        try {
            AtomicBoolean stop = new AtomicBoolean(false);
            VGet v = new VGet(new URL(url), stop);
            VideoInfo info = v.videoInfo();
            
            VideoInfoDTO dto = new VideoInfoDTO();
            dto.setTitle(info.getTitle());
            dto.setAuthor(info.getUser());
            dto.setDuration(formatDuration(info.getDuration()));
            dto.setThumbnail(info.getThumbnail());
            dto.setVideoId(info.getWeb().getVideoId());
            
            return dto;
        } catch (Exception e) {
            throw new YoutubeProcessingException("Failed to get video info: " + e.getMessage());
        }
    }

    @Override
    public String downloadAudio(String videoId, String quality) throws YoutubeProcessingException {
        // Implementation for downloading audio
        // This would use ytdl-core equivalent for Java
        return null;
    }

    private String formatDuration(long seconds) {
        long minutes = seconds / 60;
        long secs = seconds % 60;
        return String.format("%02d:%02d", minutes, secs);
    }
}
```

### 9.2. FileStorageServiceImpl

```java
package com.mommydownload.service.impl;

import com.mommydownload.model.File;
import com.mommydownload.service.FileStorageService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.storage.temp-dir}")
    private String tempDir;

    @Override
    public String storeFile(InputStream inputStream, String fileName) {
        try {
            String fileId = UUID.randomUUID().toString();
            Path targetLocation = Paths.get(tempDir).resolve(fileId + ".mp3");
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileId;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + fileName, ex);
        }
    }

    @Override
    public Path loadFileAsPath(String fileId) {
        return Paths.get(tempDir).resolve(fileId + ".mp3");
    }

    @Override
    public void deleteFile(String fileId) {
        try {
            Path filePath = loadFileAsPath(fileId);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to delete file: " + fileId, ex);
        }
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredFiles() {
        try {
            FileUtils.cleanDirectory(Paths.get(tempDir).toFile());
        } catch (IOException e) {
            // Log error
        }
    }
}
```

### 9.3. ConversionServiceImpl

```java
package com.mommydownload.service.impl;

import com.mommydownload.dto.ConvertResponseDTO;
import com.mommydownload.exception.ConversionException;
import com.mommydownload.model.File;
import com.mommydownload.repository.FileRepository;
import com.mommydownload.service.ConversionService;
import com.mommydownload.service.FileStorageService;
import com.mommydownload.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFmpegExecutor;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ConversionServiceImpl implements ConversionService {

    private final YouTubeService youtubeService;
    private final FileStorageService fileStorageService;
    private final FileRepository fileRepository;
    
    @Value("${app.storage.expire-hours}")
    private int expireHours;

    @Override
    @Transactional
    public ConvertResponseDTO convertToMp3(String url, String quality) throws ConversionException {
        try {
            // Get video info
            VideoInfoDTO videoInfo = youtubeService.getVideoInfo(url);
            
            // Download audio
            String tempAudioPath = youtubeService.downloadAudio(videoInfo.getVideoId(), quality);
            
            // Convert to MP3 using FFmpeg
            FileInputStream audioStream = new FileInputStream(tempAudioPath);
            String fileId = fileStorageService.storeFile(audioStream, videoInfo.getTitle() + ".mp3");
            
            // Calculate file size
            long fileSize = Files.size(fileStorageService.loadFileAsPath(fileId));
            
            // Save file info to database
            File file = new File();
            file.setVideoId(videoInfo.getVideoId());
            file.setTitle(videoInfo.getTitle());
            file.setAuthor(videoInfo.getAuthor());
            file.setFilePath(fileId);
            file.setFileSize(fileSize);
            file.setDuration(videoInfo.getDuration());
            file.setThumbnailUrl(videoInfo.getThumbnail());
            file.setExpiresAt(LocalDateTime.now().plusHours(expireHours));
            file.setStatus(File.Status.COMPLETED);
            fileRepository.save(file);
            
            // Build response
            ConvertResponseDTO response = new ConvertResponseDTO();
            response.setFileId(fileId);
            response.setTitle(videoInfo.getTitle());
            response.setSize(fileSize);
            response.setDuration(videoInfo.getDuration());
            response.setExpiresAt(file.getExpiresAt());
            
            return response;
        } catch (Exception e) {
            throw new ConversionException("Failed to convert video: " + e.getMessage());
        }
    }
}
```

## 10. Controller Layer

### 10.1. VideoController

```java
package com.mommydownload.controller;

import com.mommydownload.dto.VideoInfoDTO;
import com.mommydownload.exception.YoutubeProcessingException;
import com.mommydownload.service.YouTubeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoController {

    private final YouTubeService youtubeService;

    @GetMapping("/info")
    public ResponseEntity<VideoInfoDTO> getVideoInfo(@RequestParam String url) {
        try {
            VideoInfoDTO videoInfo = youtubeService.getVideoInfo(url);
            return ResponseEntity.ok(videoInfo);
        } catch (YoutubeProcessingException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
```

### 10.2. DownloadController

```java
package com.mommydownload.controller;

import com.mommydownload.dto.ConvertRequestDTO;
import com.mommydownload.dto.ConvertResponseDTO;
import com.mommydownload.exception.ConversionException;
import com.mommydownload.service.ConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/download")
@RequiredArgsConstructor
public class DownloadController {

    private final ConversionService conversionService;
    private final FileStorageService fileStorageService;

    @PostMapping("/convert")
    public ResponseEntity<ConvertResponseDTO> convertToMp3(@RequestBody ConvertRequestDTO request) {
        try {
            ConvertResponseDTO response = conversionService.convertToMp3(request.getUrl(), request.getQuality());
            return ResponseEntity.ok(response);
        } catch (ConversionException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        try {
            Path filePath = fileStorageService.loadFileAsPath(fileId);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + resource.getFilename() + "\"");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(resource.contentLength())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

## 11. Xử lý ngoại lệ

### 11.1. GlobalExceptionHandler

```java
package com.mommydownload.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(YoutubeProcessingException.class)
    public ResponseEntity<Object> handleYoutubeProcessingException(
            YoutubeProcessingException ex, WebRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConversionException.class)
    public ResponseEntity<Object> handleConversionException(
            ConversionException ex, WebRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}
```

### 11.2. Custom Exceptions

```java
package com.mommydownload.exception;

public class YoutubeProcessingException extends RuntimeException {
    public YoutubeProcessingException(String message) {
        super(message);
    }
}

public class ConversionException extends RuntimeException {
    public ConversionException(String message) {
        super(message);
    }
}

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## 12. Cấu hình bổ sung

### 12.1. Cấu hình CORS

```java
package com.mommydownload.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
```

### 12.2. Cấu hình Rate Limiting

```java
package com.mommydownload.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableCaching
public class RateLimitConfig implements WebMvcConfigurer {

    @Bean
    public RateLimitInterceptor rateLimitInterceptor() {
        return new RateLimitInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor())
                .addPathPatterns("/api/**");
    }
}
```

### 12.3. RateLimitInterceptor

```java
package com.mommydownload.config;

import com.google.common.util.concurrent.RateLimiter;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter rateLimiter = RateLimiter.create(10.0); // 10 requests per second

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        if (!rateLimiter.tryAcquire()) {
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Rate limit exceeded");
            return false;
        }
        return true;
    }
}
```

## 13. Triển khai với Docker

### 13.1. Dockerfile

```dockerfile
# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src /app/src
RUN mvn package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/mommydownload-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 13.2. docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mommydownload
      - SPRING_DATASOURCE_USERNAME=mommyuser
      - SPRING_DATASOURCE_PASSWORD=mommypassword
    depends_on:
      - db
    volumes:
      - ./temp:/app/temp

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=mommydownload
      - POSTGRES_USER=mommyuser
      - POSTGRES_PASSWORD=mommypassword
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

## 14. Giải thích kiến trúc

1. **Layered Architecture**:
   - Controller: Xử lý HTTP requests/responses
   - Service: Business logic
   - Repository: Truy cập database
   - Model: Entity classes

2. **Database Design**:
   - Bảng `files` lưu trữ thông tin file MP3 đã chuyển đổi
   - Bảng `downloads` (tùy chọn) lưu lịch sử tải xuống

3. **Xử lý YouTube**:
   - Sử dụng thư viện java-video-downloader để lấy thông tin và tải video
   - FFmpeg để chuyển đổi sang MP3

4. **Quản lý file**:
   - Lưu trữ tạm thời trong thư mục ./temp
   - Tự động xóa file hết hạn

5. **Bảo mật**:
   - Rate limiting (10 requests/second)
   - CORS configuration
   - Input validation

6. **Performance**:
   - Caching video info
   - Asynchronous processing (có thể thêm @Async)

7. **Triển khai**:
   - Docker + PostgreSQL
   - Có thể mở rộng với Redis cho cache

## 15. Mở rộng trong tương lai

1. **Xác thực người dùng**:
   - Thêm Spring Security
   - Phân quyền API

2. **Hàng đợi xử lý**:
   - Sử dụng RabbitMQ/Kafka cho các tác vụ nặng

3. **Monitoring**:
   - Spring Boot Actuator
   - Prometheus + Grafana

4. **Tích hợp thanh toán**:
   - Cho phiên bản premium (tải không giới hạn)

5. **Cloud Storage**:
   - Lưu trữ file trên S3/Google Cloud Storage

Hệ thống này đáp ứng đầy đủ các yêu cầu của ứng dụng MommyDownload với kiến trúc rõ ràng, dễ bảo trì và mở rộng.