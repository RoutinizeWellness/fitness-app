"use client"

import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

/**
 * Hook personalizado para manejar errores de forma consistente en toda la aplicación
 * @returns Una función para manejar errores que muestra un toast y registra el error en la consola
 */
export function useErrorHandler() {
  const { toast } = useToast()
  
  return useCallback((error: Error | unknown, message: string) => {
    console.error(message, error)
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
    
    return error
  }, [toast])
}

export default useErrorHandler
