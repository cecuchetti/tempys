<script setup lang="ts">
import { ref } from 'vue'
import { LucideUploadCloud } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface DropZoneProps {
    accept?: string
    multiple?: boolean
    maxSize?: number // in MB
}

const props = withDefaults(defineProps<DropZoneProps>(), {
    accept: '*',
    multiple: true,
    maxSize: 100,
})

const emit = defineEmits<{
    filesSelected: [files: File[]]
}>()

const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = true
}

const handleDragLeave = () => {
    isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = false
    const files = Array.from(e.dataTransfer?.files || [])
    emit('filesSelected', files)
}

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = Array.from(target.files || [])
    emit('filesSelected', files)
}

const openFileDialog = () => {
    fileInput.value?.click()
}
</script>

<template>
    <div
        class="dropzone relative group"
        :class="
            cn(
                'h-[480px] bg-surface-container-low rounded-xl',
                'border-2 border-dashed border-white/10',
                'hover:border-primary/50',
                'transition-all duration-200',
                'flex flex-col items-center justify-center',
                isDragOver && 'border-primary bg-surface-container-high'
            )
        "
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
    >
        <!-- Glow overlay for hover state -->
        <div class="absolute -inset-0.5 kinetic-gradient rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500" />

        <!-- Hidden file input -->
        <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" class="hidden" @change="handleFileSelect" />

        <!-- Content -->
        <div class="relative z-10 text-center space-y-6 max-w-sm px-6">
            <!-- Icon -->
            <div
                class="dropzone__icon w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500"
            >
                <LucideUploadCloud class="w-10 h-10 text-primary" />
            </div>

            <!-- Text -->
            <div>
                <h3 class="dropzone__title font-headline text-xl font-bold mb-2">Drop the payloads here</h3>
                <p class="dropzone__description text-on-surface-variant text-sm leading-relaxed">
                    Files are automatically chunked and hashed before leaving your browser.
                </p>
            </div>

            <!-- Button -->
            <button
                class="dropzone__button px-8 py-3 kinetic-gradient text-on-primary font-bold rounded-lg transition-transform hover:scale-105 active:scale-95"
                @click="openFileDialog"
            >
                Browse Files
            </button>
        </div>

        <!-- Bottom gradient overlay -->
        <div class="absolute bottom-0 left-0 right-0 h-32 opacity-20 pointer-events-none">
            <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-primary/20 to-transparent" />
        </div>
    </div>
</template>

<style scoped>
.dropzone__button {
    background: linear-gradient(135deg, var(--primary) 0%, var(--on-primary-container) 100%);
}
</style>
