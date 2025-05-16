"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface QuickAction3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  label: string
  iconColor?: string
}

const QuickAction3D = React.forwardRef<HTMLButtonElement, QuickAction3DProps>(
  ({ 
    className, 
    icon: Icon,
    label,
    iconColor = "text-primary",
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "h-auto flex flex-col py-3 px-2 glass-effect rounded-lg",
          "border border-white/20 bg-white/70 backdrop-blur-sm",
          "transition-all duration-300 ease-in-out",
          className
        )}
        whileHover={{ 
          y: -3, 
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
        }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <Icon className={cn("h-5 w-5 mb-1 mx-auto", iconColor)} />
        <span className="text-xs font-medium text-center">{label}</span>
      </motion.button>
    )
  }
)
QuickAction3D.displayName = "QuickAction3D"

export { QuickAction3D }
