"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const fabVariants = cva(
  "fixed flex items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  {
    variants: {
      position: {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
      },
      size: {
        sm: "h-12 w-12",
        md: "h-14 w-14",
        lg: "h-16 w-16",
      },
      variant: {
        primary: "bg-[#FDA758] text-white hover:bg-[#FDA758]/90",
        green: "bg-[#5DE292] text-white hover:bg-[#5DE292]/90",
        purple: "bg-[#8C80F8] text-white hover:bg-[#8C80F8]/90",
        pink: "bg-[#FF7285] text-white hover:bg-[#FF7285]/90",
        blue: "bg-[#5CC2FF] text-white hover:bg-[#5CC2FF]/90",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      extended: {
        true: "px-6",
        false: "",
      },
      zIndex: {
        low: "z-10",
        medium: "z-30",
        high: "z-50",
      },
    },
    defaultVariants: {
      position: "bottom-right",
      size: "md",
      variant: "primary",
      extended: false,
      zIndex: "medium",
    },
  }
)

export interface FabButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon: React.ReactNode
  label?: string
  showLabel?: boolean
  withEffect?: "scale" | "lift" | "rotate" | "pulse" | "none"
  withMenu?: boolean
  menuItems?: {
    icon: React.ReactNode
    label: string
    onClick: () => void
  }[]
}

const FabButton = React.forwardRef<HTMLButtonElement, FabButtonProps>(
  ({ 
    className, 
    position, 
    size, 
    variant, 
    extended,
    zIndex,
    icon,
    label,
    showLabel = false,
    withEffect = "scale",
    withMenu = false,
    menuItems = [],
    ...props 
  }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    
    // Configuración de efectos
    const effectVariants = {
      scale: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      },
      lift: {
        whileHover: { y: -4, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" },
        whileTap: { y: 0, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
      },
      rotate: {
        whileHover: { rotate: 15 },
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
    
    // Manejar clic en el FAB
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withMenu) {
        e.preventDefault()
        setIsMenuOpen(!isMenuOpen)
      } else if (props.onClick) {
        props.onClick(e)
      }
    }
    
    return (
      <>
        <motion.button
          className={cn(
            fabVariants({ 
              position, 
              size, 
              variant, 
              extended: showLabel || extended,
              zIndex,
              className 
            })
          )}
          ref={ref}
          {...currentEffect}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={handleClick}
          {...props}
        >
          <span className={cn("text-xl", showLabel && label ? "mr-2" : "")}>
            {icon}
          </span>
          {(showLabel || extended) && label && (
            <span className="text-sm font-medium">{label}</span>
          )}
        </motion.button>
        
        {/* Menú desplegable */}
        {withMenu && (
          <div className={cn(
            "fixed transition-all duration-300",
            position,
            zIndex,
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}>
            <div className={cn(
              "flex flex-col-reverse gap-2 mb-2",
              position?.includes("top") ? "flex-col" : "flex-col-reverse"
            )}>
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  className={cn(
                    "flex items-center rounded-full shadow-md px-4 py-2",
                    "bg-white text-gray-800 hover:bg-gray-100"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isMenuOpen ? 1 : 0, 
                    y: isMenuOpen ? 0 : 20,
                    transition: { delay: index * 0.05 }
                  }}
                  onClick={() => {
                    setIsMenuOpen(false)
                    item.onClick()
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {/* Overlay para cerrar el menú */}
        {withMenu && isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </>
    )
  }
)
FabButton.displayName = "FabButton"

export { FabButton, fabVariants }
