"use client"

import React from 'react'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { ProfileProvider } from '@/lib/contexts/profile-context'
import { TrainingProvider } from '@/lib/contexts/training-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <TrainingProvider>
          {children}
          <Toaster />
        </TrainingProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}
