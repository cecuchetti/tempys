<script setup lang="ts">
// Redirect root to upload page with dashboard layout
definePageMeta({
    layout: 'dashboard',
})

const router = useRouter()
onMounted(() => {
    router.replace('/upload')
})
</script>

<template>
    <div class="w-full h-full flex items-center justify-center">
        <!-- Loading state while redirecting -->
        <div class="text-on-surface-variant">Redirecting...</div>
    </div>
</template>
