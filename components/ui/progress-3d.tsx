"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Progress3DProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showValue?: boolean
  valueFormatter?: (value: number) => string
  height?: string
  fillColor?: string
  backgroundColor?: string
  animate?: boolean
  animationDuration?: number
}

const Progress3D = React.forwardRef<HTMLDivElement, Progress3DProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    showValue = false,
    valueFormatter = (value) => `${Math.round(value)}%`,
    height = "8px",
    fillColor = "linear-gradient(90deg, #3b82f6, #10b981)",
    backgroundColor = "linear-gradient(145deg, #e6e6e6, #f0f0f0)",
    animate = true,
    animationDuration = 1,
    ...props 
  }, ref) => {
    const percentage = (value / max) * 100
    
    return (
      <div
        ref={ref}
        className={cn("relative w-full progress-3d", className)}
        style={{ height }}
        {...props}
      >
        <motion.div
          className="h-full rounded-full progress-3d-fill"
          style={{ 
            background: fillColor,
          }}
          initial={{ width: animate ? 0 : `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animationDuration, ease: "easeOut" }}
        />
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {valueFormatter(value)}
          </div>
        )}
      </div>
    )
  }
)
Progress3D.displayName = "Progress3D"

export { Progress3D }
