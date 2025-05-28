"use client"

import React from "react"
import { cn } from "@/lib/utils"

// This is a static version of the transitions component without any animations or framer-motion dependencies

interface StaticTransitionProps {
  children: React.ReactNode
  className?: string
}

export function StaticElement({ children, className }: StaticTransitionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface StaticStaggeredListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaticStaggeredList({ 
  children, 
  className,
  staggerDelay = 0.05 
}: StaticStaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div key={index}>
          {child}
        </div>
      ))}
    </div>
  )
}

interface StaticFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function StaticFade({
  children,
  className,
  delay = 0,
  duration = 0.3
}: StaticFadeProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface StaticSlideProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  delay?: number
  duration?: number
}

export function StaticSlide({
  children,
  className,
  direction = "up",
  distance = 20,
  delay = 0,
  duration = 0.3
}: StaticSlideProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface StaticScaleProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function StaticScale({
  children,
  className,
  delay = 0,
  duration = 0.3
}: StaticScaleProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface StaticPageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function StaticPageTransition({
  children,
  className
}: StaticPageTransitionProps) {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

// Export all static transitions with the same names as the original components
export {
  StaticElement as OrganicElement,
  StaticStaggeredList as OrganicStaggeredList,
  StaticFade as OrganicFade,
  StaticSlide as OrganicSlide,
  StaticScale as OrganicScale,
  StaticPageTransition as OrganicPageTransition
}
