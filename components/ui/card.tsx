"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    organic?: boolean
    hover?: boolean
    variant?: "default" | "outline" | "glass"
  }
>(({ className, organic = true, hover = false, variant = "default", ...props }, ref) => {
  // Determinar las clases base según las propiedades
  const baseClasses = organic
    ? "rounded-3xl bg-card text-card-foreground shadow-soft transition-all duration-300"
    : "rounded-lg bg-card text-card-foreground shadow-sm"

  // Añadir clases de hover si está habilitado
  const hoverClasses = hover && organic
    ? "hover:-translate-y-2 hover:shadow-soft-md"
    : ""

  // Añadir clases según la variante
  let variantClasses = "border"
  if (variant === "glass" && organic) {
    variantClasses = "glass-organic border-0"
  } else if (variant === "outline") {
    variantClasses = "border-2"
  }

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        hoverClasses,
        variantClasses,
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
