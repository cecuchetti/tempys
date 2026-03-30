<script setup lang="ts">
import { LucideUploadCloud, LucideFileText, LucideLink, LucideUsers, LucideBarChart3, LucideSettings, LucideActivity, LucideX } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({
    inheritAttrs: false,
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

interface NavItem {
    id: string
    labelKey: string
    icon: any
    path: string
    ariaLabel: string
}

const navItems: NavItem[] = [
    { id: 'upload', labelKey: 'sidebar.upload', icon: LucideUploadCloud, path: '/upload', ariaLabel: 'Navigate to Upload' },
    { id: 'text', labelKey: 'sidebar.text', icon: LucideFileText, path: '/text', ariaLabel: 'Navigate to Shared Text' },
    { id: 'links', labelKey: 'sidebar.links', icon: LucideLink, path: '/links', ariaLabel: 'Navigate to My Links' },
    { id: 'recipients', labelKey: 'sidebar.recipients', icon: LucideUsers, path: '/recipients', ariaLabel: 'Navigate to Recipients' },
    { id: 'analytics', labelKey: 'sidebar.analytics', icon: LucideBarChart3, path: '/analytics', ariaLabel: 'Navigate to Analytics' },
    { id: 'settings', labelKey: 'sidebar.settings', icon: LucideSettings, path: '/settings', ariaLabel: 'Navigate to Settings' },
]

const isActive = (path: string) => {
    return route.path === path
}

const navigateTo = (path: string) => {
    router.push(path)
    // Close mobile menu on navigation
    mobileOpen.value = false
}

// Mobile menu state
const mobileOpen = ref(false)
const sidebarRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)

const toggleMobile = () => {
    mobileOpen.value = !mobileOpen.value
    // Focus management: focus close button when menu opens
    if (mobileOpen.value) {
        nextTick(() => {
            closeButtonRef.value?.focus()
        })
    }
}

// Close on escape key
onMounted(() => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            mobileOpen.value = false
        }
    }
    window.addEventListener('keydown', handleEscape)
    onUnmounted(() => {
        window.removeEventListener('keydown', handleEscape)
    })
})

// TODO: Get storage usage from API
const storageUsed = ref(92)

// Expose toggle function for parent
defineExpose({ toggleMobile })
</script>

<template>
    <!-- Mobile Overlay -->
    <div
        v-if="mobileOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        role="presentation"
        aria-hidden="true"
        @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
        v-bind="$attrs"
        ref="sidebarRef"
        id="main-sidebar"
        :class="
            cn(
                'h-screen w-64 bg-surface-container-low flex flex-col p-4 font-headline text-sm tracking-wide z-50 border-r border-white/5',
                'fixed left-0 top-0',
                // Mobile: slide in/out
                'transition-transform duration-300 ease-out',
                mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )
        "
        role="navigation"
        aria-label="Main navigation"
    >
        <!-- Logo Section -->
        <div class="mb-10 px-2 flex items-center justify-between">
            <NuxtLink to="/upload" class="cursor-pointer" @click="mobileOpen = false" aria-label="Tempys home">
                <h1 class="text-2xl font-black tracking-tighter text-primary">Tempys</h1>
            </NuxtLink>
            <!-- Mobile close button - Touch target 44x44px minimum -->
            <button
                ref="closeButtonRef"
                @click="mobileOpen = false"
                class="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-white transition-colors focus-ring rounded-lg"
                aria-label="Close navigation menu"
            >
                <LucideX class="w-6 h-6" aria-hidden="true" />
            </button>
        </div>
        <p class="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 mb-6 px-2 -mt-6">The Kinetic Vault</p>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1" aria-label="Primary">
            <button
                v-for="item in navItems"
                :key="item.id"
                @click="navigateTo(item.path)"
                :aria-label="item.ariaLabel"
                :aria-current="isActive(item.path) ? 'page' : undefined"
                :class="
                    cn(
                        'w-full min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-95 text-left focus-ring',
                        isActive(item.path)
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    )
                "
            >
                <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
                <span>{{ t(item.labelKey) }}</span>
            </button>
        </nav>

        <!-- Bottom Section -->
        <div class="mt-auto border-t border-white/5 pt-4">
            <!-- Storage Indicator -->
            <div class="px-4 py-3 mb-4 bg-surface-container-high rounded-xl" role="status" aria-label="Storage usage">
                <div class="flex justify-between text-[10px] mb-1 font-bold text-on-surface-variant">
                    <span>{{ t('sidebar.storage') }}</span>
                    <span aria-live="polite">{{ storageUsed }}%</span>
                </div>
                <div
                    class="h-1 bg-surface-container-highest rounded-full overflow-hidden"
                    role="progressbar"
                    :aria-valuenow="storageUsed"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    <div class="h-full bg-tertiary transition-all duration-500 progress-glow" :style="{ width: `${storageUsed}%` }" />
                </div>
            </div>

            <!-- Status Button -->
            <button
                class="w-full min-h-[44px] flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors duration-200 text-left focus-ring rounded-lg"
                aria-label="View system status"
            >
                <LucideActivity class="w-5 h-5" aria-hidden="true" />
                <span>{{ t('sidebar.status') }}</span>
            </button>
        </div>
    </aside>
</template>
