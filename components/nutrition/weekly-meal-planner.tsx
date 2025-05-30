"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, ChefHat, Clock, Users, RefreshCw, Download, ShoppingCart, Utensils } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import {
  createMealPlan,
  getCurrentMealPlan,
  searchSpanishFoods,
  SpanishFood
} from "@/lib/services/unified-nutrition-service"
import { expandedSpanishFoodDatabase } from "@/lib/data/expanded-spanish-food-database"

interface MealPlan {
  id: string
  user_id: string
  week_start: string
  meals: {
    [day: string]: {
      breakfast: SpanishFood | null
      lunch: SpanishFood | null
      dinner: SpanishFood | null
      snack?: SpanishFood | null
    }
  }
  preferences: {
    diet_type: string
    allergies: string[]
    budget: string
    cooking_time: string
    servings: number
  }
  shopping_list: ShoppingItem[]
  created_at: string
}

interface ShoppingItem {
  ingredient: string
  quantity: string
  category: string
  checked: boolean
}

interface WeeklyMealPlannerProps {
  className?: string
}

export default function WeeklyMealPlanner({ className }: WeeklyMealPlannerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState({
    diet_type: 'omnivore',
    allergies: [] as string[],
    budget: 'medium',
    cooking_time: 'moderate',
    servings: 2
  })

  const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
  const mealTypes = [
    { key: 'breakfast', label: 'Desayuno', icon: '🌅' },
    { key: 'lunch', label: 'Almuerzo', icon: '☀️' },
    { key: 'dinner', label: 'Cena', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍎' }
  ]

  // Cargar plan existente al montar el componente
  useEffect(() => {
    if (user) {
      loadCurrentPlan()
    }
  }, [user])

  const loadCurrentPlan = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const plan = await getCurrentMealPlan(user.id)
      if (plan) {
        setCurrentPlan(plan)
        setPreferences(plan.preferences)
      }
    } catch (error) {
      console.error('Error al cargar plan de comidas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMealPlan = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      // Filtrar alimentos según preferencias usando la base de datos española
      const availableFoods = expandedSpanishFoodDatabase.filter(food => {
        // Filtrar por tipo de dieta
        if (preferences.diet_type === 'vegetarian' && !food.isVegetarian) return false
        if (preferences.diet_type === 'vegan' && !food.isVegan) return false

        // Filtrar por alergias
        if (preferences.allergies.length > 0) {
          const hasAllergen = preferences.allergies.some(allergy =>
            food.name.toLowerCase().includes(allergy.toLowerCase()) ||
            food.category.toLowerCase().includes(allergy.toLowerCase())
          )
          if (hasAllergen) return false
        }

        return true
      })

      if (availableFoods.length < 14) {
        toast({
          title: "Pocos alimentos disponibles",
          description: "No hay suficientes alimentos que cumplan tus criterios. Ajusta las preferencias.",
          variant: "destructive"
        })
        return
      }

      // Generar plan de comidas
      const meals: MealPlan['meals'] = {}
      const usedFoods = new Set<string>()

      for (const day of daysOfWeek) {
        meals[day] = {
          breakfast: getRandomFood(availableFoods, 'desayuno', usedFoods),
          lunch: getRandomFood(availableFoods, 'almuerzo', usedFoods),
          dinner: getRandomFood(availableFoods, 'cena', usedFoods),
          snack: getRandomFood(availableFoods, 'snack', usedFoods)
        }
      }

      // Generar lista de compras
      const shoppingList = generateShoppingList(meals)

      // Crear el plan
      const today = new Date()
      const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      const weekStart = monday.toISOString().split('T')[0]

      const newPlan = {
        user_id: user.id,
        name: `Plan Semanal - ${weekStart}`,
        week_start: weekStart,
        meals,
        preferences,
        shopping_list: shoppingList
      }

      // Guardar usando el servicio unificado
      const savedPlan = await createMealPlan(newPlan)
      if (savedPlan) {
        setCurrentPlan(savedPlan)
      }
      
      toast({
        title: "¡Plan generado!",
        description: "Tu plan de comidas semanal ha sido creado exitosamente.",
      })

    } catch (error) {
      console.error('Error al generar plan de comidas:', error)
      toast({
        title: "Error",
        description: "No se pudo generar el plan de comidas. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getRandomFood = (foods: SpanishFood[], mealType: string, usedFoods: Set<string>): SpanishFood | null => {
    // Filtrar alimentos por tipo de comida
    const filteredFoods = foods.filter(food => {
      if (usedFoods.has(food.id)) return false

      // Mapear tipos de comida a categorías de alimentos
      const mealCategories = {
        'desayuno': ['Lácteos', 'Frutas', 'Cereales'],
        'almuerzo': ['Carnes', 'Pescados', 'Verduras', 'Legumbres'],
        'cena': ['Pescados', 'Verduras', 'Carnes'],
        'snack': ['Frutas', 'Lácteos', 'Frutos secos']
      }

      const categories = mealCategories[mealType as keyof typeof mealCategories] || []
      return categories.includes(food.category)
    })

    if (filteredFoods.length === 0) {
      // Si no hay alimentos específicos, usar cualquier alimento no usado
      const anyFoods = foods.filter(food => !usedFoods.has(food.id))
      if (anyFoods.length === 0) return null

      const randomFood = anyFoods[Math.floor(Math.random() * anyFoods.length)]
      usedFoods.add(randomFood.id)
      return randomFood
    }

    const randomFood = filteredFoods[Math.floor(Math.random() * filteredFoods.length)]
    usedFoods.add(randomFood.id)
    return randomFood
  }

  const generateShoppingList = (meals: MealPlan['meals']): ShoppingItem[] => {
    const ingredients = new Map<string, { quantity: string, category: string }>()

    // Recopilar todos los alimentos
    Object.values(meals).forEach(dayMeals => {
      Object.values(dayMeals).forEach(food => {
        if (food) {
          const cleanName = food.name.toLowerCase().trim()
          if (!ingredients.has(cleanName)) {
            ingredients.set(cleanName, {
              quantity: '1 porción',
              category: food.category
            })
          }
        }
      })
    })

    // Convertir a array de ShoppingItem
    return Array.from(ingredients.entries()).map(([ingredient, details]) => ({
      ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      quantity: details.quantity,
      category: details.category,
      checked: false
    }))
  }

  const updateShoppingItem = async (index: number, checked: boolean) => {
    if (!currentPlan) return

    const updatedShoppingList = [...currentPlan.shopping_list]
    updatedShoppingList[index].checked = checked

    const updatedPlan = { ...currentPlan, shopping_list: updatedShoppingList }
    setCurrentPlan(updatedPlan)

    // Actualizar en Supabase
    try {
      await supabase
        .from('meal_plans')
        .update({ shopping_list: updatedShoppingList })
        .eq('id', currentPlan.id)
    } catch (error) {
      console.error('Error al actualizar lista de compras:', error)
    }
  }

  const exportShoppingList = () => {
    if (!currentPlan) return

    const listText = currentPlan.shopping_list
      .map(item => `${item.checked ? '✓' : '○'} ${item.ingredient} - ${item.quantity}`)
      .join('\n')

    const blob = new Blob([listText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-compras-${currentPlan.week_start}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Planificador de Comidas Semanal
          </CardTitle>
          <CardDescription>
            Genera automáticamente un plan de comidas personalizado para toda la semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentPlan ? (
            <div className="text-center py-8">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes un plan de comidas</h3>
              <p className="text-gray-600 mb-6">
                Genera tu primer plan de comidas semanal personalizado
              </p>
              
              {/* Preferencias */}
              <div className="max-w-md mx-auto space-y-4 mb-6">
                <div>
                  <Label>Tipo de dieta</Label>
                  <Select value={preferences.diet_type} onValueChange={(value) => setPreferences(prev => ({ ...prev, diet_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="omnivore">Omnívora</SelectItem>
                      <SelectItem value="vegetarian">Vegetariana</SelectItem>
                      <SelectItem value="vegan">Vegana</SelectItem>
                      <SelectItem value="mediterranean">Mediterránea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tiempo de cocción</Label>
                  <Select value={preferences.cooking_time} onValueChange={(value) => setPreferences(prev => ({ ...prev, cooking_time: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Mínimo (hasta 30 min)</SelectItem>
                      <SelectItem value="moderate">Moderado (hasta 60 min)</SelectItem>
                      <SelectItem value="plenty">Sin límite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Número de porciones</Label>
                  <Select value={preferences.servings.toString()} onValueChange={(value) => setPreferences(prev => ({ ...prev, servings: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 persona</SelectItem>
                      <SelectItem value="2">2 personas</SelectItem>
                      <SelectItem value="3">3 personas</SelectItem>
                      <SelectItem value="4">4 personas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateMealPlan} disabled={isGenerating} size="lg">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generando plan...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generar Plan de Comidas
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="plan" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plan">Plan de Comidas</TabsTrigger>
                <TabsTrigger value="shopping">Lista de Compras</TabsTrigger>
              </TabsList>

              <TabsContent value="plan" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Semana del {new Date(currentPlan.week_start).toLocaleDateString('es-ES')}
                  </h3>
                  <Button onClick={generateMealPlan} disabled={isGenerating} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {daysOfWeek.map(day => (
                    <Card key={day}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize">{day}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {mealTypes.map(mealType => {
                            const recipe = currentPlan.meals[day]?.[mealType.key as keyof typeof currentPlan.meals[typeof day]]
                            return (
                              <div key={mealType.key} className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-gray-600">
                                  <span className="mr-1">{mealType.icon}</span>
                                  {mealType.label}
                                </div>
                                {recipe ? (
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium line-clamp-2">{recipe.title}</h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {recipe.prepTime + recipe.cookTime} min
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
                                    Sin receta
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="shopping" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Lista de Compras</h3>
                  <Button onClick={exportShoppingList} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentPlan.shopping_list.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => updateShoppingItem(index, checked as boolean)}
                      />
                      <div className={`flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                        <span className="font-medium">{item.ingredient}</span>
                        <span className="text-sm text-gray-600 ml-2">- {item.quantity}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
