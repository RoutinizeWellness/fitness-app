"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description?: string
  iconColor?: string
  iconBgColor?: string
  onClick?: () => void
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
  onClick,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg card-hover",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={cn("rounded-full p-3 mb-4", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <h3 className="font-medium text-lg mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
