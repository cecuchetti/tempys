<script setup lang="ts">
import { cn } from '@/lib/utils'

interface LoadingStateProps {
    message?: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<LoadingStateProps>(), {
    message: 'Loading...',
    size: 'md',
})

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
}
</script>

<template>
    <div class="loading-state flex flex-col items-center justify-center py-16 text-center">
        <!-- Spinner -->
        <div :class="cn('mb-6 border-2 border-outline-variant border-t-primary rounded-full animate-spin', sizeClasses[size])" />

        <!-- Message -->
        <h3 class="font-headline text-xl font-bold text-white mb-2">
            {{ message }}
        </h3>

        <!-- Description -->
        <p v-if="description" class="text-on-surface-variant text-sm max-w-sm">
            {{ description }}
        </p>
    </div>
</template>
