"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dumbbell,
  Sparkles,
  ArrowLeft,
  Loader2,
  Brain,
  Calendar,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAI } from "@/contexts/ai-context"
import TrainingInitialAssessment from "@/components/training/initial-assessment"
import { getTrainingProfile } from "@/lib/training-personalization-service"
import { generateWorkoutPlan } from "@/lib/workout-plan-generator"
import { generateWorkoutPlanWithEdgeFunction } from "@/lib/edge-functions-service"
import { AIWorkoutPlan } from "@/lib/ai-types"

export default function GeneratePlanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { generateWorkoutPlan, savePlan } = useAI()

  const [activeTab, setActiveTab] = useState("assessment")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasAssessment, setHasAssessment] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<AIWorkoutPlan | null>(null)

  // Form state
  const [goal, setGoal] = useState('hipertrofia')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [duration, setDuration] = useState(8)
  const [focusAreas, setFocusAreas] = useState<string[]>(['pecho', 'espalda', 'piernas', 'hombros'])
  const [limitations, setLimitations] = useState<string[]>([])

  // Verificar si el usuario ya tiene una evaluación y detectar parámetros de URL
  useEffect(() => {
    const checkAssessment = async () => {
      if (!user) return

      try {
        const { data, error } = await getTrainingProfile(user.id)

        if (!error && data) {
          setHasAssessment(true)

          // Verificar si hay un parámetro tab=generate en la URL
          const urlParams = new URLSearchParams(window.location.search)
          const tabParam = urlParams.get('tab')

          if (tabParam === 'generate') {
            setActiveTab('generate')
          }
        }
      } catch (error) {
        console.error("Error al verificar la evaluación:", error)
      }
    }

    checkAssessment()
  }, [user])

  // Handle focus area toggle
  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area))
    } else {
      setFocusAreas([...focusAreas, area])
    }
  }

  // Handle limitation toggle
  const toggleLimitation = (limitation: string) => {
    if (limitations.includes(limitation)) {
      setLimitations(limitations.filter(l => l !== limitation))
    } else {
      setLimitations([...limitations, limitation])
    }
  }

  // Generar plan de entrenamiento con IA
  const handleGeneratePlan = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para generar un plan",
        variant: "destructive",
      })
      return
    }

    if (focusAreas.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un área de enfoque',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      const preferences = {
        goal,
        level,
        daysPerWeek,
        focusAreas,
        duration,
        limitations: limitations.length > 0 ? limitations : undefined
      }

      console.log("Generando plan con IA usando preferencias:", preferences)
      const plan = await generateWorkoutPlan(preferences)

      if (plan) {
        console.log("Plan generado exitosamente:", plan)
        setGeneratedPlan(plan)
        setActiveTab('preview')

        toast({
          title: "Plan generado",
          description: "Tu plan de entrenamiento ha sido generado exitosamente"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo generar el plan de entrenamiento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error al generar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el plan de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Guardar plan generado
  const handleSavePlan = async () => {
    if (!generatedPlan) return

    try {
      setIsSaving(true)

      const savedPlan = await savePlan(generatedPlan)

      if (savedPlan) {
        toast({
          title: 'Plan guardado',
          description: 'El plan de entrenamiento se ha guardado correctamente'
        })

        // Redirect to training page
        router.push('/training')
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el plan de entrenamiento',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plan de entrenamiento',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Generar Plan de Entrenamiento</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="assessment" className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2" />
            Evaluación
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center" disabled={!hasAssessment}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generar Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <TrainingInitialAssessment />

          {hasAssessment && (
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("generate")}>
                Continuar a Generación
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Generación de Plan Personalizado
              </CardTitle>
              <CardDescription>
                Nuestro sistema de IA generará un plan de entrenamiento personalizado basado en tu evaluación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">¿Qué incluye tu plan personalizado?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Estructura semanal adaptada a tu disponibilidad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Ejercicios seleccionados según tu nivel y equipamiento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Periodización para asegurar progreso continuo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Consideración de lesiones y limitaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Ajustes automáticos basados en tu progreso</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar Mi Plan Personalizado
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500">
              <p>Puedes modificar tu plan después de generarlo</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
