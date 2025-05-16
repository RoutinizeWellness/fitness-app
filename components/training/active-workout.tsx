"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Clock, Play, Pause,
  SkipForward, CheckCircle, ChevronDown,
  ChevronUp, Info, AlertCircle, Save,
  RefreshCw, Edit, RotateCcw, Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { calculateIdealWeight, getUserFatigue } from "@/lib/adaptive-learning-service"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, WorkoutLog, Exercise } from "@/lib/types/training"
import { motion, AnimatePresence } from "framer-motion"
import { ExerciseAlternatives } from "@/components/training/exercise-alternatives"
import { WarmupProtocolDisplay } from "@/components/training/warmup-protocol-display"
import { AdvancedTechniqueSelector } from "@/components/training/advanced-technique-selector"
import { getExerciseById } from "@/lib/exercise-library"

interface ActiveWorkoutProps {
  routine: WorkoutRoutine
  day: WorkoutDay
  onComplete: (log: WorkoutLog) => void
  availableExercises?: Exercise[]
}

export function ActiveWorkout({
  routine,
  day,
  onComplete,
  availableExercises = []
}: ActiveWorkoutProps) {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false)
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false)
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [completedSets, setCompletedSets] = useState<ExerciseSet[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null)
  const [workoutNotes, setWorkoutNotes] = useState("")
  const [overallFatigue, setOverallFatigue] = useState(5)
  const [appliedTechniques, setAppliedTechniques] = useState<Record<string, string>>({})
  const [showWarmup, setShowWarmup] = useState<Record<string, boolean>>({})
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'elite'>(
    routine.level === 'advanced' ? 'advanced' :
    routine.level === 'beginner' ? 'beginner' :
    'intermediate'
  )
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [weightRecommendations, setWeightRecommendations] = useState<Record<string, number>>({})
  const [userFatigue, setUserFatigue] = useState<number | null>(null)

  // Generar alternativas de ejercicios basadas en los ejercicios disponibles
  const generateExerciseAlternatives = (): Record<string, { id: string, name: string }[]> => {
    const alternatives: Record<string, { id: string, name: string }[]> = {}

    // Si no hay ejercicios disponibles, usar datos de ejemplo
    if (availableExercises.length === 0) {
      // Datos de ejemplo para mostrar alternativas incluso sin ejercicios disponibles
      const exampleExercises = {
        "bench-press": [
          { id: "bench-press", name: "Press de banca" },
          { id: "dumbbell-press", name: "Press con mancuernas" },
          { id: "machine-chest-press", name: "Press en máquina" },
          { id: "push-up", name: "Flexiones" }
        ],
        "incline-dumbbell-press": [
          { id: "incline-dumbbell-press", name: "Press inclinado con mancuernas" },
          { id: "incline-bench-press", name: "Press inclinado con barra" },
          { id: "cable-fly", name: "Aperturas con cable" }
        ],
        "triceps-pushdown": [
          { id: "triceps-pushdown", name: "Extensiones de tríceps en polea" },
          { id: "skull-crusher", name: "Extensiones de tríceps tumbado" },
          { id: "dips", name: "Fondos" }
        ],
        "pull-up": [
          { id: "pull-up", name: "Dominadas" },
          { id: "lat-pulldown", name: "Jalón al pecho" },
          { id: "assisted-pull-up", name: "Dominadas asistidas" }
        ],
        "barbell-row": [
          { id: "barbell-row", name: "Remo con barra" },
          { id: "dumbbell-row", name: "Remo con mancuerna" },
          { id: "cable-row", name: "Remo en polea" }
        ],
        "bicep-curl": [
          { id: "bicep-curl", name: "Curl de bíceps con mancuernas" },
          { id: "barbell-curl", name: "Curl de bíceps con barra" },
          { id: "hammer-curl", name: "Curl martillo" }
        ],
        "squat": [
          { id: "squat", name: "Sentadilla" },
          { id: "front-squat", name: "Sentadilla frontal" },
          { id: "leg-press", name: "Prensa de piernas" }
        ],
        "leg-press": [
          { id: "leg-press", name: "Prensa de piernas" },
          { id: "hack-squat", name: "Hack squat" },
          { id: "lunges", name: "Zancadas" }
        ],
        "overhead-press": [
          { id: "overhead-press", name: "Press militar" },
          { id: "dumbbell-shoulder-press", name: "Press de hombros con mancuernas" },
          { id: "arnold-press", name: "Press Arnold" }
        ]
      }

      // Asegurarnos de que todos los ejercicios en day.exerciseSets tengan alternativas
      day.exerciseSets.forEach(set => {
        if (!exampleExercises[set.exerciseId]) {
          exampleExercises[set.exerciseId] = [
            { id: set.exerciseId, name: set.exerciseId }
          ]
        }
      })

      return exampleExercises
    }

    // Generar alternativas basadas en los ejercicios disponibles
    // Agrupar ejercicios por categoría y grupo muscular
    const exercisesByCategory: Record<string, Exercise[]> = {}

    availableExercises.forEach(exercise => {
      if (!exercisesByCategory[exercise.category]) {
        exercisesByCategory[exercise.category] = []
      }
      exercisesByCategory[exercise.category].push(exercise)

      // También agregar el ejercicio a su propia lista de alternativas
      if (!alternatives[exercise.id]) {
        alternatives[exercise.id] = []
      }
      alternatives[exercise.id].push({
        id: exercise.id,
        name: exercise.name
      })
    })

    // Para cada ejercicio, encontrar alternativas en la misma categoría
    availableExercises.forEach(exercise => {
      const categoryExercises = exercisesByCategory[exercise.category] || []

      // Añadir hasta 5 alternativas de la misma categoría
      categoryExercises
        .filter(alt => alt.id !== exercise.id)
        .slice(0, 5)
        .forEach(alt => {
          if (!alternatives[exercise.id]) {
            alternatives[exercise.id] = [{
              id: exercise.id,
              name: exercise.name
            }]
          }

          alternatives[exercise.id].push({
            id: alt.id,
            name: alt.name
          })
        })
    })

    // Asegurarnos de que todos los ejercicios en day.exerciseSets tengan alternativas
    day.exerciseSets.forEach(set => {
      if (!alternatives[set.exerciseId]) {
        alternatives[set.exerciseId] = [
          { id: set.exerciseId, name: set.exerciseId }
        ]

        // Intentar encontrar ejercicios similares
        const similarExercises = availableExercises
          .filter(ex => ex.id !== set.exerciseId)
          .slice(0, 3)

        similarExercises.forEach(ex => {
          alternatives[set.exerciseId].push({
            id: ex.id,
            name: ex.name
          })
        })
      }
    })

    return alternatives
  }

  // Ejercicios alternativos
  const exerciseAlternatives = generateExerciseAlternatives()

  // Generar nombres de ejercicios
  const generateExerciseNames = (): Record<string, string> => {
    const names: Record<string, string> = {
      "bench-press": "Press de banca",
      "incline-dumbbell-press": "Press inclinado con mancuernas",
      "triceps-pushdown": "Extensiones de tríceps en polea",
      "pull-up": "Dominadas",
      "barbell-row": "Remo con barra",
      "bicep-curl": "Curl de bíceps con mancuernas",
      "squat": "Sentadilla",
      "leg-press": "Prensa de piernas",
      "overhead-press": "Press militar"
    }

    // Añadir nombres de los ejercicios disponibles
    availableExercises.forEach(exercise => {
      names[exercise.id] = exercise.name
    })

    return names
  }

  // Nombres de ejercicios
  const exerciseNames = generateExerciseNames()

  // Inicializar los sets completados
  useEffect(() => {
    const initialCompletedSets = day.exerciseSets.map(set => ({
      ...set,
      completedReps: set.targetReps,
      completedWeight: set.weight || 0,
      completedRir: set.targetRir
    }))
    setCompletedSets(initialCompletedSets)

    // Cargar fatiga del usuario y calcular recomendaciones de peso
    loadUserFatigueAndRecommendations()
  }, [day])

  // Cargar fatiga del usuario y calcular recomendaciones de peso
  const loadUserFatigueAndRecommendations = async () => {
    if (!routine.userId) return

    try {
      // Obtener fatiga del usuario
      const fatigue = await getUserFatigue(routine.userId)

      if (fatigue) {
        setUserFatigue(fatigue.currentFatigue)

        // Calcular recomendaciones de peso para cada ejercicio
        const recommendations: Record<string, number> = {}

        for (const set of day.exerciseSets) {
          if (set.targetReps && set.targetRir !== undefined) {
            const recommendedWeight = await calculateIdealWeight(
              routine.userId,
              set.exerciseId,
              set.targetReps,
              set.targetRir
            )

            if (recommendedWeight) {
              recommendations[set.exerciseId] = recommendedWeight
            }
          }
        }

        setWeightRecommendations(recommendations)
      }
    } catch (error) {
      console.error("Error al cargar fatiga y recomendaciones:", error)
    }
  }

  // Manejar el temporizador
  useEffect(() => {
    if (isWorkoutStarted && !isWorkoutPaused) {
      const interval = setInterval(() => {
        setWorkoutDuration(prev => prev + 1)
      }, 1000)
      setTimerInterval(interval)
    } else if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [isWorkoutStarted, isWorkoutPaused])

  // Iniciar el entrenamiento
  const startWorkout = () => {
    setIsWorkoutStarted(true)
    setIsWorkoutPaused(false)
  }

  // Pausar/reanudar el entrenamiento
  const togglePause = () => {
    setIsWorkoutPaused(prev => !prev)
  }

  // Formatear el tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Alternar la expansión de un ejercicio
  const toggleExerciseExpansion = (exerciseId: string) => {
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null)
    } else {
      setExpandedExerciseId(exerciseId)
    }
  }

  // Actualizar los valores de un set completado
  const updateCompletedSet = (index: number, field: string, value: any) => {
    const updatedSets = [...completedSets]
    updatedSets[index] = {
      ...updatedSets[index],
      [field]: value
    }
    setCompletedSets(updatedSets)
  }

  // Cambiar a un ejercicio alternativo
  const changeExercise = (index: number, exerciseId: string) => {
    const updatedSets = [...completedSets]
    updatedSets[index] = {
      ...updatedSets[index],
      alternativeExerciseId: exerciseId === updatedSets[index].exerciseId ? undefined : exerciseId
    }
    setCompletedSets(updatedSets)
  }

  // Completar el entrenamiento
  const completeWorkout = () => {
    // Crear el log de entrenamiento
    const workoutLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      userId: routine.userId,
      routineId: routine.id,
      dayId: day.id,
      date: new Date().toISOString(),
      duration: workoutDuration,
      completedSets,
      notes: workoutNotes,
      overallFatigue,
      muscleGroupFatigue: {
        // Simplificado para el ejemplo
        chest: overallFatigue,
        back: overallFatigue,
        legs: overallFatigue,
        shoulders: overallFatigue,
        arms: overallFatigue
      },
      performance: "same" // Por defecto
    }

    onComplete(workoutLog)
    setShowCompletionDialog(false)
  }

  // Calcular el progreso del entrenamiento
  const calculateProgress = () => {
    const totalSets = completedSets.length
    const completedSetCount = completedSets.filter(set =>
      set.completedReps !== undefined && set.completedWeight !== undefined
    ).length

    return (completedSetCount / totalSets) * 100
  }

  // Manejar la selección de técnica avanzada
  const handleSelectTechnique = (exerciseId: string, techniqueId: string) => {
    setAppliedTechniques({
      ...appliedTechniques,
      [exerciseId]: techniqueId
    })

    // Actualizar los sets para reflejar la técnica aplicada
    const updatedSets = completedSets.map(set => {
      if (set.exerciseId === exerciseId || set.alternativeExerciseId === exerciseId) {
        // Aplicar la técnica según su tipo
        switch (techniqueId) {
          case 'drop_set':
            return {
              ...set,
              isDropSet: true
            }
          case 'rest_pause':
            return {
              ...set,
              isRestPause: true
            }
          case 'mechanical_drop':
            return {
              ...set,
              isMechanicalSet: true
            }
          default:
            return set
        }
      }
      return set
    })

    setCompletedSets(updatedSets)
  }

  // Manejar la visualización del protocolo de calentamiento
  const toggleWarmupDisplay = (exerciseId: string) => {
    setShowWarmup({
      ...showWarmup,
      [exerciseId]: !showWarmup[exerciseId]
    })
  }

  // Manejar la finalización del calentamiento
  const handleWarmupComplete = (exerciseId: string) => {
    // Marcar el calentamiento como completado
    setShowWarmup({
      ...showWarmup,
      [exerciseId]: false
    })

    // Mostrar mensaje de éxito
    toast({
      title: "Calentamiento completado",
      description: "Ahora puedes comenzar con las series de trabajo",
      variant: "default"
    })
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del entrenamiento */}
      <Card3D className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
          <div className="relative p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{day.name}</h2>
                <p className="text-sm text-white/80">{routine.name}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button3D
                  variant="glass"
                  size="icon"
                  className="h-8 w-8 text-white border-white/30"
                  onClick={togglePause}
                  disabled={!isWorkoutStarted}
                >
                  {isWorkoutPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button3D>

                <Button3D
                  variant="glass"
                  size="icon"
                  className="h-8 w-8 text-white border-white/30"
                  onClick={() => setShowCompletionDialog(true)}
                  disabled={!isWorkoutStarted}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button3D>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{formatTime(workoutDuration)}</span>
              </div>

              <div className="flex items-center">
                <Dumbbell className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{completedSets.length} ejercicios</span>
              </div>
            </div>

            <Progress3D
              value={calculateProgress()}
              max={100}
              height="6px"
              fillColor="rgba(255, 255, 255, 0.9)"
              backgroundColor="rgba(255, 255, 255, 0.2)"
              className="mb-4"
            />

            {!isWorkoutStarted ? (
              <Button3D
                variant="glass"
                className="w-full text-white border-white/30"
                onClick={startWorkout}
              >
                <Play className="h-4 w-4 mr-2" />
                Comenzar entrenamiento
              </Button3D>
            ) : (
              <div className="text-center text-sm text-white/80">
                {isWorkoutPaused ? "Entrenamiento en pausa" : "Entrenamiento en progreso"}
              </div>
            )}
          </div>
        </div>
      </Card3D>

      {/* Lista de ejercicios */}
      <div className="space-y-4">
        {completedSets.map((set, index) => {
          const exerciseId = set.alternativeExerciseId || set.exerciseId
          const exerciseName = exerciseNames[exerciseId] || "Ejercicio"
          const isExpanded = expandedExerciseId === set.id

          return (
            <Card3D key={set.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {exerciseName}
                      {set.alternativeExerciseId && (
                        <Badge variant="secondary" className="ml-2">
                          Alternativa
                        </Badge>
                      )}
                      {set.isDropSet && (
                        <Badge variant="destructive" className="ml-2">
                          Drop Set
                        </Badge>
                      )}
                      {set.isRestPause && (
                        <Badge variant="destructive" className="ml-2">
                          Rest-Pause
                        </Badge>
                      )}
                      {set.isMechanicalSet && (
                        <Badge variant="destructive" className="ml-2">
                          Mecánica
                        </Badge>
                      )}
                    </h3>
                    {set.alternativeExerciseId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reemplazando: {exerciseNames[set.exerciseId] || set.exerciseId}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">
                        {set.targetReps} reps
                      </Badge>
                      <Badge variant="outline">
                        RIR {set.targetRir}
                      </Badge>
                      {set.weight && (
                        <Badge variant="outline">
                          {set.weight} kg
                        </Badge>
                      )}
                      {weightRecommendations[exerciseId] && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Recomendado: {weightRecommendations[exerciseId]} kg
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button3D
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExerciseExpansion(set.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button3D>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      {/* Protocolo de calentamiento */}
                      {isWorkoutStarted && (
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Calentamiento</h4>
                          <Button3D
                            variant="outline"
                            size="sm"
                            onClick={() => toggleWarmupDisplay(exerciseId)}
                          >
                            {showWarmup[exerciseId] ? "Ocultar" : "Mostrar"}
                          </Button3D>
                        </div>
                      )}

                      {/* Mostrar protocolo de calentamiento si está expandido */}
                      {isWorkoutStarted && showWarmup[exerciseId] && (
                        <WarmupProtocolDisplay
                          exercise={getExerciseById(exerciseId) || {
                            id: exerciseId,
                            name: exerciseName,
                            primaryMuscleGroup: "general",
                            secondaryMuscleGroups: [],
                            equipment: [],
                            isCompound: true,
                            difficulty: "intermediate",
                            category: "general",
                            alternatives: [],
                            variations: []
                          }}
                          workingWeight={set.weight || weightRecommendations[exerciseId] || 20}
                          onWarmupComplete={() => handleWarmupComplete(exerciseId)}
                        />
                      )}

                      {/* Técnicas avanzadas */}
                      {isWorkoutStarted && (
                        <AdvancedTechniqueSelector
                          exercise={getExerciseById(exerciseId) || {
                            id: exerciseId,
                            name: exerciseName,
                            primaryMuscleGroup: "general",
                            secondaryMuscleGroups: [],
                            equipment: [],
                            isCompound: true,
                            difficulty: "intermediate",
                            category: "general",
                            alternatives: [],
                            variations: []
                          }}
                          userLevel={userLevel}
                          onSelectTechnique={(techniqueId) => handleSelectTechnique(exerciseId, techniqueId)}
                        />
                      )}

                      {/* Selector de ejercicio alternativo */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium block">
                            Ejercicio
                          </label>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button3D variant="outline" size="sm">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Alternativas
                              </Button3D>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              {availableExercises.find(e => e.id === set.exerciseId) && (
                                <ExerciseAlternatives
                                  exercise={availableExercises.find(e => e.id === set.exerciseId)!}
                                  availableExercises={availableExercises}
                                  onSelectAlternative={(alternativeId) => changeExercise(index, alternativeId)}
                                  currentExerciseId={exerciseId}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Select
                          value={exerciseId}
                          onValueChange={(value) => changeExercise(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ejercicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {exerciseAlternatives[set.exerciseId]?.map((alt) => (
                              <SelectItem key={alt.id} value={alt.id}>
                                {alt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campos para registrar el entrenamiento */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Peso (kg)
                          </label>
                          <Input
                            type="number"
                            value={set.completedWeight || ""}
                            onChange={(e) => updateCompletedSet(index, "completedWeight", parseFloat(e.target.value) || 0)}
                            min={0}
                            step={2.5}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Repeticiones
                          </label>
                          <Input
                            type="number"
                            value={set.completedReps || ""}
                            onChange={(e) => updateCompletedSet(index, "completedReps", parseInt(e.target.value) || 0)}
                            min={0}
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
                            value={set.completedRir?.toString() || ""}
                            onValueChange={(value) => updateCompletedSet(index, "completedRir", parseInt(value))}
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
                      </div>

                      {/* Notas del ejercicio */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Notas
                        </label>
                        <Textarea
                          placeholder="Añade notas sobre este ejercicio..."
                          value={set.notes || ""}
                          onChange={(e) => updateCompletedSet(index, "notes", e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Recomendaciones del algoritmo */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          {weightRecommendations[set.exerciseId] ? (
                            <>
                              <Zap className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-700">Recomendación de peso</p>
                                <p className="text-xs text-blue-600">
                                  Basado en tu historial y nivel de fatiga actual ({userFatigue !== null ? `${Math.round(userFatigue)}%` : 'desconocido'}),
                                  el peso recomendado es <span className="font-bold">{weightRecommendations[set.exerciseId]} kg</span> para
                                  {set.targetReps} repeticiones con RIR {set.targetRir}.
                                </p>
                                {set.weight && weightRecommendations[set.exerciseId] !== set.weight && (
                                  <div className="mt-1 flex items-center">
                                    <Badge variant={weightRecommendations[set.exerciseId] > set.weight ? "success" : "destructive"} className="text-xs">
                                      {weightRecommendations[set.exerciseId] > set.weight
                                        ? `+${(weightRecommendations[set.exerciseId] - set.weight).toFixed(1)}kg`
                                        : `${(weightRecommendations[set.exerciseId] - set.weight).toFixed(1)}kg`}
                                    </Badge>
                                    <Button3D
                                      variant="outline"
                                      size="sm"
                                      className="ml-2 h-6 text-xs"
                                      onClick={() => updateCompletedSet(index, "completedWeight", weightRecommendations[set.exerciseId])}
                                    >
                                      Aplicar
                                    </Button3D>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-700">Recomendación</p>
                                <p className="text-xs text-blue-600">
                                  No hay suficientes datos para calcular una recomendación de peso personalizada.
                                  Continúa registrando tus entrenamientos para obtener recomendaciones más precisas.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card3D>
          )
        })}
      </div>

      {/* Diálogo de finalización */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar entrenamiento</DialogTitle>
            <DialogDescription>
              Completa la información sobre tu entrenamiento antes de finalizarlo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Nivel de fatiga general (1-10)
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm">Baja</span>
                <Slider
                  value={[overallFatigue]}
                  onValueChange={(value) => setOverallFatigue(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm">Alta</span>
              </div>
              <div className="text-center mt-1">
                <Badge>{overallFatigue}/10</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Notas del entrenamiento
              </label>
              <Textarea
                placeholder="¿Cómo te sentiste durante el entrenamiento? ¿Alguna observación?"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={completeWorkout}>
              Finalizar entrenamiento
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
