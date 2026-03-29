<script setup lang="ts">
import {
    LucideUser,
    LucideShield,
    LucideBell,
    LucideGlobe,
    LucideDatabase,
    LucideKey,
    LucideLogOut,
    LucideChevronRight,
    LucideMoon,
    LucideSun,
    LucideLaptop,
    LucideAlertCircle,
    LucideCheck,
    LucideLoader2,
    LucideRefreshCw,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useUser } from '@/composables/useUser'
import type { ApiError } from '@/composables/useApi'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()
const { profile, preferences, loading, error, updateProfile } = useUser()

// Local form state (initialized from profile)
const publicName = ref('')
const timezone = ref('')
const selectedTheme = ref<'light' | 'dark' | 'system'>('dark')
const twoFactorEnabled = ref(false)
const linksHiddenFromSearch = ref(true)

// Watch for profile changes to update local state
watch(
    () => profile.value,
    (newProfile) => {
        publicName.value = newProfile.name
        timezone.value = newProfile.timezone
        twoFactorEnabled.value = newProfile.twoFactorEnabled
        linksHiddenFromSearch.value = newProfile.linksHiddenFromSearch
    },
    { immediate: true }
)

watch(
    () => preferences.value,
    (newPrefs) => {
        selectedTheme.value = newPrefs.theme
    },
    { immediate: true }
)

// Navigation sections
const sections = [
    { id: 'profile', label: t('settings.nav.profile'), icon: 'user', active: true },
    { id: 'security', label: t('settings.nav.security'), icon: 'shield', active: false },
    { id: 'notifications', label: t('settings.nav.notifications'), icon: 'bell', active: false },
    { id: 'billing', label: t('settings.nav.billing'), icon: 'database', active: false },
    { id: 'api', label: t('settings.nav.api'), icon: 'key', active: false },
]

const activeSection = ref('profile')

// Theme options
const themeOptions = computed(() => [
    { id: 'light', label: t('settings.preferences.theme.light'), icon: 'sun' },
    { id: 'dark', label: t('settings.preferences.theme.dark'), icon: 'moon' },
    { id: 'system', label: t('settings.preferences.theme.system'), icon: 'laptop' },
])

// Icon mapping
const sectionIcons: Record<string, any> = {
    user: LucideUser,
    shield: LucideShield,
    bell: LucideBell,
    database: LucideDatabase,
    key: LucideKey,
}

const themeIcons: Record<string, any> = {
    sun: LucideSun,
    moon: LucideMoon,
    laptop: LucideLaptop,
}

const getSectionIcon = (icon: string) => sectionIcons[icon] || LucideUser
const getThemeIcon = (icon: string) => themeIcons[icon] || LucideSun

// Handle save
const handleSave = async () => {
    await updateProfile({
        name: publicName.value,
        timezone: timezone.value,
        twoFactorEnabled: twoFactorEnabled.value,
        linksHiddenFromSearch: linksHiddenFromSearch.value,
    })
}
</script>

<template>
    <div class="space-y-12">
        <!-- Editorial Header -->
        <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <span class="text-[11px] font-label text-primary uppercase tracking-widest mb-2 block">
                    {{ t('settings.subtitle') }}
                </span>
                <h2 class="text-5xl font-headline font-extrabold tracking-tight text-white">
                    {{ t('settings.title').split(' ')[0] }} <span class="text-primary/50">{{ t('settings.title').split(' ')[1] }}</span>
                </h2>
            </div>
            <div class="flex gap-4">
                <button
                    class="px-8 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl text-sm font-bold text-on-surface-variant flex items-center gap-2"
                >
                    {{ t('settings.discard') }}
                </button>
                <button
                    @click="handleSave"
                    :disabled="loading"
                    class="px-8 py-2.5 bg-gradient-to-r from-primary to-on-primary-container text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <LucideLoader2 v-if="loading" class="w-4 h-4 animate-spin" />
                    {{ t('settings.saveChanges') }}
                </button>
            </div>
        </section>

        <!-- Error State -->
        <div v-if="error" class="flex items-center gap-4 p-4 bg-error/10 border border-error/20 rounded-xl mb-8">
            <LucideAlertCircle class="w-5 h-5 text-error" />
            <p class="text-sm text-error">{{ error.message }}</p>
            <button @click="() => {}" class="ml-auto text-error hover:text-white transition-colors">
                <LucideRefreshCw class="w-4 h-4" />
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-16">
            <LucideLoader2 class="w-8 h-8 text-primary animate-spin" />
            <span class="ml-3 text-on-surface-variant">{{ t('common.loading') || 'Loading...' }}</span>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Navigation Rail -->
            <aside class="lg:col-span-3 space-y-2">
                <button
                    v-for="section in sections"
                    :key="section.id"
                    @click="activeSection = section.id"
                    :class="
                        cn(
                            'w-full flex items-center gap-4 p-4 rounded-xl transition-all group',
                            activeSection === section.id
                                ? 'bg-surface-container-high text-white shadow-lg shadow-black/20'
                                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-white'
                        )
                    "
                >
                    <div
                        :class="
                            cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                                activeSection === section.id
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container-highest group-hover:bg-surface-container-high'
                            )
                        "
                    >
                        <component :is="getSectionIcon(section.icon)" class="w-5 h-5" />
                    </div>
                    <span class="font-headline font-bold text-sm tracking-tight">{{ section.label }}</span>
                    <LucideChevronRight v-if="activeSection === section.id" class="w-4 h-4 ml-auto text-primary" />
                </button>
                <div class="pt-8 mt-8 border-t border-white/5">
                    <button
                        class="w-full flex items-center gap-4 p-4 min-h-[44px] rounded-xl text-error hover:bg-error/10 transition-all group focus-ring"
                        aria-label="Log out of account"
                    >
                        <div class="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center group-hover:bg-error/20 transition-colors">
                            <LucideLogOut class="w-5 h-5" aria-hidden="true" />
                        </div>
                        <span class="font-headline font-bold text-sm tracking-tight">{{ t('settings.logout') }}</span>
                    </button>
                </div>
            </aside>

            <!-- Settings Content -->
            <main class="lg:col-span-9 space-y-12">
                <!-- Profile Section -->
                <section class="space-y-8">
                    <div class="flex items-center gap-8 p-8 bg-surface-container-low rounded-3xl border border-white/5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div class="relative z-10 w-24 h-24 rounded-2xl overflow-hidden group cursor-pointer">
                            <img
                                :src="profile.avatar"
                                alt="Avatar"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                referrerpolicy="no-referrer"
                            />
                            <div
                                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <span class="text-[10px] font-bold text-white uppercase tracking-widest">{{
                                    t('settings.profile.changeAvatar')
                                }}</span>
                            </div>
                        </div>
                        <div class="relative z-10 flex-1">
                            <h3 class="text-2xl font-headline font-bold text-white">{{ profile.name }}</h3>
                            <p class="text-on-surface-variant text-sm mb-4">{{ profile.email }}</p>
                            <div class="flex gap-3">
                                <span
                                    class="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20"
                                >
                                    {{ profile.plan }} Plan
                                </span>
                                <span
                                    class="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/5"
                                >
                                    ID: {{ profile.planId }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block">
                                {{ t('settings.profile.publicName') }}
                            </label>
                            <input
                                v-model="publicName"
                                class="w-full bg-surface-container-low border border-white/5 rounded-xl text-sm p-4 focus:ring-1 focus:ring-primary/50 text-white"
                                type="text"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block">
                                {{ t('settings.profile.timezone') }}
                            </label>
                            <select
                                v-model="timezone"
                                class="w-full bg-surface-container-low border border-white/5 rounded-xl text-sm p-4 focus:ring-1 focus:ring-primary/50 text-white appearance-none"
                            >
                                <option>GMT-3 (Buenos Aires)</option>
                                <option>GMT+0 (London)</option>
                                <option>GMT-5 (New York)</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Preferences Section -->
                <section class="space-y-6">
                    <h3 class="text-lg font-headline font-bold text-white">{{ t('settings.preferences.title') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            v-for="theme in themeOptions"
                            :key="theme.id"
                            @click="selectedTheme = theme.id"
                            :class="
                                cn(
                                    'p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 group',
                                    selectedTheme === theme.id
                                        ? 'bg-surface-container-high border-primary/50 shadow-lg shadow-primary/5'
                                        : 'bg-surface-container-low border-white/5 hover:border-white/10'
                                )
                            "
                        >
                            <component
                                :is="getThemeIcon(theme.icon)"
                                :class="cn('w-6 h-6', selectedTheme === theme.id ? 'text-primary' : 'text-on-surface-variant group-hover:text-white')"
                            />
                            <span
                                :class="
                                    cn(
                                        'text-xs font-bold uppercase tracking-widest',
                                        selectedTheme === theme.id ? 'text-white' : 'text-on-surface-variant group-hover:text-white'
                                    )
                                "
                            >
                                {{ theme.label }}
                            </span>
                        </button>
                    </div>
                </section>

                <!-- Security & Privacy -->
                <section class="space-y-6">
                    <h3 class="text-lg font-headline font-bold text-white">{{ t('settings.security.title') }}</h3>
                    <div class="space-y-4">
                        <!-- Two Factor -->
                        <div
                            class="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-white/5 group hover:bg-surface-container-high transition-all"
                        >
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                                    <LucideShield class="w-5 h-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-white">{{ t('settings.security.twoFactor.title') }}</p>
                                    <p class="text-xs text-on-surface-variant">{{ t('settings.security.twoFactor.description') }}</p>
                                </div>
                            </div>
                            <button
                                @click="twoFactorEnabled = !twoFactorEnabled"
                                :aria-pressed="twoFactorEnabled"
                                :aria-label="twoFactorEnabled ? t('settings.security.twoFactor.disable') : t('settings.security.twoFactor.enable')"
                                :class="
                                    cn(
                                        'w-12 h-6 rounded-full relative p-1 cursor-pointer min-h-[44px] min-w-[44px] focus-ring',
                                        twoFactorEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                                    )
                                "
                            >
                                <span class="sr-only">{{
                                    twoFactorEnabled ? t('settings.security.twoFactor.enabled') : t('settings.security.twoFactor.disabled')
                                }}</span>
                                <div
                                    :class="
                                        cn(
                                            'w-4 h-4 rounded-full transition-all',
                                            twoFactorEnabled ? 'bg-white ml-auto shadow-sm' : 'bg-on-surface-variant'
                                        )
                                    "
                                />
                            </button>
                        </div>

                        <!-- Link Visibility -->
                        <div
                            class="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-white/5 group hover:bg-surface-container-high transition-all"
                        >
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <LucideGlobe class="w-5 h-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-white">{{ t('settings.security.visibility.title') }}</p>
                                    <p class="text-xs text-on-surface-variant">{{ t('settings.security.visibility.description') }}</p>
                                </div>
                            </div>
                            <button
                                @click="linksHiddenFromSearch = !linksHiddenFromSearch"
                                :aria-pressed="linksHiddenFromSearch"
                                :aria-label="linksHiddenFromSearch ? t('settings.security.visibility.show') : t('settings.security.visibility.hide')"
                                :class="
                                    cn(
                                        'w-12 h-6 rounded-full relative p-1 cursor-pointer min-h-[44px] min-w-[44px] focus-ring',
                                        linksHiddenFromSearch ? 'bg-primary' : 'bg-surface-container-highest'
                                    )
                                "
                            >
                                <span class="sr-only">{{
                                    linksHiddenFromSearch ? t('settings.security.visibility.hidden') : t('settings.security.visibility.visible')
                                }}</span>
                                <div
                                    :class="
                                        cn(
                                            'w-4 h-4 rounded-full transition-all',
                                            linksHiddenFromSearch ? 'bg-white ml-auto shadow-sm' : 'bg-on-surface-variant left-0'
                                        )
                                    "
                                />
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Danger Zone -->
                <section class="p-8 bg-error/5 rounded-3xl border border-error/20 space-y-6">
                    <div class="flex items-center gap-4 text-error">
                        <LucideAlertCircle class="w-6 h-6" />
                        <h3 class="text-lg font-headline font-bold">{{ t('settings.dangerZone.title') }}</h3>
                    </div>
                    <p class="text-on-surface-variant text-sm max-w-2xl">
                        {{ t('settings.dangerZone.description') }}
                    </p>
                    <button
                        class="px-8 py-3 bg-error/10 hover:bg-error/20 text-error font-bold rounded-xl text-sm transition-all border border-error/20"
                    >
                        {{ t('settings.dangerZone.deleteAccount') }}
                    </button>
                </section>
            </main>
        </div>
    </div>
</template>
