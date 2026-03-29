<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface ActivityFeedItemProps {
    icon: Component
    text: string
    highlight?: string
    time: string
    tag?: string
    tagVariant?: 'default' | 'primary' | 'tertiary'
}

const props = withDefaults(defineProps<ActivityFeedItemProps>(), {
    tagVariant: 'default',
})
</script>

<template>
    <div class="activity-feed-item flex items-center gap-4 group cursor-pointer">
        <!-- Icon -->
        <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <component :is="icon" class="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
        </div>

        <!-- Content -->
        <div class="flex-1">
            <p class="text-sm font-medium text-white">
                {{ text }}
                <span v-if="highlight" class="text-primary">{{ highlight }}</span>
            </p>
            <p class="text-[10px] text-on-surface-variant font-medium">{{ time }}</p>
        </div>

        <!-- Tag -->
        <div
            v-if="tag"
            :class="
                cn(
                    'text-[10px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded uppercase tracking-wider',
                    tagVariant === 'primary' && 'bg-primary/20 text-primary',
                    tagVariant === 'tertiary' && 'bg-tertiary/20 text-tertiary'
                )
            "
        >
            {{ tag }}
        </div>
    </div>
</template>
