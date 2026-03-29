<script setup lang="ts">
import { ref } from 'vue'
import ActivityFeedItem from './ActivityFeedItem.vue'

interface ActivityItem {
    id: string
    icon: any
    text: string
    highlight?: string
    time: string
    tag?: string
    tagVariant?: 'default' | 'primary' | 'tertiary'
}

interface ActivityFeedProps {
    title?: string
    items: ActivityItem[]
}

withDefaults(defineProps<ActivityFeedProps>(), {
    title: 'Recent Activity',
})
</script>

<template>
    <div class="activity-feed bg-surface-container-low rounded-3xl p-8 border border-white/5">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-headline font-bold text-white">{{ title }}</h3>
            <button class="text-xs text-primary hover:underline font-bold">View History</button>
        </div>
        <div class="space-y-6">
            <ActivityFeedItem
                v-for="item in items"
                :key="item.id"
                :icon="item.icon"
                :text="item.text"
                :highlight="item.highlight"
                :time="item.time"
                :tag="item.tag"
                :tag-variant="item.tagVariant"
            />
        </div>
    </div>
</template>
