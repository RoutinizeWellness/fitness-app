"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Check, Info, Award, Dumbbell, Brain } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"
import { ExperienceLevel } from "@/lib/services/user-experience-service"

interface ExperienceAssessmentProps {
  onComplete?: (level: ExperienceLevel) => void
  className?: string
}

// Preguntas para evaluar el nivel de experiencia
const ASSESSMENT_QUESTIONS = [
  {
    id: "training_experience",
    question: "¿Cuánto tiempo llevas entrenando de forma regular?",
    options: [
      { value: "none", label: "No entreno regularmente", points: 0 },
      { value: "less_than_6_months", label: "Menos de 6 meses", points: 1 },
      { value: "6_months_to_2_years", label: "Entre 6 meses y 2 años", points: 2 },
      { value: "2_to_5_years", label: "Entre 2 y 5 años", points: 3 },
      { value: "more_than_5_years", label: "Más de 5 años", points: 4 }
    ]
  },
  {
    id: "training_frequency",
    question: "¿Con qué frecuencia entrenas?",
    options: [
      { value: "rarely", label: "Rara vez o nunca", points: 0 },
      { value: "1_2_times", label: "1-2 veces por semana", points: 1 },
      { value: "3_4_times", label: "3-4 veces por semana", points: 2 },
      { value: "5_6_times", label: "5-6 veces por semana", points: 3 },
      { value: "daily", label: "Diariamente o múltiples veces al día", points: 4 }
    ]
  },
  {
    id: "exercise_knowledge",
    question: "¿Cuál es tu nivel de conocimiento sobre ejercicios y técnicas?",
    options: [
      { value: "none", label: "No conozco muchos ejercicios", points: 0 },
      { value: "basic", label: "Conozco los ejercicios básicos", points: 1 },
      { value: "intermediate", label: "Conozco variaciones y técnicas intermedias", points: 2 },
      { value: "advanced", label: "Conozco técnicas avanzadas y biomecánica", points: 3 },
      { value: "expert", label: "Conocimiento profesional/certificado", points: 4 }
    ]
  },
  {
    id: "nutrition_knowledge",
    question: "¿Cuál es tu nivel de conocimiento sobre nutrición?",
    options: [
      { value: "none", label: "No presto atención a mi alimentación", points: 0 },
      { value: "basic", label: "Conozco conceptos básicos (proteínas, carbos, grasas)", points: 1 },
      { value: "intermediate", label: "Controlo mis macros y calorías", points: 2 },
      { value: "advanced", label: "Planifico mi nutrición con precisión", points: 3 },
      { value: "expert", label: "Conocimiento profesional/certificado", points: 4 }
    ]
  },
  {
    id: "training_planning",
    question: "¿Cómo planificas tus entrenamientos?",
    options: [
      { value: "none", label: "No sigo un plan específico", points: 0 },
      { value: "basic", label: "Sigo rutinas predefinidas", points: 1 },
      { value: "intermediate", label: "Creo mis propias rutinas", points: 2 },
      { value: "advanced", label: "Uso periodización y ajusto variables", points: 3 },
      { value: "expert", label: "Planifico macrociclos completos", points: 4 }
    ]
  }
]

export function ExperienceAssessment({
  onComplete,
  className = ""
}: ExperienceAssessmentProps) {
  const { updateExperienceLevel, updateInterfaceMode } = useUserExperience()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Calcular progreso
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100
  
  // Manejar selección de respuesta
  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [ASSESSMENT_QUESTIONS[currentQuestion].id]: value
    })
  }
  
  // Avanzar a la siguiente pregunta
  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }
  
  // Retroceder a la pregunta anterior
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }
  
  // Calcular nivel de experiencia basado en las respuestas
  const calculateExperienceLevel = (): ExperienceLevel => {
    let totalPoints = 0
    let maxPossiblePoints = 0
    
    // Sumar puntos de todas las respuestas
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.value === answerValue)
        if (option) {
          totalPoints += option.points
        }
        
        // Calcular puntos máximos posibles
        const maxPoints = Math.max(...question.options.map(o => o.points))
        maxPossiblePoints += maxPoints
      }
    })
    
    // Calcular porcentaje del máximo posible
    const percentage = (totalPoints / maxPossiblePoints) * 100
    
    // Determinar nivel basado en el porcentaje
    if (percentage < 20) return 'amateur_zero'
    if (percentage < 40) return 'beginner'
    if (percentage < 70) return 'intermediate'
    if (percentage < 90) return 'advanced'
    return 'expert'
  }
  
  // Enviar evaluación
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Calcular nivel de experiencia
      const level = calculateExperienceLevel()
      
      // Actualizar nivel de experiencia en el perfil
      const success = await updateExperienceLevel(
        level,
        "Evaluación inicial",
        Object.values(answers).reduce((sum, answer) => {
          const question = ASSESSMENT_QUESTIONS.find(q => q.options.some(o => o.value === answer))
          const option = question?.options.find(o => o.value === answer)
          return sum + (option?.points || 0)
        }, 0)
      )
      
      if (success) {
        // Establecer modo de interfaz según nivel
        const interfaceMode = ['amateur_zero', 'beginner'].includes(level) ? 'beginner' : 'advanced'
        await updateInterfaceMode(interfaceMode)
        
        toast({
          title: "Evaluación completada",
          description: `Tu nivel de experiencia es: ${getLevelLabel(level)}`,
        })
        
        // Llamar al callback si existe
        if (onComplete) {
          onComplete(level)
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar tu nivel de experiencia.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al enviar evaluación:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la evaluación.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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
  
  // Verificar si se puede avanzar
  const canProceed = ASSESSMENT_QUESTIONS[currentQuestion].id in answers
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Evaluación de experiencia</Card3DTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Esta evaluación nos ayuda a personalizar tu experiencia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pregunta {currentQuestion + 1} de {ASSESSMENT_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="min-h-[200px]">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">
                {ASSESSMENT_QUESTIONS[currentQuestion].question}
              </h3>
              
              <RadioGroup
                value={answers[ASSESSMENT_QUESTIONS[currentQuestion].id] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {ASSESSMENT_QUESTIONS[currentQuestion].options.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                    />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || isSubmitting}
            >
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
            >
              {currentQuestion < ASSESSMENT_QUESTIONS.length - 1 ? (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Finalizar
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
