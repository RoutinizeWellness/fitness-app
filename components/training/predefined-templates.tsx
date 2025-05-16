"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw, Sparkles,
  BookOpen, Lightbulb
} from "lucide-react"
import { WORKOUT_TEMPLATES, WorkoutTemplate, HIPERTROFIA_MAXIMA_DETAILED, PURE_BODYBUILDING_HYPERTROPHY_DETAILED } from "@/lib/predefined-workout-templates"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { WorkoutRoutine, Exercise } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedTemplateSelector } from "@/components/training/advanced-template-selector"

interface PredefinedTemplatesProps {
  userId: string
  availableExercises: Exercise[]
  onSelectTemplate: (template: WorkoutRoutine) => void
  onCancel: () => void
}

export function PredefinedTemplates({
  userId,
  availableExercises,
  onSelectTemplate,
  onCancel
}: PredefinedTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({})
  const [showDaySelector, setShowDaySelector] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  const [showAdvancedTemplates, setShowAdvancedTemplates] = useState(false)

  // Días de la semana
  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

  // Plantillas predefinidas
  const [templates, setTemplates] = useState<any[]>([])

  // Cargar plantillas desde nuestro archivo de plantillas predefinidas
  useEffect(() => {
    // Convertir las plantillas al formato esperado por el componente
    const formattedTemplates = WORKOUT_TEMPLATES.map(template => {
      // Generar días basados en el split y la frecuencia
      let days: string[] = []

      switch (template.split) {
        case "push_pull_legs":
          if (template.daysPerWeek === 6) {
            days = ["Empuje A", "Tirón A", "Piernas A", "Empuje B", "Tirón B", "Piernas B"]
          } else if (template.daysPerWeek === 3) {
            days = ["Empuje", "Tirón", "Piernas"]
          } else {
            days = ["Empuje", "Tirón", "Piernas", "Empuje", "Tirón"]
          }
          break
        case "upper_lower":
          if (template.daysPerWeek === 4) {
            days = ["Tren Superior A", "Tren Inferior A", "Tren Superior B", "Tren Inferior B"]
          } else if (template.daysPerWeek === 2) {
            days = ["Tren Superior", "Tren Inferior"]
          } else {
            days = ["Tren Superior A", "Tren Inferior A", "Tren Superior B", "Tren Inferior B", "Tren Superior C"]
          }
          break
        case "full_body":
          if (template.daysPerWeek === 3) {
            days = ["Cuerpo Completo A", "Cuerpo Completo B", "Cuerpo Completo C"]
          } else if (template.daysPerWeek === 4) {
            days = ["Cuerpo Completo A", "Cuerpo Completo B", "Cuerpo Completo C", "Cuerpo Completo D"]
          } else {
            days = ["Cuerpo Completo A", "Cuerpo Completo B"]
          }
          break
        case "body_part":
          days = ["Pecho", "Espalda", "Hombros", "Piernas", "Brazos"]
          break
        case "push_pull":
          days = ["Empuje A", "Tirón A", "Empuje B", "Tirón B"]
          break
        case "bro_split":
          days = ["Pecho", "Espalda", "Hombros", "Piernas", "Brazos"]
          break
        default:
          days = Array(template.daysPerWeek).fill(0).map((_, i) => `Día ${i + 1}`)
      }

      // Asignar un color según la categoría principal
      let color = "from-blue-500 to-indigo-600"
      if (template.category.includes("strength")) {
        color = "from-red-500 to-orange-600"
      } else if (template.category.includes("powerbuilding")) {
        color = "from-yellow-500 to-amber-600"
      } else if (template.category.includes("beginner")) {
        color = "from-green-500 to-teal-600"
      } else if (template.category.includes("advanced")) {
        color = "from-purple-500 to-pink-600"
      }

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        level: template.level,
        goal: template.category[0], // Usar la primera categoría como objetivo principal
        frequency: template.daysPerWeek,
        days: days.slice(0, template.daysPerWeek), // Limitar al número de días por semana
        color,
        includesDeload: template.includesDeload,
        deloadFrequency: template.deloadFrequency,
        source: template.source,
        tags: template.tags
      }
    })

    // Añadir algunas plantillas básicas que no están en el archivo de plantillas
    const basicTemplates = [
      {
        id: "hiit",
        name: "HIIT y Funcional",
        description: "Combinación de entrenamiento de alta intensidad y ejercicios funcionales para quemar grasa.",
        level: "intermediate",
        goal: "weight_loss",
        frequency: 4,
        days: ["HIIT Superior", "Funcional Total", "HIIT Inferior", "Cardio y Core"],
        color: "from-cyan-500 to-blue-600",
        includesDeload: false,
        deloadFrequency: 0,
        source: "Functional Training",
        tags: ["hiit", "funcional", "quema grasa"]
      }
    ]

    setTemplates([...formattedTemplates, ...basicTemplates])
  }, [])

  // Función para mostrar el selector de días
  const showDaysSelector = (templateId: string) => {
    setSelectedTemplate(templateId)

    // Encontrar la plantilla seleccionada
    const template = templates.find(t => t.id === templateId)

    if (!template) {
      toast({
        title: "Error",
        description: "Plantilla no encontrada",
        variant: "destructive"
      })
      return
    }

    // Inicializar los días seleccionados según la frecuencia de la plantilla
    const initialSelectedDays: Record<string, boolean> = {}
    diasSemana.forEach((dia, index) => {
      // Seleccionar los primeros N días según la frecuencia de la plantilla
      initialSelectedDays[dia] = index < template.frequency
    })

    setSelectedDays(initialSelectedDays)
    setShowDaySelector(true)
  }

  // Función para generar una rutina basada en la plantilla seleccionada
  const generateFromTemplate = async () => {
    if (!selectedTemplate) return

    setIsLoading(true)

    try {
      // Verificar que se hayan seleccionado suficientes días
      const template = templates.find(t => t.id === selectedTemplate)

      if (!template) {
        throw new Error("Plantilla no encontrada")
      }

      const selectedDaysCount = Object.values(selectedDays).filter(Boolean).length

      if (selectedDaysCount !== template.frequency) {
        toast({
          title: "Selección incorrecta",
          description: `Debes seleccionar exactamente ${template.frequency} días para esta plantilla.`,
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Crear la rutina basada en la plantilla y los días seleccionados
      const routine = await createRoutineFromTemplate(template, selectedDays)

      // Notificar éxito
      toast({
        title: "Plantilla cargada",
        description: "La plantilla se ha cargado correctamente. Ahora puedes personalizarla.",
        variant: "default"
      })

      // Pasar la rutina generada al componente padre
      onSelectTemplate(routine)
      setShowDaySelector(false)
    } catch (error) {
      console.error("Error al generar rutina desde plantilla:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la rutina desde la plantilla.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para crear una rutina a partir de una plantilla
  const createRoutineFromTemplate = async (template: any, selectedDaysMap?: Record<string, boolean>): Promise<WorkoutRoutine> => {
    // Mapeo de grupos musculares por tipo de día
    const muscleGroupsByDay: Record<string, string[]> = {
      "Empuje A": ["chest", "shoulders", "triceps"],
      "Empuje B": ["chest", "shoulders", "triceps"],
      "Tirón A": ["back", "biceps", "forearms"],
      "Tirón B": ["back", "biceps", "forearms"],
      "Piernas A": ["quads", "hamstrings", "glutes", "calves"],
      "Piernas B": ["quads", "hamstrings", "glutes", "calves"],
      "Tren Superior A": ["chest", "back", "shoulders", "triceps", "biceps"],
      "Tren Superior B": ["chest", "back", "shoulders", "triceps", "biceps"],
      "Tren Inferior A": ["quads", "hamstrings", "glutes", "calves", "abs"],
      "Tren Inferior B": ["quads", "hamstrings", "glutes", "calves", "abs"],
      "Cuerpo Completo A": ["chest", "back", "legs", "shoulders", "arms"],
      "Cuerpo Completo B": ["chest", "back", "legs", "shoulders", "arms"],
      "Cuerpo Completo C": ["chest", "back", "legs", "shoulders", "arms"],
      "Pecho": ["chest", "triceps"],
      "Espalda": ["back", "biceps"],
      "Hombros": ["shoulders", "traps"],
      "Piernas": ["quads", "hamstrings", "glutes", "calves"],
      "Brazos": ["biceps", "triceps", "forearms"],
      "Sentadilla": ["quads", "hamstrings", "glutes", "core"],
      "Press Banca": ["chest", "triceps", "shoulders"],
      "Peso Muerto": ["back", "hamstrings", "glutes", "traps"],
      "Press Hombro": ["shoulders", "triceps", "traps"],
      "HIIT Superior": ["chest", "back", "shoulders", "arms"],
      "Funcional Total": ["full_body", "core"],
      "HIIT Inferior": ["legs", "glutes", "core"],
      "Cardio y Core": ["core", "cardio"]
    }

    // Crear los días de la rutina
    let templateDays = [...template.days];

    // Si se proporcionaron días seleccionados, asignar los nombres de los días de la semana
    if (selectedDaysMap) {
      const selectedDaysArray = diasSemana.filter(dia => selectedDaysMap[dia]);

      // Asegurarse de que hay suficientes días seleccionados
      if (selectedDaysArray.length !== template.frequency) {
        throw new Error(`Se requieren exactamente ${template.frequency} días para esta plantilla`);
      }

      // Asignar los nombres de los días de la semana a los días de la plantilla
      templateDays = templateDays.map((dayName, index) => {
        const weekDay = selectedDaysArray[index % selectedDaysArray.length];
        return `${dayName} (${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)})`;
      });
    }

    const days = templateDays.map((dayName: string) => {
      // Obtener grupos musculares para este día
      // Extraer el nombre base del día (sin el día de la semana entre paréntesis)
      const baseDayName = dayName.includes("(") ? dayName.split("(")[0].trim() : dayName;
      const targetGroups = muscleGroupsByDay[baseDayName] || ["full_body"]

      // Filtrar ejercicios para estos grupos musculares
      const dayExercises = availableExercises.filter(ex =>
        targetGroups.some(group => ex.category === group || (ex.muscleGroup && ex.muscleGroup.includes(group)))
      )

      // Determinar número de ejercicios según el tipo de día
      let numExercises = 5 // Por defecto

      if (dayName.includes("Cuerpo Completo")) {
        numExercises = 6 // Más ejercicios para rutinas de cuerpo completo
      } else if (dayName.includes("HIIT") || dayName.includes("Funcional")) {
        numExercises = 8 // Más ejercicios para HIIT
      } else if (template.goal === "strength") {
        numExercises = 4 // Menos ejercicios para rutinas de fuerza
      }

      // Seleccionar ejercicios para este día
      const selectedExercises = dayExercises
        .sort(() => 0.5 - Math.random())
        .slice(0, numExercises)

      // Crear sets para cada ejercicio
      const exerciseSets = []

      for (const exercise of selectedExercises) {
        // Determinar número de series y repeticiones según el objetivo
        let sets = 3
        let reps = 10
        let rir = 2

        if (template.goal === "strength") {
          sets = 5
          reps = 5
          rir = 1
        } else if (template.goal === "hypertrophy") {
          sets = 4
          reps = 10
          rir = 2
        } else if (template.goal === "endurance") {
          sets = 3
          reps = 15
          rir = 3
        } else if (template.goal === "weight_loss") {
          sets = 3
          reps = 12
          rir = 1
        }

        // Crear las series
        for (let i = 0; i < sets; i++) {
          exerciseSets.push({
            id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            exerciseId: exercise.id,
            targetReps: reps,
            targetRir: rir,
            restTime: template.goal === "strength" ? 180 : template.goal === "hypertrophy" ? 90 : 60
          })
        }
      }

      // Crear el día
      return {
        id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: dayName,
        description: `Entrenamiento de ${dayName}`,
        exerciseSets,
        targetMuscleGroups: targetGroups,
        difficulty: template.level,
        estimatedDuration: exerciseSets.length * 3 // Estimación simple: 3 minutos por serie
      }
    })

    // Crear la rutina completa
    return {
      id: `routine-${Date.now()}`,
      userId,
      name: template.name,
      description: template.description,
      days,
      frequency: template.frequency,
      goal: template.goal,
      level: template.level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  }

  // Mapear los niveles a etiquetas legibles
  const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado"
  }

  // Mapear los objetivos a etiquetas legibles
  const goalLabels: Record<string, string> = {
    strength: "Fuerza",
    hypertrophy: "Hipertrofia",
    endurance: "Resistencia",
    weight_loss: "Pérdida de peso",
    general_fitness: "Fitness general"
  }

  // Renderizar el selector de días de la semana
  const renderDaySelector = () => {
    if (!selectedTemplate) return null;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold gradient-text">Selecciona los días de entrenamiento</h2>
          <Button3D variant="ghost" size="icon" onClick={() => setShowDaySelector(false)}>
            <X className="h-5 w-5" />
          </Button3D>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Plantilla: {template.name}</h3>
          </div>

          <p className="text-gray-500 mb-4">
            Selecciona exactamente <strong>{template.frequency} días</strong> de la semana para tu rutina de entrenamiento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diasSemana.map((dia) => (
              <div key={dia} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${dia}`}
                  checked={selectedDays[dia] || false}
                  onCheckedChange={(checked) => {
                    setSelectedDays(prev => ({
                      ...prev,
                      [dia]: !!checked
                    }))
                  }}
                />
                <Label htmlFor={`day-${dia}`} className="capitalize">{dia}</Label>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>Días seleccionados: {Object.values(selectedDays).filter(Boolean).length} de {template.frequency}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button3D variant="outline" onClick={() => setShowDaySelector(false)}>
            Volver
          </Button3D>
          <Button3D
            onClick={generateFromTemplate}
            disabled={isLoading || Object.values(selectedDays).filter(Boolean).length !== template.frequency}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Crear rutina
              </>
            )}
          </Button3D>
        </div>
      </div>
    );
  };

  // Renderizar la lista de plantillas
  const renderTemplateList = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold gradient-text">Plantillas predefinidas</h2>
          <Button3D variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button3D>
        </div>

        <p className="text-gray-500">
          Selecciona una plantilla predefinida para comenzar. Podrás personalizarla después.
        </p>

        {/* Plantillas españolas destacadas */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 mr-2 text-amber-500" />
            <h3 className="text-lg font-semibold">Plantillas Españolas Destacadas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hipertrofia Maxima Template */}
            <Card3D
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === HIPERTROFIA_MAXIMA_DETAILED.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(HIPERTROFIA_MAXIMA_DETAILED.id)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-90"></div>
                <div className="relative p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">{HIPERTROFIA_MAXIMA_DETAILED.name}</h3>
                        <Badge className="ml-2 bg-white/30 border-none">Nuevo</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className="bg-white/20 border-none">
                          {levelLabels[HIPERTROFIA_MAXIMA_DETAILED.level]}
                        </Badge>
                        <Badge className="bg-white/20 border-none">
                          Hipertrofia
                        </Badge>
                        <Badge className="bg-white/20 border-none">
                          {HIPERTROFIA_MAXIMA_DETAILED.daysPerWeek} días/semana
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80 mt-2">
                        {HIPERTROFIA_MAXIMA_DETAILED.description}
                      </p>
                    </div>

                    {selectedTemplate === HIPERTROFIA_MAXIMA_DETAILED.id && (
                      <div className="bg-white rounded-full p-1">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Características:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white border-none">Periodización ondulante</Badge>
                      <Badge className="bg-white/10 text-white border-none">Técnicas avanzadas</Badge>
                      <Badge className="bg-white/10 text-white border-none">Deload cada 4 semanas</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>

            {/* Pure Bodybuilding Template */}
            <Card3D
              className={`overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === PURE_BODYBUILDING_HYPERTROPHY_DETAILED.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(PURE_BODYBUILDING_HYPERTROPHY_DETAILED.id)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-600 opacity-90"></div>
                <div className="relative p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">{PURE_BODYBUILDING_HYPERTROPHY_DETAILED.name}</h3>
                        <Badge className="ml-2 bg-white/30 border-none">Nuevo</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className="bg-white/20 border-none">
                          {levelLabels[PURE_BODYBUILDING_HYPERTROPHY_DETAILED.level]}
                        </Badge>
                        <Badge className="bg-white/20 border-none">
                          Hipertrofia
                        </Badge>
                        <Badge className="bg-white/20 border-none">
                          {PURE_BODYBUILDING_HYPERTROPHY_DETAILED.daysPerWeek} días/semana
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80 mt-2">
                        {PURE_BODYBUILDING_HYPERTROPHY_DETAILED.description}
                      </p>
                    </div>

                    {selectedTemplate === PURE_BODYBUILDING_HYPERTROPHY_DETAILED.id && (
                      <div className="bg-white rounded-full p-1">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Características:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white border-none">PPL 6 días</Badge>
                      <Badge className="bg-white/10 text-white border-none">Periodización por bloques</Badge>
                      <Badge className="bg-white/10 text-white border-none">Deload cada 4 semanas</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          </div>
        </div>

        {/* Otras plantillas */}
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Otras Plantillas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <Card3D
                key={template.id}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${template.color} opacity-90`}></div>
                  <div className="relative p-4 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge className="bg-white/20 border-none">
                            {levelLabels[template.level]}
                          </Badge>
                          <Badge className="bg-white/20 border-none">
                            {goalLabels[template.goal]}
                          </Badge>
                          <Badge className="bg-white/20 border-none">
                            {template.frequency} días/semana
                          </Badge>
                          {template.includesDeload && (
                            <Badge className="bg-yellow-300/30 text-yellow-100 border-none">
                              Deload cada {template.deloadFrequency} semanas
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/80 mt-2">
                          {template.description}
                        </p>
                        {template.source && (
                          <p className="text-xs text-white/60 mt-1">
                            Fuente: {template.source}
                          </p>
                        )}
                      </div>

                      {selectedTemplate === template.id && (
                        <div className="bg-white rounded-full p-1">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Días de entrenamiento:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.days.map((day, index) => (
                          <Badge key={index} className="bg-white/20 border-none">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button3D variant="outline" onClick={onCancel}>
            Cancelar
          </Button3D>
          <Button3D
            onClick={() => selectedTemplate && showDaysSelector(selectedTemplate)}
            disabled={!selectedTemplate || isLoading}
          >
            {isLoading ? (
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
    );
  };

  // Renderizar el selector de plantillas avanzadas
  const renderAdvancedTemplates = () => {
    return (
      <AdvancedTemplateSelector
        userId={userId}
        availableExercises={availableExercises}
        onSelectTemplate={onSelectTemplate}
        onCancel={() => setShowAdvancedTemplates(false)}
      />
    )
  }

  // Renderizar el contenido principal
  const renderMainContent = () => {
    if (showAdvancedTemplates) {
      return renderAdvancedTemplates()
    }

    if (showDaySelector) {
      return renderDaySelector()
    }

    return (
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic">Plantillas Básicas</TabsTrigger>
          <TabsTrigger value="advanced">Plantillas Avanzadas</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {renderTemplateList()}
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold gradient-text">Plantillas Avanzadas</h2>
              <Button3D variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button3D>
            </div>

            <Card3D className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
              <Card3DContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Sparkles className="h-10 w-10 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Rutinas Avanzadas con Periodización</h3>
                    <p className="mb-4">
                      Basadas en principios científicos de hipertrofia muscular, periodización y técnicas avanzadas.
                      Incluyen descargas programadas, variación de volumen e intensidad, y ejercicios alternativos.
                    </p>
                    <Button3D
                      variant="secondary"
                      onClick={() => setShowAdvancedTemplates(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Explorar Plantillas Avanzadas
                    </Button3D>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates
                .filter(template => template.level === "advanced")
                .slice(0, 4)
                .map(template => (
                  <Card3D key={template.id}>
                    <Card3DHeader>
                      <Card3DTitle>{template.name}</Card3DTitle>
                    </Card3DHeader>
                    <Card3DContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{template.level}</Badge>
                        <Badge>{goalLabels[template.goal]}</Badge>
                        <Badge>{template.frequency} días/semana</Badge>
                        {template.includesDeload && (
                          <Badge variant="outline">Deload cada {template.deloadFrequency} semanas</Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Fuente: {template.source}</p>
                      </div>
                      <Button3D
                        className="w-full mt-4"
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        Ver Detalles
                      </Button3D>
                    </Card3DContent>
                  </Card3D>
                ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Características Avanzadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card3D>
                  <Card3DContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <RefreshCw className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium mb-1">Periodización</h4>
                      <p className="text-sm text-muted-foreground">
                        Variación planificada de volumen e intensidad para maximizar resultados y prevenir estancamientos
                      </p>
                    </div>
                  </Card3DContent>
                </Card3D>

                <Card3D>
                  <Card3DContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium mb-1">Técnicas Avanzadas</h4>
                      <p className="text-sm text-muted-foreground">
                        Drop sets, rest-pause, series mecánicas y otras técnicas para romper barreras
                      </p>
                    </div>
                  </Card3DContent>
                </Card3D>

                <Card3D>
                  <Card3DContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium mb-1">Visualización de Progreso</h4>
                      <p className="text-sm text-muted-foreground">
                        Seguimiento detallado de tu progreso con gráficos de volumen, intensidad y fatiga
                      </p>
                    </div>
                  </Card3DContent>
                </Card3D>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="space-y-6">
      {renderMainContent()}
    </div>
  )
}
