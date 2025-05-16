"use client"

import { useState } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Progress3D } from "@/components/ui/progress-3d"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { UserProgress } from "@/lib/admin-ai-recommendations"
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Weight,
  Dumbbell,
  Utensils,
  Moon,
  Activity,
  Heart
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface UserProgressProps {
  progress: UserProgress | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function UserProgress({
  progress,
  isLoading = false,
  onRefresh
}: UserProgressProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Obtener icono según la tendencia
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Obtener color según la tendencia y el objetivo
  const getTrendColor = (metric: string, trend: string, goal: string) => {
    if (metric === 'weight') {
      if (goal === 'weight_loss') {
        return trend === 'decreasing' ? 'text-green-500' : 'text-red-500'
      } else if (goal === 'muscle_gain') {
        return trend === 'increasing' ? 'text-green-500' : 'text-red-500'
      }
    } else if (metric === 'body_fat') {
      return trend === 'decreasing' ? 'text-green-500' : 'text-red-500'
    } else if (metric === 'muscle_mass') {
      return trend === 'increasing' ? 'text-green-500' : 'text-red-500'
    } else if (metric === 'training_adherence' || metric === 'nutrition_adherence' || metric === 'sleep_quality') {
      return trend === 'increasing' ? 'text-green-500' : 'text-red-500'
    }
    
    return 'text-gray-500'
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Obtener la última métrica
  const getLatestMetric = () => {
    if (!progress || !progress.metrics || progress.metrics.length === 0) return null
    return progress.metrics[progress.metrics.length - 1]
  }

  // Obtener la métrica anterior
  const getPreviousMetric = () => {
    if (!progress || !progress.metrics || progress.metrics.length < 2) return null
    return progress.metrics[progress.metrics.length - 2]
  }

  // Calcular el cambio entre la última métrica y la anterior
  const getMetricChange = (metricName: keyof UserProgress['metrics'][0]) => {
    const latest = getLatestMetric()
    const previous = getPreviousMetric()
    
    if (!latest || !previous || latest[metricName] === undefined || previous[metricName] === undefined) {
      return { value: 0, percentage: 0 }
    }
    
    const value = (latest[metricName] as number) - (previous[metricName] as number)
    const percentage = previous[metricName] !== 0 ? (value / (previous[metricName] as number)) * 100 : 0
    
    return { value, percentage }
  }

  return (
    <Card3D>
      <Card3DHeader className="flex flex-row items-center justify-between">
        <Card3DTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Progreso del Usuario
        </Card3DTitle>
        {onRefresh && (
          <Button3D variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button3D>
        )}
      </Card3DHeader>
      <Card3DContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <PulseLoader message="Cargando datos de progreso..." />
          </div>
        ) : !progress ? (
          <div className="text-center py-8">
            <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay datos de progreso disponibles.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progreso general */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Progreso hacia el objetivo</h3>
                <span className="text-sm font-bold">{progress.goal_progress}%</span>
              </div>
              <Progress3D value={progress.goal_progress} className="h-2" />
            </div>

            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="body">Composición</TabsTrigger>
                <TabsTrigger value="habits">Hábitos</TabsTrigger>
              </TabsList>

              {/* Pestaña de resumen */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Weight className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Peso</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.weight)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.weight || 0} kg
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('weight').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-green-500" />
                        )}
                        <span className={
                          getMetricChange('weight').value > 0 ? 'text-red-500' : 'text-green-500'
                        }>
                          {Math.abs(getMetricChange('weight').value).toFixed(1)} kg
                        </span>
                        <span className="text-gray-500 ml-1">
                          ({Math.abs(getMetricChange('weight').percentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-2">
                          <Dumbbell className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Entrenamiento</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.training_adherence)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.training_frequency || 0} días/sem
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('training_frequency').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                        ) : getMetricChange('training_frequency').value < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 mr-1 text-gray-500" />
                        )}
                        <span className={
                          getMetricChange('training_frequency').value > 0 ? 'text-green-500' : 
                          getMetricChange('training_frequency').value < 0 ? 'text-red-500' : 'text-gray-500'
                        }>
                          {Math.abs(getMetricChange('training_frequency').value)} días
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-2">
                          <Utensils className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Nutrición</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.nutrition_adherence)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.nutrition_adherence || 0}%
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('nutrition_adherence').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                        ) : getMetricChange('nutrition_adherence').value < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 mr-1 text-gray-500" />
                        )}
                        <span className={
                          getMetricChange('nutrition_adherence').value > 0 ? 'text-green-500' : 
                          getMetricChange('nutrition_adherence').value < 0 ? 'text-red-500' : 'text-gray-500'
                        }>
                          {Math.abs(getMetricChange('nutrition_adherence').value)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Moon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Sueño</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.sleep_quality)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.sleep_duration || 0} h
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('sleep_duration').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                        ) : getMetricChange('sleep_duration').value < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 mr-1 text-gray-500" />
                        )}
                        <span className={
                          getMetricChange('sleep_duration').value > 0 ? 'text-green-500' : 
                          getMetricChange('sleep_duration').value < 0 ? 'text-red-500' : 'text-gray-500'
                        }>
                          {Math.abs(getMetricChange('sleep_duration').value)} h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Historial de métricas</h3>
                  <div className="space-y-2">
                    {progress.metrics.slice().reverse().map((metric, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(metric.last_updated)}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Weight className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{metric.weight} kg</span>
                          </div>
                          <div className="flex items-center">
                            <Dumbbell className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{metric.training_frequency} días</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de composición corporal */}
              <TabsContent value="body" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Weight className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Peso</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.weight)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.weight || 0} kg
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('weight').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-green-500" />
                        )}
                        <span className={
                          getMetricChange('weight').value > 0 ? 'text-red-500' : 'text-green-500'
                        }>
                          {Math.abs(getMetricChange('weight').value).toFixed(1)} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-full mr-2">
                          <Activity className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium">Grasa corporal</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.body_fat)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.body_fat || 0}%
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('body_fat').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-green-500" />
                        )}
                        <span className={
                          getMetricChange('body_fat').value > 0 ? 'text-red-500' : 'text-green-500'
                        }>
                          {Math.abs(getMetricChange('body_fat').value).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-2">
                          <Dumbbell className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Masa muscular</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(progress.trend.muscle_mass)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.muscle_mass || 0} kg
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {getMetricChange('muscle_mass').value > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                        )}
                        <span className={
                          getMetricChange('muscle_mass').value > 0 ? 'text-green-500' : 'text-red-500'
                        }>
                          {Math.abs(getMetricChange('muscle_mass').value).toFixed(1)} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-2">
                          <Heart className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">IMC</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {getLatestMetric()?.weight && getLatestMetric()?.weight / Math.pow(1.75, 2) || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Índice de Masa Corporal
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de hábitos */}
              <TabsContent value="habits" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-2">
                          <Dumbbell className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Entrenamiento</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Frecuencia</span>
                        <span className="font-medium">{getLatestMetric()?.training_frequency || 0} días/sem</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Intensidad</span>
                        <span className="font-medium">{getLatestMetric()?.training_intensity || 0}/10</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Minutos activos</span>
                        <span className="font-medium">{getLatestMetric()?.active_minutes || 0} min/día</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-2">
                          <Utensils className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Nutrición</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Adherencia</span>
                        <span className="font-medium">{getLatestMetric()?.nutrition_adherence || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Calorías</span>
                        <span className="font-medium">{getLatestMetric()?.calories_intake || 0} kcal</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Proteínas</span>
                        <span className="font-medium">{getLatestMetric()?.protein_intake || 0}g</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Moon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Sueño</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Duración</span>
                        <span className="font-medium">{getLatestMetric()?.sleep_duration || 0} horas</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Calidad</span>
                        <span className="font-medium">{getLatestMetric()?.sleep_quality || 0}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Actividad diaria</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Pasos</span>
                        <span className="font-medium">{getLatestMetric()?.steps || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Agua</span>
                        <span className="font-medium">{getLatestMetric()?.water_intake || 0} ml</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Estrés</span>
                        <span className="font-medium">{getLatestMetric()?.stress_level || 0}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card3DContent>
    </Card3D>
  )
}
