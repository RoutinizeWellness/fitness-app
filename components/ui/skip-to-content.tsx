"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface SkipToContentProps extends React.HTMLAttributes<HTMLAnchorElement> {
  contentId?: string
  label?: string
}

export function SkipToContent({
  contentId = "main-content",
  label = "Saltar al contenido principal",
  className,
  ...props
}: SkipToContentProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        "skip-to-content",
        className
      )}
      {...props}
    >
      {label}
    </a>
  )
}
