"use client"

import { useState } from "react"
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
import { Loader2, CalendarIcon, Apple, Coffee, Utensils, Moon, Trash2 } from "lucide-react"
import { addNutritionEntry, deleteNutritionEntry, type NutritionEntry } from "@/lib/supabase-client"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

interface NutricionProps {
  nutritionLog: NutritionEntry[]
  userId: string
  onNutritionUpdated: () => void
}

export default function Nutricion({ nutritionLog, userId, onNutritionUpdated }: NutricionProps) {
  const [activeTab, setActiveTab] = useState("registro")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
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

  // Calcular macronutrientes totales del día
  const calculateDailyTotals = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayEntries = nutritionLog.filter((entry) => entry.date === today)

    return {
      calories: todayEntries.reduce((sum, entry) => sum + entry.calories, 0),
      protein: todayEntries.reduce((sum, entry) => sum + entry.protein, 0),
      carbs: todayEntries.reduce((sum, entry) => sum + entry.carbs, 0),
      fat: todayEntries.reduce((sum, entry) => sum + entry.fat, 0),
    }
  }

  const dailyTotals = calculateDailyTotals()

  // Datos para el gráfico de macronutrientes
  const macroData = [
    { name: "Proteínas", value: dailyTotals.protein * 4, color: "#4f46e5" }, // 4 calorías por gramo
    { name: "Carbohidratos", value: dailyTotals.carbs * 4, color: "#0ea5e9" }, // 4 calorías por gramo
    { name: "Grasas", value: dailyTotals.fat * 9, color: "#ef4444" }, // 9 calorías por gramo
  ]

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

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
  const handleSubmit = async (e) => {
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

      toast({
        title: "Registro exitoso",
        description: "El alimento ha sido registrado correctamente",
      })

      // Resetear formulario
      setFormData({
        date: new Date().toISOString().split("T")[0],
        meal_type: "desayuno",
        food_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
      })

      // Actualizar datos
      onNutritionUpdated()

      // Cambiar a la pestaña de resumen
      setActiveTab("resumen")
    } catch (error) {
      console.error("Error al registrar alimento:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el alimento. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar entrada de nutrición
  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteNutritionEntry(id)

      if (error) {
        throw error
      }

      toast({
        title: "Eliminado",
        description: "El registro ha sido eliminado correctamente",
      })

      // Actualizar datos
      onNutritionUpdated()
    } catch (error) {
      console.error("Error al eliminar registro:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Renderizar icono según el tipo de comida
  const renderMealIcon = (mealType) => {
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
                                date: date ? date.toISOString().split("T")[0] : "",
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
                    <Label htmlFor="meal-type">Tipo de Comida</Label>
                    <Select
                      value={formData.meal_type}
                      onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                    >
                      <SelectTrigger id="meal-type" className={errors.meal_type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecciona un tipo" />
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
                  <Label htmlFor="food-name">Nombre del Alimento</Label>
                  <Input
                    id="food-name"
                    placeholder="Ej: Avena con leche, Pollo a la plancha..."
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
                      placeholder="Ej: 8"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade notas sobre este alimento..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("resumen")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Alimento"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Nutricional del Día</CardTitle>
                <CardDescription>{format(new Date(), "PPP", { locale: es })}</CardDescription>
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
                          {nutritionLog.filter((entry) => entry.date === new Date().toISOString().split("T")[0]).length}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Proteínas</p>
                        <p className="text-xl font-bold">{dailyTotals.protein}g</p>
                        <p className="text-xs text-gray-500">{Math.round(dailyTotals.protein * 4)} kcal</p>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Carbohidratos</p>
                        <p className="text-xl font-bold">{dailyTotals.carbs}g</p>
                        <p className="text-xs text-gray-500">{Math.round(dailyTotals.carbs * 4)} kcal</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Grasas</p>
                        <p className="text-xl font-bold">{dailyTotals.fat}g</p>
                        <p className="text-xs text-gray-500">{Math.round(dailyTotals.fat * 9)} kcal</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Alimentos Registrados Hoy</h3>
                  <div className="space-y-3">
                    {nutritionLog
                      .filter((entry) => entry.date === new Date().toISOString().split("T")[0])
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

                    {nutritionLog.filter((entry) => entry.date === new Date().toISOString().split("T")[0]).length ===
                      0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No hay alimentos registrados para hoy</p>
                        <Button variant="link" onClick={() => setActiveTab("registro")} className="mt-2">
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
