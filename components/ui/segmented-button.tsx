"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const segmentedButtonVariants = cva(
  "relative flex rounded-lg p-1 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gray-100",
        primary: "bg-[#FDA758]/10",
        green: "bg-[#5DE292]/10",
        purple: "bg-[#8C80F8]/10",
        pink: "bg-[#FF7285]/10",
        blue: "bg-[#5CC2FF]/10",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      shape: {
        default: "rounded-lg",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      shape: "default",
    },
  }
)

const segmentedItemVariants = cva(
  "relative z-10 flex-1 flex items-center justify-center px-3 py-1.5 font-medium transition-colors duration-200",
  {
    variants: {
      size: {
        sm: "text-xs py-1",
        md: "text-sm py-1.5",
        lg: "text-base py-2",
      },
      active: {
        true: "text-primary-foreground",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      active: false,
    },
  }
)

export interface SegmentedButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof segmentedButtonVariants> {
  options: {
    value: string
    label: React.ReactNode
    icon?: React.ReactNode
  }[]
  value: string
  onChange: (value: string) => void
  indicatorColor?: string
}

const SegmentedButton = React.forwardRef<HTMLDivElement, SegmentedButtonProps>(
  ({ 
    className, 
    variant, 
    size,
    fullWidth,
    shape,
    options,
    value,
    onChange,
    indicatorColor,
    ...props 
  }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(0)
    const itemsRef = React.useRef<(HTMLButtonElement | null)[]>([])
    
    // Actualizar el índice activo cuando cambia el valor
    React.useEffect(() => {
      const index = options.findIndex(option => option.value === value)
      if (index !== -1) {
        setActiveIndex(index)
      }
    }, [value, options])
    
    // Manejar el cambio de opción
    const handleChange = (value: string, index: number) => {
      onChange(value)
      setActiveIndex(index)
    }
    
    // Determinar el color del indicador según la variante
    const getIndicatorColor = () => {
      if (indicatorColor) return indicatorColor
      
      switch (variant) {
        case "primary": return "#FDA758"
        case "green": return "#5DE292"
        case "purple": return "#8C80F8"
        case "pink": return "#FF7285"
        case "blue": return "#5CC2FF"
        default: return "white"
      }
    }
    
    return (
      <div
        className={cn(
          segmentedButtonVariants({ 
            variant, 
            size,
            fullWidth,
            shape,
            className 
          })
        )}
        ref={ref}
        {...props}
      >
        {/* Indicador de selección */}
        {itemsRef.current[activeIndex] && (
          <motion.div
            className={cn(
              "absolute z-0 rounded-md shadow-sm",
              shape === "rounded" ? "rounded-full" : "rounded-md"
            )}
            style={{
              backgroundColor: getIndicatorColor(),
              width: itemsRef.current[activeIndex]?.offsetWidth,
              height: itemsRef.current[activeIndex]?.offsetHeight,
            }}
            initial={false}
            animate={{
              x: itemsRef.current[activeIndex]?.offsetLeft,
              y: itemsRef.current[activeIndex]?.offsetTop,
              width: itemsRef.current[activeIndex]?.offsetWidth,
              height: itemsRef.current[activeIndex]?.offsetHeight,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        
        {/* Opciones */}
        {options.map((option, index) => (
          <button
            key={option.value}
            ref={el => (itemsRef.current[index] = el)}
            className={cn(
              segmentedItemVariants({ 
                size,
                active: value === option.value
              }),
              shape === "rounded" ? "rounded-full" : "rounded-md"
            )}
            onClick={() => handleChange(option.value, index)}
            type="button"
          >
            {option.icon && (
              <span className="mr-1.5">{option.icon}</span>
            )}
            {option.label}
          </button>
        ))}
      </div>
    )
  }
)
SegmentedButton.displayName = "SegmentedButton"

export { SegmentedButton, segmentedButtonVariants }
