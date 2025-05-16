"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const button3DVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "button-3d",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        gradient: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
        glass: "glass-effect border border-white/20 text-foreground",
        neomorphic: "neomorphic text-foreground",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
        xl: "h-12 px-10 rounded-md text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3DVariants> {
  asChild?: boolean
  glowOnHover?: boolean
  glowColor?: string
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    glowOnHover = true,
    glowColor = "rgba(59, 130, 246, 0.5)",
    ...props 
  }, ref) => {
    return (
      <motion.button
        className={cn(button3DVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={
          glowOnHover 
            ? { 
                y: -2, 
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)" 
              } 
            : {}
        }
        {...props}
      />
    )
  }
)
Button3D.displayName = "Button3D"

export { Button3D, button3DVariants }
