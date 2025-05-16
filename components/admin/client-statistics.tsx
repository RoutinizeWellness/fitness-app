"use client"

import { useState } from "react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Progress3D } from "@/components/ui/progress-3d"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { ClientStatistics } from "@/lib/admin-client-evaluation"
import {
  BarChart,
  RefreshCw,
  Dumbbell,
  Utensils,
  Weight,
  Heart,
  Brain,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Calendar,
  Activity,
  Droplet,
  Apple,
  Beef,
  Egg
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ClientStatisticsProps {
  statistics: ClientStatistics | null
  isLoading?: boolean
  onRefresh?: () => void
}

export function ClientStatisticsComponent({
  statistics,
  isLoading = false,
  onRefresh
}: ClientStatisticsProps) {
  const [activeTab, setActiveTab] = useState("training")

  // Formatear número con 1 decimal
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "N/A"
    return num.toFixed(1)
  }

  // Obtener icono de tendencia
  const getTrendIcon = (value: number | undefined) => {
    if (value === undefined) return <Minus className="h-4 w-4 text-gray-500" />
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  // Obtener color de tendencia según el contexto
  const getTrendColor = (value: number | undefined, isPositiveGood: boolean = true) => {
    if (value === undefined) return "text-gray-500"
    if (value > 0) return isPositiveGood ? "text-green-500" : "text-red-500"
    if (value < 0) return isPositiveGood ? "text-red-500" : "text-green-500"
    return "text-gray-500"
  }

  return (
    <Card3D>
      <Card3DHeader className="flex flex-row items-center justify-between">
        <Card3DTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Estadísticas del Cliente
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
            <PulseLoader message="Cargando estadísticas..." />
          </div>
        ) : !statistics ? (
          <div className="text-center py-8">
            <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay estadísticas disponibles.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="training" className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Entrenamiento
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Utensils className="h-4 w-4 mr-2" />
                  Nutrición
                </TabsTrigger>
                <TabsTrigger value="body" className="flex items-center">
                  <Weight className="h-4 w-4 mr-2" />
                  Composición
                </TabsTrigger>
                <TabsTrigger value="wellness" className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Bienestar
                </TabsTrigger>
              </TabsList>

              {/* Pestaña de entrenamiento */}
              <TabsContent value="training" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-2">
                          <Dumbbell className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Entrenamientos</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.training_stats.total_workouts}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span className="text-gray-500">
                          {statistics.training_stats.completed_workouts} completados
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-2">
                          <Target className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Tasa de completado</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.training_stats.completion_rate}%
                      </div>
                      <Progress3D value={statistics.training_stats.completion_rate} className="h-1 mt-2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Duración media</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.training_stats.average_duration} min
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Frecuencia</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.training_stats.workout_frequency} días/sem
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Intensidad</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.training_stats.workout_intensity}/10
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Ejercicios favoritos</h3>
                  <div className="space-y-2">
                    {statistics.training_stats.favorite_exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{exercise.name}</span>
                        </div>
                        <Badge variant="outline">{exercise.count} veces</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de nutrición */}
              <TabsContent value="nutrition" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-2">
                          <Utensils className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Planes de comida</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.nutrition_stats.total_meal_plans}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span className="text-gray-500">
                          {statistics.nutrition_stats.meal_frequency} comidas/día
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Adherencia</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.nutrition_stats.adherence_rate}%
                      </div>
                      <Progress3D value={statistics.nutrition_stats.adherence_rate} className="h-1 mt-2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Beef className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Calorías</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.nutrition_stats.average_calories} kcal
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Egg className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Proteínas</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.nutrition_stats.average_protein}g
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Apple className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Carbohidratos</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.nutrition_stats.average_carbs}g
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <Droplet className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Agua</span>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      {statistics.nutrition_stats.water_intake}ml
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Alimentos más consumidos</h3>
                  <div className="space-y-2">
                    {statistics.nutrition_stats.most_consumed_foods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Apple className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{food.name}</span>
                        </div>
                        <Badge variant="outline">{food.count} veces</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de composición corporal */}
              <TabsContent value="body" className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-2">
                          <Weight className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Peso</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(statistics.body_stats.weight_change)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {formatNumber(statistics.body_stats.current_weight)} kg
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span className={getTrendColor(statistics.body_stats.weight_change, false)}>
                          {statistics.body_stats.weight_change && statistics.body_stats.weight_change > 0 ? "+" : ""}
                          {formatNumber(statistics.body_stats.weight_change)} kg
                        </span>
                        <span className="text-gray-500 ml-1">
                          ({formatNumber(statistics.body_stats.weight_change_percentage)}%)
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
                        {getTrendIcon(statistics.body_stats.body_fat_change)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {formatNumber(statistics.body_stats.current_body_fat)}%
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span className={getTrendColor(statistics.body_stats.body_fat_change, false)}>
                          {statistics.body_stats.body_fat_change && statistics.body_stats.body_fat_change > 0 ? "+" : ""}
                          {formatNumber(statistics.body_stats.body_fat_change)}%
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
                        <span className="text-sm font-medium">Masa muscular</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(statistics.body_stats.muscle_mass_change)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {formatNumber(statistics.body_stats.current_muscle_mass)} kg
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <span className={getTrendColor(statistics.body_stats.muscle_mass_change)}>
                          {statistics.body_stats.muscle_mass_change && statistics.body_stats.muscle_mass_change > 0 ? "+" : ""}
                          {formatNumber(statistics.body_stats.muscle_mass_change)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Evolución</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Peso inicial</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.initial_weight)} kg</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Peso actual</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.current_weight)} kg</span>
                      </div>
                      <Progress3D 
                        value={statistics.body_stats.initial_weight && statistics.body_stats.current_weight 
                          ? (statistics.body_stats.current_weight / statistics.body_stats.initial_weight) * 100 
                          : 0} 
                        className="h-1 mt-1" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Grasa corporal inicial</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.initial_body_fat)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Grasa corporal actual</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.current_body_fat)}%</span>
                      </div>
                      <Progress3D 
                        value={statistics.body_stats.initial_body_fat && statistics.body_stats.current_body_fat 
                          ? (statistics.body_stats.current_body_fat / statistics.body_stats.initial_body_fat) * 100 
                          : 0} 
                        className="h-1 mt-1" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Masa muscular inicial</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.initial_muscle_mass)} kg</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Masa muscular actual</span>
                        <span className="font-medium">{formatNumber(statistics.body_stats.current_muscle_mass)} kg</span>
                      </div>
                      <Progress3D 
                        value={statistics.body_stats.initial_muscle_mass && statistics.body_stats.current_muscle_mass 
                          ? (statistics.body_stats.current_muscle_mass / statistics.body_stats.initial_muscle_mass) * 100 
                          : 0} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de bienestar */}
              <TabsContent value="wellness" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-2">
                        <Moon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Sueño</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Duración</span>
                        <span className="font-medium">{statistics.wellness_stats.average_sleep_duration} horas</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Calidad</span>
                        <span className="font-medium">{statistics.wellness_stats.average_sleep_quality}/10</span>
                      </div>
                      <Progress3D 
                        value={statistics.wellness_stats.average_sleep_quality * 10} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">Estrés y recuperación</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Nivel de estrés</span>
                        <span className="font-medium">{statistics.wellness_stats.average_stress_level}/10</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Recuperación</span>
                        <span className="font-medium">{statistics.wellness_stats.average_recovery_score}/10</span>
                      </div>
                      <Progress3D 
                        value={statistics.wellness_stats.average_recovery_score * 10} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-2">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Energía</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.wellness_stats.average_energy_level}/10
                      </div>
                      <Progress3D 
                        value={statistics.wellness_stats.average_energy_level * 10} 
                        className="h-1 mt-2" 
                      />
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Meditación</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">
                        {statistics.wellness_stats.meditation_frequency} veces/sem
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Frecuencia de práctica
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">Objetivos</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tasa de logro</span>
                      <Badge>{statistics.goal_stats.achievement_rate}%</Badge>
                    </div>
                    <Progress3D value={statistics.goal_stats.achievement_rate} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="font-bold">{statistics.goal_stats.total_goals}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Logrados</div>
                        <div className="font-bold">{statistics.goal_stats.achieved_goals}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">En progreso</div>
                        <div className="font-bold">{statistics.goal_stats.in_progress_goals}</div>
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
