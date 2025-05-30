"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Edit, 
  Flame, 
  Loader2, 
  MoreVertical, 
  Play, 
  Plus, 
  Trash2, 
  Utensils 
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

// Tipo para el plan de entrenamiento
interface WorkoutPlan {
  id: string
  name: string
  description: string
  level: string
  frequency: string
  duration: string
  days: WorkoutDay[]
  createdAt: string
  updatedAt: string
}

interface WorkoutDay {
  id: string
  name: string
  exercises: WorkoutExercise[]
  targetMuscleGroups: string[]
  restDay: boolean
  notes?: string
}

interface WorkoutExercise {
  id: string
  name: string
  sets: number
  reps: string
  rest: number
  weight?: string
  notes?: string
}

export default function PlanPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [activeDay, setActiveDay] = useState<string>("1")

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Cargar plan de ejemplo
  useEffect(() => {
    if (!user) return

    setIsLoading(true)

    // Simular carga de datos
    setTimeout(() => {
      // Datos de ejemplo
      const samplePlan: WorkoutPlan = {
        id: "plan-1",
        name: "Plan de Fitness General",
        description: "Plan personalizado para Fitness General adaptado a tu nivel y disponibilidad.",
        level: "Intermedio",
        frequency: "5 días/semana",
        duration: "8 semanas",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        days: [
          {
            id: "day-1",
            name: "Lunes: Piernas",
            targetMuscleGroups: ["Cuádriceps", "Isquiotibiales", "Glúteos"],
            restDay: false,
            notes: "Entrenamiento enfocado en piernas",
            exercises: [
              {
                id: "ex-1",
                name: "Sentadilla",
                sets: 4,
                reps: "8-12",
                rest: 90,
                weight: "70% 1RM"
              },
              {
                id: "ex-2",
                name: "Peso muerto rumano",
                sets: 3,
                reps: "10-12",
                rest: 90,
                weight: "60% 1RM"
              },
              {
                id: "ex-3",
                name: "Extensiones de cuádriceps",
                sets: 3,
                reps: "12-15",
                rest: 60
              },
              {
                id: "ex-4",
                name: "Curl femoral",
                sets: 3,
                reps: "12-15",
                rest: 60
              },
              {
                id: "ex-5",
                name: "Elevaciones de pantorrilla",
                sets: 4,
                reps: "15-20",
                rest: 45
              }
            ]
          },
          {
            id: "day-2",
            name: "Martes: Pecho y Tríceps",
            targetMuscleGroups: ["Pecho", "Tríceps", "Hombros"],
            restDay: false,
            exercises: [
              {
                id: "ex-6",
                name: "Press de banca",
                sets: 4,
                reps: "8-10",
                rest: 90,
                weight: "75% 1RM"
              },
              {
                id: "ex-7",
                name: "Press inclinado con mancuernas",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-8",
                name: "Aperturas en polea",
                sets: 3,
                reps: "12-15",
                rest: 60
              },
              {
                id: "ex-9",
                name: "Fondos en paralelas",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-10",
                name: "Extensiones de tríceps en polea",
                sets: 3,
                reps: "12-15",
                rest: 60
              }
            ]
          },
          {
            id: "day-3",
            name: "Miércoles: Espalda y Bíceps",
            targetMuscleGroups: ["Espalda", "Bíceps", "Antebrazos"],
            restDay: false,
            exercises: [
              {
                id: "ex-11",
                name: "Dominadas",
                sets: 4,
                reps: "8-10",
                rest: 90
              },
              {
                id: "ex-12",
                name: "Remo con barra",
                sets: 4,
                reps: "8-10",
                rest: 90,
                weight: "70% 1RM"
              },
              {
                id: "ex-13",
                name: "Remo en polea baja",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-14",
                name: "Curl de bíceps con barra",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-15",
                name: "Curl de bíceps con mancuernas",
                sets: 3,
                reps: "12-15",
                rest: 60
              }
            ]
          },
          {
            id: "day-4",
            name: "Jueves: Hombros y Abdominales",
            targetMuscleGroups: ["Hombros", "Abdominales", "Core"],
            restDay: false,
            exercises: [
              {
                id: "ex-16",
                name: "Press militar",
                sets: 4,
                reps: "8-10",
                rest: 90,
                weight: "70% 1RM"
              },
              {
                id: "ex-17",
                name: "Elevaciones laterales",
                sets: 3,
                reps: "12-15",
                rest: 60
              },
              {
                id: "ex-18",
                name: "Elevaciones frontales",
                sets: 3,
                reps: "12-15",
                rest: 60
              },
              {
                id: "ex-19",
                name: "Crunch abdominal",
                sets: 3,
                reps: "15-20",
                rest: 45
              },
              {
                id: "ex-20",
                name: "Plancha",
                sets: 3,
                reps: "30-60s",
                rest: 45
              }
            ]
          },
          {
            id: "day-5",
            name: "Viernes: Full Body",
            targetMuscleGroups: ["Piernas", "Pecho", "Espalda", "Hombros", "Brazos"],
            restDay: false,
            exercises: [
              {
                id: "ex-21",
                name: "Sentadilla frontal",
                sets: 3,
                reps: "10-12",
                rest: 75,
                weight: "65% 1RM"
              },
              {
                id: "ex-22",
                name: "Press de banca inclinado",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-23",
                name: "Remo con mancuerna",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-24",
                name: "Press de hombros con mancuernas",
                sets: 3,
                reps: "10-12",
                rest: 75
              },
              {
                id: "ex-25",
                name: "Curl de bíceps alternado",
                sets: 3,
                reps: "10-12",
                rest: 60
              }
            ]
          }
        ]
      }

      setPlan(samplePlan)
      setIsLoading(false)
    }, 1000)
  }, [user])

  // Iniciar entrenamiento
  const handleStartWorkout = () => {
    const currentDay = plan?.days.find(day => day.id === `day-${activeDay}`)
    if (currentDay) {
      router.push(`/training/workout/${currentDay.id}`)
    }
  }

  // Editar plan
  const handleEditPlan = () => {
    router.push(`/training/edit-plan/${plan?.id}`)
  }

  // Eliminar plan
  const handleDeletePlan = () => {
    toast({
      title: "Confirmar eliminación",
      description: "¿Estás seguro de que deseas eliminar este plan de entrenamiento?",
      action: (
        <Button 
          variant="destructive" 
          onClick={() => {
            // Aquí iría la lógica para eliminar el plan
            toast({
              title: "Plan eliminado",
              description: "El plan ha sido eliminado correctamente"
            })
            router.push("/training")
          }}
        >
          Eliminar
        </Button>
      ),
    })
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando plan de entrenamiento...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No se encontró el plan de entrenamiento</p>
          <Button onClick={() => router.push("/training")}>
            Volver a Entrenamientos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-[#573353] text-lg font-medium">Plan de Entrenamiento</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleEditPlan}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDeletePlan}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-4">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="mb-1">{plan.level}</Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{plan.frequency}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{plan.duration}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto py-2 space-x-2">
              {plan.days.map((day, index) => (
                <Button
                  key={day.id}
                  variant={activeDay === (index + 1).toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveDay((index + 1).toString())}
                  className="whitespace-nowrap"
                >
                  Día {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {plan.days.map((day, index) => {
          if (activeDay !== (index + 1).toString()) return null
          
          return (
            <div key={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#573353]">{day.name}</h2>
                <Button onClick={handleStartWorkout}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Entrenamiento
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {day.targetMuscleGroups.map(muscle => (
                  <Badge key={muscle} variant="secondary">{muscle}</Badge>
                ))}
              </div>
              
              {day.notes && (
                <Card className="bg-muted/50 mb-4">
                  <CardContent className="p-3">
                    <p className="text-sm">{day.notes}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-3">
                {day.exercises.map((exercise, exIndex) => (
                  <Card key={exercise.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                              {exIndex + 1}
                            </div>
                            <h3 className="font-medium">{exercise.name}</h3>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Series</p>
                              <p className="font-medium">{exercise.sets}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Reps</p>
                              <p className="font-medium">{exercise.reps}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Descanso</p>
                              <p className="font-medium">{exercise.rest}s</p>
                            </div>
                          </div>
                          
                          {exercise.weight && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Peso: <span className="font-medium">{exercise.weight}</span></p>
                            </div>
                          )}
                          
                          {exercise.notes && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
