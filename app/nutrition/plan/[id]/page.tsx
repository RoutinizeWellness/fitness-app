"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { use } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Utensils,
  Clock,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle,
  Coffee,
  Soup,
  UtensilsCrossed,
  Cookie,
  Info
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface MealPlan {
  id: string
  userId: string
  name: string
  description: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  startDate: string  // Campo obligatorio según la estructura de la tabla
  endDate: string    // Campo obligatorio según la estructura de la tabla
  days: MealPlanDay[]
  createdAt: string
  isActive: boolean
  isTemplate?: boolean  // Campo adicional según la estructura de la tabla
}

interface MealPlanDay {
  id: string
  name: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes: string
}

interface Meal {
  id: string
  name: string
  time: string
  foods: MealFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface MealFood {
  id: string
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
}

export default function NutritionPlanPage({ params }: { params: { id: string } }) {
  // Usar React.use() para desenvolver params
  const unwrappedParams = use(params)
  const planId = unwrappedParams.id

  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [activeDay, setActiveDay] = useState<string | null>(null)

  // Cargar detalles del plan de nutrición
  useEffect(() => {
    const loadNutritionPlan = async () => {
      if (!user || !planId) return

      console.log(`Loading nutrition plan with ID: ${planId}`)
      setIsLoading(true)

      // Función auxiliar para mostrar datos de ejemplo
      const showSampleData = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
          title,
          description,
          variant,
        })

        // Crear un plan de ejemplo
        console.log(`Generating sample meal plan for ID: ${planId}`)
        const samplePlan = getSampleMealPlan(planId, user.id)
        console.log(`Sample plan generated: ${samplePlan.name}`)
        setMealPlan(samplePlan)
        setActiveDay(samplePlan.days[0].id)
        setIsLoading(false)
      }

      try {
        // Verificar que supabase esté definido
        if (!supabase) {
          console.error('Error: supabase no está definido en nutrition-plan/[id]/page.tsx')
          showSampleData(
            "Error de configuración",
            "Error en la configuración de la base de datos. Usando datos predeterminados.",
            "destructive"
          )
          return
        }

        // Verificar conexión a Supabase
        try {

          // Verificar la conexión a Supabase con una consulta simple
          try {
            const { count, error: connectionError } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .limit(1)

            if (connectionError) {
              console.warn('Error de conexión a Supabase:', connectionError)
              showSampleData(
                "Error de conexión",
                "No se pudo conectar a la base de datos. Usando datos de ejemplo."
              )
              return
            }
          } catch (connectionError) {
            console.error('Error al verificar la conexión:', connectionError)
            showSampleData(
              "Error de conexión",
              "Error al verificar la conexión a la base de datos. Usando datos predeterminados.",
              "destructive"
            )
            return
          }

          // Verificar si la tabla existe
          try {
            const { count, error: tableError } = await supabase
              .from('meal_plans')
              .select('*', { count: 'exact', head: true })
              .limit(1)

            if (tableError) {
              console.warn('La tabla meal_plans no existe:', tableError)
              showSampleData(
                "Información",
                "La tabla de planes de nutrición no existe. Usando datos de ejemplo."
              )
              return
            }
          } catch (tableError) {
            console.error('Error al verificar la tabla:', tableError)
            showSampleData(
              "Error de estructura",
              "Error al verificar la estructura de la base de datos. Usando datos predeterminados.",
              "destructive"
            )
            return
          }
        } catch (error) {
          console.error("Error al verificar la conexión o la tabla:", error)
          showSampleData(
            "Error de conexión",
            "Error al verificar la conexión a la base de datos. Usando datos predeterminados.",
            "destructive"
          )
          return
        }

        // Obtener el plan de nutrición
        let data = null;
        let error = null;

        try {
          // Validar que el ID del plan tenga un formato válido
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

          // Verificar si el ID es un UUID válido
          if (!uuidRegex.test(planId)) {
            console.warn(`ID de plan inválido: "${planId}". Se esperaba un UUID.`);

            // Registrar información detallada para depuración
            console.info('Información de depuración:', {
              planId,
              isUUID: uuidRegex.test(planId),
              length: planId.length,
              format: 'Debe ser: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            });

            showSampleData(
              "Error",
              `Error: Invalid input syntax for type uuid: "${planId}". Mostrando datos de ejemplo.`,
              "destructive"
            );
            return;
          }

          // Realizar la consulta a Supabase con manejo específico para la estructura de la tabla
          try {
            // Primero, verificar si el plan existe
            const checkResult = await supabase
              .from('meal_plans')
              .select('id')
              .eq('id', planId)
              .maybeSingle();

            if (checkResult.error) {
              console.error('Error al verificar si el plan existe:', checkResult.error);
              throw new Error(`Error al verificar si el plan existe: ${JSON.stringify(checkResult.error)}`);
            }

            if (!checkResult.data) {
              console.warn(`No se encontró ningún plan con ID: ${planId}`);
              showSampleData(
                "Plan no encontrado",
                `No se encontró ningún plan de nutrición con ID: ${planId}. Mostrando datos de ejemplo.`
              );
              return;
            }

            // Si el plan existe, obtener todos los detalles
            const result = await supabase
              .from('meal_plans')
              .select('*')
              .eq('id', planId)
              .single();

            data = result.data;
            error = result.error;

            // Registrar la respuesta para depuración
            console.log('Respuesta de Supabase:', {
              data,
              error,
              hasData: !!data,
              errorKeys: error ? Object.keys(error) : 'No hay error'
            });
          } catch (queryError) {
            console.error('Error al ejecutar consulta a Supabase:', queryError);
            throw queryError;
          }

        } catch (fetchError) {
          console.error('Error al intentar obtener el plan de nutrición:', fetchError);
          showSampleData(
            "Error",
            "Error al intentar obtener el plan de nutrición. Mostrando datos de ejemplo.",
            "destructive"
          );
          return;
        }

        // Manejar errores
        if (error) {
          console.error('Error al cargar el plan de nutrición:', error);

          // Manejar errores vacíos
          if (typeof error === 'object' && Object.keys(error).length === 0) {
            console.warn('Error vacío al cargar el plan de nutrición, usando datos de ejemplo');

            // Verificar si hay problemas con los campos obligatorios
            try {
              // Intentar obtener información sobre el error
              const { data: errorInfo, error: debugError } = await supabase.rpc('debug_last_error');

              if (errorInfo) {
                console.info('Información de depuración del error:', errorInfo);
                showSampleData(
                  "Error",
                  `Error en la base de datos: ${errorInfo}. Mostrando datos de ejemplo.`,
                  "destructive"
                );
              } else {
                // Si no hay información específica, mostrar un mensaje genérico
                console.info('No se pudo obtener información detallada del error');
                showSampleData(
                  "Error",
                  "Error desconocido al cargar el plan de nutrición. Mostrando datos de ejemplo.",
                  "destructive"
                );
              }
            } catch (debugError) {
              console.error('Error al intentar depurar el error vacío:', debugError);
              showSampleData(
                "Error",
                "Error desconocido al cargar el plan de nutrición. Mostrando datos de ejemplo.",
                "destructive"
              );
            }
            return;
          }

          // Mostrar mensaje de error específico según el tipo de error
          let errorMessage = "Ocurrió un error al cargar el plan de nutrición.";

          if (error.code === "PGRST116") {
            errorMessage = "No se encontró el plan de nutrición solicitado.";
          } else if (error.code === "PGRST301") {
            errorMessage = "Error de permisos al acceder al plan de nutrición.";
          } else if (error.code === "22P02") {
            errorMessage = `ID de plan inválido: "${planId}". Se esperaba un UUID válido.`;
          } else if (error.code === "23502") {
            // Error de violación de NOT NULL constraint
            errorMessage = "Faltan campos obligatorios en el plan de nutrición.";

            // Intentar identificar qué campo está causando el problema
            if (error.message && error.message.includes("column")) {
              const match = error.message.match(/column "(.*?)" of/);
              if (match && match[1]) {
                errorMessage = `Falta el campo obligatorio "${match[1]}" en el plan de nutrición.`;
              }
            }
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }

          // Registrar información detallada del error para depuración
          console.info('Detalles del error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });

          showSampleData("Error", errorMessage + " Mostrando datos de ejemplo.", "destructive");
          return;
        }

        if (!data) {
          console.error('Error al cargar el plan de nutrición: No se encontró el plan')
          showSampleData(
            "Plan no encontrado",
            "No se pudo encontrar el plan de nutrición solicitado. Mostrando datos de ejemplo."
          )
          return
        }

        // Transformar datos al formato de la aplicación
        const transformedPlan: MealPlan = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          description: data.description || "",
          targetCalories: data.target_calories || 2000,
          targetProtein: data.target_protein || 150,
          targetCarbs: data.target_carbs || 200,
          targetFat: data.target_fat || 70,
          startDate: data.start_date,
          endDate: data.end_date,
          days: data.days || [],
          createdAt: data.created_at,
          isActive: data.is_active,
          isTemplate: data.is_template
        }

        setMealPlan(transformedPlan)

        // Establecer el primer día como activo por defecto
        if (transformedPlan.days && transformedPlan.days.length > 0) {
          setActiveDay(transformedPlan.days[0].id)
        }
      } catch (error) {
        console.error('Error inesperado al cargar el plan de nutrición:', error)

        // Determinar si es un error de formato UUID
        let errorMessage = "Ocurrió un error inesperado al cargar el plan.";

        if (error instanceof Error && error.message.includes("uuid")) {
          errorMessage = `Error de formato: "${planId}" no es un ID válido.`;
        }

        showSampleData("Error", errorMessage + " Mostrando datos de ejemplo.", "destructive");
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionPlan()
  }, [user, planId, toast])

  // Renderizar estado de carga
  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // Renderizar mensaje si no hay datos
  if (!mealPlan) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/nutrition')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Plan de Nutrición</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Plan no encontrado</h3>
            <p className="text-center text-gray-500 mb-4">
              No se pudo encontrar el plan de nutrición solicitado.
            </p>
            <Button onClick={() => router.push('/nutrition')}>
              Volver a Nutrición
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obtener el día activo
  const activeDayData = activeDay
    ? mealPlan.days.find(day => day.id === activeDay)
    : mealPlan.days[0];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/nutrition')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Plan de Nutrición</h1>
      </div>

      {/* Información general */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{mealPlan.name}</CardTitle>
              <CardDescription>
                {mealPlan.description}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" title="Editar plan">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">
              {mealPlan.targetCalories} kcal
            </Badge>
            <Badge variant="outline">
              P: {mealPlan.targetProtein}g
            </Badge>
            <Badge variant="outline">
              C: {mealPlan.targetCarbs}g
            </Badge>
            <Badge variant="outline">
              G: {mealPlan.targetFat}g
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={activeDay || ""} onValueChange={setActiveDay} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              {mealPlan.days.map((day, index) => (
                <TabsTrigger key={day.id} value={day.id}>
                  {`Día ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeDayData && (
              <TabsContent value={activeDayData.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{activeDayData.name}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calorías</span>
                    <span className="text-sm">{activeDayData.totalCalories} / {mealPlan.targetCalories} kcal</span>
                  </div>
                  <Progress value={(activeDayData.totalCalories / mealPlan.targetCalories) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <div className="font-medium mb-1">Proteínas</div>
                    <div className="text-lg font-bold">{activeDayData.totalProtein}g</div>
                    <div className="text-xs text-muted-foreground">{Math.round((activeDayData.totalProtein / mealPlan.targetProtein) * 100)}%</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <div className="font-medium mb-1">Carbohidratos</div>
                    <div className="text-lg font-bold">{activeDayData.totalCarbs}g</div>
                    <div className="text-xs text-muted-foreground">{Math.round((activeDayData.totalCarbs / mealPlan.targetCarbs) * 100)}%</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <div className="font-medium mb-1">Grasas</div>
                    <div className="text-lg font-bold">{activeDayData.totalFat}g</div>
                    <div className="text-xs text-muted-foreground">{Math.round((activeDayData.totalFat / mealPlan.targetFat) * 100)}%</div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h4 className="font-medium">Comidas del día</h4>

                  {activeDayData.meals.map((meal) => (
                    <Card key={meal.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getMealIcon(meal.name)}
                            <CardTitle className="text-base ml-2">{meal.name}</CardTitle>
                          </div>
                          <Badge variant="outline">{meal.time}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2">
                          {meal.foods.map((food) => (
                            <div key={food.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                              <div>
                                <div className="font-medium">{food.name}</div>
                                <div className="text-xs text-muted-foreground">{food.quantity} {food.unit}</div>
                              </div>
                              <div className="text-sm text-right">
                                <div>{food.calories} kcal</div>
                                <div className="text-xs text-muted-foreground">
                                  P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                          <div>Total de la comida</div>
                          <div className="font-medium">{meal.totalCalories} kcal</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Función para obtener el icono según el tipo de comida
function getMealIcon(mealName: string) {
  const name = mealName.toLowerCase();

  if (name.includes('desayuno')) {
    return <Coffee className="h-5 w-5 text-amber-500" />;
  } else if (name.includes('almuerzo') || name.includes('comida')) {
    return <Soup className="h-5 w-5 text-orange-500" />;
  } else if (name.includes('cena')) {
    return <UtensilsCrossed className="h-5 w-5 text-indigo-500" />;
  } else if (name.includes('snack') || name.includes('merienda')) {
    return <Cookie className="h-5 w-5 text-pink-500" />;
  } else {
    return <Utensils className="h-5 w-5 text-gray-500" />;
  }
}

// Función para generar un plan de comidas de ejemplo
function getSampleMealPlan(planId: string, userId: string): MealPlan {
  // Generar fechas para start_date y end_date (campos obligatorios según la estructura de la tabla)
  const today = new Date();
  const startDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // Fecha de fin: 30 días después
  const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Determinar qué tipo de plan devolver basado en el ID
  // Los IDs corresponden a los definidos en app/nutrition/page.tsx
  if (planId === "2") {
    // Plan de ganancia muscular
    return {
      id: planId,
      userId: userId,
      name: "Muscle Gain Plan",
      description: "High protein diet for muscle growth",
      targetCalories: 2500,
      targetProtein: 200,
      targetCarbs: 250,
      targetFat: 70,
      startDate: startDate,
      endDate: endDate,
      days: [
        {
          id: "day-1",
          name: "Día 1",
          totalCalories: 2450,
          totalProtein: 195,
          totalCarbs: 245,
          totalFat: 68,
          notes: "Día de entrenamiento de fuerza",
          meals: [
            {
              id: "meal-1",
              name: "Desayuno",
              time: "07:30",
              totalCalories: 650,
              totalProtein: 45,
              totalCarbs: 70,
              totalFat: 20,
              foods: [
                {
                  id: "food-1",
                  name: "Tortilla de claras con espinacas",
                  quantity: 1,
                  unit: "porción",
                  calories: 300,
                  protein: 30,
                  carbs: 5,
                  fat: 15
                },
                {
                  id: "food-2",
                  name: "Avena con plátano y miel",
                  quantity: 100,
                  unit: "g",
                  calories: 350,
                  protein: 15,
                  carbs: 65,
                  fat: 5
                }
              ]
            },
            {
              id: "meal-2",
              name: "Snack",
              time: "10:30",
              totalCalories: 300,
              totalProtein: 30,
              totalCarbs: 30,
              totalFat: 5,
              foods: [
                {
                  id: "food-3",
                  name: "Batido de proteínas",
                  quantity: 1,
                  unit: "porción",
                  calories: 150,
                  protein: 25,
                  carbs: 5,
                  fat: 2
                },
                {
                  id: "food-4",
                  name: "Plátano",
                  quantity: 1,
                  unit: "unidad",
                  calories: 150,
                  protein: 5,
                  carbs: 25,
                  fat: 3
                }
              ]
            },
            {
              id: "meal-3",
              name: "Almuerzo",
              time: "13:30",
              totalCalories: 800,
              totalProtein: 60,
              totalCarbs: 80,
              totalFat: 25,
              foods: [
                {
                  id: "food-5",
                  name: "Filete de ternera",
                  quantity: 200,
                  unit: "g",
                  calories: 400,
                  protein: 50,
                  carbs: 0,
                  fat: 20
                },
                {
                  id: "food-6",
                  name: "Arroz integral",
                  quantity: 150,
                  unit: "g",
                  calories: 250,
                  protein: 5,
                  carbs: 50,
                  fat: 2
                },
                {
                  id: "food-7",
                  name: "Brócoli al vapor",
                  quantity: 150,
                  unit: "g",
                  calories: 150,
                  protein: 5,
                  carbs: 30,
                  fat: 3
                }
              ]
            },
            {
              id: "meal-4",
              name: "Cena",
              time: "20:00",
              totalCalories: 700,
              totalProtein: 60,
              totalCarbs: 65,
              totalFat: 18,
              foods: [
                {
                  id: "food-8",
                  name: "Pechuga de pollo a la plancha",
                  quantity: 200,
                  unit: "g",
                  calories: 330,
                  protein: 50,
                  carbs: 0,
                  fat: 10
                },
                {
                  id: "food-9",
                  name: "Patata al horno",
                  quantity: 200,
                  unit: "g",
                  calories: 220,
                  protein: 5,
                  carbs: 50,
                  fat: 0
                },
                {
                  id: "food-10",
                  name: "Ensalada mixta con aceite de oliva",
                  quantity: 1,
                  unit: "porción",
                  calories: 150,
                  protein: 5,
                  carbs: 15,
                  fat: 8
                }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true,
      isTemplate: false
    };
  } else if (planId === "3") {
    // Plan de dieta equilibrada
    return {
      id: planId,
      userId: userId,
      name: "Balanced Diet",
      description: "Balanced macronutrients for maintenance",
      targetCalories: 2200,
      targetProtein: 120,
      targetCarbs: 220,
      targetFat: 75,
      startDate: startDate,
      endDate: endDate,
      days: [
        {
          id: "day-1",
          name: "Día 1",
          totalCalories: 2150,
          totalProtein: 115,
          totalCarbs: 215,
          totalFat: 73,
          notes: "Plan equilibrado para mantenimiento",
          meals: [
            {
              id: "meal-1",
              name: "Desayuno",
              time: "08:00",
              totalCalories: 500,
              totalProtein: 20,
              totalCarbs: 60,
              totalFat: 20,
              foods: [
                {
                  id: "food-1",
                  name: "Tostadas de pan integral",
                  quantity: 2,
                  unit: "unidades",
                  calories: 200,
                  protein: 8,
                  carbs: 30,
                  fat: 4
                },
                {
                  id: "food-2",
                  name: "Aguacate",
                  quantity: 1/2,
                  unit: "unidad",
                  calories: 150,
                  protein: 2,
                  carbs: 5,
                  fat: 15
                },
                {
                  id: "food-3",
                  name: "Huevo revuelto",
                  quantity: 2,
                  unit: "unidades",
                  calories: 150,
                  protein: 10,
                  carbs: 5,
                  fat: 1
                }
              ]
            },
            {
              id: "meal-2",
              name: "Almuerzo",
              time: "13:00",
              totalCalories: 650,
              totalProtein: 40,
              totalCarbs: 70,
              totalFat: 25,
              foods: [
                {
                  id: "food-4",
                  name: "Ensalada mediterránea",
                  quantity: 1,
                  unit: "porción",
                  calories: 250,
                  protein: 10,
                  carbs: 20,
                  fat: 15
                },
                {
                  id: "food-5",
                  name: "Pasta integral con tomate",
                  quantity: 100,
                  unit: "g",
                  calories: 300,
                  protein: 15,
                  carbs: 45,
                  fat: 5
                },
                {
                  id: "food-6",
                  name: "Pollo a la plancha",
                  quantity: 100,
                  unit: "g",
                  calories: 100,
                  protein: 15,
                  carbs: 5,
                  fat: 5
                }
              ]
            },
            {
              id: "meal-3",
              name: "Merienda",
              time: "17:00",
              totalCalories: 300,
              totalProtein: 15,
              totalCarbs: 35,
              totalFat: 10,
              foods: [
                {
                  id: "food-7",
                  name: "Yogur natural",
                  quantity: 1,
                  unit: "unidad",
                  calories: 150,
                  protein: 10,
                  carbs: 15,
                  fat: 5
                },
                {
                  id: "food-8",
                  name: "Frutos secos mixtos",
                  quantity: 30,
                  unit: "g",
                  calories: 150,
                  protein: 5,
                  carbs: 20,
                  fat: 5
                }
              ]
            },
            {
              id: "meal-4",
              name: "Cena",
              time: "20:30",
              totalCalories: 700,
              totalProtein: 40,
              totalCarbs: 50,
              totalFat: 18,
              foods: [
                {
                  id: "food-9",
                  name: "Pescado al horno",
                  quantity: 150,
                  unit: "g",
                  calories: 300,
                  protein: 30,
                  carbs: 0,
                  fat: 10
                },
                {
                  id: "food-10",
                  name: "Quinoa con verduras",
                  quantity: 150,
                  unit: "g",
                  calories: 250,
                  protein: 8,
                  carbs: 40,
                  fat: 5
                },
                {
                  id: "food-11",
                  name: "Ensalada verde",
                  quantity: 1,
                  unit: "porción",
                  calories: 150,
                  protein: 2,
                  carbs: 10,
                  fat: 3
                }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true,
      isTemplate: false
    };
  } else {
    // Plan de pérdida de peso (por defecto o cuando planId === "1")
    return {
      id: planId,
      userId: userId,
      name: "Weight Loss Plan",
      description: "Calorie deficit diet plan",
      targetCalories: 1800,
      targetProtein: 150,
      targetCarbs: 150,
      targetFat: 60,
      startDate: startDate,
      endDate: endDate,
      days: [
        {
          id: "day-1",
          name: "Día 1",
          totalCalories: 1750,
          totalProtein: 145,
          totalCarbs: 145,
          totalFat: 58,
          notes: "Primer día del plan",
          meals: [
            {
              id: "meal-1",
              name: "Desayuno",
              time: "08:00",
              totalCalories: 450,
              totalProtein: 30,
              totalCarbs: 45,
              totalFat: 15,
              foods: [
                {
                  id: "food-1",
                  name: "Avena con frutas",
                  quantity: 100,
                  unit: "g",
                  calories: 350,
                  protein: 12,
                  carbs: 60,
                  fat: 8
                },
                {
                  id: "food-2",
                  name: "Yogur griego",
                  quantity: 150,
                  unit: "g",
                  calories: 100,
                  protein: 18,
                  carbs: 5,
                  fat: 0
                }
              ]
            },
            {
              id: "meal-2",
              name: "Almuerzo",
              time: "13:00",
              totalCalories: 650,
              totalProtein: 50,
              totalCarbs: 60,
              totalFat: 20,
              foods: [
                {
                  id: "food-3",
                  name: "Pechuga de pollo a la plancha",
                  quantity: 150,
                  unit: "g",
                  calories: 250,
                  protein: 45,
                  carbs: 0,
                  fat: 5
                },
                {
                  id: "food-4",
                  name: "Arroz integral",
                  quantity: 100,
                  unit: "g",
                  calories: 150,
                  protein: 3,
                  carbs: 30,
                  fat: 1
                },
                {
                  id: "food-5",
                  name: "Ensalada mixta",
                  quantity: 200,
                  unit: "g",
                  calories: 100,
                  protein: 2,
                  carbs: 10,
                  fat: 5
                }
              ]
            },
            {
              id: "meal-3",
              name: "Cena",
              time: "20:00",
              totalCalories: 550,
              totalProtein: 40,
              totalCarbs: 30,
              totalFat: 25,
              foods: [
                {
                  id: "food-6",
                  name: "Salmón al horno",
                  quantity: 150,
                  unit: "g",
                  calories: 300,
                  protein: 35,
                  carbs: 0,
                  fat: 15
                },
                {
                  id: "food-7",
                  name: "Verduras al vapor",
                  quantity: 200,
                  unit: "g",
                  calories: 100,
                  protein: 5,
                  carbs: 15,
                  fat: 2
                },
                {
                  id: "food-8",
                  name: "Batata asada",
                  quantity: 100,
                  unit: "g",
                  calories: 150,
                  protein: 2,
                  carbs: 30,
                  fat: 0
                }
              ]
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true,
      isTemplate: false
    };
  }
}
