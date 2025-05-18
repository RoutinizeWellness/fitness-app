"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BarChartDataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartDataPoint[]
  height?: number
  showValues?: boolean
  showLabels?: boolean
  colorScheme?: "default" | "blue" | "green" | "red" | "purple" | "orange" | "gradient"
  className?: string
  animate?: boolean
  unit?: string
  maxValue?: number
  gridLines?: number
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  colorScheme = "default",
  className,
  animate = true,
  unit = "",
  maxValue: customMaxValue,
  gridLines = 5,
}: BarChartProps) {
  // Calcular el valor máximo para la escala
  const maxValue = customMaxValue || Math.max(...data.map(item => item.value), 0) * 1.1
  
  // Esquemas de color
  const colorSchemes = {
    default: {
      bar: "bg-primary",
      text: "text-foreground",
      grid: "border-muted",
    },
    blue: {
      bar: "bg-blue-500 dark:bg-blue-400",
      text: "text-blue-700 dark:text-blue-300",
      grid: "border-blue-100 dark:border-blue-900/30",
    },
    green: {
      bar: "bg-green-500 dark:bg-green-400",
      text: "text-green-700 dark:text-green-300",
      grid: "border-green-100 dark:border-green-900/30",
    },
    red: {
      bar: "bg-red-500 dark:bg-red-400",
      text: "text-red-700 dark:text-red-300",
      grid: "border-red-100 dark:border-red-900/30",
    },
    purple: {
      bar: "bg-purple-500 dark:bg-purple-400",
      text: "text-purple-700 dark:text-purple-300",
      grid: "border-purple-100 dark:border-purple-900/30",
    },
    orange: {
      bar: "bg-orange-500 dark:bg-orange-400",
      text: "text-orange-700 dark:text-orange-300",
      grid: "border-orange-100 dark:border-orange-900/30",
    },
    gradient: {
      bar: "bg-gradient-to-t from-primary/80 to-primary",
      text: "text-foreground",
      grid: "border-muted",
    },
  }
  
  const currentColorScheme = colorSchemes[colorScheme]
  
  // Generar líneas de cuadrícula
  const gridLineValues = Array.from({ length: gridLines }, (_, i) => {
    return maxValue * ((gridLines - i) / gridLines)
  })
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex" style={{ height: `${height}px` }}>
        {/* Eje Y con valores */}
        {showValues && (
          <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground">
            {gridLineValues.map((value, index) => (
              <div key={index} className="flex items-center h-6 -mt-3">
                <span>{Math.round(value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Contenedor principal del gráfico */}
        <div className="flex-1 relative">
          {/* Líneas de cuadrícula */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {gridLineValues.map((_, index) => (
              <div 
                key={index} 
                className={cn("w-full border-t", currentColorScheme.grid)}
              />
            ))}
          </div>
          
          {/* Barras */}
          <div className="absolute inset-0 flex items-end">
            <div className="flex-1 flex items-end justify-around h-full">
              {data.map((item, index) => {
                const barHeight = (item.value / maxValue) * 100
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center px-1"
                    style={{ width: `${100 / data.length}%` }}
                  >
                    <motion.div
                      className={cn("w-full rounded-t-sm", item.color || currentColorScheme.bar)}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ 
                        duration: animate ? 0.8 : 0, 
                        delay: animate ? index * 0.1 : 0,
                        ease: "easeOut" 
                      }}
                    >
                      {showValues && (
                        <div className="flex justify-center -mt-6">
                          <span className={cn("text-xs font-medium", currentColorScheme.text)}>
                            {item.value}{unit}
                          </span>
                        </div>
                      )}
                    </motion.div>
                    
                    {showLabels && (
                      <span className="text-xs text-muted-foreground mt-1 truncate max-w-full" title={item.label}>
                        {item.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
