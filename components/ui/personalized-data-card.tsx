"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"
import { 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  Info
} from "lucide-react"

interface PersonalizedDataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value?: number | string
  icon?: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive?: boolean
    label?: string
  }
  formatter?: (value: number | string) => string
  category?: 'training' | 'nutrition' | 'sleep' | 'wellness' | 'productivity'
  priority?: 'low' | 'medium' | 'high'
  actionLabel?: string
  onAction?: () => void
  animationDelay?: number
  variant?: "default" | "outline" | "glass" | "gradient"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const PersonalizedDataCard = React.forwardRef<HTMLDivElement, PersonalizedDataCardProps>(
  ({ 
    className, 
    title,
    value,
    icon,
    description,
    trend,
    formatter = (value) => `${value}`,
    category = 'training',
    priority = 'medium',
    actionLabel,
    onAction,
    animationDelay = 0,
    variant = "default",
    size = "md",
    isLoading = false,
    ...props 
  }, ref) => {
    const { animation, isDark } = useOrganicTheme()
    
    // Determinar si se deben usar animaciones
    const shouldAnimate = animation !== "none"
    const isPlayful = animation === "playful"
    
    // Configurar las animaciones
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          delay: animationDelay,
          ease: isPlayful ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    const valueVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.5,
          delay: animationDelay + 0.2,
          ease: isPlayful ? [0.34, 1.56, 0.64, 1] : [0.43, 0.13, 0.23, 0.96]
        }
      }
    }
    
    // Determinar el color según la categoría
    const getCategoryColor = () => {
      switch (category) {
        case 'training':
          return 'var(--training-color)'
        case 'nutrition':
          return 'var(--nutrition-color)'
        case 'sleep':
          return 'var(--sleep-color)'
        case 'wellness':
          return 'var(--wellness-color)'
        case 'productivity':
          return 'var(--productivity-color)'
        default:
          return 'var(--training-color)'
      }
    }
    
    // Determinar el color según la prioridad
    const getPriorityColor = () => {
      switch (priority) {
        case 'high':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        case 'medium':
          return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        case 'low':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      }
    }
    
    // Determinar el tamaño
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'p-4'
        case 'lg':
          return 'p-6'
        default:
          return 'p-5'
      }
    }
    
    // Determinar la variante
    const getVariantClasses = () => {
      switch (variant) {
        case 'outline':
          return 'bg-background border border-border'
        case 'glass':
          return 'bg-background/80 backdrop-blur-md border border-border/50'
        case 'gradient':
          return `bg-gradient-to-br from-${category} to-${category}/80 text-white`
        default:
          return 'bg-background'
      }
    }
    
    // Renderizar el componente
    const content = (
      <Card 
        ref={ref}
        className={cn(
          "card-organic overflow-hidden",
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {icon && (
              <div 
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full mr-3",
                  `bg-${category}/10`
                )}
                style={{ color: `hsl(${getCategoryColor()})` }}
              >
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                {priority && (
                  <Badge className={cn("ml-2 text-xs", getPriorityColor())}>
                    {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                )}
              </div>
              
              {value !== undefined && (
                <motion.div
                  variants={valueVariants}
                  initial={shouldAnimate ? "hidden" : "visible"}
                  animate="visible"
                  className={cn(
                    "text-2xl font-bold mt-1",
                    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
                  )}
                  style={{ color: variant === 'gradient' ? 'white' : `hsl(${getCategoryColor()})` }}
                >
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    formatter(value)
                  )}
                </motion.div>
              )}
            </div>
          </div>
          
          {trend && (
            <div 
              className={cn(
                "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                trend.isPositive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : 
                                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
              {trend.label && <span className="ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
        
        {description && (
          <p className={cn(
            "text-sm mt-2",
            variant === 'gradient' ? 'text-white/90' : 'text-muted-foreground'
          )}>
            {description}
          </p>
        )}
        
        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className={cn(
              "mt-4 px-0",
              variant === 'gradient' ? 'text-white hover:text-white hover:bg-white/10' : ''
            )}
          >
            {actionLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </Card>
    )
    
    // Aplicar animación si está habilitada
    if (shouldAnimate) {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {content}
        </motion.div>
      )
    }
    
    return content
  }
)
PersonalizedDataCard.displayName = "PersonalizedDataCard"

export { PersonalizedDataCard }
