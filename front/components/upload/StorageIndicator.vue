<script setup lang="ts">
interface StorageIndicatorProps {
    percentage: number
    label?: string
}

const props = withDefaults(defineProps<StorageIndicatorProps>(), {
    label: 'STORAGE',
})
</script>

<template>
    <div class="storage-indicator px-4 py-3 bg-surface-container-high rounded-xl">
        <!-- Label Row -->
        <div class="flex justify-between text-[10px] mb-1 font-bold text-on-surface-variant">
            <span>{{ label }}</span>
            <span>{{ percentage }}%</span>
        </div>

        <!-- Progress Bar -->
        <div class="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div class="h-full bg-tertiary transition-all duration-500 progress-glow" :style="{ width: `${percentage}%` }" />
        </div>
    </div>
</template>

<style scoped>
.progress-glow {
    box-shadow: 0 0 8px rgba(78, 222, 163, 0.4);
}
</style>
