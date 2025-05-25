# MommyDownload - YouTube Audio Downloader

MommyDownload is a web application designed to make downloading audio from YouTube videos simple and fast. Users can paste a YouTube URL, fetch video information, and download the audio track as an MP3 file.

## Features

*   **YouTube URL Processing:** Input any valid YouTube video URL.
*   **Video Information Display:** Shows video title, author/uploader, duration, and thumbnail.
*   **MP3 Conversion & Download:** Downloads the audio track and converts it to MP3 format using `yt-dlp` and `ffmpeg`.
*   **Dark Mode:** User-friendly interface with a toggle for dark and light themes.
*   **Recent Downloads History:** Keeps a list of recently processed videos in `localStorage` for quick re-downloads (frontend simulation, full backend history could be a future addition).
*   **Responsive Design:** Built with Tailwind CSS for a good experience on various devices.

## Tech Stack

*   **Frontend:**
    *   Next.js (React Framework)
    *   TypeScript
    *   Tailwind CSS (for styling)
    *   shadcn/ui (UI components)
    *   Lucide React (icons)
    *   `next-themes` (for theming)
*   **Backend:**
    *   Python
    *   Flask (web framework)
    *   `yt-dlp` (for YouTube interaction)
    *   `ffmpeg` (for audio conversion - must be installed separately on the server)
    *   Flask-CORS (for Cross-Origin Resource Sharing)

## Project Structure

```
.
├── backend/        # Python Flask API
│   ├── app.py      # Main Flask application
│   ├── config.py   # Configuration settings
│   ├── requirements.txt # Python dependencies
│   ├── routes/     # API route blueprints (e.g., video_info.py, download.py)
│   ├── utils/      # Utility modules (e.g., youtube_handler.py, file_manager.py)
│   └── logs/       # Log files (ensure this is in .gitignore if not already)
│   └── downloads/  # Default directory for downloaded files (ensure this is in .gitignore)
├── frontend/       # Next.js Application
│   ├── app/        # Next.js App Router (pages, layout, etc.)
│   ├── components/ # React components (UI elements, ThemeToggleButton)
│   ├── public/     # Static assets
│   ├── lib/        # Utility functions for frontend
│   ├── styles/     # Global styles
│   ├── next.config.mjs
│   ├── package.json
│   └── tailwind.config.ts
├── doc/            # Project documentation (like this README)
├── README.md       # This file
└── .gitignore      # Specifies intentionally untracked files that Git should ignore
```

## Setup and Installation

### Prerequisites

*   Node.js (v18 or newer recommended for Next.js)
*   npm, pnpm, or yarn (package managers for Node.js)
*   Python (v3.8 or newer recommended)
*   `pip` (Python package installer)
*   `ffmpeg`: **Must be installed globally on your system and accessible in the PATH.** `yt-dlp` relies on it for audio conversion.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a Python virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or pnpm install / yarn install
    ```
3.  **(Optional) Environment Variables:**
    Create a `.env.local` file in the `frontend` directory to specify the backend API URL if it's different from the default:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

## Running the Application

1.  **Start the Backend Server:**
    *   Ensure you are in the `backend` directory and your virtual environment is activated.
    *   Run: `python app.py`
    *   The backend API should now be running (typically at `http://localhost:5000`).

2.  **Start the Frontend Development Server:**
    *   Ensure you are in the `frontend` directory.
    *   Run: `npm run dev`
    *   The frontend application should now be accessible in your browser (typically at `http://localhost:3000`).

## API Endpoints (Backend)

*   `GET /api/health`: Health check for the backend.
*   `POST /api/video-info`: Accepts a YouTube URL and returns video metadata (title, duration, thumbnail, etc.).
*   `POST /api/download`: Accepts a YouTube URL, downloads the audio, converts it to MP3, and sends the file for download.

## Future Development Ideas

Here are some potential features and improvements that could be added to MommyDownload:

1.  **Download Queue System:**
    *   Implement a robust queue (e.g., using Celery with Redis or RabbitMQ) to handle multiple download requests concurrently without overloading the server.
    *   This would allow users to submit multiple URLs and have them processed in the background.

2.  **Automatic Cleanup of `downloads/` Directory:**
    *   While the `file_manager.py` has a `cleanup_old_files` function, integrate its execution more formally (e.g., a scheduled task or on startup) to periodically remove old files from the `downloads/` folder to save server space.

3.  **Queue Priority (e.g., Smaller Files First):**
    *   If a queue system is implemented, add priority levels. For instance, downloads estimated to be smaller (based on video duration or format info if available before full download) could be prioritized to improve perceived responsiveness for users.

4.  **Real-time Queue Notifications & Progress:**
    *   Use WebSockets (e.g., Flask-SocketIO) or Server-Sent Events (SSE) to provide real-time feedback to the user on the frontend about their download's position in the queue and its current progress (e.g., "Downloading...", "Converting to MP3...", "Ready!").

5.  **Enhanced Format & Quality Selection:**
    *   Allow users to select different audio formats (beyond just MP3) or quality settings if desired, passing these preferences to `yt-dlp`.

6.  **Playlist Downloading:**
    *   Support for downloading entire YouTube playlists as individual MP3 files.

7.  **User Accounts & Download History:**
    *   Implement user authentication to allow users to save their download history persistently on the server.

8.  **Admin Dashboard:**
    *   A simple dashboard to view server status, current queue length, recent errors, etc.

9.  **Dockerization:**
    *   Containerize both frontend and backend applications for easier deployment and scaling.

10. **Improved Error Handling and Reporting:**
    *   More granular error messages on the frontend based on specific backend error codes.

11. **Rate Limiting:**
    *   Implement rate limiting on API endpoints to prevent abuse.

## Contributing

(Details can be added here if the project becomes open to contributions.)

## License

(Specify a license if desired, e.g., MIT License.) 