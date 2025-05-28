"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts"
import { Calendar, Download, Filter, TrendingUp, BarChart2, PieChart, Activity, BarChart3 } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { useUserExperience } from "@/contexts/user-experience-context"
import { supabase } from "@/lib/supabase-client"
import { VolumeLandmarksTracker } from "./volume-landmarks-tracker"
import { useAuth } from "@/lib/contexts/auth-context"

// Tipos para los datos de rendimiento
interface PerformanceData {
  date: string
  volume: number
  intensity: number
  rpe: number
  fatigue: number
  readiness: number
  muscleGroups: {
    [key: string]: {
      volume: number
      sets: number
      reps: number
      tonnage: number
    }
  }
}

interface ExerciseProgress {
  exercise: string
  muscleGroup: string
  dates: string[]
  weights: number[]
  reps: number[]
  oneRepMax: number[]
  rpe: number[]
}

interface StrengthRatio {
  name: string
  value: number
  ideal: number
  ratio: number
}

export function PerformanceAnalytics() {
  const { experienceLevel, interfaceMode } = useUserExperience()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() })
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [strengthRatios, setStrengthRatios] = useState<StrengthRatio[]>([])
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all")
  const [selectedExercise, setSelectedExercise] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [trainingLevel, setTrainingLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('advanced')

  // Cargar datos de rendimiento
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        // Formatear fechas para la consulta
        const fromDate = dateRange.from.toISOString()
        const toDate = dateRange.to.toISOString()

        // Obtener datos de rendimiento
        const { data, error } = await supabase
          .from('workout_logs')
          .select('*')
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: true })

        if (error) throw error

        // Procesar datos para el análisis
        const processedData = processWorkoutData(data || [])
        setPerformanceData(processedData.performanceData)
        setExerciseProgress(processedData.exerciseProgress)
        setStrengthRatios(processedData.strengthRatios)
      } catch (error) {
        console.error("Error al cargar datos de rendimiento:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de rendimiento.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPerformanceData()
  }, [dateRange])

  // Procesar datos de entrenamiento para análisis
  const processWorkoutData = (workoutLogs: any[]) => {
    // Esta función procesaría los datos de entrenamiento para generar
    // las métricas y gráficos necesarios

    // Por ahora, devolvemos datos de ejemplo
    return {
      performanceData: generateSamplePerformanceData(),
      exerciseProgress: generateSampleExerciseProgress(),
      strengthRatios: generateSampleStrengthRatios()
    }
  }

  // Generar datos de ejemplo para desarrollo
  const generateSamplePerformanceData = (): PerformanceData[] => {
    const startDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return Array.from({ length: daysDiff }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      // Solo incluir días de entrenamiento (3-4 por semana)
      if (i % 2 === 0 || i % 5 === 0) {
        return {
          date: date.toISOString(),
          volume: 15000 + Math.random() * 5000,
          intensity: 70 + Math.random() * 15,
          rpe: 7 + Math.random() * 2,
          fatigue: 40 + Math.random() * 30,
          readiness: 60 + Math.random() * 30,
          muscleGroups: {
            chest: {
              volume: 4000 + Math.random() * 1000,
              sets: 12 + Math.floor(Math.random() * 4),
              reps: 8 + Math.floor(Math.random() * 4),
              tonnage: 2000 + Math.random() * 500
            },
            back: {
              volume: 4500 + Math.random() * 1000,
              sets: 14 + Math.floor(Math.random() * 4),
              reps: 10 + Math.floor(Math.random() * 4),
              tonnage: 2200 + Math.random() * 500
            },
            legs: {
              volume: 6000 + Math.random() * 1500,
              sets: 16 + Math.floor(Math.random() * 4),
              reps: 8 + Math.floor(Math.random() * 4),
              tonnage: 3000 + Math.random() * 800
            }
          }
        }
      }

      return null
    }).filter(Boolean) as PerformanceData[]
  }

  const generateSampleExerciseProgress = (): ExerciseProgress[] => {
    return [
      {
        exercise: "Bench Press",
        muscleGroup: "chest",
        dates: ["2023-05-01", "2023-05-08", "2023-05-15", "2023-05-22", "2023-05-29"],
        weights: [80, 82.5, 85, 85, 87.5],
        reps: [8, 8, 7, 8, 7],
        oneRepMax: [101.3, 104.4, 104.6, 107.6, 107.8],
        rpe: [8, 8.5, 9, 8.5, 9]
      },
      {
        exercise: "Squat",
        muscleGroup: "legs",
        dates: ["2023-05-02", "2023-05-09", "2023-05-16", "2023-05-23", "2023-05-30"],
        weights: [120, 125, 127.5, 130, 132.5],
        reps: [6, 6, 5, 5, 5],
        oneRepMax: [142.8, 148.8, 146.6, 149.5, 152.4],
        rpe: [8.5, 9, 9, 9.5, 9]
      }
    ]
  }

  const generateSampleStrengthRatios = (): StrengthRatio[] => {
    return [
      { name: "Bench/Squat", value: 0.65, ideal: 0.75, ratio: 0.87 },
      { name: "Deadlift/Squat", value: 1.2, ideal: 1.25, ratio: 0.96 },
      { name: "OHP/Bench", value: 0.55, ideal: 0.6, ratio: 0.92 },
      { name: "Row/Bench", value: 0.9, ideal: 1.0, ratio: 0.9 },
      { name: "Front/Back Squat", value: 0.8, ideal: 0.85, ratio: 0.94 }
    ]
  }

  // Exportar datos a CSV
  const exportData = () => {
    // Implementación de exportación de datos
    toast({
      title: "Exportación iniciada",
      description: "Los datos se están exportando a CSV."
    })
  }

  // Renderizar el componente
  return (
    <Card3D className="w-full">
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle gradient={true}>Análisis de Rendimiento Avanzado</Card3DTitle>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="flex justify-between items-center mb-6">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <div className="flex space-x-2">
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="chest">Pecho</SelectItem>
                <SelectItem value="back">Espalda</SelectItem>
                <SelectItem value="legs">Piernas</SelectItem>
                <SelectItem value="shoulders">Hombros</SelectItem>
                <SelectItem value="arms">Brazos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ejercicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bench_press">Press de banca</SelectItem>
                <SelectItem value="squat">Sentadilla</SelectItem>
                <SelectItem value="deadlift">Peso muerto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="volume">Volumen</TabsTrigger>
            <TabsTrigger value="strength">Fuerza</TabsTrigger>
            <TabsTrigger value="fatigue">Fatiga</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Volumen de entrenamiento</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Intensidad vs. RPE</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="intensity" name="Intensidad (%)" />
                    <YAxis type="number" dataKey="rpe" name="RPE" domain={[6, 10]} />
                    <ZAxis type="number" range={[50, 200]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Entrenamientos" data={performanceData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Distribución de volumen por grupo muscular</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData.slice(-5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="muscleGroups.chest.volume" name="Pecho" fill="#8884d8" stackId="a" />
                  <Bar dataKey="muscleGroups.back.volume" name="Espalda" fill="#82ca9d" stackId="a" />
                  <Bar dataKey="muscleGroups.legs.volume" name="Piernas" fill="#ffc658" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Contenido de pestañas */}
          <TabsContent value="volume" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Volume Landmarks Tracker */}
              <VolumeLandmarksTracker
                userId={user?.id}
                trainingLevel={trainingLevel}
              />

              {/* Volume Distribution */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Distribución de volumen por grupo muscular</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData.slice(-5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="muscleGroups.chest.volume" name="Pecho" fill="#8884d8" stackId="a" />
                    <Bar dataKey="muscleGroups.back.volume" name="Espalda" fill="#82ca9d" stackId="a" />
                    <Bar dataKey="muscleGroups.legs.volume" name="Piernas" fill="#ffc658" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Progression */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Progresión de volumen semanal</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="volume" name="Volumen total" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <p>Análisis detallado de progresión de fuerza</p>
          </TabsContent>

          <TabsContent value="fatigue" className="space-y-4">
            <p>Análisis detallado de fatiga y recuperación</p>
          </TabsContent>
        </Tabs>
      </Card3DContent>
    </Card3D>
  )
}
