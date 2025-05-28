"use client"

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InfoIcon, RefreshCw } from 'lucide-react'

interface FallbackDataMessageProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'info'
}

/**
 * Componente para mostrar mensajes cuando se están usando datos de fallback
 */
export function FallbackDataMessage({
  title = 'Usando datos locales',
  description = 'No se pudo conectar a la base de datos. Se están mostrando datos locales temporales.',
  onRetry,
  className = '',
  variant = 'info'
}: FallbackDataMessageProps) {
  return (
    <Alert 
      variant={variant === 'info' ? 'default' : variant}
      className={`${className} ${variant === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}`}
    >
      <InfoIcon className={`h-4 w-4 ${variant === 'info' ? 'text-blue-600' : ''}`} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{description}</p>
        
        {onRetry && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Reintentar conexión
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default FallbackDataMessage
