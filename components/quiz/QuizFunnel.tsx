"use client"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Target,
  Clock,
  Calendar,
  Heart,
  Brain,
  Lightbulb
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AnimatedContainer,
  QuizStepTransition,
  ResultsAnimation,
  PaywallAnimation
} from "@/components/quiz/QuizAnimations"

// Types for quiz responses
export interface QuizResponses {
  goals: string[]
  currentSituation: string
  painPoints: string[]
  desiredOutcomes: string[]
  timeline: string
  importanceReason: string
  lifeChangeImpact: string
  [key: string]: any
}

// Props for the QuizFunnel component
interface QuizFunnelProps {
  onComplete: (responses: QuizResponses) => void
  onCancel?: () => void
  industry?: "fitness" | "nutrition" | "productivity" | "wellness" | "general"
  title?: string
  subtitle?: string
}

export function QuizFunnel({
  onComplete,
  onCancel,
  industry = "fitness",
  title = "Descubre tu plan personalizado",
  subtitle = "Responde estas preguntas para crear un plan adaptado a tus necesidades"
}: QuizFunnelProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<QuizResponses>({
    goals: [],
    currentSituation: "",
    painPoints: [],
    desiredOutcomes: [],
    timeline: "3-6 months",
    importanceReason: "",
    lifeChangeImpact: ""
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  // Industry-specific options
  const goalOptions = getIndustryOptions(industry, "goals")
  const painPointOptions = getIndustryOptions(industry, "painPoints")
  const outcomeOptions = getIndustryOptions(industry, "outcomes")
  const timelineOptions = [
    { value: "1-4 weeks", label: "1-4 semanas" },
    { value: "1-3 months", label: "1-3 meses" },
    { value: "3-6 months", label: "3-6 meses" },
    { value: "6-12 months", label: "6-12 meses" },
    { value: "1+ year", label: "Más de 1 año" }
  ]

  // Update responses
  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  // Toggle selection in array
  const toggleArraySelection = (key: string, value: string) => {
    setResponses(prev => {
      const currentArray = [...(prev[key] || [])]
      const index = currentArray.indexOf(value)

      if (index === -1) {
        return { ...prev, [key]: [...currentArray, value] }
      } else {
        currentArray.splice(index, 1)
        return { ...prev, [key]: currentArray }
      }
    })
  }

  // Quiz steps
  const steps = [
    {
      title: "Tus objetivos",
      description: "¿Qué quieres lograr?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona todos los objetivos que apliquen a tu situación actual.
          </p>
          <div className="space-y-3">
            {goalOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <Checkbox
                  id={`goal-${option.value}`}
                  checked={responses.goals.includes(option.value)}
                  onCheckedChange={() => toggleArraySelection("goals", option.value)}
                />
                <div className="grid gap-1">
                  <Label htmlFor={`goal-${option.value}`} className="font-medium">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Situación actual",
      description: "¿Dónde te encuentras ahora?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Describe brevemente tu situación actual relacionada con {getIndustryLabel(industry)}.
          </p>
          <Textarea
            placeholder={`Cuéntanos sobre tu situación actual en ${getIndustryLabel(industry).toLowerCase()}...`}
            value={responses.currentSituation}
            onChange={(e) => updateResponse("currentSituation", e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      )
    },
    {
      title: "Puntos de dolor",
      description: "¿Qué obstáculos enfrentas?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los desafíos que más te afectan actualmente.
          </p>
          <div className="space-y-3">
            {painPointOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <Checkbox
                  id={`pain-${option.value}`}
                  checked={responses.painPoints.includes(option.value)}
                  onCheckedChange={() => toggleArraySelection("painPoints", option.value)}
                />
                <div className="grid gap-1">
                  <Label htmlFor={`pain-${option.value}`} className="font-medium">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Resultados deseados",
      description: "¿Qué quieres conseguir?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los resultados que esperas obtener.
          </p>
          <div className="space-y-3">
            {outcomeOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <Checkbox
                  id={`outcome-${option.value}`}
                  checked={responses.desiredOutcomes.includes(option.value)}
                  onCheckedChange={() => toggleArraySelection("desiredOutcomes", option.value)}
                />
                <div className="grid gap-1">
                  <Label htmlFor={`outcome-${option.value}`} className="font-medium">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Plazo de tiempo",
      description: "¿En cuánto tiempo quieres ver resultados?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona el plazo en el que te gustaría alcanzar tus objetivos.
          </p>
          <RadioGroup
            value={responses.timeline}
            onValueChange={(value) => updateResponse("timeline", value)}
            className="space-y-3"
          >
            {timelineOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`timeline-${option.value}`} />
                <Label htmlFor={`timeline-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    },
    {
      title: "¿Por qué es importante para ti?",
      description: "Comparte tu motivación personal",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Entender tu motivación nos ayuda a personalizar mejor tu experiencia.
          </p>
          <Textarea
            placeholder="¿Por qué es importante para ti lograr estos objetivos?"
            value={responses.importanceReason}
            onChange={(e) => updateResponse("importanceReason", e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      )
    },
    {
      title: "Impacto en tu vida",
      description: "¿Cómo cambiará tu vida al lograr estos objetivos?",
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Visualizar el impacto positivo te ayudará a mantener la motivación.
          </p>
          <Textarea
            placeholder="Describe cómo cambiará tu vida cuando logres estos objetivos..."
            value={responses.lifeChangeImpact}
            onChange={(e) => updateResponse("lifeChangeImpact", e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      )
    }
  ]

  // Navigate between steps
  const nextStep = () => {
    // Validate current step
    if (currentStep === 0 && responses.goals.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Selecciona al menos un objetivo",
        variant: "destructive"
      })
      return
    }

    if (currentStep === 1 && !responses.currentSituation.trim()) {
      toast({
        title: "Respuesta requerida",
        description: "Por favor describe tu situación actual",
        variant: "destructive"
      })
      return
    }

    if (currentStep === 2 && responses.painPoints.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Selecciona al menos un punto de dolor",
        variant: "destructive"
      })
      return
    }

    if (currentStep === 3 && responses.desiredOutcomes.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Selecciona al menos un resultado deseado",
        variant: "destructive"
      })
      return
    }

    setIsAnimating(true)

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // Show results animation before showing paywall
        setShowResults(true)

        // After showing results, show paywall
        setTimeout(() => {
          setShowResults(false)
          setShowPaywall(true)
        }, 3000)
      }
      setIsAnimating(false)
    }, 500)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 500)
    } else if (onCancel) {
      onCancel()
    }
  }

  // Complete quiz and pass responses to parent
  const completeQuiz = () => {
    onComplete(responses)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!showResults && !showPaywall && (
        <AnimatedContainer type="fade" speed="normal">
          <Card3D className="w-full">
            <Card3DHeader>
              <div className="flex items-center justify-between">
                <Card3DTitle>{steps[currentStep].title}</Card3DTitle>
                <span className="text-sm text-muted-foreground">
                  Paso {currentStep + 1} de {steps.length}
                </span>
              </div>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
              <Progress3D
                value={(currentStep + 1) / steps.length * 100}
                className="mt-2"
                animate={true}
              />
            </Card3DHeader>
            <Card3DContent>
              <QuizStepTransition
                step={currentStep}
                direction={isAnimating ? "forward" : "backward"}
                className="space-y-6"
              >
                {steps[currentStep].component}

                <div className="flex justify-between pt-4">
                  <Button3D
                    variant="outline"
                    onClick={prevStep}
                  >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button3D>
                      <Button3D onClick={nextStep}>
                        {currentStep === steps.length - 1 ? (
                          <>
                            Finalizar
                            <Sparkles className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Siguiente
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button3D>
                    </div>
                  </QuizStepTransition>
                </Card3DContent>
              </Card3D>
            </AnimatedContainer>
          )}

          {showResults && (
            <ResultsAnimation isVisible={showResults} className="text-center py-12">
              <AnimatedContainer type="scale" speed="normal" delay={0.3} className="mb-6 inline-block">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </AnimatedContainer>

              <AnimatedContainer type="slideUp" speed="normal" delay={0.6} className="mb-3">
                <h2 className="text-2xl font-bold">¡Análisis completado!</h2>
              </AnimatedContainer>

              <AnimatedContainer type="slideUp" speed="normal" delay={0.8} className="mb-6">
                <p className="text-muted-foreground">
                  Estamos preparando tu plan personalizado...
                </p>
              </AnimatedContainer>

              <AnimatedContainer type="scale" speed="normal" delay={1.0}>
                <Progress3D value={100} className="w-full max-w-xs mx-auto" animate={true} animationDuration={2} />
              </AnimatedContainer>
            </ResultsAnimation>
          )}

        {showPaywall && (
          <PaywallAnimation isVisible={showPaywall}>
            <PaywallComponent onComplete={completeQuiz} />
          </PaywallAnimation>
        )}
    </div>
  )
}

// Paywall component with price anchoring
function PaywallComponent({ onComplete }: { onComplete: () => void }) {
  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <Card3DTitle>Tu plan personalizado está listo</Card3DTitle>
        <p className="text-muted-foreground">
          Elige tu plan para acceder a tu programa personalizado
        </p>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 relative">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                <Badge className="bg-blue-500">Popular</Badge>
              </div>
              <h3 className="font-bold text-lg mb-2">Plan Anual</h3>
              <div className="flex items-baseline mb-1">
                <span className="text-3xl font-bold">€8,25</span>
                <span className="text-sm text-muted-foreground ml-1">/mes</span>
              </div>
              <div className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded mb-4">
                Ahorra un 45%
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Facturado anualmente como €99
              </p>
              <Button3D className="w-full" onClick={onComplete}>
                Comenzar ahora
              </Button3D>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Plan Mensual</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">€14,99</span>
                <span className="text-sm text-muted-foreground ml-1">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Facturado mensualmente
              </p>
              <Button3D variant="outline" className="w-full" onClick={onComplete}>
                Elegir plan mensual
              </Button3D>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Todos los planes incluyen:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Plan personalizado basado en tus respuestas</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Actualizaciones y ajustes continuos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Acceso a todas las funciones premium</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  )
}

// Helper functions for industry-specific options
function getIndustryOptions(industry: string, type: string) {
  const options: Record<string, Record<string, any[]>> = {
    fitness: {
      goals: [
        { value: "lose_weight", label: "Perder peso", description: "Reducir grasa corporal y mejorar composición corporal" },
        { value: "build_muscle", label: "Ganar músculo", description: "Aumentar masa muscular y fuerza" },
        { value: "improve_fitness", label: "Mejorar condición física", description: "Aumentar resistencia y rendimiento general" },
        { value: "athletic_performance", label: "Rendimiento deportivo", description: "Mejorar en un deporte o actividad específica" },
        { value: "health", label: "Mejorar salud", description: "Mejorar marcadores de salud y bienestar general" }
      ],
      painPoints: [
        { value: "no_time", label: "Falta de tiempo para entrenar" },
        { value: "plateau", label: "Estancamiento en resultados" },
        { value: "motivation", label: "Falta de motivación" },
        { value: "injuries", label: "Lesiones recurrentes" },
        { value: "confusion", label: "Confusión sobre qué ejercicios hacer" }
      ],
      outcomes: [
        { value: "weight_loss", label: "Pérdida de peso visible" },
        { value: "muscle_definition", label: "Mayor definición muscular" },
        { value: "strength", label: "Aumento de fuerza" },
        { value: "endurance", label: "Mayor resistencia" },
        { value: "confidence", label: "Más confianza en mi cuerpo" }
      ]
    },
    nutrition: {
      goals: [
        { value: "weight_management", label: "Control de peso", description: "Alcanzar y mantener un peso saludable" },
        { value: "energy", label: "Más energía", description: "Optimizar la alimentación para mayor vitalidad" },
        { value: "health_markers", label: "Mejorar marcadores de salud", description: "Optimizar colesterol, azúcar en sangre, etc." },
        { value: "performance", label: "Rendimiento deportivo", description: "Nutrición para optimizar el rendimiento físico" },
        { value: "habits", label: "Mejorar hábitos alimenticios", description: "Desarrollar una relación más saludable con la comida" }
      ],
      painPoints: [
        { value: "cravings", label: "Antojos frecuentes" },
        { value: "meal_planning", label: "Dificultad para planificar comidas" },
        { value: "time", label: "Falta de tiempo para cocinar" },
        { value: "knowledge", label: "Confusión sobre qué comer" },
        { value: "consistency", label: "Falta de consistencia" }
      ],
      outcomes: [
        { value: "weight_control", label: "Control de peso sostenible" },
        { value: "more_energy", label: "Niveles de energía estables" },
        { value: "better_digestion", label: "Mejor digestión" },
        { value: "improved_health", label: "Mejores marcadores de salud" },
        { value: "food_freedom", label: "Libertad alimentaria sin culpa" }
      ]
    },
    productivity: {
      goals: [
        { value: "time_management", label: "Gestión del tiempo", description: "Optimizar el uso del tiempo diario" },
        { value: "focus", label: "Mejorar concentración", description: "Aumentar la capacidad de enfoque en tareas" },
        { value: "work_life_balance", label: "Equilibrio trabajo-vida", description: "Encontrar armonía entre obligaciones y descanso" },
        { value: "goal_achievement", label: "Logro de objetivos", description: "Completar proyectos y alcanzar metas" },
        { value: "stress_reduction", label: "Reducir estrés", description: "Manejar mejor la presión y las responsabilidades" }
      ],
      painPoints: [
        { value: "procrastination", label: "Procrastinación" },
        { value: "distractions", label: "Distracciones constantes" },
        { value: "overwhelm", label: "Sensación de agobio" },
        { value: "prioritization", label: "Dificultad para priorizar" },
        { value: "burnout", label: "Agotamiento" }
      ],
      outcomes: [
        { value: "more_done", label: "Completar más tareas importantes" },
        { value: "less_stress", label: "Reducción del estrés" },
        { value: "better_focus", label: "Mayor capacidad de concentración" },
        { value: "work_life", label: "Mejor equilibrio trabajo-vida" },
        { value: "goal_progress", label: "Progreso constante en objetivos" }
      ]
    },
    wellness: {
      goals: [
        { value: "stress_management", label: "Manejo del estrés", description: "Reducir y gestionar mejor el estrés diario" },
        { value: "sleep", label: "Mejorar el sueño", description: "Optimizar calidad y cantidad de sueño" },
        { value: "mental_health", label: "Salud mental", description: "Mejorar bienestar psicológico general" },
        { value: "mindfulness", label: "Mindfulness", description: "Desarrollar mayor presencia y atención plena" },
        { value: "holistic_health", label: "Salud integral", description: "Equilibrio entre cuerpo, mente y espíritu" }
      ],
      painPoints: [
        { value: "stress", label: "Niveles altos de estrés" },
        { value: "sleep_issues", label: "Problemas de sueño" },
        { value: "anxiety", label: "Ansiedad" },
        { value: "balance", label: "Falta de equilibrio" },
        { value: "energy", label: "Bajos niveles de energía" }
      ],
      outcomes: [
        { value: "calm", label: "Mayor calma y tranquilidad" },
        { value: "better_sleep", label: "Sueño reparador" },
        { value: "emotional_balance", label: "Equilibrio emocional" },
        { value: "presence", label: "Mayor presencia en el día a día" },
        { value: "resilience", label: "Aumento de resiliencia" }
      ]
    },
    general: {
      goals: [
        { value: "improvement", label: "Mejora personal", description: "Desarrollo general de habilidades y capacidades" },
        { value: "learning", label: "Aprendizaje", description: "Adquirir nuevos conocimientos" },
        { value: "lifestyle", label: "Cambio de estilo de vida", description: "Transformar hábitos diarios" },
        { value: "challenge", label: "Superar desafíos", description: "Vencer obstáculos específicos" },
        { value: "growth", label: "Crecimiento personal", description: "Evolución y desarrollo integral" }
      ],
      painPoints: [
        { value: "stagnation", label: "Estancamiento" },
        { value: "uncertainty", label: "Incertidumbre" },
        { value: "lack_direction", label: "Falta de dirección" },
        { value: "motivation", label: "Problemas de motivación" },
        { value: "consistency", label: "Falta de consistencia" }
      ],
      outcomes: [
        { value: "confidence", label: "Mayor confianza" },
        { value: "clarity", label: "Claridad de propósito" },
        { value: "achievement", label: "Logro de objetivos" },
        { value: "satisfaction", label: "Satisfacción personal" },
        { value: "growth", label: "Crecimiento continuo" }
      ]
    }
  }

  return options[industry]?.[type] || options.general[type]
}

function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    fitness: "Fitness",
    nutrition: "Nutrición",
    productivity: "Productividad",
    wellness: "Bienestar",
    general: "Desarrollo Personal"
  }

  return labels[industry] || "Desarrollo Personal"
}
