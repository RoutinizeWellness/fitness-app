"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NutritionEntry } from "@/lib/types/nutrition"
import { Coffee, Utensils, Moon, Apple } from "lucide-react"

interface TopFoodsStatsProps {
  entries: NutritionEntry[]
  period?: "day" | "week" | "month"
  limit?: number
}

interface FoodStat {
  name: string
  count: number
  totalCalories: number
  mealTypes: string[]
}

export default function TopFoodsStats({
  entries,
  period = "week",
  limit = 5
}: TopFoodsStatsProps) {
  const [topFoods, setTopFoods] = useState<FoodStat[]>([])

  useEffect(() => {
    // Agrupar entradas por nombre de alimento
    const foodStats: Record<string, FoodStat> = {}
    
    entries.forEach(entry => {
      if (!foodStats[entry.food_name]) {
        foodStats[entry.food_name] = {
          name: entry.food_name,
          count: 0,
          totalCalories: 0,
          mealTypes: []
        }
      }
      
      foodStats[entry.food_name].count += 1
      foodStats[entry.food_name].totalCalories += entry.calories
      
      if (!foodStats[entry.food_name].mealTypes.includes(entry.meal_type)) {
        foodStats[entry.food_name].mealTypes.push(entry.meal_type)
      }
    })
    
    // Convertir a array y ordenar por frecuencia
    const sortedFoods = Object.values(foodStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
    
    setTopFoods(sortedFoods)
  }, [entries, limit])

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-4 w-4" />
      case "almuerzo":
        return <Utensils className="h-4 w-4" />
      case "cena":
        return <Moon className="h-4 w-4" />
      case "snack":
        return <Apple className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  // Obtener color según el tipo de comida
  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return "bg-[#FDA758] text-white"
      case "almuerzo":
        return "bg-[#5DE292] text-white"
      case "cena":
        return "bg-[#8C80F8] text-white"
      case "snack":
        return "bg-[#FF7285] text-white"
      default:
        return "bg-[#5DE292] text-white"
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#573353] mb-4">Alimentos Más Frecuentes</h3>
      
      {topFoods.length > 0 ? (
        <div className="space-y-4">
          {topFoods.map((food, index) => (
            <motion.div 
              key={food.name}
              className="bg-[#F9F9F9] rounded-2xl p-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-[#573353]">{food.name}</h4>
                <span className="text-xs bg-[#573353]/10 text-[#573353] px-2 py-1 rounded-full">
                  {food.count}x
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {food.mealTypes.map(type => (
                    <div 
                      key={type} 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${getMealColor(type)}`}
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                    >
                      {renderMealIcon(type)}
                    </div>
                  ))}
                </div>
                
                <span className="text-sm text-[#573353]/70">
                  {Math.round(food.totalCalories / food.count)} kcal/porción
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#573353]/70">
          <p>No hay suficientes datos para mostrar estadísticas</p>
        </div>
      )}
    </div>
  )
}
