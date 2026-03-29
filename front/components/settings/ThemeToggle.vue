<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/utils'
import { LucideSun, LucideMoon, LucideLaptop } from 'lucide-vue-next'

type Theme = 'light' | 'dark' | 'system'

const selectedTheme = defineModel<Theme>({ default: 'dark' })

const themes: Array<{ id: Theme; label: string; icon: typeof LucideSun }> = [
    { id: 'light', label: 'Light', icon: LucideSun },
    { id: 'dark', label: 'Dark', icon: LucideMoon },
    { id: 'system', label: 'System', icon: LucideLaptop },
]
</script>

<template>
    <div class="theme-toggle grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
            v-for="theme in themes"
            :key="theme.id"
            @click="selectedTheme = theme.id"
            :class="
                cn(
                    'p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 group',
                    selectedTheme === theme.id
                        ? 'bg-surface-container-high border-primary/50 shadow-lg shadow-primary/5'
                        : 'bg-surface-container-low border-white/5 hover:border-white/10'
                )
            "
        >
            <component
                :is="theme.icon"
                :class="cn('w-6 h-6', selectedTheme === theme.id ? 'text-primary' : 'text-on-surface-variant group-hover:text-white')"
            />
            <span
                :class="
                    cn(
                        'text-xs font-bold uppercase tracking-widest',
                        selectedTheme === theme.id ? 'text-white' : 'text-on-surface-variant group-hover:text-white'
                    )
                "
            >
                {{ theme.label }}
            </span>
        </button>
    </div>
</template>
