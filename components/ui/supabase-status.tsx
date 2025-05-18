'use client'

import React from 'react'
import { useSupabaseContext } from '@/contexts/SupabaseContext'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SupabaseStatusProps {
  showLabel?: boolean
  className?: string
}

export function SupabaseStatus({ showLabel = true, className }: SupabaseStatusProps) {
  const { isConnected, isLoading, error, checkConnection } = useSupabaseContext()

  const handleRetry = async () => {
    await checkConnection()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
          {showLabel && <span className="text-xs text-muted-foreground">Verificando conexión...</span>}
        </>
      ) : isConnected ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          {showLabel && <span className="text-xs text-muted-foreground">Conectado a Supabase</span>}
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          {showLabel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Error de conexión</span>
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-6 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
