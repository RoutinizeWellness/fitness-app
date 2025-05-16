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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  BarChart, 
  Plus, 
  Minus, 
  Save, 
  Trash, 
  Edit, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Dumbbell
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  MicroCycle
} from "@/lib/types/training-program"
import { Exercise, WorkoutDay } from "@/lib/types/training"
import { WorkoutDayConfigurator } from "@/components/training/workout-day-configurator"
import { v4 as uuidv4 } from "uuid"

interface MicrocycleConfiguratorProps {
  microcycle: MicroCycle
  onUpdate: (microcycle: MicroCycle) => void
  onDelete: () => void
  availableExercises: Exercise[]
  isDeload?: boolean
}

export function MicrocycleConfigurator({
  microcycle,
  onUpdate,
  onDelete,
  availableExercises,
  isDeload = false
}: MicrocycleConfiguratorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMicrocycle, setEditedMicrocycle] = useState<MicroCycle>(microcycle)
  
  // Manejar cambios en los campos
  const handleChange = (field: keyof MicroCycle, value: any) => {
    setEditedMicrocycle(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Guardar cambios
  const handleSave = () => {
    onUpdate(editedMicrocycle)
    setIsEditing(false)
  }
  
  // Cancelar edición
  const handleCancel = () => {
    setEditedMicrocycle(microcycle)
    setIsEditing(false)
  }
  
  // Añadir un nuevo día de entrenamiento
  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: uuidv4(),
      name: `Día ${editedMicrocycle.days.length + 1}`,
      dayOfWeek: (editedMicrocycle.days.length % 7) + 1,
      exercises: [],
      exerciseSets: [],
      notes: "",
      duration: 60, // 60 minutos por defecto
      intensity: isDeload ? "low" : "moderate",
      type: "strength",
      targetMuscleGroups: []
    }
    
    setEditedMicrocycle(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }))
  }
  
  // Actualizar un día de entrenamiento
  const updateWorkoutDay = (index: number, updatedDay: WorkoutDay) => {
    const updatedDays = [...editedMicrocycle.days]
    updatedDays[index] = updatedDay
    
    setEditedMicrocycle(prev => ({
      ...prev,
      days: updatedDays
    }))
  }
  
  // Eliminar un día de entrenamiento
  const removeWorkoutDay = (index: number) => {
    const updatedDays = [...editedMicrocycle.days]
    updatedDays.splice(index, 1)
    
    // Actualizar los nombres de los días para mantener la secuencia
    const renamedDays = updatedDays.map((day, i) => ({
      ...day,
      name: day.name.startsWith('Día ') ? `Día ${i + 1}` : day.name
    }))
    
    setEditedMicrocycle(prev => ({
      ...prev,
      days: renamedDays
    }))
  }
  
  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="microcycle-name">Nombre</Label>
              <Input
                id="microcycle-name"
                value={editedMicrocycle.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="microcycle-duration">Duración (días)</Label>
              <Input
                id="microcycle-duration"
                type="number"
                min={1}
                max={14}
                value={editedMicrocycle.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="microcycle-description">Descripción</Label>
            <Textarea
              id="microcycle-description"
              value={editedMicrocycle.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="microcycle-intensity">Intensidad</Label>
              <Select
                value={editedMicrocycle.intensity}
                onValueChange={(value) => handleChange('intensity', value)}
              >
                <SelectTrigger id="microcycle-intensity">
                  <SelectValue placeholder="Selecciona intensidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="microcycle-volume">Volumen</Label>
              <Select
                value={editedMicrocycle.volume}
                onValueChange={(value) => handleChange('volume', value)}
              >
                <SelectTrigger id="microcycle-volume">
                  <SelectValue placeholder="Selecciona volumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="microcycle-notes">Notas</Label>
            <Textarea
              id="microcycle-notes"
              value={editedMicrocycle.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              placeholder="Instrucciones especiales o consideraciones para este microciclo"
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
              <h3 className="text-lg font-medium">{microcycle.name}</h3>
              <p className="text-sm text-muted-foreground">{microcycle.description}</p>
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
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Duración
              </div>
              <div className="text-lg font-semibold">{microcycle.duration} días</div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                Intensidad
              </div>
              <div className="text-lg font-semibold capitalize">
                {microcycle.intensity === 'low' ? 'Baja' :
                 microcycle.intensity === 'moderate' ? 'Moderada' :
                 microcycle.intensity === 'high' ? 'Alta' : microcycle.intensity}
              </div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <BarChart className="h-4 w-4 mr-2 text-primary" />
                Volumen
              </div>
              <div className="text-lg font-semibold capitalize">
                {microcycle.volume === 'low' ? 'Bajo' :
                 microcycle.volume === 'moderate' ? 'Moderado' :
                 microcycle.volume === 'high' ? 'Alto' : microcycle.volume}
              </div>
            </div>
          </div>
          
          {microcycle.notes && (
            <div className="bg-accent/5 p-3 rounded-lg">
              <div className="flex items-center text-sm font-medium mb-1">
                <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                Notas
              </div>
              <p className="text-sm">{microcycle.notes}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Días de entrenamiento</h3>
          <Button3D variant="outline" size="sm" onClick={addWorkoutDay}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir día
          </Button3D>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {editedMicrocycle.days.map((day, index) => (
            <AccordionItem key={day.id} value={day.id}>
              <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                <div className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                  <span>{day.name}</span>
                  {day.targetMuscleGroups && day.targetMuscleGroups.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {day.targetMuscleGroups.join(', ')}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <WorkoutDayConfigurator
                  workoutDay={day}
                  onUpdate={(updated) => updateWorkoutDay(index, updated)}
                  onDelete={() => removeWorkoutDay(index)}
                  availableExercises={availableExercises}
                  isDeload={isDeload}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {editedMicrocycle.days.length === 0 && (
          <div className="text-center py-6 bg-accent/5 rounded-lg">
            <Dumbbell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No hay días de entrenamiento configurados. Añade uno para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
