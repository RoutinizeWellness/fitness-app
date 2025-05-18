"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, XCircle, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type MessageType = "success" | "error" | "warning" | "info"

interface AuthMessageProps {
  type: MessageType
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  icon?: ReactNode
}

export function AuthMessage({
  type,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon
}: AuthMessageProps) {
  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />
      case "warning":
        return <AlertCircle className="h-12 w-12 text-amber-500" />
      case "info":
        return <InfoIcon className="h-12 w-12 text-blue-500" />
    }
  }
  
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50"
      case "error":
        return "bg-red-50"
      case "warning":
        return "bg-amber-50"
      case "info":
        return "bg-blue-50"
    }
  }
  
  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-200"
      case "error":
        return "border-red-200"
      case "warning":
        return "border-amber-200"
      case "info":
        return "border-blue-200"
    }
  }
  
  const getActionButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white"
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white"
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl ${getBackgroundColor()} ${getBorderColor()} border p-6 flex flex-col items-center text-center`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4"
      >
        {getIcon()}
      </motion.div>
      
      <h2 className="text-xl font-bold mb-2 text-[#573353]">{title}</h2>
      <p className="text-[#573353]/80 mb-6">{message}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className={`w-full py-2 rounded-full ${getActionButtonColor()}`}
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outline"
            onClick={onSecondaryAction}
            className="w-full py-2 rounded-full border-gray-300 text-[#573353]"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
