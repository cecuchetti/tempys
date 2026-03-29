import type { ComputedRef } from 'vue'
import type { DashboardStats, ActivityItem, WeeklyActivity, SystemMetric } from './useDashboard'

export interface UseMockDashboardReturn {
    stats: ComputedRef<DashboardStats>
    recentActivity: ComputedRef<ActivityItem[]>
    weeklyActivity: ComputedRef<WeeklyActivity[]>
    systemMetrics: ComputedRef<SystemMetric[]>
}

// Mock dashboard data
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

export function useMockDashboard(): UseMockDashboardReturn {
    const stats = computed(() => mockStats)
    const recentActivity = computed(() => mockRecentActivity)
    const weeklyActivity = computed(() => mockWeeklyActivity)
    const systemMetrics = computed(() => mockSystemMetrics)

    return {
        stats,
        recentActivity,
        weeklyActivity,
        systemMetrics,
    }
}
