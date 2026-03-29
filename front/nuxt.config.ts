import tailwindcss from '@tailwindcss/vite'
import getApiBaseUrl from './lib/getApiBaseUrl'
import { defineNuxtModule } from '@nuxt/kit'

// Custom module to fix shadcn-nuxt duplicate component warnings
// This must be listed AFTER 'shadcn-nuxt' in the modules array
const fixShadcnDuplicates = defineNuxtModule({
    meta: { name: 'fix-shadcn-duplicates' },
    setup(_, nuxt) {
        // Hook into components:dirs AFTER shadcn-nuxt has added its configuration
        nuxt.hook('components:dirs', (dirs) => {
            // Find and modify all directories to only scan .vue files
            // This prevents index.ts files from being scanned as components
            for (const dir of dirs) {
                if (typeof dir === 'object' && dir.path) {
                    dir.extensions = ['vue']
                    dir.pattern = '**/*.vue'
                }
            }
        })
    },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    css: ['@/assets/css/main.css'],
    modules: [
        // '@serwist/nuxt',
        '@vueuse/nuxt',
        'motion-v/nuxt',
        'nuxt-lucide-icons',
        'shadcn-nuxt',
        fixShadcnDuplicates, // Must come AFTER shadcn-nuxt
        '@vee-validate/nuxt',
        '@pinia/nuxt',
        '@nuxt/image',
        '@nuxtjs/i18n',
        'vue3-pixi-nuxt',
    ],
    // serwist: {},
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'zh-CN', name: '中文(简体)', file: 'zh-CN.json' },
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'es', name: 'Español', file: 'es.json' },
        ],
        // Disable the deprecated optimizeTranslationDirective feature
        bundle: {
            optimizeTranslationDirective: false,
        },
    },
    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: [
                'eventemitter3',
                // First wave - runtime discovered dependencies
                '@tanstack/vue-query',
                'reka-ui',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
                'lodash-es',
                'lucide-vue-next',
                'nanoid',
                'vue-sonner',
                'dayjs',
                'axios',
                'filesize',
                'markdown-it',
                'qrcode',
                'tiptap-markdown',
                '@tiptap/vue-3',
                '@tiptap/starter-kit',
                '@tiptap/extension-placeholder',
                'vue3-pixi',
                // Second wave - dayjs plugins and locales
                'dayjs/plugin/relativeTime',
                'dayjs/locale/en',
                'dayjs/locale/zh-cn',
                'dayjs/locale/es',
                'vaul-vue',
                // Third wave - additional dependencies
                'spark-md5',
                '@unovis/ts',
                '@unovis/vue',
            ],
        },
    },
    nitro: {
        routeRules: {
            '/api/**': {
                proxy: `${getApiBaseUrl()}/**`,
            },
        },
    },
    devServer: {
        port: 3000,
    },
})
