"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrganicElement } from "@/components/transitions/organic-transitions"
import { useToast } from "@/components/ui/use-toast"
import { 
  getUserPersonalizedDiets, 
  getPersonalizedDiet, 
  getDietDays, 
  getDietMeals,
  PersonalizedDiet,
  PersonalizedDietDay,
  PersonalizedDietMeal
} from "@/lib/diet-ai-service"
import {
  Utensils,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  X,
  Edit,
  Trash2,
  FileText,
  Printer,
  Download,
  Share2,
  Loader2
} from "lucide-react"

interface DietPlanViewerProps {
  userId: string
}

export function DietPlanViewer({ userId }: DietPlanViewerProps) {
  const [diets, setDiets] = useState<PersonalizedDiet[]>([])
  const [selectedDiet, setSelectedDiet] = useState<PersonalizedDiet | null>(null)
  const [dietDays, setDietDays] = useState<PersonalizedDietDay[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingDays, setIsLoadingDays] = useState<boolean>(false)
  const { toast } = useToast()

  // Cargar dietas del usuario
  useEffect(() => {
    const loadDiets = async () => {
      if (!userId) return
      
      setIsLoading(true)
      try {
        const { data, error } = await getUserPersonalizedDiets(userId)
        
        if (error) {
          console.error("Error al cargar dietas:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar tus planes de alimentación",
            variant: "destructive"
          })
          return
        }
        
        if (data && data.length > 0) {
          setDiets(data)
          // Seleccionar la dieta activa o la más reciente
          const activeDiet = data.find(diet => diet.isActive) || data[0]
          setSelectedDiet(activeDiet)
          loadDietDays(activeDiet.id)
        }
      } catch (error) {
        console.error("Error al cargar dietas:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDiets()
  }, [userId, toast])
  
  // Cargar días de la dieta seleccionada
  const loadDietDays = async (dietId: string) => {
    setIsLoadingDays(true)
    try {
      const { data, error } = await getDietDays(dietId)
      
      if (error) {
        console.error("Error al cargar días de la dieta:", error)
        return
      }
      
      if (data) {
        setDietDays(data)
        setSelectedDay(1) // Resetear al primer día
      }
    } catch (error) {
      console.error("Error al cargar días de la dieta:", error)
    } finally {
      setIsLoadingDays(false)
    }
  }
  
  // Cambiar dieta seleccionada
  const handleDietChange = (diet: PersonalizedDiet) => {
    setSelectedDiet(diet)
    loadDietDays(diet.id)
  }
  
  // Obtener el día seleccionado
  const getSelectedDayData = () => {
    return dietDays.find(day => day.dayNumber === selectedDay)
  }
  
  // Renderizar macronutrientes
  const renderMacros = (calories: number, protein: number, carbs: number, fat: number) => {
    return (
      <div className="grid grid-cols-4 gap-2 mt-2">
        <div className="text-center">
          <div className="text-sm font-medium">{calories}</div>
          <div className="text-xs text-gray-500">Calorías</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{protein}g</div>
          <div className="text-xs text-gray-500">Proteínas</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{carbs}g</div>
          <div className="text-xs text-gray-500">Carbos</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{fat}g</div>
          <div className="text-xs text-gray-500">Grasas</div>
        </div>
      </div>
    )
  }
  
  // Renderizar progreso de macros
  const renderMacroProgress = (current: number, target: number, label: string, color: string) => {
    const percentage = Math.min(100, Math.round((current / target) * 100))
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>{label}</span>
          <span>{current}g / {target}g</span>
        </div>
        <Progress value={percentage} className={`h-2 ${color}`} />
      </div>
    )
  }
  
  // Renderizar comida
  const renderMeal = (meal: PersonalizedDietMeal) => {
    return (
      <Card key={meal.id} className="p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{meal.name}</h4>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getMealTime(meal.mealType)}</span>
            </div>
          </div>
          <Badge>{meal.totalCalories} kcal</Badge>
        </div>
        
        {renderMacros(meal.totalCalories, meal.totalProtein, meal.totalCarbs, meal.totalFat)}
        
        <Separator className="my-3" />
        
        <div className="space-y-2">
          {meal.foods.map((food, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{food.name}</span>
              <span className="text-gray-500">{food.servingSize} {food.servingUnit}</span>
            </div>
          ))}
        </div>
      </Card>
    )
  }
  
  // Obtener hora aproximada para cada tipo de comida
  const getMealTime = (mealType: string): string => {
    switch (mealType) {
      case 'desayuno': return '7:00 - 9:00';
      case 'snack_morning': return '10:30 - 11:30';
      case 'almuerzo': return '13:00 - 14:30';
      case 'snack_afternoon': return '16:30 - 17:30';
      case 'cena': return '20:00 - 21:30';
      case 'snack': return '11:00 o 17:00';
      default: return '';
    }
  }
  
  // Obtener etiqueta para tipo de dieta
  const getDietTypeLabel = (dietType: string): string => {
    const dietTypes: {[key: string]: string} = {
      'standard': 'Estándar',
      'vegetarian': 'Vegetariana',
      'vegan': 'Vegana',
      'keto': 'Cetogénica',
      'paleo': 'Paleo',
      'mediterranean': 'Mediterránea',
      'low_carb': 'Baja en carbos',
      'high_protein': 'Alta en proteínas',
      'custom': 'Personalizada'
    }
    
    return dietTypes[dietType] || 'Personalizada'
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-500">Cargando planes de alimentación...</p>
        </div>
      </div>
    )
  }
  
  if (diets.length === 0) {
    return (
      <div className="text-center py-12">
        <Utensils className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No tienes planes de alimentación</h3>
        <p className="text-gray-500 mb-6">Crea tu primer plan de alimentación personalizado</p>
        <Button className="rounded-full">
          <ChevronRight className="h-4 w-4 mr-2" />
          Crear plan de alimentación
        </Button>
      </div>
    )
  }
  
  const selectedDayData = getSelectedDayData()
  
  return (
    <div className="space-y-6">
      <OrganicElement type="fade">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold">{selectedDiet?.name}</h3>
              <p className="text-gray-500 text-sm">{selectedDiet?.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{getDietTypeLabel(selectedDiet?.dietType || 'standard')}</Badge>
                <Badge variant="outline">{selectedDiet?.mealsPerDay} comidas/día</Badge>
                <Badge variant="outline">
                  {selectedDiet?.calorieTarget} kcal/día
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <FileText className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" className="rounded-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Progreso diario</h4>
            {selectedDiet && selectedDayData && (
              <div className="space-y-2">
                {renderMacroProgress(
                  selectedDayData.totalProtein, 
                  selectedDiet.proteinTarget, 
                  "Proteínas", 
                  "bg-blue-500"
                )}
                {renderMacroProgress(
                  selectedDayData.totalCarbs, 
                  selectedDiet.carbsTarget, 
                  "Carbohidratos", 
                  "bg-amber-500"
                )}
                {renderMacroProgress(
                  selectedDayData.totalFat, 
                  selectedDiet.fatTarget, 
                  "Grasas", 
                  "bg-green-500"
                )}
                {renderMacroProgress(
                  selectedDayData.totalCalories, 
                  selectedDiet.calorieTarget, 
                  "Calorías", 
                  "bg-purple-500"
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Día {selectedDay}</h4>
              <div className="flex gap-1">
                {Array.from({ length: dietDays.length }, (_, i) => i + 1).map(day => (
                  <Button
                    key={day}
                    variant={day === selectedDay ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {isLoadingDays ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : selectedDayData ? (
            <div>
              <ScrollArea className="h-[500px] pr-4">
                {selectedDayData.meals.sort((a, b) => {
                  const mealOrder: {[key: string]: number} = {
                    'desayuno': 1,
                    'snack_morning': 2,
                    'almuerzo': 3,
                    'snack_afternoon': 4,
                    'cena': 5,
                    'snack': 2.5 // Colocar entre desayuno y almuerzo si no está especificado
                  }
                  return (mealOrder[a.mealType] || 99) - (mealOrder[b.mealType] || 99)
                }).map(meal => renderMeal(meal))}
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay datos disponibles para este día</p>
            </div>
          )}
        </Card>
      </OrganicElement>
    </div>
  )
}
