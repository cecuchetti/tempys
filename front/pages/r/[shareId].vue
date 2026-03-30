<script setup lang="ts">
import { LucideMail, LucidePhone, LucideCheckCircle, LucideAlertCircle, LucideLoader2, LucideUser } from 'lucide-vue-next'

definePageMeta({
    layout: 'public',
})

const route = useRoute()
const { t } = useI18n()

const shareId = computed(() => route.params.shareId as string)

const loading = ref(true)
const error = ref<string | null>(null)
const submitted = ref(false)
const alreadyRegistered = ref(false)

const formState = ref<'idle' | 'submitting' | 'success' | 'already' | 'error'>('idle')
const formError = ref<string | null>(null)

const form = reactive({
    name: '',
    contactType: 'email' as 'email' | 'phone',
    email: '',
    phone: '',
})

const nameError = ref<string | null>(null)
const contactError = ref<string | null>(null)

const validateForm = (): boolean => {
    let valid = true
    nameError.value = null
    contactError.value = null

    if (!form.name || form.name.trim().length < 2) {
        nameError.value = t('recipients.form.errors.nameMinLength')
        valid = false
    }

    if (form.contactType === 'email') {
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            contactError.value = t('recipients.form.errors.invalidEmail')
            valid = false
        }
    } else {
        if (!form.phone || !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
            contactError.value = t('recipients.form.errors.invalidPhone')
            valid = false
        }
    }

    return valid
}

const fetchShareInfo = async () => {
    loading.value = true
    error.value = null

    try {
        const { getPublicSharePage } = await import('@/services/api/recipients')
        const info = await getPublicSharePage(shareId.value)

        if (info) {
            loading.value = false
        } else {
            error.value = t('recipients.public.notFound')
            loading.value = false
        }
    } catch (e) {
        console.error('[r/shareId] Failed to fetch share info:', e)
        error.value = t('recipients.public.notFound')
        loading.value = false
    }
}

const handleSubmit = async () => {
    if (!validateForm()) return

    formState.value = 'submitting'
    formError.value = null

    try {
        const { submitRecipient } = await import('@/services/api/recipients')
        const result = await submitRecipient({
            shareId: shareId.value,
            name: form.name.trim(),
            email: form.contactType === 'email' ? form.email.trim() : undefined,
            phone: form.contactType === 'phone' ? form.phone.trim() : undefined,
        })

        if (!result) {
            formState.value = 'error'
            formError.value = t('recipients.form.errors.submitFailed')
            return
        }

        if ('alreadyRegistered' in result && result.alreadyRegistered) {
            formState.value = 'already'
            alreadyRegistered.value = true
        } else {
            formState.value = 'success'
            submitted.value = true
        }
    } catch (e) {
        console.error('[r/shareId] Failed to submit:', e)
        formState.value = 'error'
        formError.value = t('recipients.form.errors.submitFailed')
    }
}

onMounted(() => {
    fetchShareInfo()
})

useHead({
    title: t('recipients.public.pageTitle'),
})
</script>

<template>
    <div class="space-y-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <LucideLoader2 class="w-12 h-12 text-primary animate-spin mb-4" />
            <p class="text-on-surface-variant">{{ t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mb-6">
                <LucideAlertCircle class="w-10 h-10 text-error" />
            </div>
            <h2 class="font-headline text-2xl font-bold text-white mb-2">{{ error }}</h2>
            <p class="text-on-surface-variant mb-8">{{ t('recipients.public.notFoundDesc') }}</p>
            <NuxtLink
                to="/"
                class="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors focus-ring"
            >
                {{ t('btn.backToHome') }}
            </NuxtLink>
        </div>

        <!-- Success State -->
        <div v-else-if="submitted" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6">
                <LucideCheckCircle class="w-10 h-10 text-tertiary" />
            </div>
            <h2 class="font-headline text-2xl font-bold text-white mb-2">{{ t('recipients.form.success.title') }}</h2>
            <p class="text-on-surface-variant max-w-sm">{{ t('recipients.form.success.description') }}</p>
        </div>

        <!-- Already Registered State -->
        <div v-else-if="alreadyRegistered" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6">
                <LucideCheckCircle class="w-10 h-10 text-tertiary" />
            </div>
            <h2 class="font-headline text-2xl font-bold text-white mb-2">{{ t('recipients.form.alreadyRegistered.title') }}</h2>
            <p class="text-on-surface-variant max-w-sm">{{ t('recipients.form.alreadyRegistered.description') }}</p>
        </div>

        <!-- Registration Form -->
        <template v-else>
            <!-- Header with Icon -->
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <LucideUser class="w-8 h-8 text-primary" />
                </div>
                <h2 class="font-headline text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    {{ t('recipients.public.registerTitle') }}
                </h2>
                <p class="text-on-surface-variant max-w-md mx-auto">
                    {{ t('recipients.public.registerSubtitle') }}
                </p>
            </div>

            <!-- Form Card -->
            <div class="bg-surface-container-low rounded-2xl border border-white/5 p-8 shadow-2xl">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Name Field -->
                    <div class="space-y-2">
                        <label for="name" class="block text-sm font-medium text-on-surface-variant">
                            {{ t('recipients.form.name') }} <span class="text-error">*</span>
                        </label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            :placeholder="t('recipients.form.namePlaceholder')"
                            :class="[
                                'w-full px-4 py-3 bg-surface-container-highest rounded-xl border text-white placeholder:text-on-surface-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
                                nameError ? 'border-error' : 'border-white/10 focus:border-primary',
                            ]"
                            :aria-invalid="!!nameError"
                            :aria-describedby="nameError ? 'name-error' : undefined"
                        />
                        <p v-if="nameError" id="name-error" class="text-xs text-error mt-1">
                            {{ nameError }}
                        </p>
                    </div>

                    <!-- Contact Type Toggle -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-on-surface-variant">
                            {{ t('recipients.form.contactType') }} <span class="text-error">*</span>
                        </label>
                        <div class="flex gap-2 p-1 bg-surface-container-high rounded-xl border border-white/5">
                            <button
                                type="button"
                                @click="form.contactType = 'email'"
                                :class="[
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                                    form.contactType === 'email'
                                        ? 'bg-primary text-on-primary shadow-lg'
                                        : 'text-on-surface-variant hover:text-white',
                                ]"
                            >
                                <LucideMail class="w-4 h-4" />
                                {{ t('recipients.form.email') }}
                            </button>
                            <button
                                type="button"
                                @click="form.contactType = 'phone'"
                                :class="[
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                                    form.contactType === 'phone'
                                        ? 'bg-primary text-on-primary shadow-lg'
                                        : 'text-on-surface-variant hover:text-white',
                                ]"
                            >
                                <LucidePhone class="w-4 h-4" />
                                {{ t('recipients.form.phone') }}
                            </button>
                        </div>
                    </div>

                    <!-- Email Field -->
                    <div v-if="form.contactType === 'email'" class="space-y-2">
                        <label for="email" class="block text-sm font-medium text-on-surface-variant">
                            {{ t('recipients.form.email') }} <span class="text-error">*</span>
                        </label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            :placeholder="t('recipients.form.emailPlaceholder')"
                            :class="[
                                'w-full px-4 py-3 bg-surface-container-highest rounded-xl border text-white placeholder:text-on-surface-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
                                contactError ? 'border-error' : 'border-white/10 focus:border-primary',
                            ]"
                            :aria-invalid="!!contactError"
                            :aria-describedby="contactError ? 'contact-error' : undefined"
                        />
                        <p v-if="contactError" id="contact-error" class="text-xs text-error mt-1">
                            {{ contactError }}
                        </p>
                    </div>

                    <!-- Phone Field -->
                    <div v-else class="space-y-2">
                        <label for="phone" class="block text-sm font-medium text-on-surface-variant">
                            {{ t('recipients.form.phone') }} <span class="text-error">*</span>
                        </label>
                        <input
                            id="phone"
                            v-model="form.phone"
                            type="tel"
                            :placeholder="t('recipients.form.phonePlaceholder')"
                            :class="[
                                'w-full px-4 py-3 bg-surface-container-highest rounded-xl border text-white placeholder:text-on-surface-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
                                contactError ? 'border-error' : 'border-white/10 focus:border-primary',
                            ]"
                            :aria-invalid="!!contactError"
                            :aria-describedby="contactError ? 'contact-error' : undefined"
                        />
                        <p v-if="contactError" id="contact-error" class="text-xs text-error mt-1">
                            {{ contactError }}
                        </p>
                    </div>

                    <!-- Error Message -->
                    <div v-if="formError" class="p-4 bg-error/10 rounded-xl border border-error/20">
                        <p class="text-sm text-error">{{ formError }}</p>
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="formState === 'submitting'"
                        :class="[
                            'w-full px-6 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
                            formState === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-[1.02] active:scale-95',
                        ]"
                    >
                        <span v-if="formState === 'submitting'" class="flex items-center justify-center gap-2">
                            <LucideLoader2 class="w-5 h-5 animate-spin" />
                            {{ t('common.loading') }}
                        </span>
                        <span v-else>
                            {{ t('recipients.form.submit') }}
                        </span>
                    </button>
                </form>

                <!-- Privacy Note -->
                <p class="mt-6 text-xs text-on-surface-variant/60 text-center">
                    {{ t('recipients.form.privacyNote') }}
                </p>
            </div>
        </template>
    </div>
</template>
