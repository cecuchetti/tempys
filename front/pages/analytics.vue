<script setup lang="ts">
import {
    LucideCalendar,
    LucideDownload,
    LucideShare2,
    LucideDownloadCloud,
    LucideLink,
    LucideTrendingUp,
    LucideRotateCw,
    LucideUser,
    LucideEdit,
    LucideUploadCloud,
    LucideFileText,
    LucideActivity,
    LucideShield,
    LucideDatabase,
    LucideAlertTriangle,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/composables/useDashboard'
import type { ActivityItem, SystemMetric } from '@/composables/useDashboard'
import DashboardSkeleton from '@/components/analytics/DashboardSkeleton.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()
const { stats, recentActivity, weeklyActivity, systemMetrics, loading, error, refresh } = useDashboard()

// Icon mapping for activity
const activityIcons: Record<string, any> = {
    user: LucideUser,
    edit: LucideEdit,
    link: LucideLink,
    download: LucideDownload,
    upload: LucideUploadCloud,
}

const metricColors: Record<string, string> = {
    primary: 'text-primary',
    tertiary: 'text-tertiary',
    error: 'text-error',
}
</script>

<template>
    <div class="space-y-12">
        <!-- Editorial Header -->
        <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <span class="text-[11px] font-label text-primary uppercase tracking-widest mb-2 block">
                    {{ t('analytics.subtitle') }}
                </span>
                <h2 class="text-5xl font-headline font-extrabold tracking-tight text-white">
                    {{ t('analytics.title').split(' ')[0] }} <span class="text-primary/50">{{ t('analytics.title').split(' ')[1] }}</span>
                </h2>
            </div>
            <div class="flex gap-4">
                <button
                    class="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl text-sm font-medium text-on-surface-variant flex items-center gap-2"
                >
                    <LucideCalendar class="w-4 h-4" />
                    {{ t('analytics.last30Days') }}
                </button>
                <button
                    class="px-6 py-2.5 bg-gradient-to-r from-primary to-on-primary-container text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2"
                >
                    <LucideDownload class="w-4 h-4" />
                    {{ t('analytics.exportReport') }}
                </button>
            </div>
        </section>

        <!-- Quick Actions Section -->
        <section class="space-y-4">
            <h3 class="text-lg font-headline font-bold text-white">{{ t('analytics.quickActions') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NuxtLink
                    to="/upload"
                    class="flex items-center gap-6 p-6 bg-surface-container-low border border-white/5 rounded-2xl hover:bg-surface-container-high transition-all group"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"
                    >
                        <LucideUploadCloud class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="font-headline font-bold text-white">{{ t('analytics.uploadFiles') }}</p>
                        <p class="text-xs text-on-surface-variant">{{ t('analytics.uploadFilesDesc') }}</p>
                    </div>
                </NuxtLink>
                <NuxtLink
                    to="/text"
                    class="flex items-center gap-6 p-6 bg-surface-container-low border border-white/5 rounded-2xl hover:bg-surface-container-high transition-all group"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform"
                    >
                        <LucideFileText class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="font-headline font-bold text-white">{{ t('analytics.shareText') }}</p>
                        <p class="text-xs text-on-surface-variant">{{ t('analytics.shareTextDesc') }}</p>
                    </div>
                </NuxtLink>
                <NuxtLink
                    to="/links"
                    class="flex items-center gap-6 p-6 bg-surface-container-low border border-white/5 rounded-2xl hover:bg-surface-container-high transition-all group"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"
                    >
                        <LucideLink class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="font-headline font-bold text-white">{{ t('analytics.myLinks') }}</p>
                        <p class="text-xs text-on-surface-variant">{{ t('analytics.myLinksDesc') }}</p>
                    </div>
                </NuxtLink>
            </div>
        </section>

        <!-- Loading State -->
        <DashboardSkeleton v-if="loading" />

        <!-- Error State -->
        <ErrorState
            v-else-if="error"
            :title="t('analytics.error.title')"
            :message="error.message"
            :retry-label="t('analytics.error.retry')"
            @retry="refresh()"
        />

        <!-- Bento Grid Dashboard -->
        <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Primary Metric Card -->
                <div class="md:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-12">
                            <div>
                                <p class="text-on-surface-variant text-sm mb-1">{{ t('analytics.weeklyActivity') }}</p>
                                <p class="text-3xl font-headline font-bold text-white">
                                    +{{ stats.weeklyGrowth }}%
                                    <span class="text-sm font-body font-normal text-tertiary">{{ t('analytics.vsLastWeek') }}</span>
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <div class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full">
                                    <div class="w-2 h-2 rounded-full bg-primary" />
                                    <span class="text-[10px] text-on-surface-variant">{{ t('analytics.uploads') }}</span>
                                </div>
                                <div class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full">
                                    <div class="w-2 h-2 rounded-full bg-tertiary" />
                                    <span class="text-[10px] text-on-surface-variant">{{ t('analytics.downloads') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- SVG Line Chart -->
                        <div class="w-full h-64 mt-4">
                            <svg class="w-full h-full" viewBox="0 0 800 200">
                                <defs>
                                    <linearGradient id="grad-primary" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stop-color="#adc6ff" stop-opacity="0.2" />
                                        <stop offset="100%" stop-color="#adc6ff" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,150 Q100,120 200,140 T400,80 T600,100 T800,40"
                                    fill="none"
                                    stroke="#adc6ff"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                />
                                <path d="M0,150 Q100,120 200,140 T400,80 T600,100 T800,40 V200 H0 Z" fill="url(#grad-primary)" />
                                <path
                                    d="M0,180 Q100,160 200,170 T400,120 T600,140 T800,90"
                                    fill="none"
                                    stroke="#4edea3"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                    stroke-dasharray="8 4"
                                />
                            </svg>
                            <div class="flex justify-between mt-4 px-2">
                                <span v-for="day in weeklyActivity" :key="day.day" class="text-[10px] text-on-surface-variant/50 font-bold">
                                    {{ day.day }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Storage Ring -->
                <div
                    class="md:col-span-4 bg-surface-container-high rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center"
                >
                    <p class="text-on-surface-variant text-sm mb-8 font-medium uppercase tracking-widest">{{ t('analytics.storageQuota') }}</p>
                    <div class="relative w-48 h-48 mb-8">
                        <svg class="w-full h-full transform -rotate-90">
                            <circle
                                class="text-surface-container-highest"
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="currentColor"
                                stroke-width="12"
                            />
                            <circle
                                class="text-primary"
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="currentColor"
                                stroke-width="12"
                                stroke-dasharray="553"
                                stroke-dashoffset="44"
                                stroke-linecap="round"
                            />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="text-4xl font-headline font-extrabold text-white">{{ stats.storagePercentage }}%</span>
                            <span class="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">{{ t('analytics.used') }}</span>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <p class="text-white font-semibold">{{ stats.storageUsed }} GB {{ t('links.storageUsed') }} {{ stats.storageTotal }}</p>
                        <p class="text-xs text-on-surface-variant">Upgrade for kinetic performance</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="md:col-span-3 bg-surface-container-low rounded-3xl p-6 border border-white/5">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <LucideShare2 class="w-5 h-5" />
                    </div>
                    <p class="text-on-surface-variant text-xs mb-1">{{ t('analytics.totalShared') }}</p>
                    <h4 class="text-2xl font-headline font-bold text-white">{{ stats.totalShares.toLocaleString() }}</h4>
                    <div class="mt-4 flex items-center gap-1 text-tertiary text-xs font-bold">
                        <LucideTrendingUp class="w-4 h-4" />
                        <span>+12 today</span>
                    </div>
                </div>

                <div class="md:col-span-3 bg-surface-container-low rounded-3xl p-6 border border-white/5">
                    <div class="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
                        <LucideDownloadCloud class="w-5 h-5" />
                    </div>
                    <p class="text-on-surface-variant text-xs mb-1">{{ t('analytics.activeDownloads') }}</p>
                    <h4 class="text-2xl font-headline font-bold text-white">{{ stats.activeDownloads }}</h4>
                    <div class="mt-4 flex items-center gap-1 text-on-surface-variant text-xs font-bold">
                        <LucideRotateCw class="w-4 h-4" />
                        <span>{{ t('analytics.streamRealTime') }}</span>
                    </div>
                </div>

                <!-- Recent Activity Feed -->
                <div class="md:col-span-6 bg-surface-container-low rounded-3xl p-8 border border-white/5">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-headline font-bold text-white">{{ t('analytics.recentActivity') }}</h3>
                        <button class="text-xs text-primary hover:underline font-bold focus-ring rounded px-2 py-1">
                            {{ t('analytics.viewHistory') }}
                        </button>
                    </div>
                    <ul class="space-y-6" role="list">
                        <li v-for="item in recentActivity" :key="item.id" class="flex items-center gap-4 group cursor-pointer">
                            <div
                                class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                            >
                                <component
                                    :is="activityIcons[item.icon]"
                                    class="w-4 h-4 text-on-surface-variant group-hover:text-primary"
                                    aria-hidden="true"
                                />
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-white">
                                    {{ item.text }} <span class="text-primary">{{ item.highlight }}</span>
                                </p>
                                <p class="text-[10px] text-on-surface-variant font-medium">{{ item.time }}</p>
                            </div>
                            <div
                                class="text-[10px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                                {{ item.tag }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Advanced System Diagnostics -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center pt-8 border-t border-white/5">
                <div class="lg:col-span-1 space-y-4">
                    <h3 class="text-2xl font-headline font-bold text-white">{{ t('analytics.technicalPerformance') }}</h3>
                    <p class="text-on-surface-variant text-sm leading-relaxed">
                        {{ t('analytics.performanceDesc') }}
                        <span class="text-tertiary">14ms</span>,
                        {{ t('analytics.withinParams') }}
                    </p>
                    <div class="pt-4 flex items-center gap-6">
                        <div>
                            <p class="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-bold">{{ t('analytics.response') }}</p>
                            <p class="text-xl font-headline font-bold text-white">0.02s</p>
                        </div>
                        <div class="w-px h-8 bg-white/10" />
                        <div>
                            <p class="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-bold">{{ t('analytics.uptime') }}</p>
                            <p class="text-xl font-headline font-bold text-white">99.9%</p>
                        </div>
                    </div>
                </div>
                <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        v-for="metric in systemMetrics"
                        :key="metric.label"
                        class="p-6 bg-surface-container-lowest rounded-2xl border border-white/5"
                    >
                        <component
                            :is="
                                metric.icon === 'activity'
                                    ? LucideActivity
                                    : metric.icon === 'shield'
                                      ? LucideShield
                                      : metric.icon === 'database'
                                        ? LucideDatabase
                                        : LucideAlertTriangle
                            "
                            :class="cn('w-5 h-5 mb-3', metricColors[metric.color])"
                        />
                        <p class="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">{{ metric.label }}</p>
                        <p class="text-lg font-bold text-white">{{ metric.value }}</p>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>
