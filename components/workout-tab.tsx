"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Play, ChevronRight, CalendarIcon, Flame, Zap, Filter, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { deleteWorkout } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
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

export default function WorkoutTab({ workoutLog, onWorkoutUpdated, setActiveTab }) {
  const [activeTab, setActiveActiveTab] = useState("today")
  const [workoutToDelete, setWorkoutToDelete] = useState(null)

  // Filtrar entrenamientos para hoy
  const todayWorkouts = workoutLog?.filter((workout) => workout.date === new Date().toISOString().split("T")[0]) || []

  // Filtrar entrenamientos para esta semana
  const thisWeekWorkouts =
    workoutLog?.filter((workout) => {
      const workoutDate = new Date(workout.date)
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return workoutDate >= startOfWeek && workoutDate <= today
    }) || []

  // Filtrar entrenamientos por tipo
  const strengthWorkouts = workoutLog?.filter((workout) => workout.type === "Fuerza") || []
  const cardioWorkouts = workoutLog?.filter((workout) => workout.type === "Cardio") || []

  // Manejar eliminación de entrenamiento
  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return

    try {
      const { error } = await deleteWorkout(workoutToDelete)

      if (error) {
        throw error
      }

      toast({
        title: "Entrenamiento eliminado",
        description: "El entrenamiento ha sido eliminado correctamente",
      })

      // Actualizar lista de entrenamientos
      onWorkoutUpdated()
    } catch (error) {
      console.error("Error al eliminar entrenamiento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setWorkoutToDelete(null)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayWorkouts.length > 0 ? (
            <>
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Entrenamiento de Hoy</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {format(new Date(), "EEEE", { locale: es })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {todayWorkouts.map((workout) => (
                    <div key={workout.id} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{workout.name}</h3>
                          <p className="text-sm text-gray-500">
                            {workout.type} · {workout.duration || `${workout.sets} series`}
                          </p>
                        </div>
                        <Button size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Iniciar
                        </Button>
                      </div>

                      {workout.type === "Fuerza" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                1
                              </div>
                              <div>
                                <h4 className="font-medium">{workout.name}</h4>
                                <div className="flex text-sm text-gray-500">
                                  <span>{workout.sets} series</span>
                                  <span className="mx-2">•</span>
                                  <span>{workout.reps || "10-12"} reps</span>
                                  {workout.weight && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>{workout.weight} kg</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setWorkoutToDelete(workout.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente este entrenamiento de tu
                                historial.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setWorkoutToDelete(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteWorkout}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
                <div className="bg-blue-100 text-blue-700 rounded-full p-4 mb-4">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <h3 className="font-medium text-lg mb-2">No hay entrenamientos para hoy</h3>
                <p className="text-gray-500 text-center mb-4">
                  Registra tu entrenamiento para mantener un seguimiento de tu progreso
                </p>
                <Button onClick={() => setActiveTab("registro")}>Registrar Entrenamiento</Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sugerencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Entrenamiento de Fuerza</h3>
                      <p className="text-sm text-gray-500">Tren superior · 45 min</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-700 rounded-full p-2 mr-3">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">HIIT</h3>
                      <p className="text-sm text-gray-500">Cardio intenso · 30 min</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Historial de Entrenamientos</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>

          {workoutLog && workoutLog.length > 0 ? (
            <div className="space-y-4">
              {workoutLog.map((workout) => (
                <Card key={workout.id} className="border-none shadow-md">
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
                          <div className="flex text-xs text-gray-500">
                            <span>{format(parseISO(workout.date), "d MMM", { locale: es })}</span>
                            <span className="mx-2">•</span>
                            <span>{workout.type}</span>
                            {workout.duration && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{workout.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setWorkoutToDelete(workout.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente este entrenamiento de tu
                              historial.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setWorkoutToDelete(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteWorkout}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
                <div className="bg-gray-100 text-gray-500 rounded-full p-4 mb-4">
                  <CalendarIcon className="h-8 w-8" />
                </div>
                <h3 className="font-medium text-lg mb-2">No hay entrenamientos registrados</h3>
                <p className="text-gray-500 text-center mb-4">
                  Comienza a registrar tus entrenamientos para ver tu historial aquí
                </p>
                <Button onClick={() => setActiveTab("registro")}>Registrar Entrenamiento</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Biblioteca de Ejercicios</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>

          <Tabs defaultValue="strength">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="strength">Fuerza</TabsTrigger>
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
              <TabsTrigger value="flexibility">Flexibilidad</TabsTrigger>
            </TabsList>

            <TabsContent value="strength" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tren Superior</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Press de Banca</h3>
                          <p className="text-xs text-gray-500">Pecho · 4 series x 8-12 reps</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Dominadas</h3>
                          <p className="text-xs text-gray-500">Espalda · 4 series x 8-12 reps</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tren Inferior</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Sentadillas</h3>
                          <p className="text-xs text-gray-500">Piernas · 4 series x 8-12 reps</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 rounded-full p-2 mr-3">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Peso Muerto</h3>
                          <p className="text-xs text-gray-500">Piernas/Espalda · 4 series x 8-12 reps</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cardio" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cardio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-red-100 text-red-700 rounded-full p-2 mr-3">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Carrera</h3>
                          <p className="text-xs text-gray-500">30 minutos · Intensidad moderada</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-red-100 text-red-700 rounded-full p-2 mr-3">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">HIIT</h3>
                          <p className="text-xs text-gray-500">20 minutos · Alta intensidad</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flexibility" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Flexibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-700 rounded-full p-2 mr-3">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Yoga</h3>
                          <p className="text-xs text-gray-500">30 minutos · Cuerpo completo</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-700 rounded-full p-2 mr-3">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Estiramientos</h3>
                          <p className="text-xs text-gray-500">15 minutos · Recuperación</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
