"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Dumbbell, 
  Clock, 
  Calendar, 
  Save,
  X,
  Plus,
  Minus,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

interface WorkoutLogFormProps {
  userId: string
  routineId?: string
  routineName?: string
  onCancel: () => void
  onSuccess: () => void
  initialExercises?: {
    id: string
    name: string
    muscleGroup: string
    sets: number
    repsMin: number
    repsMax: number
    weight: number
    rir: number
  }[]
}

interface ExerciseSet {
  setNumber: number
  weight: number
  reps: number
  rir: number
  completed: boolean
}

interface ExerciseLog {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  sets: ExerciseSet[]
}

export default function WorkoutLogForm({ 
  userId, 
  routineId, 
  routineName = "Entrenamiento personalizado", 
  onCancel, 
  onSuccess,
  initialExercises = []
}: WorkoutLogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estado del formulario
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState("")
  const [rating, setRating] = useState(3)
  const [fatigueLevel, setFatigueLevel] = useState(5)
  
  // Estado de los ejercicios
  const [exercises, setExercises] = useState<ExerciseLog[]>(() => {
    return initialExercises.map(exercise => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: Array.from({ length: exercise.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: exercise.weight,
        reps: Math.floor((exercise.repsMin + exercise.repsMax) / 2),
        rir: exercise.rir,
        completed: false
      }))
    }))
  })
  
  // Añadir un nuevo ejercicio
  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseId: crypto.randomUUID(),
        exerciseName: "",
        muscleGroup: "",
        sets: [
          {
            setNumber: 1,
            weight: 0,
            reps: 10,
            rir: 2,
            completed: false
          }
        ]
      }
    ])
  }
  
  // Eliminar un ejercicio
  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }
  
  // Actualizar nombre de ejercicio
  const updateExerciseName = (index: number, name: string) => {
    const updatedExercises = [...exercises]
    updatedExercises[index].exerciseName = name
    setExercises(updatedExercises)
  }
  
  // Actualizar grupo muscular
  const updateMuscleGroup = (index: number, muscleGroup: string) => {
    const updatedExercises = [...exercises]
    updatedExercises[index].muscleGroup = muscleGroup
    setExercises(updatedExercises)
  }
  
  // Añadir una serie a un ejercicio
  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises]
    const exercise = updatedExercises[exerciseIndex]
    const lastSet = exercise.sets[exercise.sets.length - 1]
    
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 10,
      rir: lastSet?.rir || 2,
      completed: false
    })
    
    setExercises(updatedExercises)
  }
  
  // Eliminar una serie de un ejercicio
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1)
    
    // Actualizar números de serie
    updatedExercises[exerciseIndex].sets.forEach((set, i) => {
      set.setNumber = i + 1
    })
    
    setExercises(updatedExercises)
  }
  
  // Actualizar datos de una serie
  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(updatedExercises)
  }
  
  // Validar el formulario
  const validateForm = () => {
    // Verificar que hay al menos un ejercicio
    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos un ejercicio",
        variant: "destructive",
      })
      return false
    }
    
    // Verificar que todos los ejercicios tienen nombre
    const invalidExercise = exercises.find(ex => !ex.exerciseName.trim())
    if (invalidExercise) {
      toast({
        title: "Error",
        description: "Todos los ejercicios deben tener un nombre",
        variant: "destructive",
      })
      return false
    }
    
    // Verificar que todos los ejercicios tienen al menos una serie
    const emptyExercise = exercises.find(ex => ex.sets.length === 0)
    if (emptyExercise) {
      toast({
        title: "Error",
        description: "Todos los ejercicios deben tener al menos una serie",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }
  
  // Enviar el formulario
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const workoutLog = {
        user_id: userId,
        routine_id: routineId || null,
        date: new Date().toISOString(),
        duration,
        completed_sets: exercises,
        notes: notes.trim() || null,
        rating,
        fatigue_level: fatigueLevel,
      }
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert([workoutLog])
        .select()
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Entrenamiento registrado",
        description: "Tu entrenamiento ha sido registrado correctamente",
      })
      
      onSuccess()
    } catch (error) {
      console.error('Error al registrar el entrenamiento:', error)
      toast({
        title: "Error",
        description: "No se pudo registrar el entrenamiento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dumbbell className="h-5 w-5 mr-2 text-primary" />
          Registrar Entrenamiento
        </CardTitle>
        <CardDescription>
          {routineName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Duración */}
        <div className="space-y-2">
          <Label>Duración (minutos)</Label>
          <div className="py-4">
            <Slider
              min={10}
              max={180}
              step={5}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs">10 min</span>
              <span className="text-xs font-medium">{duration} min</span>
              <span className="text-xs">180 min</span>
            </div>
          </div>
        </div>
        
        {/* Ejercicios */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ejercicios</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addExercise}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Ejercicio
            </Button>
          </div>
          
          {exercises.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500">No hay ejercicios. Añade uno para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2 w-full mr-4">
                      <Label htmlFor={`exercise-name-${exerciseIndex}`}>Nombre del ejercicio</Label>
                      <Input
                        id={`exercise-name-${exerciseIndex}`}
                        value={exercise.exerciseName}
                        onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                        placeholder="Ej: Press de banca"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor={`muscle-group-${exerciseIndex}`}>Grupo muscular</Label>
                      <Input
                        id={`muscle-group-${exerciseIndex}`}
                        value={exercise.muscleGroup}
                        onChange={(e) => updateMuscleGroup(exerciseIndex, e.target.value)}
                        placeholder="Ej: Pecho"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 mt-8"
                      onClick={() => removeExercise(exerciseIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Series</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSet(exerciseIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir Serie
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-2">Serie</th>
                            <th className="text-left py-2 pr-2">Peso (kg)</th>
                            <th className="text-left py-2 pr-2">Reps</th>
                            <th className="text-left py-2 pr-2">RIR</th>
                            <th className="text-left py-2 pr-2">Completada</th>
                            <th className="text-left py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set, setIndex) => (
                            <tr key={setIndex} className="border-b last:border-0">
                              <td className="py-2 pr-2">{set.setNumber}</td>
                              <td className="py-2 pr-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="2.5"
                                  value={set.weight}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                  className="w-16 h-8"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={set.rir}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'rir', parseInt(e.target.value) || 0)}
                                  className="w-16 h-8"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="checkbox"
                                  checked={set.completed}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'completed', e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </td>
                              <td className="py-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                  disabled={exercise.sets.length <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Valoración */}
        <div className="space-y-2">
          <Label>Valoración del entrenamiento (1-5)</Label>
          <div className="py-4">
            <Slider
              min={1}
              max={5}
              step={1}
              value={[rating]}
              onValueChange={(value) => setRating(value[0])}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs">Muy malo</span>
              <span className="text-xs font-medium">{rating}/5</span>
              <span className="text-xs">Excelente</span>
            </div>
          </div>
        </div>
        
        {/* Nivel de fatiga */}
        <div className="space-y-2">
          <Label>Nivel de fatiga (1-10)</Label>
          <div className="py-4">
            <Slider
              min={1}
              max={10}
              step={1}
              value={[fatigueLevel]}
              onValueChange={(value) => setFatigueLevel(value[0])}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs">Muy bajo</span>
              <span className="text-xs font-medium">{fatigueLevel}/10</span>
              <span className="text-xs">Extremo</span>
            </div>
          </div>
        </div>
        
        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas sobre tu entrenamiento..."
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Entrenamiento
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
