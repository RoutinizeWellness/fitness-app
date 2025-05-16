import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    organic?: boolean
    variant?: "default" | "filled" | "outline" | "ghost"
  }
>(
  ({ className, type, organic = true, variant = "default", ...props }, ref) => {
    // Determinar las clases base según las propiedades
    const baseClasses = organic
      ? "flex h-12 w-full rounded-xl border border-input px-4 py-3 text-base transition-all duration-300 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      : "flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

    // Añadir clases según la variante
    let variantClasses = "bg-background"
    if (variant === "filled" && organic) {
      variantClasses = "bg-muted border-transparent"
    } else if (variant === "outline" && organic) {
      variantClasses = "bg-transparent border-2"
    } else if (variant === "ghost" && organic) {
      variantClasses = "bg-transparent border-transparent hover:bg-muted/50"
    }

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variantClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
