/**
 * API Types for Tempys
 *
 * These types define the contract between frontend and backend.
 * Match responses from backend Go controllers.
 */

// =============================================================================
// Common Response Types
// =============================================================================

/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
    page?: number
    limit?: number
    offset?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

// =============================================================================
// Share Types
// =============================================================================

/**
 * Share type enum
 */
export type ShareType = 'file' | 'text'

/**
 * Share status enum
 */
export type ShareStatus = 'active' | 'expired' | 'one-time'

/**
 * Share info response from GET /share/:id
 */
export interface ShareInfo {
    id: string
    type: ShareType
    name: string
    download_nums: number
    has_password: boolean
    expire_at: number // Unix timestamp
    owner: string
    size?: number // For files
    mime_type?: string // For files
}

/**
 * Share creation request POST /share
 */
export interface CreateShareRequest {
    type: ShareType
    data: string // File ID or text content
    config: {
        expire_time: number // Minutes
        download_nums: number
        has_password?: boolean
        password?: string
        has_notify?: boolean
        notify_email?: string[]
        has_pickup_code?: boolean
    }
    file_name?: string
}

/**
 * Share creation response
 */
export interface CreateShareResponse {
    id: string
    file_name?: string
    download_nums: number
    expire_at: number // Unix timestamp
    pickup_code?: string
}

/**
 * User's share summary for list view
 */
export interface UserShare {
    id: string
    type: ShareType
    name: string
    short_link: string
    status: ShareStatus
    clicks: number
    created_at: string // ISO date string
    size?: number // For files
    files_count?: number // For multi-file shares
    expires_at: string // ISO date string
}

/**
 * User shares list response from GET /user/shares
 */
export interface UserSharesResponse {
    shares: UserShare[]
    total: number
}

// =============================================================================
// File Types
// =============================================================================

/**
 * File upload state
 */
export type FileState = 'pending' | 'uploading' | 'completed' | 'failed' | 'discarded'

/**
 * File info from GET /file/:id
 */
export interface FileInfo {
    id: string
    name: string
    size: number
    type: string // MIME type
    file_type: FileState
    chunks: number
    uploaded_chunks: number
    created_at: number // Unix timestamp
    hash?: string
}

/**
 * File upload creation request
 */
export interface CreateFileRequest {
    hash: string
    name: string
    size: number
    type: string
    last_modified: number
    chunks: number
}

/**
 * File upload creation response
 */
export interface CreateFileResponse {
    id: string
    type: string
    uploaded: number[] // Chunk indices already uploaded (for resume)
}

/**
 * Chunk upload response
 */
export interface ChunkUploadResponse {
    chunk: number
    status: 'uploaded' | 'failed'
}

// =============================================================================
// Download Types
// =============================================================================

/**
 * Download token request
 */
export interface DownloadTokenRequest {
    share_id: string
    password?: string
}

/**
 * Download token response
 */
export interface DownloadTokenResponse {
    token: string
    expires_at: number // Unix timestamp
}

// =============================================================================
// Stats Types
// =============================================================================

/**
 * System statistics from GET /stat
 */
export interface SystemStats {
    file_size: number // Total storage used (bytes)
    file_num: number // Total files
    share_num: number // Total shares
    download_num: number // Total downloads
}

/**
 * Dashboard stats for user
 */
export interface DashboardStats {
    total_links: number
    active_links: number
    storage_used_percent: number
    engagement_24h: number
    recent_shares: UserShare[]
}

// =============================================================================
// Config Types
// =============================================================================

/**
 * Application config from GET /config
 */
export interface AppConfig {
    site_title: Record<string, string>
    site_desc: Record<string, string>
    site_url: string
    site_icon: string
    site_bg_url: string
    version: string
    build_time: number // Unix timestamp
}

// =============================================================================
// Task Types
// =============================================================================

/**
 * Task type enum
 */
export type TaskType = 'file-share' | 'file-image-compress' | 'file-image-convert' | 'text-share'

/**
 * Task status enum
 */
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Task info from GET /task/:id
 */
export interface TaskInfo {
    id: string
    type: TaskType
    status: TaskStatus
    progress: number // 0-100
    result?: unknown
    error?: string
    created_at: number // Unix timestamp
    updated_at: number // Unix timestamp
}

/**
 * Task creation request POST /task/:type
 */
export interface CreateTaskRequest {
    type: TaskType
    payload: unknown
}

// =============================================================================
// About Types
// =============================================================================

/**
 * System about info from GET /about
 */
export interface SystemAbout {
    version: string
    build_time: string
    storage: string // Human-readable storage info
    features: string[]
    author: string
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * API error response structure
 */
export interface ApiErrorResponse {
    code: number
    message: string
    details?: Record<string, unknown>
}

/**
 * Common HTTP status codes used in error handling
 */
export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Generic pagination query params
 */
export interface ListQueryParams extends PaginationParams {
    sort?: 'asc' | 'desc'
    sort_by?: string
    filter?: Record<string, unknown>
}
