<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface SettingsItem {
    icon: Component
    title: string
    description: string
    enabled?: boolean
    iconVariant?: 'primary' | 'tertiary'
}

interface SettingsGroupProps {
    title: string
    items: SettingsItem[]
}

const props = defineProps<SettingsGroupProps>()

const emit = defineEmits<{
    toggle: [index: number, enabled: boolean]
}>()
</script>

<template>
    <section class="settings-group space-y-6">
        <h3 class="text-lg font-headline font-bold text-white">{{ title }}</h3>

        <div class="space-y-4">
            <div
                v-for="(item, index) in items"
                :key="index"
                class="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-white/5 group hover:bg-surface-container-high transition-all"
            >
                <div class="flex items-center gap-4">
                    <!-- Icon -->
                    <div
                        :class="
                            cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center',
                                item.iconVariant === 'tertiary' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                            )
                        "
                    >
                        <component :is="item.icon" class="w-5 h-5" />
                    </div>
                    <!-- Content -->
                    <div>
                        <p class="text-sm font-bold text-white">{{ item.title }}</p>
                        <p class="text-xs text-on-surface-variant">{{ item.description }}</p>
                    </div>
                </div>

                <!-- Toggle -->
                <button
                    class="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors"
                    :class="item.enabled ? 'bg-primary' : 'bg-surface-container-highest group-hover:bg-primary/20'"
                    @click="emit('toggle', index, !item.enabled)"
                >
                    <div
                        class="w-4 h-4 rounded-full shadow-sm transition-all"
                        :class="item.enabled ? 'bg-white ml-auto' : 'bg-on-surface-variant group-hover:bg-primary'"
                    />
                </button>
            </div>
        </div>
    </section>
</template>
