"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import {
  Dumbbell,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Play,
  Pause,
  Timer,
  Check,
  Sparkles,
  Brain,
  Info
} from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { ExerciseAlternativeSelectorFixed } from "@/components/training/exercise-alternative-selector-fixed"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { ExerciseRecommendationService } from "@/lib/exercise-recommendation-service"

interface ExerciseExecutionProps {
  exercise: Exercise
  availableExercises: Exercise[]
  onChangeExercise?: (oldExerciseId: string, newExerciseId: string) => void
  onComplete?: (exerciseData: {
    exerciseId: string;
    weight: number;
    reps: number;
    rir: number;
    completed: boolean;
  }) => void
  currentSet?: number
  totalSets?: number
}

export function ExerciseExecution({
  exercise,
  availableExercises,
  onChangeExercise,
  onComplete,
  currentSet = 1,
  totalSets
}: ExerciseExecutionProps) {
  const { toast } = useToast()
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(exercise.repsMin || 10)
  const [rir, setRir] = useState(exercise.rir || 2)
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(exercise.rest || 60)
  const [isCompleted, setIsCompleted] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<{exercise: Exercise, matchScore: number, matchReason: string}[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  // Reiniciar el temporizador cuando cambia el ejercicio o el set
  useEffect(() => {
    setTimeRemaining(exercise.rest || 60)
    setTimerActive(false)
    setReps(exercise.repsMin || 10)
    setRir(exercise.rir || 2)
    setIsCompleted(false)

    // Cargar recomendaciones de IA para el ejercicio actual
    loadAiRecommendations()
  }, [exercise, currentSet])

  // Cargar recomendaciones de ejercicios alternativos usando IA
  const loadAiRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true)
      setShowDropdown(true) // Asegurar que el menú desplegable esté abierto

      // Obtener recomendaciones del servicio de IA
      const recommendations = await ExerciseRecommendationService.getAlternativeExercises(
        exercise,
        {
          preferSamePattern: true,
          preferSameEquipment: true,
          maxResults: 5,
          excludeIds: [exercise.id],
          userEquipment: exercise.equipment || []
        }
      )

      // Si no hay recomendaciones, intentar obtener alternativas basadas en otros criterios
      if (recommendations.length === 0) {
        const alternatives = getAlternatives();

        // Convertir alternativas a formato de recomendación
        const fallbackRecommendations = alternatives.map(alt => ({
          exercise: alt,
          matchScore: 50, // Puntuación predeterminada
          matchReason: "Alternativa basada en criterios similares"
        }));

        setAiRecommendations(fallbackRecommendations)
        console.log("Usando alternativas como recomendaciones:", fallbackRecommendations.length)
      } else {
        setAiRecommendations(recommendations)
        console.log("Recomendaciones de IA cargadas:", recommendations.length)
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones de IA:", error)

      // Usar alternativas como fallback
      const alternatives = getAlternatives();
      const fallbackRecommendations = alternatives.map(alt => ({
        exercise: alt,
        matchScore: 50,
        matchReason: "Alternativa basada en criterios similares"
      }));

      setAiRecommendations(fallbackRecommendations)

      toast({
        title: "Usando alternativas",
        description: "Se están mostrando alternativas basadas en criterios similares",
        variant: "default"
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      setTimerActive(false)
      toast({
        title: "¡Tiempo de descanso completado!",
        description: "Es hora de comenzar la siguiente serie.",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining, toast])

  // Manejar el cambio de ejercicio
  const handleChangeExercise = (newExerciseId: string) => {
    if (onChangeExercise) {
      onChangeExercise(exercise.id, newExerciseId)
      setShowAlternatives(false)
      setShowDropdown(false)

      // Encontrar el nombre del nuevo ejercicio
      const newExercise = availableExercises.find(ex => ex.id === newExerciseId)

      toast({
        title: "Ejercicio cambiado",
        description: `Se ha cambiado a ${newExercise?.name || 'nuevo ejercicio'}`,
        variant: "default"
      })
    }
  }

  // Filtrar ejercicios alternativos con criterios más flexibles
  const getAlternatives = () => {
    // Si no hay patrón de movimiento, intentamos encontrar alternativas por grupo muscular
    if (!exercise.pattern && (!exercise.muscleGroup || exercise.muscleGroup.length === 0)) {
      console.warn("El ejercicio no tiene patrón de movimiento ni grupo muscular definido");
      return availableExercises.filter(ex => ex.id !== exercise.id).slice(0, 5);
    }

    // Primero intentamos encontrar alternativas con el mismo patrón de movimiento
    let alternatives = [];

    if (exercise.pattern) {
      alternatives = availableExercises.filter(ex =>
        ex.id !== exercise.id &&
        ex.pattern === exercise.pattern
      );
    }

    // Si no hay suficientes alternativas con el mismo patrón, buscamos por grupo muscular
    if (alternatives.length < 3 && exercise.muscleGroup && exercise.muscleGroup.length > 0) {
      const muscleGroupAlts = availableExercises.filter(ex =>
        ex.id !== exercise.id &&
        !alternatives.some(a => a.id === ex.id) && // Evitar duplicados
        ex.muscleGroup && exercise.muscleGroup.some(m => ex.muscleGroup.includes(m))
      );
      alternatives = [...alternatives, ...muscleGroupAlts];
    }

    // Si aún no hay suficientes, incluimos ejercicios con equipamiento similar
    if (alternatives.length < 3 && exercise.equipment && exercise.equipment.length > 0) {
      const equipmentAlts = availableExercises.filter(ex =>
        ex.id !== exercise.id &&
        !alternatives.some(a => a.id === ex.id) && // Evitar duplicados
        ex.equipment && exercise.equipment.some(e => ex.equipment.includes(e))
      );
      alternatives = [...alternatives, ...equipmentAlts];
    }

    // Si todavía no hay suficientes alternativas, incluir cualquier ejercicio
    if (alternatives.length < 2) {
      const otherAlts = availableExercises.filter(ex =>
        ex.id !== exercise.id &&
        !alternatives.some(a => a.id === ex.id)
      );
      alternatives = [...alternatives, ...otherAlts];
    }

    console.log(`Encontradas ${alternatives.length} alternativas para ${exercise.name}`);
    return alternatives.slice(0, 8); // Limitar a 8 alternativas
  }

  // Incrementar/decrementar peso
  const adjustWeight = (amount: number) => {
    setWeight(prev => Math.max(0, prev + amount))
  }

  // Incrementar/decrementar repeticiones
  const adjustReps = (amount: number) => {
    setReps(prev => Math.max(1, prev + amount))
  }

  // Iniciar/pausar el temporizador
  const toggleTimer = () => {
    setTimerActive(prev => !prev)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimerActive(false)
    setTimeRemaining(exercise.rest || 60)
  }

  // Completar el ejercicio
  const completeExercise = () => {
    setIsCompleted(true)

    if (onComplete) {
      onComplete({
        exerciseId: exercise.id,
        weight,
        reps,
        rir,
        completed: true
      })
    }
  }

  // Formatear el tiempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const alternatives = getAlternatives()

  return (
    <Card className="overflow-hidden border rounded-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <Badge className="mr-2 bg-blue-500 text-white">
                {currentSet}/{exercise.sets}
              </Badge>
              <h3 className="font-medium text-base text-black dark:text-white">{exercise.name}</h3>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{exercise.muscleGroup?.[0]}</p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlternatives(true)}
              className="flex-1"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Alternativas
            </Button>

            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  IA Recomienda
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <DropdownMenuLabel className="flex items-center text-black dark:text-white">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  Recomendaciones inteligentes
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoadingRecommendations ? (
                  <div className="px-2 py-4 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  aiRecommendations.map(rec => (
                    <DropdownMenuItem
                      key={rec.exercise.id}
                      onClick={() => handleChangeExercise(rec.exercise.id)}
                      className="flex flex-col items-start py-2"
                    >
                      <div className="flex items-center w-full">
                        <Dumbbell className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                        <span className="font-medium text-black dark:text-white">{rec.exercise.spanishName || rec.exercise.name}</span>
                        <Badge className="ml-auto text-xs font-medium" variant="secondary">
                          {Math.round(rec.matchScore)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 pl-6 font-medium">{rec.matchReason}</p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <p className="font-medium">No hay recomendaciones disponibles</p>
                      <p className="text-xs">Intenta actualizar las recomendaciones</p>
                    </div>
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => loadAiRecommendations()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Actualizar recomendaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del ejercicio */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Serie</p>
              <p className="font-semibold text-black dark:text-white">{currentSet} de {exercise.sets}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Repeticiones</p>
              <p className="font-semibold text-black dark:text-white">{exercise.repsMin}-{exercise.repsMax}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Descanso</p>
              <p className="font-semibold text-black dark:text-white">{exercise.rest}s</p>
            </div>
          </div>

          {/* Peso (kg) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black dark:text-white">Peso (kg)</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustWeight(-2.5)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-bold text-lg text-black dark:text-white">{weight}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustWeight(2.5)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setWeight(0)}
              >
                0
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setWeight(5)}
              >
                5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setWeight(10)}
              >
                10
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setWeight(20)}
              >
                20
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setWeight(30)}
              >
                30
              </Button>
            </div>
          </div>

          {/* Repeticiones */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black dark:text-white">Repeticiones</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustReps(-1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-bold text-lg text-black dark:text-white">{reps}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => adjustReps(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setReps(exercise.repsMin || 8)}
              >
                {exercise.repsMin || 8}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setReps(exercise.repsMax || 12)}
              >
                {exercise.repsMax || 12}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs font-medium"
                onClick={() => setReps(Math.round((exercise.repsMin || 8) + (exercise.repsMax || 12)) / 2)}
              >
                Media
              </Button>
            </div>
          </div>

          {/* RIR (Repeticiones en Reserva) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black dark:text-white">RIR (Repeticiones en Reserva)</span>
              <Badge variant={
                rir <= 1 ? "destructive" :
                rir <= 2 ? "default" :
                "secondary"
              } className="font-medium">
                {rir <= 1 ? "Alta intensidad" :
                 rir <= 2 ? "Intensidad media" :
                 "Baja intensidad"}
              </Badge>
            </div>
            <Slider
              value={[rir]}
              min={0}
              max={5}
              step={1}
              onValueChange={(value) => setRir(value[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
              <p className="font-medium">RIR {rir}: {
                rir === 0 ? "No podrías hacer ni una repetición más" :
                rir === 1 ? "Podrías hacer 1 repetición más" :
                rir === 2 ? "Podrías hacer 2 repeticiones más" :
                rir === 3 ? "Podrías hacer 3 repeticiones más" :
                rir === 4 ? "Podrías hacer 4 repeticiones más" :
                "Podrías hacer 5 o más repeticiones más"
              }</p>
            </div>
          </div>

          {/* Temporizador */}
          {!isCompleted && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <h3 className="text-sm font-medium mb-1 text-black dark:text-white">Tiempo de descanso</h3>
              <div className={`text-3xl font-bold ${timeRemaining < 10 && timerActive ? 'text-red-500 animate-pulse' : 'text-black dark:text-white'}`}>
                {formatTime(timeRemaining)}
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full mt-2 mb-3">
                <div
                  className={`h-full rounded-full ${timerActive ? 'bg-primary' : 'bg-gray-400'}`}
                  style={{
                    width: `${(timeRemaining / (exercise.rest || 60)) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                ></div>
              </div>

              <div className="flex justify-center gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reiniciar
                </Button>
                <Button
                  variant={timerActive ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleTimer}
                >
                  {timerActive ? (
                    <><Pause className="h-4 w-4 mr-1" /> Pausar</>
                  ) : (
                    <><Play className="h-4 w-4 mr-1" /> Iniciar</>
                  )}
                </Button>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs font-medium"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(30);
                  }}
                >
                  30s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs font-medium"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(60);
                  }}
                >
                  60s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs font-medium"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(90);
                  }}
                >
                  90s
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs font-medium"
                  onClick={() => {
                    setTimerActive(false);
                    setTimeRemaining(120);
                  }}
                >
                  120s
                </Button>
              </div>
            </div>
          )}

          {/* Botón de completar */}
          {!isCompleted ? (
            <Button
              className="w-full h-12 text-base font-bold"
              onClick={completeExercise}
            >
              Completar serie {currentSet} de {exercise.sets}
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-600 font-medium">Serie completada</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {currentSet < (exercise.sets || 1) ?
                  `Prepárate para la serie ${currentSet + 1} de ${exercise.sets}` :
                  "¡Has completado todas las series de este ejercicio!"}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
        <DialogContent className="max-w-md">
          <DialogTitle>Seleccionar ejercicio alternativo</DialogTitle>
          <ExerciseAlternativeSelectorFixed
            currentExerciseId={exercise.id}
            onSelectAlternative={(selectedExercise) => handleChangeExercise(selectedExercise.id)}
            onCancel={() => setShowAlternatives(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
