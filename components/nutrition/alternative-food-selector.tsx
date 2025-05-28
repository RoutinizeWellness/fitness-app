"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ArrowUpDown, CheckCircle, AlertTriangle, Info, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { allSpanishFoods } from "@/lib/data/spanish-foods-database"
import { FoodItem } from "@/lib/types/nutrition"

interface AlternativeFoodSelectorProps {
  originalFood: FoodItem
  onFoodSelect: (food: FoodItem) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

interface FoodComparison {
  food: FoodItem
  caloriesDiff: number
  proteinDiff: number
  carbsDiff: number
  fatDiff: number
  similarityScore: number
  nutritionalMatch: 'excellent' | 'good' | 'fair' | 'poor'
}

export function AlternativeFoodSelector({ 
  originalFood, 
  onFoodSelect, 
  isOpen, 
  onOpenChange,
  className = "" 
}: AlternativeFoodSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [alternatives, setAlternatives] = useState<FoodComparison[]>([])
  const [filteredAlternatives, setFilteredAlternatives] = useState<FoodComparison[]>([])
  const [sortBy, setSortBy] = useState<'similarity' | 'calories' | 'protein'>('similarity')

  // Calcular alternativas cuando se abre el modal
  useEffect(() => {
    if (isOpen && originalFood) {
      calculateAlternatives()
    }
  }, [isOpen, originalFood])

  // Filtrar alternativas por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlternatives(alternatives)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = alternatives.filter(alt => 
        alt.food.name.toLowerCase().includes(query) ||
        (alt.food.brand && alt.food.brand.toLowerCase().includes(query)) ||
        (alt.food.category && alt.food.category.toLowerCase().includes(query))
      )
      setFilteredAlternatives(filtered)
    }
  }, [searchQuery, alternatives])

  const calculateAlternatives = () => {
    const comparisons: FoodComparison[] = []

    allSpanishFoods.forEach(food => {
      // No incluir el mismo alimento
      if (food.id === originalFood.id) return

      // Calcular diferencias nutricionales
      const caloriesDiff = Math.abs(food.calories - originalFood.calories)
      const proteinDiff = Math.abs(food.protein - originalFood.protein)
      const carbsDiff = Math.abs(food.carbs - originalFood.carbs)
      const fatDiff = Math.abs(food.fat - originalFood.fat)

      // Calcular puntuación de similitud (menor es mejor)
      const caloriesWeight = 0.4
      const proteinWeight = 0.3
      const carbsWeight = 0.2
      const fatWeight = 0.1

      const similarityScore = 
        (caloriesDiff / originalFood.calories) * caloriesWeight +
        (proteinDiff / Math.max(originalFood.protein, 1)) * proteinWeight +
        (carbsDiff / Math.max(originalFood.carbs, 1)) * carbsWeight +
        (fatDiff / Math.max(originalFood.fat, 1)) * fatWeight

      // Determinar calidad de coincidencia nutricional
      let nutritionalMatch: 'excellent' | 'good' | 'fair' | 'poor'
      if (similarityScore < 0.15) nutritionalMatch = 'excellent'
      else if (similarityScore < 0.3) nutritionalMatch = 'good'
      else if (similarityScore < 0.5) nutritionalMatch = 'fair'
      else nutritionalMatch = 'poor'

      comparisons.push({
        food,
        caloriesDiff,
        proteinDiff,
        carbsDiff,
        fatDiff,
        similarityScore,
        nutritionalMatch
      })
    })

    // Ordenar por similitud (mejores primero)
    comparisons.sort((a, b) => a.similarityScore - b.similarityScore)

    // Tomar solo los mejores 20 resultados
    setAlternatives(comparisons.slice(0, 20))
  }

  const sortAlternatives = (criteria: 'similarity' | 'calories' | 'protein') => {
    setSortBy(criteria)
    const sorted = [...filteredAlternatives]

    switch (criteria) {
      case 'similarity':
        sorted.sort((a, b) => a.similarityScore - b.similarityScore)
        break
      case 'calories':
        sorted.sort((a, b) => a.caloriesDiff - b.caloriesDiff)
        break
      case 'protein':
        sorted.sort((a, b) => a.proteinDiff - b.proteinDiff)
        break
    }

    setFilteredAlternatives(sorted)
  }

  const getMatchColor = (match: string) => {
    switch (match) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMatchText = (match: string) => {
    switch (match) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Buena'
      case 'fair': return 'Regular'
      case 'poor': return 'Pobre'
      default: return 'Desconocida'
    }
  }

  const handleFoodSelect = (food: FoodItem) => {
    onFoodSelect(food)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#1B237E] flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Alternativas para {originalFood.name}
          </DialogTitle>
          <DialogDescription>
            Encuentra alimentos con perfiles nutricionales similares
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alimento original */}
          <Card className="bg-[#1B237E]/5 border-[#1B237E]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#1B237E]">Alimento Original</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-[#573353]">{originalFood.name}</h3>
                  <p className="text-sm text-gray-600">
                    {originalFood.servingSize}{originalFood.servingUnit}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-sm font-medium text-[#FEA800]">{originalFood.calories}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#FF6767]">{originalFood.protein}g</div>
                    <div className="text-xs text-gray-500">Proteína</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#B1AFE9]">{originalFood.carbs}g</div>
                    <div className="text-xs text-gray-500">Carbos</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#573353]">{originalFood.fat}g</div>
                    <div className="text-xs text-gray-500">Grasas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles de búsqueda y ordenación */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar alternativas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <SafeClientButton
                variant={sortBy === 'similarity' ? 'accent' : 'outline'}
                size="sm"
                onClick={() => sortAlternatives('similarity')}
              >
                Similitud
              </SafeClientButton>
              <SafeClientButton
                variant={sortBy === 'calories' ? 'accent' : 'outline'}
                size="sm"
                onClick={() => sortAlternatives('calories')}
              >
                Calorías
              </SafeClientButton>
              <SafeClientButton
                variant={sortBy === 'protein' ? 'accent' : 'outline'}
                size="sm"
                onClick={() => sortAlternatives('protein')}
              >
                Proteína
              </SafeClientButton>
            </div>
          </div>

          {/* Lista de alternativas */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredAlternatives.map((comparison, index) => (
              <motion.div
                key={comparison.food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm"
                  onClick={() => handleFoodSelect(comparison.food)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-[#573353]">
                            {comparison.food.name}
                          </h4>
                          <Badge className={`text-xs ${getMatchColor(comparison.nutritionalMatch)}`}>
                            {getMatchText(comparison.nutritionalMatch)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3 text-center mb-3">
                          <div>
                            <div className="text-sm font-medium text-[#FEA800]">
                              {comparison.food.calories}
                            </div>
                            <div className="text-xs text-gray-500">
                              {comparison.caloriesDiff > 0 ? '+' : ''}{comparison.food.calories - originalFood.calories} kcal
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#FF6767]">
                              {comparison.food.protein}g
                            </div>
                            <div className="text-xs text-gray-500">
                              {comparison.proteinDiff > 0 ? '+' : ''}{(comparison.food.protein - originalFood.protein).toFixed(1)}g
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#B1AFE9]">
                              {comparison.food.carbs}g
                            </div>
                            <div className="text-xs text-gray-500">
                              {comparison.carbsDiff > 0 ? '+' : ''}{(comparison.food.carbs - originalFood.carbs).toFixed(1)}g
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#573353]">
                              {comparison.food.fat}g
                            </div>
                            <div className="text-xs text-gray-500">
                              {comparison.fatDiff > 0 ? '+' : ''}{(comparison.food.fat - originalFood.fat).toFixed(1)}g
                            </div>
                          </div>
                        </div>

                        {/* Barra de similitud */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Similitud:</span>
                          <Progress 
                            value={Math.max(0, 100 - (comparison.similarityScore * 100))} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs font-medium text-[#1B237E]">
                            {Math.round(Math.max(0, 100 - (comparison.similarityScore * 100)))}%
                          </span>
                        </div>

                        {/* Información adicional */}
                        <div className="flex gap-2 mt-2">
                          {comparison.food.brand && (
                            <Badge variant="outline" className="text-xs">
                              {comparison.food.brand}
                            </Badge>
                          )}
                          {comparison.food.category && (
                            <Badge variant="secondary" className="text-xs">
                              {comparison.food.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CheckCircle className="h-5 w-5 text-[#1B237E] ml-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredAlternatives.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? 'No se encontraron alternativas que coincidan con tu búsqueda' : 'No se encontraron alternativas'}
                </p>
              </div>
            )}
          </div>

          {/* Footer con información */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="h-4 w-4" />
              <span>Las alternativas se ordenan por similitud nutricional</span>
            </div>
            <SafeClientButton 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </SafeClientButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
