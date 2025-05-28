"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import useIsomorphicLayoutEffect from "@/lib/use-isomorphic-layout-effect"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  // Use a key to force re-render of the motion component
  const [key, setKey] = React.useState(0)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only
    setKey(1)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
