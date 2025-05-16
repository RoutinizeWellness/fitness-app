"use client"

import { useState, useEffect } from "react"
import {
  Utensils,
  Plus,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  Edit,
  Trash,
  Clock,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { format, addDays, subDays, startOfDay, endOfDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface MacroTrackerProps {
  userId: string
  className?: string
}

interface NutritionEntry {
  id: string
  userId: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  createdAt: string
  updatedAt: string
}

interface MacroGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function MacroTracker({
  userId,
  className
}: MacroTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [goals, setGoals] = useState<MacroGoals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<NutritionEntry>>({
    mealType: 'breakfast',
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Cargar datos de nutrición
  useEffect(() => {
    const loadNutritionData = async () => {
      setIsLoading(true)
      
      try {
        // Cargar objetivos de macros
        const { data: goalsData, error: goalsError } = await supabase
          .from('nutrition_goals')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (goalsError) {
          if (goalsError.code !== 'PGRST116') { // No data found
            console.error("Error al cargar objetivos:", goalsError)
          }
        } else if (goalsData) {
          setGoals({
            calories: goalsData.calories,
            protein: goalsData.protein,
            carbs: goalsData.carbs,
            fat: goalsData.fat
          })
        }
        
        // Cargar entradas de nutrición para la fecha seleccionada
        const startDate = startOfDay(selectedDate).toISOString()
        const endDate = endOfDay(selectedDate).toISOString()
        
        const { data: entriesData, error: entriesError } = await supabase
          .from('nutrition_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('created_at', { ascending: true })
        
        if (entriesError) {
          console.error("Error al cargar entradas:", entriesError)
        } else {
          // Transformar los datos al formato esperado
          const transformedEntries: NutritionEntry[] = entriesData ? entriesData.map(entry => ({
            id: entry.id,
            userId: entry.user_id,
            date: entry.date,
            mealType: entry.meal_type,
            name: entry.name,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fat: entry.fat,
            fiber: entry.fiber,
            sugar: entry.sugar,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at
          })) : []
          
          setEntries(transformedEntries)
        }
      } catch (error) {
        console.error("Error al cargar datos de nutrición:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadNutritionData()
    }
  }, [userId, selectedDate])
  
  // Calcular totales de macros
  const calculateTotals = () => {
    return entries.reduce((acc, entry) => {
      return {
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }
  
  // Calcular porcentajes de macros
  const calculatePercentages = () => {
    const totals = calculateTotals()
    
    return {
      calories: Math.min(100, (totals.calories / goals.calories) * 100),
      protein: Math.min(100, (totals.protein / goals.protein) * 100),
      carbs: Math.min(100, (totals.carbs / goals.carbs) * 100),
      fat: Math.min(100, (totals.fat / goals.fat) * 100)
    }
  }
  
  // Cambiar fecha
  const changeDate = (days: number) => {
    setSelectedDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)))
  }
  
  // Buscar alimentos
  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    
    try {
      // Buscar en la base de datos de alimentos
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10)
      
      if (error) {
        throw error
      }
      
      setSearchResults(data || [])
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar alimentos",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }
  
  // Seleccionar alimento de los resultados
  const selectFood = (food: any) => {
    setNewEntry({
      ...newEntry,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar
    })
    
    setSearchResults([])
    setSearchQuery('')
  }
  
  // Guardar nueva entrada
  const saveEntry = async () => {
    if (!newEntry.name || !newEntry.mealType) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }
    
    try {
      const entryData = {
        user_id: userId,
        date: selectedDate.toISOString(),
        meal_type: newEntry.mealType,
        name: newEntry.name,
        calories: newEntry.calories || 0,
        protein: newEntry.protein || 0,
        carbs: newEntry.carbs || 0,
        fat: newEntry.fat || 0,
        fiber: newEntry.fiber,
        sugar: newEntry.sugar
      }
      
      const { data, error } = await supabase
        .from('nutrition_entries')
        .insert(entryData)
        .select()
      
      if (error) {
        throw error
      }
      
      // Transformar la entrada guardada
      const savedEntry: NutritionEntry = {
        id: data[0].id,
        userId: data[0].user_id,
        date: data[0].date,
        mealType: data[0].meal_type,
        name: data[0].name,
        calories: data[0].calories,
        protein: data[0].protein,
        carbs: data[0].carbs,
        fat: data[0].fat,
        fiber: data[0].fiber,
        sugar: data[0].sugar,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      }
      
      // Actualizar la lista de entradas
      setEntries([...entries, savedEntry])
      
      // Limpiar el formulario
      setNewEntry({
        mealType: 'breakfast',
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      })
      
      // Cerrar el diálogo
      setShowAddDialog(false)
      
      toast({
        title: "Alimento añadido",
        description: "El alimento se ha añadido correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al guardar entrada:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la entrada",
        variant: "destructive"
      })
    }
  }
  
  // Eliminar entrada
  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', entryId)
      
      if (error) {
        throw error
      }
      
      // Actualizar la lista de entradas
      setEntries(entries.filter(entry => entry.id !== entryId))
      
      toast({
        title: "Entrada eliminada",
        description: "La entrada se ha eliminado correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al eliminar entrada:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la entrada",
        variant: "destructive"
      })
    }
  }
  
  // Agrupar entradas por tipo de comida
  const entriesByMealType = {
    breakfast: entries.filter(entry => entry.mealType === 'breakfast'),
    lunch: entries.filter(entry => entry.mealType === 'lunch'),
    dinner: entries.filter(entry => entry.mealType === 'dinner'),
    snack: entries.filter(entry => entry.mealType === 'snack')
  }
  
  const totals = calculateTotals()
  const percentages = calculatePercentages()
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Seguimiento de macros</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Seguimiento de macros</Card3DTitle>
          
          <Button3D size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir alimento
          </Button3D>
        </div>
      </Card3DHeader>
      
      <Card3DContent>
        {/* Selector de fecha */}
        <div className="flex justify-between items-center mb-4">
          <Button3D variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button3D>
          
          <div className="text-center">
            <h3 className="font-medium">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedDate.toDateString() === new Date().toDateString() ? 'Hoy' : ''}
            </p>
          </div>
          
          <Button3D variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button3D>
        </div>
        
        {/* Resumen de macros */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Calorías</span>
              <span className="text-sm text-gray-500">{totals.calories} / {goals.calories} kcal</span>
            </div>
            <Progress3D value={percentages.calories} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Proteínas</span>
                <span className="text-xs text-gray-500">{totals.protein}g</span>
              </div>
              <Progress3D value={percentages.protein} className="h-2" color="blue" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Carbos</span>
                <span className="text-xs text-gray-500">{totals.carbs}g</span>
              </div>
              <Progress3D value={percentages.carbs} className="h-2" color="amber" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Grasas</span>
                <span className="text-xs text-gray-500">{totals.fat}g</span>
              </div>
              <Progress3D value={percentages.fat} className="h-2" color="red" />
            </div>
          </div>
        </div>
        
        {/* Lista de comidas */}
        <div className="space-y-4">
          {Object.entries(entriesByMealType).map(([mealType, mealEntries]) => (
            <div key={mealType}>
              <h3 className="text-sm font-medium mb-2">
                {mealType === 'breakfast' ? 'Desayuno' :
                 mealType === 'lunch' ? 'Almuerzo' :
                 mealType === 'dinner' ? 'Cena' : 'Snacks'}
              </h3>
              
              {mealEntries.length > 0 ? (
                <div className="space-y-2">
                  {mealEntries.map(entry => (
                    <div key={entry.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{entry.name}</p>
                          <p className="text-xs text-gray-500">
                            {entry.calories} kcal | P: {entry.protein}g | C: {entry.carbs}g | G: {entry.fat}g
                          </p>
                        </div>
                        
                        <Button3D
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash className="h-3 w-3 text-red-500" />
                        </Button3D>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">No hay alimentos registrados</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card3DContent>
      
      {/* Diálogo para añadir alimento */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir alimento</DialogTitle>
            <DialogDescription>
              Añade un alimento a tu registro de nutrición.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de comida</label>
              <Select
                value={newEntry.mealType}
                onValueChange={(value: any) => setNewEntry({ ...newEntry, mealType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Buscar alimento</label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchFoods(e.target.value)
                  }}
                  placeholder="Buscar alimento..."
                  className="pr-8"
                />
                {isSearching ? (
                  <div className="absolute right-2 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                ) : (
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-1 border rounded-md overflow-hidden">
                  <ScrollArea className="max-h-40">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectFood(food)}
                      >
                        <p className="text-sm font-medium">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <Input
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                placeholder="Nombre del alimento"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Calorías (kcal)</label>
                <Input
                  type="number"
                  value={newEntry.calories || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, calories: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Proteínas (g)</label>
                <Input
                  type="number"
                  value={newEntry.protein || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, protein: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Carbohidratos (g)</label>
                <Input
                  type="number"
                  value={newEntry.carbs || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, carbs: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Grasas (g)</label>
                <Input
                  type="number"
                  value={newEntry.fat || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, fat: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={saveEntry}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}
