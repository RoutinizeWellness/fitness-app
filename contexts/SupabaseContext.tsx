'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase-unified'
import { checkHealth } from '@/lib/supabase-operations'
import { toast } from 'sonner'

// Definir el tipo para el contexto
type SupabaseContextType = {
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  checkConnection: () => Promise<boolean>
  clearError: () => void
}

// Crear el contexto
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Proveedor del contexto
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)

  // Función para verificar la conexión
  const checkConnection = async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await checkHealth()

      if (response.status === 'success') {
        setIsConnected(true)
        setError(null)
        return true
      } else {
        setIsConnected(false)
        setError(response.error || new Error('Error desconocido al verificar la conexión'))
        return false
      }
    } catch (err) {
      setIsConnected(false)
      setError(err instanceof Error ? err : new Error('Error desconocido al verificar la conexión'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Función para limpiar el error
  const clearError = () => {
    setError(null)
  }

  // Verificar la conexión al montar el componente
  useEffect(() => {
    const verifyConnection = async () => {
      const connected = await checkConnection()

      if (!connected && retryCount < 3) {
        // Programar un reintento
        const timeout = setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 5000 * (retryCount + 1)) // Aumentar el tiempo entre reintentos

        setRetryTimeout(timeout)
      } else if (!connected) {
        // Mostrar un toast de error después de varios intentos fallidos
        toast.error('No se pudo conectar con la base de datos. Algunas funciones pueden no estar disponibles.', {
          duration: 5000,
          action: {
            label: 'Reintentar',
            onClick: () => {
              setRetryCount(0)
              checkConnection()
            }
          }
        })
      }
    }

    verifyConnection()

    // Limpiar el timeout al desmontar
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [retryCount])

  // Valor del contexto
  const value: SupabaseContextType = {
    isConnected,
    isLoading,
    error,
    checkConnection,
    clearError
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook para usar el contexto
export function useSupabaseContext() {
  const context = useContext(SupabaseContext)

  if (context === undefined) {
    throw new Error('useSupabaseContext debe ser usado dentro de un SupabaseProvider')
  }

  return context
}
