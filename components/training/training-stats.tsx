"use client"

import { useState } from "react"
import {
  BarChart3, Calendar, TrendingUp,
  Dumbbell, Clock, Flame, Award,
  ChevronRight, Filter, Download, Share2
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutLog } from "@/lib/types/training"
import { TrainingCyclesVisualization } from "@/components/training/training-cycles-visualization"
import { exportToCSV } from "@/lib/export-utils"
import { toast } from "@/components/ui/use-toast"

interface TrainingStatsProps {
  logs: WorkoutLog[]
  userId?: string
}

export function TrainingStats({
  logs,
  userId = ""
}: TrainingStatsProps) {
  const [filterPeriod, setFilterPeriod] = useState("month")
  const [activeTab, setActiveTab] = useState("overview")

  // Función para exportar datos a CSV
  const handleExportCSV = () => {
    // Preparar datos para exportar
    const exportData = logs.map(log => ({
      fecha: new Date(log.date).toLocaleDateString(),
      duracion: log.duration,
      ejercicios: log.completedSets.length,
      fatiga: log.overallFatigue,
      rendimiento: log.performance
    }))

    exportToCSV(exportData, 'training-stats-export')

    toast({
      title: "Datos exportados",
      description: "Los datos se han exportado correctamente en formato CSV",
    })
  }

  // Filtrar logs por período
  const filteredLogs = logs.filter(log => {
    if (filterPeriod === "all") return true

    const logDate = new Date(log.date)
    const now = new Date()

    switch (filterPeriod) {
      case "week":
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        return logDate >= weekAgo
      case "month":
        const monthAgo = new Date()
        monthAgo.setMonth(now.getMonth() - 1)
        return logDate >= monthAgo
      case "year":
        const yearAgo = new Date()
        yearAgo.setFullYear(now.getFullYear() - 1)
        return logDate >= yearAgo
      default:
        return true
    }
  })

  // Calcular estadísticas
  const totalWorkouts = filteredLogs.length
  const totalDuration = filteredLogs.reduce((acc, log) => acc + log.duration, 0)
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  // Calcular volumen total (peso x reps)
  const totalVolume = filteredLogs.reduce((acc, log) => {
    return acc + log.completedSets.reduce((setAcc, set) => {
      return setAcc + (set.completedReps || 0) * (set.completedWeight || 0)
    }, 0)
  }, 0)

  // Calcular promedio de fatiga
  const averageFatigue = totalWorkouts > 0
    ? Math.round(filteredLogs.reduce((acc, log) => acc + log.overallFatigue, 0) / totalWorkouts * 10) / 10
    : 0

  // Calcular frecuencia semanal
  const weeksInPeriod = filterPeriod === "week" ? 1 : filterPeriod === "month" ? 4 : 52
  const weeklyFrequency = totalWorkouts > 0 ? Math.round((totalWorkouts / weeksInPeriod) * 10) / 10 : 0

  // Calcular progreso en ejercicios principales
  const exerciseProgress: Record<string, { current: number, previous: number, change: number }> = {}

  // Simplificado para el ejemplo
  if (filteredLogs.length > 0) {
    exerciseProgress["bench-press"] = {
      current: 85,
      previous: 80,
      change: 6.25
    }
    exerciseProgress["squat"] = {
      current: 120,
      previous: 110,
      change: 9.09
    }
    exerciseProgress["deadlift"] = {
      current: 140,
      previous: 135,
      change: 3.7
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros y acciones */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Estadísticas de entrenamiento</h2>

        <div className="flex items-center space-x-2">
          <div className="flex items-center mr-4">
            <Button3D
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button3D>
          </div>

          <Button3D
            variant={filterPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("week")}
          >
            Semana
          </Button3D>
          <Button3D
            variant={filterPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("month")}
          >
            Mes
          </Button3D>
          <Button3D
            variant={filterPeriod === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("year")}
          >
            Año
          </Button3D>
        </div>
      </div>

      {/* Pestañas de estadísticas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="cycles">Ciclos</TabsTrigger>
        </TabsList>

        {/* Contenido de las pestañas */}
        <TabsContent value="overview" className="space-y-4">
          {/* Resumen general */}
          <div className="grid grid-cols-2 gap-4">
            <Card3D className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">Entrenamientos</span>
                </div>
                <div className="text-2xl font-bold gradient-text mb-1">
                  {totalWorkouts}
                </div>
                <p className="text-xs text-gray-500 mt-auto">
                  {weeklyFrequency} por semana
                </p>
              </div>
            </Card3D>

            <Card3D className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">Tiempo total</span>
                </div>
                <div className="text-2xl font-bold gradient-text mb-1">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
                <p className="text-xs text-gray-500 mt-auto">
                  {averageDuration} min por sesión
                </p>
              </div>
            </Card3D>

            <Card3D className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-2">
                  <Dumbbell className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-medium">Volumen total</span>
                </div>
                <div className="text-2xl font-bold gradient-text mb-1">
                  {Math.round(totalVolume / 1000)}k kg
                </div>
                <p className="text-xs text-gray-500 mt-auto">
                  Peso total levantado
                </p>
              </div>
            </Card3D>

            <Card3D className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-2">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="font-medium">Fatiga media</span>
                </div>
                <div className="text-2xl font-bold gradient-text mb-1">
                  {averageFatigue}/10
                </div>
                <p className="text-xs text-gray-500 mt-auto">
                  Intensidad percibida
                </p>
              </div>
            </Card3D>
          </div>

          {/* Gráfico de actividad (simulado) */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Actividad de entrenamiento</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="h-40 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Gráfico de actividad</p>
                  <p className="text-xs">(Simulado para el ejemplo)</p>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          {/* Estadísticas por ejercicio */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Ejercicios más frecuentes</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="mr-3 bg-blue-100 text-blue-800 border-blue-200">1</Badge>
                    <span>Press de banca</span>
                  </div>
                  <Badge variant="outline">12 series</Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="mr-3 bg-blue-100 text-blue-800 border-blue-200">2</Badge>
                    <span>Sentadilla</span>
                  </div>
                  <Badge variant="outline">10 series</Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="mr-3 bg-blue-100 text-blue-800 border-blue-200">3</Badge>
                    <span>Dominadas</span>
                  </div>
                  <Badge variant="outline">8 series</Badge>
                </div>
              </div>
            </Card3DContent>
          </Card3D>

          {/* Distribución de grupos musculares */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Distribución de grupos musculares</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Pecho</span>
                    <span className="text-sm">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Espalda</span>
                    <span className="text-sm">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Piernas</span>
                    <span className="text-sm">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Hombros</span>
                    <span className="text-sm">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Brazos</span>
                    <span className="text-sm">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {/* Progreso en ejercicios principales */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Progreso en ejercicios principales</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                {Object.entries(exerciseProgress).map(([exercise, data]) => {
                  const exerciseNames: Record<string, string> = {
                    "bench-press": "Press de banca",
                    "squat": "Sentadilla",
                    "deadlift": "Peso muerto"
                  }

                  return (
                    <div key={exercise} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{exerciseNames[exercise] || exercise}</span>
                        <Badge
                          className={data.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {data.change > 0 ? "+" : ""}{data.change}%
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm">
                        <span className="text-gray-500">{data.previous} kg</span>
                        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                        <span className="font-medium">{data.current} kg</span>
                      </div>
                    </div>
                  )
                })}

                {Object.keys(exerciseProgress).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No hay suficientes datos para mostrar el progreso</p>
                  </div>
                )}
              </div>
            </Card3DContent>
          </Card3D>

          {/* Recomendaciones basadas en el progreso */}
          <Card3D>
            <Card3DHeader>
              <Card3DTitle gradient={true}>Recomendaciones personalizadas</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <Award className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Aumenta el peso en press de banca</p>
                    <p className="text-xs text-blue-600">
                      Basado en tu progreso, puedes intentar aumentar 2.5kg en tu próxima sesión.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Mejora tu técnica en sentadilla</p>
                    <p className="text-xs text-green-600">
                      Tu progreso es bueno, pero enfócate en mejorar la técnica antes de aumentar más peso.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                  <Award className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-700">Añade más volumen a tu entrenamiento de espalda</p>
                    <p className="text-xs text-purple-600">
                      Para un desarrollo equilibrado, considera añadir más series para la espalda.
                    </p>
                  </div>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Ciclos de Entrenamiento</h2>
            <Button3D
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/training/cycles"}
            >
              Ver análisis completo
            </Button3D>
          </div>
          <TrainingCyclesVisualization logs={logs} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
