"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    bordered?: boolean
    borderColor?: string
    size?: "xs" | "sm" | "md" | "lg" | "xl"
  }
>(({ className, bordered = false, borderColor = "primary", size = "md", ...props }, ref) => {
  // Determinar el tamaño del avatar
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  // Determinar el color del borde
  const borderClasses = bordered
    ? borderColor === "primary"
      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
      : `ring-2 ring-${borderColor}-500 ring-offset-2 ring-offset-background`
    : ""

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full shadow-sm",
        sizeClasses[size],
        borderClasses,
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    colorful?: boolean
  }
>(({ className, colorful = false, ...props }, ref) => {
  // Generar un color aleatorio para el fondo si colorful es true
  const randomColor = React.useMemo(() => {
    if (!colorful) return ""

    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-amber-100 text-amber-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800"
    ]

    return colors[Math.floor(Math.random() * colors.length)]
  }, [colorful])

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-medium",
        colorful ? randomColor : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
