"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  ChevronRight,
  ChevronDown,
  Clock,
  Zap,
  RefreshCw,
  BarChart3,
  BookOpen,
  Lightbulb,
  Edit,
  Save,
  Trash2,
  Plus,
  Brain,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { createPureBodybuildingPPL } from "@/lib/templates/pure-bodybuilding-ppl"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from "@/lib/types/training"

export default function CustomizePPLTemplatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [template, setTemplate] = useState<WorkoutRoutine | null>(null)
  const [userPreferences, setUserPreferences] = useState({
    goal: "hypertrophy",
    experience: "intermediate",
    frequency: 6,
    focusAreas: [] as string[],
    limitations: [] as string[],
    equipment: "full",
    timePerSession: 60,
  })
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para personalizar una plantilla",
        variant: "destructive"
      })
      router.push("/auth/login")
      return
    }

    // Load the base template
    const baseTemplate = createPureBodybuildingPPL(user.id)
    setTemplate(baseTemplate)
    setIsLoading(false)
  }, [user, router])

  // Handle changes to the template
  const updateDay = (dayIndex: number, updatedDay: WorkoutDay) => {
    if (!template) return

    const updatedDays = [...template.days]
    updatedDays[dayIndex] = updatedDay

    setTemplate({
      ...template,
      days: updatedDays
    })
  }

  // Handle changes to exercise sets
  const updateExerciseSet = (dayIndex: number, setIndex: number, updatedSet: ExerciseSet) => {
    if (!template) return

    const day = template.days[dayIndex]
    const updatedSets = [...day.exerciseSets]
    updatedSets[setIndex] = updatedSet

    updateDay(dayIndex, {
      ...day,
      exerciseSets: updatedSets
    })
  }

  // Add a new exercise set to a day
  const addExerciseSet = (dayIndex: number) => {
    if (!template) return

    const day = template.days[dayIndex]
    const newSet: ExerciseSet = {
      id: uuidv4(),
      exerciseId: "bench-press", // Default exercise
      targetReps: 10,
      targetRir: 2,
      restTime: 90,
      isWarmup: false
    }

    updateDay(dayIndex, {
      ...day,
      exerciseSets: [...day.exerciseSets, newSet]
    })
  }

  // Remove an exercise set from a day
  const removeExerciseSet = (dayIndex: number, setIndex: number) => {
    if (!template) return

    const day = template.days[dayIndex]
    const updatedSets = day.exerciseSets.filter((_, index) => index !== setIndex)

    updateDay(dayIndex, {
      ...day,
      exerciseSets: updatedSets
    })
  }

  // Update day name
  const updateDayName = (dayIndex: number, name: string) => {
    if (!template) return

    const day = template.days[dayIndex]
    updateDay(dayIndex, {
      ...day,
      name
    })
  }

  // Update day description
  const updateDayDescription = (dayIndex: number, description: string) => {
    if (!template) return

    const day = template.days[dayIndex]
    updateDay(dayIndex, {
      ...day,
      description
    })
  }

  // Handle AI customization
  const handleAICustomization = async () => {
    if (!template || !aiPrompt) return

    setIsAIProcessing(true)

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock AI suggestions
      const suggestions = [
        "Basado en tu objetivo de hipertrofia y enfoque en espalda, recomiendo aumentar el volumen en los días de Pull añadiendo 2 series adicionales de remo con barra.",
        "Para tus limitaciones de hombro, sustituye el press militar por press de hombro con mancuernas para reducir el estrés articular.",
        "Considerando tu disponibilidad de tiempo, optimiza los descansos entre series a 60-90 segundos para mantener la intensidad y reducir la duración total."
      ]

      setAiSuggestions(suggestions)

      toast({
        title: "Sugerencias generadas",
        description: "La IA ha generado sugerencias para personalizar tu rutina",
      })
    } catch (error) {
      console.error("Error processing AI customization:", error)
      toast({
        title: "Error",
        description: "No se pudieron generar sugerencias de IA",
        variant: "destructive"
      })
    } finally {
      setIsAIProcessing(false)
    }
  }

  // Apply AI suggestion
  const applyAISuggestion = (suggestionIndex: number) => {
    if (!template) return

    const suggestion = aiSuggestions[suggestionIndex]

    // Example implementation of applying a suggestion
    // In a real implementation, this would parse the suggestion and make specific changes
    if (suggestionIndex === 0) {
      // Add 2 series of barbell row to Pull days
      const updatedDays = template.days.map((day, index) => {
        if (day.name.includes("Pull")) {
          return {
            ...day,
            exerciseSets: [
              ...day.exerciseSets,
              {
                id: uuidv4(),
                exerciseId: "barbell-row",
                targetReps: 10,
                targetRir: 2,
                restTime: 90,
                isWarmup: false
              },
              {
                id: uuidv4(),
                exerciseId: "barbell-row",
                targetReps: 10,
                targetRir: 2,
                restTime: 90,
                isWarmup: false
              }
            ]
          }
        }
        return day
      })

      setTemplate({
        ...template,
        days: updatedDays
      })
    } else if (suggestionIndex === 1) {
      // Replace military press with dumbbell shoulder press
      const updatedDays = template.days.map(day => {
        const updatedSets = day.exerciseSets.map(set => {
          if (set.exerciseId === "overhead-press") {
            return {
              ...set,
              exerciseId: "dumbbell-shoulder-press",
              alternativeExerciseId: "seated-dumbbell-press"
            }
          }
          return set
        })

        return {
          ...day,
          exerciseSets: updatedSets
        }
      })

      setTemplate({
        ...template,
        days: updatedDays
      })
    } else if (suggestionIndex === 2) {
      // Optimize rest times
      const updatedDays = template.days.map(day => {
        const updatedSets = day.exerciseSets.map(set => ({
          ...set,
          restTime: Math.max(60, Math.min(90, set.restTime || 90))
        }))

        return {
          ...day,
          exerciseSets: updatedSets
        }
      })

      setTemplate({
        ...template,
        days: updatedDays
      })
    }

    // Remove the applied suggestion
    setAiSuggestions(aiSuggestions.filter((_, index) => index !== suggestionIndex))

    toast({
      title: "Sugerencia aplicada",
      description: "La sugerencia de IA se ha aplicado a tu rutina",
    })
  }

  // Save the customized template
  const saveCustomizedTemplate = async () => {
    if (!template || !user) return

    setIsSaving(true)

    try {
      // In a real implementation, save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Rutina guardada",
        description: "Tu rutina personalizada se ha guardado correctamente",
      })

      // Navigate to the routine page
      router.push(`/training/routine/${template.id}`)
    } catch (error) {
      console.error("Error saving customized template:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina personalizada",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !template) {
    return (
      <RoutinizeLayout activeTab="training" title="Personalizar Plantilla PPL">
        <div className="container mx-auto p-4 pb-20">
          <div className="flex items-center mb-6">
            <Button3D
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button3D>
            <h1 className="text-2xl font-bold">Personalizar Plantilla PPL</h1>
          </div>

          <div className="flex items-center justify-center min-h-[60vh]">
            <PulseLoader message="Cargando plantilla..." />
          </div>
        </div>
      </RoutinizeLayout>
    )
  }

  return (
    <RoutinizeLayout activeTab="training" title="Personalizar Plantilla PPL">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button3D
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Personalizar Plantilla PPL</h1>
        </div>

        <div className="space-y-6">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Personalización con IA</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Describe tus objetivos, preferencias o limitaciones y nuestra IA te ayudará a personalizar esta plantilla.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal">Objetivo principal</Label>
                    <Select
                      value={userPreferences.goal}
                      onValueChange={(value) => setUserPreferences({...userPreferences, goal: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hypertrophy">Hipertrofia (aumento muscular)</SelectItem>
                        <SelectItem value="strength">Fuerza</SelectItem>
                        <SelectItem value="endurance">Resistencia muscular</SelectItem>
                        <SelectItem value="fat-loss">Pérdida de grasa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experience">Nivel de experiencia</Label>
                    <Select
                      value={userPreferences.experience}
                      onValueChange={(value) => setUserPreferences({...userPreferences, experience: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante (0-1 año)</SelectItem>
                        <SelectItem value="intermediate">Intermedio (1-3 años)</SelectItem>
                        <SelectItem value="advanced">Avanzado (3+ años)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="frequency">Días de entrenamiento por semana</Label>
                    <Select
                      value={userPreferences.frequency.toString()}
                      onValueChange={(value) => setUserPreferences({...userPreferences, frequency: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 días/semana</SelectItem>
                        <SelectItem value="4">4 días/semana</SelectItem>
                        <SelectItem value="5">5 días/semana</SelectItem>
                        <SelectItem value="6">6 días/semana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timePerSession">Tiempo disponible por sesión</Label>
                    <Select
                      value={userPreferences.timePerSession.toString()}
                      onValueChange={(value) => setUserPreferences({...userPreferences, timePerSession: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tiempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="aiPrompt">Instrucciones adicionales para la IA</Label>
                  <Textarea
                    id="aiPrompt"
                    placeholder="Ej: Quiero enfocarme en desarrollar mi espalda y tengo una lesión en el hombro derecho que limita ciertos movimientos..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button3D
                  onClick={handleAICustomization}
                  disabled={isAIProcessing}
                  className="w-full"
                >
                  {isAIProcessing ? (
                    <>
                      <PulseLoader size="sm" className="mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generar sugerencias de IA
                    </>
                  )}
                </Button3D>

                {aiSuggestions.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h3 className="font-medium flex items-center">
                      <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
                      Sugerencias de IA
                    </h3>

                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-primary/10 p-3 rounded-md">
                        <p className="text-sm mb-2">{suggestion}</p>
                        <Button3D
                          size="sm"
                          variant="outline"
                          onClick={() => applyAISuggestion(index)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Aplicar sugerencia
                        </Button3D>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Personalizar días de entrenamiento</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <Accordion type="single" collapsible className="w-full">
                {template.days.map((day, dayIndex) => (
                  <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                    <AccordionTrigger className="hover:bg-primary/5 px-4 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium">{day.name}</span>
                        <Badge className="ml-2">{day.targetMuscleGroups?.join(", ")}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`day-name-${dayIndex}`}>Nombre del día</Label>
                            <Input
                              id={`day-name-${dayIndex}`}
                              value={day.name}
                              onChange={(e) => updateDayName(dayIndex, e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`day-description-${dayIndex}`}>Descripción</Label>
                            <Input
                              id={`day-description-${dayIndex}`}
                              value={day.description || ""}
                              onChange={(e) => updateDayDescription(dayIndex, e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Ejercicios</h4>

                          {day.exerciseSets.map((set, setIndex) => (
                            <div key={setIndex} className="border rounded-md p-3 mb-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label htmlFor={`exercise-${dayIndex}-${setIndex}`}>Ejercicio</Label>
                                  <Select
                                    value={set.exerciseId}
                                    onValueChange={(value) => updateExerciseSet(dayIndex, setIndex, {...set, exerciseId: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar ejercicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="bench-press">Press de banca</SelectItem>
                                      <SelectItem value="squat">Sentadilla</SelectItem>
                                      <SelectItem value="deadlift">Peso muerto</SelectItem>
                                      <SelectItem value="pull-up">Dominadas</SelectItem>
                                      <SelectItem value="overhead-press">Press militar</SelectItem>
                                      <SelectItem value="barbell-row">Remo con barra</SelectItem>
                                      <SelectItem value="dumbbell-shoulder-press">Press de hombros con mancuernas</SelectItem>
                                      <SelectItem value="leg-press">Prensa de piernas</SelectItem>
                                      <SelectItem value="lat-pulldown">Jalón al pecho</SelectItem>
                                      <SelectItem value="leg-extension">Extensión de piernas</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor={`alternative-${dayIndex}-${setIndex}`}>Ejercicio alternativo</Label>
                                  <Select
                                    value={set.alternativeExerciseId || ""}
                                    onValueChange={(value) => updateExerciseSet(dayIndex, setIndex, {...set, alternativeExerciseId: value || undefined})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar alternativa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">Ninguno</SelectItem>
                                      <SelectItem value="incline-bench-press">Press inclinado</SelectItem>
                                      <SelectItem value="hack-squat">Hack squat</SelectItem>
                                      <SelectItem value="romanian-deadlift">Peso muerto rumano</SelectItem>
                                      <SelectItem value="lat-pulldown">Jalón al pecho</SelectItem>
                                      <SelectItem value="seated-dumbbell-press">Press sentado con mancuernas</SelectItem>
                                      <SelectItem value="t-bar-row">Remo T</SelectItem>
                                      <SelectItem value="machine-shoulder-press">Press de hombros en máquina</SelectItem>
                                      <SelectItem value="leg-curl">Curl femoral</SelectItem>
                                      <SelectItem value="cable-row">Remo con polea</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`reps-${dayIndex}-${setIndex}`}>Repeticiones</Label>
                                    <Input
                                      id={`reps-${dayIndex}-${setIndex}`}
                                      type="number"
                                      value={set.targetReps}
                                      onChange={(e) => updateExerciseSet(dayIndex, setIndex, {...set, targetReps: parseInt(e.target.value)})}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor={`rir-${dayIndex}-${setIndex}`}>RIR</Label>
                                    <Input
                                      id={`rir-${dayIndex}-${setIndex}`}
                                      type="number"
                                      value={set.targetRir}
                                      onChange={(e) => updateExerciseSet(dayIndex, setIndex, {...set, targetRir: parseInt(e.target.value)})}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`warmup-${dayIndex}-${setIndex}`}
                                    checked={set.isWarmup}
                                    onCheckedChange={(checked) => updateExerciseSet(dayIndex, setIndex, {...set, isWarmup: !!checked})}
                                  />
                                  <Label htmlFor={`warmup-${dayIndex}-${setIndex}`}>Calentamiento</Label>
                                </div>

                                <Button3D
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExerciseSet(dayIndex, setIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button3D>
                              </div>
                            </div>
                          ))}

                          <Button3D
                            variant="outline"
                            size="sm"
                            onClick={() => addExerciseSet(dayIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir ejercicio
                          </Button3D>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card3DContent>
          </Card3D>

          <div className="flex justify-end space-x-3">
            <Button3D
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button3D>

            <Button3D
              onClick={saveCustomizedTemplate}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <PulseLoader size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar rutina personalizada
                </>
              )}
            </Button3D>
          </div>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
