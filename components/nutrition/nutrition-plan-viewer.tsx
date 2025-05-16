"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
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
  Loader2,
  Edit,
  Check,
  X,
  AlertCircle,
  Info,
  ArrowLeft
} from "lucide-react"
import {
  getPersonalizedDiet,
  getDietDays,
  getDietMeals,
  getDietFoods,
  updatePersonalizedDiet,
  updateDietDay,
  updateDietMeal,
  updateDietFood,
  deleteDietFood,
  addDietFood
} from "@/lib/personalized-diet-service"
import { Progress3D } from "@/components/ui/progress-3d"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"

// Define types based on the database schema
interface PersonalizedDiet {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  diet_type: string;
  start_date: string;
  end_date: string;
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  meals_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PersonalizedDietDay {
  id: string;
  diet_id: string;
  day_number: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
  updated_at: string;
}

interface PersonalizedDietMeal {
  id: string;
  diet_day_id: string;
  meal_type: string;
  name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PersonalizedDietFood {
  id: string;
  meal_id: string;
  food_id?: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  updated_at: string;
}

interface NutritionPlanViewerProps {
  userId: string;
  dietId?: string;
  onBack?: () => void;
}

export default function NutritionPlanViewer({
  userId,
  dietId,
  onBack
}: NutritionPlanViewerProps) {
  const [diet, setDiet] = useState<PersonalizedDiet | null>(null);
  const [dietDays, setDietDays] = useState<PersonalizedDietDay[]>([]);
  const [meals, setMeals] = useState<{[key: string]: PersonalizedDietMeal[]}>({}); // Indexed by diet_day_id
  const [foods, setFoods] = useState<{[key: string]: PersonalizedDietFood[]}>({}); // Indexed by meal_id
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editingDiet, setEditingDiet] = useState<PersonalizedDiet | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch diet data
  useEffect(() => {
    const loadDietData = async () => {
      if (!dietId) return;

      setIsLoading(true);
      try {
        // Get diet details
        const { data: dietData, error: dietError } = await getPersonalizedDiet(dietId);

        if (dietError || !dietData) {
          throw new Error(dietError?.message || "No se pudo cargar la dieta");
        }

        setDiet(dietData);

        // Get diet days
        const { data: daysData, error: daysError } = await getDietDays(dietId);

        if (daysError || !daysData) {
          throw new Error(daysError?.message || "No se pudieron cargar los días de la dieta");
        }

        // Sort days by day_number
        const sortedDays = [...daysData].sort((a, b) => a.day_number - b.day_number);
        setDietDays(sortedDays);

        // If there are days, expand the first one by default
        if (sortedDays.length > 0) {
          setExpandedDay(sortedDays[0].id);

          // Load meals for all days
          const mealsObj: {[key: string]: PersonalizedDietMeal[]} = {};
          const foodsObj: {[key: string]: PersonalizedDietFood[]} = {};

          for (const day of sortedDays) {
            const { data: mealsData, error: mealsError } = await getDietMeals(day.id);

            if (!mealsError && mealsData && mealsData.length > 0) {
              mealsObj[day.id] = mealsData;

              // Load foods for each meal
              for (const meal of mealsData) {
                const { data: foodsData, error: foodsError } = await getDietFoods(meal.id);

                if (!foodsError && foodsData) {
                  foodsObj[meal.id] = foodsData;
                }
              }
            }
          }

          setMeals(mealsObj);
          setFoods(foodsObj);
        }
      } catch (error) {
        console.error("Error loading diet data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el plan nutricional",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDietData();
  }, [dietId, toast]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  // Helper function to get day date
  const getDayDate = (startDate: string, dayNumber: number) => {
    return format(addDays(new Date(startDate), dayNumber - 1), "EEEE, d 'de' MMMM", { locale: es });
  };

  // Helper function to toggle expanded day
  const toggleDay = (dayId: string) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
    setExpandedMeal(null); // Close any expanded meal when toggling day
  };

  // Helper function to toggle expanded meal
  const toggleMeal = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  // Helper function to get meal icon
  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'desayuno':
        return <Coffee className="h-4 w-4" />;
      case 'almuerzo':
        return <Utensils className="h-4 w-4" />;
      case 'cena':
        return <Moon className="h-4 w-4" />;
      case 'snack':
        return <Apple className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  // Helper function to calculate macro percentages
  const calculateMacroPercentage = (macro: number, calories: number) => {
    if (!calories) return 0;

    switch (macro) {
      case 'protein':
        return (diet?.protein_target * 4 / diet?.calorie_target) * 100;
      case 'carbs':
        return (diet?.carbs_target * 4 / diet?.calorie_target) * 100;
      case 'fat':
        return (diet?.fat_target * 9 / diet?.calorie_target) * 100;
      default:
        return 0;
    }
  };

  // Function to start editing the diet
  const startEditingDiet = () => {
    if (diet) {
      setEditingDiet({...diet});
      setIsEditing(true);
    }
  };

  // Function to save diet changes
  const saveDietChanges = async () => {
    if (!editingDiet) return;

    setIsSaving(true);
    try {
      const { data, error } = await updatePersonalizedDiet(editingDiet.id, editingDiet);

      if (error) throw error;

      setDiet(data);
      setIsEditing(false);
      setEditingDiet(null);

      toast({
        title: "Cambios guardados",
        description: "Los cambios en el plan nutricional han sido guardados correctamente",
      });
    } catch (error) {
      console.error("Error saving diet changes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingDiet(null);
    setEditingDay(null);
    setEditingMeal(null);
    setEditingFood(null);
  };

  // Function to handle diet field changes
  const handleDietChange = (field: keyof PersonalizedDiet, value: any) => {
    if (editingDiet) {
      setEditingDiet({
        ...editingDiet,
        [field]: value
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Render error state if no diet found
  if (!diet) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            Plan no encontrado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se pudo encontrar el plan nutricional solicitado.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack}>Volver</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {isEditing && editingDiet ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingDiet.name}
                onChange={(e) => handleDietChange('name', e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none"
              />
            </div>
          ) : (
            <h2 className="text-2xl font-bold">{diet.name}</h2>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {diet.diet_type.charAt(0).toUpperCase() + diet.diet_type.slice(1)}
          </Badge>

          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={saveDietChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Guardar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startEditingDiet}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="daily">Plan Diario</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Información General</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Periodo</p>
                  {isEditing && editingDiet ? (
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={editingDiet.start_date}
                        onChange={(e) => handleDietChange('start_date', e.target.value)}
                        className="text-sm p-1 border rounded"
                      />
                      <span>-</span>
                      <input
                        type="date"
                        value={editingDiet.end_date}
                        onChange={(e) => handleDietChange('end_date', e.target.value)}
                        className="text-sm p-1 border rounded"
                      />
                    </div>
                  ) : (
                    <p className="font-medium">
                      {formatDate(diet.start_date)} - {formatDate(diet.end_date)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comidas por día</p>
                  {isEditing && editingDiet ? (
                    <select
                      value={editingDiet.meals_per_day}
                      onChange={(e) => handleDietChange('meals_per_day', parseInt(e.target.value))}
                      className="text-sm p-1 border rounded"
                    >
                      {[3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium">{diet.meals_per_day}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Objetivo calórico</p>
                  {isEditing && editingDiet ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={editingDiet.calorie_target}
                        onChange={(e) => handleDietChange('calorie_target', parseInt(e.target.value))}
                        className="text-sm p-1 border rounded w-24"
                        min="1000"
                        max="5000"
                        step="50"
                      />
                      <span className="ml-1">kcal</span>
                    </div>
                  ) : (
                    <p className="font-medium">{diet.calorie_target} kcal</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  {isEditing && editingDiet ? (
                    <select
                      value={editingDiet.is_active ? "active" : "inactive"}
                      onChange={(e) => handleDietChange('is_active', e.target.value === "active")}
                      className="text-sm p-1 border rounded"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  ) : (
                    <Badge variant={diet.is_active ? "default" : "secondary"}>
                      {diet.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Descripción</p>
                {isEditing && editingDiet ? (
                  <textarea
                    value={editingDiet.description || ""}
                    onChange={(e) => handleDietChange('description', e.target.value)}
                    className="w-full text-sm mt-1 p-2 border rounded"
                    rows={3}
                  />
                ) : (
                  diet.description && <p className="text-sm mt-1">{diet.description}</p>
                )}
              </div>
            </Card3DContent>
          </Card3D>

          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Distribución de Macronutrientes</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Proteínas: </span>
                      {isEditing && editingDiet ? (
                        <div className="flex items-center ml-1">
                          <input
                            type="number"
                            value={editingDiet.protein_target}
                            onChange={(e) => handleDietChange('protein_target', parseInt(e.target.value))}
                            className="text-sm p-1 border rounded w-16"
                            min="20"
                            max="300"
                            step="5"
                          />
                          <span className="ml-1">g</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium ml-1">{diet.protein_target}g</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(calculateMacroPercentage('protein', diet.calorie_target))}%
                    </span>
                  </div>
                  <Progress3D value={calculateMacroPercentage('protein', diet.calorie_target)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Carbohidratos: </span>
                      {isEditing && editingDiet ? (
                        <div className="flex items-center ml-1">
                          <input
                            type="number"
                            value={editingDiet.carbs_target}
                            onChange={(e) => handleDietChange('carbs_target', parseInt(e.target.value))}
                            className="text-sm p-1 border rounded w-16"
                            min="20"
                            max="500"
                            step="5"
                          />
                          <span className="ml-1">g</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium ml-1">{diet.carbs_target}g</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(calculateMacroPercentage('carbs', diet.calorie_target))}%
                    </span>
                  </div>
                  <Progress3D value={calculateMacroPercentage('carbs', diet.calorie_target)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Grasas: </span>
                      {isEditing && editingDiet ? (
                        <div className="flex items-center ml-1">
                          <input
                            type="number"
                            value={editingDiet.fat_target}
                            onChange={(e) => handleDietChange('fat_target', parseInt(e.target.value))}
                            className="text-sm p-1 border rounded w-16"
                            min="10"
                            max="200"
                            step="5"
                          />
                          <span className="ml-1">g</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium ml-1">{diet.fat_target}g</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(calculateMacroPercentage('fat', diet.calorie_target))}%
                    </span>
                  </div>
                  <Progress3D value={calculateMacroPercentage('fat', diet.calorie_target)} className="h-2" />
                </div>

                {isEditing && editingDiet && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      Total de calorías estimadas: {
                        Math.round(
                          (editingDiet.protein_target * 4) +
                          (editingDiet.carbs_target * 4) +
                          (editingDiet.fat_target * 9)
                        )
                      } kcal
                      {Math.abs(
                        Math.round(
                          (editingDiet.protein_target * 4) +
                          (editingDiet.carbs_target * 4) +
                          (editingDiet.fat_target * 9)
                        ) - editingDiet.calorie_target
                      ) > 50 && (
                        <span className="text-red-500 ml-2">
                          (Difiere del objetivo calórico en {
                            Math.abs(
                              Math.round(
                                (editingDiet.protein_target * 4) +
                                (editingDiet.carbs_target * 4) +
                                (editingDiet.fat_target * 9)
                              ) - editingDiet.calorie_target
                            )
                          } kcal)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>

        {/* Daily Plan Tab */}
        <TabsContent value="daily" className="space-y-4">
          {dietDays.length > 0 ? (
            dietDays.map((day) => (
              <Card key={day.id} className={`overflow-hidden transition-all ${expandedDay === day.id ? 'ring-1 ring-primary' : ''}`}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleDay(day.id)}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Día {day.day_number}: {getDayDate(diet.start_date, day.day_number)}
                    </CardTitle>
                    <Button variant="ghost" size="icon">
                      {expandedDay === day.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>{day.total_calories} kcal</span>
                    <span>P: {day.total_protein}g</span>
                    <span>C: {day.total_carbs}g</span>
                    <span>G: {day.total_fat}g</span>
                  </div>
                </CardHeader>

                {expandedDay === day.id && (
                  <CardContent>
                    <div className="space-y-4">
                      {meals[day.id] && meals[day.id].length > 0 ? (
                        meals[day.id].map((meal) => (
                          <div key={meal.id} className="border rounded-lg overflow-hidden">
                            <div
                              className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                              onClick={() => toggleMeal(meal.id)}
                            >
                              <div className="flex items-center">
                                <div className={`
                                  p-1.5 rounded-full mr-3
                                  ${meal.meal_type.toLowerCase() === 'desayuno' ? 'bg-yellow-100 text-yellow-700' : ''}
                                  ${meal.meal_type.toLowerCase() === 'almuerzo' ? 'bg-green-100 text-green-700' : ''}
                                  ${meal.meal_type.toLowerCase() === 'cena' ? 'bg-blue-100 text-blue-700' : ''}
                                  ${meal.meal_type.toLowerCase() === 'snack' ? 'bg-purple-100 text-purple-700' : ''}
                                `}>
                                  {getMealIcon(meal.meal_type)}
                                </div>
                                <div>
                                  {isEditing && editingMeal === meal.id ? (
                                    <input
                                      type="text"
                                      value={meal.name}
                                      onChange={(e) => {
                                        // Update meal name in state
                                        const updatedMeals = {...meals};
                                        const mealIndex = updatedMeals[day.id].findIndex(m => m.id === meal.id);
                                        updatedMeals[day.id][mealIndex].name = e.target.value;
                                        setMeals(updatedMeals);
                                      }}
                                      className="font-medium bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <p className="font-medium">{meal.name}</p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {meal.total_calories} kcal · P: {meal.total_protein}g · C: {meal.total_carbs}g · G: {meal.total_fat}g
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {isEditing && editingMeal === meal.id ? (
                                  <div className="flex space-x-1 mr-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingMeal(null);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        // Save meal changes
                                        const updatedMeal = meals[day.id].find(m => m.id === meal.id);
                                        if (updatedMeal) {
                                          await updateDietMeal(meal.id, {
                                            name: updatedMeal.name,
                                          });
                                          setEditingMeal(null);
                                          toast({
                                            title: "Comida actualizada",
                                            description: "Los cambios han sido guardados correctamente"
                                          });
                                        }
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  isEditing && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingMeal(meal.id);
                                      }}
                                      className="mr-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )
                                )}
                                <Button variant="ghost" size="icon">
                                  {expandedMeal === meal.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            {expandedMeal === meal.id && (
                              <div className="p-3 border-t">
                                {foods[meal.id] && foods[meal.id].length > 0 ? (
                                  <div className="space-y-2">
                                    {foods[meal.id].map((food) => (
                                      <div key={food.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div className="flex-grow">
                                          {isEditing && editingFood === food.id ? (
                                            <div className="space-y-1">
                                              <input
                                                type="text"
                                                value={food.name}
                                                onChange={(e) => {
                                                  // Update food name in state
                                                  const updatedFoods = {...foods};
                                                  const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                  updatedFoods[meal.id][foodIndex].name = e.target.value;
                                                  setFoods(updatedFoods);
                                                }}
                                                className="font-medium bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none w-full"
                                              />
                                              <div className="flex items-center space-x-2">
                                                <input
                                                  type="number"
                                                  value={food.serving_size}
                                                  onChange={(e) => {
                                                    // Update serving size in state
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].serving_size = parseFloat(e.target.value);
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-16 text-xs p-1 border rounded"
                                                  min="0"
                                                  step="0.1"
                                                />
                                                <input
                                                  type="text"
                                                  value={food.serving_unit}
                                                  onChange={(e) => {
                                                    // Update serving unit in state
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].serving_unit = e.target.value;
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-16 text-xs p-1 border rounded"
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <p className="font-medium">{food.name}</p>
                                              <p className="text-xs text-gray-500">
                                                {food.serving_size} {food.serving_unit}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                        <div className="text-right text-sm flex items-center">
                                          {isEditing && editingFood === food.id ? (
                                            <div className="grid grid-cols-2 gap-2 mr-2">
                                              <div>
                                                <label className="text-xs">Calorías</label>
                                                <input
                                                  type="number"
                                                  value={food.calories}
                                                  onChange={(e) => {
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].calories = parseInt(e.target.value);
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-full text-xs p-1 border rounded"
                                                  min="0"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs">Proteína</label>
                                                <input
                                                  type="number"
                                                  value={food.protein}
                                                  onChange={(e) => {
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].protein = parseFloat(e.target.value);
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-full text-xs p-1 border rounded"
                                                  min="0"
                                                  step="0.1"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs">Carbos</label>
                                                <input
                                                  type="number"
                                                  value={food.carbs}
                                                  onChange={(e) => {
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].carbs = parseFloat(e.target.value);
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-full text-xs p-1 border rounded"
                                                  min="0"
                                                  step="0.1"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs">Grasas</label>
                                                <input
                                                  type="number"
                                                  value={food.fat}
                                                  onChange={(e) => {
                                                    const updatedFoods = {...foods};
                                                    const foodIndex = updatedFoods[meal.id].findIndex(f => f.id === food.id);
                                                    updatedFoods[meal.id][foodIndex].fat = parseFloat(e.target.value);
                                                    setFoods(updatedFoods);
                                                  }}
                                                  className="w-full text-xs p-1 border rounded"
                                                  min="0"
                                                  step="0.1"
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              <p>{food.calories} kcal</p>
                                              <p className="text-xs text-gray-500">
                                                P: {food.protein}g · C: {food.carbs}g · G: {food.fat}g
                                              </p>
                                            </div>
                                          )}

                                          {isEditing && (
                                            <div className="flex flex-col ml-2">
                                              {editingFood === food.id ? (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingFood(null)}
                                                    className="h-6 w-6"
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={async () => {
                                                      // Save food changes
                                                      const updatedFood = foods[meal.id].find(f => f.id === food.id);
                                                      if (updatedFood) {
                                                        // Calculate differences for meal and day totals
                                                        const originalFood = foods[meal.id].find(f => f.id === food.id);
                                                        const calorieDiff = updatedFood.calories - originalFood.calories;
                                                        const proteinDiff = updatedFood.protein - originalFood.protein;
                                                        const carbsDiff = updatedFood.carbs - originalFood.carbs;
                                                        const fatDiff = updatedFood.fat - originalFood.fat;

                                                        await updateDietFood(food.id, {
                                                          name: updatedFood.name,
                                                          serving_size: updatedFood.serving_size,
                                                          serving_unit: updatedFood.serving_unit,
                                                          calories: updatedFood.calories,
                                                          protein: updatedFood.protein,
                                                          carbs: updatedFood.carbs,
                                                          fat: updatedFood.fat
                                                        });

                                                        // Update meal totals
                                                        const updatedMeal = {
                                                          total_calories: meal.total_calories + calorieDiff,
                                                          total_protein: meal.total_protein + proteinDiff,
                                                          total_carbs: meal.total_carbs + carbsDiff,
                                                          total_fat: meal.total_fat + fatDiff
                                                        };
                                                        await updateDietMeal(meal.id, updatedMeal);

                                                        // Update day totals
                                                        const updatedDay = {
                                                          total_calories: day.total_calories + calorieDiff,
                                                          total_protein: day.total_protein + proteinDiff,
                                                          total_carbs: day.total_carbs + carbsDiff,
                                                          total_fat: day.total_fat + fatDiff
                                                        };
                                                        await updateDietDay(day.id, updatedDay);

                                                        setEditingFood(null);
                                                        toast({
                                                          title: "Alimento actualizado",
                                                          description: "Los cambios han sido guardados correctamente"
                                                        });

                                                        // Reload data to get updated totals
                                                        const { data: updatedMealData } = await getDietMeals(day.id);
                                                        if (updatedMealData) {
                                                          const updatedMeals = {...meals};
                                                          updatedMeals[day.id] = updatedMealData;
                                                          setMeals(updatedMeals);
                                                        }

                                                        const { data: updatedDaysData } = await getDietDays(diet.id);
                                                        if (updatedDaysData) {
                                                          const sortedDays = [...updatedDaysData].sort((a, b) => a.day_number - b.day_number);
                                                          setDietDays(sortedDays);
                                                        }
                                                      }
                                                    }}
                                                    className="h-6 w-6"
                                                  >
                                                    <Check className="h-3 w-3" />
                                                  </Button>
                                                </>
                                              ) : (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingFood(food.id)}
                                                    className="h-6 w-6"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={async () => {
                                                      // Delete food
                                                      if (confirm("¿Estás seguro de que deseas eliminar este alimento?")) {
                                                        await deleteDietFood(food.id);

                                                        // Update meal totals
                                                        const updatedMeal = {
                                                          total_calories: meal.total_calories - food.calories,
                                                          total_protein: meal.total_protein - food.protein,
                                                          total_carbs: meal.total_carbs - food.carbs,
                                                          total_fat: meal.total_fat - food.fat
                                                        };
                                                        await updateDietMeal(meal.id, updatedMeal);

                                                        // Update day totals
                                                        const updatedDay = {
                                                          total_calories: day.total_calories - food.calories,
                                                          total_protein: day.total_protein - food.protein,
                                                          total_carbs: day.total_carbs - food.carbs,
                                                          total_fat: day.total_fat - food.fat
                                                        };
                                                        await updateDietDay(day.id, updatedDay);

                                                        // Update local state
                                                        const updatedFoods = {...foods};
                                                        updatedFoods[meal.id] = updatedFoods[meal.id].filter(f => f.id !== food.id);
                                                        setFoods(updatedFoods);

                                                        toast({
                                                          title: "Alimento eliminado",
                                                          description: "El alimento ha sido eliminado correctamente"
                                                        });

                                                        // Reload data to get updated totals
                                                        const { data: updatedMealData } = await getDietMeals(day.id);
                                                        if (updatedMealData) {
                                                          const updatedMeals = {...meals};
                                                          updatedMeals[day.id] = updatedMealData;
                                                          setMeals(updatedMeals);
                                                        }

                                                        const { data: updatedDaysData } = await getDietDays(diet.id);
                                                        if (updatedDaysData) {
                                                          const sortedDays = [...updatedDaysData].sort((a, b) => a.day_number - b.day_number);
                                                          setDietDays(sortedDays);
                                                        }
                                                      }
                                                    }}
                                                    className="h-6 w-6 text-red-500"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No hay alimentos registrados para esta comida</p>
                                  </div>
                                )}

                                {isEditing && (
                                  <div className="mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => {
                                        // Show dialog to add new food
                                        const newFood = {
                                          name: prompt("Nombre del alimento:") || "Nuevo alimento",
                                          serving_size: parseFloat(prompt("Tamaño de la porción:", "100") || "100"),
                                          serving_unit: prompt("Unidad de la porción:", "g") || "g",
                                          calories: parseInt(prompt("Calorías:", "100") || "100"),
                                          protein: parseFloat(prompt("Proteínas (g):", "0") || "0"),
                                          carbs: parseFloat(prompt("Carbohidratos (g):", "0") || "0"),
                                          fat: parseFloat(prompt("Grasas (g):", "0") || "0")
                                        };

                                        // Add food to the meal
                                        addDietFood(meal.id, newFood).then(({ data, error }) => {
                                          if (error) {
                                            toast({
                                              title: "Error",
                                              description: "No se pudo añadir el alimento",
                                              variant: "destructive"
                                            });
                                            return;
                                          }

                                          // Update local state
                                          const updatedFoods = {...foods};
                                          if (!updatedFoods[meal.id]) {
                                            updatedFoods[meal.id] = [];
                                          }
                                          updatedFoods[meal.id].push(data);
                                          setFoods(updatedFoods);

                                          toast({
                                            title: "Alimento añadido",
                                            description: "El alimento ha sido añadido correctamente"
                                          });

                                          // Reload data to get updated totals
                                          getDietMeals(day.id).then(({ data: updatedMealData }) => {
                                            if (updatedMealData) {
                                              const updatedMeals = {...meals};
                                              updatedMeals[day.id] = updatedMealData;
                                              setMeals(updatedMeals);
                                            }
                                          });

                                          getDietDays(diet.id).then(({ data: updatedDaysData }) => {
                                            if (updatedDaysData) {
                                              const sortedDays = [...updatedDaysData].sort((a, b) => a.day_number - b.day_number);
                                              setDietDays(sortedDays);
                                            }
                                          });
                                        });
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Añadir alimento
                                    </Button>
                                  </div>
                                )}

                                {meal.notes && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-start">
                                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    <p className="text-sm">{meal.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <p>No hay comidas registradas para este día</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No hay días configurados en este plan</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
