<script setup lang="ts">
import { ref } from 'vue'
import { LucideLock, LucideTimer } from 'lucide-vue-next'

interface SettingsPanelProps {
    pickupCode?: string
}

const props = withDefaults(defineProps<SettingsPanelProps>(), {
    pickupCode: '',
})

const emit = defineEmits<{
    update: [
        settings: {
            password?: string
            expiration: string
            notifyOnPickup: boolean
        },
    ]
}>()

const password = ref('')
const expiration = ref('24 Hours')
const notifyOnPickup = ref(false)

const expirationOptions = ['1 Hour', '24 Hours', '7 Days', 'After 1 Download']
</script>

<template>
    <div class="settings-panel glass-panel p-8 rounded-xl space-y-8 border border-white/5">
        <!-- Header -->
        <h4 class="font-headline text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">Vault Settings</h4>

        <div class="space-y-6">
            <!-- Password Field -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block"> Password Protect </label>
                <div class="relative">
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Optional"
                        class="w-full bg-surface-container-lowest border-none rounded-lg text-sm p-3 focus:ring-1 focus:ring-primary/50 placeholder:text-outline-variant"
                    />
                    <LucideLock class="absolute right-3 top-2.5 text-outline-variant w-4 h-4" />
                </div>
            </div>

            <!-- Expiration -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block"> Expiration </label>
                <select
                    v-model="expiration"
                    class="w-full bg-surface-container-lowest border-none rounded-lg text-sm p-3 focus:ring-1 focus:ring-primary/50 appearance-none text-on-surface-variant"
                >
                    <option v-for="option in expirationOptions" :key="option">
                        {{ option }}
                    </option>
                </select>
            </div>

            <!-- Pick-up Code -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block flex justify-between">
                    Pick-up Code
                    <span class="text-tertiary">Active</span>
                </label>
                <div class="bg-surface-container-lowest p-3 rounded-lg text-center font-mono text-primary tracking-widest text-lg font-bold">
                    {{ pickupCode || 'TX-882-K' }}
                </div>
            </div>
        </div>

        <!-- Notification Toggle -->
        <div class="pt-4">
            <label class="flex items-center gap-3 cursor-pointer group">
                <div
                    class="w-5 h-5 rounded border border-white/10 flex items-center justify-center group-hover:border-primary transition-colors"
                    :class="{ 'bg-primary border-primary': notifyOnPickup }"
                    @click="notifyOnPickup = !notifyOnPickup"
                >
                    <div v-if="notifyOnPickup" class="w-2 h-2 bg-on-primary rounded-sm" />
                </div>
                <span class="text-xs text-on-surface-variant">Notify me on pick-up</span>
            </label>
        </div>
    </div>
</template>
