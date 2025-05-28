"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { shouldEnableAnimations } from '@/lib/animation-utils'

// Static fallback components
const StaticDiv = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />)
StaticDiv.displayName = "StaticDiv"

const StaticButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => <button ref={ref} {...props} />)
StaticButton.displayName = "StaticButton"

const StaticSpan = React.forwardRef<
  HTMLSpanElement,
  React.HTMLSpanElement & React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => <span ref={ref} {...props} />)
StaticSpan.displayName = "StaticSpan"

const StaticUl = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>((props, ref) => <ul ref={ref} {...props} />)
StaticUl.displayName = "StaticUl"

const StaticLi = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>((props, ref) => <li ref={ref} {...props} />)
StaticLi.displayName = "StaticLi"

// Static AnimatePresence component
const StaticAnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>

// Dynamic imports with proper error handling
const MotionDiv = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.div === 'function') {
            resolve(mod.motion.div)
          } else {
            resolve(StaticDiv)
          }
        })
        .catch(() => resolve(StaticDiv))
    } else {
      resolve(StaticDiv)
    }
  }),
  { ssr: false, loading: () => <StaticDiv /> }
)

const MotionButton = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.button === 'function') {
            resolve(mod.motion.button)
          } else {
            resolve(StaticButton)
          }
        })
        .catch(() => resolve(StaticButton))
    } else {
      resolve(StaticButton)
    }
  }),
  { ssr: false, loading: () => <StaticButton /> }
)

const MotionSpan = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.span === 'function') {
            resolve(mod.motion.span)
          } else {
            resolve(StaticSpan)
          }
        })
        .catch(() => resolve(StaticSpan))
    } else {
      resolve(StaticSpan)
    }
  }),
  { ssr: false, loading: () => <StaticSpan /> }
)

const MotionUl = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.ul === 'function') {
            resolve(mod.motion.ul)
          } else {
            resolve(StaticUl)
          }
        })
        .catch(() => resolve(StaticUl))
    } else {
      resolve(StaticUl)
    }
  }),
  { ssr: false, loading: () => <StaticUl /> }
)

const MotionLi = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.li === 'function') {
            resolve(mod.motion.li)
          } else {
            resolve(StaticLi)
          }
        })
        .catch(() => resolve(StaticLi))
    } else {
      resolve(StaticLi)
    }
  }),
  { ssr: false, loading: () => <StaticLi /> }
)

const AnimatePresenceComponent = dynamic(
  () => new Promise((resolve) => {
    if (typeof window !== 'undefined' && shouldEnableAnimations()) {
      import('framer-motion')
        .then((mod) => {
          if (mod && typeof mod.AnimatePresence === 'function') {
            resolve(mod.AnimatePresence)
          } else {
            resolve(StaticAnimatePresence)
          }
        })
        .catch(() => resolve(StaticAnimatePresence))
    } else {
      resolve(StaticAnimatePresence)
    }
  }),
  { ssr: false, loading: () => <StaticAnimatePresence /> }
)

// Export the components
export {
  MotionDiv,
  MotionButton,
  MotionSpan,
  MotionUl,
  MotionLi,
  AnimatePresenceComponent as AnimatePresence
}

// Helper hook to check if animations are loaded and ready
export function useAnimationsReady() {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if animations should be enabled
      if (!shouldEnableAnimations()) {
        setIsReady(true)
        return
      }
      
      // Try to load framer-motion
      import('framer-motion')
        .then(() => setIsReady(true))
        .catch(() => setIsReady(true)) // Still mark as ready even if it fails, we'll use fallbacks
    }
  }, [])
  
  return isReady
}
