import React from 'react'
import { AuthProvider } from './contexts/auth-context'
import { ProfileProvider } from './contexts/profile-context'
import { TrainingProvider } from './contexts/training-context'
import { Toaster } from '@/components/ui/toaster'

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
