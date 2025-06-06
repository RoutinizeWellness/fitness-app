"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import dynamic from "next/dynamic"

// Create a fallback button component
const StaticButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string,
    children?: React.ReactNode
  }
>((props, ref) => (
  <button ref={ref} {...props}>
    {props.children}
  </button>
));
StaticButton.displayName = "StaticButton";

// Use a completely different approach to avoid webpack issues
// Create a non-dynamic button component that will be used during SSR and initial render
const NonDynamicButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string,
    children?: React.ReactNode
  }
>((props, ref) => (
  <button ref={ref} {...props}>
    {props.children}
  </button>
));
NonDynamicButton.displayName = "NonDynamicButton";

// Then create the dynamic component with noSSR option
const MotionButton = dynamic(
  () => new Promise((resolve) => {
    // Delay import to ensure it only happens in browser
    if (typeof window !== 'undefined') {
      import("framer-motion")
        .then((mod) => {
          if (mod && mod.motion && typeof mod.motion.button === 'function') {
            resolve(mod.motion.button);
          } else {
            resolve(NonDynamicButton);
          }
        })
        .catch(() => resolve(NonDynamicButton));
    } else {
      resolve(NonDynamicButton);
    }
  }),
  {
    ssr: false,
    loading: () => <NonDynamicButton />
  }
);

const fabVariants = cva(
  "inline-flex items-center justify-center rounded-full shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:shadow-soft-md",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-soft-md",
        destructive: "bg-destructive text-destructive-foreground hover:shadow-soft-md",
        outline: "border-2 border-primary bg-background text-foreground hover:bg-primary/10 hover:shadow-soft-md",
        ghost: "bg-transparent text-foreground hover:bg-primary/10",
        glass: "glass-organic text-foreground hover:shadow-soft-md",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-soft-md",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-10 w-10",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-organic",
        float: "animate-float-organic",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center" | "center"
  offset?: number
  showLabel?: boolean
  label?: string
  labelPosition?: "left" | "right" | "top" | "bottom"
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({
    className,
    variant,
    size,
    animation,
    icon,
    position = "bottom-right",
    offset = 4,
    showLabel = false,
    label = "",
    labelPosition = "left",
    ...props
  }, ref) => {
    const { animation: themeAnimation } = useOrganicTheme()

    // Si las animaciones están desactivadas en el tema, no animar
    const effectiveAnimation = themeAnimation === "none" ? "none" : animation

    // Determinar las clases de posición
    const getPositionClasses = () => {
      switch (position) {
        case "bottom-right":
          return `fixed bottom-${offset} right-${offset}`
        case "bottom-left":
          return `fixed bottom-${offset} left-${offset}`
        case "bottom-center":
          return `fixed bottom-${offset} left-1/2 -translate-x-1/2`
        case "top-right":
          return `fixed top-${offset} right-${offset}`
        case "top-left":
          return `fixed top-${offset} left-${offset}`
        case "top-center":
          return `fixed top-${offset} left-1/2 -translate-x-1/2`
        case "center":
          return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        default:
          return `fixed bottom-${offset} right-${offset}`
      }
    }

    // Determinar las clases para la etiqueta
    const getLabelClasses = () => {
      const baseClasses = "absolute bg-background text-foreground px-3 py-1 rounded-full shadow-soft whitespace-nowrap"

      switch (labelPosition) {
        case "left":
          return `${baseClasses} right-full mr-3`
        case "right":
          return `${baseClasses} left-full ml-3`
        case "top":
          return `${baseClasses} bottom-full mb-3 left-1/2 -translate-x-1/2`
        case "bottom":
          return `${baseClasses} top-full mt-3 left-1/2 -translate-x-1/2`
        default:
          return `${baseClasses} right-full mr-3`
      }
    }

    // Animación al hacer hover
    const buttonVariants = {
      hover: {
        scale: 1.05,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
      },
      tap: {
        scale: 0.95
      }
    }

    // Determine if we should use animations based on browser environment
    const isBrowser = typeof window !== 'undefined';
    const shouldUseAnimations = isBrowser && effectiveAnimation !== 'none';

    // Common props for both button types
    const commonProps = {
      ref,
      className: cn(
        fabVariants({ variant, size, animation: effectiveAnimation }),
        getPositionClasses(),
        "z-50",
        className
      ),
      ...props
    };

    // Common children for both button types
    const buttonChildren = (
      <>
        {icon}
        {showLabel && label && (
          <span className={getLabelClasses()}>
            {label}
          </span>
        )}
      </>
    );

    // Always use NonDynamicButton during SSR
    if (!isBrowser) {
      return (
        <NonDynamicButton {...commonProps}>
          {buttonChildren}
        </NonDynamicButton>
      );
    }

    // Use static button when animations are disabled
    if (!shouldUseAnimations) {
      return (
        <NonDynamicButton {...commonProps}>
          {buttonChildren}
        </NonDynamicButton>
      );
    }

    // Use motion button with animations when in browser and animations are enabled
    return (
      <MotionButton
        {...commonProps}
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
      >
        {buttonChildren}
      </MotionButton>
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton, fabVariants }
