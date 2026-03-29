<script setup lang="ts">
import type { Component } from 'vue'

interface QuickActionCardProps {
    title: string
    description: string
    icon: Component
    iconVariant?: 'primary' | 'tertiary'
    href?: string
}

const props = withDefaults(defineProps<QuickActionCardProps>(), {
    iconVariant: 'primary',
})
</script>

<template>
    <a
        :href="href"
        class="quick-action-card flex items-center gap-6 p-6 bg-surface-container-low border border-white/5 rounded-2xl hover:bg-surface-container-high transition-all group"
    >
        <!-- Icon -->
        <div
            class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
            :class="iconVariant === 'primary' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'"
        >
            <component :is="icon" class="w-6 h-6" />
        </div>

        <!-- Content -->
        <div>
            <p class="font-headline font-bold text-white">{{ title }}</p>
            <p class="text-xs text-on-surface-variant">{{ description }}</p>
        </div>
    </a>
</template>
