"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import SplashScreen from "@/components/splash/SplashScreen"
import { ErrorBoundary } from "@/components/error-boundary"

// Create a wrapper component that safely uses the auth hook
function AuthenticatedHome() {
  // Call useAuth at the top level of the component
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // Handle the splash screen display and initial routing
  useEffect(() => {
    try {
      // Check if this is the first visit or a refresh
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore')

      if (hasVisitedBefore) {
        // Skip splash for returning users
        setShowSplash(false)
        setInitialLoad(false)
      } else {
        // Show splash for first-time visitors
        localStorage.setItem('hasVisitedBefore', 'true')

        // Auto-hide splash after 3 seconds
        const timer = setTimeout(() => {
          setShowSplash(false)
        }, 3000)

        return () => clearTimeout(timer)
      }
    } catch (error) {
      // Handle case where localStorage is not available
      console.error("Error accessing localStorage:", error)
      setShowSplash(false)
      setInitialLoad(false)
    }
  }, [])

  // Handle redirection after splash screen
  useEffect(() => {
    // Only proceed with redirection if splash is not showing and auth is loaded
    if (showSplash || isLoading) return

    try {
      if (user) {
        // If user is authenticated, redirect to dashboard
        console.log("User authenticated, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        // If not authenticated, go to login
        console.log("User not authenticated, redirecting to login")
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error during redirection:", error)
      // In case of error, redirect to login by default
      router.push("/auth/login")
    }
  }, [user, isLoading, router, showSplash])

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show loading screen while determining redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2151] to-[#2d3a80]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Routinize Wellness
        </h1>
        <p className="text-blue-200/80 mb-8">
          Tu compañero de entrenamiento personalizado
        </p>
        <PulseLoader message="Loading your fitness data..." />
      </div>
    </div>
  )
}

// Create a fallback component for when auth is not available
function FallbackHome() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    try {
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore')
      if (hasVisitedBefore) {
        setShowSplash(false)
      } else {
        localStorage.setItem('hasVisitedBefore', 'true')
        const timer = setTimeout(() => {
          setShowSplash(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    } catch (error) {
      setShowSplash(false)
    }
  }, [])

  useEffect(() => {
    if (!showSplash) {
      // Redirect to login by default when auth is not available
      router.push("/auth/login")
    }
  }, [router, showSplash])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2151] to-[#2d3a80]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Routinize Wellness
        </h1>
        <p className="text-blue-200/80 mb-8">
          Tu compañero de entrenamiento personalizado
        </p>
        <PulseLoader message="Preparing your experience..." />
      </div>
    </div>
  )
}

// Main component that uses ErrorBoundary for proper error handling
export default function Home() {
  return (
    <ErrorBoundary fallback={<FallbackHome />}>
      <AuthenticatedHome />
    </ErrorBoundary>
  )
}
