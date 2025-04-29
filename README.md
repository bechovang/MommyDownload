# MommyDownload - Modern & User-Centric YouTube to MP3 Converter ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other relevant badges: CI/CD status, code coverage, etc. -->
<!-- [![Build Status](https://img.shields.io/...)](...) -->

**🚀 Live Demo: [Link to Your Deployed Application]** (Essential - Deploy it!)

MommyDownload is a **full-stack web application** meticulously crafted to provide a seamless and intuitive experience for downloading audio from YouTube videos as MP3 files. This project showcases the implementation of modern web technologies, robust backend architecture, and a strong focus on user experience and performance.

**Tagline:** _Effortless YouTube audio downloads, built with cutting-edge tech._

## Table of Contents

- [🌟 Key Features & Highlights](#-key-features--highlights)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏛️ System Architecture](#️-system-architecture)
- [⚙️ Getting Started](#️-getting-started)
- [📡 Backend API Design](#-backend-api-design)
- [🗄️ Database Design](#️-database-design)
- [🧪 Comprehensive Testing Strategy](#-comprehensive-testing-strategy)
- [☁️ Deployment](#️-deployment)
- [💡 Future Enhancements](#-future-enhancements)
- [📄 License](#-license)
- [📫 Contact](#-contact)

## 🌟 Key Features & Highlights

*   **Modern Frontend Experience:** Built with **Next.js 14+ (App Router)** and **React**, leveraging Server Components and Client Components for optimal performance and developer experience. Styled with **Tailwind CSS** and accessible **shadcn/ui** components for a clean, responsive, and visually appealing UI.
*   **Robust Backend Processing:** Powered by **Spring Boot 3+** and **Java 17+**, providing a scalable and maintainable RESTful API. Utilizes **FFmpeg** via a Java wrapper (`net.bramp.ffmpeg`) for efficient server-side audio extraction and MP3 conversion.
*   **Performance Optimizations:**
    *   **Backend Caching:** Implements **Spring Cache (Caffeine)** to cache YouTube video metadata, significantly reducing external API calls and improving response times.
    *   **Backend Rate Limiting:** Protects the API from abuse using a Guava-based `RateLimiter`.
    *   **Frontend Optimizations:** Leverages Next.js features like **Code Splitting**, **Lazy Loading** (for non-critical components), and the **`next/image`** component for optimized image delivery. React `useMemo` and `useCallback` are used for memoization.
*   **User-Centric Design:**
    *   Intuitive UI flow, specifically designed with simplicity in mind (catering well to less tech-savvy users).
    *   **Instant Video Preview:** Fetches and displays video thumbnail, title, author, and duration before conversion.
    *   **Elegant Light/Dark Mode:** Seamless theme switching powered by `next-themes` and Tailwind CSS, enhancing visual comfort and accessibility, with preference persisted in Local Storage.
    *   **Recent Downloads History:** Utilizes **Local Storage** via a custom hook (`useLocalStorage`) to keep track of recently converted items for quick re-access.
    *   **Clear Feedback:** Provides distinct loading states (with specific messages like "Fetching info...", "Converting...") and user-friendly error messages.
*   **Intelligent File Management:** The backend includes a **scheduled task (`@Scheduled`)** to automatically clean up expired MP3 files from temporary storage based on a configurable expiration time (`expires_at` in the database).
*   **Thoughtful Database Design:** Employs **PostgreSQL** with a well-structured schema:
    *   Uses **UUIDs** as primary keys for decentralized ID generation.
    *   Utilizes `TIMESTAMP WITH TIME ZONE` for accurate time tracking across different regions.
    *   Implements `CHECK` constraints for data integrity (`status` field).
    *   Includes necessary **database indexes** (`video_id`, `expires_at`, `status`) for efficient querying, especially for cleanup tasks and duplicate checks.
*   **Full-Stack TypeScript & Java:** Demonstrates proficiency in both strongly-typed frontend (TypeScript) and backend (Java) development.
*   **Containerized & Deployment-Ready:** Backend and Database are containerized using **Docker** and orchestrated with **Docker Compose** for consistent environments and simplified deployment. Frontend is optimized for deployment on platforms like **Vercel**.
*   **Comprehensive Testing:** Employs a multi-layered testing strategy (Unit, Integration, E2E) using **Jest, React Testing Library, MSW, JUnit, Mockito, and Cypress** to ensure code quality and application stability.
*   **Accessibility (A11y) Conscious:** Adheres to accessibility best practices using semantic HTML, ARIA attributes, and keyboard navigation support.

## 🛠️ Technology Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/> 
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/> 
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/> 
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/> 
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot"/> 
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17+"/> 
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/> 
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/> 
  <img src="https://img.shields.io/badge/FFmpeg-007800?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="FFmpeg"/> 
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest"/> 
  <img src="https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white" alt="Testing Library"/> 
  <img src="https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=69D3A7" alt="Cypress"/> 
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

**Frontend:**

*   Framework: Next.js 14+ (App Router)
*   Language: TypeScript
*   UI: React, shadcn/ui, Tailwind CSS
*   State Management: React Hooks, Custom Hooks
*   Data Fetching: Native Fetch API (Easily adaptable to SWR/React Query)
*   Icons: Lucide React

**Backend:**

*   Framework: Spring Boot 3+ (Web, Data JPA, Validation, Cache)
*   Language: Java 17+
*   ORM: Hibernate (via Spring Data JPA)
*   Build: Maven
*   Video/Audio Processing: `java-video-downloader`, `net.bramp.ffmpeg`
*   Caching: Spring Cache (Caffeine)

**Database:**

*   System: PostgreSQL 13+

**DevOps & Deployment:**

*   Containerization: Docker, Docker Compose
*   Hosting: Vercel (Frontend), [Your Backend Hosting Choice, e.g., AWS, GCP, Azure, Render]

**Testing:**

*   Unit/Integration: Jest, React Testing Library, MSW, JUnit 5, Mockito
*   E2E: Cypress

## 🏛️ System Architecture

MommyDownload follows a standard **Client-Server architecture**:

1.  **Frontend (Client - Next.js):** Responsible for the user interface, client-side interactions, state management, and communicating with the backend via REST API calls. Built using a component-based structure with custom hooks for reusable logic.
2.  **Backend (Server - Spring Boot):** Provides the RESTful API endpoints, handles core business logic (YouTube interaction, FFmpeg conversion, file storage), manages database interactions, and ensures security and performance (caching, rate limiting). Adheres to a layered architecture:
    *   **Controller:** Handles HTTP requests, performs input validation, delegates to services.
    *   **Service:** Encapsulates business logic, orchestrates tasks, manages transactions.
    *   **Repository:** Abstracts data access using Spring Data JPA.
    *   **Model/Entity:** Represents database tables.
    *   **DTOs:** Facilitates data transfer between layers and API boundaries.
3.  **Database (PostgreSQL):** Persists application state, primarily storing metadata about converted MP3 files.

*(Optional: Insert a simple architecture diagram image here)*
`[Simple Architecture Diagram]`

## ⚙️ Getting Started

**Prerequisites:**

*   Node.js (v18+) & npm/yarn
*   Java JDK (v17+) & Maven
*   Docker & Docker Compose
*   FFmpeg (must be installed on the machine running the backend, or within the Docker environment if customized)

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone [https://your-repo-url.git]
    cd mommy-download
    ```

2.  **Run Backend & Database (Docker Compose):**
    *   Navigate to the backend directory (or root, where `docker-compose.yml` is).
    *   Configure necessary environment variables if needed (e.g., in `.env` file used by docker-compose or directly in `docker-compose.yml`).
    *   Execute:
        ```bash
        docker-compose up -d
        ```
        This starts PostgreSQL and the Spring Boot backend (available at `http://localhost:8080` by default).

3.  **Run Frontend:**
    *   Navigate to the frontend directory.
    *   Install dependencies: `npm install` or `yarn install`.
    *   Create a `.env.local` file if needed to configure `NEXT_PUBLIC_API_URL` (defaults usually point to `http://localhost:8080/api` for local backend).
    *   Start the development server: `npm run dev` or `yarn dev`.
        The frontend will be available at `http://localhost:3000`.

4.  **Access:** Open `http://localhost:3000` in your browser.

## 📡 Backend API Design

The backend exposes the following core RESTful endpoints:

*   `GET /api/video/info?url={youtubeUrl}`: Fetches video metadata (title, author, duration, thumbnail). Utilizes caching. Returns `VideoInfoDTO`.
*   `POST /api/convert`: Accepts `{ "url": "youtubeUrl", "quality": "..." }`. Orchestrates audio download and MP3 conversion. Persists file metadata to the database. Returns `ConvertResponseDTO` with `fileId`.
*   `GET /api/download/{fileId}`: Streams the converted MP3 file for download based on its `fileId`. Optionally increments the download counter.

## 🗄️ Database Design

*   **Primary Table: `files`**: Stores comprehensive metadata for each conversion.
    *   Uses `id` (UUID) as the primary key.
    *   Tracks `video_id`, `title`, `author`, `file_path` (the unique `fileId`), `file_size`, `duration`, `thumbnail_url`.
    *   Employs `TIMESTAMP WITH TIME ZONE` for `created_at` and crucial `expires_at` columns for lifecycle management.
    *   Includes a `status` column (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) with a `CHECK` constraint.
    *   Indexed on `video_id`, `expires_at`, and `status` for query performance.
*   **Optional Table: `downloads`**: Logs individual download events (linking to `files` via foreign key, storing IP, user agent, timestamp).

## 🧪 Comprehensive Testing Strategy

Quality is ensured through multiple testing layers:

*   **Unit Tests:**
    *   Frontend: Jest & React Testing Library for individual components and custom hooks.
    *   Backend: JUnit 5 & Mockito for service and utility classes.
*   **Integration Tests:**
    *   Frontend: Jest, RTL, and MSW (Mock Service Worker) to test component interactions and mocked API calls.
    *   Backend: Spring Boot Test (`@SpringBootTest`), potentially with H2 (in-memory DB) or Testcontainers, to test interactions between layers (Service-Repository-DB).
*   **End-to-End (E2E) Tests:**
    *   Cypress simulates real user scenarios across the entire application stack (FE interacting with mock or live BE).

## ☁️ Deployment

*   **Frontend:** Optimized for **Vercel**, enabling seamless CI/CD from a Git repository.
*   **Backend & Database:** Containerized via **Docker** and **Docker Compose**, making it portable and deployable to various platforms supporting containers (e.g., AWS EC2/ECS, Google Cloud Run/GKE, Azure App Service, Heroku Docker, Render).

## 💡 Future Enhancements

*   **Asynchronous Processing:** Implement a message queue (RabbitMQ/Kafka) for handling conversions asynchronously, improving API responsiveness and fault tolerance.
*   **User Authentication:** Integrate Spring Security for user accounts and potentially premium features.
*   **Cloud Storage:** Store generated MP3 files in cloud object storage (AWS S3, Google Cloud Storage) instead of local server storage for better scalability and reliability.
*   **Monitoring & Observability:** Integrate Spring Boot Actuator, Prometheus, and Grafana for application health monitoring and performance insights.
*   **Internationalization (i18n):** Add multi-language support to the frontend.
*   **Format/Quality Selection:** Allow users to choose MP3 bitrate or potentially other audio formats (AAC, OGG).

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 📫 Contact

*   **Author:** [Your Name]
*   **Email:** [Your Email Address]
*   **GitHub:** [Your GitHub Profile URL]
*   **LinkedIn:** [Your LinkedIn Profile URL (Optional)]

---

Thank you for checking out MommyDownload! Feel free to reach out with any questions or feedback.
