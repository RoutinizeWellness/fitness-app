"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardProps } from "@/components/ui/card"

export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: "lift" | "scale" | "glow" | "none"
  delay?: number
  duration?: number
  cardProps?: CardProps
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "none",
  delay = 0,
  duration = 0.3,
  cardProps,
  ...props
}: AnimatedCardProps) {
  // Define hover animations
  const hoverAnimations = {
    lift: {
      rest: { y: 0 },
      hover: { y: -8, transition: { duration: 0.3, ease: "easeOut" } }
    },
    scale: {
      rest: { scale: 1 },
      hover: { scale: 1.03, transition: { duration: 0.3, ease: "easeOut" } }
    },
    glow: {
      rest: { boxShadow: "0 0 0 rgba(66, 153, 225, 0)" },
      hover: { 
        boxShadow: "0 0 20px rgba(66, 153, 225, 0.5)",
        transition: { duration: 0.3, ease: "easeOut" }
      }
    },
    none: {
      rest: {},
      hover: {}
    }
  }

  // Initial animation when component mounts
  const initialAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration, 
        delay,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={initialAnimation}
      className={cn("w-full", className)}
      {...props}
    >
      <motion.div
        initial="rest"
        whileHover="hover"
        variants={hoverAnimations[hoverEffect]}
        className="h-full"
      >
        <Card className="h-full" {...cardProps}>
          {children}
        </Card>
      </motion.div>
    </motion.div>
  )
}
