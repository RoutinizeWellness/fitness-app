"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glowColor?: string
  hoverEffect?: boolean
  floatingEffect?: boolean
  glassEffect?: boolean
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ 
    className, 
    children, 
    glowColor = "rgba(59, 130, 246, 0.5)", 
    hoverEffect = true,
    floatingEffect = false,
    glassEffect = false,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "card-3d relative rounded-xl overflow-hidden",
          floatingEffect && "floating-card",
          glassEffect && "glass-effect",
          className
        )}
        whileHover={
          hoverEffect 
            ? { 
                y: -5, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              } 
            : {}
        }
        {...props}
      >
        {children}
        {hoverEffect && (
          <motion.div
            className="absolute inset-0 rounded-xl z-[-1]"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.7 }}
            style={{
              background: `linear-gradient(45deg, ${glowColor}, transparent)`,
              filter: "blur(8px)",
            }}
          />
        )}
      </motion.div>
    )
  }
)
Card3D.displayName = "Card3D"

interface Card3DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card3DHeader = React.forwardRef<HTMLDivElement, Card3DHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 pt-6 pb-3", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card3DHeader.displayName = "Card3DHeader"

interface Card3DTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  gradient?: boolean
}

const Card3DTitle = React.forwardRef<HTMLHeadingElement, Card3DTitleProps>(
  ({ className, children, gradient = false, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold", 
          gradient && "gradient-text",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
Card3DTitle.displayName = "Card3DTitle"

interface Card3DContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card3DContent = React.forwardRef<HTMLDivElement, Card3DContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6 pt-3", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card3DContent.displayName = "Card3DContent"

interface Card3DFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card3DFooter = React.forwardRef<HTMLDivElement, Card3DFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 bg-gray-50/50 border-t border-gray-100", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card3DFooter.displayName = "Card3DFooter"

export { Card3D, Card3DHeader, Card3DTitle, Card3DContent, Card3DFooter }
