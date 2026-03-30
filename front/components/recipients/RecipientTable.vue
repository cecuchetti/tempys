<script setup lang="ts">
/**
 * RecipientTable Component
 *
 * Displays a table of recipients with pagination and filtering.
 */
import { LucideTrash2, LucideLoader2 } from 'lucide-vue-next'
import type { Recipient } from '@/types/recipients'

interface Props {
    recipients: Recipient[]
    loading?: boolean
    shareIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
    recipients: () => [],
    loading: false,
    shareIds: () => [],
})

const emit = defineEmits<{
    delete: [id: string]
}>()

const { t } = useI18n()

// Filter state
const filterShareId = ref<string>('all')

// Filtered recipients
const filteredRecipients = computed(() => {
    if (filterShareId.value === 'all') return props.recipients
    return props.recipients.filter((r) => r.shareId === filterShareId.value)
})

// Mask contact info
const maskEmail = (email: string): string => {
    if (!email) return '-'
    const parts = email.split('@')
    if (parts.length < 2) return '-'
    const local = parts[0] ?? ''
    const domain = parts[1] ?? ''
    const maskedLocal = local.slice(0, 2) + '***'
    return `${maskedLocal}@${domain}`
}

const maskPhone = (phone: string): string => {
    if (!phone) return '-'
    return phone.slice(0, 4) + '****' + phone.slice(-2)
}

// Format date
const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

// Handle delete
const handleDelete = (id: string) => {
    emit('delete', id)
}
</script>

<template>
    <div class="recipient-table">
        <!-- Filter -->
        <div class="mb-4">
            <select
                v-model="filterShareId"
                class="px-4 py-2 bg-surface-container-high border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
                <option value="all">{{ t('recipients.recipients.filter.all') }}</option>
                <option v-for="shareId in shareIds" :key="shareId" :value="shareId">
                    {{ shareId }}
                </option>
            </select>
        </div>

        <!-- Table -->
        <div class="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
            <table class="w-full text-left">
                <thead>
                    <tr class="bg-surface-container-lowest/40 border-b border-white/5">
                        <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                            {{ t('recipients.recipients.table.name') }}
                        </th>
                        <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                            {{ t('recipients.recipients.table.contact') }}
                        </th>
                        <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                            {{ t('recipients.recipients.table.share') }}
                        </th>
                        <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold">
                            {{ t('recipients.recipients.table.joined') }}
                        </th>
                        <th class="px-6 py-4 text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold text-right">
                            {{ t('recipients.recipients.table.actions') }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-if="loading">
                        <td colspan="5" class="px-6 py-12 text-center">
                            <LucideLoader2 class="w-6 h-6 animate-spin mx-auto text-primary" />
                        </td>
                    </tr>
                    <tr v-else v-for="recipient in filteredRecipients" :key="recipient.id" class="hover:bg-white/[0.02] transition-colors">
                        <td class="px-6 py-5">
                            <p class="text-sm font-bold text-white">{{ recipient.name }}</p>
                        </td>
                        <td class="px-6 py-5">
                            <p class="text-sm text-on-surface-variant font-mono">
                                {{ recipient.email ? maskEmail(recipient.email) : maskPhone(recipient.phone || '') }}
                            </p>
                        </td>
                        <td class="px-6 py-5">
                            <span class="px-2.5 py-1 bg-surface-container-high rounded-lg text-xs font-medium text-on-surface-variant">
                                {{ recipient.shareId }}
                            </span>
                        </td>
                        <td class="px-6 py-5">
                            <p class="text-sm text-on-surface-variant">{{ formatDate(recipient.createdAt) }}</p>
                        </td>
                        <td class="px-6 py-5 text-right">
                            <button
                                @click="handleDelete(recipient.id)"
                                class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all focus-ring"
                                :aria-label="t('recipients.recipients.actions.delete')"
                            >
                                <LucideTrash2 class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!loading && filteredRecipients.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-on-surface-variant">
                            {{ t('recipients.recipients.empty.title') }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
