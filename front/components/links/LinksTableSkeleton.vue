<script setup lang="ts">
/**
 * LinksTableSkeleton Component
 *
 * Skeleton loader specifically designed for the links table.
 * Mimics the exact structure of the links table for smooth loading transitions.
 * Follows WCAG AA accessibility with aria-busy attribute.
 */

interface LinksTableSkeletonProps {
    rows?: number
    showStats?: boolean
}

const props = withDefaults(defineProps<LinksTableSkeletonProps>(), {
    rows: 5,
    showStats: true,
})
</script>

<template>
    <div class="space-y-12">
        <!-- Header Skeleton -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-2 animate-pulse">
                <div class="h-3 bg-surface-container-high rounded w-32" />
                <div class="h-10 bg-surface-container-high rounded w-48" />
            </div>
            <div class="h-12 bg-surface-container-high rounded-xl w-36 animate-pulse" />
        </div>

        <!-- Stats Grid Skeleton -->
        <div v-if="showStats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="bg-surface-container-low p-6 rounded-xl border border-white/5 animate-pulse">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <div class="h-3 bg-surface-container-high rounded w-24" />
                        <div class="h-8 bg-surface-container-high rounded w-16" />
                    </div>
                    <div class="w-12 h-12 bg-surface-container-high rounded-full" />
                </div>
            </div>
        </div>

        <!-- Filters Skeleton -->
        <div class="flex items-center justify-between animate-pulse">
            <div class="flex items-center gap-2 p-1.5 bg-surface-container-lowest rounded-xl">
                <div v-for="i in 5" :key="i" class="h-8 w-16 bg-surface-container-high rounded-lg" />
            </div>
            <div class="h-8 w-28 bg-surface-container-high rounded-lg" />
        </div>

        <!-- Table Skeleton -->
        <div class="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-surface-container-lowest/40 border-b border-white/5">
                        <th v-for="i in 6" :key="i" class="px-6 py-4">
                            <div class="h-3 bg-surface-container-high rounded w-20 animate-pulse" />
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="row in rows" :key="row" class="animate-pulse">
                        <!-- Asset Name Column -->
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-surface-container-high rounded-lg" />
                                <div class="space-y-1">
                                    <div class="h-4 bg-surface-container-high rounded w-32" />
                                    <div class="h-2 bg-surface-container-high rounded w-20" />
                                </div>
                            </div>
                        </td>
                        <!-- Short Link Column -->
                        <td class="px-6 py-5">
                            <div class="h-3 bg-surface-container-high rounded w-28" />
                        </td>
                        <!-- Status Column -->
                        <td class="px-6 py-5">
                            <div class="h-5 bg-surface-container-high rounded-full w-16" />
                        </td>
                        <!-- Clicks Column -->
                        <td class="px-6 py-5 text-center">
                            <div class="h-4 bg-surface-container-high rounded w-8 mx-auto" />
                        </td>
                        <!-- Created Column -->
                        <td class="px-6 py-5">
                            <div class="h-3 bg-surface-container-high rounded w-24" />
                        </td>
                        <!-- Actions Column -->
                        <td class="px-6 py-5 text-right">
                            <div class="flex items-center justify-end gap-1">
                                <div class="w-10 h-10 bg-surface-container-high rounded-lg" />
                                <div class="w-10 h-10 bg-surface-container-high rounded-lg" />
                                <div class="w-10 h-10 bg-surface-container-high rounded-lg" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Skeleton -->
        <div class="flex items-center justify-between pt-4 animate-pulse">
            <div class="h-4 bg-surface-container-high rounded w-32" />
            <div class="flex gap-2">
                <div v-for="i in 4" :key="i" class="w-11 h-11 bg-surface-container-high rounded-lg" />
            </div>
        </div>

        <!-- Promo Cards Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 animate-pulse">
            <div class="h-48 bg-primary/20 rounded-xl" />
            <div class="h-48 bg-surface-container-low rounded-xl border border-white/5" />
        </div>

        <!-- Screen reader announcement -->
        <span class="sr-only" role="status" aria-live="polite">{{ $t('common.loading') }}</span>
    </div>
</template>
