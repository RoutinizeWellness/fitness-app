"use client"

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { TrainingProvider } from '@/contexts/training-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TrainingProvider>
          {children}
          <Toaster />
        </TrainingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
