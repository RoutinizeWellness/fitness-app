"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { 
  Utensils, 
  Clock, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Info,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Soup,
  UtensilsCrossed,
  Cookie,
  Sparkles
} from "lucide-react"
import { MealPlan, MealPlanDay, Meal, MealFood } from "@/lib/meal-plan-generator"
import { supabase } from "@/lib/supabase-client"

interface MealPlanDisplayProps {
  userId: string
  onGenerateNewPlan?: () => void
}

export default function MealPlanDisplay({ userId, onGenerateNewPlan }: MealPlanDisplayProps) {
  const { toast } = useToast()
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  
  // Cargar el plan activo
  useEffect(() => {
    const loadActivePlan = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single()
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 es "no rows returned"
            console.error('Error al cargar el plan de alimentación:', error)
          }
          setActivePlan(null)
        } else if (data) {
          setActivePlan({
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description,
            targetCalories: data.target_calories,
            targetProtein: data.target_protein,
            targetCarbs: data.target_carbs,
            targetFat: data.target_fat,
            days: data.days || [],
            createdAt: data.created_at,
            isActive: data.is_active
          })
          
          // Establecer el primer día como activo por defecto
          if (data.days && data.days.length > 0) {
            setActiveDay(data.days[0].id)
          }
        }
      } catch (error) {
        console.error('Error al cargar el plan de alimentación:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadActivePlan()
  }, [userId])
  
  // Manejar la generación de un nuevo plan
  const handleGenerateNewPlan = () => {
    if (onGenerateNewPlan) {
      onGenerateNewPlan()
    } else {
      toast({
        title: "Función no disponible",
        description: "La generación de nuevos planes no está disponible en este momento.",
        variant: "destructive"
      })
    }
  }
  
  // Obtener el icono para el tipo de comida
  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="h-5 w-5 text-orange-500" />
      case 'lunch':
        return <Soup className="h-5 w-5 text-green-500" />
      case 'dinner':
        return <UtensilsCrossed className="h-5 w-5 text-blue-500" />
      case 'snack':
        return <Cookie className="h-5 w-5 text-amber-500" />
      default:
        return <Utensils className="h-5 w-5 text-gray-500" />
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }
  
  // Renderizar mensaje si no hay plan activo
  if (!activePlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="h-5 w-5 mr-2 text-primary" />
            Plan de Alimentación
          </CardTitle>
          <CardDescription>
            No tienes un plan de alimentación activo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Sin Plan Activo</h3>
          <p className="text-center text-gray-500 mb-4">
            Para comenzar, genera un plan nutricional personalizado basado en tus objetivos y preferencias.
          </p>
          <Button onClick={handleGenerateNewPlan}>
            Generar Plan Personalizado
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Encontrar el día activo
  const currentDay = activePlan.days.find(day => day.id === activeDay) || activePlan.days[0]
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-primary" />
              {activePlan.name}
            </CardTitle>
            <CardDescription>
              {activePlan.description}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Editar plan">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Generar nuevo plan" onClick={handleGenerateNewPlan}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-sm text-gray-500 mb-1">Calorías</p>
            <p className="text-xl font-bold">{activePlan.targetCalories} kcal</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-sm text-gray-500 mb-1">Proteínas</p>
            <p className="text-xl font-bold">{activePlan.targetProtein}g</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-md text-center">
              <p className="text-xs text-gray-500 mb-1">Carbos</p>
              <p className="text-lg font-bold">{activePlan.targetCarbs}g</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-md text-center">
              <p className="text-xs text-gray-500 mb-1">Grasas</p>
              <p className="text-lg font-bold">{activePlan.targetFat}g</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={currentDay?.id} onValueChange={setActiveDay} className="w-full">
          <TabsList className="grid grid-cols-7 mb-4">
            {activePlan.days.map((day) => (
              <TabsTrigger key={day.id} value={day.id}>
                {day.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {activePlan.days.map(day => (
            <TabsContent key={day.id} value={day.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{day.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {day.totalCalories} kcal
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Alternativas
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-500">Proteínas</span>
                  <span className="font-medium">{day.totalProtein}g</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-500">Carbohidratos</span>
                  <span className="font-medium">{day.totalCarbs}g</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-gray-500">Grasas</span>
                  <span className="font-medium">{day.totalFat}g</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {day.meals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {getMealIcon(meal.type)}
                          <div className="ml-2">
                            <CardTitle className="text-lg">{meal.name}</CardTitle>
                            <CardDescription>{meal.time} • {meal.totalCalories} kcal</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {meal.type === 'breakfast' ? 'Desayuno' : 
                           meal.type === 'lunch' ? 'Almuerzo' : 
                           meal.type === 'dinner' ? 'Cena' : 'Snack'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md">
                            <span className="text-gray-500">Proteínas</span>
                            <span className="font-medium">{meal.totalProtein}g</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md">
                            <span className="text-gray-500">Carbos</span>
                            <span className="font-medium">{meal.totalCarbs}g</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md">
                            <span className="text-gray-500">Grasas</span>
                            <span className="font-medium">{meal.totalFat}g</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-medium text-sm mb-1">Alimentos</h4>
                          <ul className="space-y-1">
                            {meal.foods.map((food) => (
                              <li key={food.id} className="flex justify-between text-sm">
                                <span>{food.amount} {food.unit} {food.name}</span>
                                <span className="text-gray-500">{food.calories} kcal</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {meal.recipe && (
                          <div className="mt-2">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Ver receta {meal.preparationTime && `(${meal.preparationTime} min)`}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {day.notes && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">Notas:</p>
                  <p className="text-sm text-gray-600">{day.notes}</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Volver
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/nutrition/shopping-list"}>
          Ver Lista de Compra
        </Button>
      </CardFooter>
    </Card>
  )
}
