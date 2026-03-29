<script setup lang="ts">
import {
    LucideClock,
    LucideZap,
    LucideEyeOff,
    LucideTimer,
    LucideBell,
    LucideFileText,
    LucideLink,
    LucideChevronRight,
    LucideBan,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()

// Editor state
const title = ref('Server configuration notes')
const content = ref(`## Temporary API Key
AUTH_TOKEN=8x92-jk11-po09-zz61
REGION=us-east-1

## Production DB Access
DB_URL=postgresql://admin:temporary-secret@10.0.0.5:5432/vault_db

Note: This config expires after first read by the deployment script.`)
const lastEdited = ref('2m ago')

// Security options
const oneTimeRead = ref(true)
const notifyOnAccess = ref(false)
const selectedExpiration = ref('1hour')

const expirationOptions = [
    { value: '10min', label: '10 Minutes' },
    { value: '1hour', label: '1 Hour' },
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
]

// Recent snippets mock data
const recentSnippets = ref([
    { id: '1', title: 'Temporary API Key', createdAt: '1h ago', reads: 1, type: 'text', status: 'active' },
    { id: '2', title: 'Meeting Link - QA', createdAt: '3h ago', reads: 0, type: 'link', status: 'expired' },
    { id: '3', title: 'Draft Protocol v2', createdAt: 'yesterday', reads: 0, type: 'text', status: 'active' },
])

const getSnippetIcon = (type: string) => {
    return type === 'text' ? LucideFileText : LucideLink
}
</script>

<template>
    <div class="grid grid-cols-12 gap-10">
        <!-- Editor Section -->
        <div class="col-span-12 lg:col-span-8 space-y-8">
            <section class="bg-surface-container-low rounded-2xl p-1 shadow-2xl overflow-hidden">
                <div class="bg-surface p-8 rounded-[calc(1rem-1px)] min-h-[500px] flex flex-col">
                    <div class="flex items-center justify-between mb-8">
                        <div class="space-y-1">
                            <input
                                v-model="title"
                                class="bg-transparent border-none focus:ring-0 text-2xl font-headline font-extrabold text-primary placeholder:text-on-surface-variant/30 p-0 w-full"
                                :placeholder="t('textShare.untitled')"
                            />
                            <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                                <LucideClock class="w-3.5 h-3.5" />
                                <span>{{ t('textShare.lastEdited') }} {{ lastEdited }}</span>
                            </div>
                        </div>
                        <button
                            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-on-primary-container text-on-primary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(173,198,255,0.2)] transition-all active:scale-95"
                        >
                            <LucideZap class="w-4 h-4" />
                            <span>{{ t('textShare.generateLink') }}</span>
                        </button>
                    </div>
                    <textarea
                        v-model="content"
                        class="flex-1 bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-on-surface/90 font-mono placeholder:text-on-surface-variant/20 resize-none p-0"
                        :placeholder="t('textShare.editorPlaceholder')"
                    />
                </div>
            </section>
        </div>

        <!-- Settings & History -->
        <div class="col-span-12 lg:col-span-4 space-y-8">
            <section class="bg-surface-container-high rounded-2xl p-8 space-y-8 border border-white/5">
                <h3 class="font-headline font-bold text-lg text-white">{{ t('textShare.security.title') }}</h3>
                <div class="space-y-6">
                    <!-- One-time read -->
                    <div class="flex items-center justify-between group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                                <LucideEyeOff class="w-5 h-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-on-surface">{{ t('textShare.security.oneTimeRead.title') }}</p>
                                <p class="text-[11px] text-on-surface-variant">{{ t('textShare.security.oneTimeRead.description') }}</p>
                            </div>
                        </div>
                        <button
                            @click="oneTimeRead = !oneTimeRead"
                            :aria-pressed="oneTimeRead"
                            :aria-label="oneTimeRead ? t('textShare.security.oneTimeRead.disable') : t('textShare.security.oneTimeRead.enable')"
                            :class="
                                cn(
                                    'w-11 h-6 rounded-full relative cursor-pointer transition-colors min-h-[44px] min-w-[44px] focus-ring',
                                    oneTimeRead ? 'bg-tertiary' : 'bg-surface-container-highest'
                                )
                            "
                        >
                            <div :class="cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all', oneTimeRead ? 'right-1' : 'left-1')" />
                        </button>
                    </div>

                    <!-- Expiration -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                                <LucideTimer class="w-5 h-5" />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-on-surface">{{ t('textShare.security.autoExpiration.title') }}</p>
                                <p class="text-[11px] text-on-surface-variant">{{ t('textShare.security.autoExpiration.description') }}</p>
                            </div>
                        </div>
                        <select
                            v-model="selectedExpiration"
                            class="w-full bg-surface-container-highest border-none rounded-xl text-sm focus:ring-1 focus:ring-primary/50 text-on-surface py-3 px-4 appearance-none"
                        >
                            <option v-for="opt in expirationOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Notify on access -->
                    <div class="flex items-center gap-4 pt-2">
                        <div class="w-5 h-5 bg-surface-container-highest border border-white/10 rounded flex items-center justify-center">
                            <div v-if="notifyOnAccess" class="w-2 h-2 bg-primary rounded-sm" />
                        </div>
                        <label class="text-sm font-medium text-on-surface cursor-pointer" @click="notifyOnAccess = !notifyOnAccess">
                            {{ t('textShare.security.notifyAccess') }}
                        </label>
                    </div>
                </div>
            </section>

            <!-- Recent Snippets -->
            <section class="space-y-4">
                <div class="flex items-center justify-between px-2">
                    <h3 class="font-headline font-bold text-lg text-white">{{ t('textShare.recentSnippets') }}</h3>
                    <button class="text-xs font-bold text-primary hover:underline">{{ t('textShare.viewAll') }}</button>
                </div>
                <div class="space-y-3">
                    <div
                        v-for="snippet in recentSnippets"
                        :key="snippet.id"
                        class="bg-surface-container-low hover:bg-surface-bright p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all border border-transparent hover:border-white/5"
                    >
                        <div class="flex items-center gap-4">
                            <component
                                :is="getSnippetIcon(snippet.type)"
                                class="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors"
                            />
                            <div>
                                <p class="text-sm font-bold text-on-surface">{{ snippet.title }}</p>
                                <p class="text-[10px] uppercase tracking-wider text-on-surface-variant">
                                    {{ t('textShare.created') }} {{ snippet.createdAt }} • {{ snippet.reads }}
                                    {{ snippet.reads === 1 ? t('textShare.reads') : t('textShare.reads') }}
                                </p>
                            </div>
                        </div>
                        <LucideBan v-if="snippet.status === 'expired'" class="w-4 h-4 text-error" />
                        <LucideChevronRight v-else class="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
