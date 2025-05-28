'use client'

import { useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'

/**
 * Componente que maneja la recuperación de sesión y el refresco forzado de la página
 * Este componente debe incluirse en el layout principal de la aplicación
 */
export function SessionRecoveryHandler() {
  useEffect(() => {
    // Verificar si hay un indicador de refresco forzado
    const shouldForceRefresh = localStorage.getItem('force_refresh_after_error') === 'true'
    
    if (shouldForceRefresh) {
      // Verificar si el refresco forzado es reciente (menos de 5 minutos)
      const refreshTimestamp = parseInt(localStorage.getItem('force_refresh_timestamp') || '0', 10)
      const now = Date.now()
      const fiveMinutesInMs = 5 * 60 * 1000
      
      if (now - refreshTimestamp < fiveMinutesInMs) {
        console.log('Detectado indicador de refresco forzado reciente')
        
        // Mostrar toast al usuario
        toast({
          title: 'Recuperación de sesión',
          description: 'Se detectó un problema con tu sesión. ¿Quieres refrescar la página para intentar solucionarlo?',
          action: (
            <ToastAction altText="Refrescar" onClick={() => window.location.reload()}>
              Refrescar
            </ToastAction>
          )
        })
      }
      
      // Limpiar el indicador de refresco forzado
      localStorage.removeItem('force_refresh_after_error')
    }
    
    // Verificar si hay errores de sesión recientes
    const sessionErrorCount = parseInt(localStorage.getItem('session_error_count') || '0', 10)
    
    if (sessionErrorCount > 3) {
      // Si hay más de 3 errores de sesión recientes, mostrar un mensaje más detallado
      console.log('Detectados múltiples errores de sesión recientes')
      
      toast({
        title: 'Problemas de sesión persistentes',
        description: 'Estamos detectando problemas persistentes con tu sesión. Intenta cerrar sesión y volver a iniciarla, o limpiar las cookies del navegador.',
        variant: 'destructive',
        duration: 10000
      })
      
      // Resetear el contador después de mostrar el mensaje
      localStorage.setItem('session_error_count', '0')
    }
    
    // Función para manejar errores no capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      // Verificar si el error está relacionado con la sesión
      if (
        event.error && 
        (
          (event.error.message && event.error.message.includes('session')) ||
          (event.error.stack && event.error.stack.includes('auth'))
        )
      ) {
        console.error('Error no capturado relacionado con la sesión:', event.error)
        
        // Incrementar el contador de errores de sesión
        const currentCount = parseInt(localStorage.getItem('session_error_count') || '0', 10)
        localStorage.setItem('session_error_count', (currentCount + 1).toString())
        
        // Si es el primer error, mostrar un toast
        if (currentCount === 0) {
          toast({
            title: 'Error de sesión',
            description: 'Se detectó un problema con tu sesión. Intenta refrescar la página.',
            action: (
              <ToastAction altText="Refrescar" onClick={() => window.location.reload()}>
                Refrescar
              </ToastAction>
            )
          })
        }
      }
    }
    
    // Registrar el manejador de errores
    window.addEventListener('error', handleUnhandledError)
    
    // Limpiar el manejador al desmontar el componente
    return () => {
      window.removeEventListener('error', handleUnhandledError)
    }
  }, [])
  
  return null
}
