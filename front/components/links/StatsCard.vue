<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface StatsCardProps {
    label: string
    value: string | number
    icon: Component
    trend?: {
        value: string
        positive?: boolean
    }
    iconColor?: 'primary' | 'tertiary'
    showProgress?: boolean
    progressPercentage?: number
}

const props = withDefaults(defineProps<StatsCardProps>(), {
    iconColor: 'primary',
    showProgress: false,
})
</script>

<template>
    <div
        class="stats-card bg-surface-container-low p-6 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
    >
        <!-- Content -->
        <div class="space-y-1 flex-1">
            <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold">
                {{ label }}
            </p>
            <p class="text-3xl font-extrabold text-white">{{ value }}</p>

            <!-- Progress Bar (optional) -->
            <div v-if="showProgress" class="space-y-2 mt-4">
                <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div class="h-full bg-tertiary" :style="{ width: `${progressPercentage}%` }" />
                </div>
                <p class="text-[10px] text-on-surface-variant font-bold text-right uppercase tracking-wider">{{ progressPercentage }}% used</p>
            </div>

            <!-- Trend (optional) -->
            <div v-if="trend" class="mt-4 flex items-center gap-1" :class="trend.positive ? 'text-tertiary' : 'text-on-surface-variant'">
                <span class="text-xs font-bold">{{ trend.value }}</span>
            </div>
        </div>

        <!-- Icon -->
        <div
            v-if="!showProgress"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :class="cn(iconColor === 'primary' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary')"
        >
            <component :is="icon" class="w-6 h-6" />
        </div>
    </div>
</template>
