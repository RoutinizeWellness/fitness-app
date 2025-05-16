"use client"

import { useState } from "react"
import {
  Zap, ChevronDown, ChevronUp, 
  Check, X, Info, AlertTriangle,
  Flame, Battery, BarChart3
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { 
  AdvancedTechnique,
  ADVANCED_TECHNIQUES,
  ExerciseType,
  TrainingGoal,
  isTechniqueApplicable
} from "@/lib/bodybuilding-science"

interface AdvancedTrainingTechniquesProps {
  exerciseType: ExerciseType
  goal: TrainingGoal
  selectedTechniques: string[]
  onSelectTechniques: (techniques: string[]) => void
}

export function AdvancedTrainingTechniques({
  exerciseType,
  goal,
  selectedTechniques,
  onSelectTechniques
}: AdvancedTrainingTechniquesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTechniqueDialog, setShowTechniqueDialog] = useState(false)
  const [selectedTechnique, setSelectedTechnique] = useState<AdvancedTechnique | null>(null)
  
  // Filtrar técnicas aplicables
  const applicableTechniques = ADVANCED_TECHNIQUES.filter(technique => 
    isTechniqueApplicable(technique.name, exerciseType, goal)
  )
  
  // Agrupar técnicas por impacto de fatiga
  const groupedTechniques = ADVANCED_TECHNIQUES.reduce((acc, technique) => {
    let type = 'high_fatigue'
    
    if (technique.fatigueImpact <= 5) {
      type = 'low_fatigue'
    } else if (technique.fatigueImpact <= 7) {
      type = 'medium_fatigue'
    }
    
    if (!acc[type]) {
      acc[type] = []
    }
    
    acc[type].push(technique)
    return acc
  }, {} as Record<string, AdvancedTechnique[]>)
  
  // Traducir los tipos de técnicas
  const typeLabels: Record<string, string> = {
    'low_fatigue': 'Fatiga Baja',
    'medium_fatigue': 'Fatiga Media',
    'high_fatigue': 'Fatiga Alta'
  }
  
  // Manejar la selección de una técnica
  const handleToggleTechnique = (technique: AdvancedTechnique) => {
    const isSelected = selectedTechniques.includes(technique.name)
    
    if (isSelected) {
      // Deseleccionar la técnica
      onSelectTechniques(selectedTechniques.filter(t => t !== technique.name))
    } else {
      // Verificar si es aplicable
      if (isTechniqueApplicable(technique.name, exerciseType, goal)) {
        // Seleccionar la técnica
        onSelectTechniques([...selectedTechniques, technique.name])
      } else {
        // Mostrar diálogo de advertencia
        setSelectedTechnique(technique)
        setShowTechniqueDialog(true)
      }
    }
  }
  
  // Forzar la selección de una técnica no recomendada
  const forceSelectTechnique = () => {
    if (selectedTechnique) {
      onSelectTechniques([...selectedTechniques, selectedTechnique.name])
      setShowTechniqueDialog(false)
    }
  }
  
  // Renderizar el indicador de fatiga
  const renderFatigueIndicator = (level: number) => {
    if (level <= 5) {
      return <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">Fatiga Baja</Badge>
    } else if (level <= 7) {
      return <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">Fatiga Media</Badge>
    } else {
      return <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400">Fatiga Alta</Badge>
    }
  }
  
  return (
    <>
      <Card3D>
        <Card3DHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              <Card3DTitle>Técnicas Avanzadas</Card3DTitle>
              <Badge className="ml-2">{applicableTechniques.length} recomendadas</Badge>
            </div>
            <Button3D 
              variant="ghost" 
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button3D>
          </div>
        </Card3DHeader>
        
        {isExpanded && (
          <Card3DContent className="pt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Selecciona las técnicas avanzadas que quieres aplicar a este ejercicio.
              Las técnicas recomendadas están basadas en tu objetivo ({goal}) y tipo de ejercicio ({exerciseType}).
            </div>
            
            <Tabs defaultValue="recommended">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommended">
                {applicableTechniques.length > 0 ? (
                  <div className="space-y-3">
                    {applicableTechniques.map((technique) => (
                      <div 
                        key={technique.name}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          selectedTechniques.includes(technique.name) 
                            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' 
                            : 'bg-card/50 border-border'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {technique.name}
                            {renderFatigueIndicator(technique.fatigueImpact)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {technique.description}
                          </p>
                        </div>
                        <Switch
                          checked={selectedTechniques.includes(technique.name)}
                          onCheckedChange={() => handleToggleTechnique(technique)}
                          className="ml-4"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mb-2 opacity-50" />
                    <p>No hay técnicas recomendadas para este tipo de ejercicio y objetivo.</p>
                    <p className="text-sm mt-1">Prueba con la pestaña "Todas" para ver todas las técnicas disponibles.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all">
                <Tabs defaultValue={Object.keys(groupedTechniques)[0] || 'low_fatigue'}>
                  <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Object.keys(groupedTechniques).length}, 1fr)` }}>
                    {Object.keys(groupedTechniques).map(type => (
                      <TabsTrigger key={type} value={type}>
                        {typeLabels[type] || type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.entries(groupedTechniques).map(([type, techniques]) => (
                    <TabsContent key={type} value={type} className="mt-4 space-y-3">
                      {techniques.map((technique) => {
                        const isApplicable = isTechniqueApplicable(technique.name, exerciseType, goal)
                        
                        return (
                          <div 
                            key={technique.name}
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              selectedTechniques.includes(technique.name) 
                                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' 
                                : !isApplicable
                                  ? 'bg-muted/30 border-muted'
                                  : 'bg-card/50 border-border'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-medium flex items-center">
                                {technique.name}
                                {!isApplicable && (
                                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                                    No recomendada
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {technique.description}
                              </p>
                              <div className="flex items-center mt-2 space-x-4 text-xs">
                                <div className="flex items-center">
                                  <Flame className="h-3 w-3 mr-1 text-orange-500" />
                                  <span>Fatiga: {technique.fatigueImpact}/10</span>
                                </div>
                                <div className="flex items-center">
                                  <Battery className="h-3 w-3 mr-1 text-blue-500" />
                                  <span>Recuperación: {technique.recoveryRequirement}/10</span>
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={selectedTechniques.includes(technique.name)}
                              onCheckedChange={() => handleToggleTechnique(technique)}
                              className="ml-4"
                              disabled={!isApplicable && !selectedTechniques.includes(technique.name)}
                            />
                          </div>
                        )
                      })}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            </Tabs>
            
            {selectedTechniques.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
                <div className="font-medium mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  Técnicas seleccionadas:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTechniques.map(technique => (
                    <Badge 
                      key={technique} 
                      variant="outline"
                      className="bg-white dark:bg-black flex items-center"
                    >
                      {technique}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => onSelectTechniques(selectedTechniques.filter(t => t !== technique))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card3DContent>
        )}
      </Card3D>
      
      <Dialog open={showTechniqueDialog} onOpenChange={setShowTechniqueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Técnica No Recomendada
            </DialogTitle>
            <DialogDescription>
              Esta técnica no es recomendada para este tipo de ejercicio o objetivo.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTechnique && (
            <div className="py-4">
              <div className="font-medium text-lg">{selectedTechnique.name}</div>
              <p className="text-muted-foreground mt-1">{selectedTechnique.description}</p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Objetivos recomendados:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {selectedTechnique.applicableGoals.map((g, i) => (
                      <Badge key={i} variant={g === goal ? 'default' : 'outline'}>
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="font-medium">Tipos de ejercicio recomendados:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {selectedTechnique.recommendedExerciseTypes.map((t, i) => (
                      <Badge key={i} variant={t === exerciseType ? 'default' : 'outline'}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Flame className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Impacto de fatiga:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedTechnique.fatigueImpact}/10
                  </Badge>
                </div>
                
                <div className="flex items-center">
                  <Battery className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Requisito de recuperación:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedTechnique.recoveryRequirement}/10
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md text-amber-700 dark:text-amber-300">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Advertencia:</p>
                    <p className="text-sm mt-1">
                      Esta técnica no es ideal para {exerciseType === 'compound' ? 'ejercicios compuestos' : 'ejercicios de aislamiento'} 
                      con objetivo de {goal}. Podría aumentar el riesgo de lesión o reducir la efectividad del entrenamiento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowTechniqueDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button3D>
            <Button3D 
              variant="default"
              onClick={forceSelectTechnique}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Usar de todos modos
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
