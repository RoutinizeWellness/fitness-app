"use client"

import React, { useState, useEffect } from 'react'
import { Providers } from './providers'

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  // Use a state to control when to render the full providers
  // This helps prevent the "maximum update depth exceeded" error
  const [mounted, setMounted] = useState(false)

  // Use a one-time effect to set mounted to true
  useEffect(() => {
    // Use setTimeout to ensure this happens after initial render
    // This helps prevent React hydration issues
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Always render with providers to prevent AuthProvider errors
  // The providers themselves will handle the mounting state
  return <Providers mounted={mounted}>{children}</Providers>
}
