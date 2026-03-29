<script lang="ts" setup>
import { Toaster } from 'vue-sonner'
import { LucideMenu } from 'lucide-vue-next'

const { locale } = useI18n()
await useSeo({ locale: locale.value })
const appConfig = useMyAppConfig()
const bgUrl = computed(() => appConfig.value?.site_bg_url)

// Track mounted state for client-only rendering
const mounted = ref(false)
onMounted(() => {
    mounted.value = true
})

// Mobile menu state
const mobileOpen = ref(false)
const sidebarRef = ref<{ toggleMobile: () => void } | null>(null)

const toggleMobile = () => {
    if (sidebarRef.value) {
        sidebarRef.value.toggleMobile()
    } else {
        mobileOpen.value = !mobileOpen.value
    }
}
</script>

<template>
    <div class="flex min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/30 selection:text-white overflow-x-hidden">
        <!-- Global Components -->
        <GlobalDrawer />
        <ClientOnly>
            <GlobalDayjs />
        </ClientOnly>
        <ClientOnly>
            <Toaster position="top-center" richColors closeButton />
        </ClientOnly>

        <!-- Skip to main content link for keyboard users - WCAG 2.4.1 -->
        <a href="#main-content" class="skip-link"> Skip to main content </a>

        <!-- Mobile Menu Toggle (visible on mobile only) - Touch target 44x44px minimum -->
        <button
            @click="toggleMobile"
            class="fixed top-4 left-4 z-50 lg:hidden min-h-[44px] min-w-[44px] p-2.5 bg-surface-container-high rounded-lg border border-white/5 shadow-lg focus-ring"
            aria-label="Open navigation menu"
            :aria-expanded="mobileOpen"
            aria-controls="main-sidebar"
        >
            <LucideMenu class="w-5 h-5 text-on-surface" aria-hidden="true" />
        </button>

        <!-- Sidebar - Fixed -->
        <Sidebar ref="sidebarRef" id="main-sidebar" />

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
            <!-- TopBar - Fixed at the top of content area -->
            <TopBar />

            <!-- Scrollable Content Container -->
            <main id="main-content" class="flex-1 pt-24 pb-12 px-4 lg:px-8 xl:px-12 max-w-7xl mx-auto w-full" tabindex="-1">
                <NuxtPage
                    :transition="{
                        name: 'page',
                        mode: 'out-in',
                    }"
                />
            </main>
        </div>

        <!-- Subtle Background Orbs -->
        <div class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
            <!-- Primary orb - top left -->
            <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <!-- Tertiary orb - bottom right -->
            <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px]" />
        </div>
    </div>
</template>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
