"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Calendar, BarChart, Clock, Flame, Zap, Trophy, Plus, RefreshCw } from "lucide-react"
import { TrainingPeriodizationDashboard } from "@/components/training/training-periodization-dashboard"
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { getWorkoutStats, getWorkouts } from "@/lib/supabase-queries"
import { Workout } from "@/lib/supabase"
import { WorkoutRoutine, getWorkoutRoutines } from "@/lib/workout-routines"

interface TrainingDashboardProps {
  userId: string
  workoutLog: Workout[]
  onWorkoutUpdated: () => void
}

export default function TrainingDashboard({ userId, workoutLog, onWorkoutUpdated }: TrainingDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])

  // Filtrar entrenamientos para esta semana
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })

  const thisWeekWorkouts = workoutLog?.filter(workout => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= startOfCurrentWeek && workoutDate <= endOfCurrentWeek
  }) || []

  // Calcular estadísticas de la semana
  const workoutsByDay = [0, 0, 0, 0, 0, 0, 0] // Lunes a domingo

  thisWeekWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.date)
    const dayOfWeek = workoutDate.getDay() // 0 = domingo, 1 = lunes, etc.
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convertir a 0 = lunes, 6 = domingo
    workoutsByDay[adjustedDay]++
  })

  // Cargar estadísticas y rutinas
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Cargar estadísticas de entrenamiento
        const { data: statsData } = await getWorkoutStats(userId)
        if (statsData) {
          setStats(statsData)
        }

        // Cargar rutinas de entrenamiento
        const { data: routinesData } = await getWorkoutRoutines(userId, {
          includeTemplates: true,
          includeExerciseDetails: true
        })

        if (routinesData) {
          setRoutines(routinesData)
        }
      } catch (error) {
        console.error("Error al cargar datos de entrenamiento:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  // Función para iniciar un entrenamiento
  const startWorkout = (routineId?: string) => {
    if (routineId) {
      router.push(`/workout-active?routineId=${routineId}`)
    } else {
      router.push("/workout-active")
    }
  }

  // Función para ir a la página de ejercicios
  const goToExercises = () => {
    router.push("/ejercicios")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entrenamiento</h1>
        <Button onClick={() => startWorkout()}>
          <Dumbbell className="mr-2 h-4 w-4" />
          Iniciar Entrenamiento
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="routines">Rutinas</TabsTrigger>
          <TabsTrigger value="periodization">Periodización</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Resumen semanal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen Semanal</CardTitle>
              <CardDescription>
                {format(startOfCurrentWeek, "d MMM", { locale: es })} - {format(endOfCurrentWeek, "d MMM", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Entrenamientos completados</p>
                    <p className="text-2xl font-bold">{thisWeekWorkouts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Objetivo semanal</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>

                <Progress value={(thisWeekWorkouts.length / 5) * 100} className="h-2" />

                <div className="flex justify-between mt-4">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        workoutsByDay[index] > 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {day}
                      </div>
                      <span className="text-xs mt-1">{workoutsByDay[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Entrenamientos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-bold">{stats?.totalWorkouts || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tipo Favorito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {stats?.favoriteType === "Fuerza" ? (
                        <Dumbbell className="h-5 w-5 mr-2 text-blue-500" />
                      ) : stats?.favoriteType === "Cardio" ? (
                        <Flame className="h-5 w-5 mr-2 text-red-500" />
                      ) : (
                        <Zap className="h-5 w-5 mr-2 text-purple-500" />
                      )}
                      <span className="text-2xl font-bold">{stats?.favoriteType || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                      <span className="text-2xl font-bold">{stats?.currentStreak || 0} días</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Próximo entrenamiento sugerido */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sugerido para hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24" />
              ) : routines.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{routines[0].name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {routines[0].exercises.length} ejercicios · {routines[0].level}
                      </p>
                    </div>
                    <Button onClick={() => startWorkout(routines[0].id)}>
                      Iniciar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No hay rutinas disponibles</p>
                  <Button variant="outline" className="mt-2" onClick={goToExercises}>
                    Explorar ejercicios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Mis Rutinas</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/rutinas")}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Rutina
            </Button>
          </div>

          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : routines.filter(r => !r.is_template).length > 0 ? (
            <div className="space-y-4">
              {routines
                .filter(routine => !routine.is_template)
                .map(routine => (
                  <Card key={routine.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{routine.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {routine.exercises.length} ejercicios · {routine.level}
                          </p>
                        </div>
                        <Button onClick={() => startWorkout(routine.id)}>
                          Iniciar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes rutinas personalizadas</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera rutina personalizada para organizar tus entrenamientos
                </p>
                <Button onClick={() => router.push("/rutinas")}>
                  Crear Rutina
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Rutinas Recomendadas</h2>
            {isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : routines.filter(r => r.is_template).length > 0 ? (
              <div className="space-y-4">
                {routines
                  .filter(routine => routine.is_template)
                  .map(routine => (
                    <Card key={routine.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{routine.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {routine.exercises.length} ejercicios · {routine.level}
                            </p>
                          </div>
                          <Button onClick={() => startWorkout(routine.id)}>
                            Iniciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">No hay rutinas recomendadas disponibles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="periodization" className="space-y-4">
          <TrainingPeriodizationDashboard
            userId={userId}
            workoutLogs={workoutLog}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Historial de Entrenamientos</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/workout-stats")}>
              <BarChart className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
          </div>

          {workoutLog && workoutLog.length > 0 ? (
            <div className="space-y-4">
              {workoutLog.map(workout => (
                <Card key={workout.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`rounded-full p-2 mr-3 ${
                            workout.type === "Fuerza"
                              ? "bg-blue-100 text-blue-700"
                              : workout.type === "Cardio"
                                ? "bg-red-100 text-red-700"
                                : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {workout.type === "Fuerza" ? (
                            <Dumbbell className="h-5 w-5" />
                          ) : workout.type === "Cardio" ? (
                            <Flame className="h-5 w-5" />
                          ) : (
                            <Zap className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{workout.name}</h3>
                          <div className="flex text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{format(parseISO(workout.date), "d MMM yyyy", { locale: es })}</span>
                            {workout.duration && (
                              <>
                                <Clock className="h-4 w-4 ml-2 mr-1" />
                                <span>{workout.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/workout-detail/${workout.id}`)}>
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay entrenamientos registrados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza a registrar tus entrenamientos para ver tu historial
                </p>
                <Button onClick={() => startWorkout()}>
                  Iniciar Entrenamiento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
