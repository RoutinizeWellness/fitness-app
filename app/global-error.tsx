'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                ¡Algo salió mal!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ha ocurrido un error inesperado en la aplicación.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                {error.message || 'Error desconocido'}
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={reset}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Intentar de nuevo
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 mt-6">
                Si el problema persiste, por favor contacta al soporte técnico.
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
