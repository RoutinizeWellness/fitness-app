"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Progress3D } from "@/components/ui/progress-3d"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { saveWorkoutRoutine } from "@/lib/supabase-training"
import {
  TrainingLevel,
  TrainingGoal,
  TrainingSplit,
  getOptimalVolume,
  getRecommendedRest,
  getRecommendedDeload,
  ADVANCED_TECHNIQUES,
  getRecommendedTechniques,
  getExerciseVariants,
  PROGRESSION_METHODS
} from "@/lib/bodybuilding-science"
import {
  SPANISH_MESOCYCLE_CONFIGS,
  SPANISH_ADVANCED_TECHNIQUES,
  getRecommendedMesocycle,
  getRecommendedLongTermPlan,
  LONG_TERM_PERIODIZATION_MODELS
} from "@/lib/spanish-training-science"

interface AdvancedBodybuildingRoutinesProps {
  userId: string
  availableExercises: Exercise[]
  onSave: (routine: WorkoutRoutine) => void
  onCancel: () => void
}

export function AdvancedBodybuildingRoutines({
  userId,
  availableExercises,
  onSave,
  onCancel
}: AdvancedBodybuildingRoutinesProps) {
  // Estado para la configuración de la rutina
  const [name, setName] = useState("Rutina de Hipertrofia Avanzada")
  const [description, setDescription] = useState("Basada en principios científicos de hipertrofia")
  const [level, setLevel] = useState<TrainingLevel>("intermediate")
  const [goal, setGoal] = useState<TrainingGoal>("hypertrophy")
  const [split, setSplit] = useState<TrainingSplit>("ppl")
  const [frequency, setFrequency] = useState(5)
  const [duration, setDuration] = useState(8) // Duración en semanas
  const [includeDeload, setIncludeDeload] = useState(true)
  const [deloadFrequency, setDeloadFrequency] = useState(4) // Cada cuántas semanas
  const [deloadType, setDeloadType] = useState<'volume' | 'intensity' | 'both' | 'frequency'>('volume')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [selectedSpanishTechniques, setSelectedSpanishTechniques] = useState<string[]>([])
  const [selectedProgressionMethod, setSelectedProgressionMethod] = useState<string>("Doble Progresión")
  const [useExerciseVariants, setUseExerciseVariants] = useState(true)
  const [variantFrequency, setVariantFrequency] = useState<"weekly" | "biweekly" | "monthly">("biweekly")
  const [usePeriodization, setUsePeriodization] = useState(true)
  const [periodizationType, setPeriodizationType] = useState<'linear' | 'undulating' | 'block' | 'conjugate'>('undulating')
  const [useLongTermPlan, setUseLongTermPlan] = useState(false)
  const [selectedLongTermPlan, setSelectedLongTermPlan] = useState<string>(LONG_TERM_PERIODIZATION_MODELS[0].name)
  const [useRirBasedTraining, setUseRirBasedTraining] = useState(true)
  const [defaultRirRange, setDefaultRirRange] = useState<[number, number]>([1, 3])
  const [useAdvancedRestPeriods, setUseAdvancedRestPeriods] = useState(true)
  const [useAlternativeExercises, setUseAlternativeExercises] = useState(true)
  const [alternativeExercisesPerMain, setAlternativeExercisesPerMain] = useState(2)

  // Estado para la generación
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutine | null>(null)
  const [activeTab, setActiveTab] = useState("config")

  // Opciones para splits de entrenamiento
  const splitOptions = [
    { value: "ppl", label: "Push Pull Legs (PPL)", description: "Dividido en empuje, tirón y piernas. Ideal para entrenar 6 días por semana." },
    { value: "upper_lower", label: "Upper/Lower", description: "Dividido en tren superior e inferior. Ideal para entrenar 4 días por semana." },
    { value: "full_body", label: "Full Body", description: "Entrenamiento de cuerpo completo. Ideal para entrenar 3 días por semana." },
    { value: "body_part", label: "Body Part Split", description: "Un grupo muscular por día. Ideal para entrenar 5 días por semana." },
    { value: "push_pull", label: "Push/Pull", description: "Dividido en empuje y tirón. Ideal para entrenar 4 días por semana." }
  ]

  // Opciones para grupos musculares
  const muscleGroupOptions = [
    { value: "chest", label: "Pecho" },
    { value: "back", label: "Espalda" },
    { value: "legs", label: "Piernas" },
    { value: "shoulders", label: "Hombros" },
    { value: "arms", label: "Brazos" },
    { value: "core", label: "Core" }
  ]

  // Generar la rutina
  const generateRoutine = () => {
    setIsGenerating(true)
    setActiveTab("preview")

    // Simular tiempo de generación
    setTimeout(() => {
      try {
        // Crear la rutina según la configuración
        const routine = createAdvancedRoutine()
        setGeneratedRoutine(routine)

        toast({
          title: "Rutina generada",
          description: "Se ha creado una rutina avanzada de entrenamiento",
        })
      } catch (error) {
        console.error("Error al generar rutina:", error)
        toast({
          title: "Error",
          description: "No se pudo generar la rutina",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 2000)
  }

  // Crear rutina avanzada
  const createAdvancedRoutine = (): WorkoutRoutine => {
    // Determinar los días de entrenamiento según el split
    const workoutDays = getWorkoutDaysForSplit(split, frequency)

    // Obtener configuración de mesociclo según el objetivo y nivel
    const mesocycleConfig = getRecommendedMesocycle(goal, level)

    // Obtener plan de periodización a largo plazo si está habilitado
    const longTermPlan = useLongTermPlan
      ? LONG_TERM_PERIODIZATION_MODELS.find(plan => plan.name === selectedLongTermPlan)
      : null

    // Crear los días de entrenamiento
    const days = workoutDays.map((day, dayIndex) => {
      // Obtener grupos musculares para este día
      const targetGroups = getMuscleGroupsForDay(day.type)

      // Filtrar ejercicios para estos grupos musculares
      const dayExercises = availableExercises.filter(exercise => {
        return exercise.muscleGroup.some(group => targetGroups.includes(group))
      })

      // Ordenar ejercicios: primero compuestos, luego aislamiento
      dayExercises.sort((a, b) => {
        if (a.isCompound && !b.isCompound) return -1
        if (!a.isCompound && b.isCompound) return 1
        return 0
      })

      // Determinar número de ejercicios según el tipo de día y nivel
      // Más avanzado = más ejercicios, especialmente de aislamiento
      const compoundExercisesCount = day.type === "full_body"
        ? 3
        : level === "advanced" ? 3 : 2

      const isolationExercisesCount = day.type === "full_body"
        ? 3
        : level === "advanced" ? 5 : level === "intermediate" ? 4 : 3

      // Seleccionar ejercicios
      const compoundExercises = dayExercises
        .filter(ex => ex.isCompound)
        .slice(0, compoundExercisesCount)

      const isolationExercises = dayExercises
        .filter(ex => !ex.isCompound)
        .slice(0, isolationExercisesCount)

      const selectedExercises = [...compoundExercises, ...isolationExercises]

      // Obtener variantes y alternativas para cada ejercicio
      const exerciseVariants: Record<string, string[]> = {}
      const exerciseAlternatives: Record<string, Exercise[]> = {}

      // Procesar variantes y alternativas
      selectedExercises.forEach(exercise => {
        // Variantes (diferentes ángulos/agarres del mismo ejercicio)
        if (useExerciseVariants) {
          const variants = getExerciseVariants(exercise.name)
            .map(variant => `${exercise.name} ${variant.name}`)

          // Añadir el ejercicio original como primera opción
          exerciseVariants[exercise.id] = [exercise.name, ...variants]
        }

        // Alternativas (ejercicios diferentes que trabajan los mismos músculos)
        if (useAlternativeExercises) {
          // Encontrar ejercicios alternativos que trabajen los mismos grupos musculares
          const alternatives = dayExercises.filter(alt =>
            alt.id !== exercise.id &&
            alt.isCompound === exercise.isCompound &&
            alt.muscleGroup.some(group => exercise.muscleGroup.includes(group))
          ).slice(0, alternativeExercisesPerMain)

          exerciseAlternatives[exercise.id] = alternatives
        }
      })

      // Crear series para cada ejercicio
      const exerciseSets: ExerciseSet[] = []

      selectedExercises.forEach((exercise, exerciseIndex) => {
        // Determinar tipo de ejercicio
        const exerciseType = exercise.isCompound ? "compound" : "isolation"

        // Obtener configuración de series y repeticiones según el objetivo y fase
        // Usar la configuración del mesociclo español si está disponible
        let sets: number, reps: number, rir: number, restTime: number

        if (usePeriodization && mesocycleConfig) {
          // Usar configuración del mesociclo español
          const [minReps, maxReps] = mesocycleConfig.repRanges
          const [minRir, maxRir] = mesocycleConfig.rirRange

          // Ajustar según tipo de ejercicio
          if (exerciseType === "compound") {
            sets = level === "advanced" ? 4 : level === "intermediate" ? 3 : 2
            reps = Math.floor((minReps + maxReps) / 2) - 2 // Menos repeticiones para compuestos
            rir = Math.floor((minRir + maxRir) / 2)
          } else {
            sets = level === "advanced" ? 3 : 2
            reps = Math.floor((minReps + maxReps) / 2) + 2 // Más repeticiones para aislamiento
            rir = Math.floor((minRir + maxRir) / 2) + 1 // Más RIR para aislamiento
          }

          // Ajustar según periodización
          if (periodizationType === 'undulating') {
            // Variar según el día de la semana
            const dayVariation = dayIndex % 3
            if (dayVariation === 0) { // Día de fuerza
              reps = minReps
              rir = minRir
            } else if (dayVariation === 1) { // Día de hipertrofia
              reps = Math.floor((minReps + maxReps) / 2)
              rir = Math.floor((minRir + maxRir) / 2)
            } else { // Día de volumen
              reps = maxReps
              rir = maxRir
            }
          } else if (periodizationType === 'linear') {
            // Ajustar según la semana del mesociclo (simulado)
            const weekInMesocycle = Math.min(3, Math.floor(dayIndex / 2))
            if (weekInMesocycle === 0) {
              reps = maxReps
              rir = maxRir
            } else if (weekInMesocycle === 1) {
              reps = Math.floor((minReps + maxReps) / 2)
              rir = Math.floor((minRir + maxRir) / 2)
            } else {
              reps = minReps
              rir = minRir
            }
          }

          // Obtener tiempo de descanso recomendado
          const baseRestTime = getRecommendedRest(exerciseType, goal)

          // Ajustar según la intensidad
          const intensityFactor = (mesocycleConfig.intensityRange[0] + mesocycleConfig.intensityRange[1]) / 2 / 75
          restTime = Math.round(baseRestTime * intensityFactor)

          // Asegurar que el descanso esté en un rango razonable
          restTime = Math.max(45, Math.min(240, restTime))
        } else {
          // Usar configuración básica
          const config = getSetsAndRepsForGoal(goal, exerciseType)
          sets = config.sets
          reps = config.reps
          rir = config.rir
          restTime = getRecommendedRest(exerciseType, goal)
        }

        // Determinar técnicas avanzadas aplicables
        const standardTechniques = selectedTechniques.filter(technique =>
          isTechniqueApplicable(technique, exerciseType, goal)
        )

        // Incluir técnicas avanzadas españolas si están seleccionadas
        const spanishTechniques = selectedSpanishTechniques.filter(techName => {
          const technique = SPANISH_ADVANCED_TECHNIQUES.find(t => t.name === techName)
          if (!technique) return false

          // Verificar si es aplicable según la fase y el tipo de ejercicio
          const isCompoundSuitable = exerciseType === "compound" &&
            (technique.name.includes("Compuestas") || technique.name.includes("Holístico") || technique.name.includes("3/7"))

          const isIsolationSuitable = exerciseType === "isolation" &&
            (technique.name.includes("Gigantes") || technique.name.includes("Descendentes"))

          return isCompoundSuitable || isIsolationSuitable
        })

        // Combinar todas las técnicas aplicables
        const applicableTechniques = [...standardTechniques, ...spanishTechniques]

        // Determinar si usar variante para este ejercicio
        let exerciseVariant = exercise.name
        let exerciseVariantId = exercise.id
        let alternativeExerciseId: string | undefined = undefined

        // Aplicar variantes si está habilitado
        if (useExerciseVariants && exerciseVariants[exercise.id]?.length > 1) {
          // Usar variante según la frecuencia seleccionada
          const variantIndex = Math.floor(Math.random() * exerciseVariants[exercise.id].length)
          exerciseVariant = exerciseVariants[exercise.id][variantIndex]
          exerciseVariantId = exercise.id
        }

        // Determinar si usar ejercicio alternativo
        if (useAlternativeExercises && exerciseAlternatives[exercise.id]?.length > 0) {
          // Guardar ID del ejercicio alternativo para referencia
          const alternatives = exerciseAlternatives[exercise.id]
          alternativeExerciseId = alternatives[0].id
        }

        // Crear las series
        for (let i = 0; i < sets; i++) {
          // Determinar técnicas avanzadas para esta serie
          const isLastSet = i === sets - 1
          const isFirstSet = i === 0
          const isMiddleSet = !isFirstSet && !isLastSet

          // Aplicar técnicas avanzadas según corresponda
          const isDropSet = isLastSet && applicableTechniques.includes("Drop Sets")
          const isRestPause = isLastSet && applicableTechniques.includes("Rest-Pause")
          const isMechanicalSet = isLastSet && applicableTechniques.includes("Series Mecánicas")
          const isPartialReps = isLastSet && applicableTechniques.includes("Repeticiones Parciales")

          // Técnicas españolas avanzadas
          const isSeriesCompuestasAntagonistas = isFirstSet && applicableTechniques.includes("Series Compuestas Antagonistas")
          const isSeriesDescendentesAscendentes = applicableTechniques.includes("Series Descendentes-Ascendentes")
          const isEntrenamiento37 = applicableTechniques.includes("Entrenamiento 3/7")
          const isSeriesGigantesEspecificas = isFirstSet && applicableTechniques.includes("Series Gigantes Específicas")
          const isMetodoHolistico = isFirstSet && applicableTechniques.includes("Método Holístico")

          // Determinar superset
          let supersetWithId: string | undefined = undefined

          if ((isFirstSet && applicableTechniques.includes("Super Sets")) || isSeriesCompuestasAntagonistas) {
            // Buscar el siguiente ejercicio que sea compatible para superset
            const nextExercise = selectedExercises[exerciseIndex + 1]
            if (nextExercise) {
              supersetWithId = nextExercise.id
            }
          }

          // Determinar pre-fatiga
          let preFatigueWithId: string | undefined = undefined

          if (isFirstSet && applicableTechniques.includes("Pre-fatiga") && exercise.isCompound) {
            // Buscar un ejercicio de aislamiento para el mismo grupo muscular
            const isolationExercise = isolationExercises.find(ex =>
              ex.muscleGroup.some(group => exercise.muscleGroup.includes(group))
            )
            if (isolationExercise) {
              preFatigueWithId = isolationExercise.id
            }
          }

          // Ajustar RIR y repeticiones según la técnica
          let adjustedReps = reps
          let adjustedRir = rir
          let adjustedRestTime = restTime

          if (isEntrenamiento37) {
            // Técnica 3/7: 5 mini-series de 3 reps con 15s descanso, seguidas de 1 serie de 7 reps
            if (isFirstSet) {
              adjustedReps = 3
              adjustedRir = 3
              adjustedRestTime = 15
            } else if (isLastSet) {
              adjustedReps = 7
              adjustedRir = 0
            } else {
              adjustedReps = 3
              adjustedRir = 3
              adjustedRestTime = 15
            }
          } else if (isSeriesDescendentesAscendentes) {
            // Ajustar según la posición en la pirámide
            if (sets <= 3) {
              // Simplificado para pocas series
              if (isFirstSet) {
                adjustedReps = reps - 2
                adjustedRir = rir - 1
              } else if (isLastSet) {
                adjustedReps = reps - 2
                adjustedRir = rir - 1
              } else {
                adjustedReps = reps
                adjustedRir = rir
              }
            } else {
              // Implementación completa para 5 series
              const setPosition = i / (sets - 1) // 0 a 1
              if (setPosition < 0.5) {
                // Fase descendente
                adjustedReps = Math.round(reps + (setPosition * 4))
                adjustedRir = Math.round(rir + (setPosition * 2))
              } else {
                // Fase ascendente
                adjustedReps = Math.round(reps + ((1 - setPosition) * 4))
                adjustedRir = Math.round(rir + ((1 - setPosition) * 2))
              }
            }
          }

          // Ajustar descanso para técnicas específicas
          if (isDropSet || isRestPause || isMechanicalSet) {
            adjustedRestTime = Math.round(restTime * 0.5) // Reducir descanso para técnicas intensivas
          } else if (isSeriesGigantesEspecificas) {
            adjustedRestTime = 30 // Descanso mínimo entre ejercicios en series gigantes
          }

          // Crear la serie con todas las técnicas aplicadas
          exerciseSets.push({
            id: uuidv4(),
            exerciseId: exerciseVariantId,
            alternativeExerciseId: alternativeExerciseId,
            exerciseName: exerciseVariant, // Guardar el nombre de la variante
            targetReps: adjustedReps,
            targetRir: adjustedRir,
            restTime: adjustedRestTime,
            isDropSet,
            isRestPause,
            isMechanicalSet,
            isPartialReps,
            isSupersetWith: supersetWithId,
            notes: isFirstSet ?
              `${selectedProgressionMethod}. ${applicableTechniques.length > 0 ? 'Técnicas: ' + applicableTechniques.join(', ') : ''}` :
              undefined
          })
        }
      })

      // Crear el día de entrenamiento
      return {
        id: uuidv4(),
        name: day.name,
        description: `Entrenamiento de ${day.name}`,
        exerciseSets,
        targetMuscleGroups: targetGroups,
        difficulty: level,
        estimatedDuration: exerciseSets.length * 3 // Estimación simple: 3 minutos por serie
      }
    })

    // Crear la rutina completa
    return {
      id: uuidv4(),
      userId,
      name,
      description,
      days,
      frequency,
      goal,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000).toISOString(),
      includesDeload: includeDeload,
      deloadFrequency: deloadFrequency,
      deloadStrategy: deloadType,
      source: useLongTermPlan ? selectedLongTermPlan : "Hipertrofia Maxima Bazman Science",
      tags: [level, goal, split, "avanzado", "periodización"],
      split
    }
  }

  // Obtener días de entrenamiento según el split
  const getWorkoutDaysForSplit = (split: TrainingSplit, freq: number): { name: string, type: string }[] => {
    switch (split) {
      case "ppl":
        return [
          { name: "Empuje A", type: "push" },
          { name: "Tirón A", type: "pull" },
          { name: "Piernas A", type: "legs" },
          { name: "Empuje B", type: "push" },
          { name: "Tirón B", type: "pull" },
          { name: "Piernas B", type: "legs" }
        ].slice(0, freq)

      case "upper_lower":
        return [
          { name: "Tren Superior A", type: "upper" },
          { name: "Tren Inferior A", type: "lower" },
          { name: "Tren Superior B", type: "upper" },
          { name: "Tren Inferior B", type: "lower" }
        ].slice(0, freq)

      case "full_body":
        return [
          { name: "Cuerpo Completo A", type: "full_body" },
          { name: "Cuerpo Completo B", type: "full_body" },
          { name: "Cuerpo Completo C", type: "full_body" }
        ].slice(0, freq)

      case "body_part":
        return [
          { name: "Pecho", type: "chest" },
          { name: "Espalda", type: "back" },
          { name: "Piernas", type: "legs" },
          { name: "Hombros", type: "shoulders" },
          { name: "Brazos", type: "arms" }
        ].slice(0, freq)

      case "push_pull":
        return [
          { name: "Empuje A", type: "push" },
          { name: "Tirón A", type: "pull" },
          { name: "Empuje B", type: "push" },
          { name: "Tirón B", type: "pull" }
        ].slice(0, freq)

      default:
        return [{ name: "Entrenamiento", type: "full_body" }]
    }
  }

  // Obtener grupos musculares para un tipo de día
  const getMuscleGroupsForDay = (dayType: string): string[] => {
    switch (dayType) {
      case "push":
        return ["chest", "shoulders", "triceps"]
      case "pull":
        return ["back", "biceps", "forearms"]
      case "legs":
        return ["quads", "hamstrings", "glutes", "calves"]
      case "upper":
        return ["chest", "back", "shoulders", "triceps", "biceps"]
      case "lower":
        return ["quads", "hamstrings", "glutes", "calves"]
      case "chest":
        return ["chest", "triceps"]
      case "back":
        return ["back", "biceps"]
      case "shoulders":
        return ["shoulders", "traps"]
      case "arms":
        return ["biceps", "triceps", "forearms"]
      case "full_body":
      default:
        return ["chest", "back", "legs", "shoulders", "arms"]
    }
  }

  // Obtener configuración de series y repeticiones según el objetivo
  const getSetsAndRepsForGoal = (
    goal: TrainingGoal,
    exerciseType: "compound" | "isolation"
  ): { sets: number, reps: number, rir: number } => {
    switch (goal) {
      case "strength":
        return exerciseType === "compound"
          ? { sets: 5, reps: 5, rir: 1 }
          : { sets: 3, reps: 8, rir: 2 }

      case "hypertrophy":
        return exerciseType === "compound"
          ? { sets: 4, reps: 8, rir: 2 }
          : { sets: 3, reps: 12, rir: 2 }

      case "endurance":
        return exerciseType === "compound"
          ? { sets: 3, reps: 15, rir: 3 }
          : { sets: 3, reps: 20, rir: 3 }

      case "power":
        return exerciseType === "compound"
          ? { sets: 5, reps: 3, rir: 1 }
          : { sets: 3, reps: 6, rir: 2 }

      case "weight_loss":
        return exerciseType === "compound"
          ? { sets: 3, reps: 12, rir: 1 }
          : { sets: 3, reps: 15, rir: 1 }

      default:
        return { sets: 3, reps: 10, rir: 2 }
    }
  }

  // Guardar la rutina
  const handleSave = () => {
    if (generatedRoutine) {
      onSave(generatedRoutine)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Configuración Básica</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="space-y-4">
              <div>
                <Label htmlFor="routine-name">Nombre de la rutina</Label>
                <Input
                  id="routine-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="routine-description">Descripción</Label>
                <Input
                  id="routine-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="training-level">Nivel</Label>
                  <Select value={level} onValueChange={(value: TrainingLevel) => setLevel(value)}>
                    <SelectTrigger id="training-level" className="mt-1">
                      <SelectValue placeholder="Selecciona nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="training-goal">Objetivo</Label>
                  <Select value={goal} onValueChange={(value: TrainingGoal) => setGoal(value)}>
                    <SelectTrigger id="training-goal" className="mt-1">
                      <SelectValue placeholder="Selecciona objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                      <SelectItem value="endurance">Resistencia</SelectItem>
                      <SelectItem value="power">Potencia</SelectItem>
                      <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Estructura de Entrenamiento</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="space-y-4">
              <div>
                <Label htmlFor="training-split">Tipo de Split</Label>
                <Select value={split} onValueChange={(value: TrainingSplit) => setSplit(value)}>
                  <SelectTrigger id="training-split" className="mt-1">
                    <SelectValue placeholder="Selecciona split" />
                  </SelectTrigger>
                  <SelectContent>
                    {splitOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {splitOptions.find(o => o.value === split)?.description}
                </p>
              </div>

              <div>
                <Label htmlFor="training-frequency">Frecuencia (días por semana)</Label>
                <Select
                  value={frequency.toString()}
                  onValueChange={(value) => setFrequency(parseInt(value))}
                >
                  <SelectTrigger id="training-frequency" className="mt-1">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="4">4 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="6">6 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="program-duration">Duración del programa</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) => setDuration(parseInt(value))}
                >
                  <SelectTrigger id="program-duration" className="mt-1">
                    <SelectValue placeholder="Selecciona duración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 semanas</SelectItem>
                    <SelectItem value="8">8 semanas</SelectItem>
                    <SelectItem value="12">12 semanas</SelectItem>
                    <SelectItem value="16">16 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Configuración Avanzada</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="space-y-4">
              {/* Periodización */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-periodization">Usar periodización avanzada</Label>
                  <p className="text-xs text-muted-foreground">
                    Implementa principios de periodización para optimizar el progreso
                  </p>
                </div>
                <Switch
                  id="use-periodization"
                  checked={usePeriodization}
                  onCheckedChange={setUsePeriodization}
                />
              </div>

              {usePeriodization && (
                <div>
                  <Label htmlFor="periodization-type">Tipo de periodización</Label>
                  <Select
                    value={periodizationType}
                    onValueChange={(value: 'linear' | 'undulating' | 'block' | 'conjugate') => setPeriodizationType(value)}
                  >
                    <SelectTrigger id="periodization-type" className="mt-1">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Lineal (Intensidad ↑, Volumen ↓)</SelectItem>
                      <SelectItem value="undulating">Ondulante (Varía por día)</SelectItem>
                      <SelectItem value="block">Por bloques (Fases específicas)</SelectItem>
                      <SelectItem value="conjugate">Conjugada (Múltiples cualidades)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {periodizationType === 'linear' && "Aumenta progresivamente la intensidad y reduce el volumen a lo largo del tiempo."}
                    {periodizationType === 'undulating' && "Varía la intensidad y el volumen dentro de la misma semana para estimular diferentes adaptaciones."}
                    {periodizationType === 'block' && "Divide el entrenamiento en bloques con objetivos específicos (hipertrofia, fuerza, etc)."}
                    {periodizationType === 'conjugate' && "Desarrolla múltiples cualidades simultáneamente con variación constante."}
                  </p>
                </div>
              )}

              {/* Plan a largo plazo */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-long-term-plan">Usar plan a largo plazo</Label>
                  <p className="text-xs text-muted-foreground">
                    Implementa un plan de periodización a largo plazo con múltiples fases
                  </p>
                </div>
                <Switch
                  id="use-long-term-plan"
                  checked={useLongTermPlan}
                  onCheckedChange={setUseLongTermPlan}
                />
              </div>

              {useLongTermPlan && (
                <div>
                  <Label htmlFor="long-term-plan">Plan a largo plazo</Label>
                  <Select
                    value={selectedLongTermPlan}
                    onValueChange={setSelectedLongTermPlan}
                  >
                    <SelectTrigger id="long-term-plan" className="mt-1">
                      <SelectValue placeholder="Selecciona plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {LONG_TERM_PERIODIZATION_MODELS.map(plan => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.name} ({plan.duration} semanas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {LONG_TERM_PERIODIZATION_MODELS.find(p => p.name === selectedLongTermPlan)?.description}
                  </p>
                </div>
              )}

              {/* Deload */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-deload">Incluir semanas de descarga</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce el volumen o intensidad periódicamente para facilitar la recuperación
                  </p>
                </div>
                <Switch
                  id="include-deload"
                  checked={includeDeload}
                  onCheckedChange={setIncludeDeload}
                />
              </div>

              {includeDeload && (
                <>
                  <div>
                    <Label htmlFor="deload-frequency">Frecuencia de descarga</Label>
                    <Select
                      value={deloadFrequency.toString()}
                      onValueChange={(value) => setDeloadFrequency(parseInt(value))}
                    >
                      <SelectTrigger id="deload-frequency" className="mt-1">
                        <SelectValue placeholder="Selecciona frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Cada 3 semanas</SelectItem>
                        <SelectItem value="4">Cada 4 semanas</SelectItem>
                        <SelectItem value="5">Cada 5 semanas</SelectItem>
                        <SelectItem value="6">Cada 6 semanas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deload-type">Tipo de descarga</Label>
                    <Select
                      value={deloadType}
                      onValueChange={(value: 'volume' | 'intensity' | 'both' | 'frequency') => setDeloadType(value)}
                    >
                      <SelectTrigger id="deload-type" className="mt-1">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volume">Volumen (↓ series/reps)</SelectItem>
                        <SelectItem value="intensity">Intensidad (↓ peso/RIR)</SelectItem>
                        <SelectItem value="both">Combinada (↓ volumen e intensidad)</SelectItem>
                        <SelectItem value="frequency">Frecuencia (↓ días de entrenamiento)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* RIR */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-rir">Entrenamiento basado en RIR</Label>
                  <p className="text-xs text-muted-foreground">
                    Utiliza el sistema de Repeticiones en Reserva para controlar la intensidad
                  </p>
                </div>
                <Switch
                  id="use-rir"
                  checked={useRirBasedTraining}
                  onCheckedChange={setUseRirBasedTraining}
                />
              </div>

              {useRirBasedTraining && (
                <div>
                  <Label htmlFor="rir-range">Rango de RIR predeterminado</Label>
                  <div className="pt-4 pb-2">
                    <Slider
                      id="rir-range"
                      value={[defaultRirRange[0], defaultRirRange[1]]}
                      min={0}
                      max={4}
                      step={1}
                      onValueChange={(value) => setDefaultRirRange([value[0], value[1]])}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    RIR: {defaultRirRange[0]} - {defaultRirRange[1]}
                  </p>
                </div>
              )}

              {/* Método de progresión */}
              <div>
                <Label htmlFor="progression-method">Método de Progresión</Label>
                <Select
                  value={selectedProgressionMethod}
                  onValueChange={setSelectedProgressionMethod}
                >
                  <SelectTrigger id="progression-method" className="mt-1">
                    <SelectValue placeholder="Selecciona método de progresión" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRESSION_METHODS.map(method => (
                      <SelectItem key={method.name} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {PROGRESSION_METHODS.find(m => m.name === selectedProgressionMethod)?.description}
                </p>
                <p className="text-xs mt-1">
                  {PROGRESSION_METHODS.find(m => m.name === selectedProgressionMethod)?.implementation}
                </p>
              </div>

              {/* Variantes y alternativas */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-variants">Usar variantes de ejercicios</Label>
                  <p className="text-xs text-muted-foreground">
                    Incluye variantes de ejercicios para atacar los músculos desde diferentes ángulos
                  </p>
                </div>
                <Switch
                  id="use-variants"
                  checked={useExerciseVariants}
                  onCheckedChange={setUseExerciseVariants}
                />
              </div>

              {useExerciseVariants && (
                <div>
                  <Label htmlFor="variant-frequency">Frecuencia de cambio de variantes</Label>
                  <Select
                    value={variantFrequency}
                    onValueChange={(value: "weekly" | "biweekly" | "monthly") => setVariantFrequency(value)}
                  >
                    <SelectTrigger id="variant-frequency" className="mt-1">
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Cada dos semanas</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-alternatives">Usar ejercicios alternativos</Label>
                  <p className="text-xs text-muted-foreground">
                    Incluye ejercicios alternativos para cada ejercicio principal
                  </p>
                </div>
                <Switch
                  id="use-alternatives"
                  checked={useAlternativeExercises}
                  onCheckedChange={setUseAlternativeExercises}
                />
              </div>

              {useAlternativeExercises && (
                <div>
                  <Label htmlFor="alternatives-count">Alternativas por ejercicio</Label>
                  <Select
                    value={alternativeExercisesPerMain.toString()}
                    onValueChange={(value) => setAlternativeExercisesPerMain(parseInt(value))}
                  >
                    <SelectTrigger id="alternatives-count" className="mt-1">
                      <SelectValue placeholder="Selecciona cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 alternativa</SelectItem>
                      <SelectItem value="2">2 alternativas</SelectItem>
                      <SelectItem value="3">3 alternativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Grupos musculares prioritarios */}
              <div>
                <Label className="mb-2 block">Grupos musculares prioritarios</Label>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroupOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`focus-${option.value}`}
                        checked={focusAreas.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFocusAreas([...focusAreas, option.value])
                          } else {
                            setFocusAreas(focusAreas.filter(area => area !== option.value))
                          }
                        }}
                      />
                      <Label htmlFor={`focus-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Técnicas avanzadas estándar */}
              <div>
                <Label className="mb-2 block">Técnicas avanzadas estándar</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                  {ADVANCED_TECHNIQUES.map(technique => (
                    <div key={technique.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`technique-${technique.name}`}
                        checked={selectedTechniques.includes(technique.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTechniques([...selectedTechniques, technique.name])
                          } else {
                            setSelectedTechniques(selectedTechniques.filter(t => t !== technique.name))
                          }
                        }}
                      />
                      <div>
                        <Label htmlFor={`technique-${technique.name}`}>{technique.name}</Label>
                        <p className="text-xs text-muted-foreground">{technique.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Técnicas avanzadas españolas */}
              <div>
                <Label className="mb-2 block">Técnicas avanzadas españolas</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                  {SPANISH_ADVANCED_TECHNIQUES.map(technique => (
                    <div key={technique.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spanish-technique-${technique.name}`}
                        checked={selectedSpanishTechniques.includes(technique.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSpanishTechniques([...selectedSpanishTechniques, technique.name])
                          } else {
                            setSelectedSpanishTechniques(selectedSpanishTechniques.filter(t => t !== technique.name))
                          }
                        }}
                      />
                      <div>
                        <Label htmlFor={`spanish-technique-${technique.name}`}>{technique.name}</Label>
                        <p className="text-xs text-muted-foreground">{technique.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Implementación:</span> {technique.implementation}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">Fatiga: {technique.fatigueImpact}/10</Badge>
                          <Badge variant="outline" className="text-xs">Hipertrofia: {technique.muscleGrowthPotential}/10</Badge>
                          <Badge variant="outline" className="text-xs">Fuerza: {technique.strengthGainPotential}/10</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          <div className="flex justify-end space-x-2">
            <Button3D variant="outline" onClick={onCancel}>
              Cancelar
            </Button3D>
            <Button3D onClick={generateRoutine}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generar Rutina
                </>
              )}
            </Button3D>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Generando rutina avanzada...</p>
            </div>
          ) : generatedRoutine ? (
            <div className="space-y-6">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>{generatedRoutine.name}</Card3DTitle>
                </Card3DHeader>
                <Card3DContent>
                  <p className="text-sm">{generatedRoutine.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>{generatedRoutine.level}</Badge>
                    <Badge>{generatedRoutine.goal}</Badge>
                    <Badge>{generatedRoutine.frequency} días/semana</Badge>
                    <Badge>{generatedRoutine.split}</Badge>
                    {includeDeload && (
                      <Badge variant="outline">Deload cada {deloadFrequency} semanas ({deloadType})</Badge>
                    )}
                    {usePeriodization && (
                      <Badge variant="outline">Periodización {periodizationType}</Badge>
                    )}
                    {useLongTermPlan && (
                      <Badge variant="outline">{selectedLongTermPlan}</Badge>
                    )}
                  </div>

                  {/* Mostrar técnicas seleccionadas */}
                  {(selectedTechniques.length > 0 || selectedSpanishTechniques.length > 0) && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">Técnicas avanzadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTechniques.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                        {selectedSpanishTechniques.map(tech => (
                          <Badge key={tech} variant="default" className="text-xs bg-amber-600">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card3DContent>
              </Card3D>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Días de entrenamiento</h3>
                {generatedRoutine.days.map((day, index) => (
                  <Card3D key={day.id}>
                    <Card3DHeader>
                      <Card3DTitle>{day.name}</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {day.targetMuscleGroups.map(group => (
                          <Badge key={group} variant="outline">{group}</Badge>
                        ))}
                      </div>

                      <div className="space-y-2 mt-4">
                        {day.exerciseSets.reduce((acc: any[], set, i, arr) => {
                          // Agrupar por ejercicio
                          const prevSet = arr[i - 1]
                          if (i === 0 || set.exerciseId !== prevSet.exerciseId) {
                            // Encontrar el ejercicio
                            const exercise = availableExercises.find(e => e.id === set.exerciseId)

                            // Encontrar ejercicio alternativo si existe
                            const alternativeExercise = set.alternativeExerciseId
                              ? availableExercises.find(e => e.id === set.alternativeExerciseId)
                              : null

                            // Contar series para este ejercicio
                            const setsCount = arr.filter(s => s.exerciseId === set.exerciseId).length

                            // Determinar el nombre a mostrar (variante o nombre original)
                            const displayName = set.exerciseName || exercise?.name || set.exerciseId

                            // Determinar si es una variante
                            const isVariant = set.exerciseName && set.exerciseName !== exercise?.name

                            acc.push(
                              <div key={set.id} className="flex justify-between items-start py-2 border-b">
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium">{displayName}</p>
                                    {isVariant && (
                                      <Badge variant="outline" className="ml-2">Variante</Badge>
                                    )}
                                  </div>

                                  {/* Mostrar ejercicio alternativo si existe */}
                                  {alternativeExercise && (
                                    <div className="flex items-center mt-1">
                                      <p className="text-xs text-muted-foreground">
                                        Alternativa: <span className="font-medium">{alternativeExercise.name}</span>
                                      </p>
                                    </div>
                                  )}

                                  <p className="text-xs text-muted-foreground mt-1">
                                    {setsCount} series × {set.targetReps} reps (RIR: {set.targetRir})
                                  </p>

                                  {set.notes && (
                                    <p className="text-xs mt-1 text-muted-foreground">{set.notes}</p>
                                  )}
                                </div>
                                <div className="text-sm text-right">
                                  <p>{set.restTime}s descanso</p>
                                  <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                    {set.isDropSet && (
                                      <Badge variant="secondary" size="sm">Drop Set</Badge>
                                    )}
                                    {set.isRestPause && (
                                      <Badge variant="secondary" size="sm">Rest-Pause</Badge>
                                    )}
                                    {set.isMechanicalSet && (
                                      <Badge variant="secondary" size="sm">Mecánica</Badge>
                                    )}
                                    {set.isPartialReps && (
                                      <Badge variant="secondary" size="sm">Parciales</Badge>
                                    )}
                                    {set.isSupersetWith && (
                                      <Badge variant="secondary" size="sm">Superset</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return acc
                        }, [])}
                      </div>
                    </Card3DContent>
                  </Card3D>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button3D variant="outline" onClick={() => setActiveTab("config")}>
                  Volver a Configuración
                </Button3D>
                <Button3D onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Rutina
                </Button3D>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p>Configura y genera una rutina para ver la vista previa</p>
              <Button3D
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab("config")}
              >
                Ir a Configuración
              </Button3D>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
