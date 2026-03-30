/**
 * Composable for managing recipients
 *
 * Provides reactive state and methods for fetching, creating, and deleting recipients.
 * Falls back to mock data when API is unavailable.
 */

import { recipientsApi } from '@/services/api/recipients'
import type { Recipient, RecipientFilters, SubmitRecipientData } from '@/types/recipients'

// Mock data for fallback when API is unavailable
const mockRecipients: Recipient[] = [
    {
        id: '1',
        shareId: 'share-1',
        userId: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: Date.now() - 86400000 * 7,
    },
    {
        id: '2',
        shareId: 'share-1',
        userId: 'user-1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        createdAt: Date.now() - 86400000 * 5,
    },
    {
        id: '3',
        shareId: 'share-2',
        userId: 'user-1',
        name: 'Bob Johnson',
        phone: '+1234567890',
        createdAt: Date.now() - 86400000 * 3,
    },
    {
        id: '4',
        shareId: 'share-1',
        userId: 'user-1',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        createdAt: Date.now() - 86400000 * 2,
    },
    {
        id: '5',
        shareId: 'share-3',
        userId: 'user-1',
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        phone: '+1987654321',
        createdAt: Date.now() - 86400000,
    },
]

export interface UseRecipientsReturn {
    recipients: Ref<Recipient[]>
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<string | null>>
    fetchRecipients: (filters?: RecipientFilters) => Promise<void>
    deleteRecipient: (id: string) => Promise<boolean>
    submitRecipient: (data: SubmitRecipientData) => Promise<{ success: boolean; alreadyRegistered?: boolean; recipient?: Recipient }>
    getTotalCount: () => number
    getThisWeekCount: () => number
    getCountByShare: () => Record<string, number>
}

export function useRecipients(): UseRecipientsReturn {
    const recipients = ref<Recipient[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const useMockData = ref(false)

    /**
     * Fetch recipients from API with optional filters
     */
    const fetchRecipients = async (filters?: RecipientFilters): Promise<void> => {
        loading.value = true
        error.value = null

        try {
            const response = await recipientsApi.getRecipients(filters)

            if (response) {
                recipients.value = response
                useMockData.value = false
            } else {
                // API returned null, use mock data
                console.warn('[useRecipients] API not available, using mock data')
                recipients.value = mockRecipients
                useMockData.value = true
            }
        } catch (e) {
            console.error('[useRecipients] Failed to fetch recipients:', e)
            error.value = 'Failed to load recipients'
            // Fallback to mock data
            recipients.value = mockRecipients
            useMockData.value = true
        } finally {
            loading.value = false
        }
    }

    /**
     * Delete a recipient by ID
     */
    const deleteRecipient = async (id: string): Promise<boolean> => {
        if (useMockData.value) {
            // Mock deletion
            recipients.value = recipients.value.filter((r) => r.id !== id)
            return true
        }

        const success = await recipientsApi.deleteRecipient(id)
        if (success) {
            recipients.value = recipients.value.filter((r) => r.id !== id)
        }
        return success
    }

    /**
     * Submit a new recipient
     */
    const submitRecipient = async (data: SubmitRecipientData): Promise<{ success: boolean; alreadyRegistered?: boolean; recipient?: Recipient }> => {
        try {
            const response = await recipientsApi.submitRecipient(data)

            if (!response) {
                return { success: false }
            }

            // Check if already registered
            if ('alreadyRegistered' in response && response.alreadyRegistered) {
                return {
                    success: true,
                    alreadyRegistered: true,
                    recipient: response.recipient,
                }
            }

            // New recipient created
            return {
                success: true,
                alreadyRegistered: false,
                recipient: response as Recipient,
            }
        } catch (e) {
            console.error('[useRecipients] Failed to submit recipient:', e)
            return { success: false }
        }
    }

    /**
     * Get total recipient count
     */
    const getTotalCount = (): number => {
        return recipients.value.length
    }

    /**
     * Get count of recipients registered this week
     */
    const getThisWeekCount = (): number => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        return recipients.value.filter((r) => r.createdAt > oneWeekAgo).length
    }

    /**
     * Get recipient count grouped by share ID
     */
    const getCountByShare = (): Record<string, number> => {
        const counts: Record<string, number> = {}
        recipients.value.forEach((r) => {
            counts[r.shareId] = (counts[r.shareId] || 0) + 1
        })
        return counts
    }

    return {
        recipients,
        loading: readonly(loading),
        error: readonly(error),
        fetchRecipients,
        deleteRecipient,
        submitRecipient,
        getTotalCount,
        getThisWeekCount,
        getCountByShare,
    }
}
