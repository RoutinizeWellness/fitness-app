"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, ChevronDown, ChevronUp,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw, Edit, Trash,
  RotateCcw, Play
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { ExerciseSelector } from "@/components/training/exercise-selector"
import { ExerciseEditor } from "@/components/training/exercise-editor"
import { toast } from "@/components/ui/use-toast"

interface DayConfiguratorProps {
  day: WorkoutDay
  availableExercises: Exercise[]
  onSave: (updatedDay: WorkoutDay) => void
  onCancel: () => void
}

export function DayConfigurator({
  day,
  availableExercises,
  onSave,
  onCancel
}: DayConfiguratorProps) {
  // Estado para los datos del día
  const [formData, setFormData] = useState<WorkoutDay>({...day})
  const [isSelectingExercises, setIsSelectingExercises] = useState(false)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("manual")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)

  // Plantillas predefinidas por grupo muscular
  const templates = [
    {
      id: "chest_focused",
      name: "Entrenamiento de Pecho",
      description: "Enfocado en el desarrollo del pecho con ejercicios compuestos y de aislamiento",
      targetGroups: ["chest", "triceps", "shoulders"],
      difficulty: "intermediate"
    },
    {
      id: "back_focused",
      name: "Entrenamiento de Espalda",
      description: "Desarrollo completo de la espalda con variedad de ejercicios",
      targetGroups: ["back", "biceps", "shoulders"],
      difficulty: "intermediate"
    },
    {
      id: "leg_day",
      name: "Día de Piernas",
      description: "Entrenamiento completo de tren inferior",
      targetGroups: ["quads", "hamstrings", "glutes", "calves"],
      difficulty: "intermediate"
    },
    {
      id: "push_day",
      name: "Día de Empuje (Push)",
      description: "Entrenamiento de músculos implicados en movimientos de empuje",
      targetGroups: ["chest", "shoulders", "triceps"],
      difficulty: "intermediate"
    },
    {
      id: "pull_day",
      name: "Día de Tirón (Pull)",
      description: "Entrenamiento de músculos implicados en movimientos de tirón",
      targetGroups: ["back", "biceps", "forearms"],
      difficulty: "intermediate"
    },
    {
      id: "full_body",
      name: "Cuerpo Completo",
      description: "Entrenamiento de cuerpo completo con ejercicios compuestos",
      targetGroups: ["chest", "back", "legs", "shoulders", "arms"],
      difficulty: "intermediate"
    },
    {
      id: "upper_body",
      name: "Tren Superior",
      description: "Entrenamiento completo de la parte superior del cuerpo",
      targetGroups: ["chest", "back", "shoulders", "arms"],
      difficulty: "intermediate"
    },
    {
      id: "lower_body",
      name: "Tren Inferior",
      description: "Entrenamiento completo de la parte inferior del cuerpo",
      targetGroups: ["quads", "hamstrings", "glutes", "calves"],
      difficulty: "intermediate"
    }
  ]

  // Manejar cambios en los campos del formulario
  const handleChange = (field: keyof WorkoutDay, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en un set de ejercicio
  const handleSetChange = (setId: string, field: keyof ExerciseSet, value: any) => {
    setFormData(prev => ({
      ...prev,
      exerciseSets: prev.exerciseSets.map(set =>
        set.id === setId ? { ...set, [field]: value } : set
      )
    }))
  }

  // Añadir un nuevo set para un ejercicio
  const addSetForExercise = (exerciseId: string) => {
    // Encontrar el último set de este ejercicio para copiar sus valores
    const exerciseSets = formData.exerciseSets.filter(set => set.exerciseId === exerciseId)
    const lastSet = exerciseSets[exerciseSets.length - 1]

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      exerciseId,
      targetReps: lastSet?.targetReps || 10,
      targetRir: lastSet?.targetRir || 2,
      restTime: lastSet?.restTime || 90
    }

    setFormData(prev => ({
      ...prev,
      exerciseSets: [...prev.exerciseSets, newSet]
    }))
  }

  // Eliminar un set
  const removeSet = (setId: string) => {
    setFormData(prev => ({
      ...prev,
      exerciseSets: prev.exerciseSets.filter(set => set.id !== setId)
    }))
  }

  // Eliminar todos los sets de un ejercicio
  const removeExercise = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      exerciseSets: prev.exerciseSets.filter(set => set.exerciseId !== exerciseId)
    }))
  }

  // Reemplazar un ejercicio
  const replaceExercise = (oldExerciseId: string, newExerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      exerciseSets: prev.exerciseSets.map(set =>
        set.exerciseId === oldExerciseId ? { ...set, exerciseId: newExerciseId } : set
      )
    }))
  }

  // Actualizar los sets de un ejercicio específico
  const updateExerciseSets = (exerciseId: string, updatedSets: ExerciseSet[]) => {
    setFormData(prev => {
      // Filtrar los sets que no pertenecen al ejercicio que estamos editando
      const otherSets = prev.exerciseSets.filter(set => set.exerciseId !== exerciseId)

      // Combinar con los sets actualizados
      return {
        ...prev,
        exerciseSets: [...otherSets, ...updatedSets]
      }
    })

    setEditingExerciseId(null)

    toast({
      title: "Ejercicio actualizado",
      description: "Se han guardado los cambios en el ejercicio",
      variant: "default"
    })
  }

  // Manejar selección de ejercicios
  const handleExerciseSelection = (selectedIds: string[]) => {
    // Crear sets para los nuevos ejercicios
    const currentExerciseIds = Array.from(new Set(formData.exerciseSets.map(set => set.exerciseId)))
    const newExerciseIds = selectedIds.filter(id => !currentExerciseIds.includes(id))

    // Crear sets para los nuevos ejercicios
    const newSets: ExerciseSet[] = []

    newExerciseIds.forEach(exerciseId => {
      // Por defecto, crear 3 sets para cada nuevo ejercicio
      for (let i = 0; i < 3; i++) {
        newSets.push({
          id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
          exerciseId,
          targetReps: 10,
          targetRir: 2,
          restTime: 90
        })
      }
    })

    // Eliminar sets de ejercicios que ya no están seleccionados
    const setsToKeep = formData.exerciseSets.filter(set => selectedIds.includes(set.exerciseId))

    setFormData(prev => ({
      ...prev,
      exerciseSets: [...setsToKeep, ...newSets]
    }))

    setIsSelectingExercises(false)
  }

  // Aplicar plantilla
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    // Actualizar nombre y descripción
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      targetMuscleGroups: template.targetGroups,
      difficulty: template.difficulty as "beginner" | "intermediate" | "advanced"
    }))

    // Filtrar ejercicios por grupos musculares de la plantilla
    const relevantExercises = availableExercises.filter(ex =>
      template.targetGroups.some(group =>
        ex.category === group ||
        (ex.muscleGroup && ex.muscleGroup.some(m => m === group))
      )
    )

    // Seleccionar aleatoriamente 4-6 ejercicios relevantes
    const numExercises = Math.floor(Math.random() * 3) + 4 // 4-6 ejercicios
    const selectedExercises = relevantExercises
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numExercises, relevantExercises.length))

    // Crear sets para los ejercicios seleccionados
    const newSets: ExerciseSet[] = []

    selectedExercises.forEach(exercise => {
      // Determinar número de series según el tipo de ejercicio
      const isCompound = exercise.isCompound ||
        ["squat", "deadlift", "bench", "row", "press"].some(term =>
          exercise.name.toLowerCase().includes(term)
        )

      const numSets = isCompound ? 4 : 3

      for (let i = 0; i < numSets; i++) {
        newSets.push({
          id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
          exerciseId: exercise.id,
          targetReps: isCompound ? 8 : 12,
          targetRir: 2,
          restTime: isCompound ? 120 : 90
        })
      }
    })

    setFormData(prev => ({
      ...prev,
      exerciseSets: newSets
    }))

    toast({
      title: "Plantilla aplicada",
      description: `Se ha aplicado la plantilla "${template.name}"`,
      variant: "default"
    })
  }

  // Guardar cambios
  const handleSave = () => {
    // Validar que haya al menos un ejercicio
    if (formData.exerciseSets.length === 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos un ejercicio",
        variant: "destructive"
      })
      return
    }

    // Calcular duración estimada (3 minutos por set en promedio)
    const estimatedDuration = formData.exerciseSets.length * 3

    // Actualizar grupos musculares objetivo basados en los ejercicios seleccionados
    const exerciseIds = Array.from(new Set(formData.exerciseSets.map(set => set.exerciseId)))
    const selectedExercises = availableExercises.filter(ex => exerciseIds.includes(ex.id))

    const targetGroups = Array.from(new Set(
      selectedExercises.flatMap(ex =>
        ex.muscleGroup || [ex.category]
      )
    ))

    const updatedDay: WorkoutDay = {
      ...formData,
      targetMuscleGroups: targetGroups,
      estimatedDuration
    }

    onSave(updatedDay)
  }

  // Obtener ejercicios únicos del día actual
  const uniqueExercises = Array.from(
    new Set(formData.exerciseSets.map(set => set.exerciseId))
  ).map(id => {
    const exercise = availableExercises.find(ex => ex.id === id)
    return {
      id,
      exercise,
      sets: formData.exerciseSets.filter(set => set.exerciseId === id)
    }
  })

  // Renderizar la configuración manual
  const renderManualConfig = () => (
    <div className="space-y-6">
      <Card3D className="p-6">
        <Card3DHeader>
          <Card3DTitle>Información del día</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="day-name">Nombre del día</Label>
            <Input
              id="day-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Día de Pecho, Pull, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day-description">Descripción</Label>
            <Textarea
              id="day-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe este día de entrenamiento"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day-difficulty">Dificultad</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => handleChange('difficulty', value)}
            >
              <SelectTrigger id="day-difficulty">
                <SelectValue placeholder="Seleccionar dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card3DContent>
      </Card3D>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ejercicios</h3>
        <Button3D onClick={() => setIsSelectingExercises(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir ejercicios
        </Button3D>
      </div>

      {uniqueExercises.length === 0 ? (
        <Card3D className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <Dumbbell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay ejercicios</h3>
            <p className="text-gray-500 mb-4">Añade ejercicios a este día de entrenamiento</p>
            <Button3D onClick={() => setIsSelectingExercises(true)}>
              Añadir ejercicios
            </Button3D>
          </div>
        </Card3D>
      ) : (
        <div className="space-y-4">
          {uniqueExercises.map(({ id, exercise, sets }) => {
            if (!exercise) return null

            return (
              <Card3D key={id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button3D variant="ghost" size="icon" className="h-6 w-6 ml-1">
                              <Play className="h-3 w-3" />
                            </Button3D>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{exercise.name}</DialogTitle>
                              <DialogDescription>
                                Demostración del ejercicio
                              </DialogDescription>
                            </DialogHeader>
                            <div className="aspect-video overflow-hidden rounded-lg">
                              {exercise.videoUrl ? (
                                <img
                                  src={exercise.videoUrl}
                                  alt={`Demostración de ${exercise.name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <Dumbbell className="h-12 w-12 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button3D>Cerrar</Button3D>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {exercise.category}
                        </Badge>
                        {exercise.equipment && exercise.equipment.map(eq => (
                          <Badge key={eq} variant="secondary" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button3D variant="outline" size="sm" className="mr-1">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Cambiar
                          </Button3D>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cambiar ejercicio</DialogTitle>
                            <DialogDescription>
                              Selecciona un ejercicio alternativo para reemplazar {exercise.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto pr-4">
                            <div className="space-y-3">
                              {availableExercises
                                .filter(ex =>
                                  ex.id !== id &&
                                  (ex.category === exercise.category ||
                                   (ex.muscleGroup && exercise.muscleGroup &&
                                    ex.muscleGroup.some(m => exercise.muscleGroup?.includes(m))))
                                )
                                .map(ex => (
                                  <Card3D key={ex.id} className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="font-medium">{ex.name}</h4>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {ex.category}
                                          </Badge>
                                          {ex.equipment && ex.equipment.map(eq => (
                                            <Badge key={eq} variant="secondary" className="text-xs">
                                              {eq}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <DialogClose asChild>
                                        <Button3D
                                          size="sm"
                                          onClick={() => replaceExercise(id, ex.id)}
                                        >
                                          Seleccionar
                                        </Button3D>
                                      </DialogClose>
                                    </div>
                                  </Card3D>
                                ))
                              }
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button3D
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeExercise(id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button3D>
                      <Button3D
                        variant="outline"
                        size="sm"
                        className="mr-1"
                        onClick={() => setEditingExerciseId(id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button3D>
                      <Button3D
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedExercise(expandedExercise === id ? null : id)}
                      >
                        {expandedExercise === id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button3D>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedExercise === id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t">
                          <div className="space-y-3">
                            {sets.map((set, index) => (
                              <div key={set.id} className="flex items-center space-x-2">
                                <div className="w-10 text-center">
                                  <span className="text-sm font-medium">#{index + 1}</span>
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                  <div>
                                    <Label htmlFor={`reps-${set.id}`} className="text-xs">Reps</Label>
                                    <Input
                                      id={`reps-${set.id}`}
                                      type="number"
                                      value={set.targetReps}
                                      onChange={(e) => handleSetChange(set.id, 'targetReps', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`rir-${set.id}`} className="text-xs">RIR</Label>
                                    <Input
                                      id={`rir-${set.id}`}
                                      type="number"
                                      value={set.targetRir}
                                      onChange={(e) => handleSetChange(set.id, 'targetRir', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`rest-${set.id}`} className="text-xs">Descanso (s)</Label>
                                    <Input
                                      id={`rest-${set.id}`}
                                      type="number"
                                      value={set.restTime}
                                      onChange={(e) => handleSetChange(set.id, 'restTime', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                </div>

                                <div className="ml-2 mr-2">
                                  <Label htmlFor={`alt-${set.id}`} className="text-xs">Alternativa</Label>
                                  <Select
                                    value={set.alternativeExerciseId || ""}
                                    onValueChange={(value) => handleSetChange(set.id, 'alternativeExerciseId', value || null)}
                                  >
                                    <SelectTrigger id={`alt-${set.id}`} className="h-8">
                                      <SelectValue placeholder="Ninguna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">Ninguna</SelectItem>
                                      {availableExercises
                                        .filter(ex => ex.id !== set.exerciseId)
                                        .map(ex => (
                                          <SelectItem key={ex.id} value={ex.id}>
                                            {ex.name}
                                          </SelectItem>
                                        ))
                                      }
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button3D
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => removeSet(set.id)}
                                  disabled={sets.length <= 1}
                                >
                                  <X className="h-4 w-4" />
                                </Button3D>
                              </div>
                            ))}
                          </div>

                          <Button3D
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => addSetForExercise(id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Añadir serie
                          </Button3D>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card3D>
            )
          })}
        </div>
      )}
    </div>
  )

  // Renderizar la configuración por plantilla
  const renderTemplateConfig = () => (
    <div className="space-y-6">
      <Card3D className="p-6">
        <Card3DHeader>
          <Card3DTitle>Seleccionar plantilla</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="space-y-4 pt-4">
          <p className="text-sm text-gray-500">
            Selecciona una plantilla predefinida para este día de entrenamiento.
            Podrás personalizar los ejercicios después.
          </p>

          <div className="space-y-3">
            {templates.map(template => (
              <Card3D
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-primary border-2' : ''}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.targetGroups.map(group => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {template.difficulty === 'beginner' ? 'Principiante' :
                         template.difficulty === 'intermediate' ? 'Intermedio' :
                         'Avanzado'}
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card3D>
            ))}
          </div>
        </Card3DContent>
      </Card3D>

      <div className="flex justify-end">
        <Button3D
          onClick={() => {
            if (selectedTemplate) {
              applyTemplate(selectedTemplate)
              setActiveTab("manual")
            } else {
              toast({
                title: "Error",
                description: "Selecciona una plantilla primero",
                variant: "destructive"
              })
            }
          }}
          disabled={!selectedTemplate}
        >
          Aplicar plantilla
        </Button3D>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Configurar día de entrenamiento</h2>
        <Button3D variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button3D>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="template">Plantillas</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          {renderTemplateConfig()}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {renderManualConfig()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </Button3D>
      </div>

      {/* Modal de selección de ejercicios */}
      {isSelectingExercises && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
          <ExerciseSelector
            availableExercises={availableExercises}
            selectedExercises={Array.from(new Set(formData.exerciseSets.map(set => set.exerciseId)))}
            onSelect={handleExerciseSelection}
            onCancel={() => setIsSelectingExercises(false)}
            title="Seleccionar ejercicios"
            description="Elige los ejercicios para este día de entrenamiento"
          />
        </div>
      )}

      {/* Modal de edición de ejercicio específico */}
      {editingExerciseId && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
          <ExerciseEditor
            exerciseId={editingExerciseId}
            sets={formData.exerciseSets.filter(set => set.exerciseId === editingExerciseId)}
            exercise={availableExercises.find(ex => ex.id === editingExerciseId)}
            availableExercises={availableExercises}
            onSave={(updatedSets) => updateExerciseSets(editingExerciseId, updatedSets)}
            onCancel={() => setEditingExerciseId(null)}
            onReplaceExercise={replaceExercise}
          />
        </div>
      )}
    </div>
  )
}
