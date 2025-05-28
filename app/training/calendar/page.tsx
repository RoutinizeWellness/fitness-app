"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import WorkoutCalendar from "@/components/training/workout-calendar"

export default function CalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Manejar la selección de un día
  const handleSelectDay = (dayId: string) => {
    router.push(`/training/start-workout/${dayId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-48 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Entrenamiento</h1>
          <p className="text-muted-foreground">
            Visualiza y planifica tus entrenamientos semanales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/training")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <WorkoutCalendar onSelectDay={handleSelectDay} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            Tu Plan de Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mayo 2025</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Lunes */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Lunes</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">Piernas</Badge>
                    <Badge variant="secondary">Glúteos</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• Sentadilla con barra</p>
                    <p>• Prensa de piernas</p>
                    <p>• Extensiones de cuádriceps</p>
                    <p>• Curl de isquiotibiales</p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => handleSelectDay("day-1")}>
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Martes */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Martes</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">Pecho</Badge>
                    <Badge variant="secondary">Espalda</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• Press de banca</p>
                    <p>• Remo con barra</p>
                    <p>• Aperturas con mancuernas</p>
                    <p>• Jalones al pecho</p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => handleSelectDay("day-2")}>
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Miércoles */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Miércoles</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline">Descanso</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Día de recuperación activa</p>
                    <p>Puedes realizar estiramientos o actividades de baja intensidad</p>
                  </div>
                </CardContent>
              </Card>

              {/* Jueves */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Jueves</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">Hombros</Badge>
                    <Badge variant="secondary">Brazos</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• Press militar</p>
                    <p>• Elevaciones laterales</p>
                    <p>• Curl de bíceps</p>
                    <p>• Extensiones de tríceps</p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => handleSelectDay("day-4")}>
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Viernes */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Viernes</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">Piernas</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• Peso muerto</p>
                    <p>• Hip thrust</p>
                    <p>• Zancadas</p>
                    <p>• Abductores</p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => handleSelectDay("day-5")}>
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Sábado */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Sábado</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">Pecho</Badge>
                    <Badge variant="secondary">Espalda</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>• Press inclinado</p>
                    <p>• Dominadas</p>
                    <p>• Fondos</p>
                    <p>• Remo en polea</p>
                  </div>
                  <Button className="w-full mt-3" size="sm" onClick={() => handleSelectDay("day-6")}>
                    Iniciar Entrenamiento
                  </Button>
                </CardContent>
              </Card>

              {/* Domingo */}
              <Card className="overflow-hidden">
                <CardHeader className="p-3 bg-primary/5">
                  <CardTitle className="text-base">Domingo</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline">Descanso</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Día de descanso completo</p>
                    <p>Permite que tu cuerpo se recupere para la siguiente semana</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
