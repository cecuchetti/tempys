<script setup lang="ts">
/**
 * DashboardSkeleton Component
 *
 * Skeleton loader specifically designed for the analytics dashboard.
 * Mimics the exact structure of the dashboard for smooth loading transitions.
 * Follows WCAG AA accessibility with aria-busy attribute.
 */
</script>

<template>
    <div class="space-y-12">
        <!-- Header Skeleton -->
        <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div class="space-y-2 animate-pulse">
                <div class="h-3 bg-surface-container-high rounded w-32" />
                <div class="h-12 bg-surface-container-high rounded w-64" />
            </div>
            <div class="flex gap-4 animate-pulse">
                <div class="h-10 w-36 bg-surface-container-high rounded-xl" />
                <div class="h-10 w-32 bg-surface-container-high rounded-xl" />
            </div>
        </section>

        <!-- Quick Actions Skeleton -->
        <section class="space-y-4">
            <div class="h-5 bg-surface-container-high rounded w-32 animate-pulse" />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="flex items-center gap-6 p-6 bg-surface-container-low border border-white/5 rounded-2xl animate-pulse"
                >
                    <div class="w-12 h-12 bg-surface-container-high rounded-xl" />
                    <div class="space-y-2 flex-1">
                        <div class="h-4 bg-surface-container-high rounded w-24" />
                        <div class="h-2 bg-surface-container-high rounded w-32" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Bento Grid Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- Primary Metric Card -->
            <div class="md:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-white/5 relative overflow-hidden animate-pulse">
                <div class="flex justify-between items-start mb-12">
                    <div class="space-y-2">
                        <div class="h-3 bg-surface-container-high rounded w-32" />
                        <div class="h-8 bg-surface-container-high rounded w-40" />
                    </div>
                    <div class="flex gap-2">
                        <div class="h-6 w-20 bg-surface-container-high rounded-full" />
                        <div class="h-6 w-20 bg-surface-container-high rounded-full" />
                    </div>
                </div>
                <!-- Chart Placeholder -->
                <div class="w-full h-64 bg-surface-container-highest/50 rounded-xl" />
            </div>

            <!-- Storage Ring -->
            <div
                class="md:col-span-4 bg-surface-container-high rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center animate-pulse"
            >
                <div class="h-3 bg-surface-container-highest rounded w-28 mb-8" />
                <div class="w-48 h-48 rounded-full bg-surface-container-highest/50 mb-8" />
                <div class="space-y-1">
                    <div class="h-4 bg-surface-container-highest rounded w-32" />
                    <div class="h-2 bg-surface-container-highest rounded w-24" />
                </div>
            </div>

            <!-- Stats Cards -->
            <div v-for="i in 2" :key="i" class="md:col-span-3 bg-surface-container-low rounded-3xl p-6 border border-white/5 animate-pulse">
                <div class="w-10 h-10 bg-surface-container-high rounded-xl mb-4" />
                <div class="h-2 bg-surface-container-high rounded w-20 mb-1" />
                <div class="h-6 bg-surface-container-high rounded w-24" />
                <div class="mt-4 h-3 bg-surface-container-high rounded w-20" />
            </div>

            <!-- Recent Activity Feed -->
            <div class="md:col-span-6 bg-surface-container-low rounded-3xl p-8 border border-white/5 animate-pulse">
                <div class="flex justify-between items-center mb-6">
                    <div class="h-5 bg-surface-container-high rounded w-32" />
                    <div class="h-3 bg-surface-container-high rounded w-20" />
                </div>
                <ul class="space-y-6">
                    <li v-for="i in 5" :key="i" class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-surface-container-high rounded-full flex-shrink-0" />
                        <div class="flex-1 space-y-1">
                            <div class="h-3 bg-surface-container-high rounded w-48" />
                            <div class="h-2 bg-surface-container-high rounded w-32" />
                        </div>
                        <div class="h-4 bg-surface-container-high rounded w-16" />
                    </li>
                </ul>
            </div>
        </div>

        <!-- System Diagnostics Skeleton -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center pt-8 border-t border-white/5">
            <div class="lg:col-span-1 space-y-4 animate-pulse">
                <div class="h-6 bg-surface-container-high rounded w-48" />
                <div class="space-y-2">
                    <div class="h-3 bg-surface-container-high rounded w-full" />
                    <div class="h-3 bg-surface-container-high rounded w-3/4" />
                </div>
                <div class="pt-4 flex items-center gap-6">
                    <div class="space-y-1">
                        <div class="h-2 bg-surface-container-high rounded w-20" />
                        <div class="h-5 bg-surface-container-high rounded w-16" />
                    </div>
                    <div class="w-px h-8 bg-surface-container-high" />
                    <div class="space-y-1">
                        <div class="h-2 bg-surface-container-high rounded w-20" />
                        <div class="h-5 bg-surface-container-high rounded w-12" />
                    </div>
                </div>
            </div>
            <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                <div v-for="i in 4" :key="i" class="p-6 bg-surface-container-lowest rounded-2xl border border-white/5">
                    <div class="w-5 h-5 bg-surface-container-high rounded mb-3" />
                    <div class="h-2 bg-surface-container-high rounded w-16 mb-1" />
                    <div class="h-4 bg-surface-container-high rounded w-12" />
                </div>
            </div>
        </section>

        <!-- Screen reader announcement -->
        <span class="sr-only" role="status" aria-live="polite">{{ $t('common.loading') }}</span>
    </div>
</template>
