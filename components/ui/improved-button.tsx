"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
        gradient: "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground hover:brightness-105 hover:shadow-md",
        subtle: "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-sm",
        success: "bg-green-500 text-white hover:bg-green-600 hover:shadow-md",
        warning: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md",
        info: "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md",
        // Variantes con colores específicos de la app
        primary: "bg-[#FDA758] text-white hover:bg-[#FDA758]/90 hover:shadow-md",
        green: "bg-[#5DE292] text-white hover:bg-[#5DE292]/90 hover:shadow-md",
        purple: "bg-[#8C80F8] text-white hover:bg-[#8C80F8]/90 hover:shadow-md",
        pink: "bg-[#FF7285] text-white hover:bg-[#FF7285]/90 hover:shadow-md",
        blue: "bg-[#5CC2FF] text-white hover:bg-[#5CC2FF]/90 hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-xl text-xs",
        lg: "h-12 px-8 py-3 rounded-xl text-base",
        xl: "h-14 px-10 py-4 rounded-xl text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
      shape: {
        default: "rounded-xl",
        rounded: "rounded-full",
        square: "rounded-md",
        pill: "rounded-full px-6",
        organic: "rounded-[24px]",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      animation: "none",
      shadow: "sm",
      width: "auto",
    },
  }
)

export interface ImprovedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  withEffect?: "scale" | "lift" | "rotate" | "pulse" | "none"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconSpacing?: number
  loaderPosition?: "left" | "right" | "center"
  loaderSize?: number
  loaderColor?: string
  feedback?: "none" | "haptic" | "sound"
}

const ImprovedButton = React.forwardRef<HTMLButtonElement, ImprovedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    animation,
    shadow,
    width,
    asChild = false, 
    isLoading, 
    loadingText, 
    withEffect = "scale", 
    leftIcon,
    rightIcon,
    iconSpacing = 2,
    loaderPosition = "left",
    loaderSize = 16,
    loaderColor,
    feedback = "none",
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : motion.button
    
    // Configuración de efectos
    const effectVariants = {
      scale: {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
      },
      lift: {
        whileHover: { y: -2, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
        whileTap: { y: 0, boxShadow: "0 0px 0px rgba(0,0,0,0)" },
      },
      rotate: {
        whileHover: { rotate: 2 },
        whileTap: { rotate: 0 },
      },
      pulse: {
        whileHover: { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 1 } },
        whileTap: { scale: 0.97 },
      },
      none: {
        whileHover: {},
        whileTap: {},
      },
    }
    
    const currentEffect = effectVariants[withEffect]
    
    // Manejar feedback táctil
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (feedback === "haptic" && navigator.vibrate) {
        navigator.vibrate(50); // Vibración de 50ms
      } else if (feedback === "sound") {
        // Reproducir un sonido sutil
        const audio = new Audio("/sounds/click.mp3");
        audio.volume = 0.2;
        audio.play().catch(e => console.log("Audio playback failed:", e));
      }
      
      if (onClick) {
        onClick(e);
      }
    };
    
    // Renderizar el loader según la posición
    const renderLoader = () => (
      <span 
        className={cn(
          "inline-block animate-spin",
          loaderPosition === "center" && !loadingText ? "absolute" : ""
        )}
        style={{ width: loaderSize, height: loaderSize }}
      >
        <Loader2 
          style={{ 
            width: loaderSize, 
            height: loaderSize,
            color: loaderColor || "currentColor"
          }} 
        />
      </span>
    );
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            shape,
            animation,
            shadow,
            width,
            className 
          }),
          isLoading && "relative",
          isLoading && loaderPosition === "center" && !loadingText && "text-transparent"
        )}
        ref={ref}
        {...currentEffect}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && loaderPosition === "left" && renderLoader()}
        {!isLoading && leftIcon && (
          <span className={cn(`mr-${iconSpacing}`)}>{leftIcon}</span>
        )}
        
        {isLoading && loaderPosition === "center" && renderLoader()}
        
        {isLoading && loadingText ? loadingText : children}
        
        {!isLoading && rightIcon && (
          <span className={cn(`ml-${iconSpacing}`)}>{rightIcon}</span>
        )}
        {isLoading && loaderPosition === "right" && renderLoader()}
      </Comp>
    )
  }
)
ImprovedButton.displayName = "ImprovedButton"

export { ImprovedButton, buttonVariants }
