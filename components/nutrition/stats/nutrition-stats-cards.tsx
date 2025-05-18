"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NutritionStatsCardsProps {
  averageCalories: number
  caloriesGoal?: number
  consistencyScore: number
  streakDays: number
  topFoods: Array<{
    id: string
    name: string
    count: number
  }>
  isLoading?: boolean
}

/**
 * Componente para mostrar tarjetas con estadísticas nutricionales
 */
export default function NutritionStatsCards({
  averageCalories,
  caloriesGoal,
  consistencyScore,
  streakDays,
  topFoods,
  isLoading = false
}: NutritionStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Promedio de calorías */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Promedio de Calorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageCalories} kcal</div>
          <p className="text-xs text-gray-500">
            {caloriesGoal
              ? `${Math.round((averageCalories / caloriesGoal) * 100)}% de tu objetivo`
              : "Sin objetivo establecido"}
          </p>
        </CardContent>
      </Card>

      {/* Puntuación de consistencia */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Consistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{consistencyScore}/100</div>
          <p className="text-xs text-gray-500">Racha actual: {streakDays} días</p>
        </CardContent>
      </Card>

      {/* Alimentos más consumidos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Alimentos Más Consumidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            {topFoods.slice(0, 3).map((food) => (
              <li key={food.id} className="flex justify-between">
                <span>{food.name}</span>
                <span className="text-gray-500">{food.count}x</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
