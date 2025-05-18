"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, ChevronRight, Clock, Utensils, Coffee, Apple, Moon } from "lucide-react"

// Tipos de datos
interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  serving: string
  category: string
  isFavorite?: boolean
}

interface MealEntry {
  id: string
  mealType: "desayuno" | "almuerzo" | "cena" | "snack"
  time: string
  foods: Array<{
    food: FoodItem
    quantity: number
  }>
}

// Datos de ejemplo
const sampleFoods: FoodItem[] = [
  {
    id: "f1",
    name: "Pechuga de pollo",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    serving: "100g",
    category: "proteínas",
    isFavorite: true
  },
  {
    id: "f2",
    name: "Arroz integral",
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    fiber: 1.8,
    serving: "100g",
    category: "carbohidratos"
  },
  {
    id: "f3",
    name: "Aguacate",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    serving: "100g",
    category: "grasas",
    isFavorite: true
  },
  {
    id: "f4",
    name: "Huevo entero",
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fat: 10.6,
    fiber: 0,
    serving: "100g",
    category: "proteínas"
  },
  {
    id: "f5",
    name: "Espinacas",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    serving: "100g",
    category: "verduras",
    isFavorite: true
  }
]

const sampleMeals: MealEntry[] = [
  {
    id: "m1",
    mealType: "desayuno",
    time: "08:30",
    foods: [
      { food: sampleFoods[3], quantity: 2 },
      { food: sampleFoods[2], quantity: 0.5 }
    ]
  },
  {
    id: "m2",
    mealType: "almuerzo",
    time: "13:00",
    foods: [
      { food: sampleFoods[0], quantity: 1.5 },
      { food: sampleFoods[1], quantity: 1 },
      { food: sampleFoods[4], quantity: 1 }
    ]
  }
]

export default function EnhancedFoodTracker() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("diary")
  const [meals, setMeals] = useState<MealEntry[]>(sampleMeals)
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>(sampleFoods)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Filtrar alimentos según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFoods(sampleFoods)
    } else {
      const filtered = sampleFoods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFoods(filtered)
    }
  }, [searchTerm])

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-5 w-5 text-blue-500" />
      case "almuerzo":
        return <Utensils className="h-5 w-5 text-green-500" />
      case "cena":
        return <Moon className="h-5 w-5 text-purple-500" />
      case "snack":
        return <Apple className="h-5 w-5 text-orange-500" />
      default:
        return <Utensils className="h-5 w-5 text-gray-500" />
    }
  }

  // Calcular totales de macronutrientes para una comida
  const calculateMealTotals = (meal: MealEntry) => {
    return meal.foods.reduce((totals, item) => {
      return {
        calories: totals.calories + (item.food.calories * item.quantity),
        protein: totals.protein + (item.food.protein * item.quantity),
        carbs: totals.carbs + (item.food.carbs * item.quantity),
        fat: totals.fat + (item.food.fat * item.quantity)
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  // Calcular totales diarios
  const calculateDailyTotals = () => {
    return meals.reduce((totals, meal) => {
      const mealTotals = calculateMealTotals(meal)
      return {
        calories: totals.calories + mealTotals.calories,
        protein: totals.protein + mealTotals.protein,
        carbs: totals.carbs + mealTotals.carbs,
        fat: totals.fat + mealTotals.fat
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="diary">Diario</TabsTrigger>
          <TabsTrigger value="foods">Alimentos</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
            <Button variant="outline" size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              Añadir comida
            </Button>
          </div>

          {/* Resumen diario */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen del día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center">
                {Object.entries(calculateDailyTotals()).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-lg font-semibold">
                      {Math.round(value)}
                      {key === "calories" ? " kcal" : "g"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de comidas */}
          <div className="space-y-4">
            {meals.map(meal => (
              <Card key={meal.id} className="bg-white shadow-sm border-none">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderMealIcon(meal.mealType)}
                      <CardTitle className="text-base ml-2 capitalize">
                        {meal.mealType}
                      </CardTitle>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.time}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {meal.foods.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.food.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} {item.food.serving} • {Math.round(item.food.calories * item.quantity)} kcal
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total</span>
                      <span>
                        {Math.round(calculateMealTotals(meal).calories)} kcal
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Botón para añadir comida */}
            <Button variant="outline" className="w-full py-6 border-dashed">
              <Plus className="h-5 w-5 mr-2" />
              Añadir comida
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="foods" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar alimentos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Todos</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Proteínas</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Carbohidratos</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Grasas</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Verduras</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Frutas</Badge>
          </div>

          <div className="space-y-3">
            {filteredFoods.map(food => (
              <Card key={food.id} className="bg-white shadow-sm border-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {food.serving} • {food.calories} kcal
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Proteínas:</span> {food.protein}g
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Carbos:</span> {food.carbs}g
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Grasas:</span> {food.fat}g
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <h2 className="text-lg font-semibold">Tus alimentos favoritos</h2>
          
          <div className="space-y-3">
            {filteredFoods.filter(food => food.isFavorite).map(food => (
              <Card key={food.id} className="bg-white shadow-sm border-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {food.serving} • {food.calories} kcal
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Proteínas:</span> {food.protein}g
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Carbos:</span> {food.carbs}g
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Grasas:</span> {food.fat}g
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
