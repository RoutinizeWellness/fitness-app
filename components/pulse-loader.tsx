"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PulseLoaderProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
}

export function PulseLoader({ 
  size = "md", 
  color = "bg-primary", 
  className 
}: PulseLoaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  // Optional animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  }
  
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className={cn(
        "rounded-full animate-pulse transition-opacity duration-500",
        sizeClasses[size],
        color,
        isVisible ? "opacity-100" : "opacity-30"
      )} />
      <div className={cn(
        "rounded-full animate-pulse transition-opacity duration-500 delay-150",
        sizeClasses[size],
        color,
        isVisible ? "opacity-100" : "opacity-30"
      )} />
      <div className={cn(
        "rounded-full animate-pulse transition-opacity duration-500 delay-300",
        sizeClasses[size],
        color,
        isVisible ? "opacity-100" : "opacity-30"
      )} />
    </div>
  )
}
