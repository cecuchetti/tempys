<script setup lang="ts">
import { LucideAlertCircle } from 'lucide-vue-next'

interface DangerZoneProps {
    title?: string
    message: string
    buttonText?: string
}

const props = withDefaults(defineProps<DangerZoneProps>(), {
    title: 'Danger Zone',
    buttonText: 'Delete Account Permanently',
})

const emit = defineEmits<{
    action: []
}>()
</script>

<template>
    <section class="danger-zone p-8 bg-error/5 rounded-3xl border border-error/20 space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4 text-error">
            <LucideAlertCircle class="w-6 h-6" />
            <h3 class="text-lg font-headline font-bold">{{ title }}</h3>
        </div>

        <!-- Message -->
        <p class="text-on-surface-variant text-sm max-w-2xl">
            {{ message }}
        </p>

        <!-- Action Button -->
        <button
            class="px-8 py-3 bg-error/10 hover:bg-error/20 text-error font-bold rounded-xl text-sm transition-all border border-error/20"
            @click="emit('action')"
        >
            {{ buttonText }}
        </button>
    </section>
</template>
