<script setup lang="ts">
/**
 * RecipientForm Component
 *
 * A reusable form for collecting recipient information (name, email/phone).
 * Used in the public share page for recipients to register.
 */
import { LucideMail, LucidePhone, LucideLoader2, LucideCheckCircle } from 'lucide-vue-next'
import type { SubmitRecipientData, Recipient } from '@/types/recipients'

interface Props {
    shareId: string
    shareTitle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    success: [recipient: Recipient]
    'already-registered': [recipient: Recipient]
    error: [message: string]
}>()

const { t } = useI18n()

// Form state
const form = reactive({
    name: '',
    contactType: 'email' as 'email' | 'phone',
    email: '',
    phone: '',
})

// UI state
const formState = ref<'idle' | 'submitting' | 'success' | 'already' | 'error'>('idle')
const errorMessage = ref<string | null>(null)

// Validation
const nameError = ref<string | null>(null)
const contactError = ref<string | null>(null)

/**
 * Validate the form fields
 */
const validate = (): boolean => {
    let valid = true
    nameError.value = null
    contactError.value = null

    // Name validation
    if (!form.name || form.name.trim().length < 2) {
        nameError.value = t('recipients.form.errors.nameMinLength')
        valid = false
    }

    // Contact validation
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

/**
 * Handle form submission
 */
const handleSubmit = async () => {
    if (!validate()) return

    formState.value = 'submitting'
    errorMessage.value = null

    try {
        const { submitRecipient } = await import('@/services/api/recipients')

        const data: SubmitRecipientData = {
            shareId: props.shareId,
            name: form.name.trim(),
            email: form.contactType === 'email' ? form.email.trim() : undefined,
            phone: form.contactType === 'phone' ? form.phone.trim() : undefined,
        }

        const result = await submitRecipient(data)

        if (!result) {
            formState.value = 'error'
            errorMessage.value = t('recipients.form.errors.submitFailed')
            emit('error', errorMessage.value)
            return
        }

        // Check if already registered
        if ('alreadyRegistered' in result && result.alreadyRegistered) {
            formState.value = 'already'
            emit('already-registered', result.recipient)
        } else {
            formState.value = 'success'
            emit('success', result as Recipient)
        }
    } catch (e) {
        console.error('[RecipientForm] Submit error:', e)
        formState.value = 'error'
        errorMessage.value = t('recipients.form.errors.submitFailed')
        emit('error', errorMessage.value)
    }
}

/**
 * Reset the form to initial state
 */
const resetForm = () => {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.contactType = 'email'
    formState.value = 'idle'
    errorMessage.value = null
    nameError.value = null
    contactError.value = null
}

/**
 * Expose reset method for parent components
 */
defineExpose({
    resetForm,
})
</script>

<template>
    <div class="recipient-form">
        <!-- Success State -->
        <div v-if="formState === 'success'" class="text-center py-8">
            <div class="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LucideCheckCircle class="w-8 h-8 text-tertiary" />
            </div>
            <h3 class="font-headline text-xl font-bold text-white mb-2">
                {{ t('recipients.form.success.title') }}
            </h3>
            <p class="text-on-surface-variant text-sm">
                {{ t('recipients.form.success.description') }}
            </p>
        </div>

        <!-- Already Registered State -->
        <div v-else-if="formState === 'already'" class="text-center py-8">
            <div class="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LucideCheckCircle class="w-8 h-8 text-tertiary" />
            </div>
            <h3 class="font-headline text-xl font-bold text-white mb-2">
                {{ t('recipients.form.alreadyRegistered.title') }}
            </h3>
            <p class="text-on-surface-variant text-sm">
                {{ t('recipients.form.alreadyRegistered.description') }}
            </p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name Field -->
            <div class="space-y-2">
                <label for="recipient-name" class="block text-sm font-medium text-on-surface-variant">
                    {{ t('recipients.form.name') }} <span class="text-error">*</span>
                </label>
                <input
                    id="recipient-name"
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
                            form.contactType === 'email' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-white',
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
                            form.contactType === 'phone' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-white',
                        ]"
                    >
                        <LucidePhone class="w-4 h-4" />
                        {{ t('recipients.form.phone') }}
                    </button>
                </div>
            </div>

            <!-- Email Field -->
            <div v-if="form.contactType === 'email'" class="space-y-2">
                <label for="recipient-email" class="block text-sm font-medium text-on-surface-variant">
                    {{ t('recipients.form.email') }} <span class="text-error">*</span>
                </label>
                <input
                    id="recipient-email"
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
                <label for="recipient-phone" class="block text-sm font-medium text-on-surface-variant">
                    {{ t('recipients.form.phone') }} <span class="text-error">*</span>
                </label>
                <input
                    id="recipient-phone"
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
            <div v-if="errorMessage" class="p-4 bg-error/10 rounded-xl border border-error/20">
                <p class="text-sm text-error">{{ errorMessage }}</p>
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

            <!-- Privacy Note -->
            <p class="text-xs text-on-surface-variant/60 text-center">
                {{ t('recipients.form.privacyNote') }}
            </p>
        </form>
    </div>
</template>
