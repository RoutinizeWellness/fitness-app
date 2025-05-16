"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { FigmaOnboarding } from "@/components/onboarding/figma-onboarding"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

export default function WelcomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push("/dashboard")
      return
    }

    const checkWelcomeStatus = async () => {
      try {
        // Check if user has already seen the welcome screen
        const welcomeStatus = localStorage.getItem("hasSeenWelcome")

        // Simulate a small loading delay to show animation
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Only redirect if confirmed that user has seen the welcome
        if (welcomeStatus === "true") {
          router.push("/auth/login")
        } else {
          // If not seen welcome, show it
          setHasSeenWelcome(false)
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
        // In case of error, continue showing welcome screen
        setHasSeenWelcome(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkWelcomeStatus()
  }, [user, router])

  const handleWelcomeComplete = () => {
    try {
      // Mark that user has seen the welcome
      localStorage.setItem("hasSeenWelcome", "true")
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }

    // Redirect to login regardless of whether localStorage save succeeded
    router.push("/auth/login")
  }

  // Show loading screen while checking status
  if (isLoading) {
    return <PulseLoader message="Preparing your experience..." />
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9] flex items-center justify-center">
      <FigmaOnboarding onComplete={handleWelcomeComplete} />
    </div>
  )
}
