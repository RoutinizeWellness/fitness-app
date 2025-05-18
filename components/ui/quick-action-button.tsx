"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const quickActionVariants = cva(
  "flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-white hover:bg-gray-50 text-gray-800",
        primary: "bg-[#FDA758]/10 hover:bg-[#FDA758]/20 text-[#FDA758]",
        green: "bg-[#5DE292]/10 hover:bg-[#5DE292]/20 text-[#5DE292]",
        purple: "bg-[#8C80F8]/10 hover:bg-[#8C80F8]/20 text-[#8C80F8]",
        pink: "bg-[#FF7285]/10 hover:bg-[#FF7285]/20 text-[#FF7285]",
        blue: "bg-[#5CC2FF]/10 hover:bg-[#5CC2FF]/20 text-[#5CC2FF]",
        ghost: "hover:bg-gray-100 text-gray-800",
      },
      size: {
        sm: "w-16 h-16",
        md: "w-20 h-20",
        lg: "w-24 h-24",
        auto: "w-auto h-auto",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
      },
      iconSize: {
        sm: "[&_svg]:w-4 [&_svg]:h-4",
        md: "[&_svg]:w-6 [&_svg]:h-6",
        lg: "[&_svg]:w-8 [&_svg]:h-8",
      },
      textSize: {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shadow: "sm",
      iconSize: "md",
      textSize: "xs",
    },
  }
)

export interface QuickActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof quickActionVariants> {
  icon: React.ReactNode
  label: string
  withEffect?: "scale" | "lift" | "rotate" | "pulse" | "none"
  badge?: number | string
  badgeColor?: string
}

const QuickActionButton = React.forwardRef<HTMLButtonElement, QuickActionButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shadow,
    iconSize,
    textSize,
    icon,
    label,
    withEffect = "scale",
    badge,
    badgeColor = "bg-red-500",
    ...props 
  }, ref) => {
    // Configuración de efectos
    const effectVariants = {
      scale: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      },
      lift: {
        whileHover: { y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
        whileTap: { y: 0, boxShadow: "0 4px 8px rgba(0,0,0,0.05)" },
      },
      rotate: {
        whileHover: { rotate: 5 },
        whileTap: { rotate: 0 },
      },
      pulse: {
        whileHover: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } },
        whileTap: { scale: 0.95 },
      },
      none: {
        whileHover: {},
        whileTap: {},
      },
    }
    
    const currentEffect = effectVariants[withEffect]
    
    return (
      <motion.button
        className={cn(
          quickActionVariants({ 
            variant, 
            size, 
            shadow,
            iconSize,
            textSize,
            className 
          }),
          "relative"
        )}
        ref={ref}
        {...currentEffect}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {badge !== undefined && (
          <span className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 rounded-full text-white text-xs font-medium",
            badgeColor
          )}>
            {badge}
          </span>
        )}
        <div className="mb-1">{icon}</div>
        <span className={cn(
          "text-center font-medium",
          textSize === "xs" ? "text-xs" : 
          textSize === "sm" ? "text-sm" : 
          "text-base"
        )}>
          {label}
        </span>
      </motion.button>
    )
  }
)
QuickActionButton.displayName = "QuickActionButton"

export { QuickActionButton, quickActionVariants }
