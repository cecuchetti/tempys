/**
 * Composable for sending share links to groups
 *
 * Provides reactive state and methods for sending share links to recipients in a group.
 * Falls back to mock data when API is unavailable.
 */

import { recipientsApi } from '@/services/api/recipients'
import type { SendRequest, SendResult, ShareLink } from '@/types/recipients'

// Mock share links for fallback
const mockShareLinks: ShareLink[] = [
    {
        id: 'share-1',
        name: 'Q4 Report.pdf',
        shortLink: 'tempys.link/q4-report',
        type: 'file',
    },
    {
        id: 'share-2',
        name: 'Project Guidelines.txt',
        shortLink: 'tempys.link/guidelines',
        type: 'text',
    },
    {
        id: 'share-3',
        name: 'Design Assets.zip',
        shortLink: 'tempys.link/design',
        type: 'file',
    },
    {
        id: 'share-4',
        name: 'API Documentation',
        shortLink: 'tempys.link/api-doc',
        type: 'text',
    },
]

export interface UseSendLinksReturn {
    shares: Ref<ShareLink[]>
    sending: Readonly<Ref<boolean>>
    sendResult: Readonly<Ref<SendResult | null>>
    fetchUserShares: () => Promise<void>
    sendToGroup: (groupId: string, shareIds: string[]) => Promise<SendResult | null>
    clearSendResult: () => void
}

export function useSendLinks(): UseSendLinksReturn {
    const shares = ref<ShareLink[]>([])
    const sending = ref(false)
    const sendResult = ref<SendResult | null>(null)
    const useMockData = ref(false)

    /**
     * Fetch user's share links
     */
    const fetchUserShares = async (): Promise<void> => {
        try {
            const response = await recipientsApi.getUserShares()

            if (response) {
                shares.value = response
                useMockData.value = false
            } else {
                console.warn('[useSendLinks] API not available, using mock data')
                shares.value = mockShareLinks
                useMockData.value = true
            }
        } catch (e) {
            console.error('[useSendLinks] Failed to fetch shares:', e)
            shares.value = mockShareLinks
            useMockData.value = true
        }
    }

    /**
     * Send share links to a group
     */
    const sendToGroup = async (groupId: string, shareIds: string[]): Promise<SendResult | null> => {
        sending.value = true
        sendResult.value = null

        try {
            if (useMockData.value) {
                // Mock sending delay
                await new Promise((resolve) => setTimeout(resolve, 1500))

                // Return mock success result
                const mockResult: SendResult = {
                    sent: shareIds.length,
                    failures: [],
                }
                sendResult.value = mockResult
                return mockResult
            }

            const data: SendRequest = { groupId, shareIds }
            const result = await recipientsApi.sendToGroup(data)

            if (result) {
                sendResult.value = result
            }

            return result
        } catch (e) {
            console.error('[useSendLinks] Failed to send links:', e)
            return null
        } finally {
            sending.value = false
        }
    }

    /**
     * Clear the send result
     */
    const clearSendResult = (): void => {
        sendResult.value = null
    }

    return {
        shares,
        sending: readonly(sending),
        sendResult: readonly(sendResult) as Readonly<Ref<SendResult | null>>,
        fetchUserShares,
        sendToGroup,
        clearSendResult,
    }
}
