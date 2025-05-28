"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Apple, Beef, Wheat, Droplets, ChevronRight, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { allSpanishFoods, FOOD_CATEGORIES } from "@/lib/data/spanish-foods-database"
import { FoodItem } from "@/lib/types/nutrition"

interface FoodCategoriesSectionProps {
  className?: string
  onFoodSelect?: (food: FoodItem) => void
}

export function FoodCategoriesSection({ className = "", onFoodSelect }: FoodCategoriesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Contar alimentos por categoría
  const categoryStats = allSpanishFoods.reduce((acc, food) => {
    acc[food.category] = (acc[food.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Configuración de categorías con iconos y colores
  const categoryConfig = {
    [FOOD_CATEGORIES.FRUITS]: {
      name: "Frutas",
      icon: Apple,
      color: "#FEA800",
      bgColor: "#FEA800/10"
    },
    [FOOD_CATEGORIES.VEGETABLES]: {
      name: "Verduras",
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#5DE292",
      bgColor: "#5DE292/10"
    },
    [FOOD_CATEGORIES.PROTEINS]: {
      name: "Proteínas",
      icon: Beef,
      color: "#FF6767",
      bgColor: "#FF6767/10"
    },
    [FOOD_CATEGORIES.GRAINS]: {
      name: "Cereales",
      icon: Wheat,
      color: "#B1AFE9",
      bgColor: "#B1AFE9/10"
    },
    [FOOD_CATEGORIES.DAIRY]: {
      name: "Lácteos",
      icon: Droplets,
      color: "#1B237E",
      bgColor: "#1B237E/10"
    },
    [FOOD_CATEGORIES.BEVERAGES]: {
      name: "Bebidas",
      icon: Droplets,
      color: "#573353",
      bgColor: "#573353/10"
    }
  }

  // Filtrar alimentos por categoría y búsqueda
  const getFilteredFoods = (category: string) => {
    let foods = allSpanishFoods.filter(food => food.category === category)
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(query) ||
        (food.brand && food.brand.toLowerCase().includes(query)) ||
        (food.region && food.region.toLowerCase().includes(query))
      )
    }
    
    return foods
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
    setSearchQuery("")
  }

  const handleFoodClick = (food: FoodItem) => {
    if (onFoodSelect) {
      onFoodSelect(food)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[#573353]">Categorías de Alimentos</h2>
        <Badge variant="outline" className="text-xs">
          {allSpanishFoods.length} alimentos disponibles
        </Badge>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(categoryConfig).map(([categoryKey, config]) => {
          const count = categoryStats[categoryKey] || 0
          const IconComponent = config.icon

          return (
            <motion.div
              key={categoryKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm"
                onClick={() => handleCategoryClick(categoryKey)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <h3 className="text-[#573353] font-semibold text-base mb-1">
                    {config.name}
                  </h3>
                  <p className="text-[#573353]/70 text-sm">
                    {count} elementos
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Food Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-[#1B237E]">
              {selectedCategory && categoryConfig[selectedCategory]?.name}
            </DialogTitle>
            <DialogDescription>
              Selecciona un alimento para añadir a tu registro
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Food List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {selectedCategory && getFilteredFoods(selectedCategory).map((food) => (
              <motion.div
                key={food.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card 
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-sm"
                  onClick={() => handleFoodClick(food)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#573353] text-sm">
                          {food.name}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {food.calories} kcal
                          </Badge>
                          <span className="text-xs text-gray-500">
                            por {food.servingSize}{food.servingUnit}
                          </span>
                        </div>

                        {/* Macros */}
                        <div className="flex gap-3 mt-2 text-xs text-gray-600">
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>G: {food.fat}g</span>
                        </div>

                        {/* Additional info */}
                        <div className="flex gap-2 mt-2">
                          {food.brand && (
                            <Badge variant="secondary" className="text-xs">
                              {food.brand}
                            </Badge>
                          )}
                          {food.region && (
                            <Badge variant="outline" className="text-xs">
                              {food.region}
                            </Badge>
                          )}
                          {food.supermarket && (
                            <Badge variant="outline" className="text-xs">
                              {food.supermarket}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {selectedCategory && getFilteredFoods(selectedCategory).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'No se encontraron alimentos' : 'No hay alimentos en esta categoría'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-xs text-gray-500">
              {selectedCategory && getFilteredFoods(selectedCategory).length} alimentos
            </span>
            <SafeClientButton 
              variant="outline" 
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Cerrar
            </SafeClientButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
