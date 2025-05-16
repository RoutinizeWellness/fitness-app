"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description?: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStepIndex: number
  isLoading?: boolean
  accentColor?: string
  className?: string
  darkMode?: boolean
}

export function ProgressSteps({
  steps,
  currentStepIndex,
  isLoading = false,
  accentColor = "purple",
  className,
  darkMode = false
}: ProgressStepsProps) {
  const [progress, setProgress] = useState(0)
  
  // Actualizar el progreso cuando cambia el paso actual
  useEffect(() => {
    setProgress((currentStepIndex / (steps.length - 1)) * 100)
  }, [currentStepIndex, steps.length])
  
  // Obtener el color de acento
  const getAccentColor = () => {
    switch (accentColor) {
      case "purple":
        return darkMode ? "text-purple-400" : "text-purple-500"
      case "blue":
        return darkMode ? "text-blue-400" : "text-blue-500"
      case "green":
        return darkMode ? "text-green-400" : "text-green-500"
      case "amber":
        return darkMode ? "text-amber-400" : "text-amber-500"
      default:
        return darkMode ? "text-purple-400" : "text-purple-500"
    }
  }
  
  const getAccentBgColor = () => {
    switch (accentColor) {
      case "purple":
        return darkMode ? "bg-purple-400" : "bg-purple-500"
      case "blue":
        return darkMode ? "bg-blue-400" : "bg-blue-500"
      case "green":
        return darkMode ? "bg-green-400" : "bg-green-500"
      case "amber":
        return darkMode ? "bg-amber-400" : "bg-amber-500"
      default:
        return darkMode ? "bg-purple-400" : "bg-purple-500"
    }
  }
  
  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      {/* Ilustración central */}
      <div className="relative w-32 h-32 mb-8">
        <div className={cn(
          "absolute inset-0 rounded-2xl overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-gray-100"
        )}>
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out",
              getAccentBgColor()
            )}
            style={{ height: `${progress}%`, opacity: 0.5 }}
          ></div>
        </div>
        
        {/* Círculo de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-16 h-16">
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full border-2 border-transparent",
                  darkMode ? "border-t-purple-400" : "border-t-purple-500"
                )}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          </div>
        )}
      </div>
      
      {/* Título del paso actual */}
      <h2 className={cn(
        "text-xl font-bold mb-8",
        getAccentColor()
      )}>
        {steps[currentStepIndex]?.title || ""}
      </h2>
      
      {/* Pasos */}
      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={cn(
              "flex items-center",
              index < currentStepIndex ? "opacity-50" : "",
              index > currentStepIndex ? "opacity-30" : ""
            )}
          >
            <div className={cn(
              "w-full py-2",
              index === currentStepIndex ? getAccentColor() : (darkMode ? "text-gray-400" : "text-gray-500")
            )}>
              {step.title}
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicador de carga */}
      {isLoading && (
        <div className="mt-8">
          <motion.div
            className={cn(
              "w-12 h-12 rounded-full border-4 border-gray-200",
              darkMode ? "border-t-purple-400" : "border-t-purple-500"
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          ></motion.div>
        </div>
      )}
    </div>
  )
}
