<script setup lang="ts">
interface ChartContainerProps {
    title: string
    subtitle?: string
    legendItems?: Array<{ color: string; label: string }>
}

defineProps<ChartContainerProps>()
</script>

<template>
    <div class="chart-container bg-surface-container-low rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
        <!-- Decorative glow -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

        <div class="relative z-10">
            <!-- Header -->
            <div class="flex justify-between items-start mb-12">
                <div>
                    <p v-if="subtitle" class="text-on-surface-variant text-sm mb-1">{{ subtitle }}</p>
                    <slot name="header-content">
                        <h3 class="text-3xl font-headline font-bold text-white">{{ title }}</h3>
                    </slot>
                </div>

                <!-- Legend -->
                <div v-if="legendItems" class="flex gap-2">
                    <div
                        v-for="item in legendItems"
                        :key="item.label"
                        class="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full"
                    >
                        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }" />
                        <span class="text-[10px] text-on-surface-variant">{{ item.label }}</span>
                    </div>
                </div>
            </div>

            <!-- Chart Content -->
            <div class="w-full h-64 mt-4">
                <slot name="chart" />
            </div>
        </div>
    </div>
</template>
