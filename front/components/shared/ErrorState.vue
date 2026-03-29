<script setup lang="ts">
/**
 * ErrorState Component
 *
 * Displays an error message with optional retry action.
 * Follows WCAG AA accessibility with role="alert".
 *
 * @example
 * <ErrorState
 *   :message="t('links.error.title')"
 *   :retry-label="t('links.error.retry')"
 *   @retry="refetch()"
 * />
 */
import { LucideAlertCircle } from 'lucide-vue-next'
import type { Component } from 'vue'

interface ErrorStateProps {
    icon?: Component
    title: string
    message?: string
    retryLabel?: string
}

const props = withDefaults(defineProps<ErrorStateProps>(), {
    icon: LucideAlertCircle,
})

const emit = defineEmits<{
    retry: []
}>()
</script>

<template>
    <div class="error-state flex flex-col items-center justify-center py-16 text-center" role="alert" aria-live="assertive">
        <!-- Icon -->
        <div class="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mb-6">
            <component :is="props.icon" class="w-8 h-8 text-error" aria-hidden="true" />
        </div>

        <!-- Title -->
        <h3 class="font-headline text-xl font-bold text-white mb-2">
            {{ title }}
        </h3>

        <!-- Message -->
        <p v-if="message" class="text-on-surface-variant text-sm max-w-sm mb-6">
            {{ message }}
        </p>

        <!-- Retry Button -->
        <button
            v-if="retryLabel"
            class="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all focus-ring"
            @click="emit('retry')"
        >
            {{ retryLabel }}
        </button>
    </div>
</template>
