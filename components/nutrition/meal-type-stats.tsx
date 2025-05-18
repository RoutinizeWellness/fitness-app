"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NutritionEntry, MEAL_TYPES } from "@/lib/types/nutrition"
import { Coffee, Utensils, Moon, Apple } from "lucide-react"

interface MealTypeStatsProps {
  entries: NutritionEntry[]
  period?: "day" | "week" | "month"
}

interface MealStat {
  type: string
  label: string
  calories: number
  percentage: number
  count: number
}

export default function MealTypeStats({
  entries,
  period = "week"
}: MealTypeStatsProps) {
  const [mealStats, setMealStats] = useState<MealStat[]>([])
  const [totalCalories, setTotalCalories] = useState(0)

  useEffect(() => {
    // Inicializar estadísticas para cada tipo de comida
    const stats: Record<string, MealStat> = {}
    
    MEAL_TYPES.forEach(mealType => {
      stats[mealType.value] = {
        type: mealType.value,
        label: mealType.label,
        calories: 0,
        percentage: 0,
        count: 0
      }
    })
    
    // Calcular calorías y conteo por tipo de comida
    entries.forEach(entry => {
      if (stats[entry.meal_type]) {
        stats[entry.meal_type].calories += entry.calories
        stats[entry.meal_type].count += 1
      }
    })
    
    // Calcular calorías totales
    const total = Object.values(stats).reduce((sum, stat) => sum + stat.calories, 0)
    setTotalCalories(total)
    
    // Calcular porcentajes
    Object.values(stats).forEach(stat => {
      stat.percentage = total > 0 ? Math.round((stat.calories / total) * 100) : 0
    })
    
    // Convertir a array y ordenar por calorías
    const sortedStats = Object.values(stats).sort((a, b) => b.calories - a.calories)
    
    setMealStats(sortedStats)
  }, [entries])

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-5 w-5" />
      case "almuerzo":
        return <Utensils className="h-5 w-5" />
      case "cena":
        return <Moon className="h-5 w-5" />
      case "snack":
        return <Apple className="h-5 w-5" />
      default:
        return <Utensils className="h-5 w-5" />
    }
  }

  // Obtener color según el tipo de comida
  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return {
          bg: "bg-[#FDA758]",
          text: "text-[#FDA758]",
          light: "bg-[#FFF3E0]"
        }
      case "almuerzo":
        return {
          bg: "bg-[#5DE292]",
          text: "text-[#5DE292]",
          light: "bg-[#E8F5E9]"
        }
      case "cena":
        return {
          bg: "bg-[#8C80F8]",
          text: "text-[#8C80F8]",
          light: "bg-[#E3F2FD]"
        }
      case "snack":
        return {
          bg: "bg-[#FF7285]",
          text: "text-[#FF7285]",
          light: "bg-[#F3E5F5]"
        }
      default:
        return {
          bg: "bg-[#5DE292]",
          text: "text-[#5DE292]",
          light: "bg-[#E8F5E9]"
        }
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#573353] mb-4">Distribución por Comidas</h3>
      
      <div className="space-y-4">
        {mealStats.map((stat, index) => {
          const mealColor = getMealColor(stat.type)
          
          return (
            <motion.div 
              key={stat.type}
              className="bg-[#F9F9F9] rounded-2xl p-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-full ${mealColor.bg} flex items-center justify-center mr-3 text-white`}>
                  {renderMealIcon(stat.type)}
                </div>
                <div>
                  <h4 className="font-medium text-[#573353]">{stat.label}</h4>
                  <p className="text-xs text-[#573353]/70">
                    {stat.count} {stat.count === 1 ? "comida" : "comidas"} registradas
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`text-sm font-medium ${mealColor.text}`}>
                    {stat.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${mealColor.bg} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="mt-2 text-right">
                <span className="text-sm text-[#573353]">
                  {stat.calories} kcal
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#573353]/10">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#573353]/70">Calorías totales</p>
          <p className="text-lg font-semibold text-[#573353]">{totalCalories} kcal</p>
        </div>
      </div>
    </div>
  )
}
