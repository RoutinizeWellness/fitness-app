"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Star, Edit, Sun, Droplets, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tip {
  id: string
  title: string
  content: string
  icon: "sun" | "water" | "wind" | "nutrition" | "rest"
  moreUrl?: string
}

interface TipsCardProps {
  tips: Tip[]
  className?: string
  darkMode?: boolean
}

export function TipsCard({ tips, className, darkMode = false }: TipsCardProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isDetailsComplete, setIsDetailsComplete] = useState(false)
  
  const currentTip = tips[currentTipIndex]
  
  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "sun":
        return <Sun className="h-12 w-12 text-yellow-400" />
      case "water":
        return <Droplets className="h-12 w-12 text-blue-400" />
      case "wind":
        return <Wind className="h-12 w-12 text-teal-400" />
      default:
        return <Sun className="h-12 w-12 text-yellow-400" />
    }
  }
  
  return (
    <div className={cn(
      "w-full",
      darkMode ? "text-white" : "text-gray-800",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn(
          "text-2xl font-bold",
          darkMode ? "text-white" : "text-gray-800"
        )}>
          Tips
        </h2>
      </div>
      
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        darkMode ? "bg-gray-800" : "bg-gray-100"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Indicador de progreso */}
            <div className="absolute top-4 right-4 z-10">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                darkMode ? "bg-yellow-500 text-gray-900" : "bg-yellow-400 text-gray-900"
              )}>
                {currentTipIndex + 1} / {tips.length}
              </div>
            </div>
            
            {/* Contenido del tip */}
            <div className={cn(
              "p-6 pb-12 rounded-3xl",
              darkMode ? "bg-gray-700" : "bg-amber-50"
            )}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getIcon(currentTip.icon)}
                </div>
                <div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    darkMode ? "text-white" : "text-gray-800"
                  )}>
                    {currentTip.title}
                  </h3>
                  <p className={cn(
                    "text-base",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    {currentTip.content}
                  </p>
                  {currentTip.moreUrl && (
                    <button 
                      className={cn(
                        "flex items-center mt-2 font-medium",
                        darkMode ? "text-yellow-400" : "text-amber-600"
                      )}
                      onClick={() => window.open(currentTip.moreUrl, "_blank")}
                    >
                      More <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botón de siguiente */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <button
                onClick={handleNextTip}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-colors",
                  darkMode 
                    ? "bg-green-400 text-gray-900 hover:bg-green-300" 
                    : "bg-green-200 text-green-800 hover:bg-green-300"
                )}
              >
                Next tip
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Detalles completos */}
      <div className="mt-6">
        <button 
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl",
            darkMode 
              ? "bg-gray-800 text-white hover:bg-gray-700" 
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
          )}
          onClick={() => setIsDetailsComplete(!isDetailsComplete)}
        >
          <div className="flex items-center">
            <span>Details complete</span>
            {isDetailsComplete && (
              <Star className="h-5 w-5 ml-2 text-yellow-400 fill-yellow-400" />
            )}
          </div>
          <Edit className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
