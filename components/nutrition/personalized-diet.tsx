"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  Calendar, 
  Utensils, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Apple,
  Beef,
  Fish,
  Egg,
  Carrot,
  Loader2
} from "lucide-react"
import { 
  getPersonalizedDiet, 
  getDietDays,
  generatePersonalizedDiet
} from "@/lib/diet-ai-service"
import { 
  PersonalizedDiet as PersonalizedDietType,
  PersonalizedDietDay,
  PersonalizedDietMeal
} from "@/lib/diet-ai-service"

interface PersonalizedDietProps {
  userId: string
  dietId?: string
  onClose?: () => void
}

export default function PersonalizedDietComponent({ 
  userId, 
  dietId,
  onClose
}: PersonalizedDietProps) {
  const [diet, setDiet] = useState<PersonalizedDietType | null>(null)
  const [dietDays, setDietDays] = useState<PersonalizedDietDay[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Cargar la dieta
  useEffect(() => {
    const loadDiet = async () => {
      setIsLoading(true)
      try {
        if (dietId) {
          // Cargar dieta existente
          const { data, error } = await getPersonalizedDiet(dietId)
          if (error) throw error
          setDiet(data)
          
          // Cargar días de la dieta
          const { data: daysData, error: daysError } = await getDietDays(dietId)
          if (daysError) throw daysError
          setDietDays(daysData || [])
        } else {
          // Generar nueva dieta personalizada
          const { data, error } = await generatePersonalizedDiet(userId)
          if (error) throw error
          setDiet(data)
          
          // Cargar días de la dieta generada
          if (data) {
            const { data: daysData, error: daysError } = await getDietDays(data.id)
            if (daysError) throw daysError
            setDietDays(daysData || [])
          }
        }
      } catch (error) {
        console.error("Error al cargar dieta personalizada:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la dieta personalizada",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDiet()
  }, [userId, dietId, toast])

  // Función para alternar la expansión de un día
  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber)
  }
  
  // Función para alternar la expansión de una comida
  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId)
  }
  
  // Función para obtener el icono de un alimento según su nombre
  const getFoodIcon = (foodName: string) => {
    const name = foodName.toLowerCase()
    if (name.includes("carne") || name.includes("pollo") || name.includes("ternera")) {
      return <Beef className="h-4 w-4 mr-2" />
    } else if (name.includes("pescado") || name.includes("salmón") || name.includes("atún")) {
      return <Fish className="h-4 w-4 mr-2" />
    } else if (name.includes("huevo")) {
      return <Egg className="h-4 w-4 mr-2" />
    } else if (name.includes("fruta") || name.includes("manzana") || name.includes("plátano")) {
      return <Apple className="h-4 w-4 mr-2" />
    } else if (name.includes("verdura") || name.includes("ensalada") || name.includes("zanahoria")) {
      return <Carrot className="h-4 w-4 mr-2" />
    } else {
      return <Utensils className="h-4 w-4 mr-2" />
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Generando dieta personalizada...</span>
        </div>
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    )
  }
  
  // Renderizar mensaje de error si no hay dieta
  if (!diet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No se pudo cargar la dieta personalizada</p>
        <Button onClick={onClose}>Volver</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{diet.name}</CardTitle>
              <CardDescription>
                {format(new Date(diet.startDate), "dd/MM/yyyy", { locale: es })} - 
                {format(new Date(diet.endDate), "dd/MM/yyyy", { locale: es })}
              </CardDescription>
            </div>
            <Badge variant={diet.isActive ? "default" : "outline"}>
              {diet.isActive ? "Activa" : "Inactiva"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="days">Días</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tipo de dieta</h3>
                  <p className="text-sm">{diet.dietType.charAt(0).toUpperCase() + diet.dietType.slice(1)}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Comidas por día</h3>
                  <p className="text-sm">{diet.mealsPerDay}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Calorías objetivo</h3>
                  <p className="text-sm">{diet.calorieTarget} kcal</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Macronutrientes objetivo</h3>
                  <p className="text-sm">
                    Proteínas: {diet.proteinTarget}g | 
                    Carbohidratos: {diet.carbsTarget}g | 
                    Grasas: {diet.fatTarget}g
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Descripción</h3>
                <p className="text-sm">{diet.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="days" className="space-y-4">
              {dietDays.length > 0 ? (
                <div className="space-y-4">
                  {dietDays.map((day) => (
                    <Card key={day.id} className="overflow-hidden">
                      <div 
                        className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDayExpansion(day.dayNumber)}
                      >
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary" />
                          <div>
                            <h3 className="font-medium">Día {day.dayNumber}</h3>
                            <p className="text-sm text-gray-500">
                              {day.totalCalories} kcal | {day.meals.length} comidas
                            </p>
                          </div>
                        </div>
                        {expandedDay === day.dayNumber ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      {expandedDay === day.dayNumber && (
                        <CardContent className="pt-0">
                          <div className="space-y-4 mt-2">
                            {day.meals.map((meal) => (
                              <div key={meal.id} className="border rounded-lg overflow-hidden">
                                <div 
                                  className="p-3 bg-gray-50 cursor-pointer flex justify-between items-center"
                                  onClick={() => toggleMealExpansion(meal.id)}
                                >
                                  <div className="flex items-center">
                                    <Utensils className="h-4 w-4 mr-2 text-primary" />
                                    <div>
                                      <h4 className="font-medium">{meal.name}</h4>
                                      <p className="text-xs text-gray-500">
                                        {meal.totalCalories} kcal | P: {meal.totalProtein}g | 
                                        C: {meal.totalCarbs}g | G: {meal.totalFat}g
                                      </p>
                                    </div>
                                  </div>
                                  {expandedMeal === meal.id ? (
                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                
                                {expandedMeal === meal.id && (
                                  <div className="p-3">
                                    <ul className="space-y-2">
                                      {meal.foods.map((food, index) => (
                                        <li key={index} className="flex items-center text-sm">
                                          {getFoodIcon(food.name)}
                                          <span>
                                            {food.name} - {food.servingSize} {food.servingUnit}
                                            <span className="text-xs text-gray-500 ml-2">
                                              ({food.calories} kcal)
                                            </span>
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    {meal.notes && (
                                      <p className="text-xs text-gray-500 mt-2">{meal.notes}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay días disponibles para esta dieta</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Volver
          </Button>
          <Button>
            Aplicar dieta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
