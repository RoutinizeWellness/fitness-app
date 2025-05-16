"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface FinalScreenProps {
  title: string
  imageSrc: string
  onGetStarted: () => void
}

export function FinalScreen({ title, imageSrc, onGetStarted }: FinalScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-[#573353] mb-8 text-center font-klasik">
        {title}
      </h2>

      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Fallback for missing images */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFF3E9]/50 rounded-lg">
          <div className="w-32 h-32 rounded-full bg-[#FDA758]/20 flex items-center justify-center">
            <span className="text-[#573353] font-medium">Final Image</span>
          </div>
        </div>

        <Image
          src={imageSrc}
          alt={title}
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

      <div className="text-center text-[#573353] mb-8">
        <p className="text-sm">
          WE CAN <span className="text-[#FDA758] font-medium">HELP YOU</span> TO BE A BETTER<br />
          VERSION OF <span className="text-[#FDA758] font-medium">YOURSELF</span>
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGetStarted}
        className="bg-[#FDA758] text-white font-medium py-3 px-8 rounded-full shadow-md"
      >
        Get Started
      </motion.button>
    </motion.div>
  )
}
