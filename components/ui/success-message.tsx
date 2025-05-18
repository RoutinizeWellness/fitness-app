"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  fullPage?: boolean
  autoHide?: boolean
  autoHideDuration?: number
}

export function SuccessMessage({
  title,
  message,
  action,
  fullPage = false,
  autoHide = false,
  autoHideDuration = 5000,
  className,
  ...props
}: SuccessMessageProps) {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDuration])

  if (!visible) return null

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className={cn(
          "max-w-md w-full rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm",
          className
        )} {...props}>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            {title && <h3 className="mt-4 text-lg font-semibold text-green-800">{title}</h3>}
            <p className="mt-2 text-green-700">{message}</p>
            {action && (
              <Button onClick={action.onClick} className="mt-6 gap-2">
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-lg border border-green-200 bg-green-50 p-4",
      className
    )} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium text-green-800">{title}</h3>}
          <div className="mt-2 text-sm text-green-700">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Button size="sm" onClick={action.onClick} className="gap-1">
                  {action.label}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
