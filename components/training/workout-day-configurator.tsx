"use client"

import { useState } from "react"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Dumbbell, 
  Clock, 
  Zap, 
  Target, 
  Plus, 
  Minus, 
  Save, 
  Trash, 
  Edit, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Search,
  X
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Exercise, WorkoutDay, ExerciseSet } from "@/lib/types/training"
import { ExerciseWithAlternatives } from "@/lib/types/training-program"
import { v4 as uuidv4 } from "uuid"

interface WorkoutDayConfiguratorProps {
  workoutDay: WorkoutDay
  onUpdate: (workoutDay: WorkoutDay) => void
  onDelete: () => void
  availableExercises: Exercise[]
  isDeload?: boolean
}

export function WorkoutDayConfigurator({
  workoutDay,
  onUpdate,
  onDelete,
  availableExercises,
  isDeload = false
}: WorkoutDayConfiguratorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDay, setEditedDay] = useState<WorkoutDay>(workoutDay)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseWithAlternatives, setExerciseWithAlternatives] = useState<ExerciseWithAlternatives[]>([])
  
  // Manejar cambios en los campos
  const handleChange = (field: keyof WorkoutDay, value: any) => {
    setEditedDay(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Guardar cambios
  const handleSave = () => {
    onUpdate(editedDay)
    setIsEditing(false)
  }
  
  // Cancelar edición
  const handleCancel = () => {
    setEditedDay(workoutDay)
    setIsEditing(false)
  }
  
  // Filtrar ejercicios por término de búsqueda y grupo muscular
  const filteredExercises = availableExercises.filter(exercise => {
    const matchesSearch = searchTerm === "" || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMuscleGroup = selectedMuscleGroup === null || 
      exercise.muscleGroup.includes(selectedMuscleGroup)
    
    return matchesSearch && matchesMuscleGroup
  })
  
  // Agrupar ejercicios por categoría
  const exercisesByCategory: Record<string, Exercise[]> = {}
  filteredExercises.forEach(exercise => {
    if (!exercisesByCategory[exercise.category]) {
      exercisesByCategory[exercise.category] = []
    }
    exercisesByCategory[exercise.category].push(exercise)
  })
  
  // Obtener grupos musculares únicos
  const muscleGroups = Array.from(
    new Set(
      availableExercises.flatMap(exercise => exercise.muscleGroup)
    )
  ).sort()
  
  // Añadir un ejercicio al día
  const addExerciseToDay = (exercise: Exercise) => {
    // Crear un nuevo conjunto de ejercicios con alternativas
    const newExerciseWithAlternatives: ExerciseWithAlternatives = {
      mainExercise: exercise.id,
      alternatives: exercise.alternatives || []
    }
    
    // Crear conjuntos de series para el ejercicio
    const newExerciseSets: ExerciseSet[] = []
    
    // Determinar el número de series y repeticiones según el tipo de entrenamiento y si es deload
    let numSets = isDeload ? 2 : 3
    let targetReps = 10
    let targetRir = 2
    
    if (editedDay.type === 'strength') {
      targetReps = isDeload ? 6 : 5
      targetRir = isDeload ? 3 : 1
    } else if (editedDay.type === 'hypertrophy') {
      targetReps = isDeload ? 12 : 10
      targetRir = isDeload ? 3 : 2
    } else if (editedDay.type === 'endurance') {
      targetReps = isDeload ? 15 : 15
      targetRir = isDeload ? 3 : 2
    }
    
    // Crear las series
    for (let i = 0; i < numSets; i++) {
      newExerciseSets.push({
        id: uuidv4(),
        exerciseId: exercise.id,
        targetReps,
        targetRir,
        restTime: editedDay.type === 'strength' ? 180 : 
                 editedDay.type === 'hypertrophy' ? 90 : 60
      })
    }
    
    // Actualizar el día con el nuevo ejercicio y series
    setEditedDay(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), exercise.id],
      exerciseSets: [...(prev.exerciseSets || []), ...newExerciseSets],
      targetMuscleGroups: Array.from(
        new Set([...(prev.targetMuscleGroups || []), ...exercise.muscleGroup])
      )
    }))
    
    // Actualizar la lista de ejercicios con alternativas
    setExerciseWithAlternatives(prev => [...prev, newExerciseWithAlternatives])
    
    // Cerrar el selector de ejercicios
    setShowExerciseSelector(false)
    setSearchTerm("")
    setSelectedMuscleGroup(null)
  }
  
  // Eliminar un ejercicio del día
  const removeExerciseFromDay = (exerciseId: string) => {
    // Eliminar el ejercicio de la lista
    const updatedExercises = (editedDay.exercises || []).filter(id => id !== exerciseId)
    
    // Eliminar las series asociadas al ejercicio
    const updatedSets = (editedDay.exerciseSets || []).filter(set => set.exerciseId !== exerciseId)
    
    // Recalcular los grupos musculares objetivo
    const remainingExercises = updatedExercises.map(id => 
      availableExercises.find(ex => ex.id === id)
    ).filter(Boolean) as Exercise[]
    
    const updatedMuscleGroups = Array.from(
      new Set(remainingExercises.flatMap(ex => ex.muscleGroup))
    )
    
    // Actualizar el día
    setEditedDay(prev => ({
      ...prev,
      exercises: updatedExercises,
      exerciseSets: updatedSets,
      targetMuscleGroups: updatedMuscleGroups
    }))
    
    // Actualizar la lista de ejercicios con alternativas
    setExerciseWithAlternatives(prev => 
      prev.filter(item => item.mainExercise !== exerciseId)
    )
  }
  
  // Obtener un ejercicio por ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return availableExercises.find(ex => ex.id === id)
  }
  
  // Renderizar el selector de ejercicios
  const renderExerciseSelector = () => (
    <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar ejercicio</DialogTitle>
          <DialogDescription>
            Busca y selecciona un ejercicio para añadir al día de entrenamiento
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-2.5"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <Select
            value={selectedMuscleGroup || ""}
            onValueChange={(value) => setSelectedMuscleGroup(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Grupo muscular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {muscleGroups.map(group => (
                <SelectItem key={group} value={group}>
                  {group === 'chest' ? 'Pecho' : 
                   group === 'back' ? 'Espalda' : 
                   group === 'shoulders' ? 'Hombros' : 
                   group === 'arms' ? 'Brazos' : 
                   group === 'legs' ? 'Piernas' : 
                   group === 'core' ? 'Core' : group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {Object.entries(exercisesByCategory).map(([category, exercises]) => (
              <div key={category}>
                <h3 className="text-sm font-medium mb-2 capitalize">
                  {category === 'chest' ? 'Pecho' : 
                   category === 'back' ? 'Espalda' : 
                   category === 'shoulders' ? 'Hombros' : 
                   category === 'arms' ? 'Brazos' : 
                   category === 'legs' ? 'Piernas' : 
                   category === 'core' ? 'Core' : category}
                </h3>
                <div className="space-y-2">
                  {exercises.map(exercise => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => addExerciseToDay(exercise)}
                    >
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.muscleGroup.join(', ')}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(exercisesByCategory).length === 0 && (
              <div className="text-center py-8">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No se encontraron ejercicios con los filtros seleccionados
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button3D variant="outline" onClick={() => setShowExerciseSelector(false)}>
            Cancelar
          </Button3D>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  
  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-name">Nombre</Label>
              <Input
                id="day-name"
                value={editedDay.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="day-type">Tipo de entrenamiento</Label>
              <Select
                value={editedDay.type || 'strength'}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger id="day-type">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="power">Potencia</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-duration">Duración (minutos)</Label>
              <Input
                id="day-duration"
                type="number"
                min={15}
                max={180}
                value={editedDay.duration || 60}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="day-intensity">Intensidad</Label>
              <Select
                value={editedDay.intensity || 'moderate'}
                onValueChange={(value) => handleChange('intensity', value)}
              >
                <SelectTrigger id="day-intensity">
                  <SelectValue placeholder="Selecciona intensidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="day-notes">Notas</Label>
            <Textarea
              id="day-notes"
              value={editedDay.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              placeholder="Instrucciones especiales o consideraciones para este día"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button3D variant="outline" onClick={handleCancel}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button3D>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{workoutDay.name}</h3>
              <p className="text-sm text-muted-foreground">
                {workoutDay.type === 'strength' ? 'Entrenamiento de fuerza' :
                 workoutDay.type === 'hypertrophy' ? 'Entrenamiento de hipertrofia' :
                 workoutDay.type === 'endurance' ? 'Entrenamiento de resistencia' :
                 workoutDay.type === 'power' ? 'Entrenamiento de potencia' :
                 workoutDay.type === 'cardio' ? 'Entrenamiento cardiovascular' :
                 'Entrenamiento general'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button3D variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button3D>
              <Button3D variant="destructive" size="sm" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Eliminar
              </Button3D>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Duración
              </div>
              <div className="text-lg font-semibold">{workoutDay.duration || 60} min</div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                Intensidad
              </div>
              <div className="text-lg font-semibold capitalize">
                {workoutDay.intensity === 'low' ? 'Baja' :
                 workoutDay.intensity === 'moderate' ? 'Moderada' :
                 workoutDay.intensity === 'high' ? 'Alta' : 
                 workoutDay.intensity || 'Moderada'}
              </div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Target className="h-4 w-4 mr-2 text-primary" />
                Ejercicios
              </div>
              <div className="text-lg font-semibold">
                {(workoutDay.exercises || []).length}
              </div>
            </div>
          </div>
          
          {workoutDay.notes && (
            <div className="bg-accent/5 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                Notas
              </div>
              <p className="text-sm">{workoutDay.notes}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ejercicios</h3>
          <Button3D variant="outline" size="sm" onClick={() => setShowExerciseSelector(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir ejercicio
          </Button3D>
        </div>
        
        <div className="space-y-3">
          {(editedDay.exercises || []).map((exerciseId) => {
            const exercise = getExerciseById(exerciseId)
            if (!exercise) return null
            
            return (
              <Card3D key={exerciseId} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscleGroup.map(group => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group === 'chest' ? 'Pecho' : 
                           group === 'back' ? 'Espalda' : 
                           group === 'shoulders' ? 'Hombros' : 
                           group === 'arms' ? 'Brazos' : 
                           group === 'legs' ? 'Piernas' : 
                           group === 'core' ? 'Core' : group}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Series:</h5>
                      <div className="space-y-1">
                        {(editedDay.exerciseSets || [])
                          .filter(set => set.exerciseId === exerciseId)
                          .map((set, index) => (
                            <div key={set.id} className="flex items-center text-sm">
                              <span className="w-6">{index + 1}.</span>
                              <span>{set.targetReps} reps</span>
                              <span className="mx-1">·</span>
                              <span>RIR {set.targetRir}</span>
                              <span className="mx-1">·</span>
                              <span>{set.restTime}s descanso</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  <Button3D
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeExerciseFromDay(exerciseId)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button3D>
                </div>
              </Card3D>
            )
          })}
          
          {(editedDay.exercises || []).length === 0 && (
            <div className="text-center py-6 bg-accent/5 rounded-lg">
              <Dumbbell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No hay ejercicios configurados. Añade uno para comenzar.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {renderExerciseSelector()}
    </div>
  )
}
