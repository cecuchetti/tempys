<div align="center"><a name="readme-top"></a>

# Tempys

[English](README.md) | [中文](README-zh.md) | [Español](README-es.md)

Tempys（发音/ˈtɛmpɪs/）是一个支持selfhosted的临时文件分享平台。专注于提供一次性，临时的文件和文本上传，处理，分享服务。

一个基于 **Vue 3.5 + Nuxt 4 + Go** 构建的现代文件分享网站，支持文件上传、文本分享、图片压缩、并发处理、秒传功能等，具备完整的分享管理和访问控制体系。

![Tempys Platform Overview](/.github/image/0.png)

</div>

## 🌟 功能特性

### 核心功能

🖼️ **高性能文件上传** - 支持大文件切片上传，前端计算文件哈希实现秒传  
📱 **响应式设计** - 基于 Tailwind V4 + Reka UI 的现代化 UI，适配各种设备  
⚡ **并发处理** - 使用 Web Worker 进行前端Hash计算，后端队列系统处理任务  
🌐 **多语言支持** - 完整的英文、中文、西班牙语国际化支持  
🔗 **分享管理** - 灵活的分享链接生成和管理系统

### 文件处理

🔄 **智能秒传** - 基于文件哈希+文件大小的前端秒传检测，避免重复上传  
📷 **图片压缩** - 自动图片压缩功能，支持多种格式  
🖼️ **文件预览** - 支持图片、视频、音频、文档等多种文件类型预览  
📊 **上传统计** - 实时显示上传进度和文件信息  
🌈 **断点续传** - 支持上传中断后的续传功能

### 高级功能

🎛️ **分享控制** - 支持密码保护、下载次数限制、过期时间设置  
🔍 **取件码系统** - 支持取件码分享，简化分享难度  
⚡ **队列处理** - 基于 Redis + Asynq 的异步任务处理系统  
🗂️ **文件管理** - 完整的文件生命周期管理  
📷 **图片处理** - 图片压缩、格式转换等处理功能  
🏷️ **下载控制** - 基于 JWT 的下载令牌管理系统

## 📸 截图预览

| 选择文件上传页面          | 输入文本上传页面          |
| ------------------------- | ------------------------- |
| ![](/.github/image/1.png) | ![](/.github/image/2.png) |

| 多选文件上传              | 文件上传进度热力图        |
| ------------------------- | ------------------------- |
| ![](/.github/image/3.png) | ![](/.github/image/4.png) |

| 文件上传进度条            | 文件上传成功页面          |
| ------------------------- | ------------------------- |
| ![](/.github/image/5.png) | ![](/.github/image/6.png) |

## 🏗️ 技术架构

### 前端技术栈

- **Vue 3.5** - 渐进式 JavaScript 框架
- **Nuxt 4** - Vue.js 全栈框架
- **TypeScript 5.9** - 完整的类型安全
- **TailwindCSS v4** - 原子化 CSS 框架
- **shadcn-nuxt + Reka UI** - 现代化组件库
- **Pinia 3** - 状态管理
- **TanStack Query** - 数据获取和缓存
- **Vue Router** - 路由管理
- **@nuxtjs/i18n** - 国际化支持

### 后端技术栈

- **Go 1.23** - 高性能服务器端语言
- **Echo** - 高性能 HTTP 框架
- **Redis** - 缓存和会话存储
- **Asynq** - 异步任务队列
- **JWT** - 身份验证
- **Zap** - 结构化日志

### 构建系统

- **Node.js** - 服务器端运行时
- **pnpm** - 快速包管理器
- **Husky** - Git hooks 管理
- **Prettier** - 代码格式化
- **Lint-staged** - 暂存文件检查

### 存储架构

- **文件存储** - 本地文件系统存储
- **Redis 缓存** - 分享信息、文件元数据缓存
- **队列系统** - 异步任务处理队列

## 🚀 快速开始

### Docker

1. 下载文件
    - config.example.yaml
    - docker-compose.yml

2. 把config.example.yaml配置完成后改为config.yaml

3. 启动

```bash
docker compose up -d
```

### 本地开发

1. 克隆仓库

```bash
git clone https://github.com/cecuchetti/tempys.git
cd tempys
```

2. 配置后端

```bash
cp config.example.yaml config.yaml
# 编辑 config.yaml 配置您的设置
```

3. 启动服务

```bash
# 启动前端
cd front && pnpm install && pnpm dev

# 启动后端 (需要 Go 环境)
cd backend && go run .

# 启动 worker (需要 Go 环境)
cd worker && go run .
```

## 📁 项目结构

```
tempys/
├── front/                 # 前端应用 (Vue 3.5 + Nuxt 4)
│   ├── components/        # Vue 组件
│   │   ├── pages/         # 页面路由
│   │   ├── composables/   # 组合式函数
│   │   ├── i18n/          # 国际化文件
│   │   └── assets/        # 静态资源
│   └── middleware/        # 中间件
├── backend/               # 后端服务 (Go + Echo)
│   ├── internal/          # 内部包
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务逻辑
│   │   └── utils/         # 工具函数
│   └── middleware/        # 中间件
├── worker/                # 异步任务处理 (Go + Asynq)
│   ├── internal/          # 内部包
│   │   ├── tasks/         # 任务处理器
│   │   └── utils/         # 工具函数
│   └── middleware/        # 中间件
└── tmp/                   # 临时文件
```

## 🔧 开发指南

### 代码规范

- 使用 Prettier 进行代码格式化
- 使用 Husky + lint-staged 进行提交前检查
- 遵循 TypeScript 类型安全规范

### 提交规范

```bash
# 提交前会自动运行代码格式化
git add .
git commit -m "feat: add new feature"
```

### 构建部署

```bash
# 构建前端
cd front && pnpm run build

# 构建后端 (需要 Go 环境)
cd backend && go build -o main .

# 构建 Worker
cd worker && go build -o worker .
```

## 🌐 语言支持

Tempys 支持多种语言：

- **英语** - 默认语言
- **中文** - 简体中文
- **西班牙语** - 完整的西班牙语翻译

语言文件位于 `front/i18n/locales/`。添加新语言：

1. 在 `front/i18n/locales/` 创建新的 JSON 文件（如 `fr.json`）
2. 在 `nuxt.config.ts` 的 `i18n` 配置中添加语言
3. 导入 dayjs 语言包以支持日期格式化

## 📝 开发计划

### 已完成功能 ✅

- 前端计算哈希和秒传
- 并发切片上传 (使用 Web Worker)
- 文件上传/文本上传和分享
- 上传统计页面
- 多语言支持（英语、中文、西班牙语）
- 最大上传限制
- 后端队列系统和 Worker 处理文件

### 计划功能 🚧

- 断点续传 (后端计算已上传部分并返回)
- 图片格式转换和压缩
- 图片 OCR 复制
- 文档转 Markdown
- 文本翻译/总结
- 支持上传多文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

仓库地址：https://github.com/cecuchetti/tempys

## 📄 许可证

本项目采用 AGPLV3 许可证。

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Nuxt 4 文档](https://nuxt.com/)
- [TailwindCSS v4 文档](https://tailwindcss.com/)
- [shadcn-nuxt 文档](https://shadcn-nuxt.com/)
- [Echo框架文档](https://echo.labstack.com/)
- [Asynq 文档](https://github.com/hibiken/asynq)
