<script setup lang="ts">
import { cn } from '@/lib/utils'
import { LucideFileText, LucideImage, LucideFolderArchive, LucideX } from 'lucide-vue-next'
import type { Component } from 'vue'

interface UploadQueueItemData {
    id: string
    name: string
    progress: number
    size: string
    status: string
    icon?: Component
    waiting?: boolean
}

const props = defineProps<{
    items: UploadQueueItemData[]
}>()

const emit = defineEmits<{
    cancel: [id: string]
}>()

const getFileIcon = (name: string): Component => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return LucideImage
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return LucideFolderArchive
    return LucideFileText
}
</script>

<template>
    <div class="upload-queue space-y-6 pt-8">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/5 pb-4">
            <h4 class="font-headline text-lg font-bold">Transfer Queue</h4>
            <span class="text-[10px] font-bold uppercase px-3 py-1 bg-surface-container-high rounded-full text-on-surface-variant tracking-widest">
                {{ items.length }} active tasks
            </span>
        </div>

        <!-- Queue Items -->
        <div class="space-y-4">
            <div
                v-for="item in items"
                :key="item.id"
                :class="cn('group flex items-center gap-6 p-4 rounded-xl hover:bg-surface-bright transition-all', item.waiting && 'opacity-60')"
            >
                <!-- Icon Container -->
                <div class="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <component :is="item.icon || getFileIcon(item.name)" class="w-6 h-6 text-primary" />
                </div>

                <!-- Content -->
                <div class="flex-1 space-y-2">
                    <!-- Top Row -->
                    <div class="flex justify-between items-end">
                        <div>
                            <span class="block text-sm font-semibold">{{ item.name }}</span>
                            <span class="text-[10px] text-on-surface-variant uppercase tracking-wider"> {{ item.status }} • {{ item.size }} </span>
                        </div>
                        <span class="text-xs font-bold" :class="item.waiting ? 'text-on-surface-variant' : 'text-tertiary'">
                            {{ item.waiting ? 'Waiting' : `${item.progress}%` }}
                        </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                            class="h-full transition-all duration-700"
                            :class="item.waiting ? 'bg-primary/20' : 'bg-tertiary progress-glow'"
                            :style="{ width: `${item.progress}%` }"
                        />
                    </div>
                </div>

                <!-- Cancel Button -->
                <button class="text-on-surface-variant hover:text-error transition-colors" @click="emit('cancel', item.id)">
                    <LucideX class="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.progress-glow {
    box-shadow: 0 0 8px rgba(78, 222, 163, 0.4);
}
</style>
