<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

interface ActionButton {
    label: string
    icon?: Component
    variant?: 'primary' | 'secondary'
    onClick?: () => void
}

interface PageHeaderProps {
    title: string
    overline?: string
    description?: string
    actions?: ActionButton[]
}

withDefaults(defineProps<PageHeaderProps>(), {
    overline: '',
    description: '',
})
</script>

<template>
    <section class="page-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-2">
            <!-- Overline -->
            <span v-if="overline" class="font-headline text-primary uppercase tracking-[0.2em] text-[0.65rem] font-bold">
                {{ overline }}
            </span>

            <!-- Title -->
            <h1 class="font-headline text-5xl font-extrabold tracking-tighter text-white">
                {{ title }}
            </h1>

            <!-- Description -->
            <p v-if="description" class="text-on-surface-variant font-label tracking-wide uppercase text-xs">
                {{ description }}
            </p>
        </div>

        <!-- Actions -->
        <div v-if="actions?.length" class="flex gap-4">
            <template v-for="(action, index) in actions" :key="index">
                <button
                    v-if="action.variant === 'primary'"
                    class="px-6 py-2.5 kinetic-gradient text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2"
                    @click="action.onClick"
                >
                    <component v-if="action.icon" :is="action.icon" class="w-4 h-4" />
                    {{ action.label }}
                </button>
                <button
                    v-else
                    class="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl text-sm font-medium text-on-surface-variant flex items-center gap-2"
                    @click="action.onClick"
                >
                    <component v-if="action.icon" :is="action.icon" class="w-4 h-4" />
                    {{ action.label }}
                </button>
            </template>
        </div>
    </section>
</template>
