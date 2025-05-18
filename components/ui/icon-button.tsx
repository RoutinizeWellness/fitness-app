"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Variantes con colores específicos de la app
        primary: "bg-[#FDA758] text-white hover:bg-[#FDA758]/90",
        green: "bg-[#5DE292] text-white hover:bg-[#5DE292]/90",
        purple: "bg-[#8C80F8] text-white hover:bg-[#8C80F8]/90",
        pink: "bg-[#FF7285] text-white hover:bg-[#FF7285]/90",
        blue: "bg-[#5CC2FF] text-white hover:bg-[#5CC2FF]/90",
        // Variantes sutiles
        "primary-subtle": "bg-[#FDA758]/10 text-[#FDA758] hover:bg-[#FDA758]/20",
        "green-subtle": "bg-[#5DE292]/10 text-[#5DE292] hover:bg-[#5DE292]/20",
        "purple-subtle": "bg-[#8C80F8]/10 text-[#8C80F8] hover:bg-[#8C80F8]/20",
        "pink-subtle": "bg-[#FF7285]/10 text-[#FF7285] hover:bg-[#FF7285]/20",
        "blue-subtle": "bg-[#5CC2FF]/10 text-[#5CC2FF] hover:bg-[#5CC2FF]/20",
      },
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-14 w-14",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      iconSize: {
        xs: "[&_svg]:h-3 [&_svg]:w-3",
        sm: "[&_svg]:h-4 [&_svg]:w-4",
        md: "[&_svg]:h-5 [&_svg]:w-5",
        lg: "[&_svg]:h-6 [&_svg]:w-6",
        xl: "[&_svg]:h-7 [&_svg]:w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shadow: "none",
      iconSize: "md",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
  withEffect?: "scale" | "lift" | "rotate" | "pulse" | "none"
  tooltip?: string
  tooltipPosition?: "top" | "bottom" | "left" | "right"
  badge?: number | string
  badgeColor?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shadow,
    iconSize,
    icon,
    withEffect = "scale",
    tooltip,
    tooltipPosition = "top",
    badge,
    badgeColor = "bg-red-500",
    ...props 
  }, ref) => {
    const [showTooltip, setShowTooltip] = React.useState(false)
    
    // Configuración de efectos
    const effectVariants = {
      scale: {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 },
      },
      lift: {
        whileHover: { y: -2, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
        whileTap: { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
      },
      rotate: {
        whileHover: { rotate: 15 },
        whileTap: { rotate: 0 },
      },
      pulse: {
        whileHover: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1 } },
        whileTap: { scale: 0.9 },
      },
      none: {
        whileHover: {},
        whileTap: {},
      },
    }
    
    const currentEffect = effectVariants[withEffect]
    
    // Posición del tooltip
    const tooltipPositions = {
      top: "-top-8 left-1/2 -translate-x-1/2",
      bottom: "-bottom-8 left-1/2 -translate-x-1/2",
      left: "left-0 top-1/2 -translate-y-1/2 -translate-x-full",
      right: "right-0 top-1/2 -translate-y-1/2 translate-x-full",
    }
    
    return (
      <motion.button
        className={cn(
          iconButtonVariants({ 
            variant, 
            size, 
            shadow,
            iconSize,
            className 
          }),
          "relative"
        )}
        ref={ref}
        {...currentEffect}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
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
        
        {icon}
        
        {tooltip && showTooltip && (
          <motion.div
            className={cn(
              "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-sm whitespace-nowrap",
              tooltipPositions[tooltipPosition]
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip}
            <div 
              className={cn(
                "absolute w-2 h-2 bg-gray-800 transform rotate-45",
                tooltipPosition === "top" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                tooltipPosition === "bottom" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                tooltipPosition === "left" && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
                tooltipPosition === "right" && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
              )}
            />
          </motion.div>
        )}
      </motion.button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
