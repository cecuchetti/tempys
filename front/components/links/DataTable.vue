<script setup lang="ts">
import { cn } from '@/lib/utils'
import { LucideKey, LucideSettings2, LucideTrash2, LucideRefreshCw, LucideFileText } from 'lucide-vue-next'
import StatusBadge from './StatusBadge.vue'
import CopyLinkButton from './CopyLinkButton.vue'

interface LinkItem {
    id: string
    name: string
    shortLink: string
    status: 'active' | 'expired' | 'one-time'
    clicks: number
    createdAt: string
    size?: string
    filesCount?: number
}

interface DataTableProps {
    links: LinkItem[]
}

defineProps<DataTableProps>()

const emit = defineEmits<{
    copy: [link: string]
    settings: [id: string]
    delete: [id: string]
    refresh: [id: string]
}>()
</script>

<template>
    <div class="data-table bg-surface-container-low rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <table class="w-full text-left border-collapse">
            <!-- Header -->
            <thead>
                <tr class="bg-surface-container-lowest/40 border-b border-white/5">
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">Asset Name</th>
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">Short Link</th>
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">Status</th>
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold text-center">Clicks</th>
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">Created</th>
                    <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold text-right">Actions</th>
                </tr>
            </thead>
            <!-- Body -->
            <tbody class="divide-y divide-white/5">
                <tr
                    v-for="link in links"
                    :key="link.id"
                    :class="cn('hover:bg-white/[0.02] transition-colors group', link.status === 'expired' && 'opacity-60 hover:opacity-100')"
                >
                    <!-- Asset Name -->
                    <td class="px-6 py-5">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5"
                            >
                                <LucideFileText class="w-5 h-5" />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">{{ link.name }}</p>
                                <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                                    {{ link.size || 'Shared Text' }}
                                    {{ link.filesCount ? ` • ${link.filesCount} files` : '' }}
                                    {{ link.status === 'one-time' ? ' • Locked' : '' }}
                                </p>
                            </div>
                        </div>
                    </td>
                    <!-- Short Link -->
                    <td class="px-6 py-5">
                        <CopyLinkButton :link="link.shortLink" @click="emit('copy', link.shortLink)" />
                    </td>
                    <!-- Status -->
                    <td class="px-6 py-5">
                        <StatusBadge :status="link.status" />
                    </td>
                    <!-- Clicks -->
                    <td class="px-6 py-5 text-center font-bold text-white text-sm">
                        {{ link.clicks }}
                    </td>
                    <!-- Created -->
                    <td class="px-6 py-5 text-[11px] text-on-surface-variant font-medium">
                        {{ link.createdAt }}
                    </td>
                    <!-- Actions -->
                    <td class="px-6 py-5 text-right">
                        <div class="flex items-center justify-end gap-1">
                            <template v-if="link.status === 'expired'">
                                <button
                                    class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    @click="emit('refresh', link.id)"
                                >
                                    <LucideRefreshCw class="w-4.5 h-4.5" />
                                </button>
                            </template>
                            <template v-else>
                                <button
                                    class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    @click="emit('settings', link.id)"
                                >
                                    <LucideKey class="w-4.5 h-4.5" />
                                </button>
                                <button
                                    class="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    @click="emit('settings', link.id)"
                                >
                                    <LucideSettings2 class="w-4.5 h-4.5" />
                                </button>
                            </template>
                            <button
                                class="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                @click="emit('delete', link.id)"
                            >
                                <LucideTrash2 class="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
