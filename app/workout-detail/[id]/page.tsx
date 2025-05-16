"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Zap,
  Share2,
  Trash2,
  Edit,
  BarChart
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { getWorkoutById, deleteWorkout } from "@/lib/supabase-queries"
import { Workout } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)
  const workoutId = unwrappedParams.id
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getWorkoutById(workoutId)

        if (error) {
          throw error
        }

        if (data) {
          setWorkout(data)
        } else {
          toast({
            title: "Error",
            description: "No se encontró el entrenamiento",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el entrenamiento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkout()
  }, [workoutId, router, toast])

  const handleDelete = async () => {
    try {
      const { error } = await deleteWorkout(workoutId)

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento eliminado",
        description: "El entrenamiento ha sido eliminado correctamente",
      })

      router.push("/")
    } catch (error) {
      console.error("Error al eliminar el entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    router.push(`/workout-edit/${workoutId}`)
  }

  const handleShare = () => {
    // Implementar compartir en redes sociales
    toast({
      title: "Compartir",
      description: "Función de compartir en desarrollo",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">Detalle del Entrenamiento</h1>
          <div className="w-9"></div> {/* Spacer para centrar el título */}
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : workout ? (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{workout.name}</h1>
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    workout.type === "Fuerza"
                      ? "bg-blue-50 text-blue-700"
                      : workout.type === "Cardio"
                        ? "bg-red-50 text-red-700"
                        : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {workout.type}
                </Badge>
              </div>

              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(parseISO(workout.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>

                {workout.duration && (
                  <>
                    <Clock className="h-4 w-4 ml-4 mr-1" />
                    <span>{workout.duration}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workout.sets && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Series</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-2xl font-bold">{workout.sets}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {workout.reps && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Repeticiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-2xl font-bold">{workout.reps}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {workout.weight && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="text-2xl font-bold">{workout.weight} kg</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {workout.distance && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Distancia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-red-500" />
                      <span className="text-2xl font-bold">{workout.distance}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {workout.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{workout.notes}</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex justify-between">
              <div className="space-x-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente este entrenamiento de tu historial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontró el entrenamiento</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
