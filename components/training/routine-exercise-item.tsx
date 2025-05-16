"use client"

import { useState, useEffect } from "react"
import { 
  Edit, Trash2, ChevronDown, ChevronUp, 
  Shuffle, Save, X, Plus, Minus 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
import { toast } from "@/components/ui/use-toast"
import { Exercise } from "@/lib/supabase"
import { getExerciseAlternatives } from "@/lib/supabase-queries"
import { WorkoutRoutineExercise } from "@/lib/workout-routines"

interface RoutineExerciseItemProps {
  exercise: WorkoutRoutineExercise
  index: number
  onUpdate: (index: number, updatedExercise: WorkoutRoutineExercise) => void
  onDelete: (index: number) => void
  availableExercises: Exercise[]
}

export function RoutineExerciseItem({
  exercise,
  index,
  onUpdate,
  onDelete,
  availableExercises
}: RoutineExerciseItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedExercise, setEditedExercise] = useState<WorkoutRoutineExercise>({...exercise})
  const [alternatives, setAlternatives] = useState<Exercise[]>([])
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false)
  
  // Cargar alternativas cuando se expande el ejercicio
  useEffect(() => {
    if (isExpanded && alternatives.length === 0 && exercise.exercise) {
      loadAlternatives()
    }
  }, [isExpanded, exercise.exercise, alternatives.length])
  
  // Cargar ejercicios alternativos
  const loadAlternatives = async () => {
    if (!exercise.exercise) return
    
    setIsLoadingAlternatives(true)
    try {
      const { data, error } = await getExerciseAlternatives(
        exercise.exercise_id,
        exercise.exercise.muscle_group,
        10
      )
      
      if (error) throw error
      
      if (data) {
        setAlternatives(data)
      }
    } catch (error) {
      console.error("Error al cargar alternativas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar ejercicios alternativos",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAlternatives(false)
    }
  }
  
  // Manejar cambios en los campos
  const handleChange = (field: keyof WorkoutRoutineExercise, value: any) => {
    setEditedExercise({
      ...editedExercise,
      [field]: value
    })
  }
  
  // Guardar cambios
  const handleSave = () => {
    onUpdate(index, editedExercise)
    setIsEditing(false)
    toast({
      title: "Ejercicio actualizado",
      description: "Los cambios han sido guardados"
    })
  }
  
  // Cancelar edición
  const handleCancel = () => {
    setEditedExercise({...exercise})
    setIsEditing(false)
  }
  
  // Seleccionar ejercicio alternativo
  const handleSelectAlternative = (alternativeId: string) => {
    const selectedExercise = availableExercises.find(ex => ex.id === alternativeId)
    if (!selectedExercise) return
    
    const updatedExercise = {
      ...editedExercise,
      exercise_id: selectedExercise.id,
      exercise: selectedExercise
    }
    
    setEditedExercise(updatedExercise)
    onUpdate(index, updatedExercise)
    
    toast({
      title: "Ejercicio cambiado",
      description: `Se ha cambiado a ${selectedExercise.name}`
    })
  }
  
  return (
    <Card className={`p-4 ${isEditing ? 'border-primary' : ''}`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Editar ejercicio #{index + 1}</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Series</label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleChange('sets', Math.max(1, editedExercise.sets - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={editedExercise.sets}
                  onChange={(e) => handleChange('sets', parseInt(e.target.value) || 1)}
                  className="mx-2 text-center"
                  min={1}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleChange('sets', editedExercise.sets + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Repeticiones</label>
              <Input
                value={editedExercise.reps}
                onChange={(e) => handleChange('reps', e.target.value)}
                placeholder="10-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descanso (segundos)</label>
              <Input
                type="number"
                value={editedExercise.rest}
                onChange={(e) => handleChange('rest', parseInt(e.target.value) || 60)}
                min={0}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (opcional)</label>
              <Input
                value={editedExercise.weight || ""}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="50 kg"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Input
              value={editedExercise.notes || ""}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium">{exercise.exercise?.name || `Ejercicio ${index + 1}`}</h3>
              <p className="text-sm text-gray-500">
                {exercise.sets} series × {exercise.reps} reps
                {exercise.weight ? ` · ${exercise.weight}` : ''}
                {` · Descanso: ${exercise.rest}s`}
              </p>
              {exercise.notes && (
                <p className="text-xs text-gray-400 mt-1">{exercise.notes}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Ejercicios alternativos</h4>
                  {isLoadingAlternatives ? (
                    <p className="text-sm text-gray-500">Cargando alternativas...</p>
                  ) : alternatives.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      <Select onValueChange={handleSelectAlternative}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar alternativa" />
                        </SelectTrigger>
                        <SelectContent>
                          {alternatives.map(alt => (
                            <SelectItem key={alt.id} value={alt.id}>
                              {alt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay alternativas disponibles</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
