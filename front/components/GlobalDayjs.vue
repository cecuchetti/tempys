<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)

const { locale } = useI18n()

watchEffect(() => {
    dayjs.locale(locale.value.toLowerCase())
})
</script>

<template></template>
