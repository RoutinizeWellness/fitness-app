"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Database, Server } from 'lucide-react'
import { SupabaseErrorType } from '@/lib/error-handlers/supabase-error-handler'

interface SupabaseErrorMessageProps {
  error: any
  errorType?: SupabaseErrorType
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  showDetails?: boolean
}

/**
 * Componente para mostrar mensajes de error de Supabase
 */
export function SupabaseErrorMessage({
  error,
  errorType,
  title,
  description,
  onRetry,
  className = '',
  showDetails = false
}: SupabaseErrorMessageProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  
  // Determinar tipo de error y mensaje
  useEffect(() => {
    if (!error) return
    
    let details = ''
    
    if (typeof error === 'string') {
      details = error
    } else if (error instanceof Error) {
      details = error.message
      if (error.stack && showDetails) {
        details += '\n' + error.stack
      }
    } else if (typeof error === 'object') {
      details = JSON.stringify(error, null, 2)
    } else {
      details = String(error)
    }
    
    setErrorDetails(details)
  }, [error, showDetails])
  
  // Manejar reintento
  const handleRetry = async () => {
    if (!onRetry || isRetrying) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }
  
  // Determinar icono según tipo de error
  const getIcon = () => {
    if (!errorType) return <AlertCircle className="h-4 w-4" />
    
    switch (errorType) {
      case SupabaseErrorType.CONNECTION:
        return <Server className="h-4 w-4" />
      case SupabaseErrorType.TABLE_NOT_EXISTS:
      case SupabaseErrorType.CONSTRAINT:
        return <Database className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }
  
  // No mostrar nada si no hay error
  if (!error) return null
  
  return (
    <Alert variant="destructive" className={className}>
      {getIcon()}
      <AlertTitle>{title || 'Error de base de datos'}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{description || 'Se produjo un error al acceder a los datos.'}</p>
        
        {showDetails && errorDetails && (
          <div className="bg-destructive/10 p-2 rounded text-xs font-mono overflow-auto max-h-[100px] mt-2">
            {errorDetails}
          </div>
        )}
        
        {onRetry && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              Reintentar
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default SupabaseErrorMessage
