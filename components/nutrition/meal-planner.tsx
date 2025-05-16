"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek } from "date-fns"
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
import { CalendarIcon, Plus, Loader2, Copy, Trash2, Coffee, Utensils, Moon, Apple, ChevronLeft, ChevronRight } from "lucide-react"
import { getUserMealPlans, getMealPlanDetails, createMealPlan, deleteMealPlan } from "@/lib/nutrition-service"
import { MealPlan, MealPlanDetail, MEAL_TYPES } from "@/lib/types/nutrition"

interface MealPlannerProps {
  userId: string
}

export default function MealPlanner({ userId }: MealPlannerProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [planDetails, setPlanDetails] = useState<MealPlanDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active-plans")
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: addDays(new Date(), 6).toISOString().split("T")[0],
    is_template: false
  })

  // Cargar planes de comidas
  useEffect(() => {
    const loadMealPlans = async () => {
      setIsLoading(true)
      try {
        try {
          // Verificar si la tabla existe antes de consultar
          const { data, error } = await getUserMealPlans(userId)

          if (error) {
            // Si el error es porque la tabla no existe, lo manejamos silenciosamente
            if (error.code === '42P01') { // Código PostgreSQL para "tabla no existe"
              console.info('La tabla meal_plans no existe todavía');
              setMealPlans([]);
              return;
            }

            console.warn("Error fetching meal plans:", error);
            setMealPlans([]);
          } else if (data) {
            setMealPlans(data)

            // Seleccionar el plan activo más reciente por defecto
            const activePlans = data.filter(plan => plan.is_active)
            if (activePlans.length > 0) {
              const mostRecent = activePlans.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
              setSelectedPlan(mostRecent)
              loadPlanDetails(mostRecent.id)
            }
          }
        } catch (supabaseError) {
          console.warn('Error al consultar tabla meal_plans:', supabaseError);
          setMealPlans([]);
        }
      } catch (error) {
        console.error("Error general al cargar planes de comidas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes de comidas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMealPlans()
  }, [userId, toast])

  // Cargar detalles del plan seleccionado
  const loadPlanDetails = async (planId: string) => {
    try {
      try {
        const { data, error } = await getMealPlanDetails(planId)

        if (error) {
          // Si el error es porque la tabla no existe, lo manejamos silenciosamente
          if (error.code === '42P01') { // Código PostgreSQL para "tabla no existe"
            console.info('La tabla meal_plan_details no existe todavía');
            setPlanDetails([]);
            return;
          }

          console.warn("Error fetching meal plan details:", error);
          setPlanDetails([]);
        } else if (data) {
          setPlanDetails(data)
        } else {
          setPlanDetails([])
        }
      } catch (supabaseError) {
        console.warn('Error al consultar tabla meal_plan_details:', supabaseError);
        setPlanDetails([]);
      }
    } catch (error) {
      console.error("Error general al cargar detalles del plan:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del plan",
        variant: "destructive",
      })
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
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
      // Crear plan básico
      const newPlan = {
        user_id: userId,
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: true,
        is_template: formData.is_template
      }

      // Crear detalles vacíos para cada día y tipo de comida
      const details: Omit<MealPlanDetail, "id" | "meal_plan_id" | "created_at">[] = []

      // Calcular número de días en el plan
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Crear entradas para cada día y tipo de comida
      for (let i = 0; i < dayDiff; i++) {
        const currentDate = addDays(startDate, i)
        const dayOfWeek = currentDate.getDay() // 0 = domingo, 6 = sábado

        for (const mealType of MEAL_TYPES) {
          details.push({
            day_of_week: dayOfWeek,
            meal_type: mealType.value,
            food_name: "",
            servings: 1,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          })
        }
      }

      const { data, error } = await createMealPlan(newPlan, details)

      if (error) {
        throw error
      }

      toast({
        title: "Plan creado",
        description: "El plan de comidas ha sido creado correctamente",
      })

      // Actualizar la lista de planes
      if (data) {
        setMealPlans([data, ...mealPlans])
        setSelectedPlan(data)
        loadPlanDetails(data.id)
      }

      // Resetear formulario
      setFormData({
        name: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: addDays(new Date(), 6).toISOString().split("T")[0],
        is_template: false
      })

      setCreatePlanDialogOpen(false)
    } catch (error) {
      console.error("Error al crear plan de comidas:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el plan de comidas",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar plan
  const handleDeletePlan = async (planId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este plan?")) {
      return
    }

    try {
      const { error } = await deleteMealPlan(planId)

      if (error) {
        throw error
      }

      toast({
        title: "Plan eliminado",
        description: "El plan de comidas ha sido eliminado correctamente",
      })

      // Actualizar la lista de planes
      setMealPlans(mealPlans.filter(plan => plan.id !== planId))

      // Si el plan eliminado era el seleccionado, seleccionar otro
      if (selectedPlan?.id === planId) {
        const remainingPlans = mealPlans.filter(plan => plan.id !== planId)
        if (remainingPlans.length > 0) {
          setSelectedPlan(remainingPlans[0])
          loadPlanDetails(remainingPlans[0].id)
        } else {
          setSelectedPlan(null)
          setPlanDetails([])
        }
      }
    } catch (error) {
      console.error("Error al eliminar plan de comidas:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan de comidas",
        variant: "destructive",
      })
    }
  }

  // Cambiar semana
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  // Renderizar días de la semana
  const renderWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i)
      days.push(day)
    }
    return days
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

  // Obtener detalles para un día y tipo de comida específicos
  const getMealForDayAndType = (dayOfWeek: number, mealType: string) => {
    return planDetails.find(detail =>
      detail.day_of_week === dayOfWeek && detail.meal_type === mealType
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="active-plans">Planes Activos</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="active-plans" className="mt-0 space-y-4">
          {/* Botón para crear plan */}
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setCreatePlanDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Crear nuevo plan</span>
          </Button>

          {/* Lista de planes activos */}
          <div className="space-y-4">
            {mealPlans.filter(plan => plan.is_active && !plan.is_template).length > 0 ? (
              <>
                <h3 className="text-sm font-medium">Planes activos</h3>
                <div className="space-y-3">
                  {mealPlans
                    .filter(plan => plan.is_active && !plan.is_template)
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className={`overflow-hidden cursor-pointer ${selectedPlan?.id === plan.id ? 'border-primary' : ''}`}
                        onClick={() => {
                          setSelectedPlan(plan)
                          loadPlanDetails(plan.id)
                        }}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{plan.name}</CardTitle>
                              <CardDescription>
                                {format(new Date(plan.start_date), "dd/MM/yyyy")} - {format(new Date(plan.end_date), "dd/MM/yyyy")}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation()
                                // Implementar duplicar plan
                              }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePlan(plan.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {plan.description && (
                            <p className="text-sm text-gray-500">{plan.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No tienes planes activos</p>
                <p className="text-sm mt-2">Crea un nuevo plan para organizar tus comidas</p>
              </div>
            )}
          </div>

          {/* Vista del plan seleccionado */}
          {selectedPlan && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle>{selectedPlan.name}</CardTitle>
                <CardDescription>
                  {format(new Date(selectedPlan.start_date), "dd/MM/yyyy")} - {format(new Date(selectedPlan.end_date), "dd/MM/yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Selector de semana */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(addDays(currentWeekStart, 6), "d 'de' MMMM", { locale: es })}
                  </div>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendario semanal */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-24 p-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comida</th>
                        {renderWeekDays().map((day, index) => (
                          <th key={index} className="p-2 border text-center">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {format(day, "EEE", { locale: es })}
                            </div>
                            <div className="text-sm font-medium">
                              {format(day, "d")}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MEAL_TYPES.map((mealType) => (
                        <tr key={mealType.value}>
                          <td className="p-2 border">
                            <div className="flex items-center">
                              <div className={`
                                p-1 rounded-full mr-2
                                ${mealType.value === "desayuno" ? "bg-yellow-100 text-yellow-700" : ""}
                                ${mealType.value === "almuerzo" ? "bg-green-100 text-green-700" : ""}
                                ${mealType.value === "cena" ? "bg-blue-100 text-blue-700" : ""}
                                ${mealType.value === "snack" ? "bg-purple-100 text-purple-700" : ""}
                              `}>
                                {renderMealIcon(mealType.value)}
                              </div>
                              <span className="text-sm font-medium">{mealType.label}</span>
                            </div>
                          </td>
                          {renderWeekDays().map((day, index) => {
                            const dayOfWeek = day.getDay()
                            const meal = getMealForDayAndType(dayOfWeek, mealType.value)
                            return (
                              <td key={index} className="p-2 border text-sm">
                                {meal && meal.food_name ? (
                                  <div>
                                    <p className="font-medium">{meal.food_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {meal.calories} kcal
                                    </p>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-auto py-2 text-gray-400 hover:text-gray-900"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-0 space-y-4">
          {/* Lista de plantillas */}
          <div className="space-y-4">
            {mealPlans.filter(plan => plan.is_template).length > 0 ? (
              <>
                <h3 className="text-sm font-medium">Plantillas de planes</h3>
                <div className="space-y-3">
                  {mealPlans
                    .filter(plan => plan.is_template)
                    .map((plan) => (
                      <Card key={plan.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{plan.name}</CardTitle>
                              <CardDescription>Plantilla</CardDescription>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => {
                                // Implementar usar plantilla
                              }}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlan(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {plan.description && (
                            <p className="text-sm text-gray-500">{plan.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No tienes plantillas de planes</p>
                <p className="text-sm mt-2">Crea un plan como plantilla para reutilizarlo en el futuro</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear plan */}
      <Dialog open={createPlanDialogOpen} onOpenChange={setCreatePlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo plan</DialogTitle>
            <DialogDescription>
              Crea un plan de comidas para organizar tu alimentación.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del plan</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Añade una descripción para tu plan..."
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date
                        ? format(new Date(formData.start_date), "dd/MM/yyyy")
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.start_date)}
                      onSelect={(date) => {
                        if (date) {
                          const newStartDate = date.toISOString().split("T")[0]
                          setFormData({
                            ...formData,
                            start_date: newStartDate,
                            // Actualizar fecha de fin para mantener 7 días
                            end_date: addDays(date, 6).toISOString().split("T")[0]
                          })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date
                        ? format(new Date(formData.end_date), "dd/MM/yyyy")
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.end_date)}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({
                            ...formData,
                            end_date: date.toISOString().split("T")[0]
                          })
                        }
                      }}
                      disabled={(date) =>
                        date < new Date(formData.start_date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_template"
                name="is_template"
                checked={formData.is_template}
                onChange={(e) => setFormData({
                  ...formData,
                  is_template: e.target.checked
                })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_template" className="text-sm font-normal">
                Guardar como plantilla
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreatePlanDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
