"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface MealDistributionData {
  breakfast: number
  lunch: number
  dinner: number
  snack: number
}

interface MealDistributionChartProps {
  data: MealDistributionData
  isLoading?: boolean
}

/**
 * Componente para mostrar la distribución de calorías por comida en un gráfico circular
 */
export default function MealDistributionChart({
  data,
  isLoading = false
}: MealDistributionChartProps) {
  // Colores para los gráficos
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]
  
  // Memoizar los datos formateados para el gráfico
  const chartData = useMemo(() => {
    return [
      { name: "Desayuno", value: data.breakfast, color: COLORS[0] },
      { name: "Almuerzo", value: data.lunch, color: COLORS[1] },
      { name: "Cena", value: data.dinner, color: COLORS[2] },
      { name: "Snacks", value: data.snack, color: COLORS[3] }
    ]
  }, [data])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Comidas</CardTitle>
        <CardDescription>Porcentaje de calorías por comida</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
