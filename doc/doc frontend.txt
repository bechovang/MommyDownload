### Mô tả chi tiết Frontend cho ứng dụng MommyDownload

## 1. Kiến trúc tổng thể

### 1.1. Công nghệ sử dụng

- **Framework**: Next.js 14+ (App Router)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (dựa trên Radix UI)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: Next.js App Router
- **Fetching Data**: SWR hoặc React Query
- **Animations**: Framer Motion (tùy chọn)
- **Icons**: Lucide React


### 1.2. Cấu trúc thư mục

```plaintext
/app
  /page.tsx                 # Trang chính
  /layout.tsx               # Layout chung
  /globals.css              # CSS toàn cục
  /api                      # API Routes (nếu sử dụng Next.js API)
/components
  /ui                       # Các component UI cơ bản từ shadcn
  /theme-provider.tsx       # Provider cho theme
  /youtube-form.tsx         # Form nhập URL YouTube
  /loading-indicator.tsx    # Hiển thị trạng thái đang tải
  /video-result.tsx         # Hiển thị kết quả video
  /download-button.tsx      # Nút tải xuống
  /recent-downloads.tsx     # Danh sách tải xuống gần đây
  /instructions.tsx         # Hướng dẫn sử dụng
  /theme-toggle.tsx         # Nút chuyển đổi theme
/hooks
  /use-youtube-converter.ts # Custom hook xử lý logic chuyển đổi
  /use-local-storage.ts     # Custom hook để lưu trữ dữ liệu vào localStorage
/lib
  /utils.ts                 # Các hàm tiện ích
  /types.ts                 # Định nghĩa các kiểu dữ liệu
  /constants.ts             # Các hằng số
/public
  /images                   # Hình ảnh tĩnh
  /fonts                    # Font chữ (nếu không sử dụng Google Fonts)
```

## 2. Giao diện người dùng (UI)

### 2.1. Trang chính

#### 2.1.1. Header

- **Logo**: "MommyDownload" với font chữ lớn, đậm, màu xanh dương (`#0284c7`)
- **Tagline**: "Tải nhạc từ YouTube dễ dàng và nhanh chóng" - font nhỏ hơn, màu xám (`#64748b`)
- **Background**: Màu nền trắng (`#ffffff`) cho theme sáng, xanh đậm (`#0f172a`) cho theme tối
- **Border-bottom**: Viền mỏng màu xanh nhạt (`#bae6fd`) để phân tách với nội dung chính


#### 2.1.2. Form nhập URL

- **Container**: Card với viền dày 2px, màu xanh nhạt (`#bae6fd`), góc bo tròn 12px, đệm 32px
- **Label**: "Nhập đường dẫn video YouTube:" - font size 20px, font-weight 500, màu đen (`#1e293b`)
- **Input field**:

- Kích thước lớn (chiều cao 60px)
- Font size 18px
- Viền dày 2px, màu xanh nhạt (`#bae6fd`)
- Placeholder: "[https://www.youtube.com/watch?v=](https://www.youtube.com/watch?v=)..."
- Focus state: Viền màu xanh đậm (`#0284c7`), shadow nhẹ



- **Nút Dán**:

- Vị trí: Bên phải trong input field
- Icon: Clipboard
- Màu nền trắng (`#ffffff`), viền xanh nhạt (`#bae6fd`)
- Hover: Màu nền xanh nhạt (`#e0f2fe`)



- **Nút Chuyển đổi**:

- Kích thước lớn (chiều cao 64px)
- Font size 20px, font-weight 600
- Màu nền xanh dương (`#0284c7`), chữ trắng
- Icon: Music ở bên trái
- Hover: Màu nền đậm hơn (`#0369a1`)
- Hiệu ứng: Nhấn xuống nhẹ khi click
- Chiều rộng 100% của container





#### 2.1.3. Trạng thái đang tải

- **Container**: Padding 40px, màu nền xanh nhạt (`#f0f9ff`), viền xanh nhạt (`#bae6fd`), góc bo tròn 12px
- **Spinner**: Vòng tròn quay với animation, kích thước 64px, màu xanh dương (`#0284c7`)
- **Thông báo**: "Đang xử lý video, vui lòng đợi..." - font size 18px, màu xám đậm (`#475569`)
- **Thông báo phụ**: Hiển thị trạng thái hiện tại ("Đang tải thông tin video...", "Đang chuyển đổi video sang MP3...")


#### 2.1.4. Thông báo lỗi

- **Container**: Padding 24px, màu nền đỏ nhạt (`#fee2e2`), viền đỏ (`#fca5a5`), góc bo tròn 12px
- **Icon**: AlertCircle màu đỏ (`#ef4444`)
- **Thông báo**: Font size 18px, màu đỏ đậm (`#b91c1c`)


#### 2.1.5. Kết quả video

- **Container**: Padding 24px, màu nền xanh lá nhạt (`#f0fdf4`), viền xanh lá (`#86efac`), góc bo tròn 12px
- **Thumbnail**: Kích thước 96px x 96px, góc bo tròn 8px, viền mỏng
- **Thông tin video**:

- Tiêu đề: Font size 20px, font-weight 600, màu đen (`#1e293b`)
- Tác giả & Thời lượng: Font size 16px, màu xám (`#64748b`)



- **Nút Tải xuống**:

- Kích thước lớn (chiều cao 64px)
- Font size 20px, font-weight 600
- Màu nền xanh lá (`#16a34a`), chữ trắng
- Icon: Download ở bên trái
- Hover: Màu nền đậm hơn (`#15803d`)
- Chiều rộng 100% của container





### 2.2. Phần Hướng dẫn

- **Container**: Card với viền dày 2px, màu xanh nhạt (`#bae6fd`), góc bo tròn 12px, đệm 32px
- **Tiêu đề**: "Hướng dẫn sử dụng:" - font size 24px, font-weight 700, màu xanh dương (`#0284c7`)
- **Icon**: InfoIcon màu xanh dương (`#0284c7`)
- **Danh sách**:

- Kiểu: Danh sách có số thứ tự (ol)
- Font size: 18px
- Line height: 1.8
- Màu chữ: Đen (`#1e293b`) cho theme sáng, trắng (`#f8fafc`) cho theme tối
- Khoảng cách giữa các mục: 12px
- Padding left: 32px để số thứ tự hiển thị rõ ràng





### 2.3. Phần Tải xuống gần đây

- **Container**: Card với viền dày 2px, màu xanh nhạt (`#bae6fd`), góc bo tròn 12px, đệm 32px
- **Tiêu đề**: "Đã tải gần đây" - font size 24px, font-weight 700, màu xanh dương (`#0284c7`)
- **Icon**: History màu xanh dương (`#0284c7`)
- **Trường hợp không có dữ liệu**:

- Thông báo: "Chưa có bài hát nào được tải xuống"
- Font size: 18px
- Màu chữ: Xám (`#64748b`)
- Căn giữa



- **Danh sách tải xuống**:

- Mỗi mục: Card với padding 16px, màu nền xám nhạt (`#f8fafc`), viền mỏng, góc bo tròn 8px
- Thumbnail: Kích thước 64px x 64px, góc bo tròn 4px
- Thông tin bài hát:

- Tiêu đề: Font size 18px, font-weight 500, màu đen (`#1e293b`)
- Tác giả: Font size 14px, màu xám (`#64748b`)



- Nút "Tải lại":

- Kích thước vừa phải
- Màu nền xanh lá (`#16a34a`), chữ trắng
- Icon: Download
- Hover: Màu nền đậm hơn (`#15803d`)



- Hover state: Màu nền thay đổi nhẹ (`#f1f5f9`)
- Khoảng cách giữa các mục: 16px





### 2.4. Nút chuyển đổi theme

- **Vị trí**: Góc dưới bên phải màn hình, cách lề 32px
- **Kích thước**: 64px x 64px
- **Hình dạng**: Hình tròn
- **Màu nền**: Trắng (`#ffffff`) cho theme sáng, xanh đậm (`#0f172a`) cho theme tối
- **Viền**: 2px màu xanh nhạt (`#bae6fd`)
- **Icon**: Moon (theme sáng) hoặc Sun (theme tối)
- **Màu icon**: Xanh dương (`#0284c7`) cho Moon, vàng (`#facc15`) cho Sun
- **Shadow**: Shadow nhẹ để nổi bật
- **Hover**: Scale lên 1.05 và shadow đậm hơn
- **Transition**: Mượt mà 0.2s


### 2.5. Footer

- **Vị trí**: Dưới cùng của trang
- **Padding**: 16px
- **Màu chữ**: Xám (`#64748b`)
- **Font size**: 14px
- **Nội dung**:

- Copyright: "© [năm hiện tại] MommyDownload. Tất cả các quyền được bảo lưu."
- Thông báo: "Chỉ sử dụng cho mục đích cá nhân. Tôn trọng bản quyền của tác giả."
- Icon: ExternalLink





## 3. Responsive Design

### 3.1. Desktop (>= 1024px)

- Container chính: Max-width 1200px, căn giữa
- Khoảng cách giữa các phần: 32px
- Font size lớn như mô tả ở trên


### 3.2. Tablet (768px - 1023px)

- Container chính: Max-width 100%, padding 24px
- Khoảng cách giữa các phần: 24px
- Font size giảm 10-15%
- Nút chuyển đổi theme: Kích thước giảm xuống 56px


### 3.3. Mobile (< 768px)

- Container chính: Max-width 100%, padding 16px
- Khoảng cách giữa các phần: 16px
- Font size giảm 20-25%
- Nút chuyển đổi theme: Kích thước giảm xuống 48px
- Layout cho kết quả video và danh sách tải xuống:

- Chuyển từ layout ngang sang layout dọc
- Thumbnail và thông tin video xếp dọc
- Nút "Tải lại" trong danh sách tải xuống: Chiều rộng 100%





## 4. Quản lý State

### 4.1. State chính

```typescript
// URL YouTube người dùng nhập vào
const [youtubeUrl, setYoutubeUrl] = useState<string>("")

// Trạng thái đang tải
const [isLoading, setIsLoading] = useState<boolean>(false)

// Thông báo lỗi
const [error, setError] = useState<string | null>(null)

// Hiển thị kết quả
const [showResult, setShowResult] = useState<boolean>(false)

// Thông tin video
const [videoInfo, setVideoInfo] = useState<VideoInfo>({
  title: "Tên video",
  author: "Không rõ",
  duration: "00:00",
  thumbnail: "/placeholder.svg?height=120&width=120",
  fileId: ""
})

// Danh sách tải xuống gần đây
const [recentDownloads, setRecentDownloads] = useState<DownloadItem[]>([])

// Theme hiện tại
const { theme, setTheme } = useTheme()

// Thông báo đang tải
const [loadingMessage, setLoadingMessage] = useState<string>("Đang tải thông tin video...")
```

### 4.2. Kiểu dữ liệu

```typescript
// lib/types.ts
export interface VideoInfo {
  title: string
  author: string
  duration: string
  thumbnail: string
  fileId: string
}

export interface DownloadItem {
  url: string
  title: string
  author: string
  thumbnail: string
  date: string
}
```

### 4.3. Custom Hooks

#### 4.3.1. useYoutubeConverter

```typescript
// hooks/use-youtube-converter.ts
import { useState } from 'react'
import { VideoInfo } from '@/lib/types'

export function useYoutubeConverter() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loadingMessage, setLoadingMessage] = useState<string>("")
  const [fileId, setFileId] = useState<string | null>(null)

  const getVideoInfo = async (url: string) => {
    setIsLoading(true)
    setLoadingMessage("Đang tải thông tin video...")
    setError(null)
    
    try {
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể lấy thông tin video')
      }
      
      const data = await response.json()
      setVideoInfo(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
      return null
    }
  }

  const convertVideo = async (url: string) => {
    try {
      setLoadingMessage("Đang chuyển đổi video sang MP3...")
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể chuyển đổi video')
      }
      
      const data = await response.json()
      setFileId(data.fileId)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (fileId: string) => {
    window.location.href = `/api/download/${fileId}`
  }

  return {
    isLoading,
    error,
    videoInfo,
    loadingMessage,
    fileId,
    getVideoInfo,
    convertVideo,
    downloadFile,
  }
}
```

#### 4.3.2. useLocalStorage

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State để lưu trữ giá trị
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Khởi tạo state từ localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(error)
    }
  }, [key])

  // Hàm để cập nhật giá trị trong state và localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Cho phép giá trị là một hàm
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Lưu vào state
      setStoredValue(valueToStore)
      
      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

## 5. Xử lý sự kiện

### 5.1. Xử lý nhập URL

```typescript
const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setYoutubeUrl(e.target.value)
}

// Cho phép nhấn Enter để chuyển đổi
const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleConvert()
  }
}
```

### 5.2. Xử lý nút Dán

```typescript
const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    setYoutubeUrl(text)
  } catch (err) {
    setError('Không thể truy cập clipboard. Vui lòng dán thủ công.')
  }
}
```

### 5.3. Xử lý chuyển đổi video

```typescript
const handleConvert = async () => {
  if (!youtubeUrl) {
    setError('Vui lòng nhập đường dẫn YouTube!')
    return
  }

  if (!isYouTubeUrl(youtubeUrl)) {
    setError('Đường dẫn không hợp lệ. Vui lòng nhập đường dẫn YouTube!')
    return
  }

  setIsLoading(true)
  setError(null)
  setShowResult(false)

  try {
    // Lấy thông tin video
    const info = await getVideoInfo(youtubeUrl)
    if (!info) return

    // Chuyển đổi video
    const result = await convertVideo(youtubeUrl)
    if (!result) return

    // Thêm vào danh sách tải xuống gần đây
    const newDownload = {
      url: youtubeUrl,
      title: info.title,
      author: info.author,
      thumbnail: info.thumbnail,
      date: new Date().toISOString()
    }

    const updatedDownloads = [newDownload, ...recentDownloads].slice(0, 10)
    setRecentDownloads(updatedDownloads)
    localStorage.setItem('recentDownloads', JSON.stringify(updatedDownloads))

    setShowResult(true)
  } catch (error) {
    setError('Không thể xử lý video này. Vui lòng thử lại sau.')
  } finally {
    setIsLoading(false)
  }
}
```

### 5.4. Xử lý tải xuống

```typescript
const handleDownload = () => {
  if (videoInfo.fileId) {
    downloadFile(videoInfo.fileId)
  }
}
```

### 5.5. Xử lý tải lại từ danh sách gần đây

```typescript
const handleDownloadAgain = (item: DownloadItem) => {
  setYoutubeUrl(item.url)
  handleConvert()
}
```

### 5.6. Xử lý chuyển đổi theme

```typescript
const toggleTheme = () => {
  setTheme(theme === 'dark' ? 'light' : 'dark')
}
```

## 6. Hiệu ứng và Animations

### 6.1. Hiệu ứng chuyển đổi theme

```css
/* Trong globals.css */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
```

### 6.2. Hiệu ứng nút

```css
.btn {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}
```

### 6.3. Hiệu ứng loading

```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1.2s linear infinite;
}
```

### 6.4. Hiệu ứng xuất hiện cho kết quả

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-container {
  animation: fadeIn 0.3s ease-out;
}
```

## 7. Accessibility (A11y)

### 7.1. Semantic HTML

- Sử dụng các thẻ HTML đúng ngữ cảnh: `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<nav>`
- Sử dụng `<label>` cho các trường input với thuộc tính `htmlFor`
- Sử dụng `<button>` cho các phần tử có thể click


### 7.2. ARIA attributes

- `aria-label` cho các nút không có text
- `aria-describedby` để liên kết input với thông báo lỗi
- `aria-live="polite"` cho khu vực hiển thị thông báo và kết quả
- `aria-busy="true"` khi đang tải


### 7.3. Keyboard navigation

- Tất cả các phần tử tương tác đều có thể focus
- Tab index theo thứ tự logic
- Xử lý sự kiện keyboard (Enter, Space) cho các nút


### 7.4. Screen reader support

- Sử dụng `<span className="sr-only">` cho text chỉ hiển thị với screen reader
- Alt text cho tất cả các hình ảnh
- Thông báo trạng thái rõ ràng


## 8. Internationalization (i18n)

### 8.1. Cấu trúc

```plaintext
/lib
  /i18n
    /vi.ts    # Tiếng Việt (mặc định)
    /en.ts    # Tiếng Anh
    /index.ts # Export các hàm và hook
```

### 8.2. Ví dụ file ngôn ngữ

```typescript
// lib/i18n/vi.ts
export default {
  appName: 'MommyDownload',
  tagline: 'Tải nhạc từ YouTube dễ dàng và nhanh chóng',
  inputLabel: 'Nhập đường dẫn video YouTube:',
  inputPlaceholder: 'https://www.youtube.com/watch?v=...',
  pasteButton: 'Dán',
  convertButton: 'Chuyển đổi sang MP3',
  downloadButton: 'Tải nhạc về máy',
  loading: 'Đang xử lý video, vui lòng đợi...',
  loadingInfo: 'Đang tải thông tin video...',
  loadingConvert: 'Đang chuyển đổi video sang MP3...',
  errorEmptyUrl: 'Vui lòng nhập đường dẫn YouTube!',
  errorInvalidUrl: 'Đường dẫn không hợp lệ. Vui lòng nhập đường dẫn YouTube!',
  errorGeneric: 'Không thể xử lý video này. Vui lòng thử lại sau.',
  instructionsTitle: 'Hướng dẫn sử dụng:',
  instructions: [
    'Mở video YouTube bạn muốn tải nhạc',
    'Sao chép đường dẫn từ thanh địa chỉ trình duyệt (hoặc dùng nút chia sẻ trên YouTube và sao chép liên kết)',
    'Dán đường dẫn vào ô trên (có thể dùng nút "Dán")',
    'Nhấn nút "Chuyển đổi sang MP3"',
    'Đợi hệ thống xử lý',
    'Khi hiện nút "Tải nhạc về máy", nhấn vào đó để lưu file'
  ],
  recentDownloadsTitle: 'Đã tải gần đây',
  noRecentDownloads: 'Chưa có bài hát nào được tải xuống',
  downloadAgain: 'Tải lại',
  author: 'Tác giả',
  duration: 'Thời lượng',
  footer: {
    copyright: '© {year} MommyDownload. Tất cả các quyền được bảo lưu.',
    disclaimer: 'Chỉ sử dụng cho mục đích cá nhân. Tôn trọng bản quyền của tác giả.'
  },
  themeToggle: 'Chuyển đổi chế độ sáng/tối'
}
```

### 8.3. Hook sử dụng i18n

```typescript
// lib/i18n/index.ts
import { useCallback } from 'react'
import vi from './vi'
import en from './en'

const languages = {
  vi,
  en
}

export type Language = keyof typeof languages
export type TranslationKey = keyof typeof vi

export function useTranslation(lang: Language = 'vi') {
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = languages[lang][key] || key
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          text = text.replace(`{${key}}`, String(value))
        })
      }
      
      return text
    },
    [lang]
  )
  
  return { t, lang }
}
```

## 9. Performance Optimization

### 9.1. Code Splitting

- Sử dụng dynamic imports của Next.js để chia nhỏ bundle
- Lazy load các component không cần thiết ngay lập tức


```typescript
// Lazy load component
const VideoResult = dynamic(() => import('@/components/video-result'), {
  loading: () => <div className="h-40 animate-pulse bg-gray-200 rounded-lg"></div>
})
```

### 9.2. Memoization

- Sử dụng `useMemo` và `useCallback` để tránh re-render không cần thiết


```typescript
// Memoize danh sách tải xuống gần đây
const recentDownloadsList = useMemo(() => {
  return recentDownloads.slice(0, 5).map((item, index) => (
    <DownloadItem 
      key={index} 
      item={item} 
      onDownloadAgain={handleDownloadAgain} 
    />
  ))
}, [recentDownloads, handleDownloadAgain])
```

### 9.3. Image Optimization

- Sử dụng Next.js Image component với các thuộc tính tối ưu
- Sử dụng kích thước phù hợp cho từng thiết bị


```typescript
<Image
  src={thumbnail || "/placeholder.svg"}
  alt={title}
  width={96}
  height={96}
  className="rounded-md object-cover"
  priority={false}
  loading="lazy"
/>
```

### 9.4. Debouncing

- Debounce các sự kiện như nhập liệu để tránh xử lý quá nhiều


```typescript
// Debounce URL validation
const debouncedValidateUrl = useCallback(
  debounce((url: string) => {
    if (url && !isYouTubeUrl(url)) {
      setError('Đường dẫn không hợp lệ. Vui lòng nhập đường dẫn YouTube!')
    } else {
      setError(null)
    }
  }, 500),
  []
)

// Sử dụng trong handleUrlChange
const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const url = e.target.value
  setYoutubeUrl(url)
  debouncedValidateUrl(url)  => {
  const url = e.target.value
  setYoutubeUrl(url)
  debouncedValidateUrl(url)
}
```

## 10. Testing

### 10.1. Unit Testing

- Sử dụng Jest và React Testing Library
- Test các component riêng lẻ
- Test các custom hooks


```typescript
// __tests__/components/youtube-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { YouTubeForm } from '@/components/youtube-form'

describe('YouTubeForm', () => {
  it('renders the form correctly', () => {
    render(<YouTubeForm onSubmit={jest.fn()} />)
    
    expect(screen.getByLabelText(/nhập đường dẫn video youtube/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dán/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chuyển đổi/i })).toBeInTheDocument()
  })
  
  it('validates empty URL', () => {
    render(<YouTubeForm onSubmit={jest.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /chuyển đổi/i }))
    
    expect(screen.getByText(/vui lòng nhập đường dẫn/i)).toBeInTheDocument()
  })
  
  it('validates invalid URL', () => {
    render(<YouTubeForm onSubmit={jest.fn()} />)
    
    const input = screen.getByLabelText(/nhập đường dẫn video youtube/i)
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /chuyển đổi/i }))
    
    expect(screen.getByText(/đường dẫn không hợp lệ/i)).toBeInTheDocument()
  })
})
```

### 10.2. Integration Testing

- Test luồng hoạt động đầy đủ
- Mock API calls


```typescript
// __tests__/integration/conversion-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import MommyDownload from '@/app/page'

const server = setupServer(
  rest.get('/api/video-info', (req, res, ctx) => {
    return res(
      ctx.json({
        title: 'Test Video',
        author: 'Test Author',
        duration: '03:45',
        thumbnail: '/placeholder.svg',
        videoId: 'test123'
      })
    )
  }),
  
  rest.post('/api/convert', (req, res, ctx) => {
    return res(
      ctx.json({
        fileId: 'file123',
        title: 'Test Video',
        size: 1024000,
        duration: '03:45',
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Conversion Flow', () => {
  it('completes the full conversion flow', async () => {
    render(<MommyDownload />)
    
    // Nhập URL
    const input = screen.getByLabelText(/nhập đường dẫn video youtube/i)
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=test123' } })
    
    // Click nút chuyển đổi
    fireEvent.click(screen.getByRole('button', { name: /chuyển đổi/i }))
    
    // Kiểm tra trạng thái loading
    expect(screen.getByText(/đang xử lý video/i)).toBeInTheDocument()
    
    // Đợi kết quả
    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument()
      expect(screen.getByText(/test author/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tải nhạc/i })).toBeInTheDocument()
    })
    
    // Kiểm tra nút tải xuống
    expect(screen.getByRole('button', { name: /tải nhạc/i })).toBeInTheDocument()
  })
})
```

### 10.3. E2E Testing

- Sử dụng Cypress để test toàn bộ ứng dụng
- Test các tương tác người dùng thực tế


```typescript
// cypress/e2e/download-flow.cy.ts
describe('Download Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Mock API responses
    cy.intercept('GET', '/api/video-info*', {
      statusCode: 200,
      body: {
        title: 'Cypress Test Video',
        author: 'Cypress Author',
        duration: '03:45',
        thumbnail: '/placeholder.svg',
        videoId: 'cypress123'
      }
    })
    
    cy.intercept('POST', '/api/convert', {
      statusCode: 200,
      body: {
        fileId: 'cypress-file-123',
        title: 'Cypress Test Video',
        size: 1024000,
        duration: '03:45',
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      }
    })
  })
  
  it('should complete the download flow', () => {
    // Nhập URL
    cy.findByLabelText(/nhập đường dẫn video youtube/i)
      .type('https://www.youtube.com/watch?v=cypress123')
    
    // Click nút chuyển đổi
    cy.findByRole('button', { name: /chuyển đổi/i }).click()
    
    // Kiểm tra trạng thái loading
    cy.findByText(/đang xử lý video/i).should('be.visible')
    
    // Đợi kết quả
    cy.findByText('Cypress Test Video').should('be.visible')
    cy.findByText(/cypress author/i).should('be.visible')
    
    // Kiểm tra nút tải xuống
    cy.findByRole('button', { name: /tải nhạc/i }).should('be.visible')
    
    // Mock download
    cy.intercept('GET', '/api/download/*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="Cypress Test Video.mp3"'
      },
      body: new ArrayBuffer(1024)
    })
    
    // Click nút tải xuống
    cy.findByRole('button', { name: /tải nhạc/i }).click()
  })
})
```

## 11. Deployment

### 11.1. Vercel Deployment

- Tự động triển khai từ GitHub repository
- Cấu hình trong `vercel.json`:


```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/download/(.*)",
      "dest": "/api/download/[fileId].js",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://mommydownload.vercel.app"
  }
}
```

### 11.2. Environment Variables

- `.env.local` cho phát triển cục bộ
- Vercel Environment Variables cho production


```plaintext
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
YOUTUBE_API_KEY=your_youtube_api_key
```

## 12. Mã nguồn đầy đủ cho các component chính

### 12.1. YouTubeForm Component

```typescriptreact
// components/youtube-form.tsx
import { useState } from 'react'
import { Clipboard, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface YouTubeFormProps {
  onSubmit: (url: string) => void
  isLoading: boolean
  error: string | null
}

export function YouTubeForm({ onSubmit, isLoading, error }: YouTubeFormProps) {
  const [url, setUrl] = useState('')

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch (err) {
      console.error('Không thể truy cập clipboard:', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <label htmlFor="youtube-url" className="block text-xl font-medium text-gray-800 dark:text-gray-200">
          Nhập đường dẫn video YouTube:
        </label>
        <div className="relative">
          <Input
            id="youtube-url"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-28 text-lg py-6 border-2 border-blue-200 dark:border-blue-700"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePaste}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-base h-10 border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800"
            disabled={isLoading}
          >
            <Clipboard className="h-5 w-5 mr-2" />
            Dán
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 p-6">
          <AlertCircle className="h-6 w-6" />
          <AlertDescription className="text-lg ml-2">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 transition-all py-8 text-xl"
        disabled={isLoading}
      >
        <Music className="mr-3 h-6 w-6" />
        Chuyển đổi sang MP3
      </Button>
    </form>
  )
}
```

### 12.2. LoadingIndicator Component

```typescriptreact
// components/loading-indicator.tsx
export function LoadingIndicator({ message }: { message: string }) {
  return (
    <div className="py-10 text-center space-y-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-xl">{message}</p>
    </div>
  )
}
```

### 12.3. VideoResult Component

```typescriptreact
// components/video-result.tsx
import Image from 'next/image'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoInfo } from '@/lib/types'

interface VideoResultProps {
  videoInfo: VideoInfo
  onDownload: () => void
}

export function VideoResult({ videoInfo, onDownload }: VideoResultProps) {
  const { title, author, duration, thumbnail } = videoInfo

  return (
    <div className="mt-6 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800">
      <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
        <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt="Video thumbnail"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            Tác giả: {author} | Thời lượng: {duration}
          </p>
        </div>
      </div>
      <Button 
        onClick={onDownload} 
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-8 text-xl"
      >
        <Download className="mr-3 h-6 w-6" />
        Tải nhạc về máy
      </Button>
    </div>
  )
}
```

### 12.4. RecentDownloads Component

```typescriptreact
// components/recent-downloads.tsx
import Image from 'next/image'
import { Download, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DownloadItem } from '@/lib/types'

interface RecentDownloadsProps {
  items: DownloadItem[]
  onDownloadAgain: (item: DownloadItem) => void
}

export function RecentDownloads({ items, onDownloadAgain }: RecentDownloadsProps) {
  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-2xl text-gray-800 dark:text-gray-200">Đã tải gần đây</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-6 text-lg">
          Chưa có bài hát nào được tải xuống
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <Image
                    src={item.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-lg line-clamp-1">{item.title}</div>
                  <div className="text-base text-gray-600 dark:text-gray-400">{item.author}</div>
                </div>
              </div>
              <Button
                onClick={() => onDownloadAgain(item)}
                className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-6"
              >
                <Download className="h-5 w-5 mr-2" />
                Tải lại
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 12.5. Instructions Component

```typescriptreact
// components/instructions.tsx
import { InfoIcon } from 'lucide-react'

export function Instructions() {
  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <InfoIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-2xl text-gray-800 dark:text-gray-200">Hướng dẫn sử dụng:</h3>
      </div>
      <ol className="list-decimal pl-8 space-y-3 text-lg text-gray-700 dark:text-gray-300">
        <li>Mở video YouTube bạn muốn tải nhạc</li>
        <li>
          Sao chép đường dẫn từ thanh địa chỉ trình duyệt (hoặc dùng nút chia sẻ trên YouTube và sao chép liên
          kết)
        </li>
        <li>Dán đường dẫn vào ô trên (có thể dùng nút "Dán")</li>
        <li>Nhấn nút "Chuyển đổi sang MP3"</li>
        <li>Đợi hệ thống xử lý</li>
        <li>Khi hiện nút "Tải nhạc về máy", nhấn vào đó để lưu file</li>
      </ol>
    </div>
  )
}
```

### 12.6. ThemeToggle Component

```typescriptreact
// components/theme-toggle.tsx
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full h-16 w-16 bg-white dark:bg-slate-800 shadow-lg border-2 border-blue-200 dark:border-blue-800 fixed bottom-8 right-8"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Chuyển đổi chế độ sáng/tối"
    >
      {theme === 'dark' ? (
        <Sun className="h-8 w-8 text-yellow-500" />
      ) : (
        <Moon className="h-8 w-8 text-blue-700" />
      )}
    </Button>
  )
}
```

## 13. Tổng kết

Frontend của ứng dụng MommyDownload được thiết kế với sự tập trung vào trải nghiệm người dùng, đặc biệt là người dùng lớn tuổi. Giao diện đơn giản, rõ ràng với các phần tử lớn, dễ nhìn và dễ tương tác. Ứng dụng sử dụng công nghệ hiện đại như Next.js và Tailwind CSS để đảm bảo hiệu suất tốt và khả năng mở rộng.

Các tính năng chính bao gồm:

- Nhập URL YouTube và chuyển đổi sang MP3
- Hiển thị thông tin video trước khi tải xuống
- Lưu trữ lịch sử tải xuống gần đây
- Hỗ trợ chế độ sáng/tối
- Giao diện đáp ứng trên nhiều thiết bị
- Tối ưu hóa cho người dùng lớn tuổi với font chữ lớn và tương phản cao


Frontend được thiết kế để tích hợp liền mạch với backend thông qua các API endpoints đã định nghĩa, tạo nên một ứng dụng hoàn chỉnh và dễ sử dụng cho việc tải nhạc từ YouTube.