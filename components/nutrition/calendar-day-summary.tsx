"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { NutritionEntry } from "@/lib/types/nutrition"
import { Coffee, Utensils, Moon, Apple } from "lucide-react"

interface CalendarDaySummaryProps {
  date: string
  entries: NutritionEntry[]
  onClick?: () => void
  isSelected?: boolean
}

export default function CalendarDaySummary({
  date,
  entries,
  onClick,
  isSelected = false
}: CalendarDaySummaryProps) {
  // Calcular totales
  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)
  
  // Contar entradas por tipo de comida
  const mealCounts = {
    desayuno: entries.filter(entry => entry.meal_type === "desayuno").length,
    almuerzo: entries.filter(entry => entry.meal_type === "almuerzo").length,
    cena: entries.filter(entry => entry.meal_type === "cena").length,
    snack: entries.filter(entry => entry.meal_type === "snack").length
  }
  
  // Determinar el día del mes
  const dayOfMonth = new Date(date).getDate()
  
  // Determinar si es hoy
  const isToday = new Date(date).toDateString() === new Date().toDateString()
  
  return (
    <motion.div 
      className={`rounded-2xl p-3 cursor-pointer transition-colors ${
        isSelected 
          ? "bg-[#FDA758] text-white" 
          : isToday 
            ? "bg-[#FFF3E0] border-2 border-[#FDA758]" 
            : "bg-white"
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <div className="text-center mb-2">
        <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-[#573353]"}`}>
          {dayOfMonth}
        </p>
      </div>
      
      {entries.length > 0 ? (
        <>
          <div className="flex justify-center space-x-1 mb-2">
            {mealCounts.desayuno > 0 && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isSelected ? "bg-white/20" : "bg-[#FDA758]"
              }`}>
                <Coffee className={`h-3 w-3 ${isSelected ? "text-white" : "text-white"}`} />
              </div>
            )}
            {mealCounts.almuerzo > 0 && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isSelected ? "bg-white/20" : "bg-[#5DE292]"
              }`}>
                <Utensils className={`h-3 w-3 ${isSelected ? "text-white" : "text-white"}`} />
              </div>
            )}
            {mealCounts.cena > 0 && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isSelected ? "bg-white/20" : "bg-[#8C80F8]"
              }`}>
                <Moon className={`h-3 w-3 ${isSelected ? "text-white" : "text-white"}`} />
              </div>
            )}
            {mealCounts.snack > 0 && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isSelected ? "bg-white/20" : "bg-[#FF7285]"
              }`}>
                <Apple className={`h-3 w-3 ${isSelected ? "text-white" : "text-white"}`} />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className={`text-xs font-medium ${isSelected ? "text-white" : "text-[#573353]"}`}>
              {totalCalories} kcal
            </p>
          </div>
        </>
      ) : (
        <div className="h-[41px] flex items-center justify-center">
          <p className={`text-xs ${isSelected ? "text-white/70" : "text-[#573353]/50"}`}>
            Sin datos
          </p>
        </div>
      )}
    </motion.div>
  )
}
