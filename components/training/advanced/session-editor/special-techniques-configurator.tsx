"use client"

import { useState, useEffect } from "react"
import { 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowDown, 
  ArrowUp, 
  Filter,
  Clock,
  BarChart3,
  Dumbbell,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Info,
  Play,
  Pause,
  RotateCcw,
  Timer
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { SpecialTechnique } from "@/lib/types/advanced-periodization"

interface SpecialTechniquesConfiguratorProps {
  onSelectTechnique: (technique: SpecialTechnique) => void
  onSaveTemplate: (technique: SpecialTechnique) => void
  savedTemplates?: SpecialTechnique[]
}

// Tipos de técnicas especiales
type TechniqueType = 
  | 'rest_pause' 
  | 'drop_set' 
  | 'cluster_set' 
  | 'superset' 
  | 'giant_set' 
  | 'myo_reps' 
  | 'mechanical_drop_set'

// Configuraciones predeterminadas para cada tipo de técnica
const DEFAULT_CONFIGS: Record<TechniqueType, any> = {
  rest_pause: {
    initialReps: 8,
    miniSets: 3,
    restPeriod: 15, // segundos
    repReduction: 2
  },
  drop_set: {
    initialWeight: 100,
    drops: 3,
    weightReduction: 20, // porcentaje
    repsPerDrop: 8
  },
  cluster_set: {
    repsPerCluster: 3,
    clusters: 4,
    intraClusterRest: 15, // segundos
    interClusterRest: 90 // segundos
  },
  superset: {
    exercises: 2,
    restBetweenExercises: 0, // segundos
    restAfterSuperset: 90 // segundos
  },
  giant_set: {
    exercises: 4,
    restBetweenExercises: 0, // segundos
    restAfterGiantSet: 120 // segundos
  },
  myo_reps: {
    activationSet: 12,
    miniSets: 4,
    repsPerMiniSet: 5,
    restPeriod: 10 // segundos
  },
  mechanical_drop_set: {
    variations: 3,
    mechanicalAdvantageChange: 'decreasing', // 'decreasing' o 'increasing'
    restBetweenVariations: 10 // segundos
  }
}

// Información sobre cada técnica
const TECHNIQUE_INFO: Record<TechniqueType, { name: string, description: string, benefits: string[], icon: React.ReactNode }> = {
  rest_pause: {
    name: "Rest-Pause",
    description: "Realizar una serie hasta el fallo o cerca del fallo, descansar brevemente (10-20 segundos) y continuar con más repeticiones. Repetir este proceso varias veces.",
    benefits: [
      "Aumenta el tiempo bajo tensión",
      "Incrementa la fatiga metabólica",
      "Permite mayor volumen en menos tiempo"
    ],
    icon: <Pause className="h-5 w-5" />
  },
  drop_set: {
    name: "Series Descendentes",
    description: "Realizar una serie hasta el fallo o cerca del fallo, reducir inmediatamente el peso y continuar. Repetir este proceso varias veces sin descanso entre reducciones.",
    benefits: [
      "Maximiza la fatiga muscular",
      "Recluta fibras musculares adicionales",
      "Estimula la hipertrofia"
    ],
    icon: <ArrowDown className="h-5 w-5" />
  },
  cluster_set: {
    name: "Cluster Sets",
    description: "Dividir una serie en varios 'clusters' de pocas repeticiones con descansos muy breves entre ellos, permitiendo mantener alta intensidad.",
    benefits: [
      "Mantiene alta calidad de repeticiones",
      "Permite mayor volumen con cargas pesadas",
      "Mejora la fuerza y potencia"
    ],
    icon: <BarChart3 className="h-5 w-5" />
  },
  superset: {
    name: "Superseries",
    description: "Realizar dos ejercicios consecutivos sin descanso entre ellos. Pueden ser para el mismo grupo muscular (superserie compuesta) o grupos diferentes (superserie antagonista).",
    benefits: [
      "Ahorra tiempo de entrenamiento",
      "Aumenta la intensidad",
      "Mejora la eficiencia cardiovascular"
    ],
    icon: <Zap className="h-5 w-5" />
  },
  giant_set: {
    name: "Giant Sets",
    description: "Realizar 3-5 ejercicios consecutivos para el mismo grupo muscular sin descanso entre ellos.",
    benefits: [
      "Maximiza la fatiga muscular",
      "Ahorra tiempo de entrenamiento",
      "Aumenta el gasto calórico"
    ],
    icon: <Dumbbell className="h-5 w-5" />
  },
  myo_reps: {
    name: "Myo-Reps",
    description: "Realizar una serie de activación larga seguida de varias series cortas con descansos mínimos, manteniendo la tensión muscular.",
    benefits: [
      "Eficiente para hipertrofia",
      "Minimiza el tiempo de entrenamiento",
      "Maximiza la fatiga metabólica"
    ],
    icon: <RotateCcw className="h-5 w-5" />
  },
  mechanical_drop_set: {
    name: "Drop Set Mecánico",
    description: "Cambiar la mecánica o posición de un ejercicio para aprovechar diferentes ventajas mecánicas, sin reducir el peso.",
    benefits: [
      "No requiere cambiar pesos",
      "Fatiga completa del músculo",
      "Trabaja diferentes ángulos musculares"
    ],
    icon: <ChevronDown className="h-5 w-5" />
  }
}

export function SpecialTechniquesConfigurator({ 
  onSelectTechnique, 
  onSaveTemplate,
  savedTemplates = []
}: SpecialTechniquesConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<TechniqueType>('rest_pause')
  const [config, setConfig] = useState<any>(DEFAULT_CONFIGS.rest_pause)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  
  // Actualizar configuración al cambiar de pestaña
  useEffect(() => {
    setConfig(DEFAULT_CONFIGS[activeTab])
  }, [activeTab])
  
  // Manejar cambio en configuración
  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  // Aplicar técnica
  const handleApplyTechnique = () => {
    const technique: SpecialTechnique = {
      id: `technique-${Date.now()}`,
      name: TECHNIQUE_INFO[activeTab].name,
      description: TECHNIQUE_INFO[activeTab].description,
      parameters: {
        type: activeTab,
        ...config
      }
    }
    
    onSelectTechnique(technique)
    toast({
      title: "Técnica aplicada",
      description: `${technique.name} ha sido aplicada correctamente`
    })
  }
  
  // Guardar plantilla
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar un nombre para la plantilla",
        variant: "destructive"
      })
      return
    }
    
    const template: SpecialTechnique = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: TECHNIQUE_INFO[activeTab].description,
      parameters: {
        type: activeTab,
        ...config
      }
    }
    
    onSaveTemplate(template)
    setShowSaveDialog(false)
    setTemplateName('')
    
    toast({
      title: "Plantilla guardada",
      description: `La plantilla "${templateName}" ha sido guardada correctamente`
    })
  }
  
  // Cargar plantilla
  const handleLoadTemplate = (template: SpecialTechnique) => {
    if (template.parameters?.type) {
      setActiveTab(template.parameters.type as TechniqueType)
      setConfig(template.parameters)
      setShowTemplatesDialog(false)
      
      toast({
        title: "Plantilla cargada",
        description: `La plantilla "${template.name}" ha sido cargada correctamente`
      })
    }
  }
  
  // Renderizar configuración de Rest-Pause
  const renderRestPauseConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initialReps">Repeticiones iniciales</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="initialReps"
              min={1}
              max={20}
              step={1}
              value={[config.initialReps]}
              onValueChange={(value) => handleConfigChange('initialReps', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.initialReps}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="miniSets">Mini-series</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="miniSets"
              min={1}
              max={5}
              step={1}
              value={[config.miniSets]}
              onValueChange={(value) => handleConfigChange('miniSets', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.miniSets}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="restPeriod">Descanso entre mini-series (segundos)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="restPeriod"
              min={5}
              max={30}
              step={5}
              value={[config.restPeriod]}
              onValueChange={(value) => handleConfigChange('restPeriod', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.restPeriod}s</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="repReduction">Reducción de repeticiones por mini-serie</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="repReduction"
              min={0}
              max={5}
              step={1}
              value={[config.repReduction]}
              onValueChange={(value) => handleConfigChange('repReduction', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.repReduction}</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Renderizar configuración de Drop Set
  const renderDropSetConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="drops">Número de reducciones</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="drops"
              min={1}
              max={5}
              step={1}
              value={[config.drops]}
              onValueChange={(value) => handleConfigChange('drops', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.drops}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weightReduction">Reducción de peso por drop (%)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="weightReduction"
              min={5}
              max={50}
              step={5}
              value={[config.weightReduction]}
              onValueChange={(value) => handleConfigChange('weightReduction', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.weightReduction}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="repsPerDrop">Repeticiones por drop</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="repsPerDrop"
              min={1}
              max={15}
              step={1}
              value={[config.repsPerDrop]}
              onValueChange={(value) => handleConfigChange('repsPerDrop', value[0])}
              className="flex-1"
            />
            <span className="w-8 text-center">{config.repsPerDrop}</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Renderizar configuración actual según la técnica seleccionada
  const renderCurrentConfig = () => {
    switch (activeTab) {
      case 'rest_pause':
        return renderRestPauseConfig()
      case 'drop_set':
        return renderDropSetConfig()
      // Implementar configuraciones para otras técnicas según sea necesario
      default:
        return (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Configuración no disponible para esta técnica
            </p>
          </div>
        )
    }
  }
  
  // Renderizar visualización de la técnica
  const renderTechniqueVisualization = () => {
    switch (activeTab) {
      case 'rest_pause':
        return (
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Simulación de Rest-Pause</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary">Serie inicial</Badge>
                <span>{config.initialReps} repeticiones</span>
              </div>
              
              {Array.from({ length: config.miniSets }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Descanso de {config.restPeriod} segundos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Mini-serie {i + 1}</Badge>
                    <span>{Math.max(1, config.initialReps - (i + 1) * config.repReduction)} repeticiones</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'drop_set':
        return (
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <ArrowDown className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Simulación de Drop Set</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary">Serie inicial</Badge>
                <span>100% del peso, {config.repsPerDrop} repeticiones</span>
              </div>
              
              {Array.from({ length: config.drops }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Badge variant="outline">Drop {i + 1}</Badge>
                  <span>{100 - (i + 1) * config.weightReduction}% del peso, {config.repsPerDrop} repeticiones</span>
                </div>
              ))}
            </div>
          </div>
        )
      // Implementar visualizaciones para otras técnicas según sea necesario
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Técnicas Especiales</h2>
        
        <div className="flex space-x-2">
          <Button3D 
            variant="outline" 
            size="sm"
            onClick={() => setShowTemplatesDialog(true)}
            disabled={savedTemplates.length === 0}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Plantillas
          </Button3D>
          
          <Button3D 
            variant="outline" 
            size="sm"
            onClick={() => setShowSaveDialog(true)}
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button3D>
          
          <Button3D 
            size="sm"
            onClick={handleApplyTechnique}
          >
            <Play className="h-4 w-4 mr-1" />
            Aplicar
          </Button3D>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TechniqueType)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="rest_pause">Rest-Pause</TabsTrigger>
          <TabsTrigger value="drop_set">Drop Set</TabsTrigger>
          <TabsTrigger value="cluster_set">Cluster Set</TabsTrigger>
          <TabsTrigger value="superset">Superseries</TabsTrigger>
        </TabsList>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="giant_set">Giant Set</TabsTrigger>
          <TabsTrigger value="myo_reps">Myo-Reps</TabsTrigger>
          <TabsTrigger value="mechanical_drop_set">Drop Set Mecánico</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-2 gap-4">
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>
                  <div className="flex items-center space-x-2">
                    {TECHNIQUE_INFO[activeTab].icon}
                    <span>{TECHNIQUE_INFO[activeTab].name}</span>
                  </div>
                </Card3DTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="mb-2">{TECHNIQUE_INFO[activeTab].description}</p>
                        <p className="font-medium text-xs">Beneficios:</p>
                        <ul className="text-xs list-disc pl-4">
                          {TECHNIQUE_INFO[activeTab].benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card3DHeader>
            <Card3DContent>
              {renderCurrentConfig()}
            </Card3DContent>
          </Card3D>
          
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Previsualización</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              {renderTechniqueVisualization()}
            </Card3DContent>
          </Card3D>
        </div>
      </Tabs>
      
      {/* Diálogo para guardar plantilla */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Plantilla</DialogTitle>
            <DialogDescription>
              Guarda esta configuración como plantilla para usarla en el futuro
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nombre de la plantilla</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: Rest-Pause para hipertrofia"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSaveTemplate}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para cargar plantillas */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plantillas Guardadas</DialogTitle>
            <DialogDescription>
              Selecciona una plantilla para cargarla
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {savedTemplates.map(template => (
              <div 
                key={template.id}
                className="border rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => handleLoadTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  
                  <Badge variant="outline">
                    {TECHNIQUE_INFO[template.parameters?.type as TechniqueType]?.name || 'Técnica'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {savedTemplates.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No hay plantillas guardadas</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowTemplatesDialog(false)}>
              Cerrar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
