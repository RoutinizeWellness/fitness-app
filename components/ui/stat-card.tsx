"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number | string
  previousValue?: number
  unit?: string
  icon?: React.ReactNode | LucideIcon
  iconColor?: string
  iconBgColor?: string
  description?: string
  trend?: "up" | "down" | "neutral" | {
    value: number
    isPositive: boolean
    label?: string
  }
  trendValue?: number | string
  isLoading?: boolean
  colorScheme?: "default" | "blue" | "green" | "red" | "purple" | "orange"
  className?: string
}

export function StatCard({
  title,
  value,
  previousValue,
  unit = "",
  icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  description,
  trend,
  trendValue,
  isLoading = false,
  colorScheme = "default",
  className,
  ...props
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "number" ? value : 0
  const Icon = typeof icon === "function" ? icon : null

  // Handle different trend types (string or object)
  const isTrendObject = trend && typeof trend === "object"

  // Calcular tendencia automáticamente si se proporciona previousValue
  const calculatedTrend = !isTrendObject && trend ? trend : (
    previousValue !== undefined
      ? numericValue > previousValue
        ? "up"
        : numericValue < previousValue
          ? "down"
          : "neutral"
      : undefined
  )

  // Calcular valor de tendencia automáticamente si se proporciona previousValue
  const calculatedTrendValue = trendValue || (
    previousValue !== undefined && numericValue !== 0
      ? Math.abs(((numericValue - previousValue) / previousValue) * 100).toFixed(1)
      : undefined
  )

  // Animación del contador
  useEffect(() => {
    if (isLoading) return

    if (typeof value === "number") {
      let start = 0
      // Si el valor es grande, comenzar desde un porcentaje del valor final
      if (value > 100) start = value * 0.5

      const duration = 1000 // ms
      const frameDuration = 1000 / 60 // 60fps
      const totalFrames = Math.round(duration / frameDuration)
      let frame = 0

      const counter = setInterval(() => {
        frame++
        const progress = frame / totalFrames
        // Función de easing para hacer la animación más natural
        const easeOutQuad = progress * (2 - progress)
        setDisplayValue(Math.floor(start + (value - start) * easeOutQuad))

        if (frame === totalFrames) {
          clearInterval(counter)
          setDisplayValue(value)
        }
      }, frameDuration)

      return () => clearInterval(counter)
    } else {
      setDisplayValue(0)
    }
  }, [value, isLoading])

  // Mapeo de esquemas de color
  const colorSchemes = {
    default: {
      background: "bg-card",
      icon: "bg-primary/10 text-primary",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    },
    blue: {
      background: "bg-blue-50 dark:bg-blue-950/40",
      icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    },
    green: {
      background: "bg-green-50 dark:bg-green-950/40",
      icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    },
    red: {
      background: "bg-red-50 dark:bg-red-950/40",
      icon: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    },
    purple: {
      background: "bg-purple-50 dark:bg-purple-950/40",
      icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    },
    orange: {
      background: "bg-orange-50 dark:bg-orange-950/40",
      icon: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-gray-500 dark:text-gray-400"
      }
    }
  }

  const currentScheme = colorSchemes[colorScheme]

  // Componentes de tendencia
  const TrendIcon = !isTrendObject ? {
    up: ArrowUpIcon,
    down: ArrowDownIcon,
    neutral: MinusIcon
  }[calculatedTrend || "neutral"] : null

  const trendColor = !isTrendObject ? {
    up: currentScheme.trend.up,
    down: currentScheme.trend.down,
    neutral: currentScheme.trend.neutral
  }[calculatedTrend || "neutral"] : null

  // Choose between the two rendering styles based on props
  if (Icon) {
    // Card style rendering (from master branch)
    return (
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-lg card-hover",
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-2xl font-bold">{value}</h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
              {isTrendObject && trend && (
                <div className="flex items-center mt-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      trend.isPositive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {trend.isPositive ? "+" : "-"}{trend.value}%
                  </span>
                  {trend.label && (
                    <span className="text-xs text-muted-foreground ml-1">
                      {trend.label}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className={cn("rounded-full p-3", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  } else {
    // Original style rendering (from HEAD)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "rounded-lg border p-4 shadow-sm",
          currentScheme.background,
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline mt-1">
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">
                    {typeof value === "number" ? displayValue.toLocaleString() : value}
                    {unit && <span className="ml-1 text-lg">{unit}</span>}
                  </h3>
                  {!isTrendObject && calculatedTrend && calculatedTrendValue && (
                    <div className={cn("flex items-center ml-2", trendColor)}>
                      <TrendIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{calculatedTrendValue}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && !Icon && (
            <div className={cn("p-2 rounded-full", currentScheme.icon)}>
              {icon}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
}
