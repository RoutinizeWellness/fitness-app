"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart, 
  LineChart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Dumbbell, 
  Clock, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from "recharts"
import { WorkoutLog } from "@/lib/types/training"
import { getTrainingStats } from "@/lib/training-service"
import { useToast } from "@/components/ui/use-toast"

interface ProgressVisualizationProps {
  userId: string
  className?: string
}

export function ProgressVisualization({ userId, className = "" }: ProgressVisualizationProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30days")
  const [exerciseFilter, setExerciseFilter] = useState("all")
  const [stats, setStats] = useState<any>(null)
  const [progressData, setProgressData] = useState<any[]>([])

  // Cargar estadísticas de entrenamiento
  useEffect(() => {
    const loadStats = async () => {
      if (!userId) return
      
      setIsLoading(true)
      try {
        const { data, error } = await getTrainingStats(userId)
        
        if (error) {
          console.error("Error al cargar estadísticas:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las estadísticas de entrenamiento",
            variant: "destructive"
          })
          return
        }
        
        if (data) {
          setStats(data)
          
          // Transformar datos para gráficos
          if (data.progressData && data.progressData.length > 0) {
            const formattedData = data.progressData.map((item: any) => ({
              date: new Date(item.date).toLocaleDateString(),
              duration: item.duration,
              sets: item.sets
            }))
            
            setProgressData(formattedData)
          }
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadStats()
  }, [userId, toast])

  // Datos simulados para gráficos de progreso de ejercicios
  const exerciseProgressData = [
    { name: "Semana 1", weight: 60, reps: 8 },
    { name: "Semana 2", weight: 65, reps: 8 },
    { name: "Semana 3", weight: 65, reps: 10 },
    { name: "Semana 4", weight: 70, reps: 8 },
    { name: "Semana 5", weight: 70, reps: 10 },
    { name: "Semana 6", weight: 75, reps: 8 },
    { name: "Semana 7", weight: 75, reps: 9 },
    { name: "Semana 8", weight: 80, reps: 8 }
  ]

  // Datos simulados para volumen por grupo muscular
  const volumeByMuscleGroup = [
    { name: "Pecho", volume: 12000 },
    { name: "Espalda", volume: 14000 },
    { name: "Piernas", volume: 18000 },
    { name: "Hombros", volume: 8000 },
    { name: "Brazos", volume: 6000 },
    { name: "Core", volume: 4000 }
  ]

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Progreso de Entrenamiento</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Progreso de Entrenamiento</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 días</SelectItem>
            <SelectItem value="30days">Últimos 30 días</SelectItem>
            <SelectItem value="90days">Últimos 3 meses</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Entrenamientos</p>
                <h3 className="text-2xl font-bold mt-1">{stats?.totalWorkouts || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {stats?.workoutsThisWeek || 0}/semana
                  </Badge>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Total</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats?.totalDuration ? Math.round(stats.totalDuration / 60) : 0}h
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats?.totalWorkouts ? Math.round(stats.totalDuration / stats.totalWorkouts) : 0} min/sesión
                  </Badge>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Series Totales</p>
                <h3 className="text-2xl font-bold mt-1">{stats?.totalSets || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="mr-1">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {stats?.totalWorkouts ? Math.round(stats.totalSets / stats.totalWorkouts) : 0} series/sesión
                  </Badge>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de visualización */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
          <TabsTrigger value="volume">Volumen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Actividad de Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={progressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="duration"
                      name="Duración (min)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sets"
                      name="Series"
                      stroke="#82ca9d"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Progreso por Ejercicio</h3>
            <Select value={exerciseFilter} onValueChange={setExerciseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ejercicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los ejercicios</SelectItem>
                <SelectItem value="squat">Sentadilla</SelectItem>
                <SelectItem value="bench">Press de Banca</SelectItem>
                <SelectItem value="deadlift">Peso Muerto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {exerciseFilter === "all" ? "Progresión General" : 
                 exerciseFilter === "squat" ? "Sentadilla" :
                 exerciseFilter === "bench" ? "Press de Banca" : "Peso Muerto"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={exerciseProgressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      name="Peso (kg)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="reps"
                      name="Repeticiones"
                      stroke="#82ca9d"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Volumen por Grupo Muscular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={volumeByMuscleGroup}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volume" name="Volumen (kg)" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
