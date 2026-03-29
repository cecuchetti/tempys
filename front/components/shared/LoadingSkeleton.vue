<script setup lang="ts">
/**
 * LoadingSkeleton Component
 *
 * A reusable skeleton loader with pulsing animation.
 * Follows WCAG AA accessibility with aria-busy attribute.
 *
 * @example
 * <LoadingSkeleton :lines="3" />
 * <LoadingSkeleton variant="card" />
 */

interface LoadingSkeletonProps {
    variant?: 'text' | 'card' | 'stat'
    lines?: number
}

const props = withDefaults(defineProps<LoadingSkeletonProps>(), {
    variant: 'text',
    lines: 3,
})

const textLines = computed(() => {
    const widths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/3', 'w-4/5']
    return Array.from({ length: props.lines }, (_, i) => widths[i % widths.length])
})
</script>

<template>
    <div class="animate-pulse" role="status" aria-busy="true" :aria-label="$t('common.loading')">
        <!-- Text variant -->
        <template v-if="variant === 'text'">
            <div class="space-y-4">
                <div v-for="(width, i) in textLines" :key="i" class="h-4 bg-surface-container-high rounded" :class="width" />
            </div>
            <span class="sr-only">{{ $t('common.loading') }}</span>
        </template>

        <!-- Card variant -->
        <template v-else-if="variant === 'card'">
            <div class="bg-surface-container-low rounded-xl border border-white/5 p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <div class="h-4 bg-surface-container-high rounded w-1/3" />
                    <div class="h-8 w-8 bg-surface-container-high rounded-full" />
                </div>
                <div class="h-10 bg-surface-container-high rounded w-2/3" />
                <div class="space-y-2">
                    <div class="h-3 bg-surface-container-high rounded w-full" />
                    <div class="h-3 bg-surface-container-high rounded w-4/5" />
                </div>
            </div>
        </template>

        <!-- Stat variant -->
        <template v-else-if="variant === 'stat'">
            <div class="bg-surface-container-low rounded-xl border border-white/5 p-6 space-y-1">
                <div class="h-3 bg-surface-container-high rounded w-1/2" />
                <div class="h-8 bg-surface-container-high rounded w-3/4 mt-2" />
                <div class="h-2 bg-surface-container-high rounded w-1/3 mt-4" />
            </div>
        </template>
    </div>
</template>
