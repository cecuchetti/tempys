<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
    LucideUploadCloud,
    LucideLock,
    LucideX,
    LucideImage,
    LucideFileText,
    LucideFolderArchive,
    LucideCheckCircle,
    LucideAlertCircle,
    LucideLoader2,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import FileUpload from '@/components/FileUpload.vue'
import { useUpload, type UploadTask } from '@/composables/useUpload'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()
const { queue, uploadFile, cancelUpload, clearCompleted, formatFileSize } = useUpload()

// Upload configuration
const expirationOptions = [
    { value: 60, label: '1 Hour' },
    { value: 1440, label: '24 Hours' },
    { value: 10080, label: '7 Days' },
    { value: -1, label: 'After 1 Download' },
]

const selectedExpiration = ref(1440)
const password = ref('')
const generatePickupCode = ref(true)
const notifyOnPickup = ref(true)

// Generate a random pickup code for display
const pickupCode = computed(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
})

// Get icon for file type
const getFileIcon = (task: UploadTask) => {
    const mimeType = task.mimeType
    if (mimeType.startsWith('image/')) return LucideImage
    if (mimeType.startsWith('text/')) return LucideFileText
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return LucideFolderArchive
    return LucideFileText
}

// Get status text for upload
const getStatusText = (task: UploadTask) => {
    if (task.status === 'pending') return t('upload.queue.status.pending')
    if (task.status === 'uploading') return t('upload.queue.status.uploading', { current: task.uploadedChunks, total: task.totalChunks })
    if (task.status === 'processing') return t('upload.queue.status.processing')
    if (task.status === 'complete') {
        if (task.shortLink) return t('upload.queue.status.complete')
        return t('upload.queue.status.uploaded')
    }
    if (task.status === 'error') return task.error || t('upload.queue.status.error')
    return ''
}

// Handle file drop/upload
const handleFileDrop = async (file: File) => {
    console.log('File dropped:', file.name, file.size, file.type)

    // Determine download limit based on expiration
    const downloadLimit = selectedExpiration.value === -1 ? 1 : 100

    try {
        const result = await uploadFile(file, {
            expiration: selectedExpiration.value === -1 ? 60 : selectedExpiration.value,
            downloadLimit,
            password: password.value || undefined,
            pickupCode: generatePickupCode.value,
        })

        if (result.shareId) {
            // Copy link to clipboard if share was created
            const link = result.task.shortLink
            console.log('Share created:', link)
        }

        toast.success(t('upload.success.uploaded'))
    } catch (error) {
        console.error('Upload failed:', error)
        toast.error(t('upload.errors.uploadFailed'))
    }
}

// Remove task from queue
const handleRemoveTask = (taskId: string) => {
    cancelUpload(taskId)
}

// Clear completed uploads
const handleClearCompleted = () => {
    clearCompleted()
}
</script>

<template>
    <div class="space-y-12">
        <!--Editorial Header -->
        <section class="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div class="space-y-2">
                <h1 class="font-headline text-5xl font-extrabold tracking-tighter text-white">{{ t('upload.title') }}.</h1>
                <p class="text-on-surface-variant font-label tracking-wide uppercase text-xs">
                    {{ t('upload.subtitle') }}
                </p>
            </div>
            <div class="hidden lg:block text-right">
                <span class="block text-4xl font-headline font-bold text-tertiary">0.02s</span>
                <span class="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                    {{ t('upload.avgLatency') }}
                </span>
            </div>
        </section>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Central Drop Zone -->
            <div class="lg:col-span-8 group relative">
                <div class="absolute -inset-0.5 kinetic-gradient rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500" />
                <FileUpload @on-change="handleFileDrop">
                    <template #default="{ isOverDropZone }">
                        <div
                            :class="
                                cn(
                                    'relative h-[480px] bg-surface-container-low rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden',
                                    isOverDropZone ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/50'
                                )
                            "
                        >
                            <div class="text-center space-y-6 max-w-sm px-6">
                                <div
                                    :class="
                                        cn(
                                            'w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto transition-transform duration-500',
                                            isOverDropZone ? 'scale-110' : 'group-hover:scale-110'
                                        )
                                    "
                                >
                                    <LucideUploadCloud class="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 class="font-headline text-xl font-bold mb-2">
                                        {{ t('upload.dropzone.title') }}
                                    </h3>
                                    <p class="text-on-surface-variant text-sm leading-relaxed">
                                        {{ t('upload.dropzone.description') }}
                                    </p>
                                </div>
                                <button
                                    class="px-8 py-3 kinetic-gradient text-on-primary font-bold rounded-lg transition-transform hover:scale-105 active:scale-95"
                                >
                                    {{ t('upload.dropzone.browseFiles') }}
                                </button>
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 h-32 opacity-20 pointer-events-none">
                                <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-primary/20 to-transparent" />
                            </div>
                        </div>
                    </template>
                </FileUpload>
            </div>

            <!-- Upload Options -->
            <div class="lg:col-span-4 space-y-6">
                <div class="glass-panel p-8 rounded-xl space-y-8 border border-white/5">
                    <h4 class="font-headline text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">
                        {{ t('upload.settings.title') }}
                    </h4>
                    <div class="space-y-6">
                        <!-- Password Protect -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block">
                                {{ t('upload.settings.passwordProtect') }}
                            </label>
                            <div class="relative">
                                <input
                                    v-model="password"
                                    class="w-full bg-surface-container-lowest border-none rounded-lg text-sm p-3 focus:ring-1 focus:ring-primary/50 placeholder:text-outline-variant"
                                    :placeholder="t('upload.settings.passwordPlaceholder')"
                                    type="password"
                                />
                                <LucideLock class="absolute right-3 top-2.5 text-outline-variant w-4 h-4" />
                            </div>
                        </div>

                        <!-- Expiration -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block">
                                {{ t('upload.settings.expiration') }}
                            </label>
                            <select
                                v-model="selectedExpiration"
                                class="w-full bg-surface-container-lowest border-none rounded-lg text-sm p-3 focus:ring-1 focus:ring-primary/50 appearance-none text-on-surface-variant"
                            >
                                <option v-for="opt in expirationOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </option>
                            </select>
                        </div>

                        <!-- Pickup Code -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block flex justify-between">
                                {{ t('upload.settings.pickupCode') }}
                                <span class="text-tertiary">{{ t('upload.settings.active') }}</span>
                            </label>
                            <ClientOnly>
                                <div
                                    class="bg-surface-container-lowest p-3 rounded-lg text-center font-mono text-primary tracking-widest text-lg font-bold"
                                >
                                    {{ pickupCode }}
                                </div>
                            </ClientOnly>
                        </div>
                    </div>

                    <!-- Notify on Pickup -->
                    <div class="pt-4">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <div
                                class="w-5 h-5 rounded border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors"
                            >
                                <div v-if="notifyOnPickup" class="w-2 h-2 bg-primary rounded-sm" />
                            </div>
                            <input v-model="notifyOnPickup" type="checkbox" class="sr-only" />
                            <span class="text-xs text-on-surface-variant">{{ t('upload.settings.notifyPickup') }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Upload Queue -->
            <div class="lg:col-span-12 space-y-6 pt-8">
                <div class="flex items-center justify-between border-b border-white/5 pb-4">
                    <h4 class="font-headline text-lg font-bold">{{ t('upload.queue.title') }}</h4>
                    <div class="flex items-center gap-3">
                        <button
                            v-if="queue.some((t) => t.status === 'complete')"
                            @click="handleClearCompleted"
                            class="text-[10px] font-bold uppercase px-3 py-1 text-on-surface-variant hover:text-primary transition-colors"
                        >
                            {{ t('upload.queue.clearCompleted') }}
                        </button>
                        <span
                            class="text-[10px] font-bold uppercase px-3 py-1 bg-surface-container-high rounded-full text-on-surface-variant tracking-widest"
                        >
                            {{ queue.length }} {{ t('upload.queue.activeTasks') }}
                        </span>
                    </div>
                </div>
                <div class="space-y-4">
                    <div
                        v-for="task in queue"
                        :key="task.id"
                        :class="
                            cn(
                                'group flex items-center gap-6 p-4 rounded-xl hover:bg-surface-bright transition-all',
                                task.status === 'pending' && 'opacity-60'
                            )
                        "
                    >
                        <div class="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center">
                            <LucideLoader2
                                v-if="task.status === 'uploading' || task.status === 'processing'"
                                class="w-6 h-6 text-primary animate-spin"
                            />
                            <LucideCheckCircle v-else-if="task.status === 'complete'" class="w-6 h-6 text-tertiary" />
                            <LucideAlertCircle v-else-if="task.status === 'error'" class="w-6 h-6 text-error" />
                            <component v-else :is="getFileIcon(task)" class="w-6 h-6 text-primary" />
                        </div>
                        <div class="flex-1 space-y-2">
                            <div class="flex justify-between items-end">
                                <div>
                                    <span class="block text-sm font-semibold">{{ task.name }}</span>
                                    <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">
                                        {{ getStatusText(task) }} • {{ formatFileSize(task.size) }}
                                    </span>
                                </div>
                                <span
                                    :class="
                                        cn(
                                            'text-xs font-bold',
                                            task.status === 'pending' && 'text-on-surface-variant',
                                            task.status === 'uploading' && 'text-tertiary',
                                            task.status === 'processing' && 'text-tertiary',
                                            task.status === 'complete' && 'text-tertiary',
                                            task.status === 'error' && 'text-error'
                                        )
                                    "
                                >
                                    <template v-if="task.status === 'pending'">{{ t('upload.queue.waiting') }}</template>
                                    <template v-else-if="task.status === 'complete'">{{ t('upload.queue.done') }}</template>
                                    <template v-else-if="task.status === 'error'">{{ t('upload.queue.failed') }}</template>
                                    <template v-else>{{ task.progress }}%</template>
                                </span>
                            </div>
                            <div class="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                <div
                                    :class="
                                        cn(
                                            'h-full transition-all duration-700',
                                            task.status === 'pending' && 'bg-primary/20',
                                            task.status === 'uploading' && 'bg-tertiary progress-glow',
                                            task.status === 'processing' && 'bg-tertiary progress-glow',
                                            task.status === 'complete' && 'bg-tertiary',
                                            task.status === 'error' && 'bg-error'
                                        )
                                    "
                                    :style="{ width: `${task.progress}%` }"
                                />
                            </div>
                            <!-- Show share link if upload complete -->
                            <div v-if="task.status === 'complete' && task.shortLink" class="mt-2">
                                <a :href="task.shortLink" class="text-primary text-xs font-mono hover:underline" target="_blank">
                                    {{ task.shortLink }}
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                v-if="task.status === 'complete' && task.shortLink"
                                @click="navigator.clipboard.writeText(task.shortLink!)"
                                class="text-on-surface-variant hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring rounded-lg"
                                :aria-label="t('upload.queue.copyLink')"
                            >
                                <LucideUploadCloud class="w-5 h-5" aria-hidden="true" />
                            </button>
                            <button
                                @click="handleRemoveTask(task.id)"
                                class="text-on-surface-variant hover:text-error transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring rounded-lg"
                                :aria-label="t('upload.queue.removeItem', { name: task.name })"
                            >
                                <LucideX class="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <!-- Empty state when no uploads -->
                    <div v-if="queue.length === 0" class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                        <LucideUploadCloud class="w-12 h-12 mb-4 opacity-50" />
                        <p class="text-sm">{{ t('upload.queue.empty') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
