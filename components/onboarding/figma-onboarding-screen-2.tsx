"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface OnboardingScreen2Props {
  onNext: () => void
  onSkip: () => void
  onGetStarted: () => void
}

export function FigmaOnboardingScreen2({ onNext, onSkip, onGetStarted }: OnboardingScreen2Props) {
  return (
    <div className="w-[414px] h-[896px] relative overflow-hidden bg-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Decorative shapes - colored blobs in various positions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-[50px] right-[30px] w-[80px] h-[80px] rounded-full bg-[#E57373] opacity-50 blur-lg"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-[300px] right-[40px] w-[100px] h-[100px] rounded-full bg-[#FF9800] opacity-50 blur-lg"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-[200px] left-[50px] w-[120px] h-[120px] rounded-full bg-[#F48FB1] opacity-30 blur-lg"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start h-full pt-[80px] px-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[32px] font-bold text-[#573353] text-center font-klasik leading-tight mb-8"
        >
          WELCOME TO<br />
          MONUMENTAL HABITS
        </motion.h1>

        {/* Main illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative w-full h-[300px] mb-8"
        >
          <Image
            src="/images/onboarding/figma-welcome-2.svg"
            alt="Person standing"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center text-[#573353] mb-12"
        >
          <p className="text-base">
            WE CAN <span className="text-[#FDA758] font-medium">HELP YOU</span> TO BE A BETTER<br />
            VERSION OF <span className="text-[#FDA758] font-medium">YOURSELF</span>.
          </p>
        </motion.div>

        {/* Get Started button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="bg-[#FDA758] text-white font-medium py-4 px-8 rounded-full shadow-md"
        >
          Get Started
        </motion.button>
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
          <div className="w-2 h-2 rounded-full bg-[#EBDCCF]" />
          <div className="w-2 h-2 rounded-full bg-[#FDA758]" />
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
