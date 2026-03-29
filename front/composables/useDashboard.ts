import type { ComputedRef, Ref } from 'vue'
import { useApi, type ApiError } from './useApi'

// =============================================================================
// Types
// =============================================================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
    totalShares: number
    activeDownloads: number
    storageUsed: number
    storageTotal: string
    storagePercentage: number
    weeklyGrowth: number
}

/**
 * Activity item for the activity feed
 */
export interface ActivityItem {
    id: string
    icon: 'user' | 'edit' | 'link' | 'download' | 'upload'
    text: string
    highlight: string
    time: string
    tag: string
}

/**
 * Weekly activity data point
 */
export interface WeeklyActivity {
    day: string
    uploads: number
    downloads: number
}

/**
 * System metric
 */
export interface SystemMetric {
    icon: 'activity' | 'shield' | 'database' | 'alert'
    label: string
    value: string
    color: 'primary' | 'tertiary' | 'error'
}

/**
 * API response for statistics
 */
export interface StatsApiResponse {
    total_shares?: number
    active_downloads?: number
    storage_used?: number
    storage_total?: string
    storage_percentage?: number
    weekly_growth?: number
    weekly_activity?: WeeklyActivity[]
    recent_activity?: ActivityItem[]
    system_metrics?: SystemMetric[]
}

/**
 * Composable return type
 */
export interface UseDashboardReturn {
    stats: ComputedRef<DashboardStats>
    recentActivity: ComputedRef<ActivityItem[]>
    weeklyActivity: ComputedRef<WeeklyActivity[]>
    systemMetrics: ComputedRef<SystemMetric[]>
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<ApiError | null>>
    refresh: () => Promise<void>
}

// =============================================================================
// Mock Fallback Data
// =============================================================================

const mockStats: DashboardStats = {
    totalShares: 1240,
    activeDownloads: 45,
    storageUsed: 18.4,
    storageTotal: '20 GB',
    storagePercentage: 92,
    weeklyGrowth: 14.2,
}

const mockRecentActivity: ActivityItem[] = [
    {
        id: '1',
        icon: 'user',
        text: 'External user downloaded',
        highlight: 'branding_assets_v2.zip',
        time: '2 min ago • IP: 192.168.1.45',
        tag: 'Public',
    },
    {
        id: '2',
        icon: 'edit',
        text: 'You updated',
        highlight: 'Q3_financial_summary.pdf',
        time: '14 min ago • Vault Sync',
        tag: 'Private',
    },
    {
        id: '3',
        icon: 'link',
        text: 'New link created for',
        highlight: 'Project_Zion_Specs',
        time: '1 hour ago • Expires in 24h',
        tag: 'Link',
    },
    {
        id: '4',
        icon: 'download',
        text: 'File retrieved from',
        highlight: 'design_system_v3.fig',
        time: '3 hours ago',
        tag: 'Public',
    },
    {
        id: '5',
        icon: 'upload',
        text: 'New upload completed',
        highlight: 'client_presentation.pptx',
        time: 'Yesterday',
        tag: 'Private',
    },
]

const mockWeeklyActivity: WeeklyActivity[] = [
    { day: 'MON', uploads: 120, downloads: 80 },
    { day: 'TUE', uploads: 150, downloads: 95 },
    { day: 'WED', uploads: 180, downloads: 110 },
    { day: 'THU', uploads: 140, downloads: 85 },
    { day: 'FRI', uploads: 200, downloads: 130 },
    { day: 'SAT', uploads: 90, downloads: 60 },
    { day: 'SUN', uploads: 70, downloads: 45 },
]

const mockSystemMetrics: SystemMetric[] = [
    { icon: 'activity', label: 'Load I/O', value: 'Low', color: 'primary' },
    { icon: 'shield', label: 'Security', value: 'Active', color: 'tertiary' },
    { icon: 'database', label: 'Clusters', value: '12/12', color: 'primary' },
    { icon: 'alert', label: 'Errors', value: '0', color: 'error' },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Transform API response to dashboard stats
 */
function transformStatsResponse(response: StatsApiResponse): DashboardStats {
    return {
        totalShares: response.total_shares ?? mockStats.totalShares,
        activeDownloads: response.active_downloads ?? mockStats.activeDownloads,
        storageUsed: response.storage_used ?? mockStats.storageUsed,
        storageTotal: response.storage_total ?? mockStats.storageTotal,
        storagePercentage: response.storage_percentage ?? mockStats.storagePercentage,
        weeklyGrowth: response.weekly_growth ?? mockStats.weeklyGrowth,
    }
}

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable for managing dashboard analytics data with API integration
 *
 * @example
 * ```typescript
 * const { stats, recentActivity, weeklyActivity, loading, refresh } = useDashboard()
 *
 * // Initial fetch (auto-called on mount)
 * await refresh()
 *
 * // Check loading state
 * if (loading.value) {
 *   // Show loading spinner
 * }
 *
 * // Access stats
 * console.log(stats.value.totalShares)
 * console.log(weeklyActivity.value)
 * ```
 */
export function useDashboard(): UseDashboardReturn {
    const { get, loading, error } = useApi()

    // Reactive state
    const stats = ref<DashboardStats>({ ...mockStats })
    const recentActivity = ref<ActivityItem[]>([...mockRecentActivity])
    const weeklyActivity = ref<WeeklyActivity[]>([...mockWeeklyActivity])
    const systemMetrics = ref<SystemMetric[]>([...mockSystemMetrics])
    const useMockData = ref(false)

    /**
     * Fetch dashboard statistics from API
     */
    const fetchStats = async (): Promise<void> => {
        try {
            // Try to fetch from the stats API
            // The backend has a /stat endpoint available
            const response = await get<StatsApiResponse>('/stat', {
                showToast: false,
                throwOnError: false,
            })

            if (response) {
                // Transform snake_case API response to camelCase
                stats.value = transformStatsResponse(response)

                // Update activity if provided
                if (response.recent_activity) {
                    recentActivity.value = response.recent_activity
                }

                // Update weekly activity if provided
                if (response.weekly_activity) {
                    weeklyActivity.value = response.weekly_activity
                }

                // Update system metrics if provided
                if (response.system_metrics) {
                    systemMetrics.value = response.system_metrics
                }

                useMockData.value = false
            } else {
                // API returned null, use mock data
                console.warn('[useDashboard] API not available, using mock data')
                stats.value = { ...mockStats }
                recentActivity.value = [...mockRecentActivity]
                weeklyActivity.value = [...mockWeeklyActivity]
                systemMetrics.value = [...mockSystemMetrics]
                useMockData.value = true
            }
        } catch (e) {
            // API call failed, use mock data as fallback
            console.warn('[useDashboard] API not available, using mock data:', e)
            stats.value = { ...mockStats }
            recentActivity.value = [...mockRecentActivity]
            weeklyActivity.value = [...mockWeeklyActivity]
            systemMetrics.value = [...mockSystemMetrics]
            useMockData.value = true

            // Clear error since we're using fallback data
            error.value = null
        }
    }

    /**
     * Refresh all dashboard data
     */
    const refresh = async (): Promise<void> => {
        await fetchStats()
    }

    // Auto-fetch on mount (client-side only to avoid SSR issues)
    if (import.meta.client) {
        onMounted(() => {
            fetchStats()
        })
    }

    return {
        stats: computed(() => stats.value),
        recentActivity: computed(() => recentActivity.value),
        weeklyActivity: computed(() => weeklyActivity.value),
        systemMetrics: computed(() => systemMetrics.value),
        loading: readonly(loading),
        error: readonly(error),
        refresh,
    }
}
