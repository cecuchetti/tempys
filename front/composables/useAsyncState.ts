/**
 * useAsyncState Composable
 *
 * A flexible composable for managing async data fetching with loading, error, and empty states.
 * Provides a consistent pattern for handling all UI states across the application.
 *
 * @example
 * const { loading, error, data, refetch } = useAsyncState(() => fetchLinks())
 */

import { ref, type Ref, type ComputedRef, computed } from 'vue'

export interface AsyncStateOptions<T> {
    initialData?: T | null
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}

export interface AsyncStateReturn<T> {
    data: ComputedRef<T | null>
    loading: ComputedRef<boolean>
    error: ComputedRef<Error | null>
    isEmpty: ComputedRef<boolean>
    execute: () => Promise<void>
    refetch: () => Promise<void>
    reset: () => void
}

/**
 * Composable for managing async state with loading, error, and empty states
 */
export function useAsyncState<T>(fetcher: () => Promise<T>, options: AsyncStateOptions<T> = {}): AsyncStateReturn<T> {
    const { initialData = null, immediate = true, onSuccess, onError } = options

    const dataRef = ref<T | null>(initialData) as Ref<T | null>
    const loadingRef = ref(false)
    const errorRef = ref<Error | null>(null)
    const hasLoadedOnce = ref(false)

    const execute = async () => {
        loadingRef.value = true
        errorRef.value = null

        try {
            const result = await fetcher()
            dataRef.value = result
            hasLoadedOnce.value = true
            onSuccess?.(result)
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e))
            errorRef.value = error
            onError?.(error)
        } finally {
            loadingRef.value = false
        }
    }

    const reset = () => {
        dataRef.value = initialData
        loadingRef.value = false
        errorRef.value = null
        hasLoadedOnce.value = false
    }

    // Execute immediately if requested
    if (immediate) {
        execute()
    }

    return {
        data: computed(() => dataRef.value),
        loading: computed(() => loadingRef.value),
        error: computed(() => errorRef.value),
        isEmpty: computed(
            () =>
                hasLoadedOnce.value &&
                !loadingRef.value &&
                !errorRef.value &&
                (dataRef.value === null || (Array.isArray(dataRef.value) && dataRef.value.length === 0))
        ),
        execute,
        refetch: execute,
        reset,
    }
}

/**
 * Simulated async state for mock data with artificial delay
 * Useful for testing loading states in development
 */
export function useMockAsyncState<T>(mockFetcher: () => T, delay: number = 500, options: AsyncStateOptions<T> = {}): AsyncStateReturn<T> {
    return useAsyncState(
        () =>
            new Promise<T>((resolve) => {
                setTimeout(() => {
                    resolve(mockFetcher())
                }, delay)
            }),
        options
    )
}

/**
 * Composable that provides pre-configured state management for the links page
 */
export function useLinksPageState() {
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const hasLoadedOnce = ref(false)

    const simulateInitialLoad = (delay: number = 800) => {
        loading.value = true
        error.value = null

        setTimeout(() => {
            loading.value = false
            hasLoadedOnce.value = true
        }, delay)
    }

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        hasLoadedOnce: computed(() => hasLoadedOnce.value),
        simulateInitialLoad,
        setError: (err: Error | null) => {
            error.value = err
            loading.value = false
        },
        clearError: () => {
            error.value = null
        },
    }
}

/**
 * Composable that provides pre-configured state management for the analytics dashboard
 */
export function useDashboardPageState() {
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const hasLoadedOnce = ref(false)

    const simulateInitialLoad = (delay: number = 1000) => {
        loading.value = true
        error.value = null

        setTimeout(() => {
            loading.value = false
            hasLoadedOnce.value = true
        }, delay)
    }

    return {
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        hasLoadedOnce: computed(() => hasLoadedOnce.value),
        simulateInitialLoad,
        setError: (err: Error | null) => {
            error.value = err
            loading.value = false
        },
        clearError: () => {
            error.value = null
        },
    }
}
