"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface AuthLoadingProps {
  message?: string
  redirectUrl?: string
  redirectDelay?: number
  onComplete?: () => void
}

export function AuthLoading({
  message = "Procesando tu solicitud...",
  redirectUrl,
  redirectDelay = 2000,
  onComplete
}: AuthLoadingProps) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        if (redirectUrl) {
          window.location.href = redirectUrl
        }
        if (onComplete) {
          onComplete()
        }
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [progress, redirectUrl, onComplete])
  
  useEffect(() => {
    if (redirectUrl) {
      const timeout = setTimeout(() => {
        window.location.href = redirectUrl
      }, redirectDelay)
      
      return () => clearTimeout(timeout)
    }
  }, [redirectUrl, redirectDelay])
  
  return (
    <div className="fixed inset-0 bg-[#FFF3E9]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-6">
          <Image
            src="/images/routinize-logo.svg"
            alt="Routinize Logo"
            width={96}
            height={96}
            className="drop-shadow-lg"
            priority
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1B237E]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="w-64 h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-[#1B237E]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <motion.p
          className="text-lg font-medium text-[#573353]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  )
}
