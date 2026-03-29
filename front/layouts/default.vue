<script lang="ts" setup>
import { Toaster } from 'vue-sonner'

const { locale } = useI18n()
await useSeo({ locale: locale.value })
const appConfig = useMyAppConfig()
const bgUrl = computed(() => appConfig.value?.site_bg_url)

// Track mounted state for client-only rendering
const mounted = ref(false)
onMounted(() => {
    mounted.value = true
})
</script>
<template>
    <div class="h-screen w-screen">
        <GlobalDrawer />
        <!-- GlobalDayjs has empty template - wrap in ClientOnly to avoid SSR mismatch -->
        <ClientOnly>
            <GlobalDayjs />
        </ClientOnly>
        <!-- Toaster uses teleports which don't hydrate well with SSR -->
        <ClientOnly>
            <Toaster position="top-center" richColors closeButton />
        </ClientOnly>
        <!-- Background image URL comes from async fetch - render client-only to avoid hydration mismatch -->
        <ClientOnly>
            <img class="w-full h-full object-cover absolute inset-0 -z-[1] bg-gradient-to-bl from-primary/40 to-primary" :src="bgUrl" />
        </ClientOnly>
        <!-- Fallback background while client-side image loads -->
        <div v-if="!mounted" class="w-full h-full absolute inset-0 -z-[2] bg-gradient-to-bl from-primary/40 to-primary" />
        <div class="h-full w-full flex flex-col items-center lg:p-10 p-5 overflow-y-auto">
            <Navbar />
            <slot />
        </div>
    </div>
</template>
