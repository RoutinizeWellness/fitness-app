"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CalendarIcon, Apple, Coffee, Utensils, Moon, Trash2, Plus } from "lucide-react"
import { addNutritionEntry, deleteNutritionEntry, getNutritionEntries, getNutritionStats, type NutritionEntry } from "@/lib/supabase"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

interface NutricionTabProps {
  userId: string
}

export default function NutricionTab({ userId }: NutricionTabProps) {
  const [activeTab, setActiveTab] = useState("registro")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>([])
  const [nutritionStats, setNutritionStats] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  // Cargar datos de nutrición
  useEffect(() => {
    const loadNutritionData = async () => {
      setIsLoading(true)
      try {
        // Cargar entradas de nutrición
        const { data, error } = await getNutritionEntries(userId)

        if (error) {
          throw error
        }

        if (data) {
          setNutritionLog(data)
        }

        // Cargar estadísticas de nutrición
        const { data: stats, error: statsError } = await getNutritionStats(userId, selectedDate)

        if (statsError) {
          console.error("Error al cargar estadísticas:", statsError)
        } else if (stats) {
          setNutritionStats(stats)
        }
      } catch (error) {
        console.error("Error al cargar datos de nutrición:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de nutrición",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [userId, selectedDate])

  // Obtener totales diarios de las estadísticas o calcularlos si no están disponibles
  const dailyTotals = nutritionStats?.totals || nutritionLog
    .filter((entry) => entry.date === selectedDate)
    .reduce(
      (acc, entry) => {
        acc.calories += entry.calories || 0
        acc.protein += entry.protein || 0
        acc.carbs += entry.carbs || 0
        acc.fat += entry.fat || 0
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

  // Datos para el gráfico de macronutrientes
  const macrosData = [
    { name: "Proteínas", value: dailyTotals.protein * 4, color: "#4f46e5" },
    { name: "Carbohidratos", value: dailyTotals.carbs * 4, color: "#10b981" },
    { name: "Grasas", value: dailyTotals.fat * 9, color: "#f59e0b" },
  ]

  // Función para cambiar la fecha seleccionada
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0]
      setSelectedDate(dateStr)
      setFormData(prev => ({ ...prev, date: dateStr }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = "La fecha es requerida"
    }

    if (!formData.meal_type) {
      newErrors.meal_type = "El tipo de comida es requerido"
    }

    if (!formData.food_name) {
      newErrors.food_name = "El nombre del alimento es requerido"
    }

    if (formData.calories <= 0) {
      newErrors.calories = "Las calorías deben ser mayores a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

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

      // Actualizar la lista de entradas
      setNutritionLog([...(data ? [data] : []), ...nutritionLog])

      // Actualizar estadísticas si la entrada es para la fecha seleccionada
      if (formData.date === selectedDate) {
        const { data: updatedStats } = await getNutritionStats(userId, selectedDate)
        if (updatedStats) {
          setNutritionStats(updatedStats)
        }
      }

      toast({
        title: "Registro exitoso",
        description: "El alimento ha sido registrado correctamente",
      })

      // Resetear formulario
      setFormData({
        date: formData.date, // Mantener la fecha seleccionada
        meal_type: "desayuno",
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
      })

      // Cambiar a la pestaña de resumen si estamos en la fecha actual
      if (formData.date === new Date().toISOString().split("T")[0]) {
        setActiveTab("resumen")
      }
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
      // Obtener la entrada antes de eliminarla para saber su fecha
      const entryToDelete = nutritionLog.find(entry => entry.id === id)

      const { error } = await deleteNutritionEntry(id)

      if (error) {
        throw error
      }

      // Actualizar la lista de entradas
      setNutritionLog(nutritionLog.filter((entry) => entry.id !== id))

      // Actualizar estadísticas si la entrada eliminada era de la fecha seleccionada
      if (entryToDelete && entryToDelete.date === selectedDate) {
        const { data: updatedStats } = await getNutritionStats(userId, selectedDate)
        if (updatedStats) {
          setNutritionStats(updatedStats)
        }
      }

      toast({
        title: "Eliminación exitosa",
        description: "El alimento ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el alimento",
        variant: "destructive",
      })
    }
  }

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Nutrición</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="registro">Registrar Alimento</TabsTrigger>
          <TabsTrigger value="resumen">Resumen Diario</TabsTrigger>
        </TabsList>

        <TabsContent value="registro">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Alimento</CardTitle>
              <CardDescription>Registra los alimentos que consumes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <div className="flex">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              errors.date ? "border-red-500" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? (
                              format(new Date(formData.date), "PPP", { locale: es })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date ? new Date(formData.date) : undefined}
                            onSelect={(date) =>
                              setFormData({
                                ...formData,
                                date: date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal_type">Tipo de Comida</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                    >
                      <SelectTrigger className={errors.meal_type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona el tipo de comida" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desayuno">Desayuno</SelectItem>
                        <SelectItem value="almuerzo">Almuerzo</SelectItem>
                        <SelectItem value="cena">Cena</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.meal_type && <p className="text-sm text-red-500">{errors.meal_type}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food_name">Nombre del Alimento</Label>
                  <Input
                    id="food_name"
                    placeholder="Ej: Avena con leche"
                    value={formData.food_name}
                    onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                    className={errors.food_name ? "border-red-500" : ""}
                  />
                  {errors.food_name && <p className="text-sm text-red-500">{errors.food_name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorías (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      placeholder="Ej: 250"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                      className={errors.calories ? "border-red-500" : ""}
                    />
                    {errors.calories && <p className="text-sm text-red-500">{errors.calories}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protein">Proteínas (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Ej: 15"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbohidratos (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Ej: 30"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fat">Grasas (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Ej: 5"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade notas sobre este alimento"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Alimento
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Resumen Nutricional</CardTitle>
                  <CardDescription>
                    {selectedDate === new Date().toISOString().split("T")[0]
                      ? "Hoy"
                      : format(new Date(selectedDate), "PPP", { locale: es })}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(new Date(selectedDate), "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate ? new Date(selectedDate) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Calorías Totales</p>
                        <p className="text-2xl font-bold">{dailyTotals.calories} kcal</p>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Comidas Registradas</p>
                        <p className="text-2xl font-bold">
                          {nutritionStats?.totals?.entries ||
                            nutritionLog.filter((entry) => entry.date === selectedDate).length}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500">Proteínas</p>
                        <p className="text-lg font-bold text-indigo-700">{dailyTotals.protein}g</p>
                        {nutritionStats?.macroPercentages && (
                          <p className="text-xs text-indigo-500">
                            {Math.round(nutritionStats.macroPercentages.protein)}%
                          </p>
                        )}
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500">Carbohidratos</p>
                        <p className="text-lg font-bold text-green-700">{dailyTotals.carbs}g</p>
                        {nutritionStats?.macroPercentages && (
                          <p className="text-xs text-green-500">
                            {Math.round(nutritionStats.macroPercentages.carbs)}%
                          </p>
                        )}
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500">Grasas</p>
                        <p className="text-lg font-bold text-amber-700">{dailyTotals.fat}g</p>
                        {nutritionStats?.macroPercentages && (
                          <p className="text-xs text-amber-500">
                            {Math.round(nutritionStats.macroPercentages.fat)}%
                          </p>
                        )}
                      </div>
                    </div>

                    {nutritionStats?.macroPercentages && (
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm font-medium mb-2">Distribución de Macronutrientes</p>
                        <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden flex">
                          <div
                            className="h-full bg-indigo-600"
                            style={{ width: `${nutritionStats.macroPercentages.protein}%` }}
                          ></div>
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${nutritionStats.macroPercentages.carbs}%` }}
                          ></div>
                          <div
                            className="h-full bg-amber-600"
                            style={{ width: `${nutritionStats.macroPercentages.fat}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Proteínas</span>
                          <span>Carbos</span>
                          <span>Grasas</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-48">
                    {dailyTotals.calories > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macrosData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {macrosData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No hay datos para mostrar</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Alimentos Registrados</h3>
                  <div className="space-y-3">
                    {nutritionLog
                      .filter((entry) => entry.date === selectedDate)
                      .map((entry) => (
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
                      ))}

                    {nutritionLog.filter((entry) => entry.date === selectedDate).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No hay alimentos registrados para esta fecha</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setActiveTab("registro");
                            setFormData(prev => ({ ...prev, date: selectedDate }));
                          }}
                          className="mt-2"
                        >
                          Registrar un alimento
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
