"use client"

import { useState } from "react"
import {
  Dumbbell, Plus, Trash, Save,
  ArrowLeft, ArrowRight, Check,
  Info, AlertCircle, Copy, Edit
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { motion, AnimatePresence } from "framer-motion"
import { DayConfigurator } from "@/components/training/day-configurator"

interface RoutineBuilderProps {
  isCreating: boolean
  onSave: (routine: WorkoutRoutine) => void
  onCancel: () => void
  userId: string
  existingRoutine?: WorkoutRoutine
  availableExercises?: Exercise[]
}

export function RoutineBuilder({
  isCreating,
  onSave,
  onCancel,
  userId,
  existingRoutine,
  availableExercises = []
}: RoutineBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [routineName, setRoutineName] = useState(existingRoutine?.name || "")
  const [routineDescription, setRoutineDescription] = useState(existingRoutine?.description || "")
  const [routineGoal, setRoutineGoal] = useState<any>(existingRoutine?.goal || "hypertrophy")
  const [routineLevel, setRoutineLevel] = useState<any>(existingRoutine?.level || "intermediate")
  const [routineFrequency, setRoutineFrequency] = useState(existingRoutine?.frequency || 3)
  const [days, setDays] = useState<WorkoutDay[]>(existingRoutine?.days || [])
  const [editingDayId, setEditingDayId] = useState<string | null>(null)

  // Ejercicios disponibles para seleccionar
  const exercisesList = availableExercises.length > 0 ? availableExercises : [
    { id: "bench-press", name: "Press de banca", category: "chest", equipment: ["barbell"] },
    { id: "incline-dumbbell-press", name: "Press inclinado con mancuernas", category: "chest", equipment: ["dumbbell"] },
    { id: "push-up", name: "Flexiones", category: "chest", equipment: ["bodyweight"] },
    { id: "dumbbell-fly", name: "Aperturas con mancuernas", category: "chest", equipment: ["dumbbell"] },
    { id: "cable-fly", name: "Aperturas con cable", category: "chest", equipment: ["cable"] },
    { id: "pull-up", name: "Dominadas", category: "back", equipment: ["bodyweight"] },
    { id: "lat-pulldown", name: "Jalón al pecho", category: "back", equipment: ["cable"] },
    { id: "barbell-row", name: "Remo con barra", category: "back", equipment: ["barbell"] },
    { id: "dumbbell-row", name: "Remo con mancuerna", category: "back", equipment: ["dumbbell"] },
    { id: "cable-row", name: "Remo en polea", category: "back", equipment: ["cable"] },
    { id: "squat", name: "Sentadilla", category: "legs", equipment: ["barbell"] },
    { id: "leg-press", name: "Prensa de piernas", category: "legs", equipment: ["machine"] },
    { id: "lunge", name: "Zancadas", category: "legs", equipment: ["dumbbell", "bodyweight"] },
    { id: "leg-extension", name: "Extensión de piernas", category: "legs", equipment: ["machine"] },
    { id: "leg-curl", name: "Curl de piernas", category: "legs", equipment: ["machine"] },
    { id: "overhead-press", name: "Press militar", category: "shoulders", equipment: ["barbell"] },
    { id: "dumbbell-shoulder-press", name: "Press de hombros con mancuernas", category: "shoulders", equipment: ["dumbbell"] },
    { id: "lateral-raise", name: "Elevaciones laterales", category: "shoulders", equipment: ["dumbbell"] },
    { id: "face-pull", name: "Face pull", category: "shoulders", equipment: ["cable"] },
    { id: "bicep-curl", name: "Curl de bíceps con mancuernas", category: "arms", equipment: ["dumbbell"] },
    { id: "barbell-curl", name: "Curl de bíceps con barra", category: "arms", equipment: ["barbell"] },
    { id: "hammer-curl", name: "Curl martillo", category: "arms", equipment: ["dumbbell"] },
    { id: "triceps-pushdown", name: "Extensiones de tríceps en polea", category: "arms", equipment: ["cable"] },
    { id: "skull-crusher", name: "Extensiones de tríceps tumbado", category: "arms", equipment: ["barbell"] },
    { id: "dips", name: "Fondos", category: "arms", equipment: ["bodyweight"] }
  ]

  // Función para añadir un nuevo día
  const addDay = () => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      name: `Día ${days.length + 1}`,
      targetMuscleGroups: [],
      difficulty: "intermediate",
      exerciseSets: []
    }

    setDays([...days, newDay])
  }

  // Función para eliminar un día
  const removeDay = (dayId: string) => {
    setDays(days.filter(day => day.id !== dayId))
  }

  // Función para actualizar un día
  const updateDay = (dayId: string, field: string, value: any) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return { ...day, [field]: value }
      }
      return day
    }))
  }

  // Función para añadir un ejercicio a un día
  const addExerciseToDay = (dayId: string) => {
    const day = days.find(d => d.id === dayId)
    if (!day) return

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}`,
      exerciseId: exercisesList.length > 0 ? exercisesList[0].id : "bench-press",
      targetReps: 10,
      targetRir: 2
    }

    setDays(days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          exerciseSets: [...d.exerciseSets, newSet]
        }
      }
      return d
    }))
  }

  // Función para eliminar un ejercicio de un día
  const removeExerciseFromDay = (dayId: string, setId: string) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exerciseSets: day.exerciseSets.filter(set => set.id !== setId)
        }
      }
      return day
    }))
  }

  // Función para actualizar un ejercicio
  const updateExercise = (dayId: string, setId: string, field: string, value: any) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exerciseSets: day.exerciseSets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value }
            }
            return set
          })
        }
      }
      return day
    }))
  }

  // Función para guardar la rutina
  const saveRoutine = () => {
    const routine: WorkoutRoutine = {
      id: existingRoutine?.id || `routine-${Date.now()}`,
      userId,
      name: routineName,
      description: routineDescription,
      days,
      frequency: routineFrequency,
      goal: routineGoal,
      level: routineLevel,
      createdAt: existingRoutine?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: existingRoutine?.isActive || false
    }

    onSave(routine)
  }

  // Validar el formulario actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return routineName.trim() !== "" && routineGoal && routineLevel && routineFrequency > 0
      case 2:
        return days.length > 0
      case 3:
        return days.every(day => day.exerciseSets.length > 0)
      default:
        return true
    }
  }

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Mapear los objetivos a etiquetas legibles
  const goalLabels: Record<string, string> = {
    strength: "Fuerza",
    hypertrophy: "Hipertrofia",
    endurance: "Resistencia",
    weight_loss: "Pérdida de peso",
    general_fitness: "Fitness general"
  }

  // Mapear los niveles a etiquetas legibles
  const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado"
  }

  // Función para actualizar un día completo
  const updateFullDay = (updatedDay: WorkoutDay) => {
    setDays(days.map(day =>
      day.id === updatedDay.id ? updatedDay : day
    ))
    setEditingDayId(null)
  }

  return (
    <div className="space-y-6">
      {/* Modal para configurar día */}
      {editingDayId && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
          <DayConfigurator
            day={days.find(d => d.id === editingDayId)!}
            availableExercises={exercisesList}
            onSave={updateFullDay}
            onCancel={() => setEditingDayId(null)}
          />
        </div>
      )}

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {isCreating ? "Crear nueva rutina" : "Editar rutina"}
        </h2>

        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Paso {currentStep} de 3
          </Badge>
        </div>
      </div>

      {/* Paso 1: Información básica */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card3D>
              <Card3DHeader>
                <Card3DTitle gradient={true}>Información básica</Card3DTitle>
              </Card3DHeader>
              <Card3DContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nombre de la rutina *
                  </label>
                  <Input
                    placeholder="Ej: Rutina de hipertrofia 5x5"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Descripción
                  </label>
                  <Textarea
                    placeholder="Describe brevemente el objetivo y estructura de la rutina..."
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Objetivo principal *
                    </label>
                    <Select value={routineGoal} onValueChange={setRoutineGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Fuerza</SelectItem>
                        <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                        <SelectItem value="endurance">Resistencia</SelectItem>
                        <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                        <SelectItem value="general_fitness">Fitness general</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Nivel *
                    </label>
                    <Select value={routineLevel} onValueChange={setRoutineLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Frecuencia (días por semana) *
                  </label>
                  <Select
                    value={routineFrequency.toString()}
                    onValueChange={(value) => setRoutineFrequency(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 día / semana</SelectItem>
                      <SelectItem value="2">2 días / semana</SelectItem>
                      <SelectItem value="3">3 días / semana</SelectItem>
                      <SelectItem value="4">4 días / semana</SelectItem>
                      <SelectItem value="5">5 días / semana</SelectItem>
                      <SelectItem value="6">6 días / semana</SelectItem>
                      <SelectItem value="7">7 días / semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card3DContent>
            </Card3D>

            <div className="flex justify-between">
              <Button3D variant="outline" onClick={onCancel}>
                Cancelar
              </Button3D>
              <Button3D onClick={nextStep} disabled={!validateCurrentStep()}>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button3D>
            </div>
          </motion.div>
        )}

        {/* Paso 2: Configuración de días */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card3D>
              <Card3DHeader>
                <div className="flex justify-between items-center">
                  <Card3DTitle gradient={true}>Configuración de días</Card3DTitle>
                  <Button3D variant="outline" size="sm" onClick={addDay}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir día
                  </Button3D>
                </div>
              </Card3DHeader>
              <Card3DContent className="space-y-4">
                {days.length === 0 ? (
                  <div className="text-center py-6">
                    <Dumbbell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No hay días configurados</p>
                    <Button3D onClick={addDay}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir día
                    </Button3D>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {days.map((day, index) => (
                      <Card3D key={day.id} className="p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 mr-4">
                            <div className="flex items-center mb-2">
                              <Input
                                placeholder="Nombre del día"
                                value={day.name}
                                onChange={(e) => updateDay(day.id, "name", e.target.value)}
                                className="mr-2"
                              />
                              <Button3D
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingDayId(day.id)}
                                title="Configurar día"
                              >
                                <Edit className="h-4 w-4" />
                              </Button3D>
                            </div>

                            <Select
                              value={day.difficulty}
                              onValueChange={(value) => updateDay(day.id, "difficulty", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Dificultad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Principiante</SelectItem>
                                <SelectItem value="intermediate">Intermedio</SelectItem>
                                <SelectItem value="advanced">Avanzado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button3D
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => removeDay(day.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button3D>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm font-medium mb-1 block">
                            Grupos musculares principales
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {day.targetMuscleGroups.length > 0 ? (
                              day.targetMuscleGroups.map(group => (
                                <Badge key={group} variant="outline">
                                  {group}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No hay grupos musculares seleccionados</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            Día {index + 1} de {days.length}
                          </Badge>

                          {day.exerciseSets.length > 0 && (
                            <Badge variant="secondary">
                              {Array.from(new Set(day.exerciseSets.map(set => set.exerciseId))).length} ejercicios
                            </Badge>
                          )}
                        </div>
                      </Card3D>
                    ))}
                  </div>
                )}
              </Card3DContent>
            </Card3D>

            <div className="flex justify-between">
              <Button3D variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button3D>
              <Button3D onClick={nextStep} disabled={!validateCurrentStep()}>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button3D>
            </div>
          </motion.div>
        )}

        {/* Paso 3: Configuración de ejercicios */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card3D>
              <Card3DHeader>
                <Card3DTitle gradient={true}>Configuración de ejercicios</Card3DTitle>
              </Card3DHeader>
              <Card3DContent className="space-y-6">
                {days.map((day, dayIndex) => (
                  <div key={day.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{day.name}</h3>
                      <Button3D
                        variant="outline"
                        size="sm"
                        onClick={() => addExerciseToDay(day.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir ejercicio
                      </Button3D>
                    </div>

                    {day.exerciseSets.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay ejercicios configurados</p>
                        <Button3D
                          variant="ghost"
                          size="sm"
                          onClick={() => addExerciseToDay(day.id)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Añadir ejercicio
                        </Button3D>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {day.exerciseSets.map((set, setIndex) => {
                          const exercise = availableExercises.find(e => e.id === set.exerciseId)

                          return (
                            <Card3D key={set.id} className="p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 mr-4">
                                  <Select
                                    value={set.exerciseId}
                                    onValueChange={(value) => updateExercise(day.id, set.id, "exerciseId", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar ejercicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {exercisesList.map(exercise => (
                                        <SelectItem key={exercise.id} value={exercise.id}>
                                          {exercise.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Button3D
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => removeExerciseFromDay(day.id, set.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button3D>
                              </div>

                              <div className="mb-3">
                                <label className="text-sm font-medium mb-1 block">
                                  Ejercicio alternativo (opcional)
                                </label>
                                <Select
                                  value={set.alternativeExerciseId || ""}
                                  onValueChange={(value) => updateExercise(day.id, set.id, "alternativeExerciseId", value || null)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar alternativa" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Ninguno</SelectItem>
                                    {exercisesList
                                      .filter(ex => ex.id !== set.exerciseId)
                                      .map(exercise => (
                                        <SelectItem key={exercise.id} value={exercise.id}>
                                          {exercise.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Repeticiones
                                  </label>
                                  <Input
                                    type="number"
                                    value={set.targetReps}
                                    onChange={(e) => updateExercise(day.id, set.id, "targetReps", parseInt(e.target.value) || 0)}
                                    min={1}
                                  />
                                </div>

                                <div>
                                  <div className="flex items-center mb-1">
                                    <label className="text-sm font-medium block">
                                      RIR
                                    </label>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button3D variant="ghost" size="icon" className="h-5 w-5 ml-1">
                                            <Info className="h-3 w-3" />
                                          </Button3D>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">Repeticiones en Reserva: cuántas repeticiones podrías hacer más</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <Select
                                    value={set.targetRir?.toString() || "2"}
                                    onValueChange={(value) => updateExercise(day.id, set.id, "targetRir", parseInt(value))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="RIR" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0 (Fallo)</SelectItem>
                                      <SelectItem value="1">1</SelectItem>
                                      <SelectItem value="2">2</SelectItem>
                                      <SelectItem value="3">3</SelectItem>
                                      <SelectItem value="4">4+</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    Peso (kg)
                                  </label>
                                  <Input
                                    type="number"
                                    value={set.weight || ""}
                                    onChange={(e) => updateExercise(day.id, set.id, "weight", parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step={2.5}
                                    placeholder="Opcional"
                                  />
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="text-sm font-medium mb-1 block">
                                  Descanso (segundos)
                                </label>
                                <Select
                                  value={set.restTime?.toString() || "60"}
                                  onValueChange={(value) => updateExercise(day.id, set.id, "restTime", parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tiempo de descanso" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="30">30 segundos</SelectItem>
                                    <SelectItem value="60">1 minuto</SelectItem>
                                    <SelectItem value="90">1.5 minutos</SelectItem>
                                    <SelectItem value="120">2 minutos</SelectItem>
                                    <SelectItem value="180">3 minutos</SelectItem>
                                    <SelectItem value="240">4 minutos</SelectItem>
                                    <SelectItem value="300">5 minutos</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </Card3D>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </Card3DContent>
            </Card3D>

            <div className="flex justify-between">
              <Button3D variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button3D>
              <Button3D onClick={saveRoutine} disabled={!validateCurrentStep()}>
                <Save className="mr-2 h-4 w-4" />
                Guardar rutina
              </Button3D>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
