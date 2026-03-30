/**
 * Types for Group Link Distribution feature
 *
 * These types define the structure for recipients, groups, and share link distribution.
 */

/**
 * A recipient who has submitted their info to access a shared link
 */
export interface Recipient {
    id: string
    shareId: string
    userId: string
    name: string
    email?: string
    phone?: string
    createdAt: number
}

/**
 * A group of recipients for bulk distribution
 */
export interface Group {
    id: string
    userId: string
    name: string
    recipientIds: string[]
    recipientCount: number
    createdAt: number
    updatedAt: number
}

/**
 * A share link that can be distributed to recipients
 */
export interface ShareLink {
    id: string
    name: string
    shortLink: string
    type: 'file' | 'text'
}

/**
 * Request payload for sending share links to a group
 */
export interface SendRequest {
    groupId: string
    shareIds: string[]
}

/**
 * Result of sending share links to a group
 */
export interface SendResult {
    sent: number
    failures: Array<{ recipientId: string; reason: string }>
}

/**
 * Public share page information (public landing page data)
 */
export interface PublicSharePage {
    shareId: string
    title: string
    description?: string
}

/**
 * Data for submitting a new recipient
 */
export interface SubmitRecipientData {
    shareId: string
    name: string
    email?: string
    phone?: string
}

/**
 * Filter options for fetching recipients
 */
export interface RecipientFilters {
    shareId?: string
    userId?: string
}

/**
 * Data for creating a new group
 */
export interface CreateGroupData {
    name: string
    recipientIds?: string[]
}

/**
 * Data for updating a group
 */
export interface UpdateGroupData {
    name?: string
    recipientIds?: string[]
}
