<script setup lang="ts">
/**
 * SendPanel Component
 *
 * UI for selecting a group and shares to send, with preview and send actions.
 */
import { LucideCheckCircle, LucideXCircle, LucideLoader2, LucideMail, LucideMessageSquare } from 'lucide-vue-next'
import type { Group, ShareLink, SendResult } from '@/types/recipients'

interface Props {
    groups: Group[]
    shares: ShareLink[]
    sending?: boolean
    sendResult: SendResult | null
}

const props = withDefaults(defineProps<Props>(), {
    groups: () => [],
    shares: () => [],
    sending: false,
    sendResult: null,
})

const emit = defineEmits<{
    sendEmail: [groupId: string, shareIds: string[]]
    sendSms: [groupId: string, shareIds: string[]]
}>()

const { t } = useI18n()

// Selection state
const selectedGroupId = ref<string>('')
const selectedShareIds = ref<string[]>([])

// Get selected group
const selectedGroup = computed(() => {
    return props.groups.find((g) => g.id === selectedGroupId.value)
})

// Get selected shares
const selectedShares = computed(() => {
    return props.shares.filter((s) => selectedShareIds.value.includes(s.id))
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

// Can send
const canSend = computed(() => {
    return selectedGroupId.value && selectedShareIds.value.length > 0 && !props.sending
})

// Send handlers
const handleSendEmail = () => {
    if (!canSend.value) return
    emit('sendEmail', selectedGroupId.value, selectedShareIds.value)
}

const handleSendSms = () => {
    if (!canSend.value) return
    emit('sendSms', selectedGroupId.value, selectedShareIds.value)
}
</script>

<template>
    <div class="send-panel space-y-8">
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
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
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
            <p v-if="shares.length === 0" class="text-sm text-on-surface-variant text-center py-4">
                {{ t('recipients.send.noShares') }}
            </p>
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
                :disabled="!canSend"
                :class="[
                    'flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all focus-ring',
                    !canSend ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90',
                ]"
            >
                <LucideLoader2 v-if="sending" class="w-5 h-5 animate-spin" />
                <LucideMail v-else class="w-5 h-5" />
                {{ t('recipients.send.sendEmail') }}
            </button>
            <button
                @click="handleSendSms"
                :disabled="!canSend"
                :class="[
                    'flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-surface-container-high text-white font-bold rounded-xl text-sm border border-white/10 transition-all focus-ring',
                    !canSend ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-highest',
                ]"
            >
                <LucideMessageSquare class="w-5 h-5" />
                {{ t('recipients.send.sendSms') }}
            </button>
        </div>
    </div>
</template>
