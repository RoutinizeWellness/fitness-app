"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  backgroundColor?: string
  progressColor?: string
  showPercentage?: boolean
  animate?: boolean
  duration?: number
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  backgroundColor = "rgba(0, 0, 0, 0.1)",
  progressColor = "hsl(var(--primary))",
  showPercentage = true,
  animate = true,
  duration = 1000,
  children,
}: ProgressRingProps) {
  const [progress, setProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  useEffect(() => {
    if (!animate) {
      setProgress(value)
      return
    }

    const startTime = performance.now()
    const startValue = progress

    const animateProgress = (timestamp: number) => {
      const runtime = timestamp - startTime
      const relativeProgress = Math.min(runtime / duration, 1)

      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - relativeProgress, 3)

      const currentProgress = startValue + (value - startValue) * easedProgress
      setProgress(currentProgress)

      if (relativeProgress < 1) {
        requestAnimationFrame(animateProgress)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [value, animate, duration])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={backgroundColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? children : showPercentage && <span className="text-xl font-semibold">{Math.round(progress)}%</span>}
      </div>
    </div>
  )
}
