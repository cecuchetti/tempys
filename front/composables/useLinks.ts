import type { ComputedRef, Ref } from 'vue'
import { useApi, type ApiError } from './useApi'

// =============================================================================
// Types
// =============================================================================

/**
 * Link status type
 */
export type LinkStatus = 'active' | 'expired' | 'one-time'

/**
 * Link type (file or text share)
 */
export type LinkType = 'file' | 'text'

/**
 * Link data structure for display
 */
export interface Link {
    id: string
    name: string
    shortLink: string
    status: LinkStatus
    clicks: number
    createdAt: string
    size?: string
    filesCount?: number
    type: LinkType
    password?: boolean
    oneTimeRead?: boolean
    expiresAt?: string
}

/**
 * API response for links list
 */
export interface LinksApiResponse {
    links: Link[]
    total: number
    page: number
    pageSize: number
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number
    pageSize?: number
    sortBy?: 'createdAt' | 'name' | 'clicks'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Filter options for links
 */
export interface LinkFilters {
    type?: LinkType | 'all'
    status?: LinkStatus | 'all'
    search?: string
}

/**
 * Composable return type
 */
export interface UseLinksReturn {
    links: ComputedRef<Link[]>
    totalLinks: ComputedRef<number>
    storageUsed: ComputedRef<number>
    engagement24h: ComputedRef<number>
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<ApiError | null>>
    pagination: Ref<PaginationParams>
    hasMore: ComputedRef<boolean>
    fetchLinks: (filters?: LinkFilters) => Promise<void>
    refreshLinks: () => Promise<void>
    loadMore: () => Promise<void>
    deleteLink: (id: string) => Promise<boolean>
    copyLink: (shortLink: string) => Promise<void>
}

// =============================================================================
// Mock Fallback Data
// =============================================================================

/**
 * Mock data used as fallback when API is not available
 */
const mockLinksData: Link[] = [
    {
        id: '1',
        name: 'branding_assets.zip',
        shortLink: 'tempys.link/brand-24',
        status: 'active',
        clicks: 412,
        createdAt: 'May 12, 2024',
        size: '42.5 MB',
        filesCount: 4,
        type: 'file',
    },
    {
        id: '2',
        name: 'API_Key_Secret',
        shortLink: 'tempys.link/x7u9q2',
        status: 'one-time',
        clicks: 0,
        createdAt: 'May 14, 2024',
        type: 'text',
        oneTimeRead: true,
    },
    {
        id: '3',
        name: 'q3_marketing_banner.png',
        shortLink: 'tempys.link/q3-banner',
        status: 'expired',
        clicks: 1204,
        createdAt: 'Apr 20, 2024',
        size: '1.2 MB',
        type: 'file',
    },
    {
        id: '4',
        name: 'project_brief_v2.pdf',
        shortLink: 'tempys.link/brief-v2',
        status: 'active',
        clicks: 89,
        createdAt: 'May 15, 2024',
        size: '2.8 MB',
        type: 'file',
    },
    {
        id: '5',
        name: 'Server Config Notes',
        shortLink: 'tempys.link/srv-cfg',
        status: 'active',
        clicks: 34,
        createdAt: 'May 16, 2024',
        type: 'text',
    },
    {
        id: '6',
        name: 'team_photo_2024.jpg',
        shortLink: 'tempys.link/team-24',
        status: 'expired',
        clicks: 567,
        createdAt: 'Mar 10, 2024',
        size: '8.4 MB',
        type: 'file',
    },
    {
        id: '7',
        name: 'Deployment Script',
        shortLink: 'tempys.link/deploy-sh',
        status: 'one-time',
        clicks: 1,
        createdAt: 'May 17, 2024',
        type: 'text',
        oneTimeRead: true,
    },
]

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable for managing user links with API integration
 *
 * @example
 * ```typescript
 * const { links, loading, error, fetchLinks, deleteLink } = useLinks()
 *
 * // Initial fetch
 * await fetchLinks()
 *
 * // With filters
 * await fetchLinks({ type: 'file', status: 'active' })
 *
 * // Delete a link
 * await deleteLink('link-id')
 *
 * // Check loading state
 * if (loading.value) {
 *   // Show loading spinner
 * }
 * ```
 */
export function useLinks(): UseLinksReturn {
    const { get, del, loading, error } = useApi()

    // Reactive state
    const links = ref<Link[]>([])
    const totalItems = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const useMockData = ref(false)

    const pagination = ref<PaginationParams>({
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    })

    // Computed properties
    const displayedLinks = computed(() => links.value)

    const totalLinks = computed(() => {
        return links.value.filter((l) => l.status === 'active' || l.status === 'one-time').length
    })

    const activeLinks = computed(() => {
        return links.value.filter((l) => l.status === 'active').length
    })

    const storageUsed = computed(() => {
        // This would typically come from a stats API
        return 92 // percentage
    })

    const engagement24h = computed(() => {
        // This would typically come from a stats API
        return links.value.reduce((acc, link) => acc + link.clicks, 0)
    })

    const hasMore = computed(() => {
        return currentPage.value * pageSize.value < totalItems.value
    })

    /**
     * Fetch links from API with optional filters
     */
    const fetchLinks = async (filters?: LinkFilters): Promise<void> => {
        // Try to fetch from the API
        // Note: The backend may not have a /user/shares endpoint yet,
        // so we attempt the call and fall back to mock data if it fails
        const params: Record<string, unknown> = {
            page: pagination.value.page,
            pageSize: pagination.value.pageSize,
            sortBy: pagination.value.sortBy,
            sortOrder: pagination.value.sortOrder,
            ...filters,
        }

        // Remove undefined values
        Object.keys(params).forEach((key) => {
            if (params[key] === undefined || params[key] === 'all') {
                delete params[key]
            }
        })

        let response: LinksApiResponse | Link[] | null = null

        // Attempt API call - use /user/shares endpoint
        try {
            response = await get<LinksApiResponse | Link[]>('/user/shares', {
                params,
                showToast: false,
                throwOnError: false,
            })
        } catch (apiError) {
            // API call failed (network error, etc.)
            console.warn('[useLinks] API call failed:', apiError)
            response = null
        }

        // Check if response is valid
        if (response) {
            // Handle both array response and wrapped response
            if (Array.isArray(response)) {
                links.value = response
                totalItems.value = response.length
            } else if ('shares' in response) {
                // Backend returns { shares: [...], total: number }
                const apiResponse = response as { shares: Record<string, unknown>[]; total?: number }
                links.value = apiResponse.shares.map((raw) => transformApiShare(raw))
                totalItems.value = apiResponse.total || apiResponse.shares.length
            } else if ('links' in response) {
                // Alternative format { links: [...], total: number }
                const apiResponse = response as { links: Link[]; total?: number }
                links.value = apiResponse.links
                totalItems.value = apiResponse.total || apiResponse.links.length
            }
            useMockData.value = false
        } else {
            // API returned null, use mock data
            console.warn('[useLinks] API not available, using mock data')
            links.value = mockLinksData
            totalItems.value = mockLinksData.length
            useMockData.value = true
        }
    }

    /**
     * Transform API share response to Link format
     */
    function transformApiShare(raw: Record<string, unknown>): Link {
        const baseUrl = import.meta.client ? window.location.origin : 'https://tempys.link'

        // Determine status based on expiration
        const expireAt = (raw.expireAt || raw.expire_at) as number
        const views = (raw.views || raw.ViewNum || raw.viewNum || raw.views_left || 0) as number
        const viewsLeft = (raw.viewsLeft || raw.views_left) as number | undefined

        let status: LinkStatus = 'active'
        if (expireAt && expireAt < Date.now() / 1000) {
            status = 'expired'
        } else if (viewsLeft === 0 || (views > 0 && viewsLeft === undefined)) {
            status = 'one-time'
        }

        return {
            id: raw.id as string,
            name: (raw.name || raw.file_name || 'Untitled') as string,
            shortLink: `${baseUrl}/s/${raw.id}`,
            status,
            clicks: views,
            createdAt: formatDate(raw.createdAt || raw.created_at || Date.now()),
            size: raw.size ? formatSize(raw.size as number) : undefined,
            type: (raw.type as LinkType) || 'file',
            password: raw.has_password as boolean,
        }
    }

    /**
     * Format date for display
     */
    function formatDate(date: number | string): string {
        const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    /**
     * Format file size for display
     */
    function formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    /**
     * Refresh links (re-fetch current data)
     */
    const refreshLinks = async (): Promise<void> => {
        await fetchLinks()
    }

    /**
     * Load more links (next page)
     */
    const loadMore = async (): Promise<void> => {
        if (!hasMore.value) return

        pagination.value.page++
        await fetchLinks()
    }

    /**
     * Delete a link by ID
     */
    const deleteLink = async (id: string): Promise<boolean> => {
        try {
            if (useMockData.value) {
                // Mock deletion - just remove from local array
                links.value = links.value.filter((link) => link.id !== id)
                return true
            }

            // Call API to delete
            await del(`/share/${id}`, {
                showToast: true,
                throwOnError: true,
            })

            // Remove from local state on success
            links.value = links.value.filter((link) => link.id !== id)
            totalItems.value--

            return true
        } catch (e) {
            console.error('[useLinks] Failed to delete link:', e)
            return false
        }
    }

    /**
     * Copy link to clipboard
     */
    const copyLink = async (shortLink: string): Promise<void> => {
        try {
            if (import.meta.client && navigator.clipboard) {
                await navigator.clipboard.writeText(shortLink)
                // Show success toast via i18n
                const { $i18n } = useNuxtApp()
                const toast = (await import('vue-sonner')).toast
                toast.success($i18n?.t?.('links.copied') || 'Link copied to clipboard')
            }
        } catch (e) {
            console.error('[useLinks] Failed to copy link:', e)
        }
    }

    return {
        links: displayedLinks,
        totalLinks,
        storageUsed,
        engagement24h,
        loading: readonly(loading),
        error: readonly(error),
        pagination,
        hasMore,
        fetchLinks,
        refreshLinks,
        loadMore,
        deleteLink,
        copyLink,
    }
}
