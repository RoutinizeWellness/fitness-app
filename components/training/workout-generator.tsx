"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Dumbbell,
  Calendar,
  Clock,
  ArrowRight,
  Check,
  Loader2,
  Save,
  Edit,
  Shuffle,
  AlertTriangle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { WorkoutPreferences } from "./workout-questionnaire"
import { getExercises, Exercise } from "@/lib/supabase"
import { saveWorkoutRoutine } from "@/lib/training-service"

// Tipos para la rutina generada
export interface WorkoutDay {
  id: string
  name: string
  exercises: WorkoutExercise[]
  targetMuscleGroups: string[]
  type: string
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: string
  rest: number
  alternatives?: string[]
}

export interface GeneratedWorkout {
  id: string
  userId: string
  name: string
  description: string
  level: string
  goal: string
  frequency: string
  days: WorkoutDay[]
}

interface WorkoutGeneratorProps {
  preferences: WorkoutPreferences
  userId: string
  onSave: (workout: GeneratedWorkout) => void
  onEdit: () => void
  onCancel: () => void
}

export function WorkoutGenerator({
  preferences,
  userId,
  onSave,
  onEdit,
  onCancel
}: WorkoutGeneratorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)

  // Cargar ejercicios disponibles
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getExercises()
        if (error) {
          throw error
        }

        // Verificar los datos recibidos
        console.log(`Ejercicios cargados: ${data?.length || 0}`);
        if (data && data.length > 0) {
          // Mostrar un ejemplo de ejercicio para depuración
          console.log('Ejemplo de ejercicio:', data[0]);

          // Contar ejercicios por grupo muscular
          const muscleGroups: Record<string, number> = {};
          data.forEach(ex => {
            if (Array.isArray(ex.muscleGroup)) {
              ex.muscleGroup.forEach(mg => {
                muscleGroups[mg] = (muscleGroups[mg] || 0) + 1;
              });
            } else if (ex.muscleGroup) {
              muscleGroups[ex.muscleGroup] = (muscleGroups[ex.muscleGroup] || 0) + 1;
            }
          });
          console.log('Distribución de ejercicios por grupo muscular:', muscleGroups);
        }

        setAvailableExercises(data || [])
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [toast])

  // Generar rutina basada en preferencias
  useEffect(() => {
    if (!isLoading && availableExercises.length > 0) {
      generateWorkout()
    }
  }, [isLoading, availableExercises])

  // Función para generar la rutina
  const generateWorkout = async () => {
    setIsGenerating(true)

    try {
      // Verificar si hay ejercicios disponibles
      if (availableExercises.length === 0) {
        console.error("No hay ejercicios disponibles en la base de datos");
        toast({
          title: "Error",
          description: "No se encontraron ejercicios en la base de datos",
          variant: "destructive"
        });
        return;
      }

      // Filtrar ejercicios según equipamiento disponible
      let filteredExercises = availableExercises.filter(exercise => {
        // Si no hay información de equipamiento, incluir el ejercicio
        if (!exercise.equipment || exercise.equipment.length === 0) {
          return true;
        }

        // Verificar si al menos un equipo del ejercicio está en las preferencias
        return Array.isArray(exercise.equipment) && exercise.equipment.some(eq => preferences.equipment.includes(eq));
      });

      console.log(`Ejercicios filtrados por equipamiento: ${filteredExercises.length} de ${availableExercises.length}`);

      // Si no hay ejercicios con el equipamiento seleccionado, usar ejercicios con peso corporal
      if (filteredExercises.length === 0) {
        console.log("No hay ejercicios con el equipamiento seleccionado, usando ejercicios con peso corporal");

        // Incluir ejercicios de peso corporal
        filteredExercises = availableExercises.filter(exercise => {
          if (!exercise.equipment || exercise.equipment.length === 0) {
            return true;
          }
          return Array.isArray(exercise.equipment) && exercise.equipment.some(eq =>
            eq === "bodyweight" || eq === "none" || eq === "Peso corporal" || eq === "Sin equipo"
          );
        });

        // Si aún no hay ejercicios, usar todos los disponibles
        if (filteredExercises.length === 0) {
          console.log("No hay ejercicios de peso corporal, usando todos los ejercicios disponibles");
          filteredExercises = [...availableExercises];

          toast({
            title: "Aviso",
            description: "Se han incluido todos los ejercicios disponibles ya que no se encontraron ejercicios con el equipamiento seleccionado",
            variant: "default"
          });
        } else {
          toast({
            title: "Aviso",
            description: "Se han incluido ejercicios de peso corporal ya que no se encontraron ejercicios con el equipamiento seleccionado",
            variant: "default"
          });
        }
      }

      // Crear estructura de la rutina
      const workoutId = uuidv4()
      const days: WorkoutDay[] = []

      // Determinar split según frecuencia y objetivos
      const splitType = getSplitType(preferences.frequency, preferences.goal)
      const dayNames = getDayNames(splitType, preferences.frequency)
      const muscleGroupsByDay = getMuscleGroupsByDay(splitType, preferences.frequency, preferences.focusAreas)

      // Crear días de entrenamiento
      for (let i = 0; i < preferences.frequency; i++) {
        const dayId = uuidv4()
        const targetMuscleGroups = muscleGroupsByDay[i]
        const dayType = getDayType(preferences.goal, targetMuscleGroups)

        // Seleccionar ejercicios para este día
        const dayExercises = selectExercisesForDay(
          filteredExercises,
          targetMuscleGroups,
          preferences.experience,
          preferences.limitations,
          dayType
        )

        days.push({
          id: dayId,
          name: dayNames[i],
          exercises: dayExercises,
          targetMuscleGroups,
          type: dayType
        })
      }

      // Crear la rutina completa
      const workout: GeneratedWorkout = {
        id: workoutId,
        userId,
        name: getWorkoutName(preferences),
        description: getWorkoutDescription(preferences),
        level: preferences.experience,
        goal: preferences.goal,
        frequency: `${preferences.frequency} días por semana`,
        days
      }

      setGeneratedWorkout(workout)

    } catch (error) {
      console.error("Error al generar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la rutina de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para guardar la rutina
  const handleSave = async () => {
    if (!generatedWorkout) return

    setIsSaving(true)

    try {
      const { data, error } = await saveWorkoutRoutine(generatedWorkout)

      if (error) {
        throw error
      }

      toast({
        title: "Rutina guardada",
        description: "La rutina se ha guardado correctamente",
      })

      onSave(generatedWorkout)

    } catch (error) {
      console.error("Error al guardar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función para regenerar la rutina
  const handleRegenerate = () => {
    generateWorkout()
  }

  // Funciones auxiliares para generar la rutina
  const getSplitType = (frequency: number, goal: string): string => {
    if (frequency <= 3) {
      return "fullbody"
    } else if (frequency === 4) {
      return goal === "strength" ? "upper_lower" : "push_pull_legs"
    } else {
      return "body_part"
    }
  }

  const getDayNames = (splitType: string, frequency: number): string[] => {
    switch (splitType) {
      case "fullbody":
        return Array(frequency).fill(0).map((_, i) => `Cuerpo completo ${i + 1}`)
      case "upper_lower":
        return ["Tren superior A", "Tren inferior A", "Tren superior B", "Tren inferior B"]
      case "push_pull_legs":
        if (frequency === 4) {
          return ["Empuje", "Tirón", "Piernas", "Cuerpo completo"]
        }
        return ["Empuje", "Tirón", "Piernas", "Empuje 2", "Tirón 2"]
      case "body_part":
        return ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Cuerpo completo"]
      default:
        return Array(frequency).fill(0).map((_, i) => `Día ${i + 1}`)
    }
  }

  const getMuscleGroupsByDay = (splitType: string, frequency: number, focusAreas: string[]): string[][] => {
    console.log('Generando grupos musculares para split:', splitType, 'frecuencia:', frequency, 'áreas de enfoque:', focusAreas);

    // Mapear los grupos musculares a los valores que existen en la base de datos
    const mapMuscleGroup = (group: string): string => {
      const muscleGroupMap: Record<string, string> = {
        'chest': 'Pecho',
        'back': 'Espalda',
        'legs': 'Piernas',
        'shoulders': 'Hombros',
        'arms': 'Brazos',
        'core': 'Core',
        'glutes': 'Glúteos',
        'biceps': 'Bíceps',
        'triceps': 'Tríceps',
        'abs': 'Abdominales',
        'quads': 'Cuádriceps',
        'hamstrings': 'Isquiotibiales',
        'calves': 'Pantorrillas'
      };

      return muscleGroupMap[group] || group;
    };

    // Función para mapear arrays de grupos musculares
    const mapGroups = (groups: string[]): string[] => {
      return groups.map(mapMuscleGroup);
    };

    let result: string[][];

    switch (splitType) {
      case "fullbody":
        result = Array(frequency).fill(mapGroups(["chest", "back", "legs", "shoulders", "arms", "core"]));
        break;
      case "upper_lower":
        result = [
          mapGroups(["chest", "back", "shoulders", "arms"]),
          mapGroups(["legs", "glutes", "core"]),
          mapGroups(["chest", "back", "shoulders", "arms"]),
          mapGroups(["legs", "glutes", "core"])
        ];
        break;
      case "push_pull_legs":
        if (frequency === 4) {
          result = [
            mapGroups(["chest", "shoulders", "triceps"]),
            mapGroups(["back", "biceps"]),
            mapGroups(["legs", "glutes", "core"]),
            mapGroups(["chest", "back", "legs", "shoulders", "arms"])
          ];
        } else {
          result = [
            mapGroups(["chest", "shoulders", "triceps"]),
            mapGroups(["back", "biceps"]),
            mapGroups(["legs", "glutes", "core"]),
            mapGroups(["chest", "shoulders", "triceps"]),
            mapGroups(["back", "biceps"])
          ];
        }
        break;
      case "body_part":
        result = [
          mapGroups(["chest"]),
          mapGroups(["back"]),
          mapGroups(["legs", "glutes"]),
          mapGroups(["shoulders"]),
          mapGroups(["arms"]),
          mapGroups(["core", "abs"])
        ];
        break;
      default:
        result = Array(frequency).fill(mapGroups(["chest", "back", "legs", "shoulders", "arms", "core"]));
    }

    console.log('Grupos musculares generados:', result);
    return result;
  }

  const getDayType = (goal: string, muscleGroups: string[]): string => {
    switch (goal) {
      case "strength":
        return "strength"
      case "hypertrophy":
        return "hypertrophy"
      case "endurance":
        return "endurance"
      case "weight_loss":
        return muscleGroups.includes("legs") ? "metabolic" : "circuit"
      case "general_fitness":
        return "functional"
      case "athletic":
        return muscleGroups.includes("legs") ? "power" : "athletic"
      default:
        return "hypertrophy"
    }
  }

  const selectExercisesForDay = (
    exercises: Exercise[],
    muscleGroups: string[],
    experience: string,
    limitations: string[],
    dayType: string
  ): WorkoutExercise[] => {
    // Filtrar ejercicios por grupo muscular
    console.log('Filtrando ejercicios para grupos musculares:', muscleGroups);
    console.log('Total de ejercicios disponibles:', exercises.length);

    let filteredByMuscle = exercises.filter(ex => {
      // Verificar si el grupo muscular principal está incluido
      const primaryMatch = Array.isArray(ex.muscleGroup)
        ? ex.muscleGroup.some(mg => muscleGroups.includes(mg))
        : muscleGroups.includes(ex.muscleGroup);

      // Verificar grupos musculares secundarios si existen
      const secondaryMatch = ex.secondary_muscle_groups && Array.isArray(ex.secondary_muscle_groups)
        ? ex.secondary_muscle_groups.some(m => muscleGroups.includes(m))
        : false;

      return primaryMatch || secondaryMatch;
    });

    console.log('Ejercicios filtrados por grupo muscular:', filteredByMuscle.length);

    // Si no hay suficientes ejercicios para los grupos musculares, incluir ejercicios de grupos similares
    if (filteredByMuscle.length < 5) {
      console.log('Pocos ejercicios disponibles, ampliando la selección con grupos musculares relacionados');

      // Mapeo de grupos musculares relacionados
      const relatedMuscleGroups: Record<string, string[]> = {
        'Pecho': ['Hombros', 'Tríceps'],
        'Espalda': ['Hombros', 'Bíceps'],
        'Hombros': ['Pecho', 'Espalda', 'Tríceps'],
        'Bíceps': ['Espalda', 'Antebrazos'],
        'Tríceps': ['Pecho', 'Hombros'],
        'Piernas': ['Glúteos', 'Core'],
        'Glúteos': ['Piernas', 'Core'],
        'Core': ['Abdominales', 'Espalda baja'],
        'Abdominales': ['Core', 'Espalda baja']
      };

      // Ampliar los grupos musculares con grupos relacionados
      const extendedMuscleGroups = [...muscleGroups];
      muscleGroups.forEach(group => {
        if (relatedMuscleGroups[group]) {
          extendedMuscleGroups.push(...relatedMuscleGroups[group]);
        }
      });

      // Eliminar duplicados
      const uniqueExtendedGroups = [...new Set(extendedMuscleGroups)];

      // Filtrar nuevamente con los grupos extendidos
      filteredByMuscle = exercises.filter(ex => {
        const primaryMatch = Array.isArray(ex.muscleGroup)
          ? ex.muscleGroup.some(mg => uniqueExtendedGroups.includes(mg))
          : uniqueExtendedGroups.includes(ex.muscleGroup);

        const secondaryMatch = ex.secondary_muscle_groups && Array.isArray(ex.secondary_muscle_groups)
          ? ex.secondary_muscle_groups.some(m => uniqueExtendedGroups.includes(m))
          : false;

        return primaryMatch || secondaryMatch;
      });

      console.log('Ejercicios después de ampliar grupos musculares:', filteredByMuscle.length);
    }

    // Filtrar por nivel de dificultad
    let filteredByLevel = filteredByMuscle.filter(ex => {
      if (experience === "beginner") return ex.difficulty !== "advanced";
      if (experience === "intermediate") return true;
      return ex.difficulty !== "beginner";
    });

    console.log('Ejercicios filtrados por nivel de dificultad:', filteredByLevel.length);

    // Si hay muy pocos ejercicios después de filtrar por dificultad, incluir todos los niveles
    if (filteredByLevel.length < 5) {
      console.log('Pocos ejercicios disponibles después de filtrar por dificultad, incluyendo todos los niveles');
      filteredByLevel = filteredByMuscle;
    }

    // Filtrar por limitaciones
    let filteredByLimitations = limitations.length > 0
      ? filteredByLevel.filter(ex =>
          !limitations.some(limitation =>
            ex.contraindications?.includes(limitation)
          )
        )
      : filteredByLevel;

    // Si hay muy pocos ejercicios después de filtrar por limitaciones, ignorar algunas limitaciones
    if (filteredByLimitations.length < 5 && limitations.length > 0) {
      console.log('Pocos ejercicios disponibles después de filtrar por limitaciones, relajando restricciones');
      filteredByLimitations = filteredByLevel;
    }

    // Determinar número de ejercicios según tipo de día
    let numExercises = 0;
    switch (dayType) {
      case "strength":
        numExercises = muscleGroups.length <= 2 ? 6 : 8;
        break;
      case "hypertrophy":
        numExercises = muscleGroups.length <= 2 ? 7 : 9;
        break;
      case "endurance":
      case "circuit":
      case "metabolic":
        numExercises = 10;
        break;
      case "power":
      case "athletic":
        numExercises = 6;
        break;
      case "functional":
        numExercises = 8;
        break;
      default:
        numExercises = 7;
    }

    // Ajustar por nivel de experiencia
    if (experience === "beginner") {
      numExercises = Math.max(4, numExercises - 2);
    } else if (experience === "advanced") {
      numExercises += 1;
    }

    // Ajustar el número de ejercicios si no hay suficientes disponibles
    numExercises = Math.min(numExercises, filteredByLimitations.length);

    // Asegurar que al menos tengamos 3 ejercicios
    numExercises = Math.max(3, numExercises);

    // Seleccionar ejercicios aleatoriamente
    const selectedExercises: Exercise[] = [];
    const exercisesByMuscle: Record<string, Exercise[]> = {};

    // Agrupar ejercicios por grupo muscular
    muscleGroups.forEach(group => {
      exercisesByMuscle[group] = filteredByLimitations.filter(ex => {
        if (Array.isArray(ex.muscleGroup)) {
          return ex.muscleGroup.includes(group);
        }
        return ex.muscleGroup === group;
      });
    });

    // Seleccionar al menos un ejercicio por grupo muscular si es posible
    muscleGroups.forEach(group => {
      if (exercisesByMuscle[group] && exercisesByMuscle[group].length > 0) {
        const randomIndex = Math.floor(Math.random() * exercisesByMuscle[group].length);
        selectedExercises.push(exercisesByMuscle[group][randomIndex]);
        // Eliminar el ejercicio seleccionado para evitar duplicados
        const selectedId = exercisesByMuscle[group][randomIndex].id;
        Object.keys(exercisesByMuscle).forEach(key => {
          exercisesByMuscle[key] = exercisesByMuscle[key].filter(ex => ex.id !== selectedId);
        });
      }
    });

    // Completar con ejercicios adicionales
    const remainingExercises = filteredByLimitations.filter(
      ex => !selectedExercises.some(selected => selected.id === ex.id)
    );

    while (selectedExercises.length < numExercises && remainingExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingExercises.length);
      selectedExercises.push(remainingExercises[randomIndex]);
      remainingExercises.splice(randomIndex, 1);
    }

    // Crear objetos de ejercicio con sets y reps según el tipo de día
    return selectedExercises.map(exercise => {
      const { sets, reps, rest } = getSetScheme(dayType, exercise.isCompound)

      // Encontrar alternativas para este ejercicio
      const alternatives = filteredByLimitations
        .filter(ex => {
          if (ex.id === exercise.id) return false;

          // Verificar si trabajan el mismo grupo muscular principal
          let sameGroup = false;

          if (Array.isArray(exercise.muscleGroup) && Array.isArray(ex.muscleGroup)) {
            // Si ambos son arrays, verificar si tienen al menos un grupo muscular en común
            sameGroup = exercise.muscleGroup.some(group => ex.muscleGroup.includes(group));
          } else if (Array.isArray(exercise.muscleGroup)) {
            // Si solo exercise.muscleGroup es array
            sameGroup = exercise.muscleGroup.includes(ex.muscleGroup);
          } else if (Array.isArray(ex.muscleGroup)) {
            // Si solo ex.muscleGroup es array
            sameGroup = ex.muscleGroup.includes(exercise.muscleGroup);
          } else {
            // Si ambos son strings
            sameGroup = ex.muscleGroup === exercise.muscleGroup;
          }

          return sameGroup && ex.isCompound === exercise.isCompound;
        })
        .slice(0, 3)
        .map(ex => ex.id)

      return {
        id: uuidv4(),
        exerciseId: exercise.id,
        exercise,
        sets,
        reps,
        rest,
        alternatives: alternatives.length > 0 ? alternatives : undefined
      }
    })
  }

  const getSetScheme = (dayType: string, isCompound: boolean): { sets: number, reps: string, rest: number } => {
    switch (dayType) {
      case "strength":
        return isCompound
          ? { sets: 5, reps: "5", rest: 180 }
          : { sets: 4, reps: "6-8", rest: 120 }
      case "hypertrophy":
        return isCompound
          ? { sets: 4, reps: "8-12", rest: 90 }
          : { sets: 3, reps: "10-15", rest: 60 }
      case "endurance":
        return { sets: 3, reps: "15-20", rest: 45 }
      case "circuit":
      case "metabolic":
        return { sets: 3, reps: "12-15", rest: 30 }
      case "power":
        return isCompound
          ? { sets: 5, reps: "3-5", rest: 180 }
          : { sets: 4, reps: "6-8", rest: 120 }
      case "athletic":
        return { sets: 4, reps: "6-10", rest: 90 }
      case "functional":
        return { sets: 3, reps: "10-12", rest: 60 }
      default:
        return { sets: 3, reps: "8-12", rest: 60 }
    }
  }

  const getWorkoutName = (preferences: WorkoutPreferences): string => {
    const goalNames: Record<string, string> = {
      strength: "Fuerza",
      hypertrophy: "Hipertrofia",
      endurance: "Resistencia",
      weight_loss: "Pérdida de peso",
      general_fitness: "Fitness general",
      athletic: "Rendimiento atlético"
    }

    const levelNames: Record<string, string> = {
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado"
    }

    return `Rutina de ${goalNames[preferences.goal]} - ${levelNames[preferences.experience]}`
  }

  const getWorkoutDescription = (preferences: WorkoutPreferences): string => {
    return `Rutina personalizada de ${preferences.frequency} días por semana, enfocada en ${preferences.focusAreas.join(", ")}.`
  }

  if (isLoading || isGenerating) {
    return (
      <Card3D className="w-full">
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">
            {isLoading ? "Cargando ejercicios..." : "Generando tu rutina personalizada..."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Esto puede tomar unos momentos
          </p>
        </Card3DContent>
      </Card3D>
    )
  }

  if (!generatedWorkout) {
    return (
      <Card3D className="w-full">
        <Card3DContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-lg font-medium">No se pudo generar la rutina</p>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Hubo un problema al crear tu rutina personalizada
          </p>
          <div className="flex space-x-4">
            <Button3D variant="outline" onClick={onCancel}>
              Volver
            </Button3D>
            <Button3D onClick={onEdit}>
              Editar preferencias
            </Button3D>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }

  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <div className="flex items-center justify-between">
          <Card3DTitle>{generatedWorkout.name}</Card3DTitle>
          <Badge variant="outline" className="ml-2">
            {generatedWorkout.level}
          </Badge>
        </div>
        <p className="text-muted-foreground">{generatedWorkout.description}</p>
      </Card3DHeader>
      <Card3DContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="days">Días ({generatedWorkout.days.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-sm text-muted-foreground">
                    {preferences.goal === "strength" && "Fuerza"}
                    {preferences.goal === "hypertrophy" && "Hipertrofia"}
                    {preferences.goal === "endurance" && "Resistencia"}
                    {preferences.goal === "weight_loss" && "Pérdida de peso"}
                    {preferences.goal === "general_fitness" && "Fitness general"}
                    {preferences.goal === "athletic" && "Rendimiento atlético"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Frecuencia</p>
                  <p className="text-sm text-muted-foreground">{generatedWorkout.frequency}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">~{preferences.duration} min/sesión</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Enfoque por día</h3>
              <div className="grid grid-cols-2 gap-2">
                {generatedWorkout.days.map((day, index) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{day.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="days" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {generatedWorkout.days.map((day, dayIndex) => (
                  <div key={day.id} className="space-y-3">
                    <div className="flex items-center">
                      <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center mr-2">
                        {dayIndex + 1}
                      </Badge>
                      <h3 className="font-medium">{day.name}</h3>
                      <Badge className="ml-2" variant="secondary">
                        {day.exercises.length} ejercicios
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((exercise) => (
                        <div key={exercise.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{exercise.exercise.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {exercise.sets} series × {exercise.reps} reps • {exercise.rest}s descanso
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <div className="space-x-2">
            <Button3D variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button3D>
            <Button3D variant="outline" onClick={handleRegenerate}>
              <Shuffle className="h-4 w-4 mr-2" />
              Regenerar
            </Button3D>
          </div>
          <Button3D onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar rutina
              </>
            )}
          </Button3D>
        </div>
      </Card3DContent>
    </Card3D>
  )
}
