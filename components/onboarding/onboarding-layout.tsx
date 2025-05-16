"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface OnboardingLayoutProps {
  children: ReactNode
  showSkip?: boolean
  showNext?: boolean
  currentStep?: number
  totalSteps?: number
  onSkip?: () => void
  onNext?: () => void
}

export function OnboardingLayout({
  children,
  showSkip = true,
  showNext = true,
  currentStep = 1,
  totalSteps = 4,
  onSkip,
  onNext
}: OnboardingLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-[#FFF3E9] flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left blob */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F8D0E0] rounded-full opacity-70 blur-md" />

        {/* Top right blob */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#FDA758] rounded-full opacity-70 blur-md" />

        {/* Bottom left blob */}
        <div className="absolute bottom-20 left-10 w-28 h-28 bg-[#9747FF] rounded-full opacity-40 blur-md" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {children}
      </div>

      {/* Footer with navigation */}
      <div className="p-6 flex justify-between items-center relative z-10">
        {showSkip ? (
          <button
            onClick={onSkip}
            className="text-[#573353] text-sm font-medium"
          >
            Skip
          </button>
        ) : (
          <div></div> // Empty div for spacing
        )}

        {/* Progress dots */}
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index + 1 === currentStep ? "bg-[#FDA758]" : "bg-[#EBDCCF]"
              }`}
            />
          ))}
        </div>

        {showNext ? (
          <button
            onClick={onNext}
            className="text-[#573353] text-sm font-medium"
          >
            Next
          </button>
        ) : (
          <div></div> // Empty div for spacing
        )}
      </div>
    </div>
  )
}
