"use client"

import React, { useState, useEffect } from 'react'
import { AuthProvider } from '@/lib/auth/auth-context'
import { ProfileProvider } from '@/lib/contexts/profile-context'
import { TrainingProvider } from '@/lib/contexts/training-context'
import { NutritionProvider } from '@/lib/contexts/nutrition-context'
import { GeminiProvider } from '@/lib/contexts/gemini-provider'
import { NotificationProvider } from '@/lib/contexts/notification-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import ErrorBoundary from './error-boundary'

import { AuthDiagnostics } from '@/components/auth/auth-diagnostics'

export function Providers({ children, mounted = true }: { children: React.ReactNode; mounted?: boolean }) {
  // Add a state to track if providers are ready
  const [providersReady, setProvidersReady] = useState(false)

  // Use an effect to mark providers as ready after initial render
  useEffect(() => {
    // Small delay to ensure all providers are properly initialized
    const timer = setTimeout(() => {
      setProvidersReady(true)
    }, 100) // Aumentado a 100ms para dar más tiempo a la inicialización

    return () => clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <AuthProvider>
          <ProfileProvider>
            {/* Only render TrainingProvider when providers are ready */}
            {providersReady ? (
              <TrainingProvider>
                <NutritionProvider>
                  <NotificationProvider>
                    <GeminiProvider>
                      {children}
                      <Toaster />
                      {/* Añadir el componente de diagnóstico solo en desarrollo */}
                      {process.env.NODE_ENV === 'development' && <AuthDiagnostics />}
                    </GeminiProvider>
                  </NotificationProvider>
                </NutritionProvider>
              </TrainingProvider>
            ) : (
              <>
                {children}
                <Toaster />
              </>
            )}
          </ProfileProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
