"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Dumbbell, Calendar, Filter, Plus,
  ChevronRight, BarChart3, Settings,
  Clock, Zap, Award, Flame,
  ArrowRight, Check, X, Info,
  Loader2, Save, RefreshCw
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Progress3D } from "@/components/ui/progress-3d"
import { WorkoutRoutine, WorkoutDay, ExerciseSet, Exercise } from "@/lib/types/training"
import { saveWorkoutRoutine } from "@/lib/supabase-training"
import {
  ADVANCED_TEMPLATES,
  convertTemplateToRoutine,
  AdvancedWorkoutTemplate
} from "@/lib/advanced-workout-templates"

interface AdvancedTemplateSelectorProps {
  userId: string
  availableExercises: Exercise[]
  onSelectTemplate: (routine: WorkoutRoutine) => void
  onCancel: () => void
}

export function AdvancedTemplateSelector({
  userId,
  availableExercises,
  onSelectTemplate,
  onCancel
}: AdvancedTemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customizeName, setCustomizeName] = useState("")
  const [customizeDescription, setCustomizeDescription] = useState("")
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
  // Seleccionar una plantilla
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    
    // Obtener la plantilla seleccionada
    const template = ADVANCED_TEMPLATES.find(t => t.id === templateId)
    
    if (template) {
      setCustomizeName(template.name)
      setCustomizeDescription(template.description)
    }
  }
  
  // Mostrar detalles de una plantilla
  const toggleDetails = (templateId: string) => {
    if (showDetails === templateId) {
      setShowDetails(null)
    } else {
      setShowDetails(templateId)
    }
  }
  
  // Aplicar la plantilla seleccionada
  const applyTemplate = () => {
    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Selecciona una plantilla primero",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    // Obtener la plantilla seleccionada
    const template = ADVANCED_TEMPLATES.find(t => t.id === selectedTemplateId)
    
    if (!template) {
      toast({
        title: "Error",
        description: "Plantilla no encontrada",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }
    
    // Crear una copia de la plantilla con nombre y descripción personalizados
    const customizedTemplate: AdvancedWorkoutTemplate = {
      ...template,
      name: customizeName || template.name,
      description: customizeDescription || template.description
    }
    
    // Convertir la plantilla a una rutina
    const routine = convertTemplateToRoutine(customizedTemplate, userId, availableExercises)
    
    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false)
      onSelectTemplate(routine)
      
      toast({
        title: "Plantilla aplicada",
        description: "La rutina avanzada ha sido creada correctamente",
      })
    }, 1500)
  }
  
  // Renderizar detalles de la plantilla
  const renderTemplateDetails = (template: AdvancedWorkoutTemplate) => {
    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Nivel</h4>
            <Badge>{template.level}</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Objetivo</h4>
            <Badge>{template.goal}</Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Frecuencia</h4>
            <p className="text-sm">{template.frequency} días/semana</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Duración</h4>
            <p className="text-sm">{template.duration} semanas</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Días de entrenamiento</h4>
          <div className="space-y-2">
            {template.days.map((day, index) => (
              <div key={index} className="bg-card/50 p-2 rounded-md">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium">{day.name}</h5>
                  <div className="flex gap-1">
                    {day.targetMuscleGroups.map(group => (
                      <Badge key={group} variant="outline" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {day.exercises.length} ejercicios, {day.exercises.reduce((acc, ex) => acc + ex.sets, 0)} series totales
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {template.includesDeload && (
          <div>
            <h4 className="text-sm font-medium mb-1">Descarga</h4>
            <p className="text-sm">Incluye semana de descarga cada {template.deloadFrequency} semanas</p>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plantillas Avanzadas</h2>
        <Button3D variant="outline" onClick={onCancel}>
          Volver
        </Button3D>
      </div>
      
      <p className="text-muted-foreground">
        Selecciona una plantilla avanzada basada en principios científicos de hipertrofia y periodización.
        Estas rutinas incluyen técnicas avanzadas, descargas programadas y progresión óptima.
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {ADVANCED_TEMPLATES.map(template => (
          <Card3D 
            key={template.id}
            className={`transition-all ${selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''}`}
          >
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>{template.name}</Card3DTitle>
                <div className="flex gap-2">
                  <Button3D 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleDetails(template.id)}
                  >
                    {showDetails === template.id ? "Ocultar" : "Detalles"}
                  </Button3D>
                  <Button3D 
                    variant={selectedTemplateId === template.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {selectedTemplateId === template.id ? "Seleccionada" : "Seleccionar"}
                  </Button3D>
                </div>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge>{template.level}</Badge>
                <Badge>{template.goal}</Badge>
                <Badge>{template.frequency} días/semana</Badge>
                <Badge variant="outline">{template.split}</Badge>
                {template.includesDeload && (
                  <Badge variant="outline">Deload</Badge>
                )}
              </div>
              
              {showDetails === template.id && renderTemplateDetails(template)}
            </Card3DContent>
          </Card3D>
        ))}
      </div>
      
      {selectedTemplateId && (
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Personalizar Plantilla</Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="space-y-4">
            <div>
              <Label htmlFor="custom-name">Nombre personalizado</Label>
              <Input
                id="custom-name"
                value={customizeName}
                onChange={(e) => setCustomizeName(e.target.value)}
                className="mt-1"
                placeholder="Introduce un nombre personalizado"
              />
            </div>
            
            <div>
              <Label htmlFor="custom-description">Descripción personalizada</Label>
              <Input
                id="custom-description"
                value={customizeDescription}
                onChange={(e) => setCustomizeDescription(e.target.value)}
                className="mt-1"
                placeholder="Introduce una descripción personalizada"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button3D variant="outline" onClick={onCancel}>
                Cancelar
              </Button3D>
              <Button3D onClick={applyTemplate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Aplicar Plantilla
                  </>
                )}
              </Button3D>
            </div>
          </Card3DContent>
        </Card3D>
      )}
    </div>
  )
}
