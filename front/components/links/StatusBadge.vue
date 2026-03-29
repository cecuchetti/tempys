<script setup lang="ts">
import { cn } from '@/lib/utils'

type BadgeStatus = 'active' | 'expired' | 'one-time' | 'pending'

interface StatusBadgeProps {
    status: BadgeStatus
    label?: string
}

const props = defineProps<StatusBadgeProps>()

const statusConfig: Record<BadgeStatus, { classes: string; label: string }> = {
    active: {
        classes: 'bg-tertiary/10 text-tertiary border-tertiary/20',
        label: 'Active',
    },
    expired: {
        classes: 'bg-error/10 text-error border-error/20',
        label: 'Expired',
    },
    'one-time': {
        classes: 'bg-surface-container-high text-on-surface-variant border-white/5',
        label: 'One-time',
    },
    pending: {
        classes: 'bg-warning/10 text-warning border-warning/20',
        label: 'Pending',
    },
}
</script>

<template>
    <span
        :class="
            cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                statusConfig[status].classes
            )
        "
    >
        <span class="w-1.5 h-1.5 rounded-full bg-current" />
        {{ label || statusConfig[status].label }}
    </span>
</template>
