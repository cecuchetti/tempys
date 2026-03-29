<script setup lang="ts">
import {
    LucideDownload,
    LucideClock,
    LucideShield,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideFileText,
    LucideFileArchive,
    LucideImage,
    LucideFile,
    LucideCopy,
    LucideCheck,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useApi } from '@/composables/useApi'

definePageMeta({
    layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { get } = useApi()

const shareId = computed(() => route.params.id as string)

interface ShareData {
    id: string
    type: string
    name: string
    file_name?: string
    size?: number
    expire_at?: number
    download_nums?: number
    views_left?: number
    has_password?: boolean
    pickup_code?: string
}

const {
    data: shareData,
    isLoading,
    error,
    refetch,
} = await useAsyncData(
    `share-${shareId.value}`,
    async () => {
        const response = await get<ShareData>(`/share/${shareId.value}`)
        return response
    },
    {
        server: false,
    }
)

const isExpired = computed(() => {
    if (!shareData.value?.expire_at) return false
    return shareData.value.expire_at * 1000 < Date.now()
})

const isOutOfDownloads = computed(() => {
    if (!shareData.value?.views_left) return false
    return shareData.value.views_left <= 0
})

const fileType = computed(() => {
    const name = shareData.value?.name || shareData.value?.file_name || ''
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image'
    if (name.match(/\.(zip|rar|7z|tar|gz)$/i)) return 'archive'
    if (name.match(/\.(txt|md|json|xml|html|css|js)$/i)) return 'text'
    return 'file'
})

const getFileIcon = () => {
    switch (fileType.value) {
        case 'image':
            return LucideImage
        case 'archive':
            return LucideFileArchive
        case 'text':
            return LucideFileText
        default:
            return LucideFile
    }
}

const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatExpireTime = computed(() => {
    if (!shareData.value?.expire_at) return t('share.expired')
    const now = Date.now()
    const expireMs = shareData.value.expire_at * 1000
    const remaining = expireMs - now

    if (remaining <= 0) return t('share.expired')

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
        const days = Math.floor(hours / 24)
        return `${days} ${t('share.days')}`
    }
    return `${hours}${t('share.hours')} ${minutes}${t('share.minutes')}`
})

const copied = ref(false)
const copyPickupCode = async () => {
    if (shareData.value?.pickup_code) {
        await navigator.clipboard.writeText(shareData.value.pickup_code)
        copied.value = true
        toast.success(t('common.success'))
        setTimeout(() => {
            copied.value = false
        }, 2000)
    }
}

const handleDownload = async () => {
    try {
        const response = await $fetch<{ code: number; data?: { token?: string } }>('/api/download', {
            method: 'POST',
            credentials: 'include',
            body: { share_id: shareId.value },
        })

        if (response.data?.token) {
            window.location.href = `/api/download?token=${response.data.token}`
            toast.success(t('share.downloadStarted'))
        }
    } catch (err) {
        console.error('Download error:', err)
        toast.error(t('share.downloadFailed'))
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <div class="mb-8">
            <NuxtLink to="/upload" class="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                <LucideArrowLeft class="w-4 h-4" />
                <span class="text-sm font-medium">{{ t('share.backToHome') }}</span>
            </NuxtLink>
        </div>

        <div v-if="isLoading" class="bg-surface-container-low rounded-2xl p-8 space-y-6">
            <div class="flex flex-col items-center gap-4">
                <div class="w-20 h-20 bg-surface-container-high rounded-2xl animate-pulse" />
                <div class="h-6 w-48 bg-surface-container-high rounded animate-pulse" />
                <div class="h-4 w-32 bg-surface-container-high rounded animate-pulse" />
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div v-for="i in 3" :key="i" class="h-20 bg-surface-container-high rounded-xl animate-pulse" />
            </div>
            <div class="h-14 bg-primary/20 rounded-xl animate-pulse" />
        </div>

        <div v-else-if="error || isExpired || isOutOfDownloads" class="bg-surface-container-low rounded-2xl p-8">
            <div class="flex flex-col items-center text-center gap-4">
                <div class="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center">
                    <LucideAlertCircle class="w-10 h-10 text-error" />
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-on-surface mb-2">
                        {{ isOutOfDownloads ? t('share.outOfDownloads') : t('share.expired') }}
                    </h2>
                    <p class="text-on-surface-variant">
                        {{ isOutOfDownloads ? t('share.outOfDownloadsDesc') : t('share.expiredDesc') }}
                    </p>
                </div>
                <NuxtLink
                    to="/upload"
                    class="mt-4 px-6 py-3 kinetic-gradient text-on-primary font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    {{ t('share.createNew') }}
                </NuxtLink>
            </div>
        </div>

        <div v-else-if="shareData" class="bg-surface-container-low rounded-2xl p-8 space-y-6">
            <div class="flex flex-col items-center text-center gap-4">
                <div class="w-20 h-20 bg-surface-container-high rounded-2xl flex items-center justify-center">
                    <component :is="getFileIcon()" class="w-10 h-10 text-primary" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-on-surface mb-1">
                        {{ shareData.name || shareData.file_name || t('share.untitled') }}
                    </h1>
                    <p v-if="shareData.size" class="text-on-surface-variant text-sm">
                        {{ formatFileSize(shareData.size) }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div class="bg-surface-container rounded-xl p-4 text-center">
                    <LucideClock class="w-5 h-5 text-tertiary mx-auto mb-2" />
                    <div class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {{ t('share.expires') }}
                    </div>
                    <div class="font-semibold text-on-surface text-sm">{{ formatExpireTime }}</div>
                </div>

                <div class="bg-surface-container rounded-xl p-4 text-center">
                    <LucideDownload class="w-5 h-5 text-tertiary mx-auto mb-2" />
                    <div class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {{ t('share.downloads') }}
                    </div>
                    <div class="font-semibold text-on-surface text-sm">
                        {{ shareData.views_left ?? shareData.download_nums ?? '∞' }}
                    </div>
                </div>

                <div class="bg-surface-container rounded-xl p-4 text-center">
                    <LucideShield :class="shareData.has_password ? 'text-warning' : 'text-tertiary'" class="w-5 h-5 mx-auto mb-2" />
                    <div class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {{ t('share.security') }}
                    </div>
                    <div class="font-semibold text-on-surface text-sm">
                        {{ shareData.has_password ? t('share.password') : t('share.public') }}
                    </div>
                </div>
            </div>

            <div v-if="shareData.pickup_code" class="bg-surface-container rounded-xl p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                            {{ t('share.pickupCode') }}
                        </div>
                        <div class="font-mono text-xl font-bold text-tertiary tracking-widest">
                            {{ shareData.pickup_code }}
                        </div>
                    </div>
                    <button
                        @click="copyPickupCode"
                        class="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                        :title="t('links.actions.copy')"
                    >
                        <component :is="copied ? LucideCheck : LucideCopy" class="w-5 h-5 text-on-surface-variant" />
                    </button>
                </div>
            </div>

            <button
                @click="handleDownload"
                class="w-full py-4 kinetic-gradient text-on-primary font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
            >
                <LucideDownload class="w-5 h-5" />
                {{ t('share.download') }}
            </button>
        </div>
    </div>
</template>
