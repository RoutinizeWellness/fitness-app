"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  FlameIcon as Fire,
  Share2,
  Star,
  Trophy,
  Heart,
  BarChart2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function WorkoutCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [workoutData, setWorkoutData] = useState({
    exercises: searchParams.get("exercises") || "3",
    duration: searchParams.get("duration") || "30 minutos",
    calories: searchParams.get("calories") || "250",
    name: searchParams.get("name") || "Entrenamiento personalizado",
    type: searchParams.get("type") || "Intermedio"
  })

  // Calcular calorías basadas en la duración si no se proporcionan
  useEffect(() => {
    if (!searchParams.get("calories")) {
      const durationMinutes = parseInt(workoutData.duration) || 30
      const estimatedCalories = Math.round(durationMinutes * 8.3)
      setWorkoutData(prev => ({...prev, calories: estimatedCalories.toString()}))
    }
  }, [searchParams, workoutData.duration])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-md mx-auto p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-4">
            <h1 className="font-bold">Entrenamiento Completado</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="bg-primary/10 text-primary rounded-full p-4">
              <Trophy className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold">¡Excelente trabajo!</h2>
            <p className="text-gray-500">Has completado tu entrenamiento</p>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen del Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ejercicios</div>
                    <div className="font-bold">{workoutData.exercises} completados</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duración</div>
                    <div className="font-bold">{workoutData.duration}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                    <Fire className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Calorías</div>
                    <div className="font-bold">{workoutData.calories} kcal</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tipo</div>
                    <div className="font-bold">{workoutData.type}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Progreso</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  Esta semana
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Consistencia</h3>
                      <div className="text-sm text-gray-500">3 de 5 días completados</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Volumen total</h3>
                      <div className="text-sm text-gray-500">+15% respecto a la semana pasada</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/workout-stats")}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
            <Button className="flex-1" onClick={() => router.push("/")}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
