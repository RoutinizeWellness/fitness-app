"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar, Dumbbell } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { getActiveWorkoutPlan } from "@/lib/workout-plan-service"
import { WorkoutPlan, WorkoutDay } from "@/lib/workout-plan-generator"

export default function WorkoutCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"day" | "week">("week")
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  // Obtener el plan de entrenamiento activo
  useEffect(() => {
    const loadWorkoutPlan = async () => {
      if (!user) return

      setLoading(true)
      try {
        const plan = await getActiveWorkoutPlan(user.id)
        setWorkoutPlan(plan)

        // Si hay un plan, seleccionar el día actual por defecto
        if (plan && plan.days && plan.days.length > 0) {
          const today = new Date()
          const dayOfWeek = today.getDay() // 0 = domingo, 1 = lunes, etc.

          // Ajustar para que 0 = lunes, 6 = domingo
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

          // Seleccionar el día correspondiente si existe
          if (adjustedDayOfWeek < plan.days.length) {
            setSelectedDay(plan.days[adjustedDayOfWeek])
          } else {
            setSelectedDay(plan.days[0])
          }
        }
      } catch (error) {
        console.error("Error al cargar el plan de entrenamiento:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkoutPlan()
  }, [user])

  // Generar los días de la semana
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Semana comienza en lunes
    return addDays(start, i)
  })

  // Navegar a la semana anterior
  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7))
  }

  // Navegar a la semana siguiente
  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7))
  }

  // Seleccionar un día
  const selectDay = (day: WorkoutDay) => {
    setSelectedDay(day)
    setView("day")
  }

  // Renderizar el calendario semanal
  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">
            {format(weekDays[0], "MMMM yyyy", { locale: es })}
          </h3>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isToday = isSameDay(date, new Date())
            const dayName = format(date, "EEE", { locale: es })
            const dayNumber = format(date, "d")

            // Obtener el día de entrenamiento correspondiente
            const workoutDay = workoutPlan?.days && workoutPlan.days[index % workoutPlan.days.length]

            return (
              <div
                key={date.toString()}
                className={`p-2 rounded-md text-center cursor-pointer transition-colors ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => workoutDay && selectDay(workoutDay)}
              >
                <div className="text-xs font-medium">{dayName}</div>
                <div className="text-lg">{dayNumber}</div>
                {workoutDay && (
                  <div className="mt-1">
                    {workoutDay.restDay ? (
                      <Badge variant="outline">Descanso</Badge>
                    ) : (
                      <Badge>
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {workoutDay.targetMuscleGroups[0]}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar la vista diaria
  const renderDayView = () => {
    if (!selectedDay) return null

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setView("week")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h3 className="text-lg font-medium">{selectedDay.name}</h3>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">{selectedDay.description}</p>

          {selectedDay.targetMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedDay.targetMuscleGroups.map((group) => (
                <Badge key={group} variant="outline">
                  {group}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {selectedDay.restDay ? (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-lg font-medium">Día de Descanso</p>
            <p className="text-sm text-gray-500 mt-1">
              Aprovecha para recuperarte y prepararte para tu próximo entrenamiento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDay.exercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <CardHeader className="p-3">
                  <CardTitle className="text-base flex justify-between">
                    <span>{exercise.name}</span>
                    <span className="text-sm text-gray-500">
                      {exercise.sets} × {exercise.repsMin}-{exercise.repsMax}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between text-sm">
                    <span>Grupo: {exercise.muscleGroup}</span>
                    <span>Descanso: {exercise.rest}s</span>
                  </div>
                  {exercise.notes && (
                    <p className="text-xs text-gray-500 mt-2">{exercise.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedDay.notes && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium">Notas:</p>
            <p className="text-sm text-gray-600">{selectedDay.notes}</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Cargando plan de entrenamiento...</p>
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="text-center p-4">
        <p className="mb-2">No tienes un plan de entrenamiento activo.</p>
        <Button asChild>
          <a href="/training/generate-plan">Generar Plan</a>
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Tu Plan de Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
          <TabsList className="mb-4">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="day">Día</TabsTrigger>
          </TabsList>
          <TabsContent value="week">{renderWeekView()}</TabsContent>
          <TabsContent value="day">{renderDayView()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
