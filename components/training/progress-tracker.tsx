"use client"

import { useState } from "react"
import { 
  BarChart, 
  LineChart, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Clock, 
  Flame,
  TrendingUp,
  Medal,
  BarChart2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipos para datos de progreso
interface ExerciseProgress {
  id: string
  name: string
  data: {
    date: string
    weight: number
    reps: number
  }[]
  personalRecord: {
    weight: number
    date: string
  }
}

interface WorkoutLog {
  id: string
  date: string
  routineName: string
  duration: number
  exercises: {
    name: string
    sets: number
    totalWeight: number
  }[]
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor'
}

interface ProgressStats {
  totalWorkouts: number
  totalExercises: number
  totalWeight: number
  totalDuration: number
  averagePerformance: string
  streakDays: number
  mostFrequentExercise: string
  strongestLift: {
    exercise: string
    weight: number
  }
}

interface ProgressTrackerProps {
  exerciseProgress: ExerciseProgress[]
  workoutLogs: WorkoutLog[]
  stats: ProgressStats
}

export function ProgressTracker({
  exerciseProgress,
  workoutLogs,
  stats
}: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedExercise, setSelectedExercise] = useState<string>(
    exerciseProgress.length > 0 ? exerciseProgress[0].id : ""
  )
  const [timeRange, setTimeRange] = useState("month")
  
  // Obtener ejercicio seleccionado
  const currentExercise = exerciseProgress.find(ex => ex.id === selectedExercise)
  
  // Filtrar logs por rango de tiempo
  const filteredLogs = workoutLogs.filter(log => {
    const logDate = new Date(log.date)
    const now = new Date()
    
    if (timeRange === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      return logDate >= weekAgo
    } else if (timeRange === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      return logDate >= monthAgo
    } else if (timeRange === "year") {
      const yearAgo = new Date()
      yearAgo.setFullYear(now.getFullYear() - 1)
      return logDate >= yearAgo
    }
    
    return true
  })
  
  // Formatear rendimiento
  const formatPerformance = (performance: string) => {
    switch (performance) {
      case 'excellent': return "Excelente"
      case 'good': return "Bueno"
      case 'average': return "Normal"
      case 'poor': return "Regular"
      case 'very_poor': return "Bajo"
      default: return performance
    }
  }
  
  // Renderizar gráfico de progreso (simulado)
  const renderProgressChart = () => {
    if (!currentExercise) return null
    
    return (
      <div className="h-64 w-full bg-muted/30 rounded-md flex items-center justify-center">
        <div className="w-full h-full p-4 relative">
          {/* Eje Y */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between items-end pr-2">
            <span className="text-xs text-muted-foreground">100kg</span>
            <span className="text-xs text-muted-foreground">75kg</span>
            <span className="text-xs text-muted-foreground">50kg</span>
            <span className="text-xs text-muted-foreground">25kg</span>
            <span className="text-xs text-muted-foreground">0kg</span>
          </div>
          
          {/* Gráfico simulado */}
          <div className="absolute left-12 right-4 top-4 bottom-4 flex items-end">
            {currentExercise.data.slice(-8).map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-4/5 bg-primary rounded-t-sm" 
                  style={{ 
                    height: `${(point.weight / 100) * 100}%`,
                    minHeight: '4px'
                  }}
                />
                <span className="text-[10px] text-muted-foreground mt-1 rotate-45 origin-left">
                  {new Date(point.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Seguimiento de Progreso</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
            <SelectItem value="all">Todo el historial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Dumbbell className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Entrenamientos</p>
                <h3 className="text-2xl font-bold">{stats.totalWorkouts}</h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Horas totales</p>
                <h3 className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}</h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Flame className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Racha actual</p>
                <h3 className="text-2xl font-bold">{stats.streakDays} días</h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <BarChart2 className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Peso total</p>
                <h3 className="text-2xl font-bold">{stats.totalWeight.toLocaleString()} kg</h3>
              </CardContent>
            </Card>
          </div>
          
          {/* Récords personales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Récords Personales</CardTitle>
              <CardDescription>Tus mejores marcas hasta la fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Medal className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <p className="font-medium">{stats.strongestLift.exercise}</p>
                      <p className="text-sm text-muted-foreground">Levantamiento más fuerte</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold">
                    {stats.strongestLift.weight} kg
                  </Badge>
                </div>
                
                <Separator />
                
                {exerciseProgress.slice(0, 3).map(exercise => (
                  <div key={exercise.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exercise.personalRecord.date).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {exercise.personalRecord.weight} kg
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Rendimiento reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rendimiento Reciente</CardTitle>
              <CardDescription>Basado en tus últimos entrenamientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Rendimiento promedio</p>
                  <Badge 
                    className={
                      stats.averagePerformance === 'excellent' || stats.averagePerformance === 'good'
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : stats.averagePerformance === 'average'
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {formatPerformance(stats.averagePerformance)}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Ejercicio más frecuente</p>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-primary mr-2" />
                    <span>{stats.mostFrequentExercise}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Últimos 5 entrenamientos</p>
                  <div className="flex space-x-1">
                    {filteredLogs.slice(0, 5).map((log, index) => (
                      <div 
                        key={index} 
                        className={`flex-1 h-8 rounded-sm flex items-center justify-center text-xs font-medium ${
                          log.performance === 'excellent' ? "bg-green-500 text-white" :
                          log.performance === 'good' ? "bg-green-300 text-green-800" :
                          log.performance === 'average' ? "bg-blue-300 text-blue-800" :
                          log.performance === 'poor' ? "bg-amber-300 text-amber-800" :
                          "bg-red-300 text-red-800"
                        }`}
                      >
                        {log.performance === 'excellent' && "E"}
                        {log.performance === 'good' && "B"}
                        {log.performance === 'average' && "N"}
                        {log.performance === 'poor' && "R"}
                        {log.performance === 'very_poor' && "M"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exercises" className="space-y-4">
          {/* Selector de ejercicio */}
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ejercicio" />
            </SelectTrigger>
            <SelectContent>
              {exerciseProgress.map(exercise => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Detalles del ejercicio seleccionado */}
          {currentExercise && (
            <Card>
              <CardHeader>
                <CardTitle>{currentExercise.name}</CardTitle>
                <CardDescription>
                  Progreso de peso y repeticiones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Récord personal</p>
                    <p className="text-xl font-bold">{currentExercise.personalRecord.weight} kg</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(currentExercise.personalRecord.date).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Último registro</p>
                    <p className="text-xl font-bold">
                      {currentExercise.data.length > 0 
                        ? `${currentExercise.data[currentExercise.data.length - 1].weight} kg` 
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentExercise.data.length > 0 
                        ? new Date(currentExercise.data[currentExercise.data.length - 1].date).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short'
                          })
                        : ""}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Progreso</p>
                    {currentExercise.data.length >= 2 ? (
                      <div className="flex items-center">
                        {currentExercise.data[currentExercise.data.length - 1].weight > 
                         currentExercise.data[currentExercise.data.length - 2].weight ? (
                          <>
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500 font-medium">
                              {(currentExercise.data[currentExercise.data.length - 1].weight - 
                                currentExercise.data[currentExercise.data.length - 2].weight).toFixed(1)} kg
                            </span>
                          </>
                        ) : currentExercise.data[currentExercise.data.length - 1].weight < 
                                currentExercise.data[currentExercise.data.length - 2].weight ? (
                          <>
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-red-500 font-medium">
                              {(currentExercise.data[currentExercise.data.length - 2].weight - 
                                currentExercise.data[currentExercise.data.length - 1].weight).toFixed(1)} kg
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Sin cambios</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Insuficientes datos</span>
                    )}
                  </div>
                </div>
                
                {/* Gráfico de progreso */}
                {renderProgressChart()}
                
                {/* Historial de registros */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Historial de registros</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {currentExercise.data.slice().reverse().map((record, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                        <div>
                          <p className="font-medium">{record.weight} kg</p>
                          <p className="text-xs text-muted-foreground">
                            {record.reps} repeticiones
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {/* Historial de entrenamientos */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Entrenamientos</CardTitle>
              <CardDescription>
                Tus últimos {filteredLogs.length} entrenamientos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredLogs.map(log => (
                  <Card key={log.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{log.routineName}</CardTitle>
                          <CardDescription>
                            {new Date(log.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long'
                            })}
                          </CardDescription>
                        </div>
                        <Badge 
                          className={
                            log.performance === 'excellent' || log.performance === 'good'
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : log.performance === 'average'
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        >
                          {formatPerformance(log.performance)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{log.duration} min</span>
                        </div>
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{log.exercises.length} ejercicios</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{log.exercises.reduce((sum, ex) => sum + ex.totalWeight, 0)} kg</span>
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {log.exercises.slice(0, 4).map((exercise, index) => (
                          <div key={index} className="text-xs flex justify-between">
                            <span className="text-muted-foreground">{exercise.name}</span>
                            <span>{exercise.sets} series</span>
                          </div>
                        ))}
                        {log.exercises.length > 4 && (
                          <div className="text-xs text-muted-foreground col-span-2 text-center">
                            +{log.exercises.length - 4} más
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
