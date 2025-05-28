"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { OrganicPageTransition } from "./organic-transitions"
import useIsomorphicLayoutEffect from "@/lib/use-isomorphic-layout-effect"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  useOrganic?: boolean
}

export function PageTransition({
  children,
  className,
  useOrganic = true
}: PageTransitionProps) {
  // Usar la transición orgánica por defecto
  if (useOrganic) {
    return <OrganicPageTransition className={className}>{children}</OrganicPageTransition>
  }

  // Transición clásica como fallback
  const pathname = usePathname()
  // Use a key to force re-render of the motion component
  const [key, setKey] = useState(`${pathname}-0`)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only to avoid hydration mismatch
    setKey(`${pathname}-1`)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn("min-h-screen", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Variante con transición de deslizamiento
export function SlidePageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  // Use a key to force re-render of the motion component
  const [key, setKey] = useState(`${pathname}-0`)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only to avoid hydration mismatch
    setKey(`${pathname}-1`)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={cn("min-h-screen", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Variante con transición de escala
export function ScalePageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  // Use a key to force re-render of the motion component
  const [key, setKey] = useState(`${pathname}-0`)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only to avoid hydration mismatch
    setKey(`${pathname}-1`)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={cn("min-h-screen", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Transición con indicador de carga
export function LoadingPageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  // Use a key to force re-render of the motion component
  const [key, setKey] = useState(`${pathname}-0`)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only to avoid hydration mismatch
    setKey(`${pathname}-1`)

    setIsLoading(true)

    // Simular tiempo de carga
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex items-center justify-center"
          >
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("min-h-screen", className)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// Componente de transición para elementos individuales
interface ElementTransitionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeInElement({
  children,
  className,
  delay = 0,
  duration = 0.5
}: ElementTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Componente para animar una lista de elementos
interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
  duration?: number
}

export function StaggeredList({
  children,
  className,
  itemClassName,
  staggerDelay = 0.1,
  duration = 0.5
}: StaggeredListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Componente para animar la entrada de una tarjeta
export function CardEntrance({
  children,
  className,
  delay = 0,
  duration = 0.5
}: ElementTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration,
        delay,
        type: "spring",
        stiffness: 100
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
