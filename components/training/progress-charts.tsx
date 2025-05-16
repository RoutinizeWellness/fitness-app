"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Clock, 
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Filter
} from "lucide-react"
import { format, subMonths, subWeeks, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/lib/supabase-client"

interface ProgressChartsProps {
  userId: string
}

interface WorkoutLog {
  id: string
  date: string
  duration: number
  completedSets: any[]
  rating: number | null
  fatigueLevel: number | null
}

interface ExerciseProgress {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  data: {
    date: string
    weight: number
    reps: number
    volume: number // peso * reps
  }[]
}

export default function ProgressCharts({ userId }: ProgressChartsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [timeRange, setTimeRange] = useState("3months")
  const [chartType, setChartType] = useState("volume")
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [exerciseOptions, setExerciseOptions] = useState<{id: string, name: string, muscleGroup: string}[]>([])
  
  // Cargar datos de entrenamiento
  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      try {
        // Determinar fecha de inicio según el rango seleccionado
        let startDate = new Date()
        if (timeRange === "1month") {
          startDate = subMonths(new Date(), 1)
        } else if (timeRange === "3months") {
          startDate = subMonths(new Date(), 3)
        } else if (timeRange === "6months") {
          startDate = subMonths(new Date(), 6)
        } else if (timeRange === "1year") {
          startDate = subMonths(new Date(), 12)
        }
        
        const startDateStr = startDate.toISOString().split('T')[0]
        
        // Obtener logs de entrenamiento
        const { data, error } = await supabase
          .from('workout_logs')
          .select('id, date, duration, completed_sets, rating, fatigue_level')
          .eq('user_id', userId)
          .gte('date', startDateStr)
          .order('date', { ascending: true })
        
        if (error) {
          console.error('Error al cargar los datos de entrenamiento:', error)
          return
        }
        
        if (data) {
          // Transformar datos
          const logs: WorkoutLog[] = data.map(log => ({
            id: log.id,
            date: log.date,
            duration: log.duration || 0,
            completedSets: log.completed_sets || [],
            rating: log.rating,
            fatigueLevel: log.fatigue_level
          }))
          
          setWorkoutLogs(logs)
          
          // Extraer ejercicios únicos y su progreso
          const exercisesMap = new Map<string, ExerciseProgress>()
          const exercisesList: {id: string, name: string, muscleGroup: string}[] = []
          
          logs.forEach(log => {
            if (log.completedSets && Array.isArray(log.completedSets)) {
              log.completedSets.forEach(exercise => {
                const exerciseId = exercise.exerciseId || ''
                const exerciseName = exercise.exerciseName || ''
                const muscleGroup = exercise.muscleGroup || ''
                
                // Añadir a la lista de opciones si no existe
                if (!exercisesMap.has(exerciseId) && exerciseId && exerciseName) {
                  exercisesList.push({
                    id: exerciseId,
                    name: exerciseName,
                    muscleGroup
                  })
                  
                  // Inicializar el objeto de progreso
                  exercisesMap.set(exerciseId, {
                    exerciseId,
                    exerciseName,
                    muscleGroup,
                    data: []
                  })
                }
                
                // Calcular el peso máximo y las repeticiones para este ejercicio en este entrenamiento
                if (exercise.sets && Array.isArray(exercise.sets)) {
                  const completedSets = exercise.sets.filter((set: any) => set.completed)
                  
                  if (completedSets.length > 0) {
                    // Encontrar el set con el mayor peso
                    const maxWeightSet = completedSets.reduce((prev: any, current: any) => {
                      return (prev.weight > current.weight) ? prev : current
                    })
                    
                    // Calcular el volumen total (peso * reps) para todos los sets completados
                    const totalVolume = completedSets.reduce((sum: number, set: any) => {
                      return sum + (set.weight * set.reps)
                    }, 0)
                    
                    // Añadir datos de progreso
                    const progressData = exercisesMap.get(exerciseId)
                    if (progressData) {
                      progressData.data.push({
                        date: log.date,
                        weight: maxWeightSet.weight,
                        reps: maxWeightSet.reps,
                        volume: totalVolume
                      })
                    }
                  }
                }
              })
            }
          })
          
          // Convertir el mapa a array y ordenar los ejercicios alfabéticamente
          const progressArray = Array.from(exercisesMap.values())
          setExerciseProgress(progressArray)
          
          // Ordenar opciones de ejercicios alfabéticamente
          exercisesList.sort((a, b) => a.name.localeCompare(b.name))
          setExerciseOptions(exercisesList)
          
          // Seleccionar el primer ejercicio por defecto si hay alguno
          if (exercisesList.length > 0 && !selectedExercise) {
            setSelectedExercise(exercisesList[0].id)
          }
        }
      } catch (error) {
        console.error('Error al procesar los datos de entrenamiento:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkoutData()
  }, [userId, timeRange, selectedExercise])
  
  // Preparar datos para los gráficos
  const getChartData = () => {
    if (!selectedExercise) return []
    
    const exercise = exerciseProgress.find(ex => ex.exerciseId === selectedExercise)
    if (!exercise) return []
    
    return exercise.data.map(item => ({
      date: format(parseISO(item.date), 'dd/MM/yy'),
      [chartType === 'weight' ? 'Peso (kg)' : chartType === 'reps' ? 'Repeticiones' : 'Volumen (kg)']:
        chartType === 'weight' ? item.weight : chartType === 'reps' ? item.reps : item.volume
    }))
  }
  
  // Preparar datos para el gráfico de frecuencia
  const getFrequencyData = () => {
    const monthCounts: Record<string, number> = {}
    
    workoutLogs.forEach(log => {
      if (isValid(parseISO(log.date))) {
        const month = format(parseISO(log.date), 'MMM yyyy', { locale: es })
        monthCounts[month] = (monthCounts[month] || 0) + 1
      }
    })
    
    return Object.entries(monthCounts).map(([month, count]) => ({
      month,
      'Entrenamientos': count
    }))
  }
  
  // Preparar datos para el gráfico de duración
  const getDurationData = () => {
    const data: { date: string, 'Duración (min)': number }[] = []
    
    workoutLogs.forEach(log => {
      if (isValid(parseISO(log.date))) {
        data.push({
          date: format(parseISO(log.date), 'dd/MM/yy'),
          'Duración (min)': log.duration
        })
      }
    })
    
    return data
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  // Renderizar mensaje si no hay datos
  if (workoutLogs.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Progreso de Entrenamiento
          </CardTitle>
          <CardDescription>
            No hay datos de entrenamiento disponibles para mostrar el progreso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BarChartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Sin datos de progreso</h3>
          <p className="text-center text-gray-500 mb-4">
            Registra tus entrenamientos para comenzar a ver tu progreso.
          </p>
          <Button onClick={() => window.location.href = "/training/log-workout"}>
            Registrar Entrenamiento
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Progreso de Entrenamiento
              </CardTitle>
              <CardDescription>
                Visualiza tu progreso a lo largo del tiempo
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período de tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                  <SelectItem value="all">Todo el historial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
              <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
              <TabsTrigger value="duration">Duración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercises" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Select value={selectedExercise || ''} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Seleccionar ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseOptions.map(exercise => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.muscleGroup})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Peso</SelectItem>
                    <SelectItem value="reps">Repeticiones</SelectItem>
                    <SelectItem value="volume">Volumen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={chartType === 'weight' ? 'Peso (kg)' : chartType === 'reps' ? 'Repeticiones' : 'Volumen (kg)'} 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="frequency">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFrequencyData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Entrenamientos" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="duration">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getDurationData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Duración (min)" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
