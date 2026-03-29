<div align="center"><a name="readme-top"></a>

# Tempys

[![GitHub](https://img.shields.io/github/license/cecuchetti/tempys)](https://github.com/cecuchetti/tempys)
[![GitHub stars](https://img.shields.io/github/stars/cecuchetti/tempys)](https://github.com/cecuchetti/tempys)

tempys es una plataforma de compartición de archivos temporales autoalojada. Enfocada en proporcionar servicios de carga, procesamiento y compartición de archivos y texto de una sola vez y temporales.

Un sitio web moderno de compartición de archivos construido con **Vue 3.5 + Nuxt 4 + Go**, que admite carga de archivos, compartición de texto, compresión de imágenes, procesamiento concurrente, funcionalidad de transferencia instantánea y más, con un completo sistema de gestión de compartición y control de acceso.

![Visión General de la Plataforma Tempys](/.github/image/0.png)

[English](README.md) | [中文](README-zh.md) | Español

</div>

## 🌟 Características

### Funcionalidad Principal

🖼️ **Carga de Archivos de Alto Rendimiento** - Admite carga de archivos grandes por fragmentos con cálculo de hash en el frontend para transferencia instantánea  
📱 **Diseño Responsivo** - Interfaz moderna basada en Tailwind V4 + Reka UI, adaptable a varios dispositivos  
⚡ **Procesamiento Concurrente** - Usa Web Worker para cálculo de hash en el frontend, sistema de colas en el backend para procesamiento de tareas  
🌐 **Soporte Multiidioma** - Soporte completo de internacionalización para inglés, chino y español  
🔗 **Gestión de Compartición** - Sistema flexible de generación y gestión de enlaces de compartición

### Procesamiento de Archivos

🔄 **Transferencia Instantánea Inteligente** - Detección de transferencia instantánea en el frontend basada en hash de archivo + tamaño de archivo, evitando cargas duplicadas  
📷 **Compresión de Imágenes** - Funcionalidad automática de compresión de imágenes que soporta múltiples formatos  
🖼️ **Vista Previa de Archivos** - Admite vista previa de imágenes, videos, audio, documentos y varios tipos de archivos  
📊 **Estadísticas de Carga** - Visualización en tiempo real del progreso de carga e información del archivo  
🌈 **Reanudar Carga** - Admite la reanudación de cargas después de interrupciones

### Características Avanzadas

🎛️ **Control de Compartición** - Admite protección con contraseña, límites de conteo de descargas y configuración de tiempo de expiración  
🔍 **Sistema de Código de Recogida** - Admite compartición por código de recogida, simplificando la dificultad de compartir  
⚡ **Procesamiento de Cola** - Sistema de procesamiento de tareas asíncronas basado en Redis + Asynq  
🗂️ **Gestión de Archivos** - Gestión completa del ciclo de vida de archivos  
📷 **Procesamiento de Imágenes** - Funciones de procesamiento como compresión de imágenes, conversión de formato  
🏷️ **Control de Descarga** - Sistema de gestión de tokens de descarga basado en JWT

## 📸 Capturas de Pantalla

| Página de Carga de Selección de Archivos | Página de Carga de Entrada de Texto |
| ---------------------------------------- | ----------------------------------- |
| ![](/.github/image/1.png)                | ![](/.github/image/2.png)           |

| Carga de Múltiples Archivos | Mapa de Calor de Progreso de Carga |
| --------------------------- | ---------------------------------- |
| ![](/.github/image/3.png)   | ![](/.github/image/4.png)          |

| Barra de Progreso de Carga | Página de Éxito de Carga  |
| -------------------------- | ------------------------- |
| ![](/.github/image/5.png)  | ![](/.github/image/6.png) |

## 🏗️ Arquitectura Técnica

### Stack Tecnológico Frontend

- **Vue 3.5** - Framework JavaScript progresivo
- **Nuxt 4** - Framework full-stack de Vue.js
- **TypeScript 5.9** - Seguridad de tipos completa
- **TailwindCSS v4** - Framework CSS atómico
- **shadcn-nuxt + Reka UI** - Biblioteca de componentes moderna
- **Pinia 3** - Gestión de estado
- **TanStack Query** - Obtención y caché de datos
- **Vue Router** - Gestión de enrutamiento
- **@nuxtjs/i18n** - Soporte de internacionalización

### Stack Tecnológico Backend

- **Go 1.23** - Lenguaje del lado del servidor de alto rendimiento
- **Echo** - Framework HTTP de alto rendimiento
- **Redis** - Caché y almacenamiento de sesiones
- **Asynq** - Cola de tareas asíncronas
- **JWT** - Autenticación
- **Zap** - Registro estructurado

### Sistema de Construcción

- **Node.js** - Runtime del lado del servidor
- **pnpm** - Gestor de paquetes rápido
- **Husky** - Gestión de git hooks
- **Prettier** - Formateo de código
- **Lint-staged** - Verificación de archivos en staging

### Arquitectura de Almacenamiento

- **Almacenamiento de Archivos** - Almacenamiento en sistema de archivos local
- **Caché Redis** - Caché de información de compartición y metadatos de archivos
- **Sistema de Colas** - Cola de procesamiento de tareas asíncronas

## 🚀 Inicio Rápido

### Docker

1. Descargar archivos
    - config.example.yaml
    - docker-compose.yml

2. Renombrar config.example.yaml a config.yaml después de configurar

3. Iniciar

```bash
docker compose up -d
```

### Desarrollo Local

1. Clonar el repositorio

```bash
git clone https://github.com/cecuchetti/tempys.git
cd tempys
```

2. Configurar el backend

```bash
cp config.example.yaml config.yaml
# Editar config.yaml con su configuración
```

3. Iniciar servicios

```bash
# Iniciar frontend
cd front && pnpm install && pnpm dev

# Iniciar backend (requiere entorno Go)
cd backend && go run .

# Iniciar worker (requiere entorno Go)
cd worker && go run .
```

## 📁 Estructura del Proyecto

```
tempys/
├── front/                 # Aplicación frontend (Vue 3.5 + Nuxt 4)
│   ├── components/        # Componentes Vue
│   │   ├── pages/         # Rutas de páginas
│   │   ├── composables/   # Funciones composables
│   │   ├── i18n/          # Archivos de internacionalización
│   │   └── assets/        # Recursos estáticos
│   └── middleware/        # Middleware
├── backend/               # Servicio backend (Go + Echo)
│   ├── internal/          # Paquetes internos
│   │   ├── controllers/   # Controladores
│   │   ├── models/        # Modelos de datos
│   │   ├── services/      # Lógica de negocio
│   │   └── utils/         # Funciones de utilidad
│   └── middleware/        # Middleware
├── worker/                # Procesamiento de tareas asíncronas (Go + Asynq)
│   ├── internal/          # Paquetes internos
│   │   ├── tasks/         # Procesadores de tareas
│   │   └── utils/         # Funciones de utilidad
│   └── middleware/        # Middleware
└── tmp/                   #Archivos temporales
```

## 🔧 Guía de Desarrollo

### Requisitos Previos

- **Node.js** 20+
- **pnpm** 10+ (gestor de paquetes)
- **Go** 1.23+
- **Redis** (para sistema de colas)

### Inicio Rápido (Desarrollo)

```bash
# Instalar dependencias
pnpm install

# Iniciar todos los servicios (frontend + backend + worker)
pnpm dev

# O iniciar servicios individuales:
pnpm dev:front    # Frontend en http://localhost:3000
pnpm dev:backend  # Backend con hot reload
pnpm dev:worker   # Worker con hot reload
```

### Linting y Testing

```bash
# Ejecutar todos los linters
pnpm lint

# Ejecutar tests de backend/worker
pnpm test
```

### Estándares de Código

- Usar Prettier para formateo de código
- Usar Husky + lint-staged para verificación pre-commit
- Seguir estándares de seguridad de tipos TypeScript
- Ver [AGENTS.md](./AGENTS.md) para guías de codificación detalladas

### Estándares de Commit

Seguimos el formato de commits convencionales:

```
<tipo>(<ámbito>): <descripción>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

```bash
# El formateo de código se ejecutará automáticamente antes del commit
git add .
git commit -m "feat(i18n): agregar soporte para idioma español"
```

### Construir y Desplegar

```bash
# Construir frontend
cd front && pnpm run build

# Construir backend (requiere entorno Go)
cd backend && go build -o main .

# Construir Worker
cd worker && go build -o worker .
```

## 🌐 Soporte de Idiomas

Tempys soporta múltiples idiomas:

- **Inglés (en)** - Idioma por defecto
- **Chino (zh)** - Chino simplificado
- **Español (es)** - Traducción completa al español

Los archivos de idioma están ubicados en `front/i18n/locales/`. Para agregar un nuevo idioma:

1. Crear un nuevo archivo JSON en `front/i18n/locales/` (ej., `fr.json`)
2. Agregar el locale en `nuxt.config.ts` en la configuración de `i18n`
3. Importar el locale de dayjs para el formato de fechas

## 📝 Hoja de Ruta de Desarrollo

### Características Completadas ✅

- Cálculo de hash en frontend y transferencia instantánea
- Carga fragmentada concurrente (usando Web Worker)
- Carga de archivos/texto y compartición
- Página de estadísticas de carga
- Soporte multiidioma (inglés, chino, español)
- Límites máximos de carga
- Sistema de colas backend y procesamiento de archivos Worker

### Características Planificadas 🚧

- Reanudar carga (el backend calcula las partes cargadas y devuelve)
- Conversión y compresión de formato de imagen
- Copia OCR de imagen
- Conversión de documento a Markdown
- Traducción/resumen de texto
- Soporte para carga de múltiples archivos

## 🤝 Contribuir

Bienvenido a enviar Issues y Pull Requests para mejorar este proyecto.

Repositorio: https://github.com/cecuchetti/tempys

## 📄 Licencia

Este proyecto está licenciado bajo AGPLV3.

## 🔗 Enlaces Relacionados

- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Nuxt 4](https://nuxt.com/)
- [Documentación de TailwindCSS v4](https://tailwindcss.com/)
- [Documentación de shadcn-nuxt](https://shadcn-nuxt.com/)
- [Documentación del Framework Echo](https://echo.labstack.com/)
- [Documentación de Asynq](https://github.com/hibiken/asynq)
