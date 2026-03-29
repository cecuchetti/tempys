<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Tab {
    id: string
    label: string
    count?: number
}

interface FilterTabsProps {
    tabs: Tab[]
    modelValue?: string
}

const props = defineProps<FilterTabsProps>()
const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const activeTab = defineModel<string>({ default: '' })

const selectTab = (id: string) => {
    activeTab.value = id
    emit('update:modelValue', id)
}
</script>

<template>
    <div class="filter-tabs flex items-center gap-2 p-1.5 bg-surface-container-lowest rounded-xl border border-white/5">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="selectTab(tab.id)"
            :class="
                cn(
                    'px-5 py-2 rounded-lg text-[0.6875rem] font-bold uppercase tracking-wider transition-all',
                    activeTab === tab.id || modelValue === tab.id
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/10'
                        : 'text-on-surface-variant hover:text-white'
                )
            "
        >
            {{ tab.label }}
        </button>
    </div>
</template>
