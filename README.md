# MommyDownload Project Documentation

## Overview

MommyDownload is a web application designed to download audio from YouTube videos. It consists of a Next.js frontend and a Python (Flask) backend. The application allows users to paste a YouTube URL, fetch video information, convert the video to MP3, and download the audio file.

## Project Structure

The project is organized into two main directories:

-   `frontend/`: Contains the Next.js application that provides the user interface.
-   `backend/`: Contains the Flask API that handles video information fetching and downloading using `yt-dlp`.

Additionally, there is a root `README.md` that outlines the initial development plan and a `doc/` directory for further documentation.

## Frontend (`frontend/`)

The frontend is built with Next.js and TypeScript. Key technologies and libraries include:

-   **Next.js:** React framework for server-side rendering and static site generation.
-   **TypeScript:** Superset of JavaScript for type safety.
-   **Tailwind CSS:** Utility-first CSS framework for styling.
-   **shadcn/ui:** Collection of re-usable UI components.
-   **Lucide React:** Icon library.
-   **next-themes:** For light/dark mode theming.

### Key Components and Files:

-   `app/page.tsx`: The main page component where users interact with the application.
-   `components/ui/`: Contains UI components from shadcn/ui.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `next.config.mjs`: Next.js configuration.
-   `package.json`: Lists project dependencies and scripts.

### Running the Frontend:

1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install` (or `pnpm install` / `yarn install`)
3.  Run the development server: `npm run dev`
    The application will typically be available at `http://localhost:3000`.

## Backend (`backend/`)

The backend is a Python Flask application. It uses `yt-dlp` to interact with YouTube.

### Key Components and Files:

-   `app.py`: The main Flask application file, defining API endpoints.
-   `requirements.txt`: Lists Python dependencies.
-   Likely includes routes for:
    -   Fetching video information (e.g., `/api/video-info`)
    -   Downloading/converting video to audio (e.g., `/api/download`)

### Running the Backend:

1.  Navigate to the `backend` directory: `cd backend`
2.  Create and activate a virtual environment (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # For Linux/macOS
    # venv\Scripts\activate    # For Windows
    ```
3.  Install dependencies: `pip install -r requirements.txt`
4.  Run the Flask application: `python app.py` or `flask run`
    The API will typically be available at `http://localhost:5000`.

## Getting Started (Development)

1.  **Clone the repository.**
2.  **Set up the Backend:**
    -   Follow the steps in the "Running the Backend" section.
3.  **Set up the Frontend:**
    -   Follow the steps in the "Running the Frontend" section.
4.  Ensure both frontend and backend servers are running.
5.  Open your browser and navigate to the frontend URL (usually `http://localhost:3000`).

## Further Development and Maintenance

-   **Dark Mode:** The frontend already has a dark mode implementation using `next-themes` and Tailwind CSS `dark:` variants.
-   **Error Handling:** The frontend includes basic error display for invalid URLs or processing issues.
-   **Recent Downloads:** The application stores a list of recent downloads in `localStorage`.
-   **API Integration:** The frontend makes API calls to the backend for video processing. The existing code simulates these calls. For a full implementation, these simulated calls need to be replaced with actual `fetch` requests to the backend endpoints.
-   **`yt-dlp` Updates:** `yt-dlp` should be kept up-to-date in the backend to ensure compatibility with YouTube.

This document provides a starting point for understanding and maintaining the MommyDownload project.
Refer to the code and the original `README.md` in the root directory for more detailed planning information. 