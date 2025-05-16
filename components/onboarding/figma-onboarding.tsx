"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { FigmaOnboardingScreen1 } from "./figma-onboarding-screen-1"
import { FigmaOnboardingScreen2 } from "./figma-onboarding-screen-2"

interface FigmaOnboardingProps {
  onComplete?: () => void
  redirectPath?: string
}

export function FigmaOnboarding({ 
  onComplete, 
  redirectPath = "/auth/login" 
}: FigmaOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleGetStarted()
    }
  }

  const handleSkip = () => {
    handleGetStarted()
  }

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push(redirectPath)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {currentStep === 1 ? (
        <motion.div
          key="screen1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FigmaOnboardingScreen1 
            onNext={handleNext} 
            onSkip={handleSkip} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="screen2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FigmaOnboardingScreen2 
            onNext={handleNext} 
            onSkip={handleSkip} 
            onGetStarted={handleGetStarted} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
