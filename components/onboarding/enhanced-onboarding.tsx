"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Check, Dumbbell, Brain, Apple, Moon, Zap } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"
import { ExperienceLevel } from "@/lib/services/user-experience-service"
import { ExperienceAssessment } from "@/components/onboarding/experience-assessment"
import { supabase } from "@/lib/supabase-client"

interface EnhancedOnboardingProps {
  userId: string
  onComplete?: () => void
  redirectPath?: string
}

// Pasos del onboarding
const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Bienvenido a Routinize",
    description: "La plataforma integral para gestionar tu bienestar físico y mental",
    icon: <Dumbbell className="h-8 w-8 text-primary" />
  },
  {
    id: "experience",
    title: "Evaluación de experiencia",
    description: "Personaliza tu experiencia según tu nivel",
    icon: <Brain className="h-8 w-8 text-primary" />
  },
  {
    id: "modules",
    title: "Módulos disponibles",
    description: "Descubre todas las herramientas a tu disposición",
    icon: <Zap className="h-8 w-8 text-primary" />
  },
  {
    id: "complete",
    title: "¡Todo listo!",
    description: "Comienza tu viaje hacia un mejor bienestar",
    icon: <Check className="h-8 w-8 text-primary" />
  }
]

// Módulos de la aplicación
const APP_MODULES = [
  {
    id: "training",
    title: "Entrenamiento",
    description: "Rutinas personalizadas, seguimiento de progreso y más",
    icon: <Dumbbell className="h-6 w-6 text-primary" />
  },
  {
    id: "nutrition",
    title: "Nutrición",
    description: "Planes de alimentación, seguimiento de macros y recetas",
    icon: <Apple className="h-6 w-6 text-primary" />
  },
  {
    id: "sleep",
    title: "Sueño",
    description: "Optimización del descanso y hábitos de sueño",
    icon: <Moon className="h-6 w-6 text-primary" />
  },
  {
    id: "productivity",
    title: "Productividad",
    description: "Gestión de hábitos y optimización del tiempo",
    icon: <Zap className="h-6 w-6 text-primary" />
  }
]

export function EnhancedOnboarding({
  userId,
  onComplete,
  redirectPath = "/dashboard"
}: EnhancedOnboardingProps) {
  const router = useRouter()
  const { updateExperienceLevel } = useUserExperience()
  const [currentStep, setCurrentStep] = useState(0)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Calcular progreso
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  
  // Avanzar al siguiente paso
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }
  
  // Retroceder al paso anterior
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  // Manejar finalización de la evaluación de experiencia
  const handleExperienceAssessmentComplete = (level: ExperienceLevel) => {
    setExperienceLevel(level)
    handleNext()
  }
  
  // Completar onboarding
  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      // Marcar onboarding como completado en Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (error) {
        throw error
      }
      
      toast({
        title: "¡Onboarding completado!",
        description: "Tu experiencia ha sido personalizada según tus preferencias.",
      })
      
      // Llamar al callback si existe
      if (onComplete) {
        onComplete()
      } else {
        // Redirigir a la ruta especificada
        router.push(redirectPath)
      }
    } catch (error) {
      console.error("Error al completar onboarding:", error)
      toast({
        title: "Error",
        description: "No se pudo completar el proceso de onboarding.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep]
    
    switch (step.id) {
      case "welcome":
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              {step.icon}
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.description}</p>
            <p className="mb-6">
              Vamos a personalizar tu experiencia para que se adapte perfectamente a tus necesidades y nivel de experiencia.
            </p>
            <Button onClick={handleNext}>
              Comenzar
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      
      case "experience":
        return (
          <ExperienceAssessment
            onComplete={handleExperienceAssessmentComplete}
          />
        )
      
      case "modules":
        return (
          <div className="py-6">
            <h2 className="text-xl font-bold mb-4">{step.title}</h2>
            <p className="text-muted-foreground mb-6">{step.description}</p>
            
            <div className="space-y-4 mb-8">
              {APP_MODULES.map(module => (
                <div key={module.id} className="flex items-start p-4 border rounded-lg">
                  <div className="mr-4 mt-1">
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Anterior
              </Button>
              <Button onClick={handleNext}>
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      
      case "complete":
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                {step.icon}
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
            <p className="text-muted-foreground mb-6">{step.description}</p>
            
            {experienceLevel && (
              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <p className="font-medium">Tu nivel de experiencia: {getLevelLabel(experienceLevel)}</p>
                <p className="text-sm text-muted-foreground">
                  La interfaz ha sido adaptada a tu nivel de experiencia.
                </p>
              </div>
            )}
            
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Cargando..." : "Comenzar a usar Routinize"}
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }
  
  // Obtener etiqueta para el nivel de experiencia
  const getLevelLabel = (level: ExperienceLevel): string => {
    switch (level) {
      case 'amateur_zero': return 'Principiante absoluto'
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      case 'expert': return 'Experto'
      default: return 'Desconocido'
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card3D>
        <Card3DHeader>
          <div className="flex justify-between items-center">
            <Card3DTitle>Configuración inicial</Card3DTitle>
            <div className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {ONBOARDING_STEPS.length}
            </div>
          </div>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
