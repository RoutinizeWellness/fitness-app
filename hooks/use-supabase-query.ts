"use client"

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { handleSupabaseError, SupabaseErrorType } from '@/lib/error-handlers/supabase-error-handler'

interface UseSupabaseQueryOptions<T> {
  defaultData?: T
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
  context?: string
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
}

interface UseSupabaseQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: any
  errorType: SupabaseErrorType | null
  execute: <R>(queryFn: () => Promise<R>, options?: Partial<UseSupabaseQueryOptions<R>>) => Promise<R | null>
  reset: () => void
  setData: (data: T | null) => void
  usingFallbackData: boolean
}

/**
 * Hook personalizado para ejecutar consultas a Supabase con manejo de errores
 */
export function useSupabaseQuery<T = any>(options: UseSupabaseQueryOptions<T> = {}): UseSupabaseQueryResult<T> {
  const {
    defaultData = null,
    loadingMessage,
    successMessage,
    errorMessage,
    showToast = true,
    context = 'Consulta',
    onSuccess,
    onError
  } = options

  const { toast } = useToast()
  const [data, setData] = useState<T | null>(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [errorType, setErrorType] = useState<SupabaseErrorType | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  /**
   * Ejecuta una función de consulta a Supabase con manejo de errores
   */
  const execute = useCallback(async <R>(
    queryFn: () => Promise<R>,
    queryOptions?: Partial<UseSupabaseQueryOptions<R>>
  ): Promise<R | null> => {
    const {
      loadingMessage: queryLoadingMessage,
      successMessage: querySuccessMessage,
      errorMessage: queryErrorMessage,
      showToast: queryShowToast = showToast,
      context: queryContext = context,
      onSuccess: queryOnSuccess,
      onError: queryOnError
    } = queryOptions || {}

    // Mostrar mensaje de carga
    if (queryShowToast && queryLoadingMessage) {
      toast({
        title: queryContext,
        description: queryLoadingMessage,
        variant: 'default',
      })
    }

    setIsLoading(true)
    setError(null)
    setErrorType(null)
    setUsingFallbackData(false)

    try {
      // Ejecutar la consulta
      const result = await queryFn()

      // Actualizar estado
      setData(result as unknown as T)
      setIsLoading(false)

      // Mostrar mensaje de éxito
      if (queryShowToast && querySuccessMessage) {
        toast({
          title: queryContext,
          description: querySuccessMessage,
          variant: 'default',
        })
      }

      // Llamar al callback de éxito
      if (queryOnSuccess) {
        queryOnSuccess(result)
      } else if (onSuccess) {
        onSuccess(result as unknown as T)
      }

      return result
    } catch (err) {
      // Manejar error
      const errorResult = handleSupabaseError(err, {
        showToast: queryShowToast,
        context: queryContext,
        logToConsole: true,
        rethrow: false,
        fallbackData: defaultData
      })

      // Actualizar estado
      setError(err)
      setErrorType(errorResult.type)
      setIsLoading(false)

      // Si hay datos de fallback, usarlos
      if (errorResult.fallbackData) {
        setData(errorResult.fallbackData as unknown as T)
        setUsingFallbackData(true)
      }

      // Mostrar mensaje de error personalizado
      if (queryShowToast && queryErrorMessage) {
        toast({
          title: queryContext,
          description: queryErrorMessage,
          variant: 'destructive',
        })
      }

      // Llamar al callback de error
      if (queryOnError) {
        queryOnError(err)
      } else if (onError) {
        onError(err)
      }

      return null
    }
  }, [toast, showToast, context, defaultData, onSuccess, onError])

  /**
   * Reinicia el estado del hook
   */
  const reset = useCallback(() => {
    setData(defaultData)
    setIsLoading(false)
    setError(null)
    setErrorType(null)
    setUsingFallbackData(false)
  }, [defaultData])

  return {
    data,
    isLoading,
    error,
    errorType,
    execute,
    reset,
    setData,
    usingFallbackData
  }
}

export default useSupabaseQuery
