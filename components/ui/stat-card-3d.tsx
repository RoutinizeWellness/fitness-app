"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LucideIcon } from "lucide-react"

interface StatCard3DProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number
  icon: LucideIcon
  description?: string
  formatter?: (value: number) => string
  iconColor?: string
  iconBgColor?: string
  valueColor?: string
  animationDelay?: number
}

const StatCard3D = React.forwardRef<HTMLDivElement, StatCard3DProps>(
  ({ 
    className, 
    title,
    value,
    icon: Icon,
    description,
    formatter = (value) => `${value}`,
    iconColor = "text-blue-700",
    iconBgColor = "bg-blue-100",
    valueColor = "gradient-text",
    animationDelay = 0,
    ...props 
  }, ref) => {
    return (
      <Card3D
        ref={ref}
        className={cn("", className)}
        floatingEffect={true}
        style={{ animationDelay: `${animationDelay}s` }}
        {...props}
      >
        <Card3DContent className="p-4">
          <div className="flex flex-col h-full">
            <div className={cn("rounded-full p-2 w-fit mb-2", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <h3 className="font-medium">{title}</h3>
            <div className="mt-auto pt-2">
              <div className={cn("text-2xl font-bold", valueColor)}>
                <AnimatedCounter value={value} formatter={formatter} />
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
)
StatCard3D.displayName = "StatCard3D"

export { StatCard3D }
