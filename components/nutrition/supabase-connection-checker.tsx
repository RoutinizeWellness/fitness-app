"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface SupabaseConnectionCheckerProps {
  interval?: number // Intervalo de verificación en ms (por defecto 30 segundos)
  showAlways?: boolean // Mostrar siempre el componente, incluso cuando hay conexión
  className?: string
}

/**
 * Componente que verifica periódicamente la conexión a Supabase
 * y muestra una alerta cuando hay problemas de conexión
 */
export function SupabaseConnectionChecker({
  interval = 30000,
  showAlways = false,
  className = ''
}: SupabaseConnectionCheckerProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Función para verificar la conexión
  const checkConnection = async () => {
    if (isChecking) return
    
    setIsChecking(true)
    
    try {
      // Verificar que supabase esté definido
      if (!supabase) {
        setIsConnected(false)
        setErrorMessage('La instancia de Supabase no está configurada correctamente')
        return
      }
      
      // Intentar hacer una consulta simple
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1)
        .maybeSingle()
      
      if (error) {
        console.warn('Error de conexión a Supabase:', error)
        setIsConnected(false)
        setErrorMessage(error.message || 'Error al conectar con la base de datos')
      } else {
        setIsConnected(true)
        setErrorMessage(null)
      }
    } catch (error) {
      console.error('Error al verificar la conexión:', error)
      setIsConnected(false)
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al verificar la conexión'
      )
    } finally {
      setIsChecking(false)
      setLastChecked(new Date())
    }
  }
  
  // Verificar la conexión al montar el componente
  useEffect(() => {
    checkConnection()
    
    // Configurar verificación periódica
    const intervalId = setInterval(checkConnection, interval)
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId)
  }, [interval])
  
  // No mostrar nada si hay conexión y showAlways es false
  if (isConnected && !showAlways) {
    return null
  }
  
  // Mostrar indicador de carga si aún no se ha verificado
  if (isConnected === null) {
    return (
      <Alert className={`bg-muted/50 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        <AlertTitle>Verificando conexión</AlertTitle>
        <AlertDescription>
          Comprobando la conexión con la base de datos...
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <Alert 
      variant={isConnected ? "default" : "destructive"}
      className={className}
    >
      {isConnected ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <AlertTitle>
        {isConnected 
          ? "Conexión establecida" 
          : "Problema de conexión"
        }
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        {isConnected ? (
          <p>La conexión con la base de datos está funcionando correctamente.</p>
        ) : (
          <>
            <p>
              No se puede conectar a la base de datos. Esto puede afectar la funcionalidad de la aplicación.
              {errorMessage && <span className="block text-xs mt-1">{errorMessage}</span>}
            </p>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnection}
                disabled={isChecking}
                className="mt-2"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Reintentar
              </Button>
            </div>
          </>
        )}
        {lastChecked && (
          <p className="text-xs text-muted-foreground mt-1">
            Última verificación: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default SupabaseConnectionChecker
