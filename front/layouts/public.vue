<script lang="ts" setup>
import { Toaster } from 'vue-sonner'

const { locale } = useI18n()
const appConfig = useMyAppConfig()

// Track mounted state for client-only rendering
const mounted = ref(false)
onMounted(() => {
    mounted.value = true
})
</script>

<template>
    <div class="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/30 selection:text-white">
        <!-- Global Components -->
        <ClientOnly>
            <GlobalDayjs />
        </ClientOnly>
        <ClientOnly>
            <Toaster position="top-center" richColors closeButton />
        </ClientOnly>

        <!-- Background Orbs -->
        <div class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
            <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px]" />
        </div>

        <!-- Header -->
        <header class="relative z-10 px-6 py-6 lg:px-12">
            <div class="max-w-4xl mx-auto flex items-center justify-between">
                <NuxtLink to="/" class="flex items-center gap-3">
                    <h1 class="text-2xl font-black tracking-tighter text-primary">Tempys</h1>
                    <span class="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 hidden sm:inline">
                        {{ $t('public.tagline') }}
                    </span>
                </NuxtLink>
            </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 px-6 py-8 lg:px-12">
            <div class="max-w-2xl mx-auto">
                <slot />
            </div>
        </main>

        <!-- Footer -->
        <footer class="relative z-10 px-6 py-8 lg:px-12 mt-auto">
            <div class="max-w-4xl mx-auto">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-on-surface-variant/60">
                    <p class="font-medium">&copy; {{ new Date().getFullYear() }} Tempys. {{ $t('public.footer.rights') }}</p>
                    <div class="flex items-center gap-4">
                        <a href="#privacy" class="hover:text-on-surface transition-colors focus-ring rounded">
                            {{ $t('public.footer.privacy') }}
                        </a>
                        <a href="#terms" class="hover:text-on-surface transition-colors focus-ring rounded">
                            {{ $t('public.footer.terms') }}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style>
/* Page transitions for public layout */
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
