import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { checkSupabaseConnection } from '@/lib/supabase-client'

/**
 * Hook para manejar operaciones de Supabase con estados de carga y error
 * @returns Funciones y estados para manejar operaciones de Supabase
 */
export function useSupabaseOperation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  /**
   * Ejecuta una operación de Supabase con manejo de estados
   * @param operation - Función que realiza la operación de Supabase
   * @param successMessage - Mensaje a mostrar en caso de éxito
   * @param errorMessage - Mensaje a mostrar en caso de error
   * @returns Resultado de la operación
   */
  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage: string = 'Error en la operación'
  ): Promise<{ data: T | null; error: Error | null }> => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar la conexión a Supabase antes de ejecutar la operación
      const { success: isConnected } = await checkSupabaseConnection()

      if (!isConnected) {
        const connectionError = new Error(`No se pudo establecer conexión con Supabase. Verifica tu conexión a internet.`)
        setError(connectionError)

        toast({
          title: 'Error de conexión',
          description: connectionError.message,
          variant: 'destructive',
        })

        return { data: null, error: connectionError }
      }

      const result = await operation()

      if (successMessage) {
        toast({
          title: 'Éxito',
          description: successMessage,
        })
      }

      return { data: result, error: null }
    } catch (err) {
      console.error('Error en operación de Supabase:', err)

      // Manejar errores vacíos
      if (err && typeof err === 'object' && Object.keys(err).length === 0) {
        console.error('Error vacío detectado. Esto podría indicar un problema con la tabla en la base de datos.')

        // Crear un error más descriptivo
        const emptyError = new Error(
          `${errorMessage}: La operación falló porque la tabla podría no existir o no tener la estructura esperada. ` +
          `Verifica que las tablas necesarias estén creadas en Supabase.`
        )

        setError(emptyError)

        toast({
          title: 'Error de estructura',
          description: emptyError.message,
          variant: 'destructive',
        })

        return { data: null, error: emptyError }
      }

      const errorObj = err instanceof Error ? err : new Error(errorMessage)
      setError(errorObj)

      toast({
        title: 'Error',
        description: errorObj.message || errorMessage,
        variant: 'destructive',
      })

      return { data: null, error: errorObj }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isLoading,
    error,
    execute,
    setError,
    setIsLoading,
  }
}
