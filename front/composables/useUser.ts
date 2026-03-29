import type { ComputedRef, Ref } from 'vue'
import { useApi, type ApiError } from './useApi'

// =============================================================================
// Types
// =============================================================================

/**
 * User subscription plan type
 */
export type UserPlan = 'free' | 'pro' | 'enterprise'

/**
 * Theme preference type
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * User profile data
 */
export interface UserProfile {
    id: string
    name: string
    email: string
    avatar: string | null
    plan: UserPlan
    planId: string
    timezone: string
    twoFactorEnabled: boolean
    linksHiddenFromSearch: boolean
    createdAt?: string
    updatedAt?: string
}

/**
 * User preferences
 */
export interface UserPreferences {
    theme: ThemePreference
    language: string
    defaultExpiration: string
    notifyOnPickup: boolean
    emailNotifications?: boolean
}

/**
 * User settings update request
 */
export interface UserSettingsUpdate {
    name?: string
    timezone?: string
    theme?: ThemePreference
    language?: string
    twoFactorEnabled?: boolean
    linksHiddenFromSearch?: boolean
}

/**
 * API response for user profile
 */
export interface UserApiResponse {
    id?: string
    name?: string
    email?: string
    avatar?: string | null
    plan?: UserPlan
    plan_id?: string
    timezone?: string
    two_factor_enabled?: boolean
    links_hidden_from_search?: boolean
    preferences?: {
        theme?: ThemePreference
        language?: string
        default_expiration?: string
        notify_on_pickup?: boolean
    }
}

/**
 * Composable return type
 */
export interface UseUserReturn {
    profile: ComputedRef<UserProfile>
    preferences: ComputedRef<UserPreferences>
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<ApiError | null>>
    isInitialized: ComputedRef<boolean>
    fetchProfile: () => Promise<void>
    updateProfile: (updates: UserSettingsUpdate) => Promise<boolean>
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>
    reset: () => void
}

// =============================================================================
// Mock Fallback Data
// =============================================================================

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
    emailNotifications: true,
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Transform API response to user profile
 */
function transformUserProfile(response: UserApiResponse): UserProfile {
    return {
        id: response.id ?? mockProfile.id,
        name: response.name ?? mockProfile.name,
        email: response.email ?? mockProfile.email,
        avatar: response.avatar ?? mockProfile.avatar,
        plan: response.plan ?? mockProfile.plan,
        planId: response.plan_id ?? mockProfile.planId,
        timezone: response.timezone ?? mockProfile.timezone,
        twoFactorEnabled: response.two_factor_enabled ?? mockProfile.twoFactorEnabled,
        linksHiddenFromSearch: response.links_hidden_from_search ?? mockProfile.linksHiddenFromSearch,
    }
}

/**
 * Transform API response to user preferences
 */
function transformUserPreferences(response: UserApiResponse): UserPreferences {
    const prefs = response.preferences ?? {}
    return {
        theme: prefs.theme ?? mockPreferences.theme,
        language: prefs.language ?? mockPreferences.language,
        defaultExpiration: prefs.default_expiration ?? mockPreferences.defaultExpiration,
        notifyOnPickup: prefs.notify_on_pickup ?? mockPreferences.notifyOnPickup,
        emailNotifications: prefs.email_notifications ?? mockPreferences.emailNotifications,
    }
}

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable for managing user profile and preferences with API integration
 *
 * @example
 * ```typescript
 * const { profile, preferences, loading, updateProfile } = useUser()
 *
 * // Access profile data
 * console.log(profile.value.name)
 * console.log(preferences.value.theme)
 *
 * // Update profile
 * await updateProfile({ name: 'New Name' })
 *
 * // Check loading state
 * if (loading.value) {
 *   // Show loading spinner
 * }
 * ```
 */
export function useUser(): UseUserReturn {
    const { get, put, loading, error } = useApi()

    // Reactive state
    const profile = ref<UserProfile>({ ...mockProfile })
    const preferences = ref<UserPreferences>({ ...mockPreferences })
    const useMockData = ref(false)
    const initialized = ref(false)

    // Computed properties
    const isInitialized = computed(() => initialized.value)

    /**
     * Fetch user profile from API
     */
    const fetchProfile = async (): Promise<void> => {
        try {
            // Try to fetch from the user profile API// Note: The backend may not have a /user/profile endpoint yet,
            // so we attempt the call and fall back to mock data if it fails
            const response = await get<UserApiResponse>('/user/profile', {
                showToast: false,
                throwOnError: false,
            })

            if (response) {
                // Transform API response to our format
                profile.value = transformUserProfile(response)
                preferences.value = transformUserPreferences(response)
                useMockData.value = false
            } else {
                // API returned null, use mock data
                console.warn('[useUser] API not available, using mock data')
                profile.value = { ...mockProfile }
                preferences.value = { ...mockPreferences }
                useMockData.value = true
            }

            initialized.value = true
        } catch (e) {
            // API call failed, use mock data as fallback
            console.warn('[useUser] API not available, using mock data:', e)
            profile.value = { ...mockProfile }
            preferences.value = { ...mockPreferences }
            useMockData.value = true
            initialized.value = true

            // Clear error since we're using fallback data
            error.value = null
        }
    }

    /**
     * Update user profile
     */
    const updateProfile = async (updates: UserSettingsUpdate): Promise<boolean> => {
        try {
            if (useMockData.value) {
                // Mock update - just update local state
                if (updates.name) profile.value.name = updates.name
                if (updates.timezone) profile.value.timezone = updates.timezone
                if (updates.twoFactorEnabled !== undefined) profile.value.twoFactorEnabled = updates.twoFactorEnabled
                if (updates.linksHiddenFromSearch !== undefined) {
                    profile.value.linksHiddenFromSearch = updates.linksHiddenFromSearch
                }
                return true
            }

            // Transform updates to snake_case for API
            const apiUpdates: Record<string, unknown> = {}
            if (updates.name) apiUpdates.name = updates.name
            if (updates.timezone) apiUpdates.timezone = updates.timezone
            if (updates.twoFactorEnabled !== undefined) apiUpdates.two_factor_enabled = updates.twoFactorEnabled
            if (updates.linksHiddenFromSearch !== undefined) {
                apiUpdates.links_hidden_from_search = updates.linksHiddenFromSearch
            }

            // Call API to update
            const response = await put<UserApiResponse>('/user/profile', apiUpdates, {
                showToast: true,
                throwOnError: true,
            })

            // Update local state with response
            if (response) {
                profile.value = transformUserProfile(response)
                preferences.value = transformUserPreferences(response)
            }

            return true
        } catch (e) {
            console.error('[useUser] Failed to update profile:', e)
            return false
        }
    }

    /**
     * Update user preferences
     */
    const updatePreferences = async (prefs: Partial<UserPreferences>): Promise<boolean> => {
        try {
            if (useMockData.value) {
                // Mock update - just update local state
                Object.assign(preferences.value, prefs)
                return true
            }

            // Transform preferences to snake_case for API
            const apiPrefs: Record<string, unknown> = {}
            if (prefs.theme) apiPrefs.theme = prefs.theme
            if (prefs.language) apiPrefs.language = prefs.language
            if (prefs.defaultExpiration) apiPrefs.default_expiration = prefs.defaultExpiration
            if (prefs.notifyOnPickup !== undefined) apiPrefs.notify_on_pickup = prefs.notifyOnPickup

            // Call API to update
            const response = await put<UserApiResponse>(
                '/user/preferences',
                { preferences: apiPrefs },
                {
                    showToast: true,
                    throwOnError: true,
                }
            )

            // Update local state with response
            if (response && response.preferences) {
                preferences.value = transformUserPreferences(response)
            }

            return true
        } catch (e) {
            console.error('[useUser] Failed to update preferences:', e)
            return false
        }
    }

    /**
     * Reset to initial state
     */
    const reset = (): void => {
        profile.value = { ...mockProfile }
        preferences.value = { ...mockPreferences }
        initialized.value = false
    }

    // Auto-fetch on mount (client-side only to avoid SSR issues)
    if (import.meta.client) {
        onMounted(() => {
            fetchProfile()
        })
    }

    return {
        profile: computed(() => profile.value),
        preferences: computed(() => preferences.value),
        loading: readonly(loading),
        error: readonly(error),
        isInitialized,
        fetchProfile,
        updateProfile,
        updatePreferences,
        reset,
    }
}
