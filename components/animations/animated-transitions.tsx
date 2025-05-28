"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { shouldEnableAnimations } from "@/lib/animation-utils"
import { 
  MotionDiv, 
  MotionUl, 
  MotionLi, 
  AnimatePresence, 
  useAnimationsReady 
} from "@/components/animations/safe-motion"

// Base animated element
interface AnimatedElementProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  variants?: any
  initial?: string | object
  animate?: string | object
  exit?: string | object
  transition?: object
}

export function AnimatedElement({
  children,
  className,
  delay = 0,
  duration = 0.5,
  variants,
  initial = "hidden",
  animate = "visible",
  exit,
  transition,
  ...props
}: AnimatedElementProps & React.HTMLAttributes<HTMLDivElement>) {
  const isReady = useAnimationsReady()
  
  // If animations aren't ready or enabled, render a static div
  if (!isReady || !shouldEnableAnimations()) {
    return <div className={className} {...props}>{children}</div>
  }
  
  // Default transition
  const defaultTransition = {
    duration,
    delay,
    ease: "easeOut",
    ...transition
  }
  
  // Default variants
  const defaultVariants = variants || {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  return (
    <MotionDiv
      className={className}
      initial={initial}
      animate={animate}
      exit={exit}
      variants={defaultVariants}
      transition={defaultTransition}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Staggered list animation
interface AnimatedStaggeredListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  childClassName?: string
  childVariants?: any
  listVariants?: any
  initial?: string | object
  animate?: string | object
  exit?: string | object
}

export function AnimatedStaggeredList({
  children,
  className,
  staggerDelay = 0.1,
  childClassName,
  childVariants,
  listVariants,
  initial = "hidden",
  animate = "visible",
  exit,
  ...props
}: AnimatedStaggeredListProps & React.HTMLAttributes<HTMLUListElement>) {
  const isReady = useAnimationsReady()
  
  // If animations aren't ready or enabled, render a static list
  if (!isReady || !shouldEnableAnimations()) {
    return (
      <ul className={className} {...props}>
        {React.Children.map(children, (child, index) => (
          <li key={index} className={childClassName}>
            {child}
          </li>
        ))}
      </ul>
    )
  }
  
  // Default variants for the list container
  const defaultListVariants = listVariants || {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }
  
  // Default variants for each child
  const defaultChildVariants = childVariants || {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  return (
    <MotionUl
      className={className}
      initial={initial}
      animate={animate}
      exit={exit}
      variants={defaultListVariants}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <MotionLi key={index} className={childClassName} variants={defaultChildVariants}>
          {child}
        </MotionLi>
      ))}
    </MotionUl>
  )
}

// Fade animation
interface AnimatedFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  initial?: string | object
  animate?: string | object
  exit?: string | object
}

export function AnimatedFade({
  children,
  className,
  delay = 0,
  duration = 0.5,
  initial = "hidden",
  animate = "visible",
  exit,
  ...props
}: AnimatedFadeProps & React.HTMLAttributes<HTMLDivElement>) {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  return (
    <AnimatedElement
      className={className}
      delay={delay}
      duration={duration}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      {...props}
    >
      {children}
    </AnimatedElement>
  )
}

// Slide animation
interface AnimatedSlideProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  delay?: number
  duration?: number
  initial?: string | object
  animate?: string | object
  exit?: string | object
}

export function AnimatedSlide({
  children,
  className,
  direction = "up",
  distance = 50,
  delay = 0,
  duration = 0.5,
  initial = "hidden",
  animate = "visible",
  exit,
  ...props
}: AnimatedSlideProps & React.HTMLAttributes<HTMLDivElement>) {
  // Create variants based on direction
  const getVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 }
        }
      case "down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 }
        }
      case "left":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 }
        }
      case "right":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 }
        }
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 }
        }
    }
  }
  
  return (
    <AnimatedElement
      className={className}
      delay={delay}
      duration={duration}
      variants={getVariants()}
      initial={initial}
      animate={animate}
      exit={exit}
      {...props}
    >
      {children}
    </AnimatedElement>
  )
}

// Scale animation
interface AnimatedScaleProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  initial?: string | object
  animate?: string | object
  exit?: string | object
}

export function AnimatedScale({
  children,
  className,
  delay = 0,
  duration = 0.5,
  initial = "hidden",
  animate = "visible",
  exit,
  ...props
}: AnimatedScaleProps & React.HTMLAttributes<HTMLDivElement>) {
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }
  
  return (
    <AnimatedElement
      className={className}
      delay={delay}
      duration={duration}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      {...props}
    >
      {children}
    </AnimatedElement>
  )
}

// Page transition
interface AnimatedPageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedPageTransition({
  children,
  className
}: AnimatedPageTransitionProps) {
  const isReady = useAnimationsReady()
  
  // If animations aren't ready or enabled, render children directly
  if (!isReady || !shouldEnableAnimations()) {
    return <div className={cn("w-full", className)}>{children}</div>
  }
  
  return (
    <AnimatePresence mode="wait">
      <AnimatedFade
        className={cn("w-full", className)}
        duration={0.3}
      >
        {children}
      </AnimatedFade>
    </AnimatePresence>
  )
}
