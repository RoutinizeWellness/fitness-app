"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { Calendar, TrendingUp, BarChart3, Activity, Dumbbell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserWorkoutSessions } from "@/lib/workout-tracking-service"
import { getUserFatigue } from "@/lib/adaptive-learning-service"

interface WorkoutSession {
  id: string
  userId: string
  workoutDayId: string
  workoutDayName: string
  date: string
  exercises: {
    exerciseId: string
    name: string
    sets: {
      weight: number
      reps: number
      rir: number
    }[]
  }[]
}

export default function PerformanceTracking() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "volume" | "intensity">("weight")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [fatigueData, setFatigueData] = useState<any>(null)
  
  // Cargar sesiones de entrenamiento
  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Cargar sesiones de entrenamiento
        const userSessions = await getUserWorkoutSessions(user.id)
        setSessions(userSessions)
        
        // Si hay sesiones, seleccionar el primer ejercicio por defecto
        if (userSessions.length > 0 && userSessions[0].exercises.length > 0) {
          setSelectedExercise(userSessions[0].exercises[0].name)
        }
        
        // Cargar datos de fatiga
        const fatigue = await getUserFatigue(user.id)
        setFatigueData(fatigue)
      } catch (error) {
        console.error("Error al cargar datos de rendimiento:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user])
  
  // Obtener lista de ejercicios únicos
  const uniqueExercises = Array.from(
    new Set(
      sessions.flatMap(session => 
        session.exercises.map(exercise => exercise.name)
      )
    )
  )
  
  // Preparar datos para el gráfico de progresión
  const getProgressionData = () => {
    if (!selectedExercise) return []
    
    // Filtrar sesiones por rango de tiempo
    const now = new Date()
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date)
      if (timeRange === "week") {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
      } else if (timeRange === "month") {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 30
      } else {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 365
      }
    })
    
    // Ordenar por fecha
    const sortedSessions = [...filteredSessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Extraer datos del ejercicio seleccionado
    return sortedSessions.map(session => {
      const exercise = session.exercises.find(ex => ex.name === selectedExercise)
      
      if (!exercise) return null
      
      // Calcular métricas
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight))
      const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
      const avgIntensity = exercise.sets.reduce((sum, set) => sum + (10 - set.rir), 0) / exercise.sets.length
      
      return {
        date: new Date(session.date).toLocaleDateString(),
        weight: maxWeight,
        volume: totalVolume,
        intensity: avgIntensity
      }
    }).filter(Boolean)
  }
  
  // Preparar datos para el gráfico de volumen por grupo muscular
  const getVolumeByMuscleGroup = () => {
    // Mapeo de ejercicios a grupos musculares
    const exerciseToMuscleGroup: Record<string, string> = {
      // Pecho
      "Press de Banca": "Pecho",
      "Press Inclinado": "Pecho",
      "Aperturas con Mancuernas": "Pecho",
      "Fondos": "Pecho",
      "Pullover": "Pecho",
      
      // Espalda
      "Dominadas": "Espalda",
      "Remo con Barra": "Espalda",
      "Remo con Mancuerna": "Espalda",
      "Jalón al Pecho": "Espalda",
      "Hiperextensiones": "Espalda",
      
      // Piernas
      "Sentadilla": "Piernas",
      "Peso Muerto": "Piernas",
      "Prensa de Piernas": "Piernas",
      "Extensión de Cuádriceps": "Piernas",
      "Curl de Isquiotibiales": "Piernas",
      "Elevación de Pantorrillas": "Piernas",
      
      // Hombros
      "Press Militar": "Hombros",
      "Elevaciones Laterales": "Hombros",
      "Face Pull": "Hombros",
      
      // Brazos
      "Curl de Bíceps": "Brazos",
      "Extensión de Tríceps": "Brazos",
      "Curl de Muñecas": "Brazos"
    }
    
    // Filtrar sesiones por rango de tiempo
    const now = new Date()
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date)
      if (timeRange === "week") {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
      } else if (timeRange === "month") {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 30
      } else {
        return (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24) <= 365
      }
    })
    
    // Calcular volumen por grupo muscular
    const volumeByGroup: Record<string, number> = {}
    
    filteredSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const muscleGroup = exerciseToMuscleGroup[exercise.name] || "Otros"
        const exerciseVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
        
        volumeByGroup[muscleGroup] = (volumeByGroup[muscleGroup] || 0) + exerciseVolume
      })
    })
    
    // Convertir a formato para el gráfico
    return Object.entries(volumeByGroup).map(([group, volume]) => ({
      group,
      volume
    }))
  }
  
  // Renderizar indicadores de fatiga
  const renderFatigueIndicators = () => {
    if (!fatigueData) return null
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Fatiga General</h3>
              <div className="text-2xl font-bold mb-2">{fatigueData.currentFatigue}%</div>
              <Progress 
                value={fatigueData.currentFatigue} 
                indicatorClassName={
                  fatigueData.currentFatigue < 30 ? 'bg-green-500' :
                  fatigueData.currentFatigue < 70 ? 'bg-amber-500' :
                  'bg-red-500'
                }
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Estado de Recuperación</h3>
              <div className="text-2xl font-bold mb-2">{fatigueData.recoveryStatus}</div>
              <Badge variant={
                fatigueData.recoveryStatus === 'excellent' ? 'default' :
                fatigueData.recoveryStatus === 'good' ? 'secondary' :
                fatigueData.recoveryStatus === 'moderate' ? 'outline' :
                'destructive'
              }>
                {fatigueData.readyToTrain ? 'Listo para entrenar' : 'Necesita descanso'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Cargando datos de rendimiento...</p>
      </div>
    )
  }
  
  if (sessions.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="mb-2">No tienes sesiones de entrenamiento registradas.</p>
        <Button asChild>
          <a href="/training">Ir a Entrenar</a>
        </Button>
      </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Seguimiento de Rendimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progression">
          <TabsList className="mb-4">
            <TabsTrigger value="progression" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Progresión
            </TabsTrigger>
            <TabsTrigger value="volume" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-1" />
              Volumen
            </TabsTrigger>
            <TabsTrigger value="fatigue" className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Fatiga
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-4 flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="progression" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-[200px]">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Seleccionar ejercicio" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueExercises.map(exercise => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Peso máximo</SelectItem>
                  <SelectItem value="volume">Volumen total</SelectItem>
                  <SelectItem value="intensity">Intensidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getProgressionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="volume" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVolumeByMuscleGroup()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="#8884d8" name="Volumen Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="fatigue" className="space-y-4">
            {renderFatigueIndicators()}
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Fatiga por Grupo Muscular</h3>
              
              {fatigueData && fatigueData.muscleGroupFatigue && (
                <div className="space-y-3">
                  {Object.entries(fatigueData.muscleGroupFatigue).map(([group, fatigue]: [string, any]) => (
                    <div key={group} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{group}</span>
                        <span>{fatigue}%</span>
                      </div>
                      <Progress 
                        value={fatigue} 
                        indicatorClassName={
                          fatigue < 30 ? 'bg-green-500' :
                          fatigue < 70 ? 'bg-amber-500' :
                          'bg-red-500'
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
