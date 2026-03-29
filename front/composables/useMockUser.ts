import type { ComputedRef } from 'vue'
import type { UserProfile, UserPreferences } from './useUser'

export interface UseMockUserReturn {
    profile: ComputedRef<UserProfile>
    preferences: ComputedRef<UserPreferences>
}

// Mock user data
const mockProfile: UserProfile = {
    id: 'usr_882k',
    name: 'Enrique Cuchetti',
    email: 'enriquecuchetti@gmail.com',
    avatar: 'https://picsum.photos/seed/user/200/200',
    plan: 'pro',
    planId: '882-K',
    timezone: 'GMT-3 (Buenos Aires)',
    twoFactorEnabled: false,
    linksHiddenFromSearch: true,
}

const mockPreferences: UserPreferences = {
    theme: 'dark',
    language: 'en',
    defaultExpiration: '24h',
    notifyOnPickup: true,
}

export function useMockUser(): UseMockUserReturn {
    const profile = computed(() => mockProfile)
    const preferences = computed(() => mockPreferences)

    return {
        profile,
        preferences,
    }
}
