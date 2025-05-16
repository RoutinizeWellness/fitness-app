"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HabitBuilderOnboarding } from "@/components/onboarding/habit-builder-onboarding"

export default function HabitOnboardingPage() {
  const router = useRouter()
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the user has already seen the onboarding
    try {
      const seen = localStorage.getItem("hasSeenHabitOnboarding") === "true"
      setHasSeenOnboarding(seen)
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      setHasSeenOnboarding(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleOnboardingComplete = () => {
    try {
      // Mark that the user has seen the onboarding
      localStorage.setItem("hasSeenHabitOnboarding", "true")
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }

    // Redirect to login
    router.push("/auth/login")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse text-[#573353]">Loading...</div>
      </div>
    )
  }

  // If the user has already seen the onboarding, redirect to login
  if (hasSeenOnboarding) {
    router.push("/auth/login")
    return null
  }

  // Otherwise, show the onboarding
  return <HabitBuilderOnboarding onComplete={handleOnboardingComplete} />
}
