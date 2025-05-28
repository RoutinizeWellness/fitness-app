"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  onGoHome?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Componente para mostrar cuando ocurre un error
 */
export function NutritionErrorFallback({
  error,
  resetErrorBoundary,
  goHome
}: {
  error: Error | null
  resetErrorBoundary: () => void
  goHome: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Error en el módulo de Nutrición</CardTitle>
          </div>
          <CardDescription>
            Se ha producido un error al cargar los datos de nutrición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Esto puede deberse a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Problemas de conexión con la base de datos</li>
              <li>Datos incompletos o incorrectos</li>
              <li>Un error temporal en el servidor</li>
            </ul>
          </div>
          
          {error && (
            <div className="bg-muted/50 p-3 rounded-md text-xs font-mono overflow-auto max-h-[150px]">
              {error.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goHome}>
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Componente de límite de error para el módulo de nutrición
 */
export class NutritionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error en el módulo de nutrición:', error, errorInfo)
    this.setState({ errorInfo })
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <NutritionErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          goHome={this.goHome}
        />
      )
    }

    return children
  }

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  private goHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome()
    } else {
      // Redirigir al inicio
      window.location.href = '/dashboard'
    }
  }
}

/**
 * Componente de límite de error con enrutamiento
 */
export function NutritionErrorBoundaryWithRouter(props: Omit<Props, 'onGoHome'>) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return <NutritionErrorBoundary {...props} onGoHome={handleGoHome} />
}

export default NutritionErrorBoundaryWithRouter
