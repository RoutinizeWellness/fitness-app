"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[#1B237E] text-white hover:bg-[#1B237E]/90 shadow-lg hover:shadow-xl border-2 border-[#1B237E] hover:border-[#1B237E]/90 font-semibold",
        destructive:
          "bg-[#FF6767] text-white hover:bg-[#FF6767]/90 shadow-lg hover:shadow-xl border-2 border-[#FF6767] hover:border-[#FF6767]/90 font-semibold",
        outline:
          "border-2 border-[#1B237E] bg-white text-[#1B237E] hover:bg-[#1B237E] hover:text-white shadow-md hover:shadow-lg font-semibold",
        secondary:
          "bg-[#B1AFE9] text-[#1B237E] hover:bg-[#B1AFE9]/80 shadow-md hover:shadow-lg border-2 border-[#B1AFE9] hover:border-[#B1AFE9]/80 font-semibold",
        ghost: "text-[#1B237E] hover:bg-[#DDDCFE] hover:text-[#1B237E] border-2 border-transparent hover:border-[#DDDCFE] font-medium",
        link: "text-[#1B237E] underline-offset-4 hover:underline font-semibold",
        gradient: "bg-gradient-to-r from-[#1B237E] to-[#573353] text-white hover:brightness-105 shadow-lg hover:shadow-xl border-2 border-[#1B237E] font-semibold",
        subtle: "bg-[#DDDCFE] text-[#1B237E] hover:bg-[#B1AFE9] shadow-sm hover:shadow-md border border-[#DDDCFE] hover:border-[#B1AFE9] font-medium",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl border-2 border-green-600 hover:border-green-700 font-semibold",
        warning: "bg-[#FEA800] text-white hover:bg-[#FEA800]/90 shadow-lg hover:shadow-xl border-2 border-[#FEA800] hover:border-[#FEA800]/90 font-semibold",
        purple: "bg-[#573353] text-white hover:bg-[#573353]/90 shadow-lg hover:shadow-xl border-2 border-[#573353] hover:border-[#573353]/90 font-semibold"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  withEffect?: "scale" | "lift" | "none"
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, withEffect = "scale", children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button
    
    // Configuración de efectos
    const effectVariants = {
      scale: {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
      },
      lift: {
        whileHover: { y: -2, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
        whileTap: { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
      },
      none: {
        whileHover: {},
        whileTap: {},
      },
    }
    
    const currentEffect = effectVariants[withEffect]
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...currentEffect}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

// SafeClientButton component for better compatibility
export interface SafeClientButtonProps extends ButtonProps {
  onClick?: () => void
  href?: string
}

const SafeClientButton = React.forwardRef<HTMLButtonElement, SafeClientButtonProps>(
  ({ onClick, href, children, variant = "default", ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (onClick) {
        onClick()
      } else if (href) {
        window.location.href = href
      }
    }

    return (
      <EnhancedButton
        ref={ref}
        onClick={handleClick}
        variant={variant}
        {...props}
      >
        {children}
      </EnhancedButton>
    )
  }
)
SafeClientButton.displayName = "SafeClientButton"

export { EnhancedButton, SafeClientButton, buttonVariants }
