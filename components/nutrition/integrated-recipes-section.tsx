"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChefHat, Clock, Users, Star, Heart, BookOpen, Filter, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import spanishRecipes from "@/lib/data/spanish-recipes-database"

interface Recipe {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'fácil' | 'medio' | 'difícil'
  prepTime: number
  cookTime: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: Array<{
    name: string
    amount: number
    unit: string
  }>
  instructions: string[]
  tags: string[]
  region?: string
  image?: string
}

interface IntegratedRecipesSectionProps {
  onRecipeSelect?: (recipe: Recipe) => void
  className?: string
}

export function IntegratedRecipesSection({
  onRecipeSelect,
  className = ""
}: IntegratedRecipesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])

  // Categorías disponibles
  const categories = [
    { id: "all", name: "Todas", icon: BookOpen },
    { id: "desayuno", name: "Desayuno", icon: ChefHat },
    { id: "almuerzo", name: "Almuerzo", icon: ChefHat },
    { id: "cena", name: "Cena", icon: ChefHat },
    { id: "snack", name: "Snacks", icon: Heart },
    { id: "postre", name: "Postres", icon: Star }
  ]

  // Filtrar recetas
  useEffect(() => {
    // Asegurar que spanishRecipes existe y es un array
    if (!spanishRecipes || !Array.isArray(spanishRecipes)) {
      setFilteredRecipes([])
      return
    }

    let filtered = [...spanishRecipes]

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (recipe.region && recipe.region.toLowerCase().includes(query))
      )
    }

    setFilteredRecipes(filtered)
  }, [selectedCategory, searchQuery])

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsRecipeDialogOpen(true)
  }

  const handleRecipeSelect = (recipe: Recipe) => {
    if (onRecipeSelect) {
      onRecipeSelect(recipe)
    }
    setIsRecipeDialogOpen(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil': return 'bg-green-100 text-green-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'difícil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[#573353]">Recetas Saludables</h2>
        <Badge variant="outline" className="text-xs">
          {(filteredRecipes || []).length} recetas
        </Badge>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <SafeClientButton
                key={category.id}
                variant={selectedCategory === category.id ? "accent" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <IconComponent className="h-3 w-3" />
                {category.name}
              </SafeClientButton>
            )
          })}
        </div>
      </div>

      {/* Lista de recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(filteredRecipes || []).slice(0, 6).map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm"
              onClick={() => handleRecipeClick(recipe)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header de la receta */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-[#573353] text-sm line-clamp-1">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                    <ChefHat className="h-4 w-4 text-[#FEA800] ml-2" />
                  </div>

                  {/* Información nutricional */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-sm font-medium text-[#FEA800]">
                        {recipe.calories}
                      </div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#FF6767]">
                        {recipe.protein}g
                      </div>
                      <div className="text-xs text-gray-500">Prot</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#B1AFE9]">
                        {recipe.carbs}g
                      </div>
                      <div className="text-xs text-gray-500">Carbs</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#573353]">
                        {recipe.fat}g
                      </div>
                      <div className="text-xs text-gray-500">Grasas</div>
                    </div>
                  </div>

                  {/* Metadatos */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prepTime + recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings} pers
                      </div>
                    </div>
                    <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap">
                    {recipe.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.region && (
                      <Badge variant="outline" className="text-xs">
                        {recipe.region}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ver más */}
      {(filteredRecipes || []).length > 6 && (
        <div className="text-center">
          <SafeClientButton variant="outline" size="sm">
            Ver más recetas ({(filteredRecipes || []).length - 6} restantes)
          </SafeClientButton>
        </div>
      )}

      {/* Modal de receta detallada */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1B237E] flex items-center">
                  <ChefHat className="h-5 w-5 mr-2" />
                  {selectedRecipe.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedRecipe.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 overflow-y-auto">
                {/* Información nutricional */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Información Nutricional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-[#FEA800]">
                          {selectedRecipe.calories}
                        </div>
                        <div className="text-xs text-gray-600">Calorías</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#FF6767]">
                          {selectedRecipe.protein}g
                        </div>
                        <div className="text-xs text-gray-600">Proteína</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#B1AFE9]">
                          {selectedRecipe.carbs}g
                        </div>
                        <div className="text-xs text-gray-600">Carbohidratos</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#573353]">
                          {selectedRecipe.fat}g
                        </div>
                        <div className="text-xs text-gray-600">Grasas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="ingredients" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
                    <TabsTrigger value="instructions">Preparación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ingredients" className="space-y-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Ingredientes para {selectedRecipe.servings} personas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedRecipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span className="text-sm">{ingredient.name}</span>
                              <span className="text-sm font-medium">
                                {ingredient.amount} {ingredient.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="instructions" className="space-y-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Instrucciones</CardTitle>
                        <CardDescription>
                          Tiempo de preparación: {selectedRecipe.prepTime} min |
                          Tiempo de cocción: {selectedRecipe.cookTime} min
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedRecipe.instructions.map((instruction, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-[#1B237E] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700 flex-1">
                                {instruction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t">
                  <SafeClientButton
                    variant="accent"
                    className="flex-1"
                    onClick={() => handleRecipeSelect(selectedRecipe)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Añadir a Favoritas
                  </SafeClientButton>
                  <SafeClientButton
                    variant="outline"
                    onClick={() => setIsRecipeDialogOpen(false)}
                  >
                    Cerrar
                  </SafeClientButton>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
