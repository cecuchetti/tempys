/**
 * Composable for managing groups
 *
 * Provides reactive state and methods for fetching, creating, updating, and deleting groups.
 * Falls back to mock data when API is unavailable.
 */

import { recipientsApi } from '@/services/api/recipients'
import type { Group, CreateGroupData, UpdateGroupData } from '@/types/recipients'

// Mock data for fallback when API is unavailable
const mockGroups: Group[] = [
    {
        id: 'group-1',
        userId: 'user-1',
        name: 'Marketing Team',
        recipientIds: ['1', '2'],
        recipientCount: 2,
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now() - 86400000 * 5,
    },
    {
        id: 'group-2',
        userId: 'user-1',
        name: 'Engineering',
        recipientIds: ['3', '4', '5'],
        recipientCount: 3,
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now() - 86400000 * 2,
    },
    {
        id: 'group-3',
        userId: 'user-1',
        name: 'Design Team',
        recipientIds: ['1', '3'],
        recipientCount: 2,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000,
    },
]

export interface UseGroupsReturn {
    groups: Ref<Group[]>
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<string | null>>
    fetchGroups: () => Promise<void>
    createGroup: (data: CreateGroupData) => Promise<Group | null>
    updateGroup: (id: string, data: UpdateGroupData) => Promise<Group | null>
    deleteGroup: (id: string) => Promise<boolean>
    getGroupById: (id: string) => Group | undefined
}

export function useGroups(): UseGroupsReturn {
    const groups = ref<Group[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const useMockData = ref(false)

    /**
     * Fetch all groups from API
     */
    const fetchGroups = async (): Promise<void> => {
        loading.value = true
        error.value = null

        try {
            const response = await recipientsApi.getGroups()

            if (response) {
                groups.value = response
                useMockData.value = false
            } else {
                // API returned null, use mock data
                console.warn('[useGroups] API not available, using mock data')
                groups.value = mockGroups
                useMockData.value = true
            }
        } catch (e) {
            console.error('[useGroups] Failed to fetch groups:', e)
            error.value = 'Failed to load groups'
            // Fallback to mock data
            groups.value = mockGroups
            useMockData.value = true
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new group
     */
    const createGroup = async (data: CreateGroupData): Promise<Group | null> => {
        if (useMockData.value) {
            // Mock creation
            const newGroup: Group = {
                id: `group-${Date.now()}`,
                userId: 'user-1',
                name: data.name,
                recipientIds: data.recipientIds || [],
                recipientCount: data.recipientIds?.length || 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            groups.value.push(newGroup)
            return newGroup
        }

        const created = await recipientsApi.createGroup(data)
        if (created) {
            groups.value.push(created)
            return created
        }
        return null
    }

    /**
     * Update an existing group
     */
    const updateGroup = async (id: string, data: UpdateGroupData): Promise<Group | null> => {
        if (useMockData.value) {
            // Mock update
            const index = groups.value.findIndex((g) => g.id === id)
            const existing = groups.value[index]
            if (index !== -1 && existing) {
                const updated: Group = {
                    id: existing.id,
                    userId: existing.userId,
                    name: data.name ?? existing.name,
                    recipientIds: data.recipientIds ?? existing.recipientIds,
                    recipientCount: data.recipientIds?.length ?? existing.recipientCount,
                    createdAt: existing.createdAt,
                    updatedAt: Date.now(),
                }
                groups.value[index] = updated
                return updated
            }
            return null
        }

        const updated = await recipientsApi.updateGroup(id, data)
        if (updated) {
            const index = groups.value.findIndex((g) => g.id === id)
            if (index !== -1) {
                groups.value[index] = updated
            }
        }
        return updated
    }

    /**
     * Delete a group by ID
     */
    const deleteGroup = async (id: string): Promise<boolean> => {
        if (useMockData.value) {
            // Mock deletion
            groups.value = groups.value.filter((g) => g.id !== id)
            return true
        }

        const success = await recipientsApi.deleteGroup(id)
        if (success) {
            groups.value = groups.value.filter((g) => g.id !== id)
        }
        return success
    }

    /**
     * Get a group by ID
     */
    const getGroupById = (id: string): Group | undefined => {
        return groups.value.find((g) => g.id === id)
    }

    return {
        groups,
        loading: readonly(loading),
        error: readonly(error),
        fetchGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        getGroupById,
    }
}
