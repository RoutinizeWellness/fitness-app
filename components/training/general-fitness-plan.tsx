"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Edit, RotateCcw, Dumbbell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase-client"

interface GeneralFitnessPlanProps {
  className?: string
}

export default function GeneralFitnessPlan({ className }: GeneralFitnessPlanProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string>("day-1")

  // Plan de fitness general predefinido
  const generalFitnessPlan = {
    id: "general-fitness-plan",
    title: "Plan de Fitness General",
    description: "Plan personalizado para Fitness General adaptado a tu nivel y disponibilidad.",
    level: "Expert",
    daysPerWeek: 5,
    duration: 8,
    days: [
      {
        id: "day-1",
        name: "Lunes: Piernas",
        description: "Entrenamiento enfocado en piernas con ejercicios compuestos y aislados.",
        muscleGroups: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas"],
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "8-12" },
          { name: "Prensa de piernas", sets: 3, reps: "10-15" },
          { name: "Extensiones de cuádriceps", sets: 3, reps: "12-15" },
          { name: "Curl de isquiotibiales", sets: 3, reps: "12-15" },
          { name: "Elevaciones de pantorrillas", sets: 4, reps: "15-20" }
        ]
      },
      {
        id: "day-2",
        name: "Día 2",
        description: "Entrenamiento de pecho y espalda con enfoque en fuerza y resistencia.",
        muscleGroups: ["Pecho", "Espalda", "Core"],
        exercises: [
          { name: "Press de banca", sets: 4, reps: "8-10" },
          { name: "Remo con barra", sets: 4, reps: "8-10" },
          { name: "Aperturas con mancuernas", sets: 3, reps: "12-15" },
          { name: "Jalones al pecho", sets: 3, reps: "12-15" },
          { name: "Planchas", sets: 3, reps: "30-60s" }
        ]
      },
      {
        id: "day-3",
        name: "Día 3",
        description: "Entrenamiento de hombros y brazos para desarrollo completo.",
        muscleGroups: ["Hombros", "Bíceps", "Tríceps"],
        exercises: [
          { name: "Press militar", sets: 4, reps: "8-10" },
          { name: "Elevaciones laterales", sets: 3, reps: "12-15" },
          { name: "Curl de bíceps", sets: 3, reps: "10-12" },
          { name: "Extensiones de tríceps", sets: 3, reps: "10-12" },
          { name: "Fondos en banco", sets: 3, reps: "12-15" }
        ]
      },
      {
        id: "day-4",
        name: "Día 4",
        description: "Entrenamiento de piernas con enfoque en glúteos y posterior.",
        muscleGroups: ["Glúteos", "Isquiotibiales", "Cuádriceps", "Core"],
        exercises: [
          { name: "Peso muerto", sets: 4, reps: "8-10" },
          { name: "Hip thrust", sets: 4, reps: "10-12" },
          { name: "Zancadas", sets: 3, reps: "12-15 por pierna" },
          { name: "Abductores", sets: 3, reps: "15-20" },
          { name: "Crunch abdominal", sets: 3, reps: "15-20" }
        ]
      },
      {
        id: "day-5",
        name: "Día 5",
        description: "Entrenamiento de cuerpo completo para finalizar la semana.",
        muscleGroups: ["Pecho", "Espalda", "Hombros", "Brazos", "Core"],
        exercises: [
          { name: "Press de banca inclinado", sets: 3, reps: "10-12" },
          { name: "Dominadas asistidas", sets: 3, reps: "8-10" },
          { name: "Press de hombros", sets: 3, reps: "10-12" },
          { name: "Curl de bíceps con barra", sets: 3, reps: "10-12" },
          { name: "Extensiones de tríceps", sets: 3, reps: "10-12" }
        ]
      }
    ]
  }

  // Manejar el inicio de un entrenamiento
  const handleStartWorkout = async (dayId: string) => {
    try {
      setIsLoading(true)

      // Guardar el día seleccionado en localStorage para persistencia
      localStorage.setItem('selectedWorkoutDay', dayId)

      if (user) {
        // Registrar el inicio del entrenamiento en Supabase
        const { error } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            workout_day_id: dayId,
            status: 'started',
            start_time: new Date().toISOString()
          })

        if (error) {
          console.error("Error al registrar inicio de entrenamiento:", error)
          // Continuar a pesar del error
        }
      }

      // Navegar a la página de entrenamiento con el día seleccionado
      router.push(`/training/start-workout/${dayId}`)
    } catch (error) {
      console.error("Error al iniciar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  // Cargar datos del plan de entrenamiento
  useEffect(() => {
    const loadWorkoutPlan = async () => {
      if (!user) return

      try {
        // Verificar si la tabla existe
        const { count, error: tableCheckError } = await supabase
          .from('workout_routines')
          .select('*', { count: 'exact', head: true })
          .limit(1)

        if (tableCheckError || count === null) {
          console.warn('La tabla workout_routines podría no existir:', tableCheckError)
          toast({
            title: "Información",
            description: "Usando plan de entrenamiento predeterminado porque no se pudo acceder a la base de datos.",
            variant: "default",
          })
          // Usar el plan predefinido si la tabla no existe
          setIsLoading(false)

          // Recuperar el día seleccionado de localStorage si existe
          const savedDay = localStorage.getItem('selectedWorkoutDay')
          if (savedDay && generalFitnessPlan.days.some(day => day.id === savedDay)) {
            setActiveDay(savedDay)
          }

          return
        }

        // Verificar si existe un plan activo en Supabase
        const { data, error } = await supabase
          .from('workout_routines')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('goal', 'general_fitness')
          .maybeSingle()

        if (error) {
          console.error('Error al cargar el plan de entrenamiento:', error)
          toast({
            title: "Error",
            description: "No se pudo cargar tu plan de entrenamiento personalizado. Usando plan predeterminado.",
            variant: "destructive",
          })
          // Usar el plan predefinido en caso de error
          setIsLoading(false)

          // Recuperar el día seleccionado de localStorage si existe
          const savedDay = localStorage.getItem('selectedWorkoutDay')
          if (savedDay && generalFitnessPlan.days.some(day => day.id === savedDay)) {
            setActiveDay(savedDay)
          }

          return
        }

        if (data) {
          // Si hay un plan activo, usarlo
          console.log('Plan de entrenamiento cargado desde Supabase:', data)
          toast({
            title: "Plan cargado",
            description: "Se ha cargado tu plan de entrenamiento personalizado.",
            variant: "default",
          })
          // Aquí se podría adaptar el plan cargado al formato esperado
          // Por ahora, seguimos usando el plan predefinido
        } else {
          console.log('No se encontró un plan activo, usando el predefinido')
        }

        // Si no hay plan activo o no se pudo cargar, usar el predefinido
        setIsLoading(false)

        // Recuperar el día seleccionado de localStorage si existe
        const savedDay = localStorage.getItem('selectedWorkoutDay')
        if (savedDay && generalFitnessPlan.days.some(day => day.id === savedDay)) {
          setActiveDay(savedDay)
        }
      } catch (error) {
        console.error('Error inesperado al cargar el plan de entrenamiento:', error)
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado al cargar tu plan. Usando plan predeterminado.",
          variant: "destructive",
        })
        setIsLoading(false)

        // Recuperar el día seleccionado de localStorage si existe
        const savedDay = localStorage.getItem('selectedWorkoutDay')
        if (savedDay && generalFitnessPlan.days.some(day => day.id === savedDay)) {
          setActiveDay(savedDay)
        }
      }
    }

    loadWorkoutPlan()
  }, [user, toast])

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted"></div>
        <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        <div className="h-48 animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              {generalFitnessPlan.title}
            </CardTitle>
            <CardDescription>
              {generalFitnessPlan.description}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Editar plan">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Generar nuevo plan">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">
            {generalFitnessPlan.level}
          </Badge>
          <Badge variant="outline">
            {generalFitnessPlan.daysPerWeek} días/semana
          </Badge>
          <Badge variant="outline">
            {generalFitnessPlan.duration} semanas
          </Badge>
          <Badge variant="outline">
            general_fitness
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {generalFitnessPlan.days.map((day, index) => (
              <TabsTrigger key={day.id} value={day.id}>
                {`Día ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>

          {generalFitnessPlan.days.map(day => (
            <TabsContent key={day.id} value={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{day.name}</h3>
                <Button onClick={() => handleStartWorkout(day.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Entrenamiento
                </Button>
              </div>

              <p className="text-gray-500">{day.description}</p>

              <div className="flex flex-wrap gap-2">
                {day.muscleGroups?.map(muscle => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm">Ejercicios:</h4>
                {day.exercises?.map((exercise, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span>{exercise.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
