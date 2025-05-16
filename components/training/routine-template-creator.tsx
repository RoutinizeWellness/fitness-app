"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw, FileText,
  BookmarkPlus, Edit, Trash2, Copy,
  Sparkles
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"
import { PredefinedTemplates } from "@/components/training/predefined-templates"
import { TemplateManager } from "@/components/training/template-manager"
import { AdvancedBodybuildingRoutines } from "@/components/training/advanced-bodybuilding-routines"
import { saveWorkoutRoutine } from "@/lib/supabase-training"

interface RoutineTemplateCreatorProps {
  userId: string
  availableExercises: Exercise[]
  onSave: (routine: WorkoutRoutine) => void
  onCancel: () => void
}

export function RoutineTemplateCreator({
  userId,
  availableExercises,
  onSave,
  onCancel
}: RoutineTemplateCreatorProps) {
  // Configuración básica
  const [name, setName] = useState("Mi rutina personalizada")
  const [description, setDescription] = useState("Rutina generada automáticamente")
  const [goal, setGoal] = useState<"strength" | "hypertrophy" | "endurance" | "weight_loss" | "general_fitness">("hypertrophy")
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [frequency, setFrequency] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true) // Mostrar plantillas predefinidas por defecto
  const [showAdvancedRoutines, setShowAdvancedRoutines] = useState(false) // Mostrar rutinas avanzadas

  // Configuración avanzada
  const [includeMicrocycles, setIncludeMicrocycles] = useState(false)
  const [microcycleLength, setMicrocycleLength] = useState(5)
  const [annualPlan, setAnnualPlan] = useState(false)
  const [includeDeloads, setIncludeDeloads] = useState(true)
  const [deloadFrequency, setDeloadFrequency] = useState(4) // Cada cuántas semanas

  // Preferencias de ejercicios
  const [preferredEquipment, setPreferredEquipment] = useState<string[]>(["barbell", "dumbbell", "bodyweight"])
  const [excludedMuscleGroups, setExcludedMuscleGroups] = useState<string[]>([])
  const [focusMuscleGroups, setFocusMuscleGroups] = useState<string[]>([])

  // Rutina generada
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutine | null>(null)

  // Estado para gestión de plantillas
  const [showTemplateManager, setShowTemplateManager] = useState(false)

  // Estado para selección de días de la semana
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    lunes: true,
    martes: true,
    miércoles: true,
    jueves: true,
    viernes: true,
    sábado: false,
    domingo: false
  })
  const [showDaySelector, setShowDaySelector] = useState(false)

  // Función para mostrar el selector de días
  const showDaysSelector = () => {
    // Inicializar los días seleccionados según la frecuencia
    const initialSelectedDays: Record<string, boolean> = {
      lunes: false,
      martes: false,
      miércoles: false,
      jueves: false,
      viernes: false,
      sábado: false,
      domingo: false
    }

    // Seleccionar los primeros N días según la frecuencia
    const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    diasSemana.forEach((dia, index) => {
      initialSelectedDays[dia] = index < frequency
    })

    setSelectedDays(initialSelectedDays)
    setShowDaySelector(true)
  }

  // Función para generar una rutina basada en la configuración
  const generateRoutine = () => {
    // Verificar si hay suficientes días seleccionados
    const selectedDaysCount = Object.values(selectedDays).filter(Boolean).length

    if (selectedDaysCount !== frequency) {
      toast({
        title: "Selección incorrecta",
        description: `Debes seleccionar exactamente ${frequency} días para esta rutina.`,
        variant: "destructive"
      })

      // Mostrar el selector de días si no se ha mostrado aún
      if (!showDaySelector) {
        showDaysSelector()
        return
      }

      return
    }

    setIsGenerating(true)

    // Simulamos un tiempo de generación
    setTimeout(() => {
      // Crear un ID único para la rutina
      const routineId = `routine-${Date.now()}`

      // Crear los días de entrenamiento según la frecuencia
      const days: WorkoutDay[] = []

      // Nombres de los días según la frecuencia
      const dayNames = {
        3: ["Tren Superior", "Tren Inferior", "Cuerpo Completo"],
        4: ["Pecho y Tríceps", "Espalda y Bíceps", "Piernas", "Hombros y Core"],
        5: ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos"],
        6: ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core"]
      }

      // Grupos musculares por día
      const muscleGroups = {
        "Pecho y Tríceps": ["chest", "triceps"],
        "Espalda y Bíceps": ["back", "biceps"],
        "Piernas": ["quads", "hamstrings", "glutes", "calves"],
        "Hombros y Core": ["shoulders", "abs"],
        "Pecho": ["chest"],
        "Espalda": ["back"],
        "Hombros": ["shoulders"],
        "Brazos": ["biceps", "triceps"],
        "Core": ["abs"],
        "Tren Superior": ["chest", "back", "shoulders", "arms"],
        "Tren Inferior": ["quads", "hamstrings", "glutes", "calves"],
        "Cuerpo Completo": ["chest", "back", "shoulders", "arms", "legs"]
      }

      // Obtener los días seleccionados
      const selectedDaysArray = Object.entries(selectedDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day)

      // Crear los días según la frecuencia
      const selectedDayNames = dayNames[frequency as keyof typeof dayNames] || dayNames[4]

      for (let i = 0; i < frequency; i++) {
        const dayName = selectedDayNames[i % selectedDayNames.length]
        const weekDay = selectedDaysArray[i]
        const targetGroups = muscleGroups[dayName as keyof typeof muscleGroups] || []

        // Filtrar ejercicios para este grupo muscular
        const dayExercises = availableExercises.filter(ex =>
          targetGroups.some(group => ex.category === group || (ex.muscleGroup && ex.muscleGroup.includes(group)))
        )

        // Seleccionar 3-5 ejercicios para este día
        const numExercises = Math.floor(Math.random() * 3) + 3 // 3-5 ejercicios
        const selectedExercises = dayExercises.sort(() => 0.5 - Math.random()).slice(0, numExercises)

        // Crear sets para cada ejercicio
        const exerciseSets: ExerciseSet[] = []

        selectedExercises.forEach(exercise => {
          // Determinar número de series según el objetivo
          let sets = 3
          if (goal === "strength") sets = 5
          if (goal === "hypertrophy") sets = 4
          if (goal === "endurance") sets = 3

          // Determinar repeticiones según el objetivo
          let reps = 10
          let rir = 2

          if (goal === "strength") {
            reps = 5
            rir = 1
          } else if (goal === "hypertrophy") {
            reps = 10
            rir = 2
          } else if (goal === "endurance") {
            reps = 15
            rir = 3
          } else if (goal === "weight_loss") {
            reps = 12
            rir = 1
          }

          // Crear las series
          for (let j = 0; j < sets; j++) {
            exerciseSets.push({
              id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              exerciseId: exercise.id,
              targetReps: reps,
              targetRir: rir,
              restTime: goal === "strength" ? 180 : goal === "hypertrophy" ? 90 : 60
            })
          }
        })

        // Crear el día con el nombre del día de la semana
        const dayNameWithWeekday = `${dayName} (${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)})`

        days.push({
          id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: dayNameWithWeekday,
          description: `Entrenamiento de ${dayName} para ${weekDay}`,
          exerciseSets,
          targetMuscleGroups: targetGroups,
          difficulty: level,
          estimatedDuration: exerciseSets.length * 3 // Estimación simple: 3 minutos por serie
        })
      }

      // Crear la rutina completa
      const routine: WorkoutRoutine = {
        id: routineId,
        userId,
        name,
        description,
        days,
        frequency,
        goal,
        level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }

      setGeneratedRoutine(routine)
      setIsGenerating(false)
      setIsEditing(true)
      setShowDaySelector(false)

      toast({
        title: "Rutina generada",
        description: "Se ha creado una rutina personalizada según tus preferencias.",
        variant: "default"
      })
    }, 2000)
  }

  // Función para guardar la rutina
  const handleSave = () => {
    if (generatedRoutine) {
      onSave(generatedRoutine)
    }
  }

  // Función para guardar como plantilla
  const handleSaveAsTemplate = async () => {
    if (!generatedRoutine) return

    try {
      // Crear una copia de la rutina como plantilla
      const templateRoutine: WorkoutRoutine = {
        ...generatedRoutine,
        id: `template-${Date.now()}`,
        isTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await saveWorkoutRoutine(templateRoutine)

      if (error) {
        throw error
      }

      toast({
        title: "Plantilla guardada",
        description: "La rutina se ha guardado como plantilla personalizada",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al guardar plantilla:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive"
      })
    }
  }

  // Función para editar un día
  const handleEditDay = (dayIndex: number) => {
    // Aquí se implementaría la lógica para editar un día específico
    console.log("Editar día:", dayIndex)
  }

  // Renderizar la configuración básica
  const renderBasicConfig = () => (
    <Card3D className="p-6">
      <Card3DHeader>
        <Card3DTitle>Configuración básica</Card3DTitle>
      </Card3DHeader>
      <Card3DContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="routine-name">Nombre de la rutina</Label>
          <Input
            id="routine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi rutina personalizada"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="routine-description">Descripción</Label>
          <Textarea
            id="routine-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu rutina"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="routine-goal">Objetivo</Label>
            <Select
              value={goal}
              onValueChange={(value) => setGoal(value as any)}
            >
              <SelectTrigger id="routine-goal">
                <SelectValue placeholder="Seleccionar objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Fuerza</SelectItem>
                <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                <SelectItem value="endurance">Resistencia</SelectItem>
                <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                <SelectItem value="general_fitness">Fitness general</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="routine-level">Nivel</Label>
            <Select
              value={level}
              onValueChange={(value) => setLevel(value as any)}
            >
              <SelectTrigger id="routine-level">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="routine-frequency">Frecuencia (días por semana): {frequency}</Label>
          <Slider
            id="routine-frequency"
            min={3}
            max={6}
            step={1}
            value={[frequency]}
            onValueChange={(value) => setFrequency(value[0])}
          />
        </div>
      </Card3DContent>
    </Card3D>
  )

  // Renderizar la configuración avanzada
  const renderAdvancedConfig = () => (
    <Card3D className="p-6">
      <Card3DHeader>
        <Card3DTitle>Configuración avanzada</Card3DTitle>
      </Card3DHeader>
      <Card3DContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="microcycles">Incluir microciclos</Label>
            <p className="text-sm text-gray-500">Planificación de 5-7 días con variación de intensidad</p>
          </div>
          <Switch
            id="microcycles"
            checked={includeMicrocycles}
            onCheckedChange={setIncludeMicrocycles}
          />
        </div>

        {includeMicrocycles && (
          <div className="space-y-2 pl-4 border-l-2 border-gray-100">
            <Label htmlFor="microcycle-length">Duración del microciclo: {microcycleLength} días</Label>
            <Slider
              id="microcycle-length"
              min={5}
              max={7}
              step={1}
              value={[microcycleLength]}
              onValueChange={(value) => setMicrocycleLength(value[0])}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="annual-plan">Planificación anual</Label>
            <p className="text-sm text-gray-500">Crear un plan completo para todo el año</p>
          </div>
          <Switch
            id="annual-plan"
            checked={annualPlan}
            onCheckedChange={setAnnualPlan}
          />
        </div>

        {annualPlan && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deloads">Incluir descargas</Label>
                <p className="text-sm text-gray-500">Semanas de menor intensidad para recuperación</p>
              </div>
              <Switch
                id="deloads"
                checked={includeDeloads}
                onCheckedChange={setIncludeDeloads}
              />
            </div>

            {includeDeloads && (
              <div className="space-y-2">
                <Label htmlFor="deload-frequency">Frecuencia de descargas: Cada {deloadFrequency} semanas</Label>
                <Slider
                  id="deload-frequency"
                  min={3}
                  max={8}
                  step={1}
                  value={[deloadFrequency]}
                  onValueChange={(value) => setDeloadFrequency(value[0])}
                />
              </div>
            )}
          </div>
        )}
      </Card3DContent>
    </Card3D>
  )

  // Renderizar la rutina generada
  const renderGeneratedRoutine = () => {
    if (!generatedRoutine) return null

    return (
      <div className="space-y-4">
        <Card3D className="p-6">
          <Card3DHeader>
            <div className="flex justify-between items-center">
              <Card3DTitle>{generatedRoutine.name}</Card3DTitle>
              <Badge>{generatedRoutine.level}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{generatedRoutine.description}</p>
          </Card3DHeader>
          <Card3DContent className="pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">
                <Dumbbell className="h-3 w-3 mr-1" />
                {generatedRoutine.goal === "strength" ? "Fuerza" :
                 generatedRoutine.goal === "hypertrophy" ? "Hipertrofia" :
                 generatedRoutine.goal === "endurance" ? "Resistencia" :
                 generatedRoutine.goal === "weight_loss" ? "Pérdida de peso" :
                 "Fitness general"}
              </Badge>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {generatedRoutine.frequency} días/semana
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {generatedRoutine.days.reduce((total, day) => total + (day.estimatedDuration || 0), 0)} min/semana
              </Badge>
            </div>

            <div className="space-y-4">
              {generatedRoutine.days.map((day, index) => (
                <Card3D key={day.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{day.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {day.targetMuscleGroups.map(group => (
                            <Badge key={group} variant="secondary" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {day.estimatedDuration} min
                          </Badge>
                        </div>
                      </div>
                      <Button3D
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDay(index)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button3D>
                    </div>

                    <div className="mt-4 space-y-2">
                      {/* Agrupar ejercicios por ID */}
                      {Array.from(new Set(day.exerciseSets.map(set => set.exerciseId))).map(exerciseId => {
                        const exercise = availableExercises.find(ex => ex.id === exerciseId)
                        const sets = day.exerciseSets.filter(set => set.exerciseId === exerciseId)

                        return (
                          <div key={exerciseId} className="border border-gray-100 rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{exercise?.name || "Ejercicio"}</h4>
                                <p className="text-xs text-gray-500">
                                  {sets.length} series × {sets[0]?.targetReps || 10} reps (RIR: {sets[0]?.targetRir || 2})
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {Array.isArray(exercise?.equipment) ? exercise?.equipment?.join(", ") : ""}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </Card3DContent>
        </Card3D>
      </div>
    )
  }

  // Función para manejar la selección de una plantilla
  const handleTemplateSelection = (template: WorkoutRoutine) => {
    setGeneratedRoutine(template)
    setIsEditing(true)
    setShowTemplates(false)

    // Actualizar los campos del formulario con los datos de la plantilla
    setName(template.name)
    setDescription(template.description || "")
    setGoal(template.goal)
    setLevel(template.level)
    setFrequency(template.frequency)
  }

  // Función para manejar la selección de una plantilla desde el gestor
  const handleTemplateManagerSelection = (template: WorkoutRoutine) => {
    setGeneratedRoutine(template)
    setIsEditing(true)
    setShowTemplateManager(false)

    // Actualizar los campos del formulario con los datos de la plantilla
    setName(template.name)
    setDescription(template.description || "")
    setGoal(template.goal)
    setLevel(template.level)
    setFrequency(template.frequency)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Crear rutina personalizada</h2>
        <div className="flex items-center space-x-2">
          <Button3D variant="outline" onClick={() => setShowTemplateManager(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Mis plantillas
          </Button3D>
          <Button3D variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button3D>
        </div>
      </div>

      {showDaySelector ? (
        // Mostrar selector de días
        <div className="space-y-6">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Selecciona los días de entrenamiento</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <p className="text-sm text-gray-500 mb-4">
                Selecciona exactamente {frequency} días en los que realizarás tu entrenamiento.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {Object.entries(selectedDays).map(([day, isSelected]) => (
                  <div
                    key={day}
                    className={`
                      p-3 rounded-lg cursor-pointer border transition-colors
                      ${isSelected
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                    `}
                    onClick={() => {
                      // Verificar si ya tenemos el número máximo de días seleccionados
                      const currentSelected = Object.values(selectedDays).filter(Boolean).length

                      // Si ya está seleccionado, permitir deseleccionar
                      // Si no está seleccionado, solo permitir seleccionar si no hemos alcanzado el máximo
                      if (isSelected || currentSelected < frequency) {
                        setSelectedDays({
                          ...selectedDays,
                          [day]: !isSelected
                        })
                      } else {
                        toast({
                          title: "Máximo alcanzado",
                          description: `Solo puedes seleccionar ${frequency} días para esta rutina.`,
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{day}</span>
                      {isSelected ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <Button3D variant="outline" onClick={() => setShowDaySelector(false)}>
                  Volver
                </Button3D>
                <Button3D onClick={generateRoutine}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Generar rutina
                    </>
                  )}
                </Button3D>
              </div>
            </Card3DContent>
          </Card3D>
        </div>
      ) : showTemplates ? (
        // Mostrar plantillas predefinidas
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Elige cómo empezar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card3D
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowTemplates(false)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Crear desde cero</h3>
                <p className="text-sm text-gray-500">
                  Configura tu rutina personalizada con todas las opciones disponibles
                </p>
              </div>
            </Card3D>

            <Card3D
              className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-primary/10 to-primary/5"
            >
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/20 p-4 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Usar plantilla</h3>
                <p className="text-sm text-gray-500">
                  Elige entre plantillas prediseñadas y personalízalas a tu gusto
                </p>
              </div>
            </Card3D>
          </div>

          <PredefinedTemplates
            userId={userId}
            availableExercises={availableExercises}
            onSelectTemplate={handleTemplateSelection}
            onCancel={() => setShowTemplates(false)}
          />
        </div>
      ) : !isEditing ? (
        // Mostrar configuración para crear desde cero
        <>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {renderBasicConfig()}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {renderAdvancedConfig()}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button3D variant="outline" onClick={() => setShowTemplates(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Ver plantillas
              </Button3D>
              <Button3D variant="outline" onClick={() => setShowAdvancedRoutines(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Rutinas avanzadas
              </Button3D>
            </div>

            <div className="flex space-x-2">
              <Button3D variant="outline" onClick={onCancel}>
                Cancelar
              </Button3D>
              <Button3D onClick={showDaysSelector} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Seleccionar días
                  </>
                )}
              </Button3D>
            </div>
          </div>
        </>
      ) : (
        // Mostrar rutina generada para edición
        <>
          {renderGeneratedRoutine()}

          <div className="flex justify-end space-x-4">
            <Button3D variant="outline" onClick={() => setIsEditing(false)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Volver a configuración
            </Button3D>
            <Button3D variant="outline" onClick={showDaysSelector} disabled={isGenerating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar
            </Button3D>
            <Button3D variant="outline" onClick={handleSaveAsTemplate}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Guardar como plantilla
            </Button3D>
            <Button3D onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar rutina
            </Button3D>
          </div>
        </>
      )}

      {/* Gestor de plantillas */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
          <TemplateManager
            userId={userId}
            onSelectTemplate={handleTemplateManagerSelection}
            onCancel={() => setShowTemplateManager(false)}
          />
        </div>
      )}

      {/* Rutinas avanzadas */}
      {showAdvancedRoutines && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
          <AdvancedBodybuildingRoutines
            userId={userId}
            availableExercises={availableExercises}
            onSave={(routine) => {
              setGeneratedRoutine(routine)
              setIsEditing(true)
              setShowAdvancedRoutines(false)

              // Actualizar los campos del formulario con los datos de la rutina
              setName(routine.name)
              setDescription(routine.description || "")
              setGoal(routine.goal)
              setLevel(routine.level)
              setFrequency(routine.frequency)
            }}
            onCancel={() => setShowAdvancedRoutines(false)}
          />
        </div>
      )}
    </div>
  )
}
