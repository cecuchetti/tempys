import type { UserShare, UserSharesResponse } from '@/types/api'
import { useApi } from './useApi'

/**
 * Composable for fetching and managing user's shares (My Links page)
 *
 * This composable handles:
 * - Fetching user's shares from the API
 * - Caching and reactivity
 * - Error and loading states
 * - Pagination support
 *
 * @example
 * ```vue
 * <script setup>
 * const { shares, total, loading, error, refresh } = useUserShares()
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else>
 *     <div v-for="share in shares" :key="share.id">{{ share.name }}</div>
 *   </div>
 * </template>
 * ```
 */

// Share type helper for status determination
type ShareType = 'file' | 'text'
type ShareStatus = 'active' | 'expired' | 'one-time'

// Local state for shares
const sharesCache = ref<UserShare[]>([])
const totalCache = ref(0)
const lastFetchTime = ref(0)
const CACHE_TTL = 30000 // 30 seconds cache

/**
 * Determines share status based on expiration and download count
 */
function determineStatus(share: UserShare): ShareStatus {
    // One-time shares (download_nums === 1 and clicks >= 1)
    if (share.clicks >= 1 && share.type === 'text') {
        // Could be one-time read text
        return 'one-time'
    }

    // Check if expired
    const expiresAt = new Date(share.expires_at).getTime()
    if (expiresAt < Date.now()) {
        return 'expired'
    }

    return 'active'
}

/**
 * Formats a share ID into a short link
 */
function formatShortLink(id: string): string {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.siteUrl as string) || 'https://tempys.link'
    return `${baseUrl}/${id}`
}

/**
 * Transform raw API response to UserShare format
 */
function transformShare(raw: Record<string, unknown>): UserShare {
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = (raw.expire_at as number) || now
    const createdAt = (raw.created_at as number) || now

    const share: UserShare = {
        id: raw.id as string,
        type: (raw.type as ShareType) || 'file',
        name: (raw.name || raw.file_name || 'Untitled') as string,
        short_link: formatShortLink(raw.id as string),
        status: 'active',
        clicks: (raw.clicks || raw.download_nums || 0) as number,
        created_at: new Date(createdAt * 1000).toISOString(),
        expires_at: new Date(expiresAt * 1000).toISOString(),
    }

    // Calculate status
    share.status = determineStatus(share)

    // Add file-specific fields if present
    if (raw.size) {
        share.size = raw.size as number
    }
    if (raw.files_count) {
        share.files_count = raw.files_count as number
    }

    return share
}

export interface UseUserSharesOptions {
    /**
     * Whether to fetch immediately on mount
     * @default true
     */
    immediate?: boolean
    /**
     * Cache key for deduplication
     */
    key?: string
    /**
     * Whether to use cached data if available
     * @default true
     */
    useCache?: boolean
}

export interface UseUserSharesReturn {
    /**
     * List of user shares
     */
    shares: ComputedRef<UserShare[]>
    /**
     * Total number of shares
     */
    total: ComputedRef<number>
    /**
     * Loading state
     */
    loading: ComputedRef<boolean>
    /**
     * Error state
     */
    error: ComputedRef<Error | null>
    /**
     * Whether data has been fetched at least once
     */
    initialized: ComputedRef<boolean>
    /**
     * Refresh shares from API
     */
    refresh: () => Promise<void>
    /**
     * Clear cache and reload
     */
    reload: () => Promise<void>
    /**
     * Invalidate cache (mark as stale)
     */
    invalidate: () => void
}

// Global loading state from useApi
const { loading: apiLoading } = useApi()

export function useUserShares(options: UseUserSharesOptions = {}): UseUserSharesReturn {
    const { immediate = true, useCache = true } = options

    // Local state
    const errorState = ref<Error | null>(null)
    const initializedState = ref(false)
    const fetching = ref(false)

    // Computed
    const loading = computed(() => apiLoading.value || fetching.value)
    const error = computed(() => errorState.value)
    const initialized = computed(() => initializedState.value)
    const shares = computed(() => sharesCache.value)
    const total = computed(() => totalCache.value)

    /**
     * Fetch shares from API
     */
    async function fetchShares(): Promise<void> {
        // Check cache
        if (useCache && lastFetchTime.value > 0) {
            const now = Date.now()
            if (now - lastFetchTime.value < CACHE_TTL) {
                // Cache is still valid
                return
            }
        }

        fetching.value = true
        errorState.value = null

        try {
            const { get } = useApi()

            // Call the user shares endpoint
            const response = await get<UserSharesResponse | Record<string, unknown>>('/user/shares', {
                throwOnError: true,
                showToast: false, // We'll handle errors ourselves
            })

            // Transform response
            if (response && 'shares' in response) {
                sharesCache.value = response.shares.map(transformShare)
                totalCache.value = response.total || response.shares.length
            } else if (Array.isArray(response)) {
                // Handle array response
                const shares = (response as Record<string, unknown>[]).map(transformShare)
                sharesCache.value = shares
                totalCache.value = shares.length
            }

            lastFetchTime.value = Date.now()
            initializedState.value = true
        } catch (err) {
            errorState.value = err instanceof Error ? err : new Error(String(err))
            console.error('[useUserShares] Fetch error:', err)
            // Don't show toast - let the component handle it
        } finally {
            fetching.value = false
        }
    }

    /**
     * Refresh from API (respects cache)
     */
    async function refresh(): Promise<void> {
        await fetchShares()
    }

    /**
     * Clear cache and reload
     */
    async function reload(): Promise<void> {
        lastFetchTime.value = 0
        await fetchShares()
    }

    /**
     * Mark cache as stale
     */
    function invalidate(): void {
        lastFetchTime.value = 0
    }

    // Auto-fetch on mount if immediate
    if (immediate && import.meta.client) {
        onMounted(() => {
            fetchShares()
        })
    }

    return {
        shares,
        total,
        loading,
        error,
        initialized,
        refresh,
        reload,
        invalidate,
    }
}

/**
 * Computed helpers for filtering shares
 */
export function useShareFilters(shares: ComputedRef<UserShare[]>) {
    const activeFilter = ref<string>('all')

    const filteredShares = computed(() => {
        switch (activeFilter.value) {
            case 'files':
                return shares.value.filter((s) => s.type === 'file')
            case 'text':
                return shares.value.filter((s) => s.type === 'text')
            case 'active':
                return shares.value.filter((s) => s.status === 'active' || s.status === 'one-time')
            case 'expired':
                return shares.value.filter((s) => s.status === 'expired')
            default:
                return shares.value
        }
    })

    const stats = computed(() => ({
        total: shares.value.length,
        active: shares.value.filter((s) => s.status === 'active').length,
        expired: shares.value.filter((s) => s.status === 'expired').length,
        files: shares.value.filter((s) => s.type === 'file').length,
        texts: shares.value.filter((s) => s.type === 'text').length,
    }))

    return {
        activeFilter,
        filteredShares,
        stats,
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
    if (!bytes) return ''

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format date for display
 */
export function formatShareDate(date: string | number): string {
    const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}
