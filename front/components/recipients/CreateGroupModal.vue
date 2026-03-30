<script setup lang="ts">
/**
 * CreateGroupModal Component
 *
 * Modal for creating or editing a group.
 */
import { LucideLoader2, LucideCheckCircle } from 'lucide-vue-next'
import type { Group, Recipient } from '@/types/recipients'

interface Props {
    show: boolean
    group?: Group | null
    recipients: Recipient[]
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    group: null,
    recipients: () => [],
    loading: false,
})

const emit = defineEmits<{
    'update:show': [value: boolean]
    save: [data: { name: string; recipientIds: string[] }]
}>()

const { t } = useI18n()

// Form state
const form = reactive({
    name: '',
    recipientIds: [] as string[],
})

// Watch for group changes
watch(
    () => props.group,
    (newGroup) => {
        if (newGroup) {
            form.name = newGroup.name
            form.recipientIds = [...newGroup.recipientIds]
        } else {
            form.name = ''
            form.recipientIds = []
        }
    },
    { immediate: true }
)

// Close modal
const close = () => {
    emit('update:show', false)
}

// Toggle recipient selection
const toggleRecipient = (recipientId: string) => {
    const index = form.recipientIds.indexOf(recipientId)
    if (index === -1) {
        form.recipientIds.push(recipientId)
    } else {
        form.recipientIds.splice(index, 1)
    }
}

// Save
const save = () => {
    if (!form.name.trim()) return
    emit('save', {
        name: form.name.trim(),
        recipientIds: form.recipientIds,
    })
}

// Handle backdrop click
const handleBackdropClick = (e: Event) => {
    if (e.target === e.currentTarget) {
        close()
    }
}
</script>

<template>
    <ClientOnly>
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="handleBackdropClick">
                    <!-- Backdrop -->
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <!-- Modal -->
                    <div class="relative w-full max-w-lg bg-surface-container-low rounded-2xl border border-white/5 shadow-2xl">
                        <div class="p-6">
                            <!-- Header -->
                            <h3 class="font-headline text-xl font-bold text-white mb-6">
                                {{ group ? t('recipients.groups.modal.editTitle') : t('recipients.groups.modal.createTitle') }}
                            </h3>

                            <form @submit.prevent="save" class="space-y-6">
                                <!-- Group Name -->
                                <div class="space-y-2">
                                    <label for="group-name" class="block text-sm font-medium text-on-surface-variant">
                                        {{ t('recipients.groups.modal.nameLabel') }}
                                    </label>
                                    <input
                                        id="group-name"
                                        v-model="form.name"
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
                                                :checked="form.recipientIds.includes(recipient.id)"
                                                @change="toggleRecipient(recipient.id)"
                                                class="w-4 h-4 rounded border-white/20 bg-surface-container-high text-primary focus:ring-primary/50"
                                            />
                                            <div class="flex-1">
                                                <p class="text-sm font-medium text-white">{{ recipient.name }}</p>
                                                <p class="text-xs text-on-surface-variant">{{ recipient.email || recipient.phone }}</p>
                                            </div>
                                        </label>
                                        <p v-if="recipients.length === 0" class="text-sm text-on-surface-variant text-center py-4">
                                            {{ t('recipients.groups.modal.noRecipients') }}
                                        </p>
                                    </div>
                                    <p class="text-xs text-on-surface-variant">
                                        {{ t('recipients.groups.modal.selectedCount', { count: form.recipientIds.length }) }}
                                    </p>
                                </div>

                                <!-- Actions -->
                                <div class="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        @click="close"
                                        class="flex-1 px-6 py-3 bg-surface-container-high text-white font-bold rounded-xl text-sm border border-white/10 hover:bg-surface-container-highest transition-all focus-ring"
                                    >
                                        {{ t('common.cancel') }}
                                    </button>
                                    <button
                                        type="submit"
                                        :disabled="loading || !form.name.trim()"
                                        :class="[
                                            'flex-1 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all focus-ring',
                                            loading || !form.name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90',
                                        ]"
                                    >
                                        <LucideLoader2 v-if="loading" class="w-5 h-5 animate-spin mx-auto" />
                                        <span v-else>{{ t('common.save') }}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.95);
    opacity: 0;
}
</style>
