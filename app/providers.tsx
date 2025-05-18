"use client"

import React from 'react'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { ProfileProvider } from '@/lib/contexts/profile-context'
import { TrainingProvider } from '@/lib/contexts/training-context'
import { Toaster } from '@/components/ui/toaster'
import { ContrastModeProvider } from '@/components/ui/contrast-mode-provider'
import { AccessibilityControls } from '@/components/ui/accessibility-controls'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <TrainingProvider>
          <ContrastModeProvider>
            {children}
            <AccessibilityControls />
            <Toaster />
          </ContrastModeProvider>
        </TrainingProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}
