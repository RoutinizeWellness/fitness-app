"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { WorkoutLog, ExerciseSet } from "@/lib/types/training"
import { getWorkoutLogs, getExercises } from "@/lib/training-service"
import { useToast } from "@/components/ui/use-toast"
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
} from "recharts"
import {
  TrendingUp,
  Calendar,
  Clock,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  RefreshCw
} from "lucide-react"

interface ProgressTrackingProps {
  userId: string
}

export function ProgressTracking({ userId }: ProgressTrackingProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("volume")
  const [selectedExercise, setSelectedExercise] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30")
  const [exerciseOptions, setExerciseOptions] = useState<{id: string, name: string}[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const { toast } = useToast()

  // Cargar registros de entrenamiento
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getWorkoutLogs(userId)

        if (error) {
          console.error("Error al cargar registros:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los registros de entrenamiento",
            variant: "destructive"
          })
          return
        }

        if (data) {
          // Ordenar por fecha (más reciente primero)
          const sortedLogs = [...data].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          setLogs(sortedLogs)
        }
      } catch (error) {
        console.error("Error al cargar registros:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Cargar ejercicios para el selector
    const loadExercises = async () => {
      try {
        const { data, error } = await getExercises()

        if (error) {
          console.error("Error al cargar ejercicios:", error)
          return
        }

        if (data) {
          const options = data.map(exercise => ({
            id: exercise.id,
            name: exercise.name
          }))
          setExerciseOptions([{ id: "all", name: "Todos los ejercicios" }, ...options])
        }
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
      }
    }

    loadLogs()
    loadExercises()
  }, [userId, toast])

  // Preparar datos para el gráfico según los filtros
  useEffect(() => {
    if (logs.length === 0) {
      setChartData([])
      return
    }

    // Filtrar por período
    const now = new Date()
    const periodDays = parseInt(selectedPeriod)
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
    
    let filteredLogs = logs.filter(log => new Date(log.date) >= startDate)

    // Preparar datos según el tipo de gráfico
    if (activeTab === "volume") {
      // Datos de volumen (peso total levantado)
      const volumeData: Record<string, number> = {}
      
      filteredLogs.forEach(log => {
        const date = log.date
        let dailyVolume = 0
        
        log.completedSets.forEach(set => {
          // Si se seleccionó un ejercicio específico, filtrar
          if (selectedExercise !== "all" && set.exerciseId !== selectedExercise) {
            return
          }
          
          // Calcular volumen (peso * reps)
          if (set.completedWeight && set.completedReps) {
            dailyVolume += set.completedWeight * set.completedReps
          }
        })
        
        // Sumar al volumen del día
        if (volumeData[date]) {
          volumeData[date] += dailyVolume
        } else {
          volumeData[date] = dailyVolume
        }
      })
      
      // Convertir a formato para el gráfico
      const chartData = Object.entries(volumeData).map(([date, volume]) => ({
        date,
        volume: Math.round(volume)
      }))
      
      // Ordenar por fecha
      chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setChartData(chartData)
    } else if (activeTab === "intensity") {
      // Datos de intensidad (peso máximo por ejercicio)
      const intensityData: Record<string, Record<string, number>> = {}
      
      filteredLogs.forEach(log => {
        const date = log.date
        
        if (!intensityData[date]) {
          intensityData[date] = {}
        }
        
        log.completedSets.forEach(set => {
          // Si se seleccionó un ejercicio específico, filtrar
          if (selectedExercise !== "all" && set.exerciseId !== selectedExercise) {
            return
          }
          
          const exerciseId = set.exerciseId
          
          // Actualizar peso máximo para este ejercicio
          if (set.completedWeight) {
            if (!intensityData[date][exerciseId] || set.completedWeight > intensityData[date][exerciseId]) {
              intensityData[date][exerciseId] = set.completedWeight
            }
          }
        })
      })
      
      // Calcular promedio de intensidad por día
      const chartData = Object.entries(intensityData).map(([date, exercises]) => {
        const weights = Object.values(exercises)
        const avgIntensity = weights.length > 0 
          ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length
          : 0
          
        return {
          date,
          intensity: Math.round(avgIntensity * 10) / 10
        }
      })
      
      // Ordenar por fecha
      chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setChartData(chartData)
    } else if (activeTab === "frequency") {
      // Datos de frecuencia (entrenamientos por semana)
      const weekData: Record<string, number> = {}
      
      filteredLogs.forEach(log => {
        const date = new Date(log.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay()) // Domingo como inicio de semana
        const weekKey = weekStart.toISOString().split('T')[0]
        
        // Contar entrenamientos por semana
        if (weekData[weekKey]) {
          weekData[weekKey]++
        } else {
          weekData[weekKey] = 1
        }
      })
      
      // Convertir a formato para el gráfico
      const chartData = Object.entries(weekData).map(([weekStart, count]) => ({
        week: `Sem. ${new Date(weekStart).getDate()}/${new Date(weekStart).getMonth() + 1}`,
        count
      }))
      
      // Ordenar por semana
      chartData.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      
      setChartData(chartData)
    }
  }, [logs, activeTab, selectedExercise, selectedPeriod])

  // Calcular estadísticas generales
  const calculateStats = () => {
    if (logs.length === 0) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        avgDuration: 0,
        avgSets: 0
      }
    }

    const totalWorkouts = logs.length
    
    let totalVolume = 0
    let totalSets = 0
    let totalDuration = 0
    
    logs.forEach(log => {
      totalDuration += log.duration || 0
      totalSets += log.completedSets.length
      
      log.completedSets.forEach(set => {
        if (set.completedWeight && set.completedReps) {
          totalVolume += set.completedWeight * set.completedReps
        }
      })
    })
    
    return {
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      avgDuration: Math.round(totalDuration / totalWorkouts),
      avgSets: Math.round(totalSets / totalWorkouts)
    }
  }

  const stats = calculateStats()

  // Calcular tendencia (comparando con período anterior)
  const calculateTrend = () => {
    if (logs.length === 0 || chartData.length < 2) {
      return {
        volumeTrend: 0,
        intensityTrend: 0,
        frequencyTrend: 0
      }
    }

    // Dividir datos en dos períodos iguales
    const halfIndex = Math.floor(chartData.length / 2)
    const recentData = chartData.slice(halfIndex)
    const previousData = chartData.slice(0, halfIndex)

    // Calcular promedios según el tipo de gráfico
    if (activeTab === "volume") {
      const recentAvg = recentData.reduce((sum, item) => sum + item.volume, 0) / recentData.length
      const previousAvg = previousData.reduce((sum, item) => sum + item.volume, 0) / previousData.length
      
      return {
        volumeTrend: previousAvg === 0 ? 0 : ((recentAvg - previousAvg) / previousAvg) * 100
      }
    } else if (activeTab === "intensity") {
      const recentAvg = recentData.reduce((sum, item) => sum + item.intensity, 0) / recentData.length
      const previousAvg = previousData.reduce((sum, item) => sum + item.intensity, 0) / previousData.length
      
      return {
        intensityTrend: previousAvg === 0 ? 0 : ((recentAvg - previousAvg) / previousAvg) * 100
      }
    } else {
      const recentAvg = recentData.reduce((sum, item) => sum + item.count, 0) / recentData.length
      const previousAvg = previousData.reduce((sum, item) => sum + item.count, 0) / previousData.length
      
      return {
        frequencyTrend: previousAvg === 0 ? 0 : ((recentAvg - previousAvg) / previousAvg) * 100
      }
    }
  }

  const trend = calculateTrend()

  // Renderizar indicador de tendencia
  const renderTrendIndicator = (trendValue: number) => {
    if (Math.abs(trendValue) < 1) {
      return (
        <div className="flex items-center text-gray-500">
          <Minus className="h-3 w-3 mr-1" />
          <span className="text-xs">Sin cambios</span>
        </div>
      )
    }
    
    if (trendValue > 0) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span className="text-xs">+{Math.round(trendValue)}%</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center text-red-500">
        <ArrowDownRight className="h-3 w-3 mr-1" />
        <span className="text-xs">{Math.round(trendValue)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OrganicElement type="fade">
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total entrenamientos</span>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stats.totalWorkouts}</span>
              </div>
            </div>
          </Card>
        </OrganicElement>
        
        <OrganicElement type="fade" delay={0.1}>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Volumen total (kg)</span>
                <BarChartIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stats.totalVolume.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </OrganicElement>
        
        <OrganicElement type="fade" delay={0.2}>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Duración media</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stats.avgDuration} min</span>
              </div>
            </div>
          </Card>
        </OrganicElement>
        
        <OrganicElement type="fade" delay={0.3}>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Series por sesión</span>
                <Dumbbell className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stats.avgSets}</span>
              </div>
            </div>
          </Card>
        </OrganicElement>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 rounded-full p-1">
              <TabsTrigger value="volume" className="rounded-full">
                <BarChartIcon className="h-4 w-4 mr-2" />
                <span>Volumen</span>
              </TabsTrigger>
              <TabsTrigger value="intensity" className="rounded-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Intensidad</span>
              </TabsTrigger>
              <TabsTrigger value="frequency" className="rounded-full">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Frecuencia</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-2">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar ejercicio" />
              </SelectTrigger>
              <SelectContent>
                {exerciseOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
                <SelectItem value="180">6 meses</SelectItem>
                <SelectItem value="365">1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <OrganicElement type="fade">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">
                  {activeTab === "volume" ? "Volumen de entrenamiento" : 
                   activeTab === "intensity" ? "Intensidad de entrenamiento" : 
                   "Frecuencia de entrenamiento"}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === "volume" ? "Peso total levantado (kg)" : 
                   activeTab === "intensity" ? "Peso promedio por ejercicio (kg)" : 
                   "Entrenamientos por semana"}
                </p>
              </div>
              <div>
                {activeTab === "volume" && renderTrendIndicator(trend.volumeTrend || 0)}
                {activeTab === "intensity" && renderTrendIndicator(trend.intensityTrend || 0)}
                {activeTab === "frequency" && renderTrendIndicator(trend.frequencyTrend || 0)}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-center py-8">
                <BarChartIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay datos suficientes</h3>
                <p className="text-gray-500 mb-4">Completa más entrenamientos para ver estadísticas</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === "frequency" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Entrenamientos" fill="#8884d8" />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {activeTab === "volume" ? (
                        <Line 
                          type="monotone" 
                          dataKey="volume" 
                          name="Volumen (kg)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      ) : (
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          name="Intensidad (kg)" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                        />
                      )}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </OrganicElement>
      </div>
    </div>
  )
}
