"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { NutritionEntry } from "@/lib/types/nutrition"

interface CalorieHistoryChartProps {
  entries: NutritionEntry[]
  days?: number
  goalCalories?: number
}

export default function CalorieHistoryChart({
  entries,
  days = 7,
  goalCalories = 2000
}: CalorieHistoryChartProps) {
  const [chartData, setChartData] = useState<Array<{
    date: string
    formattedDate: string
    shortDate: string
    calories: number
    percentage: number
  }>>([])

  useEffect(() => {
    // Generar fechas para los últimos 'days' días
    const today = new Date()
    const dateRange = eachDayOfInterval({
      start: subDays(today, days - 1),
      end: today
    })

    // Formatear fechas y calcular calorías por día
    const formattedData = dateRange.map(date => {
      const dateStr = date.toISOString().split("T")[0]
      
      // Filtrar entradas para esta fecha
      const dayEntries = entries.filter(entry => entry.date === dateStr)
      
      // Calcular calorías totales para este día
      const totalCalories = dayEntries.reduce((sum, entry) => sum + entry.calories, 0)
      
      // Calcular porcentaje del objetivo
      const percentage = Math.min(Math.round((totalCalories / goalCalories) * 100), 100)
      
      return {
        date: dateStr,
        formattedDate: format(date, "EEEE, d 'de' MMMM", { locale: es }),
        shortDate: format(date, "EEE d", { locale: es }),
        calories: totalCalories,
        percentage
      }
    })

    setChartData(formattedData)
  }, [entries, days, goalCalories])

  // Encontrar el valor máximo para escalar el gráfico
  const maxCalories = Math.max(
    ...chartData.map(day => day.calories),
    goalCalories
  )

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#573353] mb-4">Historial de Calorías</h3>
      
      <div className="relative h-[200px] mt-6">
        {/* Línea de objetivo */}
        <div 
          className="absolute w-full border-t border-dashed border-[#FDA758] flex justify-end items-center"
          style={{ top: `${100 - (goalCalories / maxCalories) * 100}%` }}
        >
          <span className="text-xs text-[#FDA758] font-medium bg-white px-1 -mt-2 mr-1">
            {goalCalories} kcal
          </span>
        </div>
        
        {/* Barras del gráfico */}
        <div className="flex items-end justify-between h-full">
          {chartData.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <motion.div 
                className={`w-[70%] rounded-t-lg ${
                  day.calories >= goalCalories ? "bg-[#FDA758]" : "bg-[#FDA758]/70"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${(day.calories / maxCalories) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-[#573353] capitalize">
                  {day.shortDate}
                </p>
                <p className="text-[10px] text-[#573353]/70">
                  {day.calories > 0 ? `${day.calories} kcal` : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
