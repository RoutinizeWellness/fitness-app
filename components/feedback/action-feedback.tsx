"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, AlertCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type FeedbackType = "success" | "error" | "info" | "loading"

interface ActionFeedbackProps {
  message: string
  type: FeedbackType
  visible: boolean
  onClose?: () => void
  autoClose?: boolean
  duration?: number
  position?: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export function ActionFeedback({
  message,
  type,
  visible,
  onClose,
  autoClose = true,
  duration = 3000,
  position = "bottom"
}: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(visible)
  
  useEffect(() => {
    setIsVisible(visible)
    
    if (visible && autoClose && type !== "loading") {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [visible, autoClose, duration, onClose, type])
  
  // Obtener el icono según el tipo
  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5" />
      case "error":
        return <X className="h-5 w-5" />
      case "info":
        return <Info className="h-5 w-5" />
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin" />
    }
  }
  
  // Obtener las clases según el tipo
  const getClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      case "info":
        return "bg-blue-500 text-white"
      case "loading":
        return "bg-gray-800 text-white"
    }
  }
  
  // Obtener las clases de posición
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "top-4 left-1/2 -translate-x-1/2"
      case "bottom":
        return "bottom-20 left-1/2 -translate-x-1/2"
      case "top-left":
        return "top-4 left-4"
      case "top-right":
        return "top-4 right-4"
      case "bottom-left":
        return "bottom-20 left-4"
      case "bottom-right":
        return "bottom-20 right-4"
    }
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed z-50 px-4 py-3 rounded-lg shadow-lg flex items-center max-w-xs",
            getClasses(),
            getPositionClasses()
          )}
        >
          <div className="mr-3">
            {getIcon()}
          </div>
          <p className="text-sm font-medium flex-1">{message}</p>
          {type !== "loading" && (
            <button
              className="ml-2 text-white/80 hover:text-white"
              onClick={() => {
                setIsVisible(false)
                if (onClose) onClose()
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente para mostrar múltiples notificaciones
interface ActionFeedbackManagerProps {
  children: React.ReactNode
}

export interface FeedbackItem {
  id: string
  message: string
  type: FeedbackType
  duration?: number
  position?: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

interface FeedbackContextType {
  showFeedback: (feedback: Omit<FeedbackItem, "id">) => string
  hideFeedback: (id: string) => void
  updateFeedback: (id: string, updates: Partial<Omit<FeedbackItem, "id">>) => void
}

import { createContext, useContext } from "react"

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function ActionFeedbackProvider({ children }: ActionFeedbackManagerProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  
  const showFeedback = (feedback: Omit<FeedbackItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setFeedbacks(prev => [...prev, { ...feedback, id }])
    return id
  }
  
  const hideFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(feedback => feedback.id !== id))
  }
  
  const updateFeedback = (id: string, updates: Partial<Omit<FeedbackItem, "id">>) => {
    setFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === id ? { ...feedback, ...updates } : feedback
      )
    )
  }
  
  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, updateFeedback }}>
      {children}
      
      {/* Renderizar todas las notificaciones */}
      {feedbacks.map(feedback => (
        <ActionFeedback
          key={feedback.id}
          message={feedback.message}
          type={feedback.type}
          visible={true}
          duration={feedback.duration}
          position={feedback.position}
          onClose={() => hideFeedback(feedback.id)}
        />
      ))}
    </FeedbackContext.Provider>
  )
}

// Hook para usar el contexto
export function useFeedback() {
  const context = useContext(FeedbackContext)
  
  if (context === undefined) {
    throw new Error("useFeedback must be used within a ActionFeedbackProvider")
  }
  
  return context
}

// Función para mostrar un feedback de carga y actualizarlo cuando termine
export function useLoadingFeedback() {
  const { showFeedback, updateFeedback, hideFeedback } = useFeedback()
  
  const showLoading = (message: string, position?: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
    return showFeedback({
      message,
      type: "loading",
      position
    })
  }
  
  const updateToSuccess = (id: string, message: string) => {
    updateFeedback(id, {
      message,
      type: "success",
      duration: 3000
    })
    
    // Auto-hide after duration
    setTimeout(() => {
      hideFeedback(id)
    }, 3000)
  }
  
  const updateToError = (id: string, message: string) => {
    updateFeedback(id, {
      message,
      type: "error",
      duration: 5000
    })
    
    // Auto-hide after duration
    setTimeout(() => {
      hideFeedback(id)
    }, 5000)
  }
  
  return { showLoading, updateToSuccess, updateToError, hideFeedback }
}
