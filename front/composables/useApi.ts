import { toast } from 'vue-sonner'

// Wrapper for toast that handles SSR
function showToastMessage(message: string, type: 'success' | 'error' = 'error') {
    if (import.meta.client && typeof window !== 'undefined') {
        try {
            if (type === 'success') {
                toast.success(message)
            } else {
                toast.error(message)
            }
        } catch (e) {
            console.warn('Toast failed:', e)
        }
    }
}

// =============================================================================
// Types
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

/**
 * API error structure
 */
export interface ApiErrorData {
    code: number
    message: string
    details?: Record<string, unknown>
}

/**
 * Request configuration options
 */
export interface RequestOptions {
    /**
     * Custom error message to display
     */
    errorMessage?: string
    /**
     * Whether to show toast notification on error
     */
    showToast?: boolean
    /**
     * Whether to throw error or return null on failure
     */
    throwOnError?: boolean
    /**
     * Custom headers to merge with defaults
     */
    headers?: Record<string, string>
    /**
     * Query parameters for GET requests
     */
    params?: Record<string, unknown>
    /**
     * Request timeout in milliseconds
     */
    timeout?: number
    /**
     * Custom signal for aborting requests
     */
    signal?: AbortSignal
}

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
    constructor(
        public code: number,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'ApiError'
    }

    /**
     * Check if error is an authentication error
     */
    get isAuthError(): boolean {
        return this.code === 401 || this.code === 403
    }

    /**
     * Check if error is a client error (4xx)
     */
    get isClientError(): boolean {
        return this.code >= 400 && this.code < 500
    }

    /**
     * Check if error is a server error (5xx)
     */
    get isServerError(): boolean {
        return this.code >= 500
    }
}

// =============================================================================
// State Management
// =============================================================================

/**
 * Global loading state counter to track concurrent requests
 */
const loadingCounter = ref(0)

/**
 * Computed loading state derived from counter
 */
const isLoading = computed(() => loadingCounter.value > 0)

/**
 * Global error state
 */
const lastError = ref<ApiError | null>(null)

/**
 * Track active requests for debugging
 */
if (import.meta.dev) {
    // Log requests in development
    watch(loadingCounter, (newCount, oldCount) => {
        if (newCount > oldCount) {
            console.log(`[API] Request started. Active: ${newCount}`)
        } else if (newCount < oldCount) {
            console.log(`[API] Request completed. Active: ${newCount}`)
        }
    })
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get user-friendly error message for a status code with i18n support
 */
function getErrorMessage(code: number, fallback?: string): string {
    // Status codes that have specific translations
    const errorCodeMap: Record<number, string> = {
        400: 'api.errors.400',
        401: 'api.errors.401',
        403: 'api.errors.403',
        404: 'api.errors.404',
        408: 'api.errors.408',
        409: 'api.errors.409',
        422: 'api.errors.422',
        429: 'api.errors.429',
        500: 'api.errors.500',
        502: 'api.errors.502',
        503: 'api.errors.503',
        504: 'api.errors.504',
    }

    try {
        const { $i18n } = useNuxtApp()
        const t = $i18n?.t?.bind($i18n)

        if (t && errorCodeMap[code]) {
            return t(errorCodeMap[code])
        }

        // Fallback to default error message
        return fallback || t?.('api.errors.default') || 'An error occurred. Please try again.'
    } catch {
        // i18n not available, use fallback
        return fallback || 'An error occurred. Please try again.'
    }
}

/**
 * Get network error message with i18n support
 */
function getNetworkErrorMessage(): string {
    try {
        const { $i18n } = useNuxtApp()
        return $i18n?.t?.('api.errors.network') || 'Network error. Please check your connection.'
    } catch {
        return 'Network error. Please check your connection.'
    }
}

/**
 * Get base URL from runtime config or use default
 */
function getBaseUrl(): string {
    try {
        const config = useRuntimeConfig()
        return (config.public.apiBaseUrl as string) || '/api'
    } catch {
        // Runtime config not available (e.g., outside Nuxt context)
        return '/api'
    }
}

/**
 * Build full URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const baseUrl = getBaseUrl()
    const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`

    if (!params) return url

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
        }
    }

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
}

/**
 * Get default headers including auth if available
 */
function getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }

    // Add auth header if token exists
    if (import.meta.client) {
        const token = useCookie('auth_token').value
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
    }

    return headers
}

/**
 * Handle API error and optionally show toast
 */
function handleError(error: unknown, options: RequestOptions = {}): ApiError {
    const { showToast = true, errorMessage: customMessage } = options

    let apiError: ApiError

    if (error instanceof ApiError) {
        apiError = error
    } else if (error instanceof Error) {
        // Check if it's a fetch error with status
        const fetchError = error as Error & { statusCode?: number; data?: unknown }
        const code = fetchError.statusCode || 500
        const message = customMessage || fetchError.message || getErrorMessage(code)

        apiError = new ApiError(code, message, {
            originalError: fetchError.message,
            data: fetchError.data,
        })
    } else {
        // Unknown error type
        const code = 500
        const message = customMessage || getErrorMessage(code)
        apiError = new ApiError(code, message)
    }

    // Update global error state
    lastError.value = apiError

    // Show toast notification
    if (showToast) {
        const toastMessage = customMessage || apiError.message
        showToastMessage(toastMessage, 'error')
    }

    return apiError
}

/**
 * Parse response and extract data
 */
function parseResponse<T>(response: unknown): T {
    try {
        // If response is already in the expected format
        if (typeof response === 'object' && response !== null) {
            const apiResponse = response as ApiResponse<T>

            if ('code' in apiResponse && 'data' in apiResponse) {
                // Check for API-level errors (code !== 0 or code >= 400)
                if (apiResponse.code !== 0 && apiResponse.code >= 400) {
                    throw new ApiError(apiResponse.code, apiResponse.message || getErrorMessage(apiResponse.code))
                }
                return apiResponse.data
            }
        }

        // Return raw response if structure doesn't match
        return response as T
    } catch (e) {
        console.error('[useApi] parseResponse error:', e, response)
        throw e
    }
}

// =============================================================================
// Core HTTP Methods
// =============================================================================

/**
 * Make a GET request
 */
async function get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint, params)
        const response = await $fetch<unknown>(url, {
            method: 'GET',
            headers: { ...getDefaultHeaders(), ...headers },
            timeout,
            signal,
        })

        return parseResponse<T>(response)
    } catch (error) {
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

/**
 * Make a POST request
 */
async function post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint, params)
        console.log('[useApi] POST:', url, body)

        const response = await $fetch<unknown>(url, {
            method: 'POST',
            headers: { ...getDefaultHeaders(), ...headers },
            body,
            timeout,
            signal,
        })

        console.log('[useApi] Response:', response)

        return parseResponse<T>(response)
    } catch (error) {
        console.error('[useApi] POST error:', error)
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

/**
 * Make a PUT request
 */
async function put<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint, params)
        const response = await $fetch<unknown>(url, {
            method: 'PUT',
            headers: { ...getDefaultHeaders(), ...headers },
            body,
            timeout,
            signal,
        })

        return parseResponse<T>(response)
    } catch (error) {
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

/**
 * Make a DELETE request
 */
async function del<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint, params)
        const response = await $fetch<unknown>(url, {
            method: 'DELETE',
            headers: { ...getDefaultHeaders(), ...headers },
            timeout,
            signal,
        })

        return parseResponse<T>(response)
    } catch (error) {
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

/**
 * Make a PATCH request
 */
async function patch<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint, params)
        const response = await $fetch<unknown>(url, {
            method: 'PATCH',
            headers: { ...getDefaultHeaders(), ...headers },
            body,
            timeout,
            signal,
        })

        return parseResponse<T>(response)
    } catch (error) {
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

// =============================================================================
// Convenience Methods
// =============================================================================

/**
 * Upload a file with progress tracking
 */
async function uploadFile<T>(
    endpoint: string,
    file: File,
    options: RequestOptions & {
        fieldName?: string
        additionalData?: Record<string, unknown>
        onProgress?: (progress: number) => void
    } = {}
): Promise<T> {
    const { fieldName = 'file', additionalData = {}, headers, timeout, signal, showToast, throwOnError, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint)
        const formData = new FormData()
        formData.append(fieldName, file)

        // Add additional data to form
        for (const [key, value] of Object.entries(additionalData)) {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value))
            }
        }

        const response = await $fetch<unknown>(url, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData, let browser handle it
                Accept: 'application/json',
                ...headers,
            },
            timeout,
            signal,
        })

        return parseResponse<T>(response)
    } catch (error) {
        const apiError = handleError(error, { showToast, throwOnError, errorMessage })
        if (throwOnError !== false) {
            throw apiError
        }
        return null as T
    } finally {
        loadingCounter.value--
    }
}

/**
 * Download a file (returns blob URL)
 */
async function downloadFile(
    endpoint: string,
    options: RequestOptions & {
        filename?: string
    } = {}
): Promise<string | null> {
    const { filename, headers, timeout, signal, showToast, errorMessage } = options

    loadingCounter.value++

    try {
        const url = buildUrl(endpoint)
        const response = await $fetch<Blob>(url, {
            method: 'GET',
            headers: {
                ...getDefaultHeaders(),
                Accept: '*/*',
                ...headers,
            },
            responseType: 'blob',
            timeout,
            signal,
        })

        // Create blob URL
        const blobUrl = URL.createObjectURL(response)

        // If filename provided, trigger download (client-side only)
        if (filename && import.meta.client) {
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }

        return blobUrl
    } catch (error) {
        handleError(error, { showToast, errorMessage })
        return null
    } finally {
        loadingCounter.value--
    }
}

/**
 * Clear the last error
 */
function clearError(): void {
    lastError.value = null
}

/**
 * Reset all API state
 */
function reset(): void {
    loadingCounter.value = 0
    lastError.value = null
}

// =============================================================================
// Composable Export
// =============================================================================

/**
 * Centralized API service layer for all backend communication
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { get, post, loading } = useApi()
 *
 * // GET request
 * const data = await get<UserData>('/user/profile')
 *
 * // POST request
 * const result = await post<CreateResult>('/share', { type: 'file', data: fileId })
 *
 * // With options
 * const data = await get<Config>('/config', {
 *   showToast: false, // Disable error toast
 *   throwOnError: false, // Return null instead of throwing
 * })
 *
 * // Check loading state
 * if (loading.value) {
 *   // Show loading indicator
 * }
 *
 * // Error handling
 * try {
 *   const data = await get<Data>('/endpoint', { throwOnError: true })
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.code, error.message)
 *   }
 * }
 * ```
 */
export function useApi() {
    return {
        // Core HTTP methods
        get,
        post,
        put,
        patch,
        del,

        // Convenience methods
        uploadFile,
        downloadFile,

        // State
        loading: readonly(isLoading),
        error: readonly(lastError),

        // Utilities
        clearError,
        reset,

        // Error class for type checking
        ApiError,

        // Helper functions exposed for advanced use
        getErrorMessage,
        getNetworkErrorMessage,
        buildUrl,
    }
}

// =============================================================================
// Domain-Specific API Types (aligned with existing composables)
// =============================================================================

/**
 * Share creation response
 */
export interface ShareResponse {
    id?: string
    download_nums?: number
    expire_at?: number
    file_name?: string
    pickup_code?: string
    token?: string
}

/**
 * File upload info
 */
export interface FileInfo {
    id: string
    name: string
    size?: number
    type?: string
}

/**
 * Share configuration
 */
export interface ShareConfig {
    download_nums: number
    expire_time: number
    has_pickup_code?: boolean
    has_password?: boolean
    pickup_code?: string
    password?: string
    notify_email?: string
}

/**
 * Download token response
 */
export interface DownloadTokenResponse {
    token?: string
}

/**
 * Application config response
 */
export interface AppConfig {
    site_title: Record<string, string>
    site_desc: Record<string, string>
    site_url: string
    site_icon: string
    site_bg_url: string
    version: string
    build_time: number
}
