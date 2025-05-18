"use client"

import { motion } from "framer-motion"
import { NutritionEntry } from "@/lib/types/nutrition"
import { ProgressCircle } from "@/components/ui/progress-circle"

interface DailyNutritionSummaryProps {
  entries: NutritionEntry[]
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
}

export default function DailyNutritionSummary({
  entries,
  calorieGoal = 2000,
  proteinGoal = 120,
  carbsGoal = 200,
  fatGoal = 65
}: DailyNutritionSummaryProps) {
  // Calcular totales
  const totals = entries.reduce(
    (acc, entry) => {
      return {
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // Calcular porcentajes para los objetivos
  const percentages = {
    calories: Math.min(Math.round((totals.calories / calorieGoal) * 100), 100),
    protein: Math.min(Math.round((totals.protein / proteinGoal) * 100), 100),
    carbs: Math.min(Math.round((totals.carbs / carbsGoal) * 100), 100),
    fat: Math.min(Math.round((totals.fat / fatGoal) * 100), 100)
  }

  // Calcular distribución de macros (porcentajes del total de calorías)
  const macroDistribution = {
    protein: Math.round((totals.protein * 4 / (totals.calories || 1)) * 100),
    carbs: Math.round((totals.carbs * 4 / (totals.calories || 1)) * 100),
    fat: Math.round((totals.fat * 9 / (totals.calories || 1)) * 100)
  }

  // Calorías restantes
  const remainingCalories = Math.max(0, calorieGoal - totals.calories)

  return (
    <motion.div 
      className="bg-white rounded-3xl p-5 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-[#573353] mb-4">Resumen Nutricional</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-[#573353]">{totals.calories}</span>
            <span className="text-sm text-[#573353]/70 ml-1">/ {calorieGoal} kcal</span>
          </div>
          <p className="text-sm text-[#573353]/70">
            {remainingCalories > 0 
              ? `${remainingCalories} kcal restantes` 
              : "Objetivo de calorías alcanzado"}
          </p>
          
          <div className="mt-2 h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#FDA758] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentages.calories}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="ml-4">
          <ProgressCircle
            value={percentages.calories}
            size="md"
            colorScheme="orange"
            label="Completado"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#F9F9F9] rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#573353]">Proteínas</span>
            <span className="text-xs text-[#5DE292]">{macroDistribution.protein}%</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-[#573353]">{totals.protein}g</span>
            <span className="text-xs text-[#573353]/70 ml-1">/ {proteinGoal}g</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#5DE292] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentages.protein}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
        
        <div className="bg-[#F9F9F9] rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#573353]">Carbos</span>
            <span className="text-xs text-[#8C80F8]">{macroDistribution.carbs}%</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-[#573353]">{totals.carbs}g</span>
            <span className="text-xs text-[#573353]/70 ml-1">/ {carbsGoal}g</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#8C80F8] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentages.carbs}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
        
        <div className="bg-[#F9F9F9] rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#573353]">Grasas</span>
            <span className="text-xs text-[#FF7285]">{macroDistribution.fat}%</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-[#573353]">{totals.fat}g</span>
            <span className="text-xs text-[#573353]/70 ml-1">/ {fatGoal}g</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#FF7285] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentages.fat}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
