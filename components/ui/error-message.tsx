"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, AlertTriangle, XCircle, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string
  variant?: "error" | "warning" | "info"
  action?: {
    label: string
    onClick: () => void
  }
  retry?: () => void
  fullPage?: boolean
}

export function ErrorMessage({
  title,
  message,
  variant = "error",
  action,
  retry,
  fullPage = false,
  className,
  ...props
}: ErrorMessageProps) {
  const variantClasses = {
    error: {
      container: "bg-red-50 border-red-200",
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      title: "text-red-800",
      message: "text-red-700"
    },
    warning: {
      container: "bg-amber-50 border-amber-200",
      icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
      title: "text-amber-800",
      message: "text-amber-700"
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: <Info className="h-8 w-8 text-blue-500" />,
      title: "text-blue-800",
      message: "text-blue-700"
    }
  }

  const variantStyle = variantClasses[variant]

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className={cn(
          "max-w-md w-full rounded-lg border p-6 shadow-sm",
          variantStyle.container,
          className
        )} {...props}>
          <div className="flex flex-col items-center text-center">
            {variantStyle.icon}
            {title && <h3 className={cn("mt-4 text-lg font-semibold", variantStyle.title)}>{title}</h3>}
            <p className={cn("mt-2", variantStyle.message)}>{message}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {retry && (
                <Button variant="outline" onClick={retry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              )}
              {action && (
                <Button onClick={action.onClick}>{action.label}</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-lg border p-4",
      variantStyle.container,
      className
    )} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          {variantStyle.icon}
        </div>
        <div className="ml-3">
          {title && <h3 className={cn("text-sm font-medium", variantStyle.title)}>{title}</h3>}
          <div className={cn("text-sm mt-2", variantStyle.message)}>
            <p>{message}</p>
          </div>
          {(action || retry) && (
            <div className="mt-4">
              <div className="flex space-x-3">
                {retry && (
                  <Button size="sm" variant="outline" onClick={retry} className="gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Reintentar
                  </Button>
                )}
                {action && (
                  <Button size="sm" onClick={action.onClick}>{action.label}</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
