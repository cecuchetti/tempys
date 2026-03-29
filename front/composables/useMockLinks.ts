import type { ComputedRef } from 'vue'
import type { Link } from './useLinks'

// Re-export for backward compatibility
export type MockLink = Link

export interface UseMockLinksReturn {
    links: ComputedRef<MockLink[]>
    totalLinks: ComputedRef<number>
    activeLinks: ComputedRef<number>
    storageUsed: ComputedRef<number>
    engagement24h: ComputedRef<number>
}

// Mock data for links
const mockLinksData: MockLink[] = [
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
    },
]

export function useMockLinks(): UseMockLinksReturn {
    const links = computed(() => mockLinksData)

    const totalLinks = computed(() => mockLinksData.filter((l) => l.status === 'active' || l.status === 'one-time').length)

    const activeLinks = computed(() => mockLinksData.filter((l) => l.status === 'active').length)

    const storageUsed = computed(() => 92) // percentage

    const engagement24h = computed(() => 2482)

    return {
        links,
        totalLinks,
        activeLinks,
        storageUsed,
        engagement24h,
    }
}
