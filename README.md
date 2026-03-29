<div align="center"><a name="readme-top"></a>

# tempys

[![GitHub](https://img.shields.io/github/license/cecuchetti/tempys)](https://github.com/cecuchetti/tempys)
[![GitHub stars](https://img.shields.io/github/stars/cecuchetti/tempys)](https://github.com/cecuchetti/tempys)

tempys is a self-hosted temporary file sharing platform. Focused on providing one-time, temporary file and text upload, processing, and sharing services.

A modern file sharing website built with **Vue 3 + Nuxt 4 + Go**, supporting file upload, text sharing, image compression, concurrent processing, instant transfer functionality, and more, featuring a complete sharing management and access control system.

![tempys Platform Overview](/.github/image/0.png)

English | [中文](README-zh.md) | [Español](README-es.md)

</div>

## 🌟 Features

### Core Functionality

🖼️ **High-Performance File Upload** - Supports large file chunked uploads with frontend file hash calculation for instant transfer  
📱 **Responsive Design** - Modern UI based on Tailwind V4 + Reka UI, adapts to various devices  
⚡ **Concurrent Processing** - Uses Web Worker for frontend hash calculation, backend queue system for task processing  
🌐 **Multi-language Support** - Complete internationalization support for English, Chinese (Simplified), and Spanish  
🔗 **Share Management** - Flexible sharing link generation and management system

### File Processing

🔄 **Smart Instant Transfer** - Frontend instant transfer detection based on file hash + file size, avoiding duplicate uploads  
📷 **Image Compression** - Automatic image compression functionality supporting multiple formats  
🖼️ **File Preview** - Supports preview of images, videos, audio, documents, and various file types  
📊 **Upload Statistics** - Real-time display of upload progress and file information  
🌈 **Resume Upload** - Supports resuming uploads after interruption

### Advanced Features

🎛️ **Share Control** - Supports password protection, download count limits, and expiration time settings  
🔍 **Pickup Code System** - Supports pickup code sharing, simplifying sharing difficulty  
⚡ **Queue Processing** - Asynchronous task processing system based on Redis + Asynq  
🗂️ **File Management** - Complete file lifecycle management  
📷 **Image Processing** - Image compression, format conversion, and other processing features  
🏷️ **Download Control** - Download token management system based on JWT

## 📸 Screenshots

| File Selection Upload Page | Text Input Upload Page    |
| -------------------------- | ------------------------- |
| ![](/.github/image/1.png)  | ![](/.github/image/2.png) |

| Multiple File Upload      | Upload Progress Heatmap   |
| ------------------------- | ------------------------- |
| ![](/.github/image/3.png) | ![](/.github/image/4.png) |

| Upload Progress Bar       | Upload Success Page       |
| ------------------------- | ------------------------- |
| ![](/.github/image/5.png) | ![](/.github/image/6.png) |

## 🏗️ Technical Architecture

### Frontend Tech Stack

- **Vue 3.5** - Progressive JavaScript framework
- **Nuxt 4** - Vue.js full-stack framework
- **TypeScript 5.9** - Complete type safety
- **TailwindCSS v4** - Atomic CSS framework
- **shadcn-nuxt + Reka UI** - Modern component library
- **Pinia 3** - State management
- **TanStack Query** - Data fetching and caching
- **Vue Router** - Routing management
- **@nuxtjs/i18n** - Internationalization support

### Backend Tech Stack

- **Go 1.23** - High-performance server-side language
- **Echo** - High-performance HTTP framework
- **Redis** - Caching and session storage
- **Asynq** - Asynchronous task queue
- **JWT** - Authentication
- **Zap** - Structured logging

### Build System

- **Node.js** - Server-side runtime
- **pnpm** - Fast package manager
- **Husky** - Git hooks management
- **Prettier** - Code formatting
- **Lint-staged** - Staged file checking

### Storage Architecture

- **File Storage** - Local file system storage
- **Redis Cache** - Share information and file metadata caching
- **Queue System** - Asynchronous task processing queue

## 🚀 Quick Start

### Docker

1. Download files
    - config.example.yaml
    - docker-compose.yml

2. Rename config.example.yaml to config.yaml after configuration

3. Start

```bash
docker compose up -d
```

## 📁 Project Structure

```
tempys/
├── front/                 # Frontend application (Vue 3.5 + Nuxt 4)
│   ├── components/        # Vue components
│   │   ├── pages/         # Page routes
│   │   ├── composables/   # Composable functions
│   │   ├── i18n/          # Internationalization files
│   │   └── assets/        # Static assets
│   └── middleware/        # Middleware
├── backend/               # Backend service (Go + Echo)
│   ├── internal/          # Internal packages
│   │   ├── controllers/   # Controllers
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   └── utils/          # Utility functions
│   └── middleware/        # Middleware
├── worker/                # Asynchronous task processing (Go + Asynq)
│   ├── internal/          # Internal packages
│   │   ├── tasks/         # Task processors
│   │   └── utils/         # Utility functions
│   └── middleware/        # Middleware
└── tmp/                   # Temporary files
```

## 🔧 Development Guide

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (package manager)
- **Go** 1.23+
- **Redis** (for queue system)

### Quick Start (Development)

```bash
# Install dependencies
pnpm install

# Start all services (frontend + backend + worker)
pnpm dev

# Or start individual services:
pnpm dev:front    # Frontend on http://localhost:3000
pnpm dev:backend  # Backend with hot reload
pnpm dev:worker   # Worker with hot reload
```

### Linting and Testing

```bash
# Run all linters
pnpm lint

# Run backend/worker tests
pnpm test
```

### Code Standards

- Use Prettier for code formatting
- Use Husky + lint-staged for pre-commit checking
- Follow TypeScript type safety standards
- See [AGENTS.md](./AGENTS.md) for detailed coding guidelines

### Commit Standards

We follow conventional commit format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

```bash
# Code formatting will run automatically before commit
git add .
git commit -m "feat(i18n): addSpanish language support"
```

### Build and Deploy

```bash
# Build frontend
cd front && pnpm run build

# Build backend (requires Go environment)
cd backend && go build -o main .

# Build Worker
cd worker && go build -o worker .
```

## 📝 Development Roadmap

### Completed Features ✅

- Frontend hash calculation and instant transfer
- Concurrent chunked upload (using Web Worker)
- File upload/text upload and sharing
- Upload statistics page
- Multi-language support (English, Chinese, Spanish)
- Maximum upload limits
- Backend queue system and Worker file processing

### Planned Features 🚧

- Resume upload (backend calculates uploaded parts and returns)
- Image format conversion and compression
- Image OCR copy
- Document to Markdown conversion
- Text translation/summarization
- Support for multiple file uploads

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project.

## 📄 License

This project is licensed under AGPLV3.

## 🔗 Related Links

- [Vue 3 Documentation](https://vuejs.org/)
- [Nuxt 4 Documentation](https://nuxt.com/)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/)
- [shadcn-nuxt Documentation](https://shadcn-nuxt.com/)
- [Echo Framework Documentation](https://echo.labstack.com/)
- [Asynq Documentation](https://github.com/hibiken/asynq)
