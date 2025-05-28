"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Target, ChefHat, Plus, Edit, Trash2, Copy, BookOpen, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import spanishRecipes from "@/lib/data/spanish-recipes-database"
import { format, addDays, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"

interface MealPlan {
  id: string
  date: string
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'snack'
  recipeId?: string
  customMeal?: {
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  notes?: string
  completed?: boolean
}

interface DietPlan {
  id: string
  name: string
  type: 'mediterraneo' | 'keto' | 'vegetariano' | 'vegano' | 'perdida_peso' | 'ganancia_muscular' | 'diabetico'
  description: string
  dailyCalories: number
  macroDistribution: {
    protein: number
    carbs: number
    fat: number
  }
  restrictions: string[]
  duration: number // días
}

interface UnifiedMealPlannerProps {
  onMealPlanChange?: (plans: MealPlan[]) => void
  className?: string
}

export function UnifiedMealPlanner({
  onMealPlanChange,
  className = ""
}: UnifiedMealPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null)
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  // Planes de dieta predefinidos
  const dietPlans: DietPlan[] = [
    {
      id: 'mediterraneo',
      name: 'Dieta Mediterránea',
      type: 'mediterraneo',
      description: 'Rica en aceite de oliva, pescado, verduras y frutas',
      dailyCalories: 2000,
      macroDistribution: { protein: 20, carbs: 50, fat: 30 },
      restrictions: [],
      duration: 30
    },
    {
      id: 'keto',
      name: 'Dieta Cetogénica',
      type: 'keto',
      description: 'Muy baja en carbohidratos, alta en grasas saludables',
      dailyCalories: 1800,
      macroDistribution: { protein: 25, carbs: 5, fat: 70 },
      restrictions: ['alto_carbs'],
      duration: 21
    },
    {
      id: 'vegetariano',
      name: 'Dieta Vegetariana',
      type: 'vegetariano',
      description: 'Sin carne ni pescado, rica en proteínas vegetales',
      dailyCalories: 1900,
      macroDistribution: { protein: 18, carbs: 55, fat: 27 },
      restrictions: ['carne', 'pescado'],
      duration: 30
    },
    {
      id: 'perdida_peso',
      name: 'Plan de Pérdida de Peso',
      type: 'perdida_peso',
      description: 'Déficit calórico controlado con alimentos saciantes',
      dailyCalories: 1500,
      macroDistribution: { protein: 30, carbs: 40, fat: 30 },
      restrictions: ['alto_calorias'],
      duration: 60
    },
    {
      id: 'ganancia_muscular',
      name: 'Plan de Ganancia Muscular',
      type: 'ganancia_muscular',
      description: 'Alto en proteínas y calorías para desarrollo muscular',
      dailyCalories: 2500,
      macroDistribution: { protein: 30, carbs: 45, fat: 25 },
      restrictions: [],
      duration: 90
    },
    {
      id: 'diabetico',
      name: 'Plan para Diabéticos',
      type: 'diabetico',
      description: 'Control de glucosa con carbohidratos complejos',
      dailyCalories: 1800,
      macroDistribution: { protein: 25, carbs: 45, fat: 30 },
      restrictions: ['azucar_simple', 'alto_indice_glucemico'],
      duration: 30
    }
  ]

  // Obtener recetas compatibles con el plan de dieta seleccionado
  const getCompatibleRecipes = () => {
    if (!selectedDietPlan) return spanishRecipes

    return spanishRecipes.filter(recipe => {
      // Filtrar por tipo de dieta
      if (selectedDietPlan.type === 'vegetariano' && recipe.dietType?.includes('vegetariano')) return true
      if (selectedDietPlan.type === 'vegano' && recipe.dietType?.includes('vegano')) return true
      if (selectedDietPlan.type === 'keto' && recipe.carbs < 10) return true
      if (selectedDietPlan.type === 'perdida_peso' && recipe.calories < 300) return true
      if (selectedDietPlan.type === 'diabetico' && !recipe.tags.includes('alto_azucar')) return true

      return selectedDietPlan.type === 'mediterraneo' || selectedDietPlan.type === 'ganancia_muscular'
    })
  }

  // Obtener comidas del día seleccionado
  const getDayMeals = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealPlans.filter(plan => plan.date === dateStr)
  }

  // Calcular totales nutricionales del día
  const calculateDayTotals = (date: Date) => {
    const dayMeals = getDayMeals(date)

    return dayMeals.reduce((totals, meal) => {
      let calories = 0, protein = 0, carbs = 0, fat = 0

      if (meal.recipeId) {
        const recipe = spanishRecipes.find(r => r.id === meal.recipeId)
        if (recipe) {
          calories = recipe.calories
          protein = recipe.protein
          carbs = recipe.carbs
          fat = recipe.fat
        }
      } else if (meal.customMeal) {
        calories = meal.customMeal.calories
        protein = meal.customMeal.protein
        carbs = meal.customMeal.carbs
        fat = meal.customMeal.fat
      }

      return {
        calories: totals.calories + calories,
        protein: totals.protein + protein,
        carbs: totals.carbs + carbs,
        fat: totals.fat + fat
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  // Generar plan automático para la semana
  const generateWeeklyPlan = () => {
    if (!selectedDietPlan) return

    const compatibleRecipes = getCompatibleRecipes()
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const newPlans: MealPlan[] = []

    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i)
      const dateStr = format(currentDate, 'yyyy-MM-dd')

      // Generar comidas para cada día
      const mealTypes: Array<'desayuno' | 'almuerzo' | 'cena' | 'snack'> = ['desayuno', 'almuerzo', 'cena', 'snack']

      mealTypes.forEach(mealType => {
        const categoryRecipes = compatibleRecipes.filter(recipe =>
          recipe.category === mealType ||
          (mealType === 'snack' && recipe.category === 'snack')
        )

        if (categoryRecipes.length > 0) {
          const randomRecipe = categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)]

          newPlans.push({
            id: `${dateStr}-${mealType}-${Date.now()}`,
            date: dateStr,
            mealType,
            recipeId: randomRecipe.id,
            notes: `Generado automáticamente para plan ${selectedDietPlan.name}`
          })
        }
      })
    }

    setMealPlans(prev => {
      // Eliminar planes existentes de la semana
      const filtered = prev.filter(plan => {
        const planDate = new Date(plan.date)
        return planDate < startDate || planDate > addDays(startDate, 6)
      })

      return [...filtered, ...newPlans]
    })
  }

  // Agregar nueva comida
  const addMeal = (meal: Omit<MealPlan, 'id'>) => {
    const newMeal: MealPlan = {
      ...meal,
      id: `${meal.date}-${meal.mealType}-${Date.now()}`
    }

    setMealPlans(prev => [...prev, newMeal])
    setIsAddMealDialogOpen(false)
  }

  // Eliminar comida
  const deleteMeal = (mealId: string) => {
    setMealPlans(prev => prev.filter(meal => meal.id !== mealId))
  }

  // Marcar comida como completada
  const toggleMealCompleted = (mealId: string) => {
    setMealPlans(prev => prev.map(meal =>
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    ))
  }

  const dayTotals = calculateDayTotals(selectedDate)
  const compatibleRecipes = getCompatibleRecipes()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con selección de plan de dieta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#1B237E]">
            <Target className="h-5 w-5 mr-2" />
            Planificador de Comidas Unificado
          </CardTitle>
          <CardDescription>
            Gestiona tu diario de comidas y planifica según tu tipo de dieta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan de Dieta</Label>
              <Select
                value={selectedDietPlan?.id || ""}
                onValueChange={(value) => {
                  const plan = dietPlans.find(p => p.id === value)
                  setSelectedDietPlan(plan || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan de dieta" />
                </SelectTrigger>
                <SelectContent>
                  {dietPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vista</Label>
              <div className="flex gap-2">
                <SafeClientButton
                  variant={viewMode === 'day' ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Día
                </SafeClientButton>
                <SafeClientButton
                  variant={viewMode === 'week' ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </SafeClientButton>
              </div>
            </div>
          </div>

          {selectedDietPlan && (
            <div className="mt-4 p-3 bg-[#1B237E]/5 rounded-lg">
              <h4 className="font-medium text-[#1B237E] mb-1">{selectedDietPlan.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedDietPlan.description}</p>
              <div className="flex gap-4 text-xs">
                <span>Calorías: {selectedDietPlan.dailyCalories}/día</span>
                <span>Proteína: {selectedDietPlan.macroDistribution.protein}%</span>
                <span>Carbos: {selectedDietPlan.macroDistribution.carbs}%</span>
                <span>Grasas: {selectedDietPlan.macroDistribution.fat}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de fecha y acciones */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-auto"
          />
          <span className="text-sm text-gray-600">
            {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
          </span>
        </div>

        <div className="flex gap-2">
          <SafeClientButton
            variant="outline"
            size="sm"
            onClick={generateWeeklyPlan}
            disabled={!selectedDietPlan}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Generar Plan Semanal
          </SafeClientButton>

          <SafeClientButton
            variant="accent"
            size="sm"
            onClick={() => setIsAddMealDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir Comida
          </SafeClientButton>
        </div>
      </div>

      {/* Resumen nutricional del día */}
      {selectedDietPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen Nutricional del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#FEA800]">
                  {Math.round(dayTotals.calories)}
                </div>
                <div className="text-xs text-gray-600">
                  de {selectedDietPlan.dailyCalories} kcal
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-[#FEA800] h-2 rounded-full"
                    style={{ width: `${Math.min(100, (dayTotals.calories / selectedDietPlan.dailyCalories) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-[#FF6767]">
                  {Math.round(dayTotals.protein)}g
                </div>
                <div className="text-xs text-gray-600">Proteína</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-[#B1AFE9]">
                  {Math.round(dayTotals.carbs)}g
                </div>
                <div className="text-xs text-gray-600">Carbohidratos</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-[#573353]">
                  {Math.round(dayTotals.fat)}g
                </div>
                <div className="text-xs text-gray-600">Grasas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de comidas del día */}
      <div className="grid grid-cols-1 gap-4">
        {['desayuno', 'almuerzo', 'cena', 'snack'].map(mealType => {
          const mealTypeName = {
            desayuno: 'Desayuno',
            almuerzo: 'Almuerzo',
            cena: 'Cena',
            snack: 'Snacks'
          }[mealType]

          const dayMeals = getDayMeals(selectedDate)
          const mealsOfType = dayMeals.filter(meal => meal.mealType === mealType)

          return (
            <Card key={mealType}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{mealTypeName}</span>
                  <SafeClientButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMeal({
                        id: '',
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        mealType: mealType as any,
                      } as MealPlan)
                      setIsAddMealDialogOpen(true)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </SafeClientButton>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mealsOfType.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay comidas planificadas
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mealsOfType.map(meal => {
                      const recipe = meal.recipeId ? spanishRecipes.find(r => r.id === meal.recipeId) : null
                      const mealData = recipe || meal.customMeal

                      return (
                        <div
                          key={meal.id}
                          className={`p-3 border rounded-lg ${meal.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {recipe?.name || meal.customMeal?.name || 'Comida personalizada'}
                              </h4>
                              {mealData && (
                                <div className="flex gap-3 text-xs text-gray-600 mt-1">
                                  <span>{mealData.calories} kcal</span>
                                  <span>{mealData.protein}g prot</span>
                                  <span>{mealData.carbs}g carbs</span>
                                  <span>{mealData.fat}g grasas</span>
                                </div>
                              )}
                              {meal.notes && (
                                <p className="text-xs text-gray-500 mt-1">{meal.notes}</p>
                              )}
                            </div>

                            <div className="flex gap-1 ml-2">
                              <SafeClientButton
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMealCompleted(meal.id)}
                                className={meal.completed ? 'text-green-600' : 'text-gray-400'}
                              >
                                ✓
                              </SafeClientButton>

                              <SafeClientButton
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMeal(meal)
                                  setIsAddMealDialogOpen(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </SafeClientButton>

                              <SafeClientButton
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMeal(meal.id)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </SafeClientButton>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal para agregar/editar comida */}
      <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMeal?.id ? 'Editar Comida' : 'Añadir Nueva Comida'}
            </DialogTitle>
            <DialogDescription>
              Selecciona una receta o crea una comida personalizada
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recipes">Recetas</TabsTrigger>
              <TabsTrigger value="custom">Personalizada</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {compatibleRecipes
                  .filter(recipe => !editingMeal?.mealType || recipe.category === editingMeal.mealType)
                  .slice(0, 10)
                  .map(recipe => (
                  <div
                    key={recipe.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (editingMeal) {
                        const mealData = {
                          ...editingMeal,
                          recipeId: recipe.id,
                          customMeal: undefined
                        }

                        if (editingMeal.id) {
                          setMealPlans(prev => prev.map(meal =>
                            meal.id === editingMeal.id ? mealData : meal
                          ))
                        } else {
                          addMeal(mealData)
                        }

                        setIsAddMealDialogOpen(false)
                        setEditingMeal(null)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{recipe.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{recipe.description}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-2">
                          <span>{recipe.calories} kcal</span>
                          <span>{recipe.protein}g prot</span>
                          <span>{recipe.prepTime + recipe.cookTime} min</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la comida</Label>
                  <Input placeholder="Ej: Ensalada mixta" />
                </div>
                <div className="space-y-2">
                  <Label>Calorías</Label>
                  <Input type="number" placeholder="250" />
                </div>
                <div className="space-y-2">
                  <Label>Proteína (g)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="space-y-2">
                  <Label>Carbohidratos (g)</Label>
                  <Input type="number" placeholder="20" />
                </div>
                <div className="space-y-2">
                  <Label>Grasas (g)</Label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de comida</Label>
                  <Select defaultValue={editingMeal?.mealType || 'almuerzo'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desayuno">Desayuno</SelectItem>
                      <SelectItem value="almuerzo">Almuerzo</SelectItem>
                      <SelectItem value="cena">Cena</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea placeholder="Descripción opcional de la comida..." />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea placeholder="Notas adicionales..." />
              </div>

              <SafeClientButton variant="accent" className="w-full">
                {editingMeal?.id ? 'Actualizar Comida' : 'Añadir Comida'}
              </SafeClientButton>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
