"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar as CalendarIcon,
  Search,
  ArrowLeft,
  Filter,
  Dumbbell,
  Clock,
  Calendar,
  BarChart,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, isValid, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/lib/supabase-client"

interface WorkoutLog {
  id: string
  userId: string
  routineId: string | null
  routineName: string | null
  date: string
  duration: number // en minutos
  completedSets: Array<{
    muscleGroup: string
    fatigue: number
  }>
  notes: string | null
  rating: number // 1-5
  fatigueLevel: number // 1-10
  createdAt: string
}

export default function TrainingHistoryPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<WorkoutLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  // Cargar historial de entrenamientos
  useEffect(() => {
    const loadWorkoutHistory = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Primero, obtener los logs
        const { data: logsData, error: logsError } = await supabase
          .from('workout_logs')
          .select(`
            id,
            user_id,
            routine_id,
            day_id,
            date,
            duration,
            notes,
            overall_fatigue,
            muscle_group_fatigue,
            performance
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (logsError) {
          console.error('Error al cargar el historial de entrenamientos:', logsError)
          throw logsError
        }

        // Luego, obtener los nombres de las rutinas para los logs que tienen routine_id
        const routineIds = logsData
          .filter(log => log.routine_id)
          .map(log => log.routine_id)

        let routineNames: Record<string, string> = {}

        if (routineIds.length > 0) {
          const { data: routinesData, error: routinesError } = await supabase
            .from('workout_routines')
            .select('id, name')
            .in('id', routineIds)

          if (!routinesError && routinesData) {
            routineNames = routinesData.reduce((acc, routine) => {
              acc[routine.id] = routine.name
              return acc
            }, {} as Record<string, string>)
          }
        }

        // Transformar datos al formato de la aplicación
        const logs: WorkoutLog[] = logsData.map(log => ({
          id: log.id,
          userId: log.user_id,
          routineId: log.routine_id,
          routineName: log.routine_id ? (routineNames[log.routine_id] || 'Rutina desconocida') : 'Entrenamiento sin rutina',
          date: log.date,
          duration: log.duration || 0,
          completedSets: log.muscle_group_fatigue ? Object.entries(log.muscle_group_fatigue).map(([group, fatigue]) => ({
            muscleGroup: group,
            fatigue: fatigue
          })) : [],
          notes: log.notes,
          rating: log.performance === 'excellent' ? 5 :
                 log.performance === 'good' ? 4 :
                 log.performance === 'average' ? 3 :
                 log.performance === 'poor' ? 2 :
                 log.performance === 'very_poor' ? 1 : 3,
          fatigueLevel: log.overall_fatigue || 0,
          createdAt: log.date // Usar date como createdAt ya que no existe la columna created_at
        }))

        setWorkoutLogs(logs)
        setFilteredLogs(logs)
      } catch (error) {
        console.error('Error al cargar el historial de entrenamientos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutHistory()
  }, [user])

  // Filtrar logs según la pestaña activa
  useEffect(() => {
    if (workoutLogs.length === 0) {
      setFilteredLogs([])
      return
    }

    let filtered = [...workoutLogs]

    // Filtrar por período
    if (activeTab === "month") {
      const oneMonthAgo = subMonths(new Date(), 1)
      filtered = filtered.filter(log => {
        const logDate = parseISO(log.date)
        return isValid(logDate) && logDate >= oneMonthAgo
      })
    } else if (activeTab === "week") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(log => {
        const logDate = parseISO(log.date)
        return isValid(logDate) && logDate >= oneWeekAgo
      })
    }

    // Aplicar búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        (log.routineName && log.routineName.toLowerCase().includes(query)) ||
        (log.notes && log.notes.toLowerCase().includes(query))
      )
    }

    setFilteredLogs(filtered)
    setCurrentPage(1) // Resetear a la primera página al filtrar
  }, [activeTab, searchQuery, workoutLogs])

  // Calcular logs para la página actual
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

  // Manejar cambio de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Calcular estadísticas
  const totalWorkouts = workoutLogs.length
  const totalDuration = workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0
  const averageRating = totalWorkouts > 0
    ? Math.round(workoutLogs.reduce((sum, log) => sum + (log.rating || 0), 0) / totalWorkouts * 10) / 10
    : 0

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/training')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Historial de Entrenamientos</h1>
      </div>

      {/* Estadísticas */}
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
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
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
                  <p className="text-sm text-gray-500">Duración media</p>
                  <p className="text-2xl font-bold">{averageDuration} min</p>
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
                  <BarChart className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valoración media</p>
                  <p className="text-2xl font-bold">{averageRating}/5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="month">Último mes</TabsTrigger>
            <TabsTrigger value="week">Última semana</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar entrenamientos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de entrenamientos */}
      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos Registrados</CardTitle>
          <CardDescription>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entrenamiento encontrado' : 'entrenamientos encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay entrenamientos registrados</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No se encontraron entrenamientos que coincidan con tu búsqueda.' : 'Comienza a registrar tus entrenamientos para ver tu historial aquí.'}
              </p>
              <Button onClick={() => router.push('/training')}>
                Ir a Entrenamientos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{log.routineName}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {isValid(parseISO(log.date))
                          ? format(parseISO(log.date), "d 'de' MMMM, yyyy", { locale: es })
                          : 'Fecha desconocida'
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {log.duration} min
                      </Badge>
                      {log.rating && (
                        <Badge variant="outline" className="bg-amber-50">
                          {log.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm">
                      <span className="font-medium">Ejercicios:</span>{' '}
                      {log.completedSets && log.completedSets.length > 0
                        ? `${log.completedSets.length} ejercicios completados`
                        : 'No hay datos de ejercicios'
                      }
                    </div>

                    {log.notes && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Notas:</span>{' '}
                        {log.notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/training/workout-details/${log.id}`)}
                    >
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
