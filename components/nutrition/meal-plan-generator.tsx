"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Utensils, Clock, ChevronRight, Sparkles, Flame, Salad, Beef, Fish, Egg, Wheat, Milk, X } from "lucide-react"

// Tipos de datos
interface MealPlanSettings {
  goal: string
  calories: number
  meals: number
  dietType: string
  allergies: string[]
  preferences: string[]
  excludedFoods: string[]
}

interface MealPlan {
  id: string
  name: string
  description: string
  calories: number
  meals: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  days: {
    [key: string]: {
      meals: {
        type: string
        time: string
        foods: Array<{
          name: string
          portion: string
          calories: number
          protein: number
          carbs: number
          fat: number
        }>
      }[]
    }
  }
}

export default function MealPlanGenerator() {
  const [activeTab, setActiveTab] = useState("settings")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null)
  const [settings, setSettings] = useState<MealPlanSettings>({
    goal: "weightLoss",
    calories: 1800,
    meals: 4,
    dietType: "balanced",
    allergies: [],
    preferences: [],
    excludedFoods: []
  })

  // Manejar cambios en los ajustes
  const handleSettingChange = (key: keyof MealPlanSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Manejar cambios en arrays (alergias, preferencias, etc.)
  const handleArraySettingChange = (key: keyof MealPlanSettings, value: string, checked: boolean) => {
    setSettings(prev => {
      const currentArray = prev[key] as string[]
      if (checked) {
        return { ...prev, [key]: [...currentArray, value] }
      } else {
        return { ...prev, [key]: currentArray.filter(item => item !== value) }
      }
    })
  }

  // Añadir alimento excluido
  const handleAddExcludedFood = (food: string) => {
    if (food.trim() && !settings.excludedFoods.includes(food.trim())) {
      handleArraySettingChange('excludedFoods', food.trim(), true)
    }
  }

  // Eliminar alimento excluido
  const handleRemoveExcludedFood = (food: string) => {
    handleArraySettingChange('excludedFoods', food, false)
  }

  // Generar plan de comidas
  const handleGeneratePlan = () => {
    setIsGenerating(true)
    
    // Simulamos una llamada a la API
    setTimeout(() => {
      // Plan de comidas de ejemplo
      const samplePlan: MealPlan = {
        id: "plan-1",
        name: settings.goal === "weightLoss" ? "Plan de pérdida de peso" : 
              settings.goal === "maintenance" ? "Plan de mantenimiento" : "Plan de ganancia muscular",
        description: `Plan personalizado de ${settings.calories} calorías con ${settings.meals} comidas diarias`,
        calories: settings.calories,
        meals: settings.meals,
        macros: {
          protein: settings.goal === "muscleGain" ? 30 : 25,
          carbs: settings.goal === "weightLoss" ? 40 : 50,
          fat: settings.goal === "weightLoss" ? 35 : 25
        },
        days: {
          "day-1": {
            meals: [
              {
                type: "desayuno",
                time: "08:00",
                foods: [
                  {
                    name: "Avena con plátano y almendras",
                    portion: "1 taza",
                    calories: 350,
                    protein: 12,
                    carbs: 45,
                    fat: 14
                  },
                  {
                    name: "Yogur griego",
                    portion: "150g",
                    calories: 130,
                    protein: 15,
                    carbs: 6,
                    fat: 5
                  }
                ]
              },
              {
                type: "almuerzo",
                time: "13:00",
                foods: [
                  {
                    name: "Ensalada de pollo",
                    portion: "1 plato",
                    calories: 420,
                    protein: 35,
                    carbs: 20,
                    fat: 22
                  },
                  {
                    name: "Pan integral",
                    portion: "1 rebanada",
                    calories: 80,
                    protein: 4,
                    carbs: 15,
                    fat: 1
                  }
                ]
              },
              {
                type: "merienda",
                time: "16:30",
                foods: [
                  {
                    name: "Batido de proteínas",
                    portion: "1 vaso",
                    calories: 180,
                    protein: 25,
                    carbs: 10,
                    fat: 3
                  },
                  {
                    name: "Manzana",
                    portion: "1 unidad",
                    calories: 80,
                    protein: 0,
                    carbs: 21,
                    fat: 0
                  }
                ]
              },
              {
                type: "cena",
                time: "20:00",
                foods: [
                  {
                    name: "Salmón a la plancha",
                    portion: "150g",
                    calories: 280,
                    protein: 32,
                    carbs: 0,
                    fat: 16
                  },
                  {
                    name: "Brócoli al vapor",
                    portion: "200g",
                    calories: 70,
                    protein: 5,
                    carbs: 10,
                    fat: 1
                  },
                  {
                    name: "Arroz integral",
                    portion: "100g",
                    calories: 110,
                    protein: 3,
                    carbs: 22,
                    fat: 1
                  }
                ]
              }
            ]
          }
        }
      }
      
      setGeneratedPlan(samplePlan)
      setIsGenerating(false)
      setActiveTab("plan")
    }, 2000)
  }

  // Renderizar el formulario de ajustes
  const renderSettingsForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Objetivo</Label>
          <Select 
            value={settings.goal} 
            onValueChange={(value) => handleSettingChange('goal', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weightLoss">Pérdida de peso</SelectItem>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
              <SelectItem value="muscleGain">Ganancia muscular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Calorías diarias: {settings.calories}</Label>
          </div>
          <Slider 
            value={[settings.calories]} 
            min={1200} 
            max={3000} 
            step={50} 
            onValueChange={(value) => handleSettingChange('calories', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1200</span>
            <span>2100</span>
            <span>3000</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Número de comidas: {settings.meals}</Label>
          </div>
          <Slider 
            value={[settings.meals]} 
            min={3} 
            max={6} 
            step={1} 
            onValueChange={(value) => handleSettingChange('meals', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Tipo de dieta</Label>
          <Select 
            value={settings.dietType} 
            onValueChange={(value) => handleSettingChange('dietType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo de dieta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Equilibrada</SelectItem>
              <SelectItem value="lowCarb">Baja en carbohidratos</SelectItem>
              <SelectItem value="highProtein">Alta en proteínas</SelectItem>
              <SelectItem value="keto">Cetogénica</SelectItem>
              <SelectItem value="mediterranean">Mediterránea</SelectItem>
              <SelectItem value="vegetarian">Vegetariana</SelectItem>
              <SelectItem value="vegan">Vegana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Alergias e intolerancias</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "gluten", label: "Gluten" },
              { id: "lactose", label: "Lactosa" },
              { id: "nuts", label: "Frutos secos" },
              { id: "eggs", label: "Huevos" },
              { id: "soy", label: "Soja" },
              { id: "shellfish", label: "Mariscos" }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`allergy-${item.id}`} 
                  checked={settings.allergies.includes(item.id)}
                  onCheckedChange={(checked) => 
                    handleArraySettingChange('allergies', item.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`allergy-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Preferencias alimentarias</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "highProtein", label: "Alto en proteínas" },
              { id: "lowFat", label: "Bajo en grasas" },
              { id: "lowCarb", label: "Bajo en carbohidratos" },
              { id: "highFiber", label: "Alto en fibra" },
              { id: "lowSodium", label: "Bajo en sodio" },
              { id: "lowSugar", label: "Bajo en azúcar" }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`pref-${item.id}`} 
                  checked={settings.preferences.includes(item.id)}
                  onCheckedChange={(checked) => 
                    handleArraySettingChange('preferences', item.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`pref-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Alimentos a excluir</Label>
          <div className="flex space-x-2">
            <Input 
              placeholder="Ej: champiñones, berenjenas..." 
              id="excludedFood"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddExcludedFood((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => {
                const input = document.getElementById('excludedFood') as HTMLInputElement
                handleAddExcludedFood(input.value)
                input.value = ''
              }}
            >
              Añadir
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {settings.excludedFoods.map((food) => (
              <Badge key={food} variant="secondary" className="flex items-center gap-1">
                {food}
                <button 
                  onClick={() => handleRemoveExcludedFood(food)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando plan...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar plan de comidas
            </>
          )}
        </Button>
      </div>
    )
  }

  // Renderizar el plan generado
  const renderGeneratedPlan = () => {
    if (!generatedPlan) return null

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{generatedPlan.name}</h2>
            <p className="text-muted-foreground">{generatedPlan.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
            Ajustar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución de macronutrientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{generatedPlan.macros.protein}%</div>
                <p className="text-sm text-muted-foreground">Proteínas</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{generatedPlan.macros.carbs}%</div>
                <p className="text-sm text-muted-foreground">Carbohidratos</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{generatedPlan.macros.fat}%</div>
                <p className="text-sm text-muted-foreground">Grasas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Día 1</h3>
          
          {generatedPlan.days["day-1"].meals.map((meal, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {meal.type === "desayuno" ? <Coffee className="h-5 w-5 text-blue-500" /> :
                       meal.type === "almuerzo" ? <Utensils className="h-5 w-5 text-green-500" /> :
                       meal.type === "merienda" ? <Apple className="h-5 w-5 text-orange-500" /> :
                       <Moon className="h-5 w-5 text-purple-500" />}
                    </div>
                    <CardTitle className="text-base capitalize">{meal.type}</CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {meal.time}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meal.foods.map((food, foodIndex) => (
                    <div key={foodIndex} className="flex justify-between">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">{food.portion}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{food.calories} kcal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">
                      {meal.foods.reduce((sum, food) => sum + food.calories, 0)} kcal
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button className="flex-1">
            Guardar plan
          </Button>
          <Button variant="outline" className="flex-1">
            Exportar PDF
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="settings">
            <Flame className="h-4 w-4 mr-2" />
            Ajustes
          </TabsTrigger>
          <TabsTrigger value="plan" disabled={!generatedPlan}>
            <Utensils className="h-4 w-4 mr-2" />
            Plan generado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          {renderSettingsForm()}
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          {renderGeneratedPlan()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
