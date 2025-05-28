"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Layers,
  BarChart3,
  Dumbbell,
  Zap,
  Target,
  Info,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { 
  PeriodizationProgram, 
  Mesocycle, 
  Microcycle, 
  PeriodizedSession,
  TrainingObjective,
  ObjectiveAssociation
} from "@/lib/types/advanced-periodization"
import { PeriodizationService } from "@/lib/services/periodization-service"
import { VisualProgramEditor } from "./visual-program-editor"
import { PeriodizationTemplates } from "./periodization-templates"
import { TrainingObjectives } from "./training-objectives"
import { GoalAssociation } from "./goal-association"

interface AdvancedProgramBuilderProps {
  userId: string
  onSave: (program: PeriodizationProgram) => void
  onCancel: () => void
  existingProgram?: PeriodizationProgram
}

export function AdvancedProgramBuilder({ 
  userId, 
  onSave, 
  onCancel,
  existingProgram
}: AdvancedProgramBuilderProps) {
  const [activeStep, setActiveStep] = useState<'template' | 'objectives' | 'editor' | 'association'>(
    existingProgram ? 'editor' : 'template'
  )
  const [program, setProgram] = useState<PeriodizationProgram | null>(existingProgram || null)
  const [objectives, setObjectives] = useState<TrainingObjective[]>([])
  const [associations, setAssociations] = useState<ObjectiveAssociation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Cargar objetivos del usuario
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        const userObjectives = await PeriodizationService.getUserObjectives(userId)
        setObjectives(userObjectives)
      } catch (error) {
        console.error('Error al cargar objetivos:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los objetivos",
          variant: "destructive"
        })
      }
    }
    
    loadObjectives()
  }, [userId])
  
  // Manejar selección de plantilla
  const handleSelectTemplate = (selectedProgram: PeriodizationProgram) => {
    setProgram(selectedProgram)
    setActiveStep('objectives')
  }
  
  // Manejar cambio de objetivos
  const handleObjectivesChange = (updatedObjectives: TrainingObjective[]) => {
    setObjectives(updatedObjectives)
  }
  
  // Manejar cambio de asociaciones
  const handleAssociationsChange = (updatedAssociations: ObjectiveAssociation[]) => {
    setAssociations(updatedAssociations)
  }
  
  // Manejar guardado del programa
  const handleSaveProgram = async (updatedProgram: PeriodizationProgram) => {
    if (!updatedProgram) return
    
    setIsLoading(true)
    
    try {
      // Actualizar programa con objetivos y asociaciones
      const finalProgram = {
        ...updatedProgram,
        objectives,
        associations
      }
      
      onSave(finalProgram)
      
      toast({
        title: "Programa guardado",
        description: "El programa ha sido guardado correctamente"
      })
    } catch (error) {
      console.error('Error al guardar programa:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el programa",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (activeStep) {
      case 'template':
        return (
          <PeriodizationTemplates
            userId={userId}
            onSelectTemplate={handleSelectTemplate}
            onCancel={onCancel}
          />
        )
      
      case 'objectives':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Definir Objetivos</h2>
              <div className="flex space-x-2">
                <Button3D variant="outline" onClick={() => setActiveStep('template')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button3D>
                <Button3D 
                  onClick={() => setActiveStep('editor')}
                  disabled={objectives.length === 0}
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button3D>
              </div>
            </div>
            
            <TrainingObjectives
              userId={userId}
              objectives={objectives}
              onObjectivesChange={handleObjectivesChange}
            />
          </div>
        )
      
      case 'editor':
        return program ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button3D variant="outline" onClick={() => setActiveStep('objectives')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Objetivos
                </Button3D>
                <Button3D onClick={() => setActiveStep('association')}>
                  Asociación
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button3D>
              </div>
            </div>
            
            <VisualProgramEditor
              program={program}
              onSave={(updatedProgram) => {
                setProgram(updatedProgram)
                setActiveStep('association')
              }}
              onCancel={onCancel}
            />
          </div>
        ) : null
      
      case 'association':
        return program ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Asociación de Objetivos</h2>
              <div className="flex space-x-2">
                <Button3D variant="outline" onClick={() => setActiveStep('editor')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Editor
                </Button3D>
                <Button3D 
                  onClick={() => handleSaveProgram(program)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Programa'}
                </Button3D>
              </div>
            </div>
            
            <GoalAssociation
              programId={program.id || 'temp-program'}
              objectives={objectives}
              mesocycles={program.mesocycles || []}
              associations={associations}
              onAssociationsChange={handleAssociationsChange}
            />
          </div>
        ) : null
    }
  }
  
  // Renderizar indicador de pasos
  const renderStepIndicator = () => {
    const steps = [
      { id: 'template', label: 'Plantilla' },
      { id: 'objectives', label: 'Objetivos' },
      { id: 'editor', label: 'Editor' },
      { id: 'association', label: 'Asociación' }
    ]
    
    return (
      <div className="flex justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                activeStep === step.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {index + 1}
            </div>
            <div 
              className={`ml-2 ${
                activeStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div className="mx-2 w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {!existingProgram && renderStepIndicator()}
      {renderCurrentStep()}
    </div>
  )
}
