"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  confettiConfig?: {
    particleCount?: number
    spread?: number
    origin?: { x: number; y: number }
    colors?: string[]
    angle?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    shapes?: ("square" | "circle")[]
    scalar?: number
  }
}

export function ConfettiButton({
  children,
  className,
  variant = "default",
  size = "default",
  confettiConfig,
  onClick,
  ...props
}: ConfettiButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger confetti
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    const defaultConfig = {
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"],
      angle: 90,
      startVelocity: 30,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      ticks: 200,
      shapes: ["circle", "square"],
      scalar: 1,
    }

    const config = { ...defaultConfig, ...confettiConfig }
    confetti(config)

    // Add animation to button
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Button
      className={cn(isAnimating && "animate-pulse", className)}
      variant={variant}
      size={size}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
}
