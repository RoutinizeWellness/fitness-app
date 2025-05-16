"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OrganicCardProps {
  children: ReactNode
  className?: string
  backgroundColor?: string
  darkMode?: boolean
  animate?: boolean
  onClick?: () => void
}

export function OrganicCard({
  children,
  className,
  backgroundColor = "amber",
  darkMode = false,
  animate = false,
  onClick
}: OrganicCardProps) {
  // Obtener el color de fondo
  const getBgColor = () => {
    switch (backgroundColor) {
      case "amber":
        return darkMode ? "bg-amber-900/20" : "bg-amber-50"
      case "blue":
        return darkMode ? "bg-blue-900/20" : "bg-blue-50"
      case "green":
        return darkMode ? "bg-green-900/20" : "bg-green-50"
      case "purple":
        return darkMode ? "bg-purple-900/20" : "bg-purple-50"
      case "gray":
        return darkMode ? "bg-gray-800" : "bg-gray-100"
      default:
        return darkMode ? "bg-amber-900/20" : "bg-amber-50"
    }
  }
  
  const CardComponent = animate ? motion.div : "div"
  
  const animationProps = animate
    ? {
        whileHover: { y: -5 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 300 }
      }
    : {}
  
  return (
    <CardComponent
      className={cn(
        "rounded-[32px] p-6 shadow-sm",
        getBgColor(),
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </CardComponent>
  )
}

interface OrganicCardHeaderProps {
  children: ReactNode
  className?: string
}

export function OrganicCardHeader({
  children,
  className
}: OrganicCardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

interface OrganicCardTitleProps {
  children: ReactNode
  className?: string
}

export function OrganicCardTitle({
  children,
  className
}: OrganicCardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold", className)}>
      {children}
    </h3>
  )
}

interface OrganicCardDescriptionProps {
  children: ReactNode
  className?: string
}

export function OrganicCardDescription({
  children,
  className
}: OrganicCardDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
      {children}
    </p>
  )
}

interface OrganicCardContentProps {
  children: ReactNode
  className?: string
}

export function OrganicCardContent({
  children,
  className
}: OrganicCardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface OrganicCardFooterProps {
  children: ReactNode
  className?: string
}

export function OrganicCardFooter({
  children,
  className
}: OrganicCardFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center", className)}>
      {children}
    </div>
  )
}

interface OrganicCardBadgeProps {
  children: ReactNode
  className?: string
  color?: string
}

export function OrganicCardBadge({
  children,
  className,
  color = "amber"
}: OrganicCardBadgeProps) {
  // Obtener el color del badge
  const getBadgeColor = () => {
    switch (color) {
      case "amber":
        return "bg-amber-100 text-amber-800"
      case "blue":
        return "bg-blue-100 text-blue-800"
      case "green":
        return "bg-green-100 text-green-800"
      case "purple":
        return "bg-purple-100 text-purple-800"
      case "gray":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-amber-100 text-amber-800"
    }
  }
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      getBadgeColor(),
      className
    )}>
      {children}
    </span>
  )
}
