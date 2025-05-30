"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface SafeInteractiveWrapperProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
  disabled?: boolean
  role?: string
  tabIndex?: number
  onKeyDown?: (e: React.KeyboardEvent) => void
}

/**
 * Safe wrapper component for interactive elements that need to work across Server/Client boundaries
 * This component ensures that event handlers are properly handled in Client Components
 */
export function SafeInteractiveWrapper({
  children,
  onClick,
  className,
  disabled = false,
  role = "button",
  tabIndex = 0,
  onKeyDown,
  ...props
}: SafeInteractiveWrapperProps) {
  
  // Safe click handler that prevents Server/Client component issues
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    if (onClick && typeof onClick === 'function') {
      try {
        onClick(e)
      } catch (error) {
        console.error('Error in interactive wrapper click handler:', error)
      }
    }
  }, [onClick, disabled])

  // Safe keyboard handler for accessibility
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    // Handle Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick && typeof onClick === 'function') {
        try {
          // Create a synthetic mouse event for consistency
          const syntheticEvent = {
            ...e,
            type: 'click',
            preventDefault: e.preventDefault,
            stopPropagation: e.stopPropagation,
          } as unknown as React.MouseEvent
          onClick(syntheticEvent)
        } catch (error) {
          console.error('Error in interactive wrapper keyboard handler:', error)
        }
      }
    }

    // Call custom onKeyDown if provided
    if (onKeyDown && typeof onKeyDown === 'function') {
      try {
        onKeyDown(e)
      } catch (error) {
        console.error('Error in custom keyboard handler:', error)
      }
    }
  }, [onClick, onKeyDown, disabled])

  return (
    <div
      className={cn(
        "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={disabled ? -1 : tabIndex}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  )
}

// Export a specialized version for Card components
export function SafeClickableCard({
  children,
  onClick,
  className,
  disabled = false,
  ...props
}: SafeInteractiveWrapperProps) {
  return (
    <SafeInteractiveWrapper
      onClick={onClick}
      className={cn(
        "transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </SafeInteractiveWrapper>
  )
}

// Export a specialized version for Button-like components
export function SafeClickableButton({
  children,
  onClick,
  className,
  disabled = false,
  variant = "default",
  ...props
}: SafeInteractiveWrapperProps & { variant?: "default" | "outline" | "ghost" }) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <SafeInteractiveWrapper
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      role="button"
      {...props}
    >
      {children}
    </SafeInteractiveWrapper>
  )
}
