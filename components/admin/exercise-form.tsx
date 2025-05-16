"use client"

import { useState, useEffect } from "react"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dumbbell,
  Plus,
  X,
  Save,
  Trash2,
  Image,
  Video,
  Info,
  Tag
} from "lucide-react"
import { Exercise } from "@/lib/types/training"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

interface ExerciseFormProps {
  exercise?: Exercise
  muscleGroups: string[]
  equipmentTypes: string[]
  onSave: (exercise: Exercise) => void
  onCancel: () => void
}

export function ExerciseForm({
  exercise,
  muscleGroups,
  equipmentTypes,
  onSave,
  onCancel
}: ExerciseFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Exercise>>(
    exercise || {
      name: "",
      description: "",
      category: "strength",
      muscleGroup: [],
      equipment: [],
      difficulty: "intermediate",
      isCompound: false,
      imageUrl: "",
      videoUrl: ""
    }
  )
  const [newMuscleGroup, setNewMuscleGroup] = useState("")
  const [newEquipment, setNewEquipment] = useState("")
  
  const handleChange = (field: keyof Exercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const addMuscleGroup = () => {
    if (!newMuscleGroup) return
    
    if (!formData.muscleGroup?.includes(newMuscleGroup)) {
      setFormData(prev => ({
        ...prev,
        muscleGroup: [...(prev.muscleGroup || []), newMuscleGroup]
      }))
    }
    
    setNewMuscleGroup("")
  }
  
  const removeMuscleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroup: prev.muscleGroup?.filter(g => g !== group) || []
    }))
  }
  
  const addEquipment = () => {
    if (!newEquipment) return
    
    if (!formData.equipment?.includes(newEquipment)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), newEquipment]
      }))
    }
    
    setNewEquipment("")
  }
  
  const removeEquipment = (eq: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.filter(e => e !== eq) || []
    }))
  }
  
  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.name || !formData.muscleGroup?.length || !formData.equipment?.length) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Preparar datos para Supabase
      const exerciseData = {
        name: formData.name,
        description: formData.description || "",
        category: formData.category || "strength",
        muscle_group: formData.muscleGroup,
        equipment: formData.equipment,
        difficulty: formData.difficulty || "intermediate",
        is_compound: formData.isCompound || false,
        image_url: formData.imageUrl || null,
        video_url: formData.videoUrl || null
      }
      
      let result
      
      if (exercise?.id) {
        // Actualizar ejercicio existente
        const { data, error } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', exercise.id)
          .select()
          .single()
        
        if (error) throw error
        result = data
      } else {
        // Crear nuevo ejercicio
        const { data, error } = await supabase
          .from('exercises')
          .insert(exerciseData)
          .select()
          .single()
        
        if (error) throw error
        result = data
      }
      
      // Transformar resultado al formato de la aplicación
      const savedExercise: Exercise = {
        id: result.id,
        name: result.name,
        description: result.description || "",
        category: result.category || "strength",
        muscleGroup: result.muscle_group || [],
        equipment: result.equipment || [],
        difficulty: result.difficulty as "beginner" | "intermediate" | "advanced",
        isCompound: result.is_compound || false,
        imageUrl: result.image_url || undefined,
        videoUrl: result.video_url || undefined
      }
      
      toast({
        title: exercise?.id ? "Ejercicio actualizado" : "Ejercicio creado",
        description: exercise?.id 
          ? "El ejercicio ha sido actualizado correctamente" 
          : "El nuevo ejercicio ha sido creado correctamente"
      })
      
      onSave(savedExercise)
    } catch (error) {
      console.error("Error al guardar ejercicio:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el ejercicio",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name" className="mb-1 block">Nombre del ejercicio *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Press de banca"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="mb-1 block">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe el ejercicio y cómo realizarlo correctamente"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="mb-1 block">Categoría</Label>
            <Select
              value={formData.category || "strength"}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Fuerza</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibilidad</SelectItem>
                <SelectItem value="balance">Equilibrio</SelectItem>
                <SelectItem value="plyometric">Pliométrico</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="difficulty" className="mb-1 block">Dificultad</Label>
            <Select
              value={formData.difficulty || "intermediate"}
              onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                handleChange("difficulty", value)
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Selecciona la dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="mb-1 block">Grupos musculares *</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.muscleGroup?.map(group => (
              <Badge key={group} variant="secondary" className="flex items-center gap-1">
                {group}
                <button 
                  type="button" 
                  onClick={() => removeMuscleGroup(group)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={newMuscleGroup} onValueChange={setNewMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button3D type="button" onClick={addMuscleGroup} disabled={!newMuscleGroup}>
              <Plus className="h-4 w-4" />
            </Button3D>
          </div>
        </div>
        
        <div>
          <Label className="mb-1 block">Equipamiento *</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.equipment?.map(eq => (
              <Badge key={eq} variant="secondary" className="flex items-center gap-1">
                {eq}
                <button 
                  type="button" 
                  onClick={() => removeEquipment(eq)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={newEquipment} onValueChange={setNewEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona equipamiento" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(eq => (
                  <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button3D type="button" onClick={addEquipment} disabled={!newEquipment}>
              <Plus className="h-4 w-4" />
            </Button3D>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="imageUrl" className="mb-1 block">URL de imagen</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="URL de la imagen del ejercicio"
              />
              <Button3D variant="outline" size="icon" type="button">
                <Image className="h-4 w-4" />
              </Button3D>
            </div>
          </div>
          
          <div>
            <Label htmlFor="videoUrl" className="mb-1 block">URL de video</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                value={formData.videoUrl || ""}
                onChange={(e) => handleChange("videoUrl", e.target.value)}
                placeholder="URL del video demostrativo"
              />
              <Button3D variant="outline" size="icon" type="button">
                <Video className="h-4 w-4" />
              </Button3D>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isCompound"
            checked={formData.isCompound || false}
            onCheckedChange={(checked) => handleChange("isCompound", checked)}
          />
          <Label htmlFor="isCompound">Es un ejercicio compuesto</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button3D variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {exercise?.id ? "Actualizar ejercicio" : "Crear ejercicio"}
            </>
          )}
        </Button3D>
      </div>
    </div>
  )
}
