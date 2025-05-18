"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileQuestion, Inbox, AlertCircle } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: "search" | "create" | "file" | "inbox" | "alert" | React.ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon = "search",
  action,
  secondaryAction,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  const getIcon = () => {
    if (React.isValidElement(icon)) return icon

    switch (icon) {
      case "search":
        return <Search className="h-10 w-10 text-muted-foreground" />
      case "create":
        return <Plus className="h-10 w-10 text-muted-foreground" />
      case "file":
        return <FileQuestion className="h-10 w-10 text-muted-foreground" />
      case "inbox":
        return <Inbox className="h-10 w-10 text-muted-foreground" />
      case "alert":
        return <AlertCircle className="h-10 w-10 text-muted-foreground" />
      default:
        return <Search className="h-10 w-10 text-muted-foreground" />
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        compact ? "py-5" : "py-10",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {getIcon()}
        </div>
        <h3 className={cn("mt-4 text-lg font-semibold", compact && "text-base")}>
          {title}
        </h3>
        {description && (
          <p className={cn("mt-2 text-sm text-muted-foreground", compact && "text-xs")}>
            {description}
          </p>
        )}
        {action && (
          <div className={cn("mt-6", compact && "mt-4")}>
            <Button onClick={action.onClick} className="gap-2">
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          </div>
        )}
        {secondaryAction && (
          <Button
            variant="link"
            onClick={secondaryAction.onClick}
            className={cn("mt-2", compact && "mt-1 text-sm")}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}
