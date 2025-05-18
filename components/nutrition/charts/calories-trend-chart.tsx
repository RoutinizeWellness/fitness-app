"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CalorieData {
  date: string
  value: number
}

interface CaloriesTrendChartProps {
  data: CalorieData[]
  startDate: string
  endDate: string
  isLoading?: boolean
  period?: "week" | "month"
}

/**
 * Componente para mostrar la tendencia de calorías en un gráfico de barras
 */
export default function CaloriesTrendChart({
  data,
  startDate,
  endDate,
  isLoading = false,
  period = "week"
}: CaloriesTrendChartProps) {
  // Memoizar el formateador de fechas para evitar recreaciones innecesarias
  const dateFormatter = useMemo(() => {
    return period === "week" 
      ? (date: string) => format(new Date(date), "EEE", { locale: es })
      : (date: string) => format(new Date(date), "dd/MM")
  }, [period])
  
  // Memoizar el formateador de etiquetas para evitar recreaciones innecesarias
  const labelFormatter = useMemo(() => {
    return (date: string) => format(new Date(date), "EEEE, d MMMM", { locale: es })
  }, [])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Calorías{period === "month" ? " (Mensual)" : ""}</CardTitle>
        <CardDescription>
          {format(new Date(startDate), "dd MMM", { locale: es })} - {format(new Date(endDate), "dd MMM", { locale: es })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={dateFormatter}
                interval={period === "month" ? 2 : 0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} kcal`, "Calorías"]}
                labelFormatter={(date) => labelFormatter(date as string)}
              />
              <Bar dataKey="value" fill="#4f46e5" name="Calorías" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
