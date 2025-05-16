"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Avatar3D = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    glowOnHover?: boolean
    glowColor?: string
    borderColor?: string
    borderWidth?: string
    shadowColor?: string
  }
>(({ 
  className, 
  glowOnHover = true, 
  glowColor = "rgba(59, 130, 246, 0.5)",
  borderColor = "white",
  borderWidth = "3px",
  shadowColor = "rgba(0, 0, 0, 0.1)",
  ...props 
}, ref) => (
  <motion.div
    className="relative"
    whileHover={
      glowOnHover 
        ? { scale: 1.05 } 
        : {}
    }
  >
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        "avatar-3d",
        className
      )}
      style={{
        border: `${borderWidth} solid ${borderColor}`,
        boxShadow: `0 10px 15px -3px ${shadowColor}, 0 4px 6px -2px ${shadowColor}`
      }}
      {...props}
    />
    {glowOnHover && (
      <motion.div
        className="absolute inset-0 rounded-full z-[-1]"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.7 }}
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />
    )}
  </motion.div>
))
Avatar3D.displayName = AvatarPrimitive.Root.displayName

const Avatar3DImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
Avatar3DImage.displayName = AvatarPrimitive.Image.displayName

const Avatar3DFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold",
      className
    )}
    {...props}
  />
))
Avatar3DFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar3D, Avatar3DImage, Avatar3DFallback }
