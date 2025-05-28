"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/static-card"

// This is a static version of the stat card component without any animations or framer-motion dependencies

interface StatCardOrganicProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: number
  trendLabel?: string
  className?: string
  iconClassName?: string
  valueClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  trendClassName?: string
  onClick?: () => void
}

export function StatCardOrganic({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  className,
  iconClassName,
  valueClassName,
  titleClassName,
  descriptionClassName,
  trendClassName,
  onClick
}: StatCardOrganicProps) {
  // Determine trend color
  const trendColor = trend && trend > 0 
    ? "text-green-600" 
    : trend && trend < 0 
      ? "text-red-600" 
      : "text-gray-500"
  
  // Format trend value
  const formattedTrend = trend && trend > 0 
    ? `+${trend}%` 
    : trend && trend < 0 
      ? `${trend}%` 
      : "0%"
  
  return (
    <Card 
      className={cn(
        "p-5 rounded-3xl border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium text-gray-500 mb-1", titleClassName)}>
            {title}
          </p>
          <h3 className={cn("text-2xl font-bold", valueClassName)}>
            {value}
          </h3>
          {description && (
            <p className={cn("text-xs text-gray-500 mt-1", descriptionClassName)}>
              {description}
            </p>
          )}
          {(trend !== undefined || trendLabel) && (
            <div className={cn("flex items-center mt-2", trendClassName)}>
              {trend !== undefined && (
                <span className={cn("text-xs font-medium", trendColor)}>
                  {formattedTrend}
                </span>
              )}
              {trendLabel && (
                <span className="text-xs text-gray-500 ml-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center",
            iconClassName
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
