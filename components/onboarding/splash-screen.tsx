"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function SplashScreen() {
  return (
    <div className="relative w-full h-screen bg-[#FFF3E9] flex flex-col items-center justify-center overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pink blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 w-32 h-32 bg-[#F8D0E0] rounded-full opacity-70 blur-md"
        />

        {/* Orange blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute top-10 right-10 w-24 h-24 bg-[#FDA758] rounded-full opacity-70 blur-md"
        />

        {/* Purple blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute bottom-20 left-10 w-28 h-28 bg-[#9747FF] rounded-full opacity-40 blur-md"
        />

        {/* Mountain shape */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 h-64 bg-[#B4B4FF] opacity-50"
          style={{
            clipPath: "polygon(0% 100%, 100% 100%, 100% 40%, 75% 70%, 50% 40%, 25% 70%, 0% 40%)"
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-4xl font-bold text-[#573353] mb-4 font-klasik">
          WELCOME TO<br />
          MONUMENTAL<br />
          HABITS
        </h1>

        {/* Character image */}
        <div className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center">
          {/* Fallback for missing images */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#FFF3E9]/50 rounded-lg">
            <div className="w-32 h-32 rounded-full bg-[#FDA758]/20 flex items-center justify-center">
              <span className="text-[#573353] font-medium">Splash Image</span>
            </div>
          </div>

          <Image
            src="/images/onboarding/character-splash.png"
            alt="Character looking at mountains"
            width={256}
            height={256}
            className="object-contain relative z-10"
            onError={(e) => {
              // Hide the image on error, fallback will show
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
