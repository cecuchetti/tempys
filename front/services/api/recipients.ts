/**
 * API Service for Recipients, Groups, and Link Distribution
 *
 * Handles all API calls for the Group Link Distribution feature.
 */

import { useApi } from '@/composables/useApi'
import type {
    Recipient,
    Group,
    ShareLink,
    SendRequest,
    SendResult,
    PublicSharePage,
    SubmitRecipientData,
    RecipientFilters,
    CreateGroupData,
    UpdateGroupData,
} from '@/types/recipients'

const { get, post, put, del } = useApi()

// =============================================================================
// Public Share Page API
// =============================================================================

/**
 * Get public share page information by shareId
 * This endpoint is public and doesn't require authentication
 */
export async function getPublicSharePage(shareId: string): Promise<PublicSharePage | null> {
    return get<PublicSharePage>(`/recipient/page/${shareId}`, {
        showToast: false,
        throwOnError: false,
    })
}

// =============================================================================
// Recipient API
// =============================================================================

/**
 * Submit recipient information to access a shared link
 * This is a public endpoint
 */
export async function submitRecipient(data: SubmitRecipientData): Promise<Recipient | { alreadyRegistered: true; recipient: Recipient } | null> {
    // Backend expects snake_case field names
    const payload = {
        share_id: data.shareId,
        name: data.name,
        email: data.email,
        phone: data.phone,
    }
    return post<Recipient | { alreadyRegistered: true; recipient: Recipient }>('/recipient', payload, {
        showToast: false,
        throwOnError: false,
    })
}

/**
 * Get list of recipients with optional filters
 */
export async function getRecipients(filters?: RecipientFilters): Promise<Recipient[] | null> {
    const params: Record<string, unknown> = {}
    if (filters?.shareId) params.shareId = filters.shareId
    if (filters?.userId) params.userId = filters.userId

    const response = await get<{ recipients: Recipient[]; total: number } | Recipient[]>('/recipient', {
        params: Object.keys(params).length > 0 ? params : undefined,
        showToast: false,
        throwOnError: false,
    })

    if (!response) return null

    // Handle response format - backend returns { recipients: [...], total: number }
    if (response && 'recipients' in response) {
        return response.recipients
    }

    // Handle direct array response
    if (Array.isArray(response)) {
        return response
    }

    return null
}

/**
 * Delete a recipient by ID
 */
export async function deleteRecipient(id: string): Promise<boolean> {
    try {
        await del(`/recipient/${id}`, {
            showToast: true,
            throwOnError: true,
        })
        return true
    } catch {
        return false
    }
}

// =============================================================================
// Group API
// =============================================================================

/**
 * Get list of all groups for the current user
 */
export async function getGroups(): Promise<Group[] | null> {
    const response = await get<{ groups: Group[]; total: number } | Group[]>('/group', {
        showToast: false,
        throwOnError: false,
    })

    if (!response) return null

    // Handle response format - backend returns { groups: [...], total: number }
    if (response && 'groups' in response) {
        return response.groups
    }

    // Handle direct array response
    if (Array.isArray(response)) {
        return response
    }

    return null
}

/**
 * Create a new group
 */
export async function createGroup(data: CreateGroupData): Promise<Group | null> {
    return post<Group>('/group', data, {
        showToast: true,
        throwOnError: true,
    })
}

/**
 * Update an existing group
 */
export async function updateGroup(id: string, data: UpdateGroupData): Promise<Group | null> {
    return put<Group>(`/group/${id}`, data, {
        showToast: true,
        throwOnError: true,
    })
}

/**
 * Delete a group by ID
 */
export async function deleteGroup(id: string): Promise<boolean> {
    try {
        await del(`/group/${id}`, {
            showToast: true,
            throwOnError: true,
        })
        return true
    } catch {
        return false
    }
}

// =============================================================================
// Send Links API
// =============================================================================

/**
 * Send share links to a group of recipients
 */
export async function sendToGroup(data: SendRequest): Promise<SendResult | null> {
    return post<SendResult>(
        `/group/${data.groupId}/send`,
        { shareIds: data.shareIds },
        {
            showToast: true,
            throwOnError: true,
        }
    )
}

// =============================================================================
// User Shares API
// =============================================================================

/**
 * Get list of share links owned by the current user
 * Reuses the existing /user/shares endpoint
 */
export async function getUserShares(): Promise<ShareLink[] | null> {
    const response = await get<{ shares: Array<{ id: string; name: string; short_link: string; type: 'file' | 'text' }>; total: number }>(
        '/user/shares',
        {
            showToast: false,
            throwOnError: false,
        }
    )

    if (!response) return null

    // Transform response to ShareLink format
    if ('shares' in response) {
        return response.shares.map((share) => ({
            id: share.id,
            name: share.name,
            shortLink: share.short_link,
            type: share.type,
        }))
    }

    return null
}

// =============================================================================
// Composable-style API Service
// =============================================================================

/**
 * API service object for composable usage
 */
export const recipientsApi = {
    // Public endpoints
    getPublicSharePage,
    submitRecipient,

    // Recipient endpoints
    getRecipients,
    deleteRecipient,

    // Group endpoints
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,

    // Send endpoints
    sendToGroup,

    // User shares
    getUserShares,
}
