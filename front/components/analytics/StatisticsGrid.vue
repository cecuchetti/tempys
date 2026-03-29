<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface StatItem {
    icon: Component
    label: string
    value: string
    color?: 'primary' | 'tertiary' | 'error'
}

interface StatisticsGridProps {
    stats: StatItem[]
}

defineProps<StatisticsGridProps>()
</script>

<template>
    <div class="statistics-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(stat, index) in stats" :key="index" class="p-6 bg-surface-container-lowest rounded-2xl border border-white/5">
            <component
                :is="stat.icon"
                :class="
                    cn(
                        'w-5 h-5 mb-3',
                        stat.color === 'primary' && 'text-primary',
                        stat.color === 'tertiary' && 'text-tertiary',
                        stat.color === 'error' && 'text-error',
                        !stat.color && 'text-primary'
                    )
                "
            />
            <p class="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">
                {{ stat.label }}
            </p>
            <p class="text-lg font-bold text-white">{{ stat.value }}</p>
        </div>
    </div>
</template>
