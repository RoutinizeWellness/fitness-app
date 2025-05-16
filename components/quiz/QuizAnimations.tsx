"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"

// Animation variants for different transitions
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const slideInRightVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const slideInLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

const slideInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const slideInDownVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

const rotateInVariants = {
  hidden: { opacity: 0, rotate: -5, scale: 0.95 },
  visible: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 5, scale: 0.95 }
}

// Animation durations
const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5
}

// Animation types
type AnimationType = 
  | "fade" 
  | "slideRight" 
  | "slideLeft" 
  | "slideUp" 
  | "slideDown" 
  | "scale" 
  | "rotate"

// Animation speed
type AnimationSpeed = "fast" | "normal" | "slow"

// Props for the animated container
interface AnimatedContainerProps {
  children: ReactNode
  type?: AnimationType
  speed?: AnimationSpeed
  delay?: number
  className?: string
  key?: string | number
}

// Animated container component
export function AnimatedContainer({
  children,
  type = "fade",
  speed = "normal",
  delay = 0,
  className = "",
  key
}: AnimatedContainerProps) {
  // Select animation variant based on type
  const getVariant = () => {
    switch (type) {
      case "fade": return fadeInVariants
      case "slideRight": return slideInRightVariants
      case "slideLeft": return slideInLeftVariants
      case "slideUp": return slideInUpVariants
      case "slideDown": return slideInDownVariants
      case "scale": return scaleInVariants
      case "rotate": return rotateInVariants
      default: return fadeInVariants
    }
  }

  // Get animation duration based on speed
  const getDuration = () => durations[speed] || durations.normal

  return (
    <motion.div
      key={key}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={getVariant()}
      transition={{ 
        duration: getDuration(), 
        delay,
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Props for the animated transition
interface AnimatedTransitionProps {
  children: ReactNode
  isVisible: boolean
  type?: AnimationType
  speed?: AnimationSpeed
  delay?: number
  className?: string
}

// Animated transition component with AnimatePresence
export function AnimatedTransition({
  children,
  isVisible,
  type = "fade",
  speed = "normal",
  delay = 0,
  className = ""
}: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <AnimatedContainer
          type={type}
          speed={speed}
          delay={delay}
          className={className}
          key="animated-transition"
        >
          {children}
        </AnimatedContainer>
      )}
    </AnimatePresence>
  )
}

// Props for the quiz step transition
interface QuizStepTransitionProps {
  children: ReactNode
  step: number
  direction?: "forward" | "backward"
  className?: string
}

// Quiz step transition component
export function QuizStepTransition({
  children,
  step,
  direction = "forward",
  className = ""
}: QuizStepTransitionProps) {
  const getAnimationType = (): AnimationType => {
    if (direction === "forward") {
      return "slideRight"
    } else {
      return "slideLeft"
    }
  }

  return (
    <AnimatePresence mode="wait">
      <AnimatedContainer
        key={step}
        type={getAnimationType()}
        speed="normal"
        className={className}
      >
        {children}
      </AnimatedContainer>
    </AnimatePresence>
  )
}

// Props for the results animation
interface ResultsAnimationProps {
  children: ReactNode
  isVisible: boolean
  className?: string
}

// Results animation component
export function ResultsAnimation({
  children,
  isVisible,
  className = ""
}: ResultsAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <AnimatedContainer
          key="results"
          type="scale"
          speed="slow"
          className={className}
        >
          {children}
        </AnimatedContainer>
      )}
    </AnimatePresence>
  )
}

// Props for the paywall animation
interface PaywallAnimationProps {
  children: ReactNode
  isVisible: boolean
  className?: string
}

// Paywall animation component
export function PaywallAnimation({
  children,
  isVisible,
  className = ""
}: PaywallAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <AnimatedContainer
          key="paywall"
          type="slideUp"
          speed="normal"
          className={className}
        >
          {children}
        </AnimatedContainer>
      )}
    </AnimatePresence>
  )
}

// Staggered animation for list items
interface StaggeredListProps {
  children: ReactNode[]
  isVisible: boolean
  staggerDelay?: number
  className?: string
  itemClassName?: string
}

export function StaggeredList({
  children,
  isVisible,
  staggerDelay = 0.1,
  className = "",
  itemClassName = ""
}: StaggeredListProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div className={className}>
          {children.map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                delay: index * staggerDelay,
                duration: 0.3
              }}
              className={itemClassName}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Pulse animation component
interface PulseAnimationProps {
  children: ReactNode
  isAnimating: boolean
  className?: string
}

export function PulseAnimation({
  children,
  isAnimating,
  className = ""
}: PulseAnimationProps) {
  return (
    <motion.div
      animate={
        isAnimating 
          ? { 
              scale: [1, 1.05, 1],
              transition: { 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop"
              }
            } 
          : {}
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Loading animation component
interface LoadingAnimationProps {
  isLoading: boolean
  className?: string
}

export function LoadingAnimation({
  isLoading,
  className = ""
}: LoadingAnimationProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`flex justify-center items-center ${className}`}
        >
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { 
                duration: 1, 
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
