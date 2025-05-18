"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverEffect?: "lift" | "glow" | "border" | "none"
  clickEffect?: boolean
  className?: string
}

export function EnhancedCard({
  children,
  hoverEffect = "lift",
  clickEffect = true,
  className,
  ...props
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Configuración de efectos
  const hoverStyles = {
    lift: {
      rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
      hover: { y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" },
    },
    glow: {
      rest: { boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
      hover: { boxShadow: "0 0 15px rgba(var(--primary), 0.3)" },
    },
    border: {
      rest: { borderColor: "rgba(var(--border), 0.5)" },
      hover: { borderColor: "rgba(var(--primary), 1)" },
    },
    none: {
      rest: {},
      hover: {},
    },
  }

  const currentEffect = hoverStyles[hoverEffect]

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card text-card-foreground p-4 transition-colors",
        className
      )}
      initial="rest"
      animate={isHovered ? "hover" : "rest"}
      whileTap={clickEffect ? { scale: 0.98 } : undefined}
      variants={currentEffect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function EnhancedCardHeader({
  children,
  className,
  ...props
}: EnhancedCardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface EnhancedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export function EnhancedCardTitle({
  children,
  className,
  ...props
}: EnhancedCardTitleProps) {
  return (
    <h3
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

interface EnhancedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export function EnhancedCardDescription({
  children,
  className,
  ...props
}: EnhancedCardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface EnhancedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function EnhancedCardContent({
  children,
  className,
  ...props
}: EnhancedCardContentProps) {
  return (
    <div className={cn("p-2 pt-0", className)} {...props}>
      {children}
    </div>
  )
}

interface EnhancedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function EnhancedCardFooter({
  children,
  className,
  ...props
}: EnhancedCardFooterProps) {
  return (
    <div
      className={cn("flex items-center p-2 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}
