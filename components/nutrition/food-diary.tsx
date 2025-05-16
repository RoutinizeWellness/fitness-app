"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Utensils, Coffee, Apple, Moon, Trash2, Plus, Search, Loader2, BarChart } from "lucide-react"
import { getNutritionEntries, addNutritionEntry, deleteNutritionEntry } from "@/lib/nutrition-service"
import { searchFoodDatabase, searchFoodApi } from "@/lib/food-database-api"
import { NutritionEntry, FoodItem, MEAL_TYPES } from "@/lib/types/nutrition"

interface FoodDiaryProps {
  userId: string
}

export default function FoodDiary({ userId }: FoodDiaryProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    meal_type: "desayuno",
    food_name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: "",
  })

  // Cargar entradas de nutrición
  useEffect(() => {
    const loadNutritionEntries = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getNutritionEntries(userId, { date: selectedDate })

        if (error) {
          throw error
        }

        if (data) {
          setNutritionLog(data)
        }
      } catch (error) {
        console.error("Error al cargar entradas de nutrición:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las entradas de nutrición",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionEntries()
  }, [userId, selectedDate, toast])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "calories" || name === "protein" || name === "carbs" || name === "fat"
        ? parseFloat(value) || 0
        : value,
    })
  }

  // Manejar cambio en el select
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const entry = {
        user_id: userId,
        date: formData.date,
        meal_type: formData.meal_type,
        food_name: formData.food_name,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        notes: formData.notes,
      }

      const { data, error } = await addNutritionEntry(entry)

      if (error) {
        throw error
      }

      toast({
        title: "Registro exitoso",
        description: "El alimento ha sido registrado correctamente",
      })

      // Actualizar la lista de entradas
      if (data && formData.date === selectedDate) {
        setNutritionLog([data, ...nutritionLog])
      }

      // Resetear formulario
      setFormData({
        ...formData,
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
      })

      setSelectedFood(null)
      setAddFoodDialogOpen(false)
    } catch (error) {
      console.error("Error al registrar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el alimento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar eliminación de entrada
  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteNutritionEntry(id)

      if (error) {
        throw error
      }

      toast({
        title: "Eliminación exitosa",
        description: "El alimento ha sido eliminado correctamente",
      })

      // Actualizar la lista de entradas
      setNutritionLog(nutritionLog.filter((entry) => entry.id !== id))
    } catch (error) {
      console.error("Error al eliminar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el alimento",
        variant: "destructive",
      })
    }
  }

  // Buscar alimentos
  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      // Primero buscar en la base de datos local
      const { data: localResults, error: localError } = await searchFoodDatabase(searchTerm)

      if (localError) {
        console.error("Error al buscar en la base de datos local:", localError)
      }

      // Luego buscar en la API externa
      const { data: apiResults, error: apiError } = await searchFoodApi({ query: searchTerm })

      if (apiError) {
        console.error("Error al buscar en la API externa:", apiError)
      }

      // Combinar resultados eliminando duplicados por nombre
      const combinedResults = [...(localResults || []), ...(apiResults || [])]
      const uniqueResults = combinedResults.filter((food, index, self) =>
        index === self.findIndex((f) => f.name === food.name)
      )

      setSearchResults(uniqueResults)
    } catch (error) {
      console.error("Error al buscar alimentos:", error)
      toast({
        title: "Error",
        description: "No se pudieron buscar alimentos",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Seleccionar alimento
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food)
    setFormData({
      ...formData,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })
    setSearchResults([])
    setSearchTerm("")
  }

  // Cambiar a día anterior
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = subDays(currentDate, 1)
    setSelectedDate(previousDay.toISOString().split("T")[0])
  }

  // Cambiar a día siguiente
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)
    
    // No permitir seleccionar fechas futuras
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay.toISOString().split("T")[0])
    }
  }

  // Filtrar entradas por tipo de comida
  const filteredEntries = activeTab === "all"
    ? nutritionLog
    : nutritionLog.filter((entry) => entry.meal_type === activeTab)

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return <Coffee className="h-4 w-4" />
      case "almuerzo":
        return <Utensils className="h-4 w-4" />
      case "cena":
        return <Moon className="h-4 w-4" />
      case "snack":
        return <Apple className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  // Calcular totales por tipo de comida
  const calculateMealTotals = (mealType: string) => {
    const entries = nutritionLog.filter((entry) => entry.meal_type === mealType)
    return {
      count: entries.length,
      calories: entries.reduce((sum, entry) => sum + entry.calories, 0),
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[50px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de fecha */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousDay}>
          &lt;
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-sm font-medium">
                {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={new Date(selectedDate)}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date.toISOString().split("T")[0])
                  setCalendarOpen(false)
                }
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextDay}
          disabled={new Date(selectedDate).toDateString() === new Date().toDateString()}
        >
          &gt;
        </Button>
      </div>

      {/* Botón para añadir alimento */}
      <Button 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => {
          setFormData({
            ...formData,
            date: selectedDate,
          })
          setAddFoodDialogOpen(true)
        }}
      >
        <Plus className="h-4 w-4" />
        <span>Añadir alimento</span>
      </Button>

      {/* Tabs para filtrar por tipo de comida */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all" className="text-xs">
            Todos
          </TabsTrigger>
          <TabsTrigger value="desayuno" className="text-xs">
            Desayuno
          </TabsTrigger>
          <TabsTrigger value="almuerzo" className="text-xs">
            Almuerzo
          </TabsTrigger>
          <TabsTrigger value="cena" className="text-xs">
            Cena
          </TabsTrigger>
          <TabsTrigger value="snack" className="text-xs">
            Snack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {/* Resumen de comidas */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {MEAL_TYPES.map((mealType) => {
              const totals = calculateMealTotals(mealType.value)
              return (
                <Card key={mealType.value} className="p-2">
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      p-2 rounded-full mb-1
                      ${mealType.value === "desayuno" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${mealType.value === "almuerzo" ? "bg-green-100 text-green-700" : ""}
                      ${mealType.value === "cena" ? "bg-blue-100 text-blue-700" : ""}
                      ${mealType.value === "snack" ? "bg-purple-100 text-purple-700" : ""}
                    `}>
                      {renderMealIcon(mealType.value)}
                    </div>
                    <span className="text-xs font-medium">{mealType.label}</span>
                    <span className="text-xs text-gray-500">{totals.calories} kcal</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Contenido para cada tipo de comida (se muestra el mismo componente para todos) */}
        {["all", ...MEAL_TYPES.map(mt => mt.value)].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            {/* Lista de alimentos */}
            <div className="space-y-3">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div
                        className={`
                          p-2 rounded-full mr-3
                          ${entry.meal_type === "desayuno" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${entry.meal_type === "almuerzo" ? "bg-green-100 text-green-700" : ""}
                          ${entry.meal_type === "cena" ? "bg-blue-100 text-blue-700" : ""}
                          ${entry.meal_type === "snack" ? "bg-purple-100 text-purple-700" : ""}
                        `}
                      >
                        {renderMealIcon(entry.meal_type)}
                      </div>
                      <div>
                        <p className="font-medium">{entry.food_name}</p>
                        <p className="text-xs text-gray-500">
                          {entry.calories} kcal · P: {entry.protein}g · C: {entry.carbs}g · G: {entry.fat}g
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay alimentos registrados para {activeTab === "all" ? "este día" : MEAL_TYPES.find(mt => mt.value === activeTab)?.label.toLowerCase()}</p>
                  <Button variant="link" onClick={() => setAddFoodDialogOpen(true)} className="mt-2">
                    Registrar un alimento
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Diálogo para añadir alimento */}
      <Dialog open={addFoodDialogOpen} onOpenChange={setAddFoodDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir alimento</DialogTitle>
            <DialogDescription>
              Busca un alimento o introduce los datos manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Buscador de alimentos */}
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="search" className="sr-only">
                  Buscar alimento
                </Label>
                <Input
                  id="search"
                  placeholder="Buscar alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button type="button" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b">
                  <p className="text-xs font-medium">Resultados ({searchResults.length})</p>
                </div>
                <div className="divide-y">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectFood(food)}
                    >
                      <p className="text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · G: {food.fat}g
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario para añadir alimento */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meal_type">Tipo de comida</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) => handleSelectChange("meal_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MEAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date
                            ? format(new Date(formData.date), "dd/MM/yyyy")
                            : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(formData.date)}
                          onSelect={(date) => {
                            if (date) {
                              setFormData({
                                ...formData,
                                date: date.toISOString().split("T")[0],
                              })
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food_name">Nombre del alimento</Label>
                  <Input
                    id="food_name"
                    name="food_name"
                    value={formData.food_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorías (kcal)</Label>
                    <Input
                      id="calories"
                      name="calories"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.calories}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Proteínas (g)</Label>
                    <Input
                      id="protein"
                      name="protein"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.protein}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbohidratos (g)</Label>
                    <Input
                      id="carbs"
                      name="carbs"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.carbs}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Grasas (g)</Label>
                    <Input
                      id="fat"
                      name="fat"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.fat}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Añade notas adicionales..."
                    className="resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setAddFoodDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
