"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  loadingIcon?: React.ReactNode
  loadingPosition?: "left" | "right" | "center"
  loadingVariant?: "spinner" | "dots" | "progress"
  progressValue?: number
  progressColor?: string
  successText?: string
  successIcon?: React.ReactNode
  errorText?: string
  errorIcon?: React.ReactNode
  status?: "idle" | "loading" | "success" | "error"
  statusDuration?: number
  onStatusChange?: (status: "idle" | "loading" | "success" | "error") => void
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    isLoading = false, 
    loadingText, 
    loadingIcon,
    loadingPosition = "left",
    loadingVariant = "spinner",
    progressValue = 0,
    progressColor,
    successText = "Completado",
    successIcon,
    errorText = "Error",
    errorIcon,
    status = "idle",
    statusDuration = 2000,
    onStatusChange,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [internalStatus, setInternalStatus] = React.useState<"idle" | "loading" | "success" | "error">(status)
    
    // Sincronizar estado interno con prop
    React.useEffect(() => {
      setInternalStatus(status)
    }, [status])
    
    // Resetear estado después de un tiempo
    React.useEffect(() => {
      if (internalStatus === "success" || internalStatus === "error") {
        const timer = setTimeout(() => {
          setInternalStatus("idle")
          if (onStatusChange) {
            onStatusChange("idle")
          }
        }, statusDuration)
        
        return () => clearTimeout(timer)
      }
    }, [internalStatus, statusDuration, onStatusChange])
    
    // Determinar el estado actual
    const currentStatus = isLoading ? "loading" : internalStatus
    
    // Renderizar el icono de carga según la variante
    const renderLoadingIcon = () => {
      if (loadingIcon) {
        return loadingIcon
      }
      
      switch (loadingVariant) {
        case "spinner":
          return <Loader2 className="h-4 w-4 animate-spin" />
        case "dots":
          return (
            <div className="flex space-x-1">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
              />
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
              />
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
              />
            </div>
          )
        case "progress":
          return (
            <div className="absolute inset-0 overflow-hidden rounded-md">
              <motion.div
                className={cn(
                  "h-full",
                  progressColor || "bg-white/20"
                )}
                initial={{ width: "0%" }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )
        default:
          return <Loader2 className="h-4 w-4 animate-spin" />
      }
    }
    
    // Renderizar el contenido según el estado
    const renderContent = () => {
      switch (currentStatus) {
        case "loading":
          if (loadingPosition === "center" && loadingVariant !== "progress") {
            return (
              <div className="flex items-center justify-center">
                {renderLoadingIcon()}
                {loadingText && <span className="ml-2">{loadingText}</span>}
              </div>
            )
          } else if (loadingVariant === "progress") {
            return (
              <>
                {renderLoadingIcon()}
                <div className="relative z-10">
                  {loadingText || children}
                </div>
              </>
            )
          } else {
            return (
              <>
                {loadingPosition === "left" && (
                  <span className="mr-2">{renderLoadingIcon()}</span>
                )}
                {loadingText || children}
                {loadingPosition === "right" && (
                  <span className="ml-2">{renderLoadingIcon()}</span>
                )}
              </>
            )
          }
        case "success":
          return (
            <div className="flex items-center justify-center">
              {successIcon || (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span>{successText}</span>
            </div>
          )
        case "error":
          return (
            <div className="flex items-center justify-center">
              {errorIcon || (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span>{errorText}</span>
            </div>
          )
        default:
          return children
      }
    }
    
    // Determinar la variante según el estado
    const getVariant = () => {
      if (currentStatus === "success") {
        return "success"
      } else if (currentStatus === "error") {
        return "destructive"
      }
      return variant
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant: getVariant(), 
            size, 
            className 
          }),
          currentStatus === "loading" && loadingVariant === "progress" && "relative overflow-hidden"
        )}
        ref={ref}
        disabled={currentStatus !== "idle" || props.disabled}
        {...props}
      >
        {renderContent()}
      </Comp>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
