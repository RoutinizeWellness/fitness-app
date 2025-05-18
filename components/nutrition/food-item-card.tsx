"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Utensils, Coffee, Apple, Moon, Trash2, MoreHorizontal, Edit } from "lucide-react"
import { NutritionEntry } from "@/lib/types/nutrition"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface FoodItemCardProps {
  entry: NutritionEntry
  onDelete: (id: string) => void
  onEdit: (entry: NutritionEntry) => void
}

export default function FoodItemCard({ entry, onDelete, onEdit }: FoodItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
          bg: "bg-[#FFF3E0]",
          icon: "bg-[#FDA758]",
          text: "text-[#FDA758]"
        }
      case "almuerzo":
        return {
          bg: "bg-[#E8F5E9]",
          icon: "bg-[#5DE292]",
          text: "text-[#5DE292]"
        }
      case "cena":
        return {
          bg: "bg-[#E3F2FD]",
          icon: "bg-[#8C80F8]",
          text: "text-[#8C80F8]"
        }
      case "snack":
        return {
          bg: "bg-[#F3E5F5]",
          icon: "bg-[#FF7285]",
          text: "text-[#FF7285]"
        }
      default:
        return {
          bg: "bg-[#E8F5E9]",
          icon: "bg-[#5DE292]",
          text: "text-[#5DE292]"
        }
    }
  }

  const mealColor = getMealColor(entry.meal_type)

  return (
    <motion.div 
      className={`rounded-2xl ${mealColor.bg} overflow-hidden shadow-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${mealColor.icon} flex items-center justify-center mr-3 text-white`}>
              {renderMealIcon(entry.meal_type)}
            </div>
            <div>
              <h3 className="font-medium text-[#573353]">{entry.food_name}</h3>
              <p className="text-xs text-[#573353]/70">
                {entry.calories} kcal
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
                <MoreHorizontal className="h-5 w-5 text-[#573353]/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="h-4 w-4 mr-2" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(entry.id)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isExpanded && (
          <motion.div 
            className="mt-3 pt-3 border-t border-[#573353]/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/50 rounded-xl p-2 text-center">
                <p className="text-xs text-[#573353]/70">Proteínas</p>
                <p className="text-sm font-medium text-[#573353]">{entry.protein}g</p>
              </div>
              <div className="bg-white/50 rounded-xl p-2 text-center">
                <p className="text-xs text-[#573353]/70">Carbos</p>
                <p className="text-sm font-medium text-[#573353]">{entry.carbs}g</p>
              </div>
              <div className="bg-white/50 rounded-xl p-2 text-center">
                <p className="text-xs text-[#573353]/70">Grasas</p>
                <p className="text-sm font-medium text-[#573353]">{entry.fat}g</p>
              </div>
            </div>
            
            {entry.notes && (
              <div className="mt-2 text-xs text-[#573353]/70 bg-white/50 p-2 rounded-xl">
                <p className="font-medium text-[#573353] mb-1">Notas:</p>
                <p>{entry.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
