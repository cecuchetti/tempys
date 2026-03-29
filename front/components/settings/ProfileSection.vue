<script setup lang="ts">
import { ref } from 'vue'

interface ProfileSectionProps {
    avatar?: string
    displayName: string
    email: string
    plan?: string
    userId?: string
}

const props = defineProps<ProfileSectionProps>()

const isHoveringAvatar = ref(false)
</script>

<template>
    <section class="profile-section space-y-8">
        <!-- Avatar Card -->
        <div class="flex items-center gap-8 p-8 bg-surface-container-low rounded-3xl border border-white/5 relative overflow-hidden">
            <!-- Decorative glow -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

            <!-- Avatar -->
            <div
                class="relative z-10 w-24 h-24 rounded-2xl overflow-hidden group cursor-pointer"
                @mouseenter="isHoveringAvatar = true"
                @mouseleave="isHoveringAvatar = false"
            >
                <img
                    :src="avatar || 'https://picsum.photos/200/200'"
                    :alt="displayName"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                </div>
            </div>

            <!-- Info -->
            <div class="relative z-10 flex-1">
                <h3 class="text-2xl font-headline font-bold text-white">{{ displayName }}</h3>
                <p class="text-on-surface-variant text-sm mb-4">{{ email }}</p>
                <div class="flex gap-3">
                    <span
                        v-if="plan"
                        class="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20"
                    >
                        {{ plan }}
                    </span>
                    <span
                        v-if="userId"
                        class="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/5"
                    >
                        ID: {{ userId }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block"> Public Name </label>
                <input
                    type="text"
                    :value="displayName"
                    class="w-full bg-surface-container-low border border-white/5 rounded-xl text-sm p-4 focus:ring-1 focus:ring-primary/50 text-white"
                />
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest block"> Timezone </label>
                <select
                    class="w-full bg-surface-container-low border border-white/5 rounded-xl text-sm p-4 focus:ring-1 focus:ring-primary/50 text-white appearance-none"
                >
                    <option>GMT-3 (Buenos Aires)</option>
                    <option>GMT+0 (London)</option>
                    <option>GMT-5 (New York)</option>
                </select>
            </div>
        </div>
    </section>
</template>
