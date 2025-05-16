"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"

interface StatCardOrganicProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number | string
  icon?: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive?: boolean
    label?: string
  }
  formatter?: (value: number | string) => string
  iconColor?: string
  iconBgColor?: string
  valueColor?: string
  animationDelay?: number
  variant?: "default" | "outline" | "glass"
}

const StatCardOrganic = React.forwardRef<HTMLDivElement, StatCardOrganicProps>(
  ({ 
    className, 
    title,
    value,
    icon,
    description,
    trend,
    formatter = (value) => `${value}`,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10",
    valueColor = "text-foreground",
    animationDelay = 0,
    variant = "default",
    ...props 
  }, ref) => {
    const { animation } = useOrganicTheme()
    
    // Determinar si se deben usar animaciones
    const shouldAnimate = animation !== "none"
    const isPlayful = animation === "playful"
    
    // Configurar las animaciones
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          delay: animationDelay,
          ease: isPlayful ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    const valueVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.5,
          delay: animationDelay + 0.2,
          ease: isPlayful ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    const iconVariants = {
      hidden: { opacity: 0, scale: 0.5, rotate: -20 },
      visible: { 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        transition: {
          duration: 0.5,
          delay: animationDelay + 0.1,
          ease: isPlayful ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    // Renderizar el componente
    const content = (
      <Card 
        ref={ref}
        className={cn("p-6", className)}
        organic={true}
        hover={true}
        variant={variant}
        {...props}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <motion.div
              variants={valueVariants}
              initial={shouldAnimate ? "hidden" : "visible"}
              animate="visible"
              className={cn("text-2xl font-bold mt-2", valueColor)}
            >
              {formatter(value)}
            </motion.div>
            
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            
            {trend && (
              <div className="mt-2">
                <Badge 
                  variant={trend.isPositive ? "soft" : "soft-destructive"}
                  className="font-medium"
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                  {trend.label && <span className="ml-1 opacity-70">{trend.label}</span>}
                </Badge>
              </div>
            )}
          </div>
          
          {icon && (
            <motion.div
              variants={iconVariants}
              initial={shouldAnimate ? "hidden" : "visible"}
              animate="visible"
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                iconBgColor
              )}
            >
              <div className={cn("h-6 w-6", iconColor)}>
                {icon}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    )
    
    // Envolver en motion.div si se deben usar animaciones
    if (shouldAnimate) {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="h-full"
        >
          {content}
        </motion.div>
      )
    }
    
    return content
  }
)
StatCardOrganic.displayName = "StatCardOrganic"

export { StatCardOrganic }
