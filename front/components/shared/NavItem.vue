<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface NavItemProps {
    icon: Component
    label: string
    active?: boolean
    disabled?: boolean
}

const props = defineProps<NavItemProps>()
const emit = defineEmits<{
    click: []
}>()
</script>

<template>
    <button
        :class="
            cn(
                'nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 scale-95 active:scale-90 text-left',
                active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                disabled && 'opacity-50 cursor-not-allowed'
            )
        "
        :disabled="disabled"
        @click="emit('click')"
    >
        <component :is="icon" class="w-5 h-5 flex-shrink-0" />
        <span class="font-headline text-sm tracking-wide">{{ label }}</span>
    </button>
</template>
