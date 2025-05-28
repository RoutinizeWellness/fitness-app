"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// This is a static version of the floating action button without any animations or framer-motion dependencies

const fabVariants = cva(
  "inline-flex items-center justify-center rounded-full shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:opacity-90",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-10 w-10",
        lg: "h-16 w-16",
        icon: "h-10 w-10",
      },
      position: {
        "bottom-right": "fixed bottom-6 right-6",
        "bottom-center": "fixed bottom-6 left-1/2 -translate-x-1/2",
        "bottom-left": "fixed bottom-6 left-6",
        "top-right": "fixed top-20 right-6",
        "top-left": "fixed top-20 left-6",
        "custom": "",
      },
      elevation: {
        default: "shadow-md",
        low: "shadow-sm",
        high: "shadow-lg",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottom-right",
      elevation: "default",
    },
  }
)

export interface StaticFloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  asChild?: boolean
  label?: string
  showLabel?: boolean
  labelPosition?: "left" | "right" | "top" | "bottom"
  labelClassName?: string
}

const StaticFloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  StaticFloatingActionButtonProps
>(
  (
    {
      className,
      variant,
      size,
      position,
      elevation,
      asChild = false,
      label,
      showLabel = false,
      labelPosition = "left",
      labelClassName,
      ...props
    },
    ref
  ) => {
    // Combine all button props
    const commonProps = {
      className: cn(fabVariants({ variant, size, position, elevation, className })),
      ref,
      ...props,
    }

    // Render button with optional label
    const buttonChildren = props.children

    // Simple button rendering
    return (
      <>
        {showLabel && label && (
          <div className={cn(
            "fixed z-50 bg-background text-foreground px-3 py-1.5 rounded-md shadow-md text-sm whitespace-nowrap",
            labelPosition === "left" && "right-[calc(100%+12px)] top-1/2 -translate-y-1/2",
            labelPosition === "right" && "left-[calc(100%+12px)] top-1/2 -translate-y-1/2",
            labelPosition === "top" && "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2",
            labelPosition === "bottom" && "top-[calc(100%+12px)] left-1/2 -translate-x-1/2",
            labelClassName
          )}>
            {label}
          </div>
        )}
        
        <button {...commonProps}>
          {buttonChildren}
        </button>
      </>
    )
  }
)
StaticFloatingActionButton.displayName = "StaticFloatingActionButton"

// Export with the same name as the original component for easy replacement
export { StaticFloatingActionButton as FloatingActionButton }
