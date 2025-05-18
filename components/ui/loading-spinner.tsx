"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "secondary" | "ghost"
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = "md",
  variant = "primary",
  message,
  fullScreen = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4"
  }

  const variantClasses = {
    default: "border-gray-300 border-t-gray-600",
    primary: "border-[#FFF3E9] border-t-[#FDA758]",
    secondary: "border-gray-200 border-t-[#573353]",
    ghost: "border-gray-100 border-t-gray-400"
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center"

  return (
    <div
      className={cn(
        containerClasses,
        className
      )}
      {...props}
    >
      <div className="relative">
        <motion.div
          className={cn(
            "rounded-full border animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {message && (
        <p className={cn(
          "mt-4 text-center font-medium",
          {
            "text-xs": size === "sm",
            "text-sm": size === "md",
            "text-base": size === "lg",
            "text-lg": size === "xl",
            "text-[#573353]": variant === "primary" || variant === "secondary",
            "text-gray-600": variant === "default" || variant === "ghost"
          }
        )}>
          {message}
        </p>
      )}
    </div>
  )
}
