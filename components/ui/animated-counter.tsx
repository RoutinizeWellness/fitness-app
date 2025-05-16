"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
  delay?: number
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className,
  formatter = (value) => value.toString(),
  delay = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const elementRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Simple visibility check function
    const isElementVisible = () => {
      if (!elementRef.current) return false
      const rect = elementRef.current.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    }

    // Only animate once
    if (hasAnimated.current) return

    // Check if element is visible
    if (!isElementVisible()) {
      // If not visible, set up a scroll listener
      const handleScroll = () => {
        if (isElementVisible() && !hasAnimated.current) {
          startAnimation()
          hasAnimated.current = true
          window.removeEventListener('scroll', handleScroll)
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      // If already visible, start animation
      startAnimation()
      hasAnimated.current = true
    }
  }, [value, duration, delay])

  // Function to start the animation
  const startAnimation = () => {
    // Delay the animation if needed
    const delayTimeout = setTimeout(() => {
      const start = 0
      const end = value
      const startTime = performance.now()

      const animateCount = (timestamp: number) => {
        const runtime = timestamp - startTime
        const relativeProgress = runtime / duration

        if (relativeProgress < 1) {
          const currentCount = Math.floor(start + (end - start) * easeOutQuart(relativeProgress))
          countRef.current = currentCount
          setCount(currentCount)
          requestAnimationFrame(animateCount)
        } else {
          countRef.current = end
          setCount(end)
        }
      }

      requestAnimationFrame(animateCount)
    }, delay)

    return () => clearTimeout(delayTimeout)
  }

  // Easing function for smoother animation
  const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4)
  }

  return (
    <span ref={elementRef} className={cn("tabular-nums", className)}>
      {formatter(count)}
    </span>
  )
}
