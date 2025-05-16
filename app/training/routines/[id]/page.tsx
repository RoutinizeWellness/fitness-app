"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  ArrowLeft,
  Dumbbell,
  Calendar,
  Clock,
  Play,
  Edit,
  Copy,
  Trash2,
  ChevronRight,
  BarChart,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import Image from "next/image"

interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  goal: string;
  level: string;
  duration_weeks: number;
  frequency_per_week: number;
  equipment_needed: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RoutineDay {
  id: string;
  routine_id: string;
  day_number: number;
  name: string;
  focus: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Exercise {
  id: string;
  day_id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  exercise_details?: {
    name: string;
    muscle_group: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    video_url?: string;
    image_url?: string;
  };
}

export default function RoutineDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null)
  const [routineDays, setRoutineDays] = useState<RoutineDay[]>([])
  const [exercises, setExercises] = useState<{[key: string]: Exercise[]}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true)
      try {
        // Get routine details
        try {
          const { data: routineData, error: routineError } = await supabase
            .from('training_routines')
            .select('*')
            .eq('id', params.id)
            .single()

          if (routineError) {
            console.warn("Error fetching training routine:", routineError);
            throw routineError;
          }

          // Adapt field names if necessary
          const adaptedRoutine = {
            ...routineData,
            type: routineData.routine_type
          };

          setRoutine(adaptedRoutine);

          // Get routine days
          const { data: daysData, error: daysError } = await supabase
            .from('training_days')
            .select('*')
            .eq('routine_id', params.id)
            .order('day_number', { ascending: true })

          if (daysError) {
            console.warn("Error fetching training days:", daysError);
            throw daysError;
          }

          setRoutineDays(daysData || []);
        } catch (error) {
          console.error("Error fetching routine data:", error);
          // If there's an error, we'll create sample data in the catch block below
          throw error;
        }

        // If there are days, expand the first one by default
        if (routineDays.length > 0) {
          setExpandedDay(routineDays[0].id)
        }

        // Get exercises for each day
        const exercisesObj: {[key: string]: Exercise[]} = {}

        for (const day of (daysData || [])) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('routine_exercises')
            .select(`
              *,
              exercise_details:exercises(*)
            `)
            .eq('day_id', day.id)
            .order('order', { ascending: true })

          if (exercisesError) throw exercisesError
          exercisesObj[day.id] = exercisesData || []
        }

        setExercises(exercisesObj)
      } catch (error) {
        console.error("Error fetching routine data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina de entrenamiento.",
          variant: "destructive"
        })

        // Create sample data if no real data
        createSampleData()
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoutineData()
  }, [params.id, toast])

  const createSampleData = () => {
    // Sample routine
    const sampleRoutine: WorkoutRoutine = {
      id: params.id,
      user_id: "sample-user",
      name: "Rutina de Fuerza y Hipertrofia",
      description: "Rutina de entrenamiento enfocada en ganar fuerza y masa muscular para nivel intermedio.",
      type: "strength",
      goal: "muscle_gain",
      level: "intermediate",
      duration_weeks: 8,
      frequency_per_week: 4,
      equipment_needed: "full_gym",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setRoutine(sampleRoutine)

    // Sample days
    const sampleDays: RoutineDay[] = [
      {
        id: "day-1",
        routine_id: params.id,
        day_number: 1,
        name: "Día 1: Pecho y Tríceps",
        focus: "chest_triceps",
        notes: "Enfócate en la conexión mente-músculo y en la técnica correcta.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "day-2",
        routine_id: params.id,
        day_number: 2,
        name: "Día 2: Espalda y Bíceps",
        focus: "back_biceps",
        notes: "Asegúrate de activar bien la espalda en cada ejercicio.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "day-3",
        routine_id: params.id,
        day_number: 3,
        name: "Día 3: Piernas",
        focus: "legs",
        notes: "No olvides calentar bien las rodillas antes de comenzar.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "day-4",
        routine_id: params.id,
        day_number: 4,
        name: "Día 4: Hombros y Abdominales",
        focus: "shoulders_abs",
        notes: "Mantén una buena postura para proteger la zona lumbar.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    setRoutineDays(sampleDays)
    setExpandedDay(sampleDays[0].id)

    // Sample exercises
    const exercisesObj: {[key: string]: Exercise[]} = {}

    // Exercises for Day 1
    exercisesObj["day-1"] = [
      {
        id: "ex-1-1",
        day_id: "day-1",
        exercise_id: "bench-press",
        name: "Press de Banca",
        sets: 4,
        reps: "8-10",
        rest_seconds: 90,
        order: 1,
        notes: "Mantén los codos a 45 grados del cuerpo.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Press de Banca",
          muscle_group: "chest",
          equipment: "barbell",
          difficulty: "intermediate",
          instructions: "Acuéstate en un banco plano, agarra la barra con las manos un poco más separadas que el ancho de los hombros, baja la barra hasta el pecho y empuja hacia arriba.",
          image_url: "/images/exercises/bench-press.jpg"
        }
      },
      {
        id: "ex-1-2",
        day_id: "day-1",
        exercise_id: "incline-db-press",
        name: "Press Inclinado con Mancuernas",
        sets: 3,
        reps: "10-12",
        rest_seconds: 60,
        order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Press Inclinado con Mancuernas",
          muscle_group: "chest",
          equipment: "dumbbell",
          difficulty: "intermediate",
          instructions: "Acuéstate en un banco inclinado a 30-45 grados, sostén las mancuernas a los lados del pecho, empuja hacia arriba y junta las mancuernas en la parte superior.",
          image_url: "/images/exercises/incline-db-press.jpg"
        }
      },
      {
        id: "ex-1-3",
        day_id: "day-1",
        exercise_id: "cable-fly",
        name: "Aperturas con Cable",
        sets: 3,
        reps: "12-15",
        rest_seconds: 60,
        order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Aperturas con Cable",
          muscle_group: "chest",
          equipment: "cable",
          difficulty: "beginner",
          instructions: "De pie entre dos poleas, agarra los mangos con los brazos extendidos a los lados, junta las manos frente a ti con un ligero doblez en los codos.",
          image_url: "/images/exercises/cable-fly.jpg"
        }
      },
      {
        id: "ex-1-4",
        day_id: "day-1",
        exercise_id: "tricep-pushdown",
        name: "Extensiones de Tríceps en Polea",
        sets: 4,
        reps: "10-12",
        rest_seconds: 60,
        order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Extensiones de Tríceps en Polea",
          muscle_group: "triceps",
          equipment: "cable",
          difficulty: "beginner",
          instructions: "De pie frente a una polea alta, agarra la barra con las manos a la anchura de los hombros, mantén los codos pegados al cuerpo y extiende los brazos hacia abajo.",
          image_url: "/images/exercises/tricep-pushdown.jpg"
        }
      },
      {
        id: "ex-1-5",
        day_id: "day-1",
        exercise_id: "overhead-tricep-extension",
        name: "Extensiones de Tríceps Sobre la Cabeza",
        sets: 3,
        reps: "12-15",
        rest_seconds: 60,
        order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Extensiones de Tríceps Sobre la Cabeza",
          muscle_group: "triceps",
          equipment: "dumbbell",
          difficulty: "beginner",
          instructions: "Sentado o de pie, sostén una mancuerna con ambas manos sobre la cabeza, baja la mancuerna detrás de la cabeza doblando los codos y luego extiende los brazos.",
          image_url: "/images/exercises/overhead-tricep-extension.jpg"
        }
      }
    ]

    // Exercises for Day 2
    exercisesObj["day-2"] = [
      {
        id: "ex-2-1",
        day_id: "day-2",
        exercise_id: "pull-ups",
        name: "Dominadas",
        sets: 4,
        reps: "8-10",
        rest_seconds: 90,
        order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Dominadas",
          muscle_group: "back",
          equipment: "bodyweight",
          difficulty: "intermediate",
          instructions: "Cuelga de una barra con las manos un poco más separadas que el ancho de los hombros, tira de tu cuerpo hacia arriba hasta que tu barbilla esté por encima de la barra.",
          image_url: "/images/exercises/pull-ups.jpg"
        }
      },
      {
        id: "ex-2-2",
        day_id: "day-2",
        exercise_id: "barbell-row",
        name: "Remo con Barra",
        sets: 4,
        reps: "8-10",
        rest_seconds: 90,
        order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_details: {
          name: "Remo con Barra",
          muscle_group: "back",
          equipment: "barbell",
          difficulty: "intermediate",
          instructions: "Inclínate hacia adelante con las rodillas ligeramente flexionadas, agarra la barra con las manos un poco más separadas que el ancho de los hombros, tira de la barra hacia tu abdomen inferior.",
          image_url: "/images/exercises/barbell-row.jpg"
        }
      }
    ]

    // Add more exercises for other days...

    setExercises(exercisesObj)
  }

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'strength': return 'Aumentar fuerza'
      case 'muscle_gain': return 'Ganar músculo'
      case 'fat_loss': return 'Perder grasa'
      case 'endurance': return 'Mejorar resistencia'
      case 'athletic': return 'Rendimiento atlético'
      case 'health': return 'Salud general'
      case 'rehabilitation': return 'Rehabilitación'
      default: return goal
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      case 'expert': return 'Experto'
      default: return level
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'strength': return 'Fuerza'
      case 'hypertrophy': return 'Hipertrofia'
      case 'endurance': return 'Resistencia'
      case 'power': return 'Potencia'
      case 'functional': return 'Funcional'
      case 'cardio': return 'Cardio'
      case 'mixed': return 'Mixto'
      default: return type
    }
  }

  const getEquipmentText = (equipment: string) => {
    switch (equipment) {
      case 'none': return 'Sin equipamiento'
      case 'minimal': return 'Mínimo (bandas, mancuernas)'
      case 'home_gym': return 'Gimnasio en casa'
      case 'full_gym': return 'Gimnasio completo'
      case 'specialized': return 'Equipamiento especializado'
      default: return equipment
    }
  }

  const handleStartWorkout = (dayId: string) => {
    router.push(`/training/workout?day=${dayId}`)
  }

  const handleEditRoutine = () => {
    router.push(`/training/edit?id=${params.id}`)
  }

  const handleDeleteRoutine = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.")) {
      try {
        const { error } = await supabase
          .from('workout_routines')
          .delete()
          .eq('id', params.id)

        if (error) throw error

        toast({
          title: "Rutina eliminada",
          description: "La rutina ha sido eliminada correctamente."
        })

        router.push('/training')
      } catch (error) {
        console.error("Error deleting routine:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina.",
          variant: "destructive"
        })
      }
    }
  }

  const handleDuplicateRoutine = async () => {
    // Implement routine duplication logic
    toast({
      title: "Duplicando rutina",
      description: "La rutina se está duplicando..."
    })
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Cargando rutina de entrenamiento...</p>
        </div>
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Rutina no encontrada</h2>
              <p className="text-muted-foreground mb-6">La rutina que estás buscando no existe o ha sido eliminada.</p>
              <Button onClick={() => router.push('/training')}>
                Volver a Entrenamientos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{routine.name}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm">
          {getTypeText(routine.type)}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {getGoalText(routine.goal)}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {getLevelText(routine.level)}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Información</TabsTrigger>
          <TabsTrigger value="days">Días de Entrenamiento</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Rutina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {routine.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                  <p>{routine.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Duración</h3>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {routine.duration_weeks} semanas
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Frecuencia</h3>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {routine.frequency_per_week} días por semana
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Equipamiento</h3>
                  <p className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                    {getEquipmentText(routine.equipment_needed)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                  <Badge variant={routine.is_active ? "default" : "secondary"}>
                    {routine.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEditRoutine}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={handleDuplicateRoutine}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={handleDeleteRoutine}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>

              <Button size="sm" onClick={() => handleStartWorkout(routineDays[0]?.id)}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Entrenamiento
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Días</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routineDays.map((day) => (
                  <div key={day.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{day.name}</p>
                      <p className="text-sm text-muted-foreground">{exercises[day.id]?.length || 0} ejercicios</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleStartWorkout(day.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Days Tab */}
        <TabsContent value="days" className="space-y-4 mt-6">
          <div className="space-y-4">
            {routineDays.map((day) => (
              <Card key={day.id} className={expandedDay === day.id ? "border-primary" : ""}>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{day.name}</CardTitle>
                    <Button variant="ghost" size="sm">
                      {expandedDay === day.id ? (
                        <ChevronRight className="h-4 w-4 rotate-90 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedDay === day.id && (
                  <>
                    <CardContent className="space-y-4">
                      {day.notes && (
                        <div className="bg-muted/50 p-3 rounded-lg flex items-start">
                          <Info className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <p className="text-sm">{day.notes}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {exercises[day.id] && exercises[day.id].length > 0 ? (
                          exercises[day.id].map((exercise, index) => (
                            <div key={exercise.id} className="border rounded-lg overflow-hidden">
                              <div className="flex justify-between items-center p-3 bg-muted/30">
                                <div className="flex items-center">
                                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                    <span className="font-medium text-primary">{index + 1}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{exercise.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {exercise.sets} series × {exercise.reps} repeticiones • {exercise.rest_seconds}s descanso
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {exercise.exercise_details && (
                                <div className="p-3 border-t">
                                  <div className="flex flex-col md:flex-row gap-4">
                                    {exercise.exercise_details.image_url && (
                                      <div className="md:w-1/3">
                                        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                                          <Image
                                            src={exercise.exercise_details.image_url}
                                            alt={exercise.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div className="md:w-2/3 space-y-2">
                                      <div>
                                        <h4 className="text-xs font-medium text-muted-foreground">Grupo Muscular</h4>
                                        <p className="text-sm">{exercise.exercise_details.muscle_group}</p>
                                      </div>

                                      <div>
                                        <h4 className="text-xs font-medium text-muted-foreground">Instrucciones</h4>
                                        <p className="text-sm">{exercise.exercise_details.instructions}</p>
                                      </div>

                                      {exercise.notes && (
                                        <div className="bg-muted/30 p-2 rounded-lg">
                                          <h4 className="text-xs font-medium text-muted-foreground">Notas</h4>
                                          <p className="text-sm">{exercise.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay ejercicios para este día</p>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full" onClick={() => handleStartWorkout(day.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Entrenamiento
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
