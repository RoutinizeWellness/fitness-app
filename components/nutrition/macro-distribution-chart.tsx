"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { NutritionEntry } from "@/lib/types/nutrition"
import { ProgressCircle } from "@/components/ui/progress-circle"

interface MacroDistributionChartProps {
  entries: NutritionEntry[]
  period?: "day" | "week" | "month"
  date?: string
}

export default function MacroDistributionChart({
  entries,
  period = "day",
  date = new Date().toISOString().split("T")[0]
}: MacroDistributionChartProps) {
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    proteinPercentage: 0,
    carbsPercentage: 0,
    fatPercentage: 0,
    totalCalories: 0
  })

  useEffect(() => {
    // Filtrar entradas según el período
    let filteredEntries = entries
    if (period === "day") {
      filteredEntries = entries.filter(entry => entry.date === date)
    }
    // Para week y month, se asume que las entradas ya vienen filtradas

    // Calcular totales
    const totalProtein = filteredEntries.reduce((sum, entry) => sum + entry.protein, 0)
    const totalCarbs = filteredEntries.reduce((sum, entry) => sum + entry.carbs, 0)
    const totalFat = filteredEntries.reduce((sum, entry) => sum + entry.fat, 0)
    
    // Calcular calorías por macronutriente
    const proteinCalories = totalProtein * 4
    const carbsCalories = totalCarbs * 4
    const fatCalories = totalFat * 9
    
    // Calcular calorías totales
    const totalCalories = proteinCalories + carbsCalories + fatCalories
    
    // Calcular porcentajes
    const proteinPercentage = totalCalories > 0 ? Math.round((proteinCalories / totalCalories) * 100) : 0
    const carbsPercentage = totalCalories > 0 ? Math.round((carbsCalories / totalCalories) * 100) : 0
    const fatPercentage = totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0
    
    setMacros({
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      proteinPercentage,
      carbsPercentage,
      fatPercentage,
      totalCalories
    })
  }, [entries, period, date])

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#573353] mb-4">Distribución de Macros</h3>
      
      <div className="flex justify-center mb-6">
        <ProgressCircle
          value={100}
          size="lg"
          colorScheme="gradient"
          showValue={false}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#5DE292]/20 flex items-center justify-center mx-auto mb-2">
            <motion.div 
              className="w-full h-full rounded-full bg-[#5DE292]"
              initial={{ scale: 0 }}
              animate={{ scale: macros.proteinPercentage / 100 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm font-medium text-[#573353]">{macros.proteinPercentage}%</p>
          <p className="text-xs text-[#573353]/70">Proteínas</p>
          <p className="text-xs font-medium text-[#5DE292] mt-1">{macros.protein}g</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#8C80F8]/20 flex items-center justify-center mx-auto mb-2">
            <motion.div 
              className="w-full h-full rounded-full bg-[#8C80F8]"
              initial={{ scale: 0 }}
              animate={{ scale: macros.carbsPercentage / 100 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
          <p className="text-sm font-medium text-[#573353]">{macros.carbsPercentage}%</p>
          <p className="text-xs text-[#573353]/70">Carbos</p>
          <p className="text-xs font-medium text-[#8C80F8] mt-1">{macros.carbs}g</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#FF7285]/20 flex items-center justify-center mx-auto mb-2">
            <motion.div 
              className="w-full h-full rounded-full bg-[#FF7285]"
              initial={{ scale: 0 }}
              animate={{ scale: macros.fatPercentage / 100 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <p className="text-sm font-medium text-[#573353]">{macros.fatPercentage}%</p>
          <p className="text-xs text-[#573353]/70">Grasas</p>
          <p className="text-xs font-medium text-[#FF7285] mt-1">{macros.fat}g</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#573353]/10">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#573353]/70">Calorías totales</p>
          <p className="text-lg font-semibold text-[#573353]">{macros.totalCalories} kcal</p>
        </div>
      </div>
    </div>
  )
}
