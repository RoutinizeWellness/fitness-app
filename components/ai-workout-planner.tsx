"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Calendar, Dumbbell, Brain, Save, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { generateWorkoutPlan, saveAIWorkoutPlan } from "@/lib/ai-service"
import { AIWorkoutPlan } from "@/lib/ai-types"

interface AIWorkoutPlannerProps {
  userId: string
}

export default function AIWorkoutPlanner({ userId }: AIWorkoutPlannerProps) {
  const [preferences, setPreferences] = useState({
    goal: "Hipertrofia",
    level: "intermediate" as "beginner" | "intermediate" | "advanced",
    daysPerWeek: 4,
    focusAreas: ["pecho", "espalda", "piernas"],
    duration: 4,
    limitations: [] as string[]
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<AIWorkoutPlan | null>(null)

  // Lista de posibles objetivos
  const goals = [
    "Hipertrofia",
    "Fuerza",
    "Resistencia",
    "Pérdida de peso",
    "Tonificación",
    "Rendimiento deportivo"
  ]

  // Lista de posibles áreas de enfoque
  const focusAreaOptions = [
    { id: "pecho", label: "Pecho" },
    { id: "espalda", label: "Espalda" },
    { id: "hombros", label: "Hombros" },
    { id: "biceps", label: "Bíceps" },
    { id: "triceps", label: "Tríceps" },
    { id: "antebrazos", label: "Antebrazos" },
    { id: "cuadriceps", label: "Cuádriceps" },
    { id: "isquiotibiales", label: "Isquiotibiales" },
    { id: "gluteos", label: "Glúteos" },
    { id: "pantorrillas", label: "Pantorrillas" },
    { id: "abdominales", label: "Abdominales" },
    { id: "core", label: "Core" },
    { id: "lumbares", label: "Lumbares" },
    { id: "trapecio", label: "Trapecio" },
    { id: "cardio", label: "Cardio" }
  ]

  // Lista de posibles limitaciones
  const limitationOptions = [
    { id: "rodillas", label: "Problemas de rodillas" },
    { id: "espalda_baja", label: "Dolor de espalda baja" },
    { id: "hombros", label: "Problemas de hombros" },
    { id: "muñecas", label: "Dolor de muñecas" },
    { id: "sin_equipamiento", label: "Sin acceso a equipamiento" },
    { id: "tiempo_limitado", label: "Tiempo limitado (< 30 min)" }
  ]

  // Manejar cambios en las áreas de enfoque
  const handleFocusAreaChange = (areaId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, areaId]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        focusAreas: prev.focusAreas.filter(id => id !== areaId)
      }))
    }
  }

  // Manejar cambios en las limitaciones
  const handleLimitationChange = (limitationId: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        limitations: [...prev.limitations, limitationId]
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        limitations: prev.limitations.filter(id => id !== limitationId)
      }))
    }
  }

  // Generar plan de entrenamiento
  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true)
      setGeneratedPlan(null)

      // Validar que se hayan seleccionado áreas de enfoque
      if (preferences.focusAreas.length === 0) {
        toast({
          title: "Error",
          description: "Debes seleccionar al menos un área de enfoque",
          variant: "destructive",
        })
        return
      }

      // Validar que el número de días no sea mayor que el número de áreas de enfoque
      if (preferences.daysPerWeek > preferences.focusAreas.length) {
        toast({
          title: "Recomendación",
          description: "Para mejores resultados, selecciona al menos tantas áreas de enfoque como días de entrenamiento",
        })
      }

      const plan = await generateWorkoutPlan(userId, preferences)

      // Verificar que el plan tenga ejercicios
      let totalExercises = 0
      if (plan && plan.workouts) {
        plan.workouts.forEach(workout => {
          if (workout.exercises) {
            totalExercises += workout.exercises.length
          }
        })
      }

      if (totalExercises === 0) {
        toast({
          title: "Advertencia",
          description: "No se encontraron ejercicios para algunas áreas seleccionadas. Intenta con diferentes áreas de enfoque.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Plan generado",
          description: `Tu plan de entrenamiento personalizado ha sido creado con ${totalExercises} ejercicios`,
        })
      }

      setGeneratedPlan(plan)
    } catch (error) {
      console.error("Error al generar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el plan de entrenamiento. Por favor, intenta de nuevo.",
        variant: "destructive",
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
      await saveAIWorkoutPlan(userId, generatedPlan)

      toast({
        title: "Plan guardado",
        description: "Tu plan de entrenamiento ha sido guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar plan:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el plan de entrenamiento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h2 className="text-2xl font-bold tracking-tight">Planificador IA</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formulario de preferencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crea tu plan personalizado</CardTitle>
            <CardDescription>
              Configura tus preferencias para generar un plan de entrenamiento adaptado a tus necesidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="goal">Objetivo principal</Label>
              <Select
                value={preferences.goal}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Selecciona un objetivo" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nivel */}
            <div className="space-y-2">
              <Label htmlFor="level">Nivel de experiencia</Label>
              <Select
                value={preferences.level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setPreferences(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Selecciona tu nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Días por semana */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="daysPerWeek">Días de entrenamiento por semana</Label>
                <span className="text-sm font-medium">{preferences.daysPerWeek} días</span>
              </div>
              <Slider
                id="daysPerWeek"
                min={2}
                max={6}
                step={1}
                value={[preferences.daysPerWeek]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, daysPerWeek: value[0] }))}
              />
            </div>

            {/* Duración del plan */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="duration">Duración del plan</Label>
                <span className="text-sm font-medium">{preferences.duration} semanas</span>
              </div>
              <Slider
                id="duration"
                min={1}
                max={12}
                step={1}
                value={[preferences.duration]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, duration: value[0] }))}
              />
            </div>

            {/* Áreas de enfoque */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Áreas de enfoque</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Seleccionar todas las áreas
                      setPreferences(prev => ({
                        ...prev,
                        focusAreas: focusAreaOptions.map(area => area.id)
                      }))
                    }}
                  >
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Limpiar selección
                      setPreferences(prev => ({
                        ...prev,
                        focusAreas: []
                      }))
                    }}
                  >
                    Ninguna
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {focusAreaOptions.map(area => (
                  <div
                    key={area.id}
                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${
                      preferences.focusAreas.includes(area.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => handleFocusAreaChange(
                      area.id,
                      !preferences.focusAreas.includes(area.id)
                    )}
                  >
                    <Checkbox
                      id={`focus-${area.id}`}
                      checked={preferences.focusAreas.includes(area.id)}
                      onCheckedChange={(checked) =>
                        handleFocusAreaChange(area.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`focus-${area.id}`}
                      className="text-sm font-medium leading-none cursor-pointer w-full"
                    >
                      {area.label}
                    </label>
                  </div>
                ))}
              </div>

              {preferences.focusAreas.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Áreas seleccionadas: {preferences.focusAreas.length}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.focusAreas.map(areaId => {
                      const area = focusAreaOptions.find(a => a.id === areaId);
                      return area ? (
                        <Badge
                          key={areaId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {area.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Limitaciones */}
            <div className="space-y-2">
              <Label>Limitaciones o consideraciones especiales</Label>
              <div className="grid grid-cols-2 gap-2">
                {limitationOptions.map(limitation => (
                  <div key={limitation.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`limitation-${limitation.id}`}
                      checked={preferences.limitations.includes(limitation.id)}
                      onCheckedChange={(checked) =>
                        handleLimitationChange(limitation.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`limitation-${limitation.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {limitation.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                  Generando plan...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar plan de entrenamiento
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan generado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tu plan personalizado</CardTitle>
            <CardDescription>
              Plan de entrenamiento generado por IA basado en tus preferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Separator />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : generatedPlan ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-800">{generatedPlan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{generatedPlan.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {generatedPlan.difficulty === 'beginner' ? 'Principiante' :
                         generatedPlan.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {generatedPlan.duration_weeks} semanas
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {generatedPlan.sessions_per_week} días/semana
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {generatedPlan.focus_areas.map((area, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">Rutina semanal</h4>
                      <span className="text-xs text-gray-500">
                        {generatedPlan.workouts.reduce((total, w) => total + (w.exercises?.length || 0), 0)} ejercicios en total
                      </span>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {generatedPlan.workouts.map((workout, index) => (
                        <AccordionItem key={workout.id} value={workout.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
                                  {workout.day}
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{workout.title}</span>
                                  <span className="text-xs text-gray-500">
                                    {workout.exercises?.length || 0} ejercicios • {workout.duration_minutes} min
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  workout.intensity === 'low' ? 'outline' :
                                  workout.intensity === 'moderate' ? 'secondary' : 'default'
                                }
                                className="text-xs"
                              >
                                {workout.intensity === 'low' ? 'Baja' :
                                 workout.intensity === 'moderate' ? 'Media' : 'Alta'}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm text-gray-700">{workout.description}</p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {workout.duration_minutes} minutos
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  {workout.focus_area}
                                </Badge>
                              </div>

                              <div className="space-y-2 mt-2">
                                <h5 className="text-sm font-medium">Ejercicios:</h5>
                                {workout.exercises && workout.exercises.length > 0 ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="secondary" className="text-xs">
                                        {workout.exercises.length} ejercicios • {workout.focus_area}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {workout.intensity === 'low' ? 'Intensidad baja' :
                                         workout.intensity === 'moderate' ? 'Intensidad media' :
                                         'Intensidad alta'}
                                      </Badge>
                                    </div>

                                    {workout.exercises.map((exercise, i) => (
                                      <div
                                        key={i}
                                        className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                                      >
                                        <div className="flex items-start gap-3">
                                          {/* Número y grupo muscular */}
                                          <div className="flex flex-col items-center">
                                            <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                              {i+1}
                                            </div>
                                            <span className="text-[10px] text-gray-500 mt-1">
                                              {exercise.muscle_group}
                                            </span>
                                          </div>

                                          {/* Información principal */}
                                          <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                              <h4 className="font-medium text-sm">{exercise.name}</h4>
                                              <div className="flex flex-col items-end">
                                                <Badge variant="outline" className="mb-1">
                                                  {exercise.sets} × {exercise.reps}
                                                </Badge>
                                                <span className="text-[10px] text-gray-500">
                                                  {exercise.equipment || 'Equipo variado'}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Detalles */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                              <Badge variant="secondary" className="text-xs">
                                                {exercise.difficulty || 'Nivel variado'}
                                              </Badge>
                                              <span>•</span>
                                              <span>Descanso: {exercise.rest_seconds}s</span>
                                            </div>

                                            {/* Tip */}
                                            {exercise.notes && (
                                              <div className="mt-2 text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-500">
                                                <span className="font-medium text-blue-700">Tip:</span> {exercise.notes}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-sm text-gray-500">No hay ejercicios disponibles para este día</p>
                                    <p className="text-xs text-gray-400 mt-1">Intenta generar el plan nuevamente con diferentes áreas de enfoque</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No hay ningún plan generado</p>
                <p className="text-sm text-gray-400 mt-1">Configura tus preferencias y genera un plan personalizado</p>
              </div>
            )}
          </CardContent>
          {generatedPlan && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSavePlan}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar plan
                  </div>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
