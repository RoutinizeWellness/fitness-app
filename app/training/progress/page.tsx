"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  TrendingUp,
  Dumbbell,
  Clock,
  Calendar,
  BarChart,
  Award,
  Target
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProgressCharts from "@/components/training/progress-charts"
import { supabase } from "@/lib/supabase-client"

export default function TrainingProgressPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    mostFrequentExercise: { name: '', count: 0 },
    highestWeight: { exercise: '', weight: 0 },
    longestStreak: 0,
    currentStreak: 0
  })

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Obtener todos los entrenamientos
        const { data, error } = await supabase
          .from('workout_logs')
          .select('id, date, duration, completed_sets')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (error) {
          console.error('Error al cargar los datos de entrenamiento:', error)
          return
        }

        if (data) {
          // Calcular estadísticas básicas
          const totalWorkouts = data.length
          const totalDuration = data.reduce((sum, log) => sum + (log.duration || 0), 0)
          const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

          // Calcular ejercicio más frecuente
          const exerciseCounts: Record<string, number> = {}

          data.forEach(log => {
            if (log.completed_sets && Array.isArray(log.completed_sets)) {
              log.completed_sets.forEach(exercise => {
                const exerciseName = exercise.exerciseName || ''
                if (exerciseName) {
                  exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1
                }
              })
            }
          })

          let mostFrequentExercise = { name: '', count: 0 }

          Object.entries(exerciseCounts).forEach(([name, count]) => {
            if (count > mostFrequentExercise.count) {
              mostFrequentExercise = { name, count }
            }
          })

          // Calcular peso más alto
          let highestWeight = { exercise: '', weight: 0 }

          data.forEach(log => {
            if (log.completed_sets && Array.isArray(log.completed_sets)) {
              log.completed_sets.forEach(exercise => {
                const exerciseName = exercise.exerciseName || ''

                if (exercise.sets && Array.isArray(exercise.sets)) {
                  exercise.sets.forEach((set: any) => {
                    if (set.weight > highestWeight.weight) {
                      highestWeight = { exercise: exerciseName, weight: set.weight }
                    }
                  })
                }
              })
            }
          })

          // Calcular rachas
          let currentStreak = 0
          let longestStreak = 0
          let previousDate: Date | null = null

          // Ordenar por fecha ascendente para calcular rachas
          const sortedData = [...data].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )

          sortedData.forEach(log => {
            const currentDate = new Date(log.date)

            if (previousDate) {
              // Calcular diferencia en días
              const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime())
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              if (diffDays === 1) {
                // Días consecutivos
                currentStreak++
              } else if (diffDays > 1) {
                // Racha rota
                if (currentStreak > longestStreak) {
                  longestStreak = currentStreak
                }
                currentStreak = 1
              }
            } else {
              currentStreak = 1
            }

            previousDate = currentDate
          })

          // Actualizar racha más larga si la actual es mayor
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
          }

          setStats({
            totalWorkouts,
            totalDuration,
            averageDuration,
            mostFrequentExercise,
            highestWeight,
            longestStreak,
            currentStreak
          })
        }
      } catch (error) {
        console.error('Error al calcular estadísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [user])

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/training')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Progreso de Entrenamiento</h1>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de entrenamientos</p>
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiempo total</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)} horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Racha actual</p>
                  <p className="text-2xl font-bold">{stats.currentStreak} días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Logros y Récords
          </CardTitle>
          <CardDescription>
            Tus mejores marcas y estadísticas destacadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium">Ejercicio más frecuente</h3>
              </div>
              <p className="text-lg">
                {stats.mostFrequentExercise.name ? (
                  <>{stats.mostFrequentExercise.name} ({stats.mostFrequentExercise.count} veces)</>
                ) : (
                  'No hay datos suficientes'
                )}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Dumbbell className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium">Peso máximo levantado</h3>
              </div>
              <p className="text-lg">
                {stats.highestWeight.exercise ? (
                  <>{stats.highestWeight.weight} kg en {stats.highestWeight.exercise}</>
                ) : (
                  'No hay datos suficientes'
                )}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Racha más larga</h3>
              </div>
              <p className="text-lg">{stats.longestStreak} días consecutivos</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="font-medium">Duración media</h3>
              </div>
              <p className="text-lg">{stats.averageDuration} minutos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de progreso */}
      {user && <ProgressCharts userId={user.id} />}
    </div>
  )
}
