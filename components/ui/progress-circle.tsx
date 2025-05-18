"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressCircleProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg" | "xl"
  thickness?: "thin" | "normal" | "thick"
  showValue?: boolean
  unit?: string
  label?: string
  colorScheme?: "default" | "blue" | "green" | "red" | "purple" | "orange" | "gradient"
  className?: string
  animate?: boolean
}

export function ProgressCircle({
  value,
  max = 100,
  size = "md",
  thickness = "normal",
  showValue = true,
  unit = "%",
  label,
  colorScheme = "default",
  className,
  animate = true,
}: ProgressCircleProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  // Normalizar el valor entre 0 y 100
  const normalizedValue = Math.min(100, Math.max(0, (value / max) * 100))
  
  // Animación del contador
  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }
    
    const duration = 1000 // ms
    const frameDuration = 1000 / 60 // 60fps
    const totalFrames = Math.round(duration / frameDuration)
    let frame = 0
    
    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      // Función de easing para hacer la animación más natural
      const easeOutQuad = progress * (2 - progress)
      setDisplayValue(Math.floor(value * easeOutQuad))
      
      if (frame === totalFrames) {
        clearInterval(counter)
        setDisplayValue(value)
      }
    }, frameDuration)
    
    return () => clearInterval(counter)
  }, [value, animate])
  
  // Tamaños del círculo
  const sizes = {
    sm: {
      container: "h-20 w-20",
      svg: "h-20 w-20",
      text: "text-lg",
      label: "text-xs",
    },
    md: {
      container: "h-28 w-28",
      svg: "h-28 w-28",
      text: "text-2xl",
      label: "text-sm",
    },
    lg: {
      container: "h-36 w-36",
      svg: "h-36 w-36",
      text: "text-3xl",
      label: "text-base",
    },
    xl: {
      container: "h-48 w-48",
      svg: "h-48 w-48",
      text: "text-4xl",
      label: "text-lg",
    },
  }
  
  // Grosor del trazo
  const thicknesses = {
    thin: 2,
    normal: 4,
    thick: 6,
  }
  
  // Esquemas de color
  const colorSchemes = {
    default: {
      track: "stroke-muted",
      progress: "stroke-primary",
      text: "text-foreground",
    },
    blue: {
      track: "stroke-blue-100 dark:stroke-blue-900/30",
      progress: "stroke-blue-500 dark:stroke-blue-400",
      text: "text-blue-700 dark:text-blue-300",
    },
    green: {
      track: "stroke-green-100 dark:stroke-green-900/30",
      progress: "stroke-green-500 dark:stroke-green-400",
      text: "text-green-700 dark:text-green-300",
    },
    red: {
      track: "stroke-red-100 dark:stroke-red-900/30",
      progress: "stroke-red-500 dark:stroke-red-400",
      text: "text-red-700 dark:text-red-300",
    },
    purple: {
      track: "stroke-purple-100 dark:stroke-purple-900/30",
      progress: "stroke-purple-500 dark:stroke-purple-400",
      text: "text-purple-700 dark:text-purple-300",
    },
    orange: {
      track: "stroke-orange-100 dark:stroke-orange-900/30",
      progress: "stroke-orange-500 dark:stroke-orange-400",
      text: "text-orange-700 dark:text-orange-300",
    },
    gradient: {
      track: "stroke-muted",
      progress: "stroke-[url(#gradient)]",
      text: "text-foreground",
    },
  }
  
  const currentSize = sizes[size]
  const strokeWidth = thicknesses[thickness]
  const currentColorScheme = colorSchemes[colorScheme]
  
  // Calcular dimensiones del círculo
  const radius = 50 - strokeWidth * 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference
  
  return (
    <div className={cn("relative flex items-center justify-center", currentSize.container, className)}>
      <svg className={cn("transform -rotate-90", currentSize.svg)} viewBox="0 0 100 100">
        {colorScheme === "gradient" && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-secondary, var(--color-primary))" />
            </linearGradient>
          </defs>
        )}
        
        {/* Círculo de fondo */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={currentColorScheme.track}
        />
        
        {/* Círculo de progreso */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animate ? 1 : 0, ease: "easeOut" }}
          className={currentColorScheme.progress}
          strokeLinecap="round"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", currentSize.text, currentColorScheme.text)}>
            {displayValue}
            <span className="text-sm font-normal ml-0.5">{unit}</span>
          </span>
          {label && (
            <span className={cn("text-muted-foreground mt-1", currentSize.label)}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
