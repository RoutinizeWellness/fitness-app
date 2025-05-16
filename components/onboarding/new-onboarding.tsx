"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"

import { SplashScreen } from "@/components/onboarding/splash-screen"
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout"
import { IntroScreen } from "@/components/onboarding/intro-screen"
import { FinalScreen } from "@/components/onboarding/final-screen"

export function NewOnboarding() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Auto-advance from splash screen after 3 seconds
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false)
        setCurrentStep(1)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [showSplash])
  
  const handleSkip = () => {
    router.push("/auth/login")
  }
  
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handleGetStarted = () => {
    router.push("/auth/login")
  }
  
  // Intro screen content
  const introScreens = [
    {
      title: "WELCOME TO\nMONUMENTAL HABITS",
      imageSrc: "/images/onboarding/intro-1.png"
    },
    {
      title: "CREATE NEW\nHABIT EASILY",
      imageSrc: "/images/onboarding/intro-2.png"
    },
    {
      title: "KEEP TRACK OF YOUR\nPROGRESS",
      imageSrc: "/images/onboarding/intro-3.png"
    },
    {
      title: "JOIN A SUPPORTIVE\nCOMMUNITY",
      imageSrc: "/images/onboarding/intro-4.png"
    }
  ]
  
  if (showSplash) {
    return <SplashScreen />
  }
  
  return (
    <AnimatePresence mode="wait">
      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={4}
        onSkip={handleSkip}
        onNext={handleNext}
        showNext={currentStep < 4}
      >
        {currentStep < 4 ? (
          <IntroScreen
            title={introScreens[currentStep - 1].title}
            imageSrc={introScreens[currentStep - 1].imageSrc}
            step={currentStep}
          />
        ) : (
          <FinalScreen
            title={introScreens[3].title}
            imageSrc={introScreens[3].imageSrc}
            onGetStarted={handleGetStarted}
          />
        )}
      </OnboardingLayout>
    </AnimatePresence>
  )
}
