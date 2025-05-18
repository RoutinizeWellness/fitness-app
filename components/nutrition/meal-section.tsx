"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coffee, Utensils, Moon, Apple, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { NutritionEntry } from "@/lib/types/nutrition"
import FoodItemCard from "./food-item-card"

interface MealSectionProps {
  mealType: string
  mealLabel: string
  entries: NutritionEntry[]
  onAddFood: (mealType: string) => void
  onEditFood: (entry: NutritionEntry) => void
  onDeleteFood: (id: string) => void
}

export default function MealSection({
  mealType,
  mealLabel,
  entries,
  onAddFood,
  onEditFood,
  onDeleteFood
}: MealSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

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

  const mealColor = getMealColor(mealType)
  
  // Calcular calorías totales para esta comida
  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-sm overflow-hidden"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${mealColor.bg} flex items-center justify-center mr-3 text-white`}>
            {renderMealIcon(mealType)}
          </div>
          <div>
            <h3 className="font-medium text-[#573353]">{mealLabel}</h3>
            <p className="text-xs text-[#573353]/70">
              {entries.length} {entries.length === 1 ? "alimento" : "alimentos"} · {totalCalories} kcal
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className={`w-8 h-8 rounded-full ${mealColor.light} flex items-center justify-center mr-2 ${mealColor.text}`}
            onClick={(e) => {
              e.stopPropagation()
              onAddFood(mealType)
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#573353]/70" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#573353]/70" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="px-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map(entry => (
                  <FoodItemCard 
                    key={entry.id} 
                    entry={entry} 
                    onDelete={onDeleteFood}
                    onEdit={onEditFood}
                  />
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-2xl ${mealColor.light} text-center`}>
                <p className="text-sm text-[#573353]/70">No hay alimentos registrados</p>
                <button 
                  className={`mt-2 text-sm font-medium ${mealColor.text}`}
                  onClick={() => onAddFood(mealType)}
                >
                  Añadir alimento
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
