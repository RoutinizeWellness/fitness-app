"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface MacroData {
  name: string
  value: number
  color: string
}

interface MacroDistributionChartProps {
  data: {
    protein: number
    carbs: number
    fat: number
  }
  averageProtein: number
  averageCarbs: number
  averageFat: number
  isLoading?: boolean
}

/**
 * Componente para mostrar la distribución de macronutrientes en un gráfico circular
 */
export default function MacroDistributionChart({
  data,
  averageProtein,
  averageCarbs,
  averageFat,
  isLoading = false
}: MacroDistributionChartProps) {
  // Memoizar los datos formateados para el gráfico
  const chartData = useMemo(() => {
    return [
      { name: "Proteínas", value: data.protein, color: "#4f46e5" },
      { name: "Carbohidratos", value: data.carbs, color: "#10b981" },
      { name: "Grasas", value: data.fat, color: "#f59e0b" }
    ]
  }, [data])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Macronutrientes</CardTitle>
        <CardDescription>Promedio semanal</CardDescription>
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
        <div className="mt-2 text-sm">
          <p>Proteínas: {averageProtein}g ({data.protein}%)</p>
          <p>Carbohidratos: {averageCarbs}g ({data.carbs}%)</p>
          <p>Grasas: {averageFat}g ({data.fat}%)</p>
        </div>
      </CardContent>
    </Card>
  )
}
