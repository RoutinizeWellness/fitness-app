"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dumbbell, Plus, Trash2, Edit, Copy, Play, Save, Info, Shuffle } from "lucide-react"
import ExerciseAlternatives from "./exercise-alternatives"
import { RoutineExerciseItem } from "./training/routine-exercise-item"
import {
  getWorkoutRoutines,
  createWorkoutRoutine,
  updateWorkoutRoutine,
  deleteWorkoutRoutine,
  recommendWorkoutRoutines,
  type WorkoutRoutine,
  type WorkoutRoutineExercise
} from "@/lib/workout-routines"
import { getExercises, type Exercise } from "@/lib/supabase"

interface RutinasPersonalizadasProps {
  userId: string
  onRoutineSelected?: (routine: WorkoutRoutine) => void
}

export default function RutinasPersonalizadas({ userId, onRoutineSelected }: RutinasPersonalizadasProps) {
  const { toast } = useToast()

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])
  const [templateRoutines, setTemplateRoutines] = useState<WorkoutRoutine[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("mis-rutinas")

  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "intermediate" as "beginner" | "intermediate" | "advanced",
    exercises: [] as WorkoutRoutineExercise[]
  })

  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseFormData, setExerciseFormData] = useState({
    sets: 3,
    reps: "10",
    rest: 60,
    weight: "",
    notes: ""
  })

  // Cargar rutinas y ejercicios
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Cargar rutinas del usuario
        const { data: userRoutines, error: routinesError } = await getWorkoutRoutines(userId, {
          includeExerciseDetails: true
        })

        if (routinesError) {
          throw routinesError
        }

        if (userRoutines) {
          setRoutines(userRoutines.filter(r => !r.is_template))
        }

        // Cargar rutinas de plantilla
        const { data: templates, error: templatesError } = await recommendWorkoutRoutines(userId, {
          includeExerciseDetails: true
        })

        if (templatesError) {
          console.error("Error al cargar plantillas:", templatesError)
        } else if (templates) {
          setTemplateRoutines(templates)
        }

        // Cargar ejercicios
        const { data: exercisesData, error: exercisesError } = await getExercises()

        if (exercisesError) {
          console.error("Error al cargar ejercicios:", exercisesError)
        } else if (exercisesData) {
          setExercises(exercisesData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutinas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, toast])

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      level: "intermediate",
      exercises: []
    })
    setSelectedRoutine(null)
  }

  // Iniciar creación de rutina
  const handleCreateRoutine = () => {
    resetForm()
    setIsCreating(true)
    setIsEditing(false)
  }

  // Iniciar edición de rutina
  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setFormData({
      name: routine.name,
      description: routine.description || "",
      level: routine.level,
      exercises: routine.exercises
    })
    setSelectedRoutine(routine)
    setIsEditing(true)
    setIsCreating(false)
  }

  // Guardar rutina (crear o actualizar)
  const handleSaveRoutine = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la rutina es obligatorio",
          variant: "destructive",
        })
        return
      }

      if (formData.exercises.length === 0) {
        toast({
          title: "Error",
          description: "Debes añadir al menos un ejercicio a la rutina",
          variant: "destructive",
        })
        return
      }

      if (isEditing && selectedRoutine) {
        // Actualizar rutina existente
        const { data, error } = await updateWorkoutRoutine(selectedRoutine.id, {
          name: formData.name,
          description: formData.description,
          level: formData.level,
          exercises: formData.exercises
        })

        if (error) {
          throw error
        }

        if (data) {
          // Actualizar lista de rutinas
          setRoutines(routines.map(r => r.id === data.id ? data : r))

          toast({
            title: "Rutina actualizada",
            description: "La rutina ha sido actualizada correctamente",
          })
        }
      } else {
        if (!userId) {
          toast({
            title: "Error",
            description: "Debes iniciar sesión para crear una rutina",
            variant: "destructive",
          })
          return
        }

        // Crear nueva rutina
        const { data, error } = await createWorkoutRoutine({
          user_id: userId,
          name: formData.name,
          description: formData.description,
          level: formData.level,
          is_template: false,
          exercises: formData.exercises
        })

        if (error) {
          throw error
        }

        if (data) {
          // Añadir a la lista de rutinas
          setRoutines([...routines, data])

          toast({
            title: "Rutina creada",
            description: "La rutina ha sido creada correctamente",
          })
        }
      }

      // Resetear formulario y cerrar modo edición/creación
      resetForm()
      setIsEditing(false)
      setIsCreating(false)
    } catch (error) {
      console.error("Error al guardar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la rutina",
        variant: "destructive",
      })
    }
  }

  // Eliminar rutina
  const handleDeleteRoutine = async (id: string) => {
    try {
      const { error } = await deleteWorkoutRoutine(id)

      if (error) {
        throw error
      }

      // Actualizar lista de rutinas
      setRoutines(routines.filter(r => r.id !== id))

      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente",
      })

      // Si estábamos editando esta rutina, salir del modo edición
      if (isEditing && selectedRoutine && selectedRoutine.id === id) {
        resetForm()
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina",
        variant: "destructive",
      })
    }
  }

  // Duplicar rutina de plantilla
  const handleDuplicateRoutine = async (template: WorkoutRoutine) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para duplicar una rutina",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await createWorkoutRoutine({
        user_id: userId,
        name: `Copia de ${template.name}`,
        description: template.description,
        level: template.level,
        is_template: false,
        exercises: template.exercises
      })

      if (error) {
        throw error
      }

      if (data) {
        // Añadir a la lista de rutinas
        setRoutines([...routines, data])

        toast({
          title: "Rutina duplicada",
          description: "La plantilla ha sido copiada a tus rutinas",
        })

        // Cambiar a la pestaña de mis rutinas
        setActiveTab("mis-rutinas")
      }
    } catch (error) {
      console.error("Error al duplicar rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo duplicar la rutina",
        variant: "destructive",
      })
    }
  }

  // Añadir ejercicio a la rutina
  const handleAddExercise = () => {
    if (!selectedExercise) return

    const newExercise: WorkoutRoutineExercise = {
      exercise_id: selectedExercise.id,
      sets: exerciseFormData.sets,
      reps: exerciseFormData.reps,
      rest: exerciseFormData.rest,
      weight: exerciseFormData.weight || undefined,
      notes: exerciseFormData.notes || undefined,
      exercise: selectedExercise
    }

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise]
    })

    // Resetear formulario de ejercicio
    setExerciseFormData({
      sets: 3,
      reps: "10",
      rest: 60,
      weight: "",
      notes: ""
    })
    setSelectedExercise(null)
    setExerciseDialogOpen(false)

    toast({
      title: "Ejercicio añadido",
      description: `${selectedExercise.name} ha sido añadido a la rutina`,
    })
  }

  // Eliminar ejercicio de la rutina
  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...formData.exercises]
    updatedExercises.splice(index, 1)

    setFormData({
      ...formData,
      exercises: updatedExercises
    })
  }

  // Reemplazar ejercicio por una alternativa
  const handleReplaceExercise = (index: number, alternativeExercise: Exercise) => {
    const updatedExercises = [...formData.exercises]
    const currentExercise = updatedExercises[index]

    // Mantener la configuración (series, repeticiones, etc.) pero cambiar el ejercicio
    updatedExercises[index] = {
      ...currentExercise,
      exercise_id: alternativeExercise.id,
      exercise: alternativeExercise
    }

    setFormData({
      ...formData,
      exercises: updatedExercises
    })

    toast({
      title: "Ejercicio reemplazado",
      description: `${alternativeExercise.name} ha sido añadido como alternativa`,
    })
  }

  // Actualizar un ejercicio existente
  const handleUpdateExercise = (index: number, updatedExercise: WorkoutRoutineExercise) => {
    const updatedExercises = [...formData.exercises]
    updatedExercises[index] = updatedExercise

    setFormData({
      ...formData,
      exercises: updatedExercises
    })

    toast({
      title: "Ejercicio actualizado",
      description: "Los cambios han sido guardados",
    })
  }

  // Iniciar entrenamiento con una rutina
  const handleStartRoutine = (routine: WorkoutRoutine) => {
    if (onRoutineSelected) {
      onRoutineSelected(routine)
    } else {
      toast({
        title: "Función no disponible",
        description: "La función para iniciar entrenamiento no está implementada",
      })
    }
  }

  // Renderizar nivel de dificultad
  const renderDifficultyBadge = (level: string) => {
    switch (level) {
      case "beginner":
        return <Badge className="bg-green-500">Principiante</Badge>
      case "intermediate":
        return <Badge className="bg-blue-500">Intermedio</Badge>
      case "advanced":
        return <Badge className="bg-red-500">Avanzado</Badge>
      default:
        return <Badge>{level}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="mis-rutinas">Mis Rutinas</TabsTrigger>
            <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          </TabsList>

          <Button onClick={handleCreateRoutine} disabled={isCreating || isEditing}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Rutina
          </Button>
        </div>

        <TabsContent value="mis-rutinas" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Dumbbell className="h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Cargando rutinas...</p>
            </div>
          ) : isCreating || isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Editar Rutina" : "Nueva Rutina"}</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Modifica los detalles de tu rutina personalizada"
                    : "Crea una nueva rutina personalizada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la rutina</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Rutina de fuerza para piernas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción (opcional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe brevemente esta rutina"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Nivel de dificultad</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                          setFormData({ ...formData, level: value })
                        }
                      >
                        <SelectTrigger id="level">
                          <SelectValue placeholder="Selecciona el nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Ejercicios</Label>
                      <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Ejercicio
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Añadir Ejercicio</DialogTitle>
                            <DialogDescription>
                              Selecciona un ejercicio y configura sus detalles
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Seleccionar Ejercicio</Label>
                              <Select
                                onValueChange={(value) => {
                                  const exercise = exercises.find(e => e.id === value) || null
                                  setSelectedExercise(exercise)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un ejercicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercises.map((exercise) => (
                                    <SelectItem key={exercise.id} value={exercise.id}>
                                      {exercise.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedExercise && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="sets">Series</Label>
                                    <Input
                                      id="sets"
                                      type="number"
                                      min={1}
                                      value={exerciseFormData.sets}
                                      onChange={(e) => setExerciseFormData({
                                        ...exerciseFormData,
                                        sets: parseInt(e.target.value) || 1
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="reps">Repeticiones</Label>
                                    <Input
                                      id="reps"
                                      value={exerciseFormData.reps}
                                      onChange={(e) => setExerciseFormData({
                                        ...exerciseFormData,
                                        reps: e.target.value
                                      })}
                                      placeholder="Ej: 10 o 8-12"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="rest">Descanso (segundos)</Label>
                                    <Input
                                      id="rest"
                                      type="number"
                                      min={0}
                                      value={exerciseFormData.rest}
                                      onChange={(e) => setExerciseFormData({
                                        ...exerciseFormData,
                                        rest: parseInt(e.target.value) || 0
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="weight">Peso (opcional)</Label>
                                    <Input
                                      id="weight"
                                      value={exerciseFormData.weight}
                                      onChange={(e) => setExerciseFormData({
                                        ...exerciseFormData,
                                        weight: e.target.value
                                      })}
                                      placeholder="Ej: 10kg o Corporal"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="notes">Notas (opcional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={exerciseFormData.notes}
                                    onChange={(e) => setExerciseFormData({
                                      ...exerciseFormData,
                                      notes: e.target.value
                                    })}
                                    placeholder="Instrucciones o notas adicionales"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleAddExercise} disabled={!selectedExercise}>
                              Añadir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {formData.exercises.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <p className="text-gray-500">No hay ejercicios en esta rutina</p>
                        <p className="text-sm text-gray-400">Haz clic en "Añadir Ejercicio" para comenzar</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] border rounded-lg p-4">
                        <div className="space-y-3">
                          {formData.exercises.map((exercise, index) => (
                            <RoutineExerciseItem
                              key={index}
                              exercise={exercise}
                              index={index}
                              onUpdate={handleUpdateExercise}
                              onDelete={handleRemoveExercise}
                              availableExercises={exercises}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsCreating(false)
                    setIsEditing(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveRoutine}>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Actualizar Rutina" : "Guardar Rutina"}
                </Button>
              </CardFooter>
            </Card>
          ) : routines.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No tienes rutinas personalizadas</h3>
                <p className="text-gray-500 mb-4">
                  Crea tu primera rutina o duplica una de nuestras plantillas
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleCreateRoutine}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Rutina
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("plantillas")}>
                    Ver Plantillas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routines.map((routine) => (
                <Card key={routine.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{routine.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {renderDifficultyBadge(routine.level)}
                          <CardDescription>
                            {routine.exercises.length} ejercicios
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRoutine(routine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRoutine(routine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {routine.description && (
                      <p className="text-sm text-gray-500 mb-4">{routine.description}</p>
                    )}
                    <div className="space-y-2">
                      {routine.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{exercise.exercise?.name || `Ejercicio ${index + 1}`}</span>
                          <span className="text-gray-500">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                      {routine.exercises.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{routine.exercises.length - 3} ejercicios más
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleStartRoutine(routine)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Entrenamiento
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Dumbbell className="h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Cargando plantillas...</p>
            </div>
          ) : templateRoutines.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay plantillas disponibles</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron plantillas para tu nivel de experiencia
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateRoutines.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {renderDifficultyBadge(template.level)}
                          <CardDescription>
                            {template.exercises.length} ejercicios
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateRoutine(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    )}
                    <div className="space-y-2">
                      {template.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{exercise.exercise?.name || `Ejercicio ${index + 1}`}</span>
                          <span className="text-gray-500">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                      {template.exercises.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{template.exercises.length - 3} ejercicios más
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleDuplicateRoutine(template)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar a Mis Rutinas
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
