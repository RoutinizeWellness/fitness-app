"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import SplashScreen from "@/components/splash/SplashScreen"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

  // Handle the splash screen display and initial routing
  useEffect(() => {
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
