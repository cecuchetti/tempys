<script setup lang="ts">
import type { Component } from 'vue'

interface EmptyStateProps {
    icon: Component
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}

defineProps<EmptyStateProps>()
</script>

<template>
    <div class="empty-state flex flex-col items-center justify-center py-16 text-center">
        <!-- Icon -->
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <component :is="icon" class="w-8 h-8 text-primary" />
        </div>

        <!-- Title -->
        <h3 class="font-headline text-xl font-bold text-white mb-2">
            {{ title }}
        </h3>

        <!-- Description -->
        <p v-if="description" class="text-on-surface-variant text-sm max-w-sm mb-6">
            {{ description }}
        </p>

        <!-- Action -->
        <button
            v-if="action"
            class="px-8 py-3 kinetic-gradient text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
            @click="action.onClick"
        >
            {{ action.label }}
        </button>
    </div>
</template>
