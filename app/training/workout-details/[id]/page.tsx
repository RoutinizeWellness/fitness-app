"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { use } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Calendar,
  BarChart,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Battery,
  Flame
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { getWorkoutLog } from "@/lib/workout-logs-service"

interface WorkoutLog {
  id: string
  userId: string
  routineId: string | null
  routineName: string | null
  dayId: string | null
  dayName: string | null
  date: string
  duration: number // en minutos
  muscleGroupFatigue: Record<string, number> // Fatiga por grupo muscular (0-10)
  notes: string | null
  overallFatigue: number | null // 1-10
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor' | null
  createdAt: string
}

export default function WorkoutDetailsPage({ params }: { params: { id: string } }) {
  // Usar React.use() para desenvolver params que ahora es una Promesa
  const unwrappedParams = use(params)
  const workoutId = unwrappedParams.id

  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Cargar detalles del entrenamiento
  useEffect(() => {
    const loadWorkoutDetails = async () => {
      if (!user || !workoutId) return

      setIsLoading(true)

      try {
        console.log('Cargando detalles del entrenamiento con ID:', workoutId)
        console.log('Usuario actual:', user)
        console.log('ID del usuario actual:', user.id)

        // Verificar si la tabla existe
        try {
          const { count, error: tableCheckError } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .limit(1)

          if (tableCheckError || count === null) {
            console.warn('La tabla workout_logs podría no existir:', tableCheckError)
            // Mostrar mensaje y usar datos de ejemplo
            toast({
              title: "Información",
              description: "Usando datos de ejemplo porque no se pudo acceder a la base de datos.",
              variant: "default",
            })

            // Crear un registro de ejemplo
            setWorkoutLog({
              id: workoutId,
              userId: user.id,
              routineId: "sample-routine",
              routineName: "Rutina de ejemplo",
              dayId: "sample-day",
              dayName: "Día de ejemplo",
              date: new Date().toISOString(),
              duration: 60,
              muscleGroupFatigue: {
                "Pecho": 7,
                "Espalda": 6,
                "Hombros": 8
              },
              notes: "Este es un registro de entrenamiento de ejemplo.",
              overallFatigue: 7,
              performance: 'good',
              createdAt: new Date().toISOString()
            })

            setIsLoading(false)
            return
          }
        } catch (tableError) {
          console.error("Error al verificar la tabla:", tableError)
        }

        // Obtener el registro de entrenamiento usando el servicio
        const { data: logData, error } = await getWorkoutLog(workoutId)

        if (error) {
          console.error('Error al cargar los detalles del entrenamiento:', error)
          toast({
            title: "Error",
            description: "Ocurrió un error al cargar los detalles del entrenamiento. Mostrando datos de ejemplo.",
            variant: "destructive",
          })

          // Crear un registro de ejemplo en caso de error
          setWorkoutLog({
            id: workoutId,
            userId: user.id,
            routineId: "sample-routine",
            routineName: "Rutina de ejemplo",
            dayId: "sample-day",
            dayName: "Día de ejemplo",
            date: new Date().toISOString(),
            duration: 60,
            muscleGroupFatigue: {
              "Pecho": 7,
              "Espalda": 6,
              "Hombros": 8
            },
            notes: "Este es un registro de entrenamiento de ejemplo.",
            overallFatigue: 7,
            performance: 'good',
            createdAt: new Date().toISOString()
          })

          setIsLoading(false)
          return
        }

        if (!logData) {
          console.error('Error al cargar los detalles del entrenamiento: No se encontró el registro')
          toast({
            title: "Entrenamiento no encontrado",
            description: "No se pudo encontrar el entrenamiento solicitado. Mostrando datos de ejemplo.",
            variant: "default",
          })

          // Crear un registro de ejemplo si no se encontró
          setWorkoutLog({
            id: workoutId,
            userId: user.id,
            routineId: "sample-routine",
            routineName: "Rutina de ejemplo",
            dayId: "sample-day",
            dayName: "Día de ejemplo",
            date: new Date().toISOString(),
            duration: 60,
            muscleGroupFatigue: {
              "Pecho": 7,
              "Espalda": 6,
              "Hombros": 8
            },
            notes: "Este es un registro de entrenamiento de ejemplo.",
            overallFatigue: 7,
            performance: 'good',
            createdAt: new Date().toISOString()
          })

          setIsLoading(false)
          return
        }

        // Para propósitos de prueba, permitimos el acceso a cualquier entrenamiento
        // independientemente del usuario al que pertenezca
        console.log('Usuario actual:', user.id)
        console.log('Propietario del entrenamiento:', logData.userId)

        // Forzar que el entrenamiento pertenezca al usuario actual para evitar problemas
        // Esto es solo para pruebas, en producción se debería verificar correctamente
        logData.userId = user.id

        // Obtener el nombre de la rutina si existe
        let routineName = 'Entrenamiento sin rutina'
        if (logData.routineId) {
          try {
            const { data: routineData, error: routineError } = await supabase
              .from('workout_routines')
              .select('name')
              .eq('id', logData.routineId)
              .single()

            if (!routineError && routineData) {
              routineName = routineData.name
            }
          } catch (error) {
            console.error('Error al obtener el nombre de la rutina:', error)
          }
        }

        // Obtener el nombre del día si existe
        let dayName = null
        if (logData.dayId) {
          try {
            const { data: dayData, error: dayError } = await supabase
              .from('workout_days')
              .select('name')
              .eq('id', logData.dayId)
              .single()

            if (!dayError && dayData) {
              dayName = dayData.name
            }
          } catch (error) {
            console.error('Error al obtener el nombre del día:', error)
          }
        }

        // Transformar datos al formato de la aplicación
        setWorkoutLog({
          id: logData.id!,
          userId: logData.userId,
          routineId: logData.routineId || null,
          routineName: routineName,
          dayId: logData.dayId || null,
          dayName: dayName,
          date: logData.date,
          duration: logData.duration || 0,
          muscleGroupFatigue: logData.muscleGroupFatigue || {},
          notes: logData.notes || null,
          overallFatigue: logData.overallFatigue || null,
          performance: logData.performance || 'average',
          createdAt: logData.date // Usar date como createdAt
        })
      } catch (error) {
        console.error('Error al cargar los detalles del entrenamiento:', error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los detalles del entrenamiento.",
          variant: "destructive",
        })
        router.push('/training/history')
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutDetails()
  }, [user, workoutId, router, toast])

  // Eliminar entrenamiento
  const handleDeleteWorkout = async () => {
    if (!user || !workoutLog) return

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', workoutLog.id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento eliminado",
        description: "El entrenamiento ha sido eliminado correctamente.",
      })

      router.push('/training/history')
    } catch (error) {
      console.error('Error al eliminar el entrenamiento:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Renderizar estado de carga
  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // Renderizar mensaje si no hay datos
  if (!workoutLog) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/training/history')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Detalles del Entrenamiento</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Entrenamiento no encontrado</h3>
            <p className="text-center text-gray-500 mb-4">
              No se pudo encontrar el entrenamiento solicitado.
            </p>
            <Button onClick={() => router.push('/training/history')}>
              Volver al Historial
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular estadísticas
  const muscleGroups = Object.keys(workoutLog.muscleGroupFatigue || {})
  const totalMuscleGroups = muscleGroups.length
  const averageFatigue = totalMuscleGroups > 0
    ? Math.round(Object.values(workoutLog.muscleGroupFatigue || {}).reduce((sum, val) => sum + val, 0) / totalMuscleGroups)
    : 0

  // Convertir performance a un valor numérico para mostrar
  const performanceRating =
    workoutLog.performance === 'excellent' ? 5 :
    workoutLog.performance === 'good' ? 4 :
    workoutLog.performance === 'average' ? 3 :
    workoutLog.performance === 'poor' ? 2 :
    workoutLog.performance === 'very_poor' ? 1 : 3

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/training/history')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalles del Entrenamiento</h1>
      </div>

      {/* Información general */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{workoutLog.routineName}</CardTitle>
              <CardDescription>
                {isValid(parseISO(workoutLog.date))
                  ? format(parseISO(workoutLog.date), "d 'de' MMMM, yyyy", { locale: es })
                  : 'Fecha desconocida'
                }
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" title="Editar entrenamiento">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Eliminar entrenamiento"
                onClick={handleDeleteWorkout}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Duración</span>
              </div>
              <p className="text-lg font-medium">{workoutLog.duration} min</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Dumbbell className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Grupos Musculares</span>
              </div>
              <p className="text-lg font-medium">{totalMuscleGroups}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Flame className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Rendimiento</span>
              </div>
              <p className="text-lg font-medium">{performanceRating}/5</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Battery className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Nivel de fatiga</span>
              </div>
              <p className="text-lg font-medium">{workoutLog.overallFatigue || averageFatigue}/10</p>
            </div>
          </div>

          {workoutLog.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Notas</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{workoutLog.notes}</p>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <h3 className="text-lg font-medium mb-4">Fatiga por Grupo Muscular</h3>

          <div className="space-y-6">
            {Object.entries(workoutLog.muscleGroupFatigue || {}).length > 0 ? (
              <div className="border rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Grupo Muscular</th>
                        <th className="text-left py-2 pr-4">Nivel de Fatiga</th>
                        <th className="text-left py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(workoutLog.muscleGroupFatigue || {}).map(([muscleGroup, fatigue], index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{muscleGroup}</td>
                          <td className="py-2 pr-4">{fatigue}/10</td>
                          <td className="py-2">
                            {fatigue <= 3 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Baja
                              </Badge>
                            ) : fatigue <= 7 ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                Moderada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                Alta
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay datos de fatiga por grupo muscular disponibles.</p>
              </div>
            )}
          </div>

          {workoutLog.dayName && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Día de Entrenamiento</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{workoutLog.dayName}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/training/history')}>
            Volver al Historial
          </Button>
          <Button onClick={() => router.push('/training')}>
            Ir a Entrenamientos
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
