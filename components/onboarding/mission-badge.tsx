"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Check, Star } from "lucide-react"
import { OnboardingMission } from "@/lib/types/beginner-onboarding"

interface MissionBadgeProps {
  mission: OnboardingMission
  text: string
  completed?: boolean
  progress?: number
  total?: number
  onComplete?: () => void
  className?: string
}

export function MissionBadge({
  mission,
  text,
  completed = false,
  progress = 0,
  total = 1,
  onComplete,
  className = ""
}: MissionBadgeProps) {
  const [isCompleted, setIsCompleted] = useState(completed)
  const [showAnimation, setShowAnimation] = useState(false)

  // Actualizar el estado cuando cambia la prop completed
  useEffect(() => {
    if (completed && !isCompleted) {
      setIsCompleted(true)
      setShowAnimation(true)
      
      // Ocultar la animación después de 3 segundos
      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      setIsCompleted(completed)
    }
  }, [completed, isCompleted])

  // Actualizar el estado cuando el progreso alcanza el total
  useEffect(() => {
    if (progress >= total && !isCompleted) {
      setIsCompleted(true)
      setShowAnimation(true)
      
      if (onComplete) {
        onComplete()
      }
      
      // Ocultar la animación después de 3 segundos
      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [progress, total, isCompleted, onComplete])

  // Obtener el icono y color según el tipo de misión
  const getMissionIcon = () => {
    switch (mission) {
      case 'explore_sections':
        return <Star className="h-4 w-4" />
      case 'complete_mini_routine':
        return <Award className="h-4 w-4" />
      case 'log_meal':
        return <Star className="h-4 w-4" />
      case 'set_goal':
        return <Award className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getMissionColor = () => {
    switch (mission) {
      case 'explore_sections':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'complete_mini_routine':
        return "bg-purple-100 text-purple-700 border-purple-200"
      case 'log_meal':
        return "bg-green-100 text-green-700 border-green-200"
      case 'set_goal':
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border 
          ${isCompleted ? "bg-green-50 text-green-700 border-green-200" : getMissionColor()}
          transition-colors duration-300
        `}
      >
        <div className="flex-shrink-0">
          {isCompleted ? (
            <Check className="h-4 w-4" />
          ) : (
            getMissionIcon()
          )}
        </div>
        
        <div className="flex-1 text-sm font-medium">
          {text}
          
          {/* Mostrar progreso si hay */}
          {!isCompleted && total > 1 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (progress / total) * 100)}%` }}
                />
              </div>
              <span className="text-xs">{progress}/{total}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Animación de completado */}
      {showAnimation && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div 
            className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
          >
            <Check className="h-6 w-6" />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
