<script setup lang="ts">
/**
 * Recipients Dashboard Page
 *
 * Manages recipients, groups, and link distribution with three tabs:
 * - Recipients: View and manage all registered recipients
 * - Groups: Create and manage recipient groups
 * - Send: Send share links to groups via email/SMS
 */
import {
    LucideUsers,
    LucideUserPlus,
    LucideSend,
    LucidePlus,
    LucideTrash2,
    LucideEdit2,
    LucideLoader2,
    LucideMail,
    LucideMessageSquare,
    LucideCheckCircle,
    LucideXCircle,
    LucideInfo,
    LucideCopy,
    LucideLink,
    LucideUploadCloud,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import type { Recipient, Group, ShareLink } from '@/types/recipients'

definePageMeta({
    layout: 'dashboard',
})

const { t } = useI18n()

// Tab state
const activeTab = ref<'recipients' | 'groups' | 'send'>('recipients')

// Composables
const {
    recipients,
    loading: recipientsLoading,
    error: recipientsError,
    fetchRecipients,
    deleteRecipient,
    getTotalCount,
    getThisWeekCount,
    getCountByShare,
} = useRecipients()
const { groups, loading: groupsLoading, error: groupsError, fetchGroups, createGroup, updateGroup, deleteGroup } = useGroups()
const { shares, sending, sendResult, fetchUserShares, sendToGroup, clearSendResult } = useSendLinks()

// Local SMS sending state (for mock)
const localSending = ref(false)

// Fetch data on mount
onMounted(async () => {
    await Promise.all([fetchRecipients(), fetchGroups(), fetchUserShares()])
})

// =============================================================================
// Recipients Tab
// =============================================================================

// Filter state
const recipientFilter = ref<string>('all')
const filteredRecipients = computed(() => {
    if (recipientFilter.value === 'all') return recipients.value
    return recipients.value.filter((r) => r.shareId === recipientFilter.value)
})

// Get unique share IDs for filter
const uniqueShares = computed(() => {
    const shareIds = new Set(recipients.value.map((r) => r.shareId))
    return Array.from(shareIds)
})

// Stats
const totalRecipients = computed(() => getTotalCount())
const thisWeekRecipients = computed(() => getThisWeekCount())
const byShareCounts = computed(() => getCountByShare())

// Mask contact info for privacy
const maskEmail = (email: string): string => {
    if (!email) return ''
    const parts = email.split('@')
    if (parts.length < 2) return '-'
    const local = parts[0] ?? ''
    const domain = parts[1] ?? ''
    const maskedLocal = local.slice(0, 2) + '***'
    return `${maskedLocal}@${domain}`
}

const maskPhone = (phone: string): string => {
    if (!phone) return ''
    return phone.slice(0, 4) + '****' + phone.slice(-2)
}

// Format date
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Handle delete
const handleDeleteRecipient = async (id: string) => {
    const success = await deleteRecipient(id)
    if (success) {
        const toast = (await import('vue-sonner')).toast
        toast.success(t('recipients.recipients.deleted') || 'Recipient deleted')
    }
}

// =============================================================================
// Groups Tab
// =============================================================================

// Modal state
const showGroupModal = ref(false)
const editingGroup = ref<(typeof groups.value)[0] | null>(null)
const groupForm = reactive({
    name: '',
    recipientIds: [] as string[],
})
const groupFormLoading = ref(false)

// Open create modal
const openCreateModal = () => {
    editingGroup.value = null
    groupForm.name = ''
    groupForm.recipientIds = []
    showGroupModal.value = true
}

// Open edit modal
const openEditModal = (group: (typeof groups.value)[0]) => {
    editingGroup.value = group
    groupForm.name = group.name
    groupForm.recipientIds = [...group.recipientIds]
    showGroupModal.value = true
}

// Close modal
const closeGroupModal = () => {
    showGroupModal.value = false
    editingGroup.value = null
}

// Save group
const saveGroup = async () => {
    if (!groupForm.name.trim()) return

    groupFormLoading.value = true

    try {
        if (editingGroup.value) {
            // Update existing group
            const result = await updateGroup(editingGroup.value.id, {
                name: groupForm.name.trim(),
                recipientIds: groupForm.recipientIds,
            })
            if (result) {
                const toast = (await import('vue-sonner')).toast
                toast.success(t('recipients.groups.updated') || 'Group updated')
            }
        } else {
            // Create new group
            const result = await createGroup({
                name: groupForm.name.trim(),
                recipientIds: groupForm.recipientIds,
            })
            if (result) {
                const toast = (await import('vue-sonner')).toast
                toast.success(t('recipients.groups.created') || 'Group created')
            }
        }
        closeGroupModal()
    } catch (e) {
        console.error('[recipients] Failed to save group:', e)
    } finally {
        groupFormLoading.value = false
    }
}

// Handle delete
const handleDeleteGroup = async (id: string) => {
    const success = await deleteGroup(id)
    if (success) {
        const toast = (await import('vue-sonner')).toast
        toast.success(t('recipients.groups.deleted') || 'Group deleted')
    }
}

// Toggle recipient selection
const toggleRecipient = (recipientId: string) => {
    const index = groupForm.recipientIds.indexOf(recipientId)
    if (index === -1) {
        groupForm.recipientIds.push(recipientId)
    } else {
        groupForm.recipientIds.splice(index, 1)
    }
}

// =============================================================================
// Send Tab
// =============================================================================

// Form state
const selectedGroupId = ref<string>('')
const selectedShareIds = ref<string[]>([])

// Get selected group
const selectedGroup = computed(() => {
    return groups.value.find((g) => g.id === selectedGroupId.value)
})

// Get selected shares
const selectedShares = computed(() => {
    return shares.value.filter((s) => selectedShareIds.value.includes(s.id))
})

// Preview count
const previewCount = computed(() => {
    if (!selectedGroup.value || selectedShareIds.value.length === 0) return 0
    return selectedGroup.value.recipientCount * selectedShareIds.value.length
})

// Toggle share selection
const toggleShare = (shareId: string) => {
    const index = selectedShareIds.value.indexOf(shareId)
    if (index === -1) {
        selectedShareIds.value.push(shareId)
    } else {
        selectedShareIds.value.splice(index, 1)
    }
}

// Send via email
const handleSendEmail = async () => {
    if (!selectedGroupId.value || selectedShareIds.value.length === 0) return

    const result = await sendToGroup(selectedGroupId.value, selectedShareIds.value)
    if (result) {
        const toast = (await import('vue-sonner')).toast
        toast.success(t('recipients.send.success', { count: result.sent }) || `Sent ${result.sent} emails`)
    }
}

// Send via SMS (mock)
const handleSendSms = async () => {
    if (!selectedGroupId.value || selectedShareIds.value.length === 0) return

    // Mock SMS sending
    localSending.value = true
    await new Promise((resolve) => setTimeout(resolve, 1500))
    localSending.value = false

    const toast = (await import('vue-sonner')).toast
    toast.success(t('recipients.send.smsSuccess', { count: selectedShareIds.value.length }) || 'SMS simulation sent')
}

// Reset send result
watch(activeTab, () => {
    if (activeTab.value !== 'send') {
        clearSendResult()
    }
})

// Helper: Get base URL
const getBaseUrl = (): string => {
    if (import.meta.client) {
        return window.location.origin
    }
    return 'http://localhost:3000'
}

// Helper: Copy to clipboard
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        const toast = (await import('vue-sonner')).toast
        toast.success(t('recipients.send.copied') || 'URL copied to clipboard!')
    } catch (e) {
        console.error('[recipients] Failed to copy:', e)
    }
}
</script>

<template>
    <div class="space-y-12">
        <!-- Page Header -->
        <div class="space-y-2">
            <span class="font-headline text-primary uppercase tracking-[0.2em] text-[0.65rem] font-bold">
                {{ t('recipients.subtitle') }}
            </span>
            <h2 class="font-headline text-white text-[3.5rem] font-extrabold leading-none tracking-tighter">{{ t('recipients.title') }}.</h2>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 p-1.5 bg-surface-container-low rounded-xl border border-white/5 max-w-fit">
            <button
                @click="activeTab = 'recipients'"
                :class="[
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.6875rem] font-bold uppercase tracking-wider transition-all',
                    activeTab === 'recipients'
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
                        : 'text-on-surface-variant hover:text-white',
                ]"
            >
                <LucideUsers class="w-4 h-4" />
                {{ t('recipients.tabs.recipients') }}
            </button>
            <button
                @click="activeTab = 'groups'"
                :class="[
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.6875rem] font-bold uppercase tracking-wider transition-all',
                    activeTab === 'groups' ? 'bg-primary text-on-primary shadow-lg shadow-primary/10' : 'text-on-surface-variant hover:text-white',
                ]"
            >
                <LucideUserPlus class="w-4 h-4" />
                {{ t('recipients.tabs.groups') }}
            </button>
            <button
                @click="activeTab = 'send'"
                :class="[
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.6875rem] font-bold uppercase tracking-wider transition-all',
                    activeTab === 'send' ? 'bg-primary text-on-primary shadow-lg shadow-primary/10' : 'text-on-surface-variant hover:text-white',
                ]"
            >
                <LucideSend class="w-4 h-4" />
                {{ t('recipients.tabs.send') }}
            </button>
        </div>

        <!-- ===================================================================== -->
        <!-- RECIPIENTS TAB -->
        <!-- ===================================================================== -->
        <div v-if="activeTab === 'recipients'" class="space-y-8">
            <!-- Loading -->
            <div v-if="recipientsLoading" class="flex items-center justify-center py-20">
                <LucideLoader2 class="w-8 h-8 text-primary animate-spin" />
            </div>

            <!-- Error -->
            <ErrorState
                v-else-if="recipientsError"
                :title="t('recipients.recipients.error.title')"
                :message="recipientsError"
                :retry-label="t('common.retry')"
                @retry="fetchRecipients()"
            />

            <!-- Empty State -->
            <EmptyState
                v-else-if="recipients.length === 0"
                :icon="LucideUsers"
                :title="t('recipients.recipients.empty.title')"
                :description="t('recipients.recipients.empty.description')"
            />

            <!-- Data -->
            <template v-else>
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-surface-container-low p-6 rounded-xl border border-white/5">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                            {{ t('recipients.recipients.stats.total') }}
                        </p>
                        <p class="text-3xl font-extrabold text-white">{{ totalRecipients }}</p>
                    </div>
                    <div class="bg-surface-container-low p-6 rounded-xl border border-white/5">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                            {{ t('recipients.recipients.stats.thisWeek') }}
                        </p>
                        <p class="text-3xl font-extrabold text-white">{{ thisWeekRecipients }}</p>
                    </div>
                    <div class="bg-surface-container-low p-6 rounded-xl border border-white/5">
                        <p class="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                            {{ t('recipients.recipients.stats.byShare') }}
                        </p>
                        <p class="text-3xl font-extrabold text-white">{{ Object.keys(byShareCounts).length }}</p>
                    </div>
                </div>

                <!-- Filter -->
                <div class="flex items-center gap-4">
                    <label for="share-filter" class="text-sm font-medium text-on-surface-variant">
                        {{ t('recipients.recipients.filter.label') }}
                    </label>
                    <select
                        id="share-filter"
                        v-model="recipientFilter"
                        class="px-4 py-2 bg-surface-container-high border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">{{ t('recipients.recipients.filter.all') }}</option>
                        <option v-for="shareId in uniqueShares" :key="shareId" :value="shareId">
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
                            <tr v-for="recipient in filteredRecipients" :key="recipient.id" class="hover:bg-white/[0.02] transition-colors">
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
                                        @click="handleDeleteRecipient(recipient.id)"
                                        class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all focus-ring"
                                        :aria-label="t('recipients.recipients.actions.delete')"
                                    >
                                        <LucideTrash2 class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </div>

        <!-- ===================================================================== -->
        <!-- GROUPS TAB -->
        <!-- ===================================================================== -->
        <div v-if="activeTab === 'groups'" class="space-y-8">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <p class="text-sm text-on-surface-variant">
                    {{ t('recipients.groups.description') }}
                </p>
                <button
                    @click="openCreateModal"
                    class="flex items-center gap-2 bg-primary text-on-primary font-bold px-5 py-3 rounded-xl text-sm transition-all hover:bg-primary/90 focus-ring"
                >
                    <LucidePlus class="w-4 h-4" />
                    {{ t('recipients.groups.create') }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="groupsLoading" class="flex items-center justify-center py-20">
                <LucideLoader2 class="w-8 h-8 text-primary animate-spin" />
            </div>

            <!-- Empty State -->
            <EmptyState
                v-else-if="groups.length === 0"
                :icon="LucideUserPlus"
                :title="t('recipients.groups.empty.title')"
                :description="t('recipients.groups.empty.description')"
            />

            <!-- Groups List -->
            <div v-else class="space-y-4">
                <div
                    v-for="group in groups"
                    :key="group.id"
                    class="bg-surface-container-low p-6 rounded-xl border border-white/5 flex items-center justify-between group"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <LucideUsers class="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-white">{{ group.name }}</p>
                            <p class="text-xs text-on-surface-variant">
                                {{ t('recipients.groups.memberCount', { count: group.recipientCount }) }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            @click="openEditModal(group)"
                            class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus-ring"
                            :aria-label="t('recipients.groups.actions.edit')"
                        >
                            <LucideEdit2 class="w-4 h-4" />
                        </button>
                        <button
                            @click="handleDeleteGroup(group.id)"
                            class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all focus-ring"
                            :aria-label="t('recipients.groups.actions.delete')"
                        >
                            <LucideTrash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===================================================================== -->
        <!-- SEND TAB -->
        <!-- ===================================================================== -->
        <div v-if="activeTab === 'send'" class="space-y-8">
            <!-- Share Links Section - Copy URL to share -->
            <div class="bg-surface-container-high p-6 rounded-xl border border-white/5">
                <h4 class="text-sm font-bold text-white mb-4">{{ t('recipients.send.yourShareLinks') || 'Your Share Links' }}</h4>
                <p class="text-xs text-on-surface-variant mb-4">
                    {{ t('recipients.send.shareLinksDesc') || 'Copy these URLs and share them with your recipients:' }}
                </p>

                <!-- No shares yet -->
                <div v-if="shares.length === 0" class="text-center py-8">
                    <LucideLink class="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                    <p class="text-sm text-on-surface-variant">{{ t('recipients.send.noShares') || 'No shares yet. Create a share first.' }}</p>
                    <NuxtLink
                        to="/upload"
                        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <LucideUploadCloud class="w-4 h-4" />
                        {{ t('recipients.send.createShare') || 'Create Share' }}
                    </NuxtLink>
                </div>

                <!-- Share list with copy buttons -->
                <div v-else class="space-y-3">
                    <div
                        v-for="share in shares"
                        :key="share.id"
                        class="flex items-center gap-3 p-3 bg-surface-container-highest rounded-lg border border-white/5"
                    >
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white truncate">{{ share.name }}</p>
                            <p class="text-xs text-on-surface-variant font-mono">{{ getBaseUrl() }}/r/{{ share.id }}</p>
                        </div>
                        <button
                            @click="copyToClipboard(getBaseUrl() + '/r/' + share.id)"
                            class="flex items-center gap-2 px-3 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors min-h-[36px]"
                        >
                            <LucideCopy class="w-4 h-4" />
                            {{ t('recipients.send.copy') || 'Copy' }}
                        </button>
                    </div>
                </div>

                <p class="text-xs text-on-surface-variant/60 mt-4">
                    {{ t('recipients.send.shareNote') || 'Recipients who visit this URL will be able to register with their name and email/phone.' }}
                </p>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-4">
                <div class="flex-1 h-px bg-white/5"></div>
                <span class="text-xs text-on-surface-variant/50">{{ t('recipients.send.orSend') || 'OR send to existing group' }}</span>
                <div class="flex-1 h-px bg-white/5"></div>
            </div>

            <!-- Info Card -->
            <div class="bg-surface-container-high p-6 rounded-xl border border-white/5">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <LucideInfo class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white mb-1">{{ t('recipients.send.howItWorks') || 'How it works' }}</h4>
                        <p class="text-xs text-on-surface-variant">
                            {{ t('recipients.send.howItWorksDesc') || 'Recipients who register through this link:' }}
                        </p>
                        <ul class="text-xs text-on-surface-variant mt-2 space-y-1 list-disc list-inside">
                            <li>{{ t('recipients.send.step1') || 'Enter their name + email/phone' }}</li>
                            <li>{{ t('recipients.send.step2') || 'Automatically added to All Recipients group' }}</li>
                            <li>{{ t('recipients.send.step3') || 'You can then send content via email' }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Group Selection -->
            <div class="space-y-4">
                <label class="block">
                    <span class="text-sm font-medium text-on-surface-variant mb-2 block">
                        {{ t('recipients.send.selectGroup') }}
                    </span>
                    <select
                        v-model="selectedGroupId"
                        class="w-full md:w-80 px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">{{ t('recipients.send.selectGroupPlaceholder') }}</option>
                        <option v-for="group in groups" :key="group.id" :value="group.id">
                            {{ group.name }} ({{ group.recipientCount }} {{ t('recipients.send.recipients') }})
                        </option>
                    </select>
                </label>
            </div>

            <!-- Share Selection -->
            <div class="space-y-4">
                <label class="block">
                    <span class="text-sm font-medium text-on-surface-variant mb-2 block">
                        {{ t('recipients.send.selectShares') }}
                    </span>
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        v-for="share in shares"
                        :key="share.id"
                        @click="toggleShare(share.id)"
                        :class="[
                            'p-4 rounded-xl border text-left transition-all focus-ring',
                            selectedShareIds.includes(share.id)
                                ? 'bg-primary/10 border-primary/30 text-white'
                                : 'bg-surface-container-low border-white/5 hover:border-white/10 text-on-surface-variant',
                        ]"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                :class="[
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                    selectedShareIds.includes(share.id) ? 'bg-primary border-primary' : 'border-current',
                                ]"
                            >
                                <LucideCheckCircle v-if="selectedShareIds.includes(share.id)" class="w-3 h-3 text-on-primary" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">{{ share.name }}</p>
                                <p class="text-xs text-on-surface-variant/60">{{ share.type }}</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Preview -->
            <div v-if="selectedGroup && selectedShareIds.length > 0" class="bg-surface-container-low p-6 rounded-xl border border-white/5">
                <h4 class="text-sm font-bold text-white mb-4">{{ t('recipients.send.preview') }}</h4>
                <div class="space-y-2 text-sm text-on-surface-variant">
                    <p>
                        <span class="font-medium">{{ t('recipients.send.to') }}:</span>
                        {{ selectedGroup.name }} ({{ selectedGroup.recipientCount }} {{ t('recipients.send.recipients') }})
                    </p>
                    <p>
                        <span class="font-medium">{{ t('recipients.send.emails') }}:</span>
                        {{ previewCount }} {{ t('recipients.send.emailsTotal') }}
                    </p>
                    <p>
                        <span class="font-medium">{{ t('recipients.send.content') }}:</span>
                        {{ selectedShares.map((s) => s.name).join(', ') }}
                    </p>
                </div>
            </div>

            <!-- Send Result -->
            <div
                v-if="sendResult"
                class="p-6 rounded-xl border"
                :class="sendResult.failures.length > 0 ? 'bg-error/10 border-error/20' : 'bg-tertiary/10 border-tertiary/20'"
            >
                <div class="flex items-center gap-3 mb-4">
                    <LucideCheckCircle v-if="sendResult.failures.length === 0" class="w-6 h-6 text-tertiary" />
                    <LucideXCircle v-else class="w-6 h-6 text-error" />
                    <h4 class="text-sm font-bold text-white">
                        {{ t('recipients.send.result.title') }}
                    </h4>
                </div>
                <p class="text-sm text-on-surface-variant">
                    {{ t('recipients.send.result.sent', { count: sendResult.sent }) }}
                </p>
                <p v-if="sendResult.failures.length > 0" class="text-sm text-error mt-2">
                    {{ t('recipients.send.result.failures', { count: sendResult.failures.length }) }}
                </p>
            </div>

            <!-- Send Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
                <button
                    @click="handleSendEmail"
                    :disabled="!selectedGroupId || selectedShareIds.length === 0 || sending"
                    :class="[
                        'flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all focus-ring',
                        !selectedGroupId || selectedShareIds.length === 0 || sending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90',
                    ]"
                >
                    <LucideLoader2 v-if="sending" class="w-5 h-5 animate-spin" />
                    <LucideMail v-else class="w-5 h-5" />
                    {{ t('recipients.send.sendEmail') }}
                </button>
                <button
                    @click="handleSendSms"
                    :disabled="!selectedGroupId || selectedShareIds.length === 0 || localSending"
                    :class="[
                        'flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface-container-high text-white font-bold rounded-xl text-sm border border-white/10 transition-all focus-ring',
                        !selectedGroupId || selectedShareIds.length === 0 || localSending
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-surface-container-highest',
                    ]"
                >
                    <LucideMessageSquare class="w-5 h-5" />
                    {{ t('recipients.send.sendSms') }}
                </button>
            </div>
        </div>

        <!-- ===================================================================== -->
        <!-- CREATE/EDIT GROUP MODAL -->
        <!-- ===================================================================== -->
        <ClientOnly>
            <div v-if="showGroupModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeGroupModal">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <!-- Modal -->
                <div class="relative w-full max-w-lg bg-surface-container-low rounded-2xl border border-white/5 shadow-2xl">
                    <div class="p-6">
                        <h3 class="font-headline text-xl font-bold text-white mb-6">
                            {{ editingGroup ? t('recipients.groups.modal.editTitle') : t('recipients.groups.modal.createTitle') }}
                        </h3>

                        <form @submit.prevent="saveGroup" class="space-y-6">
                            <!-- Group Name -->
                            <div class="space-y-2">
                                <label for="group-name" class="block text-sm font-medium text-on-surface-variant">
                                    {{ t('recipients.groups.modal.nameLabel') }}
                                </label>
                                <input
                                    id="group-name"
                                    v-model="groupForm.name"
                                    type="text"
                                    :placeholder="t('recipients.groups.modal.namePlaceholder')"
                                    class="w-full px-4 py-3 bg-surface-container-highest rounded-xl border border-white/10 text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <!-- Recipients Selection -->
                            <div class="space-y-3">
                                <label class="block text-sm font-medium text-on-surface-variant">
                                    {{ t('recipients.groups.modal.membersLabel') }}
                                </label>
                                <div class="max-h-60 overflow-y-auto space-y-2 p-2 bg-surface-container-highest rounded-xl border border-white/5">
                                    <label
                                        v-for="recipient in recipients"
                                        :key="recipient.id"
                                        class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            :checked="groupForm.recipientIds.includes(recipient.id)"
                                            @change="toggleRecipient(recipient.id)"
                                            class="w-4 h-4 rounded border-white/20 bg-surface-container-high text-primary focus:ring-primary/50"
                                        />
                                        <div class="flex-1">
                                            <p class="text-sm font-medium text-white">{{ recipient.name }}</p>
                                            <p class="text-xs text-on-surface-variant">{{ recipient.email || recipient.phone }}</p>
                                        </div>
                                    </label>
                                </div>
                                <p class="text-xs text-on-surface-variant">
                                    {{ t('recipients.groups.modal.selectedCount', { count: groupForm.recipientIds.length }) }}
                                </p>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    @click="closeGroupModal"
                                    class="flex-1 px-6 py-3 bg-surface-container-high text-white font-bold rounded-xl text-sm border border-white/10 hover:bg-surface-container-highest transition-all focus-ring"
                                >
                                    {{ t('common.cancel') }}
                                </button>
                                <button
                                    type="submit"
                                    :disabled="groupFormLoading || !groupForm.name.trim()"
                                    :class="[
                                        'flex-1 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all focus-ring',
                                        groupFormLoading || !groupForm.name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90',
                                    ]"
                                >
                                    <LucideLoader2 v-if="groupFormLoading" class="w-5 h-5 animate-spin mx-auto" />
                                    <span v-else>{{ t('common.save') }}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ClientOnly>
    </div>
</template>
