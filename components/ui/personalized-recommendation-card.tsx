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
  Dumbbell, 
  Apple, 
  Moon, 
  Heart, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Flame
} from "lucide-react"

interface PersonalizedRecommendationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  type: 'training' | 'nutrition' | 'recovery' | 'lifestyle'
  priority: 'low' | 'medium' | 'high'
  dataPoints?: Record<string, any>
  created: string
  implemented?: boolean
  result?: string
  onImplement?: () => void
  isImplementing?: boolean
  animationDelay?: number
}

const PersonalizedRecommendationCard = React.forwardRef<HTMLDivElement, PersonalizedRecommendationCardProps>(
  ({ 
    className, 
    title,
    description,
    type,
    priority,
    dataPoints,
    created,
    implemented = false,
    result,
    onImplement,
    isImplementing = false,
    animationDelay = 0,
    ...props 
  }, ref) => {
    const { animation } = useOrganicTheme()
    
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
    
    // Obtener icono según el tipo
    const getTypeIcon = () => {
      switch (type) {
        case 'training':
          return <Dumbbell className="h-5 w-5 text-purple-500" />
        case 'nutrition':
          return <Apple className="h-5 w-5 text-green-500" />
        case 'recovery':
          return <Moon className="h-5 w-5 text-blue-500" />
        case 'lifestyle':
          return <Heart className="h-5 w-5 text-red-500" />
        default:
          return <Brain className="h-5 w-5 text-yellow-500" />
      }
    }
    
    // Obtener color según la prioridad
    const getPriorityColor = () => {
      switch (priority) {
        case 'high':
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        case 'medium':
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
        case 'low':
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      }
    }
    
    // Formatear fecha
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })
    }
    
    // Renderizar el componente
    const content = (
      <Card 
        ref={ref}
        className={cn(
          "recommendation-card overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="flex items-start p-4">
          <div className="mr-4 mt-1">
            {getTypeIcon()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">{title}</h3>
              <Badge className={getPriorityColor()}>
                {priority === 'high' ? 'Alta' : 
                 priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {description}
            </p>
            
            {dataPoints && Object.keys(dataPoints).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(dataPoints).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="flex items-center gap-1">
                    {key.includes('response') && <ArrowUpRight className="h-3 w-3" />}
                    {key.includes('fatigue') && <Flame className="h-3 w-3" />}
                    {key.includes('adherence') && <CheckCircle className="h-3 w-3" />}
                    {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Generada el {formatDate(created)}
            </div>
          </div>
        </div>
        
        {implemented ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 border-t border-green-100 dark:border-green-800">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">Implementada</p>
                {result && <p className="text-green-600 dark:text-green-400 text-sm">{result}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
              Pendiente de implementación
            </span>
            {onImplement && (
              <Button 
                onClick={onImplement}
                disabled={isImplementing}
                size="sm"
              >
                {isImplementing ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Implementando...
                  </>
                ) : "Implementar"}
              </Button>
            )}
          </div>
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
PersonalizedRecommendationCard.displayName = "PersonalizedRecommendationCard"

export { PersonalizedRecommendationCard }
