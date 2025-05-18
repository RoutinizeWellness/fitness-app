"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { NutritionEntry, MEAL_TYPES } from "@/lib/types/nutrition"
import { Coffee, Utensils, Moon, Apple, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface SelectedDaySummaryProps {
  date: string
  entries: NutritionEntry[]
}

export default function SelectedDaySummary({
  date,
  entries
}: SelectedDaySummaryProps) {
  const router = useRouter()
  const [mealSummaries, setMealSummaries] = useState<Array<{
    type: string
    label: string
    entries: NutritionEntry[]
    calories: number
    icon: React.ReactNode
    color: string
  }>>([])
  
  // Calcular totales
  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0)
  const totalCarbs = entries.reduce((sum, entry) => sum + entry.carbs, 0)
  const totalFat = entries.reduce((sum, entry) => sum + entry.fat, 0)
  
  // Agrupar entradas por tipo de comida
  useEffect(() => {
    const summaries = MEAL_TYPES.map(mealType => {
      const mealEntries = entries.filter(entry => entry.meal_type === mealType.value)
      const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0)
      
      let icon
      let color
      
      switch (mealType.value) {
        case "desayuno":
          icon = <Coffee className="h-5 w-5" />
          color = "#FDA758"
          break
        case "almuerzo":
          icon = <Utensils className="h-5 w-5" />
          color = "#5DE292"
          break
        case "cena":
          icon = <Moon className="h-5 w-5" />
          color = "#8C80F8"
          break
        case "snack":
          icon = <Apple className="h-5 w-5" />
          color = "#FF7285"
          break
        default:
          icon = <Utensils className="h-5 w-5" />
          color = "#5DE292"
      }
      
      return {
        type: mealType.value,
        label: mealType.label,
        entries: mealEntries,
        calories: mealCalories,
        icon,
        color
      }
    })
    
    setMealSummaries(summaries)
  }, [entries])
  
  // Formatear fecha
  const formattedDate = format(new Date(date), "EEEE, d 'de' MMMM", { locale: es })
  
  // Verificar si es hoy
  const isToday = new Date(date).toDateString() === new Date().toDateString()
  
  // Navegar al diario de alimentos para la fecha seleccionada
  const goToFoodDiary = () => {
    router.push(`/nutrition/v2?date=${date}`)
  }
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#573353] capitalize">
            {isToday ? "Hoy" : formattedDate}
          </h3>
          <p className="text-sm text-[#573353]/70">
            {entries.length} {entries.length === 1 ? "alimento" : "alimentos"} registrados
          </p>
        </div>
        
        <button 
          className="flex items-center text-[#FDA758] font-medium text-sm"
          onClick={goToFoodDiary}
        >
          Ver detalles
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      {entries.length > 0 ? (
        <>
          {/* Resumen de macros */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#F9F9F9] rounded-xl p-2 text-center">
              <p className="text-xs text-[#573353]/70">Proteínas</p>
              <p className="text-sm font-medium text-[#573353]">{Math.round(totalProtein)}g</p>
            </div>
            <div className="bg-[#F9F9F9] rounded-xl p-2 text-center">
              <p className="text-xs text-[#573353]/70">Carbos</p>
              <p className="text-sm font-medium text-[#573353]">{Math.round(totalCarbs)}g</p>
            </div>
            <div className="bg-[#F9F9F9] rounded-xl p-2 text-center">
              <p className="text-xs text-[#573353]/70">Grasas</p>
              <p className="text-sm font-medium text-[#573353]">{Math.round(totalFat)}g</p>
            </div>
          </div>
          
          {/* Resumen por comidas */}
          <div className="space-y-3">
            {mealSummaries.map(meal => (
              <div key={meal.type} className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                  style={{ backgroundColor: meal.color }}
                >
                  {meal.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-[#573353]">{meal.label}</p>
                    <p className="text-sm text-[#573353]">{meal.calories} kcal</p>
                  </div>
                  <div className="mt-1 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: meal.color,
                        width: totalCalories > 0 ? `${(meal.calories / totalCalories) * 100}%` : "0%"
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: totalCalories > 0 ? `${(meal.calories / totalCalories) * 100}%` : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total de calorías */}
          <div className="mt-4 pt-4 border-t border-[#573353]/10 flex justify-between items-center">
            <p className="text-[#573353]/70">Total</p>
            <p className="text-lg font-semibold text-[#573353]">{totalCalories} kcal</p>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-[#573353]/70 mb-3">No hay alimentos registrados para este día</p>
          <button 
            className="px-4 py-2 bg-[#FDA758] text-white rounded-full text-sm font-medium"
            onClick={goToFoodDiary}
          >
            Añadir alimentos
          </button>
        </div>
      )}
    </div>
  )
}
