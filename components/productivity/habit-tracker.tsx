"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Plus,
  Trash2,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckSquare,
  AlertCircle,
  Award
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Habit, HabitLog, getHabits, saveHabit, completeHabit } from "@/lib/habits-service"
import { WorkScheduleTemplate, getWorkScheduleTemplates } from "@/lib/habits-service"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

interface HabitTrackerProps {
  userId: string
  className?: string
}

export function HabitTracker({
  userId,
  className
}: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleTemplates, setScheduleTemplates] = useState<WorkScheduleTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    title: "",
    description: "",
    category: "work",
    frequency: ["weekdays"],
    timeOfDay: "",
    duration: 30,
    reminder: false,
    isActive: true
  })
  const { toast } = useToast()

  // Categorías de hábitos
  const categories = [
    { id: "all", name: "Todos", icon: CheckSquare },
    { id: "morning_routine", name: "Rutina matutina", icon: Calendar },
    { id: "work", name: "Trabajo", icon: CheckSquare },
    { id: "health", name: "Salud", icon: Calendar },
    { id: "evening", name: "Noche", icon: Calendar }
  ]

  // Opciones de frecuencia
  const frequencyOptions = [
    { value: "daily", label: "Diario" },
    { value: "weekdays", label: "Días laborables (L-V)" },
    { value: "weekends", label: "Fines de semana" },
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" }
  ]

  // Cargar hábitos
  useEffect(() => {
    loadHabits()
    loadScheduleTemplates()
  }, [userId])

  const loadHabits = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const { data, error } = await getHabits(userId)

      if (error) {
        console.error("Error al cargar hábitos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los hábitos",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setHabits(data)
      }
    } catch (error) {
      console.error("Error al cargar hábitos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadScheduleTemplates = async () => {
    try {
      const { data, error } = await getWorkScheduleTemplates({ isSpanish: true })

      if (error) {
        console.error("Error al cargar plantillas de horarios:", error)
        return
      }

      if (data) {
        setScheduleTemplates(data)
      }
    } catch (error) {
      console.error("Error al cargar plantillas de horarios:", error)
    }
  }

  // Filtrar hábitos por categoría
  const filteredHabits = activeTab === "all"
    ? habits
    : habits.filter(habit => habit.category === activeTab)

  // Manejar cambio en el formulario
  const handleInputChange = (field: string, value: any) => {
    setNewHabit(prev => ({ ...prev, [field]: value }))
  }

  // Manejar cambio en la frecuencia
  const handleFrequencyChange = (value: string) => {
    let newFrequency: string[]

    // Convertir valores especiales en arrays
    if (value === "daily") {
      newFrequency = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    } else if (value === "weekdays") {
      newFrequency = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    } else if (value === "weekends") {
      newFrequency = ["saturday", "sunday"]
    } else {
      newFrequency = [value]
    }

    setNewHabit(prev => ({ ...prev, frequency: newFrequency }))
  }

  // Guardar nuevo hábito
  const handleSaveHabit = async () => {
    if (!userId) return

    if (!newHabit.title) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      })
      return
    }

    try {
      const habitData = {
        ...newHabit,
        userId,
        startDate: new Date().toISOString()
      } as Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'createdAt' | 'updatedAt'>

      const { data, error } = await saveHabit(habitData)

      if (error) {
        console.error("Error al guardar hábito:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el hábito",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setHabits(prev => [data, ...prev])
        setShowAddDialog(false)
        setNewHabit({
          title: "",
          description: "",
          category: "work",
          frequency: ["weekdays"],
          timeOfDay: "",
          duration: 30,
          reminder: false,
          isActive: true
        })

        toast({
          title: "Éxito",
          description: "Hábito guardado correctamente"
        })
      }
    } catch (error) {
      console.error("Error al guardar hábito:", error)
    }
  }

  // Completar un hábito
  const handleCompleteHabit = async (habitId: string) => {
    if (!userId) return

    try {
      const { data, error } = await completeHabit(habitId, userId)

      if (error) {
        console.error("Error al completar hábito:", error)
        toast({
          title: "Error",
          description: "No se pudo completar el hábito",
          variant: "destructive"
        })
        return
      }

      // Actualizar la lista de hábitos
      loadHabits()

      toast({
        title: "Éxito",
        description: "Hábito completado correctamente"
      })
    } catch (error) {
      console.error("Error al completar hábito:", error)
    }
  }

  // Aplicar plantilla de horario
  const handleApplyScheduleTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Selecciona una plantilla",
        variant: "destructive"
      })
      return
    }

    // Encontrar la plantilla seleccionada
    const template = scheduleTemplates.find(t => t.id === selectedTemplate)

    if (!template) {
      toast({
        title: "Error",
        description: "Plantilla no encontrada",
        variant: "destructive"
      })
      return
    }

    try {
      // Crear hábitos basados en la plantilla
      const schedule = template.schedule
      const habitPromises = []

      // Crear hábito para cada entrada en el horario
      for (const [day, periods] of Object.entries(schedule)) {
        for (const period of periods) {
          const habitData = {
            userId,
            title: `Trabajo: ${period.start} - ${period.end}`,
            description: `Horario laboral según plantilla "${template.name}"`,
            category: "work",
            frequency: [day],
            timeOfDay: period.start,
            duration: calculateDurationInMinutes(period.start, period.end),
            reminder: true,
            reminderTime: "15min_before",
            isActive: true,
            startDate: new Date().toISOString()
          } as Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'createdAt' | 'updatedAt'>

          habitPromises.push(saveHabit(habitData))
        }
      }

      // Si incluye siesta, añadir hábito de siesta
      if (template.includesSiesta) {
        const siestaHabitData = {
          userId,
          title: "Siesta científica",
          description: "Descanso de 20-30 minutos para recuperar energía",
          category: "health",
          frequency: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          timeOfDay: "15:00",
          duration: 25,
          reminder: true,
          reminderTime: "15min_before",
          isActive: true,
          startDate: new Date().toISOString()
        } as Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'createdAt' | 'updatedAt'>

        habitPromises.push(saveHabit(siestaHabitData))
      }

      // Guardar todos los hábitos
      await Promise.all(habitPromises)

      // Recargar hábitos
      loadHabits()

      setShowScheduleDialog(false)
      setSelectedTemplate("")

      toast({
        title: "Éxito",
        description: `Plantilla "${template.name}" aplicada correctamente`
      })
    } catch (error) {
      console.error("Error al aplicar plantilla:", error)
      toast({
        title: "Error",
        description: "No se pudo aplicar la plantilla",
        variant: "destructive"
      })
    }
  }

  // Calcular duración en minutos entre dos horas
  const calculateDurationInMinutes = (start: string, end: string): number => {
    const [startHour, startMinute] = start.split(":").map(Number)
    const [endHour, endMinute] = end.split(":").map(Number)

    let durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)

    // Si es negativo, asumir que cruza la medianoche
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60
    }

    return durationMinutes
  }

  // Formatear frecuencia para mostrar
  const formatFrequency = (frequency: string[]): string => {
    if (frequency.length === 7) return "Diario"
    if (frequency.length === 5 &&
        frequency.includes("monday") &&
        frequency.includes("tuesday") &&
        frequency.includes("wednesday") &&
        frequency.includes("thursday") &&
        frequency.includes("friday")) return "Días laborables"
    if (frequency.length === 2 &&
        frequency.includes("saturday") &&
        frequency.includes("sunday")) return "Fines de semana"

    // Traducir días individuales
    const dayTranslations: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    }

    return frequency.map(day => dayTranslations[day] || day).join(", ")
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <PulseLoader message="Cargando hábitos..." />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Hábitos personalizados</h2>
        <div className="flex gap-2">
          <Button3D
            variant="outline"
            size="sm"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Plantillas
          </Button3D>
          <Button3D
            variant="default"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button3D>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              <category.icon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredHabits.length === 0 ? (
        <Card3D className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay hábitos</h3>
            <p className="text-gray-500 mb-4">Crea tu primer hábito o utiliza una plantilla predefinida</p>
            <div className="flex gap-2">
              <Button3D
                variant="outline"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Usar plantilla
              </Button3D>
              <Button3D
                variant="default"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Crear hábito
              </Button3D>
            </div>
          </div>
        </Card3D>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map(habit => (
            <Card3D key={habit.id} className="p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{habit.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{formatFrequency(habit.frequency)}</span>
                        {habit.timeOfDay && (
                          <>
                            <span className="mx-1">•</span>
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{habit.timeOfDay}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={habit.streak > 0 ? "default" : "outline"} className="ml-2">
                      {habit.streak} días
                    </Badge>
                  </div>

                  {habit.description && (
                    <p className="text-sm text-gray-600 mt-2">{habit.description}</p>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-xs text-gray-500">Récord: {habit.longestStreak} días</span>
                    </div>
                    <Button3D
                      variant="default"
                      size="sm"
                      className="h-8"
                      onClick={() => handleCompleteHabit(habit.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completar
                    </Button3D>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      )}

      {/* Diálogo para añadir nuevo hábito */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo hábito</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newHabit.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Meditar 10 minutos"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={newHabit.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe tu hábito..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newHabit.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning_routine">Rutina matutina</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="health">Salud</SelectItem>
                    <SelectItem value="evening">Noche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select
                  onValueChange={handleFrequencyChange}
                  defaultValue="weekdays"
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="timeOfDay">Hora del día (opcional)</Label>
                <Input
                  id="timeOfDay"
                  type="time"
                  value={newHabit.timeOfDay}
                  onChange={(e) => handleInputChange("timeOfDay", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={newHabit.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminder"
                checked={newHabit.reminder}
                onCheckedChange={(checked) => handleInputChange("reminder", checked)}
              />
              <Label htmlFor="reminder">Activar recordatorio</Label>
            </div>
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSaveHabit}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para plantillas de horarios */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Plantillas de horarios españoles</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">
              Selecciona una plantilla predefinida para crear automáticamente hábitos basados en horarios laborales españoles.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="template">Plantilla</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Selecciona plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {scheduleTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} {template.includesSiesta ? "(con siesta)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium mb-2">Detalles de la plantilla</h4>
                {scheduleTemplates.find(t => t.id === selectedTemplate)?.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {scheduleTemplates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                )}
                <div className="text-sm">
                  <div className="font-medium mb-1">Horario:</div>
                  <ul className="space-y-1">
                    {Object.entries(scheduleTemplates.find(t => t.id === selectedTemplate)?.schedule || {}).map(([day, periods]) => (
                      <li key={day}>
                        <span className="font-medium">{translateDay(day)}:</span>{" "}
                        {periods.map((period, i) => (
                          <span key={i}>
                            {period.start} - {period.end}
                            {i < periods.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleApplyScheduleTemplate}>
              Aplicar plantilla
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Función para traducir días de la semana
function translateDay(day: string): string {
  const translations: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
  }

  return translations[day] || day
}
