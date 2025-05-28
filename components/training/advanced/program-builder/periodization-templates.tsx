"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  ChevronRight, 
  Info, 
  Check, 
  X, 
  ArrowRight,
  Dumbbell,
  Zap,
  Target,
  BarChart3,
  Layers,
  RefreshCw,
  Flame
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { 
  PeriodizationType, 
  TrainingLevel, 
  TrainingGoal, 
  PeriodizationProgram 
} from "@/lib/types/advanced-periodization"
import { 
  PERIODIZATION_CONFIGS, 
  getRecommendedPeriodization,
  generateBasicProgramStructure
} from "@/lib/config/periodization-configs"
import { PeriodizationService } from "@/lib/services/periodization-service"

interface PeriodizationTemplatesProps {
  userId: string
  onSelectTemplate: (program: PeriodizationProgram) => void
  onCancel: () => void
}

export function PeriodizationTemplates({ userId, onSelectTemplate, onCancel }: PeriodizationTemplatesProps) {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended')
  const [selectedType, setSelectedType] = useState<PeriodizationType | null>(null)
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>('advanced')
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>('hypertrophy')
  const [programName, setProgramName] = useState('Mi Programa Avanzado')
  const [programDuration, setProgramDuration] = useState(12)
  const [frequency, setFrequency] = useState(4)
  const [showDetails, setShowDetails] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Establecer tipo de periodización recomendado al cambiar nivel o objetivo
  useEffect(() => {
    if (activeTab === 'recommended') {
      const recommended = getRecommendedPeriodization(trainingLevel, trainingGoal)
      setSelectedType(recommended)
    }
  }, [trainingLevel, trainingGoal, activeTab])
  
  // Crear programa a partir de plantilla
  const createProgram = () => {
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de periodización",
        variant: "destructive"
      })
      return
    }
    
    setIsCreating(true)
    
    try {
      // Generar estructura básica
      const structure = generateBasicProgramStructure(
        selectedType,
        trainingLevel,
        trainingGoal,
        programDuration,
        frequency
      )
      
      // Crear programa
      const program: PeriodizationProgram = {
        user_id: userId,
        name: programName,
        description: `Programa de ${PERIODIZATION_CONFIGS[selectedType].name} para ${getTrainingLevelName(trainingLevel)} con objetivo de ${getTrainingGoalName(trainingGoal)}`,
        periodization_type: selectedType,
        goal: trainingGoal,
        training_level: trainingLevel,
        frequency: frequency,
        mesocycles: structure.mesocycles
      }
      
      onSelectTemplate(program)
    } catch (error) {
      console.error('Error al crear programa:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el programa",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }
  
  // Renderizar tarjeta de tipo de periodización
  const renderPeriodizationCard = (type: PeriodizationType) => {
    const config = PERIODIZATION_CONFIGS[type]
    const isSelected = selectedType === type
    const isRecommended = getRecommendedPeriodization(trainingLevel, trainingGoal) === type
    
    return (
      <div 
        key={type}
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected 
            ? 'border-primary bg-primary/10' 
            : 'hover:border-primary/50 hover:bg-primary/5'
        }`}
        onClick={() => setSelectedType(type)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{config.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{config.description}</p>
          </div>
          
          {isRecommended && (
            <Badge className="bg-green-500">Recomendado</Badge>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {config.bestSuitedGoals.includes(trainingGoal) && (
            <Badge variant="outline" className="bg-primary/20">
              <Target className="h-3 w-3 mr-1" />
              Ideal para tu objetivo
            </Badge>
          )}
          
          {config.recommendedFor.includes(trainingLevel) && (
            <Badge variant="outline" className="bg-primary/20">
              <Dumbbell className="h-3 w-3 mr-1" />
              Para tu nivel
            </Badge>
          )}
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {config.typicalDuration} semanas
          </div>
          
          <Button3D 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedType(type)
              setShowDetails(true)
            }}
          >
            <Info className="h-4 w-4 mr-1" />
            Detalles
          </Button3D>
        </div>
      </div>
    )
  }
  
  // Renderizar detalles del tipo de periodización seleccionado
  const renderPeriodizationDetails = () => {
    if (!selectedType) return null
    
    const config = PERIODIZATION_CONFIGS[selectedType]
    
    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{config.name}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Características</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Dumbbell className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Recomendado para: {config.recommendedFor.map(getTrainingLevelName).join(', ')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Objetivos ideales: {config.bestSuitedGoals.map(getTrainingGoalName).join(', ')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Duración típica: {config.typicalDuration} semanas
                    </span>
                  </li>
                  <li className="flex items-start">
                    <RefreshCw className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Descarga cada {config.deloadFrequency} semanas
                    </span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Patrones</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Layers className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Volumen: {getPeriodizationPatternName(config.volumePattern)}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Flame className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Intensidad: {getPeriodizationPatternName(config.intensityPattern)}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                    <span className="text-sm">
                      Secuencia de fases: {config.phasesSequence.map(getPhaseDisplayName).join(' → ')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">Ventajas</h4>
                <ul className="space-y-1">
                  {config.pros.map((pro, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-600">Desventajas</h4>
                <ul className="space-y-1">
                  {config.cons.map((con, index) => (
                    <li key={index} className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowDetails(false)}>
              Cerrar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plantillas de Periodización</h2>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
      </div>
      
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Configuración del Programa</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Nombre del Programa</Label>
                <Input
                  id="program-name"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="Mi Programa Avanzado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="training-level">Nivel de Entrenamiento</Label>
                <select
                  id="training-level"
                  value={trainingLevel}
                  onChange={(e) => setTrainingLevel(e.target.value as TrainingLevel)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="training-goal">Objetivo Principal</Label>
                <select
                  id="training-goal"
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value as TrainingGoal)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="hypertrophy">Hipertrofia</option>
                  <option value="strength">Fuerza</option>
                  <option value="power">Potencia</option>
                  <option value="endurance">Resistencia</option>
                  <option value="fat_loss">Pérdida de Grasa</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-duration">Duración (semanas)</Label>
                <Input
                  id="program-duration"
                  type="number"
                  min={4}
                  max={52}
                  value={programDuration}
                  onChange={(e) => setProgramDuration(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="training-frequency">Frecuencia (días por semana)</Label>
                <select
                  id="training-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={3}>3 días</option>
                  <option value={4}>4 días</option>
                  <option value={5}>5 días</option>
                  <option value={6}>6 días</option>
                </select>
              </div>
              
              <div className="pt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Recomendación basada en tu perfil</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Seleccionamos el tipo de periodización más adecuado según tu nivel y objetivo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
      
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Selecciona un Tipo de Periodización</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'recommended' | 'all')}>
            <TabsList className="mb-4">
              <TabsTrigger value="recommended">Recomendados</TabsTrigger>
              <TabsTrigger value="all">Todos los Tipos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(PERIODIZATION_CONFIGS)
                  .filter(type => {
                    const config = PERIODIZATION_CONFIGS[type as PeriodizationType]
                    return (
                      config.recommendedFor.includes(trainingLevel) ||
                      config.bestSuitedGoals.includes(trainingGoal)
                    )
                  })
                  .map(type => renderPeriodizationCard(type as PeriodizationType))
                }
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(PERIODIZATION_CONFIGS).map(type => 
                  renderPeriodizationCard(type as PeriodizationType)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card3DContent>
      </Card3D>
      
      <div className="flex justify-end space-x-2">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D 
          onClick={createProgram}
          disabled={!selectedType || isCreating}
        >
          {isCreating ? (
            <>Creando...</>
          ) : (
            <>
              Crear Programa
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button3D>
      </div>
      
      {renderPeriodizationDetails()}
    </div>
  )
}

// Funciones auxiliares

function getTrainingLevelName(level: TrainingLevel): string {
  switch (level) {
    case 'intermediate': return 'Intermedio'
    case 'advanced': return 'Avanzado'
    case 'elite': return 'Elite'
    default: return level
  }
}

function getTrainingGoalName(goal: TrainingGoal): string {
  switch (goal) {
    case 'hypertrophy': return 'Hipertrofia'
    case 'strength': return 'Fuerza'
    case 'power': return 'Potencia'
    case 'endurance': return 'Resistencia'
    case 'fat_loss': return 'Pérdida de Grasa'
    case 'maintenance': return 'Mantenimiento'
    case 'general_fitness': return 'Fitness General'
    default: return goal
  }
}

function getPhaseDisplayName(phase: string): string {
  switch (phase) {
    case 'hypertrophy': return 'Hipertrofia'
    case 'strength': return 'Fuerza'
    case 'power': return 'Potencia'
    case 'endurance': return 'Resistencia'
    case 'deload': return 'Descarga'
    default: return phase
  }
}

function getPeriodizationPatternName(pattern: string): string {
  switch (pattern) {
    case 'ascending': return 'Ascendente'
    case 'descending': return 'Descendente'
    case 'wave': return 'Ondulante'
    case 'step': return 'Escalonado'
    case 'constant': return 'Constante'
    default: return pattern
  }
}
