"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const safeButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm font-manrope",
  {
    variants: {
      variant: {
        default: "bg-[#1B237E] text-white hover:bg-[#1B237E]/90 hover:shadow-md active:scale-95",
        destructive:
          "bg-[#FF6767] text-white hover:bg-[#FF6767]/90 hover:shadow-md active:scale-95",
        outline:
          "border border-[#DDDCFE] bg-white hover:bg-[#DDDCFE]/20 hover:text-[#1B237E] hover:shadow-md active:scale-95",
        secondary:
          "bg-[#B1AFE9] text-[#1B237E] hover:bg-[#B1AFE9]/80 hover:shadow-md active:scale-95",
        ghost: "hover:bg-[#DDDCFE]/30 hover:text-[#1B237E] shadow-none active:scale-95",
        link: "text-[#1B237E] underline-offset-4 hover:underline shadow-none",
        pill: "rounded-full bg-[#1B237E] text-white hover:bg-[#1B237E]/90 hover:shadow-md active:scale-95",
        organic: "rounded-[24px] bg-[#1B237E] text-white hover:bg-[#1B237E]/90 hover:shadow-md active:scale-95",
        accent: "bg-[#FEA800] text-white hover:bg-[#FEA800]/90 hover:shadow-md active:scale-95",
        gradient: "bg-gradient-to-r from-[#1B237E] to-[#B1AFE9] text-white hover:from-[#1B237E]/90 hover:to-[#B1AFE9]/90 hover:shadow-md active:scale-95",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10 rounded-xl",
        pill: "h-10 px-6 py-2 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SafeClientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof safeButtonVariants> {
  children?: React.ReactNode
}

const SafeClientButton = React.forwardRef<HTMLButtonElement, SafeClientButtonProps>(
  ({ className, variant, size, children, onClick, ...props }, ref) => {

    // Ensure this is a client component with a safe click handler
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (onClick && typeof onClick === 'function') {
        try {
          onClick(e)
        } catch (error) {
          console.error('Error in button click handler:', error)
        }
      }
    }, [onClick])

    return (
      <button
        className={cn(safeButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SafeClientButton.displayName = "SafeClientButton"

export { SafeClientButton, safeButtonVariants }
