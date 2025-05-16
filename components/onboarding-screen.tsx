"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OnboardingScreenProps {
  onComplete?: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  const screens = [
    {
      title: "Track your workouts.",
      description: "Log exercises, sets, and reps with ease.",
      image: "/images/onboarding/workout-tracking.webp",
      color: "from-blue-500 to-indigo-700"
    },
    {
      title: "Analyze your progress.",
      description: "Get AI-powered insights on your performance.",
      image: "/images/onboarding/progress-analysis.webp",
      color: "from-purple-500 to-indigo-700"
    },
    {
      title: "Personalize your plan.",
      description: "Adaptive workouts that evolve with you.",
      image: "/images/onboarding/personalized-plan.webp",
      color: "from-indigo-500 to-blue-700"
    },
    {
      title: "Anytime, anywhere.",
      description: "Train with confidence, online or offline.",
      image: "/images/onboarding/anytime-anywhere.webp",
      color: "from-gray-800 to-gray-900"
    }
  ]

  const handleNext = () => {
    if (isAnimating) return

    setIsAnimating(true)
    if (currentScreen < screens.length - 1) {
      setTimeout(() => {
        setCurrentScreen(prev => prev + 1)
        setIsAnimating(false)
      }, 500)
    } else {
      // On last screen, complete onboarding
      if (onComplete) {
        onComplete()
      } else {
        router.push("/auth/login")
      }
    }
  }

  const handleSkip = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push("/auth/login")
    }
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleGetStarted = () => {
    router.push("/auth/register")
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-colors duration-1000",
          screens[currentScreen].color
        )}
      />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-white/10" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex justify-center pt-12 pb-8">
          <div className="h-10 flex items-center">
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
              <path d="M20.5 8C13.6 8 8 13.6 8 20.5C8 27.4 13.6 33 20.5 33C27.4 33 33 27.4 33 20.5C33 13.6 27.4 8 20.5 8ZM20.5 30C15.3 30 11 25.7 11 20.5C11 15.3 15.3 11 20.5 11C25.7 11 30 15.3 30 20.5C30 25.7 25.7 30 20.5 30Z" fill="white"/>
              <path d="M20.5 14C17 14 14 17 14 20.5C14 24 17 27 20.5 27C24 27 27 24 27 20.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20.5 17C18.6 17 17 18.6 17 20.5C17 22.4 18.6 24 20.5 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M27 20.5C27 18.6 25.4 17 23.5 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M42 15H46C48.8 15 51 17.2 51 20C51 22.8 48.8 25 46 25H42V15ZM46 22C47.1 22 48 21.1 48 20C48 18.9 47.1 18 46 18H45V22H46Z" fill="white"/>
              <path d="M54 15H57V22C57 23.1 57.9 24 59 24C60.1 24 61 23.1 61 22V15H64V22C64 24.8 61.8 27 59 27C56.2 27 54 24.8 54 22V15Z" fill="white"/>
              <path d="M72 15H69V25H72V15Z" fill="white"/>
              <path d="M74 15H77L80 20.5L83 15H86V25H83V19.5L80 25L77 19.5V25H74V15Z" fill="white"/>
              <path d="M88 15H91V25H88V15Z" fill="white"/>
              <path d="M93 15H96L99 20.5L102 15H105V25H102V19.5L99 25L96 19.5V25H93V15Z" fill="white"/>
              <path d="M107 15H114V18H110V19H113V22H110V25H107V15Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-between px-6">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xs"
              >
                <div className="w-full h-64 flex items-center justify-center">
                  {/* Fallback icon if image fails to load */}
                  {currentScreen === 0 && (
                    <svg className="w-32 h-32 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                  {currentScreen === 1 && (
                    <svg className="w-32 h-32 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 20H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M17 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {currentScreen === 2 && (
                    <svg className="w-32 h-32 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {currentScreen === 3 && (
                    <svg className="w-32 h-32 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-white text-3xl font-bold mb-2 text-center">
                  {screens[currentScreen].title}
                </h1>
                <p className="text-white/80 text-center">
                  {screens[currentScreen].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="mb-12 space-y-4">
            <Button
              variant="default"
              className="w-full bg-white text-gray-900 hover:bg-white/90"
              onClick={currentScreen === screens.length - 1 ? handleLogin : handleNext}
            >
              {currentScreen === screens.length - 1 ? "LOG IN" : "NEXT"}
            </Button>

            {currentScreen === screens.length - 1 ? (
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white/10"
                onClick={handleGetStarted}
              >
                GET STARTED
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleSkip}
              >
                SKIP
              </Button>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center pb-8">
          <div className="flex space-x-2">
            {screens.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentScreen === index ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
