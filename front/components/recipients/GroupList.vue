<script setup lang="ts">
/**
 * GroupList Component
 *
 * Displays a list of groups with edit and delete actions.
 */
import { LucideUsers, LucideEdit2, LucideTrash2, LucidePlus, LucideLoader2 } from 'lucide-vue-next'
import type { Group } from '@/types/recipients'

interface Props {
    groups: Group[]
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    groups: () => [],
    loading: false,
})

const emit = defineEmits<{
    create: []
    edit: [group: Group]
    delete: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
    <div class="group-list space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <p class="text-sm text-on-surface-variant">
                {{ t('recipients.groups.description') }}
            </p>
            <button
                @click="emit('create')"
                class="flex items-center gap-2 bg-primary text-on-primary font-bold px-5 py-3 rounded-xl text-sm transition-all hover:bg-primary/90 focus-ring"
            >
                <LucidePlus class="w-4 h-4" />
                {{ t('recipients.groups.create') }}
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <LucideLoader2 class="w-8 h-8 text-primary animate-spin" />
        </div>

        <!-- Empty State -->
        <div v-else-if="groups.length === 0" class="text-center py-12 text-on-surface-variant">
            <LucideUsers class="w-12 h-12 mx-auto mb-4 text-on-surface-variant/40" />
            <p class="text-sm">{{ t('recipients.groups.empty.title') }}</p>
            <p class="text-xs text-on-surface-variant/60 mt-1">
                {{ t('recipients.groups.empty.description') }}
            </p>
        </div>

        <!-- Groups -->
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
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        @click="emit('edit', group)"
                        class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus-ring"
                        :aria-label="t('recipients.groups.actions.edit')"
                    >
                        <LucideEdit2 class="w-4 h-4" />
                    </button>
                    <button
                        @click="emit('delete', group.id)"
                        class="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all focus-ring"
                        :aria-label="t('recipients.groups.actions.delete')"
                    >
                        <LucideTrash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
