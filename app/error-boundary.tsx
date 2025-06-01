"use client"

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { SafeClientButton as Button } from '@/components/ui/safe-client-button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  componentDidMount() {
    // Add event listener for unhandled chunk errors
    window.addEventListener('error', this.handleChunkError)
    window.addEventListener('unhandledrejection', this.handlePromiseRejection)
  }

  componentWillUnmount() {
    // Remove event listeners
    window.removeEventListener('error', this.handleChunkError)
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection)
  }

  handleChunkError = (event: ErrorEvent) => {
    // Check if this is a chunk load error
    if (
      event.message && (
        event.message.includes('ChunkLoadError') ||
        event.message.includes('Loading chunk') ||
        event.message.includes('Loading CSS chunk') ||
        event.message.includes('Failed to fetch dynamically imported module')
      )
    ) {
      // Prevent the error from showing in console
      event.preventDefault()
      
      // Update state to show error UI
      this.setState({ hasError: true, error: new Error('Error al cargar recursos') })
    }
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    // Check if this is a chunk load error in a promise
    if (
      event.reason && 
      typeof event.reason.message === 'string' && (
        event.reason.message.includes('ChunkLoadError') ||
        event.reason.message.includes('Loading chunk') ||
        event.reason.message.includes('Failed to fetch dynamically imported module')
      )
    ) {
      // Prevent the error from showing in console
      event.preventDefault()
      
      // Update state to show error UI
      this.setState({ hasError: true, error: new Error('Error al cargar recursos') })
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}

// ✅ NEXT.JS 15: ErrorFallback needs to be a Client Component for onClick handlers
function ErrorFallback({ error, reset }: { error: Error | null, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ha ocurrido un error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error?.message || 'Se ha producido un error al cargar la aplicación.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={reset}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
