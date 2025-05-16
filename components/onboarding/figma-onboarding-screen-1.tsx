"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface OnboardingScreen1Props {
  onNext: () => void
  onSkip: () => void
}

export function FigmaOnboardingScreen1({ onNext, onSkip }: OnboardingScreen1Props) {
  return (
    <div className="w-[414px] h-[896px] relative overflow-hidden bg-[#FFF3E9]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Decorative shapes - these will be colored blobs in various positions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-[50px] left-[30px] w-[80px] h-[80px] rounded-full bg-[#E57373] opacity-50 blur-lg"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-[80px] right-[40px] w-[100px] h-[100px] rounded-full bg-[#FF9800] opacity-50 blur-lg"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute top-[200px] left-[150px] w-[120px] h-[120px] rounded-full bg-[#FFCC80] opacity-30 blur-lg"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-[300px] left-[50px] w-[90px] h-[90px] rounded-full bg-[#F48FB1] opacity-40 blur-lg"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start h-full pt-[100px] px-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[32px] font-bold text-[#573353] text-center font-klasik leading-tight mb-8"
        >
          WELCOME TO<br />
          MONUMENTAL<br />
          HABITS
        </motion.h1>

        {/* Main illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative w-full h-[400px] mb-8"
        >
          <Image
            src="/images/onboarding/figma-welcome-1.svg"
            alt="Person looking at mountains"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
        <button
          onClick={onSkip}
          className="text-[#573353] text-sm font-medium"
        >
          Skip
        </button>

        {/* Progress dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#FDA758]" />
          <div className="w-2 h-2 rounded-full bg-[#EBDCCF]" />
          <div className="w-2 h-2 rounded-full bg-[#EBDCCF]" />
          <div className="w-2 h-2 rounded-full bg-[#EBDCCF]" />
        </div>

        <button
          onClick={onNext}
          className="text-[#573353] text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  )
}
