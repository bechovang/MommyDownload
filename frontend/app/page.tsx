"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Download, Music, Clipboard, History, InfoIcon, ExternalLink, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggleButton } from "@/components/ThemeToggleButton"

interface DownloadItem {
  url: string
  title: string
  author: string
  thumbnail: string
  date: string
}

export default function MommyDownload() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [videoInfo, setVideoInfo] = useState({
    title: "Tên video",
    author: "Không rõ",
    duration: "00:00",
    thumbnail: "/placeholder.svg?height=120&width=120",
    fileId: "",
  })
  const [recentDownloads, setRecentDownloads] = useState<DownloadItem[]>([])
  const [loadingMessage, setLoadingMessage] = useState("Đang tải thông tin video...")

  useEffect(() => {
    // Load recent downloads from localStorage
    const savedDownloads = localStorage.getItem("recentDownloads")
    if (savedDownloads) {
      setRecentDownloads(JSON.parse(savedDownloads))
    }
  }, [])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setYoutubeUrl(text)
    } catch (err) {
      setError("Không thể truy cập clipboard. Vui lòng dán thủ công.")
    }
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const handleConvert = async () => {
    if (!youtubeUrl) {
      setError("Vui lòng nhập đường dẫn YouTube!")
      return
    }

    if (!isYouTubeUrl(youtubeUrl)) {
      setError("Đường dẫn không hợp lệ. Vui lòng nhập đường dẫn YouTube!")
      return
    }

    setIsLoading(true)
    setLoadingMessage("Đang tải thông tin video...")
    setError(null)
    setShowResult(false)

    try {
      // Simulate API call for video info
      // In a real app, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockVideoInfo = {
        title: "Bài hát mẫu từ YouTube",
        author: "Ca sĩ nổi tiếng",
        duration: "03:45",
        thumbnail: "/placeholder.svg?height=120&width=120",
        fileId: "sample-file-id-123",
      }

      setVideoInfo(mockVideoInfo)
      setLoadingMessage("Đang chuyển đổi video sang MP3...")

      // Simulate conversion API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Add to recent downloads
      const newDownload = {
        url: youtubeUrl,
        title: mockVideoInfo.title,
        author: mockVideoInfo.author,
        thumbnail: mockVideoInfo.thumbnail,
        date: new Date().toISOString(),
      }

      const updatedDownloads = [newDownload, ...recentDownloads].slice(0, 10)
      setRecentDownloads(updatedDownloads)
      localStorage.setItem("recentDownloads", JSON.stringify(updatedDownloads))

      setShowResult(true)
    } catch (error) {
      setError("Không thể xử lý video này. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // In a real app, this would redirect to the download API
    console.log(`Downloading file with ID: ${videoInfo.fileId}`)
    // window.location.href = `/api/download/${videoInfo.fileId}`
  }

  const handleDownloadAgain = (item: DownloadItem) => {
    setYoutubeUrl(item.url)
    handleConvert()
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between text-center pb-2 border-b border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 p-4">
            <div className="flex flex-col">
              <CardTitle className="text-4xl font-bold text-blue-700 dark:text-blue-300">MommyDownload</CardTitle>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-xl">Tải nhạc từ YouTube dễ dàng và nhanh chóng</p>
            </div>
            <ThemeToggleButton />
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            <div className="space-y-4">
              <label htmlFor="youtube-url" className="block text-xl font-medium text-gray-800 dark:text-gray-200">
                Nhập đường dẫn video YouTube:
              </label>
              <div className="relative">
                <Input
                  id="youtube-url"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleConvert()}
                  className="pr-28 text-lg py-6 border-2 border-blue-200 dark:border-blue-700"
                />
                <Button
                  variant="outline"
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-base h-10 border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-800"
                >
                  <Clipboard className="h-5 w-5 mr-2" />
                  Dán
                </Button>
              </div>
            </div>

            <Button
              onClick={handleConvert}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 transition-all py-8 text-xl"
            >
              <Music className="mr-3 h-6 w-6" />
              Chuyển đổi sang MP3
            </Button>

            {isLoading && (
              <div className="py-10 text-center space-y-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xl">{loadingMessage}</p>
              </div>
            )}

            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 p-6"
              >
                <AlertCircle className="h-6 w-6" />
                <AlertDescription className="text-lg ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {showResult && (
              <div className="mt-6 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800">
                <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
                  <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                    <Image
                      src={videoInfo.thumbnail || "/placeholder.svg"}
                      alt="Video thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{videoInfo.title}</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                      Tác giả: {videoInfo.author} | Thời lượng: {videoInfo.duration}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDownload}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-8 text-xl"
                >
                  <Download className="mr-3 h-6 w-6" />
                  Tải nhạc về máy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-8">
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
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-2xl text-gray-800 dark:text-gray-200">Đã tải gần đây</h3>
            </div>

            {recentDownloads.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-6 text-lg">
                Chưa có bài hát nào được tải xuống
              </p>
            ) : (
              <div className="space-y-4">
                {recentDownloads.slice(0, 5).map((item, index) => (
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
                      onClick={() => handleDownloadAgain(item)}
                      className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-6"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Tải lại
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="mt-16 text-center text-base text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} MommyDownload. Tất cả các quyền được bảo lưu.</p>
        <p className="mt-2">
          <ExternalLink className="inline h-4 w-4 mr-1" />
          Chỉ sử dụng cho mục đích cá nhân. Tôn trọng bản quyền của tác giả.
        </p>
      </footer>
    </div>
  )
}
