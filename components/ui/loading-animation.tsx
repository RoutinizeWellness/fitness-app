"use client"

import React from "react"
import { motion } from "framer-motion"

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg"
  color?: string
  text?: string
  className?: string
}

export function LoadingAnimation({
  size = "md",
  color = "primary",
  text,
  className = ""
}: LoadingAnimationProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const colorMap = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    green: "border-green-500",
    blue: "border-blue-500",
    purple: "border-purple-500",
    red: "border-red-500",
    white: "border-white"
  }

  const borderColor = colorMap[color as keyof typeof colorMap] || "border-primary"
  const sizeClass = sizeMap[size]

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClass} rounded-full border-2 ${borderColor} border-t-transparent animate-spin`}></div>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  )
}

export function PulseLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1] }}
      />
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.2 }}
      />
      <motion.div
        className="h-3 w-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.4 }}
      />
    </div>
  )
}

export function ProgressLoader({ 
  progress = 0, 
  className = "" 
}: { 
  progress: number, 
  className?: string 
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-1 text-xs text-right text-gray-500">{Math.round(progress)}%</div>
    </div>
  )
}
