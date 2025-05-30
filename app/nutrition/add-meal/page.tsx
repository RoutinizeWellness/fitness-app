"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutinizeLayout } from "@/components/routinize-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/card";
import { SafeClientButton } from "@/components/ui/safe-client-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Save, Search, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PulseLoader } from "@/components/ui/enhanced-skeletons";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Tipos
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface Meal {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  name: string;
  foods: FoodItem[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  updatedAt: string;
}

// Función para obtener alimentos de ejemplo
const getSampleFoods = (): FoodItem[] => [
  { id: "1", name: "Pollo a la plancha", calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: 1, unit: "100g" },
  { id: "2", name: "Arroz blanco", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, quantity: 1, unit: "100g" },
  { id: "3", name: "Brócoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, quantity: 1, unit: "100g" },
  { id: "4", name: "Salmón", calories: 208, protein: 20, carbs: 0, fat: 13, quantity: 1, unit: "100g" },
  { id: "5", name: "Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15, quantity: 1, unit: "100g" },
  { id: "6", name: "Huevo", calories: 155, protein: 13, carbs: 1.1, fat: 11, quantity: 1, unit: "unidad" },
  { id: "7", name: "Plátano", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, quantity: 1, unit: "unidad" },
  { id: "8", name: "Avena", calories: 389, protein: 17, carbs: 66, fat: 7, quantity: 1, unit: "100g" }
];

export default function AddMealPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>("12:00");
  const [mealType, setMealType] = useState<string>("almuerzo");
  const [mealName, setMealName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Initialize Supabase client
  const supabase = createClient();

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/welcome");
    }
  }, [user, authLoading, router]);

  // Buscar alimentos
  const searchFoods = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    try {
      // Buscar en Supabase
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error("Error al buscar alimentos:", error);
        // Usar datos de ejemplo si hay error
        setSearchResults(getSampleFoods().filter(food =>
          food.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error("Error al buscar alimentos:", error);
      // Usar datos de ejemplo en caso de error
      setSearchResults(getSampleFoods().filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  };

  // Añadir alimento a la comida
  const addFood = (food: FoodItem) => {
    // Comprobar si el alimento ya está en la lista
    const existingIndex = foods.findIndex(f => f.id === food.id);

    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedFoods = [...foods];
      updatedFoods[existingIndex] = {
        ...updatedFoods[existingIndex],
        quantity: updatedFoods[existingIndex].quantity + 1
      };
      setFoods(updatedFoods);
    } else {
      // Añadir nuevo alimento
      setFoods([...foods, { ...food, quantity: 1 }]);
    }

    // Limpiar búsqueda
    setSearchTerm("");
    setSearchResults([]);
  };

  // Eliminar alimento de la comida
  const removeFood = (foodId: string) => {
    setFoods(foods.filter(food => food.id !== foodId));
  };

  // Actualizar cantidad de un alimento
  const updateFoodQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFood(foodId);
      return;
    }

    setFoods(foods.map(food =>
      food.id === foodId ? { ...food, quantity } : food
    ));
  };

  // Calcular totales
  const calculateTotals = () => {
    return foods.reduce((totals, food) => {
      return {
        calories: totals.calories + (food.calories * food.quantity),
        protein: totals.protein + (food.protein * food.quantity),
        carbs: totals.carbs + (food.carbs * food.quantity),
        fat: totals.fat + (food.fat * food.quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Guardar comida
  const handleSave = async () => {
    if (!user) return;

    if (!mealName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce un nombre para la comida",
        variant: "destructive"
      });
      return;
    }

    if (foods.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, añade al menos un alimento",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    const totals = calculateTotals();

    const newMeal: Meal = {
      id: uuidv4(),
      userId: user.id,
      date: date.toISOString().split('T')[0],
      time,
      type: mealType,
      name: mealName.trim(),
      foods,
      notes: notes.trim() || undefined,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('meals')
        .insert({
          id: newMeal.id,
          user_id: newMeal.userId,
          date: newMeal.date,
          time: newMeal.time,
          type: newMeal.type,
          name: newMeal.name,
          foods: newMeal.foods,
          notes: newMeal.notes,
          total_calories: newMeal.totalCalories,
          total_protein: newMeal.totalProtein,
          total_carbs: newMeal.totalCarbs,
          total_fat: newMeal.totalFat,
          created_at: newMeal.createdAt,
          updated_at: newMeal.updatedAt
        });

      if (error) {
        console.error("Error al guardar comida:", error);
        throw error;
      }

      toast({
        title: "Comida guardada",
        description: "Tu comida se ha guardado correctamente",
      });

      // Redirigir a la página de nutrición
      setTimeout(() => {
        router.push("/nutrition");
      }, 500);
    } catch (error: any) {
      console.error("Error al guardar comida:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la comida",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="nutrition" title="Añadir comida">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    );
  }

  return (
    <RoutinizeLayout activeTab="nutrition" title="Añadir comida">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <SafeClientButton
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </SafeClientButton>
          <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">Añadir comida</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mealName">Nombre de la comida *</Label>
              <Input
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Ej: Ensalada de pollo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealType">Tipo de comida</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de comida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayuno">Desayuno</SelectItem>
                  <SelectItem value="almuerzo">Almuerzo</SelectItem>
                  <SelectItem value="cena">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alimentos</Label>
              <div className="flex space-x-2">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar alimentos..."
                  onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
                />
                <Button
                  variant="outline"
                  onClick={searchFoods}
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <Card className="p-2 mt-2 max-h-60 overflow-y-auto">
                  {searchResults.map(food => (
                    <div
                      key={food.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => addFood(food)}
                    >
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </Card>
              )}

              {foods.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {foods.map(food => (
                    <div key={food.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(food.calories * food.quantity)} kcal |
                          P: {Math.round(food.protein * food.quantity)}g |
                          C: {Math.round(food.carbs * food.quantity)}g |
                          G: {Math.round(food.fat * food.quantity)}g
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFoodQuantity(food.id, food.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{food.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFoodQuantity(food.id, food.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFood(food.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="font-medium">Totales:</p>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      <div>
                        <p className="text-xs text-gray-500">Calorías</p>
                        <p className="font-medium">{Math.round(calculateTotals().calories)} kcal</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Proteínas</p>
                        <p className="font-medium">{Math.round(calculateTotals().protein)}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Carbohidratos</p>
                        <p className="font-medium">{Math.round(calculateTotals().carbs)}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Grasas</p>
                        <p className="font-medium">{Math.round(calculateTotals().fat)}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-md">
                  <p className="text-gray-500">No hay alimentos añadidos</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre esta comida..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/nutrition")}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
            disabled={isSaving || !mealName.trim() || foods.length === 0}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar comida
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  );
}


