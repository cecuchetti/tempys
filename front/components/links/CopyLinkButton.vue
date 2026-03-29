<script setup lang="ts">
import { ref } from 'vue'
import { LucideCopy, LucideCheck } from 'lucide-vue-next'

interface CopyLinkButtonProps {
    link: string
}

const props = defineProps<CopyLinkButtonProps>()

const copied = ref(false)

const copyToClipboard = async () => {
    await navigator.clipboard.writeText(props.link)
    copied.value = true
    setTimeout(() => {
        copied.value = false
    }, 2000)
}
</script>

<template>
    <button class="copy-link flex items-center gap-2 text-primary font-mono text-xs font-bold group transition-all" @click="copyToClipboard">
        <span class="link-text">{{ link }}</span>
        <component :is="copied ? LucideCheck : LucideCopy" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
    </button>
</template>
