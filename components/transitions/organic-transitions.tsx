"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import useIsomorphicLayoutEffect from "@/lib/use-isomorphic-layout-effect"

// Create static fallback components
const StaticDiv = ({ className, children }: {
  className?: string,
  children?: React.ReactNode
}) => (
  <div className={className}>{children}</div>
);

// Simple wrapper that just renders children
const StaticAnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Use a completely different approach to avoid webpack issues
// Create non-dynamic components first that will be used during SSR and initial render
const NonDynamicDiv = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>{children}</div>
);

const NonDynamicAnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Then create the dynamic components with noSSR option
const MotionDiv = dynamic(
  () => new Promise((resolve) => {
    // Delay import to ensure it only happens in browser
    if (typeof window !== 'undefined') {
      import("framer-motion")
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.div === 'function') {
            resolve(mod.motion.div);
          } else {
            resolve(NonDynamicDiv);
          }
        })
        .catch(() => resolve(NonDynamicDiv));
    } else {
      resolve(NonDynamicDiv);
    }
  }),
  { ssr: false, loading: () => <NonDynamicDiv /> }
);

const AnimatePresence = dynamic(
  () => new Promise((resolve) => {
    // Delay import to ensure it only happens in browser
    if (typeof window !== 'undefined') {
      import("framer-motion")
        .then((mod) => {
          if (mod && typeof mod.AnimatePresence === 'function') {
            resolve(mod.AnimatePresence);
          } else {
            resolve(NonDynamicAnimatePresence);
          }
        })
        .catch(() => resolve(NonDynamicAnimatePresence));
    } else {
      resolve(NonDynamicAnimatePresence);
    }
  }),
  { ssr: false, loading: () => <NonDynamicAnimatePresence /> }
);

interface OrganicTransitionProps {
  children: React.ReactNode
  className?: string
}

export function OrganicPageTransition({ children, className }: OrganicTransitionProps) {
  const pathname = usePathname()
  const { animation } = useOrganicTheme()
  // Use a key to force re-render of the motion component
  const [key, setKey] = useState(`${pathname}-0`)

  // Use isomorphic layout effect to avoid SSR warnings
  useIsomorphicLayoutEffect(() => {
    // Update key on client-side only to avoid hydration mismatch
    setKey(`${pathname}-1`)
  }, [pathname])

  // Diferentes variantes de animación según el nivel seleccionado
  const getTransitionProps = () => {
    switch (animation) {
      case "none":
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 }
        }
      case "subtle":
        return {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
          transition: {
            duration: 0.4,
            ease: [0.43, 0.13, 0.23, 0.96] // Transición spring-organic
          }
        }
      case "playful":
        return {
          initial: { opacity: 0, scale: 0.97, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 1.03, y: -20 },
          transition: {
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1], // Transición bounce-organic
            scale: { type: "spring", stiffness: 300, damping: 20 }
          }
        }
      default:
        return {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
          transition: { duration: 0.4 }
        }
    }
  }

  const transitionProps = getTransitionProps()

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // If animations are disabled or we're not in a browser, render without animation
  if (animation === "none" || !isBrowser) {
    return <div className={cn("min-h-screen", className)}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key={key}
        initial={transitionProps.initial}
        animate={transitionProps.animate}
        exit={transitionProps.exit}
        transition={transitionProps.transition}
        className={cn("min-h-screen", className)}
      >
        {children}
      </MotionDiv>
    </AnimatePresence>
  )
}

// Componente de transición para elementos individuales
interface OrganicElementTransitionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  type?: "fade" | "slide" | "scale" | "card"
}

export function OrganicElement({
  children,
  className,
  delay = 0,
  duration = 0.5,
  type = "fade"
}: OrganicElementTransitionProps) {
  const { animation } = useOrganicTheme()

  // No animar si las animaciones están desactivadas
  if (animation === "none") {
    return <div className={className}>{children}</div>
  }

  // Configurar la animación según el tipo
  const getAnimationProps = () => {
    const isPlayful = animation === "playful"
    const transitionEase = isPlayful
      ? [0.34, 1.56, 0.64, 1] // bounce-organic
      : [0.43, 0.13, 0.23, 0.96] // spring-organic

    switch (type) {
      case "fade":
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: isPlayful ? duration * 1.2 : duration,
            delay,
            ease: transitionEase
          }
        }
      case "slide":
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          transition: {
            duration: isPlayful ? duration * 1.2 : duration,
            delay,
            ease: transitionEase
          }
        }
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: {
            duration: isPlayful ? duration * 1.2 : duration,
            delay,
            ease: transitionEase,
            scale: isPlayful ? { type: "spring", stiffness: 300, damping: 20 } : undefined
          }
        }
      case "card":
        return {
          initial: { opacity: 0, scale: 0.95, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: {
            duration: isPlayful ? duration * 1.2 : duration,
            delay,
            ease: transitionEase,
            scale: isPlayful ? { type: "spring", stiffness: 300, damping: 20 } : undefined
          }
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration, delay }
        }
    }
  }

  const animationProps = getAnimationProps()

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // If we're not in a browser, render without animation
  if (!isBrowser) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionDiv
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}

// Componente para animar una lista de elementos
interface OrganicStaggeredListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
}

export function OrganicStaggeredList({
  children,
  className,
  itemClassName,
  staggerDelay = 0.1,
  duration = 0.5,
  direction = "up"
}: OrganicStaggeredListProps) {
  const { animation } = useOrganicTheme()

  // No animar si las animaciones están desactivadas
  if (animation === "none") {
    return (
      <div className={className}>
        {children.map((child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    )
  }

  const isPlayful = animation === "playful"
  const transitionEase = isPlayful
    ? [0.34, 1.56, 0.64, 1] // bounce-organic
    : [0.43, 0.13, 0.23, 0.96] // spring-organic

  // Configurar la dirección de la animación
  const getDirectionVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }
      case "down":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 }
        }
      case "left":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 }
        }
      case "right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 }
        }
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }
    }
  }

  const directionVariants = getDirectionVariants()

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
    hidden: directionVariants.hidden,
    visible: {
      ...directionVariants.visible,
      transition: {
        duration: isPlayful ? duration * 1.2 : duration,
        ease: transitionEase,
        type: isPlayful ? "spring" : "tween",
        stiffness: isPlayful ? 300 : undefined,
        damping: isPlayful ? 20 : undefined
      }
    }
  }

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // If we're not in a browser, render without animation
  if (!isBrowser) {
    return (
      <div className={className}>
        {children.map((child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <MotionDiv key={index} variants={itemVariants} className={itemClassName}>
          {child}
        </MotionDiv>
      ))}
    </MotionDiv>
  )
}
