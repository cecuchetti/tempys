import { useApi, type ApiError } from './useApi'

// Lazy load SparkMD5 only on client side
let SparkMD5: any = null
if (import.meta.client) {
    import('spark-md5').then((module) => {
        SparkMD5 = module.default
    })
}

// =============================================================================
// Types
// =============================================================================

/**
 * Upload status for tracking progress
 */
export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'complete' | 'error'

/**
 * File chunk information
 */
export interface FileChunk {
    index: number
    start: number
    end: number
    uploaded: boolean
}

/**
 * Upload task state
 */
export interface UploadTask {
    id: string
    file: File
    name: string
    size: number
    mimeType: string
    hash: string
    status: UploadStatus
    progress: number
    uploadedChunks: number
    totalChunks: number
    error?: string
    shareId?: string
    shortLink?: string
}

/**
 * Upload configuration
 */
export interface UploadConfig {
    expiration: number // in minutes
    downloadLimit: number
    password?: string
    pickupCode?: boolean
    notifyEmail?: string
}

/**
 * Create upload task response from backend
 */
interface CreateUploadResponse {
    id: string
    size: number
    mime_type: string
    hash: string
    type: string
    expire: number
    chunk_size: number
    chunks?: number[]
}

/**
 * Finish upload response
 */
interface FinishUploadResponse {
    id: string
    size: number
    mime_type: string
    hash: string
    type: string
}

/**
 * Create share response
 */
interface CreateShareResponse {
    id: string
    file_name?: string
    download_nums: number
    expire_at: number
    pickup_code?: string
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate MD5 hash of a file (backend expects MD5)
 */
async function calculateFileHash(file: File): Promise<string> {
    // Ensure SparkMD5 is loaded
    if (!SparkMD5) {
        const module = await import('spark-md5')
        SparkMD5 = module.default
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const buffer = reader.result as ArrayBuffer
                const spark = new SparkMD5.ArrayBuffer()
                spark.append(buffer)
                const hash = spark.end()
                resolve(hash)
            } catch (err) {
                reject(err)
            }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsArrayBuffer(file)
    })
}

/**
 * Convert file to chunks
 */
function createChunks(file: File, chunkSize: number): FileChunk[] {
    const chunks: FileChunk[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        chunks.push({
            index: i,
            start,
            end,
            uploaded: false,
        })
    }

    return chunks
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
}

// =============================================================================
// State Management
// =============================================================================

/**
 * Global upload queue state
 */
const uploadQueue = ref<UploadTask[]>([])
const isUploading = ref(false)

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable for chunked file uploads
 *
 * @example
 * ```typescript
 * const { uploadFile, queue, isUploading, createShare } = useUpload()
 *
 * // Upload a file
 * await uploadFile(file, { expiration: 60, downloadLimit: 10 })
 *
 * // Create a share after upload
 * await createShare(uploadTask.id, config)
 * ```
 */
export function useUpload() {
    const { post } = useApi()
    const { t } = useI18n()
    const config = useRuntimeConfig()

    // Reactive state
    const queue = computed(() => uploadQueue.value)
    const uploading = computed(() => isUploading.value)

    /**
     * Initialize upload with backend (create upload task)
     */
    async function initUpload(file: File): Promise<CreateUploadResponse> {
        const hash = await calculateFileHash(file)

        const response = await post<CreateUploadResponse>('/file/create', {
            size: file.size,
            mime_type: file.type || 'application/octet-stream',
            hash: hash,
        })

        if (!response) {
            throw new Error(t('upload.errors.initFailed'))
        }

        return response
    }

    /**
     * Upload a single chunk
     */
    async function uploadChunk(taskId: string, file: File, startIndex: number, endIndex: number, chunkIndex: number): Promise<void> {
        const chunk = file.slice(startIndex, endIndex)
        const formData = new FormData()
        formData.append('id', taskId)
        // Backend expects 1-based index (index starts at 1)
        formData.append('index', String(chunkIndex + 1))
        formData.append('file', chunk, file.name)

        await $fetch('/api/file/slice', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
    }

    /**
     * Finish upload and merge chunks
     */
    async function finishUpload(taskId: string): Promise<FinishUploadResponse> {
        const response = await post<FinishUploadResponse>(
            '/file/finish',
            {
                id: taskId,
            },
            { credentials: 'include' } as any
        )

        if (!response) {
            throw new Error(t('upload.errors.finishFailed'))
        }

        return response
    }

    /**
     * Create a share from uploaded file
     */
    async function createShare(
        fileId: string,
        options: {
            fileName?: string
            expiration?: number
            downloadLimit?: number
            password?: string
            pickupCode?: boolean
        } = {}
    ): Promise<CreateShareResponse> {
        const { fileName, expiration = 60, downloadLimit = 10, password, pickupCode } = options

        const response = await post<CreateShareResponse>('/share', {
            type: 'file',
            data: fileId,
            file_name: fileName,
            config: {
                expire_time: expiration,
                download_nums: downloadLimit,
                has_password: !!password,
                password: password || '',
                has_pickup_code: pickupCode || false,
            },
        })

        if (!response) {
            throw new Error(t('upload.errors.shareFailed'))
        }

        return response
    }

    /**
     * Upload a file with progress tracking
     */
    async function uploadFile(file: File, uploadConfig?: UploadConfig): Promise<{ task: UploadTask; shareId?: string }> {
        // Create upload task entry
        const task: UploadTask = {
            id: '',
            file,
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            hash: '',
            status: 'pending',
            progress: 0,
            uploadedChunks: 0,
            totalChunks: 0,
        }

        // Add to queue
        uploadQueue.value.unshift(task)
        isUploading.value = true

        try {
            // Step 1: Initialize upload
            task.status = 'uploading'

            const { post: apiPost } = useApi()
            const hash = await calculateFileHash(file)
            task.hash = hash

            const initResponse = await apiPost<CreateUploadResponse>('/file/create', {
                size: file.size,
                mime_type: task.mimeType,
                hash: hash,
            }).catch((err) => {
                console.error('[useUpload] initUpload error:', err)
                throw err
            })

            if (!initResponse || !initResponse.id) {
                throw new Error('Failed to initialize upload')
            }

            task.id = initResponse.id

            // Calculate chunk size from response (backend determines optimal size)
            const chunkSize = initResponse.chunk_size || 256 * 1024 // Default 256KB
            const totalChunks = Math.ceil(file.size / chunkSize)
            task.totalChunks = totalChunks

            // Step 2: Upload chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize
                const end = Math.min(start + chunkSize, file.size)

                await uploadChunk(task.id, file, start, end, i)

                task.uploadedChunks = i + 1
                task.progress = Math.round((task.uploadedChunks / totalChunks) * 100)
            }

            // Step 3: Finish upload
            task.status = 'processing'

            await finishUpload(task.id)

            task.progress = 100

            // Step 4: Create share if config provided
            if (uploadConfig) {
                const shareResponse = await createShare(task.id, {
                    fileName: file.name,
                    expiration: uploadConfig.expiration,
                    downloadLimit: uploadConfig.downloadLimit,
                    password: uploadConfig.password,
                    pickupCode: uploadConfig.pickupCode,
                })

                task.shareId = shareResponse.id
                task.shortLink = `${window.location.origin}/s/${shareResponse.id}`
            }

            task.status = 'complete'

            return { task, shareId: task.shareId }
        } catch (error) {
            task.status = 'error'
            task.error = error instanceof Error ? error.message : 'Upload failed'
            throw error
        } finally {
            isUploading.value = false
        }
    }

    /**
     * Remove task from queue
     */
    function cancelUpload(taskId: string): void {
        const index = uploadQueue.value.findIndex((t) => t.id === taskId)
        if (index !== -1) {
            uploadQueue.value.splice(index, 1)
        }
    }

    /**
     * Clear completed uploads
     */
    function clearCompleted(): void {
        uploadQueue.value = uploadQueue.value.filter((t) => t.status !== 'complete')
    }

    /**
     * Clear all uploads
     */
    function clearAll(): void {
        uploadQueue.value = []
    }

    /**
     * Get task by ID
     */
    function getTask(taskId: string): UploadTask | undefined {
        return uploadQueue.value.find((t) => t.id === taskId)
    }

    return {
        // State
        queue,
        uploading,

        // Actions
        uploadFile,
        cancelUpload,
        clearCompleted,
        clearAll,

        // Utilities
        getTask,
        createShare,
        formatFileSize,
        calculateFileHash,
    }
}

// =============================================================================
// Exports
// =============================================================================

export type { UploadTask as UploadTaskType, UploadConfig as UploadConfigType }
