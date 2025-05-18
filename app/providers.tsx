"use client"

import React, { Suspense, lazy } from 'react'
import { AuthProvider } from '@/lib/contexts/auth-context'

// Lazy load providers that aren't needed for initial render
const ProfileProvider = lazy(() => import('@/lib/contexts/profile-context').then(mod => ({ default: mod.ProfileProvider })))
const TrainingProvider = lazy(() => import('@/lib/contexts/training-context').then(mod => ({ default: mod.TrainingProvider })))
const Toaster = lazy(() => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })))

// Loading fallback component
const LoadingFallback = () => <div className="min-h-screen bg-background"></div>

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <ProfileProvider>
          <TrainingProvider>
            {children}
            <Toaster />
          </TrainingProvider>
        </ProfileProvider>
      </Suspense>
    </AuthProvider>
  )
}
