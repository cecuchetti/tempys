<script setup lang="ts">
import { LucideBell, LucideLanguages } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import showDrawer from '@/lib/showDrawer'
import I18nSwitchDrawer from './Drawer/I18nSwitchDrawer.vue'

const route = useRoute()
const router = useRouter()
const { t, locale: currentLocale, setLocale } = useI18n()

// Map route paths to screen titles
const screenTitles: Record<string, string> = {
    '/upload': 'topbar.vaultCenter',
    '/text': 'topbar.sharedText',
    '/links': 'topbar.myLinks',
    '/analytics': 'topbar.analytics',
    '/settings': 'topbar.settings',
}

const currentPageTitle = computed(() => {
    return screenTitles[route.path] || 'topbar.vaultCenter'
})

// Locale map for display
const localeMap: Record<string, string> = {
    'zh-CN': 'CN',
    en: 'EN',
    es: 'ES',
}

// Locale aria labels for accessibility
const localeAriaLabels: Record<string, string> = {
    'zh-CN': 'Switch to Chinese',
    en: 'Switch to English',
    es: 'Switch to Spanish',
}

const openLanguageDrawer = () => {
    showDrawer({
        render: () => h(I18nSwitchDrawer),
    })
}

// Available locales for quick switch
const availableLocales = ['en', 'es', 'zh-CN']

// Switch locale function
const handleSetLocale = async (locale: string) => {
    await setLocale(locale as any)
    navigateTo(route.path, { external: true })
}
</script>

<template>
    <header
        class="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20"
        role="banner"
    >
        <div class="flex justify-between items-center h-16 px-4 lg:px-8">
            <!-- Left Side: Screen Title + Language Quick Switch -->
            <div class="flex items-center gap-4 lg:gap-6">
                <!-- Mobile Menu Toggle Spacer -->
                <div class="lg:hidden w-8" aria-hidden="true"></div>
                <h1 class="font-headline text-lg lg:text-xl font-bold text-white tracking-tight">
                    {{ t(currentPageTitle) }}
                </h1>
                <!-- Language Quick Switchers (desktop) -->
                <div
                    class="hidden lg:flex items-center gap-4 text-[11px] font-bold tracking-widest text-on-surface-variant"
                    role="group"
                    aria-label="Language selection"
                >
                    <button
                        v-for="loc in availableLocales"
                        :key="loc"
                        @click="handleSetLocale(loc)"
                        :aria-label="localeAriaLabels[loc]"
                        :aria-current="currentLocale === loc ? 'true' : undefined"
                        :class="
                            cn(
                                'min-h-[44px] min-w-[44px] px-2 hover:text-white transition-all focus-ring rounded',
                                currentLocale === loc && 'text-primary'
                            )
                        "
                    >
                        {{ localeMap[loc] || loc }}
                    </button>
                </div>
            </div>

            <!-- Right Side: Actions + User -->
            <div class="flex items-center gap-4 lg:gap-6">
                <!-- Notifications + Language Actions -->
                <div class="flex items-center gap-3 lg:gap-4">
                    <!-- Notifications Bell - Touch target 44x44px minimum -->
                    <button
                        class="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-white transition-all opacity-80 hover:opacity-100 relative focus-ring rounded-lg"
                        aria-label="View notifications"
                    >
                        <LucideBell class="w-5 h-5" aria-hidden="true" />
                        <span
                            class="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-surface"
                            aria-label="Unread notifications"
                        ></span>
                    </button>
                    <!-- Language Switcher (mobile) -->
                    <button
                        @click="openLanguageDrawer"
                        class="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-white transition-all opacity-80 hover:opacity-100 lg:hidden focus-ring rounded-lg"
                        aria-label="Change language"
                    >
                        <LucideLanguages class="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <!-- User Avatar -->
                <div class="flex items-center gap-2 lg:gap-3 pl-4 lg:pl-6 border-l border-white/10">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-white">{{ t('topbar.guest') }}</p>
                        <p class="text-[10px] text-primary font-bold uppercase tracking-widest">
                            {{ t('topbar.freeAccount') }}
                        </p>
                    </div>
                    <button
                        class="w-[44px] h-[44px] rounded-full bg-primary-container flex items-center justify-center border border-primary/20 overflow-hidden focus-ring"
                        aria-label="User account menu"
                    >
                        <img src="https://i.pravatar.cc/150?img=68" alt="" class="w-full h-full object-cover" role="presentation" />
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
