<script setup lang="ts">
import {
    LucidePlus,
    LucideFilter,
    LucideCopy,
    LucideKey,
    LucideSettings2,
    LucideTrash2,
    LucideRefreshCw,
    LucideChevronLeft,
    LucideChevronRight,
    LucideShield,
    LucideRocket,
    LucideLock,
    LucideLink,
    LucideInbox,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useLinks } from '@/composables/useLinks'
import type { Link } from '@/composables/useLinks'
import LinksTableSkeleton from '@/components/links/LinksTableSkeleton.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()
const { links, totalLinks, storageUsed, engagement24h, loading, error, fetchLinks, deleteLink, copyLink } = useLinks()

// Fetch links on mount
onMounted(() => {
    fetchLinks()
})

// Filter state
const activeFilter = ref('all')
const filters = computed(() => [
    { id: 'all', label: t('links.filter.all') },
    { id: 'files', label: t('links.filter.files') },
    { id: 'text', label: t('links.filter.text') },
    { id: 'active', label: t('links.filter.active') },
    { id: 'expired', label: t('links.filter.expired') },
])

// Filtered links based on active filter
const filteredLinks = computed(() => {
    if (activeFilter.value === 'all') return links.value
    if (activeFilter.value === 'files') return links.value.filter((l) => l.type === 'file')
    if (activeFilter.value === 'text') return links.value.filter((l) => l.type === 'text')
    if (activeFilter.value === 'active') return links.value.filter((l) => l.status === 'active')
    if (activeFilter.value === 'expired') return links.value.filter((l) => l.status === 'expired')
    return links.value
})

const getStatusLabel = (status: Link['status']) => {
    const labels: Record<string, string> = {
        active: t('links.status.active'),
        expired: t('links.status.expired'),
        'one-time': t('links.status.oneTime'),
    }
    return labels[status]
}

const getStatusClasses = (status: Link['status']) => {
    const classes: Record<string, string> = {
        active: 'bg-tertiary/10 text-tertiary border-tertiary/20',
        expired: 'bg-error/10 text-error border-error/20',
        'one-time': 'bg-surface-container-high text-on-surface-variant border-white/5',
    }
    return classes[status]
}

// Handle link copy
const handleCopyLink = async (shortLink: string) => {
    await copyLink(shortLink)
}

// Handle link delete
const handleDeleteLink = async (id: string) => {
    const success = await deleteLink(id)
    if (success) {
        const toast = (await import('vue-sonner')).toast
        toast.success(t('links.deleteSuccess') || 'Link deleted successfully')
    }
}

// Refetch handler
const refetch = () => {
    fetchLinks()
}

// Empty state action
const emptyStateAction = computed(() => ({
    label: t('links.empty.cta'),
    onClick: () => navigateTo('/upload'),
}))
</script>

<template>
    <div class="space-y-12">
        <!-- Loading State -->
        <LinksTableSkeleton v-if="loading" />

        <!-- Error State -->
        <ErrorState
            v-else-if="error"
            :title="t('links.error.title')"
            :message="error.message"
            :retry-label="t('links.error.retry')"
            @retry="refetch"
        />

        <!-- Empty State -->
        <EmptyState
            v-else-if="!loading && links.length === 0"
            :icon="LucideInbox"
            :title="t('links.empty.title')"
            :description="t('links.empty.description')"
            :action="emptyStateAction"
        />

        <!-- Data State -->
        <template v-else>
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="space-y-2">
                    <span class="font-headline text-primary uppercase tracking-[0.2em] text-[0.65rem] font-bold">
                        {{ t('links.subtitle') }}
                    </span>
                    <h2 class="font-headline text-white text-[3.5rem] font-extrabold leading-none tracking-tighter">{{ t('links.title') }}.</h2>
                </div>
                <NuxtLink
                    to="/upload"
                    class="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3.5 rounded-xl text-sm tracking-wide transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                >
                    <LucidePlus class="w-5 h-5" />
                    {{ t('links.newLink') }}
                </NuxtLink>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class="bg-surface-container-low p-6 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
                >
                    <div class="space-y-1">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold">
                            {{ t('links.totalActiveLinks') }}
                        </p>
                        <p class="text-3xl font-extrabold text-white">{{ totalLinks }}</p>
                    </div>
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <LucideLink class="w-6 h-6" />
                    </div>
                </div>
                <div
                    class="bg-surface-container-low p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-tertiary/30 transition-all"
                >
                    <div class="flex items-center justify-between">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold">
                            {{ t('links.storageCapacity') }}
                        </p>
                        <p class="text-xs font-bold text-tertiary">{{ storageUsed }}% {{ t('links.storageUsed') }}</p>
                    </div>
                    <div class="space-y-2">
                        <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                            <div class="h-full bg-tertiary" :style="{ width: `${storageUsed}%` }" />
                        </div>
                        <p class="text-[10px] text-on-surface-variant font-bold text-right uppercase tracking-wider">4.6 GB / 5.0 GB</p>
                    </div>
                </div>
                <div
                    class="bg-surface-container-low p-6 rounded-xl border border-white/5 flex items-center justify-between hover:border-primary/30 transition-all"
                >
                    <div class="space-y-1">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold">
                            {{ t('links.engagement24h') }}
                        </p>
                        <p class="text-3xl font-extrabold text-white">{{ engagement24h.toLocaleString() }}</p>
                    </div>
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <LucideRefreshCw class="w-6 h-6" />
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="space-y-6">
                <!-- Filters -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 p-1.5 bg-surface-container-lowest rounded-xl border border-white/5">
                        <button
                            v-for="filter in filters"
                            :key="filter.id"
                            @click="activeFilter = filter.id"
                            :class="
                                cn(
                                    'px-5 py-2 rounded-lg text-[0.6875rem] font-bold uppercase tracking-wider transition-colors',
                                    activeFilter === filter.id
                                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
                                        : 'text-on-surface-variant hover:text-white'
                                )
                            "
                        >
                            {{ filter.label }}
                        </button>
                    </div>
                    <button
                        class="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant hover:text-white py-2 px-4 transition-all"
                    >
                        <LucideFilter class="w-4 h-4" />
                        {{ t('links.sortByDate') }}
                    </button>
                </div>

                <!-- Data Table -->
                <div class="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-lowest/40 border-b border-white/5">
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                                    {{ t('links.table.assetName') }}
                                </th>
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                                    {{ t('links.table.shortLink') }}
                                </th>
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                                    {{ t('links.table.status') }}
                                </th>
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold text-center">
                                    {{ t('links.table.clicks') }}
                                </th>
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                                    {{ t('links.table.created') }}
                                </th>
                                <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold text-right">
                                    {{ t('links.table.actions') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <tr
                                v-for="link in filteredLinks"
                                :key="link.id"
                                :class="
                                    cn('hover:bg-white/[0.02] transition-colors group', link.status === 'expired' && 'opacity-60 hover:opacity-100')
                                "
                            >
                                <td class="px-6 py-5">
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5"
                                        >
                                            <LucidePlus class="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-white">{{ link.name }}</p>
                                            <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                                                {{ link.size || 'Shared Text' }}
                                                <template v-if="link.filesCount"> • {{ link.filesCount }} files</template>
                                                <template v-else-if="link.status === 'one-time'"> •Locked</template>
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                                        {{ link.shortLink }}
                                        <button
                                            @click="handleCopyLink(link.shortLink)"
                                            class="opacity-0 group-hover:opacity-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-ring rounded-lg opacity-60 hover:opacity-100"
                                            :aria-label="t('links.actions.copyLink')"
                                        >
                                            <LucideCopy class="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <span
                                        :class="
                                            cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                                                getStatusClasses(link.status)
                                            )
                                        "
                                    >
                                        <span class="w-1.5 h-1.5 rounded-full bg-current" />
                                        {{ getStatusLabel(link.status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-5 text-center font-bold text-white text-sm">{{ link.clicks }}</td>
                                <td class="px-6 py-5 text-[11px] text-on-surface-variant font-medium">{{ link.createdAt }}</td>
                                <td class="px-6 py-5 text-right">
                                    <div class="flex items-center justify-end gap-1">
                                        <template v-if="link.status === 'expired'">
                                            <button
                                                class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus-ring"
                                                :aria-label="t('links.actions.renew')"
                                            >
                                                <LucideRefreshCw class="w-4.5 h-4.5" aria-hidden="true" />
                                            </button>
                                        </template>
                                        <template v-else>
                                            <button
                                                class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus-ring"
                                                :aria-label="t('links.actions.copy')"
                                            >
                                                <LucideKey class="w-4.5 h-4.5" aria-hidden="true" />
                                            </button>
                                            <button
                                                class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus-ring"
                                                :aria-label="t('links.actions.settings')"
                                            >
                                                <LucideSettings2 class="w-4.5 h-4.5" aria-hidden="true" />
                                            </button>
                                        </template>
                                        <button
                                            @click="handleDeleteLink(link.id)"
                                            class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all focus-ring"
                                            :aria-label="t('links.actions.delete')"
                                        >
                                            <LucideTrash2 class="w-4.5 h-4.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between pt-4">
                    <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {{ t('links.showing', { 0: filteredLinks.length.toString(), 1: links.length.toString() }) }}
                    </p>
                    <nav class="flex gap-2" aria-label="Pagination">
                        <button
                            class="w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 transition-all focus-ring"
                            :aria-label="t('links.pagination.previous')"
                        >
                            <LucideChevronLeft class="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                            class="w-[44px] h-[44px] flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-[11px] focus-ring"
                            aria-label="Page 1, current page"
                            aria-current="page"
                        >
                            1
                        </button>
                        <button
                            class="w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 transition-all focus-ring font-bold text-[11px]"
                            :aria-label="t('links.pagination.page', { number: 2 })"
                        >
                            2
                        </button>
                        <button
                            class="w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 transition-all focus-ring"
                            :aria-label="t('links.pagination.next')"
                        >
                            <LucideChevronRight class="w-4 h-4" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Bento Card Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
                <div class="relative overflow-hidden group rounded-xl p-8 bg-primary text-on-primary shadow-2xl">
                    <div class="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <LucideShield class="w-10 h-10 mb-4" />
                            <h3 class="text-2xl font-bold tracking-tight mb-2">{{ t('links.promo.security.title') }}</h3>
                            <p class="text-on-primary/80 text-sm max-w-xs mb-6">{{ t('links.promo.security.description') }}</p>
                        </div>
                        <button
                            class="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-wider py-2 border-b-2 border-on-primary/30 hover:border-on-primary transition-all"
                        >
                            {{ t('links.promo.security.cta') }}
                        </button>
                    </div>
                    <div class="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <LucideLock class="w-48 h-48" />
                    </div>
                </div>
                <div class="bg-surface-container-low border border-white/5 p-8 rounded-xl flex items-center justify-between group">
                    <div class="space-y-4">
                        <h3 class="text-xl font-bold text-white tracking-tight">{{ t('links.promo.upload.title') }}</h3>
                        <p class="text-on-surface-variant text-sm max-w-xs leading-relaxed">{{ t('links.promo.upload.description') }}</p>
                        <div class="flex gap-4">
                            <NuxtLink
                                to="/upload"
                                class="bg-surface-container-high text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-all border border-white/5"
                            >
                                {{ t('links.promo.upload.start') }}
                            </NuxtLink>
                            <button
                                class="text-primary px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-all"
                            >
                                {{ t('links.promo.upload.learnMore') }}
                            </button>
                        </div>
                    </div>
                    <div
                        class="hidden lg:flex w-32 h-32 bg-surface-container-lowest rounded-full border-4 border-white/5 items-center justify-center shadow-inner group-hover:scale-110 transition-transform"
                    >
                        <LucideRocket class="w-10 h-10 text-primary" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
