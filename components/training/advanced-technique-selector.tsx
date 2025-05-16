import React, { useState } from "react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Check,
  AlertTriangle,
  Lightbulb
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
import { ExerciseData } from "@/lib/exercise-library"
import { ADVANCED_TECHNIQUES, TechniqueDetails } from "@/lib/advanced-techniques-service"

interface AdvancedTechniqueSelectorProps {
  exercise: ExerciseData
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  onSelectTechnique: (techniqueId: string) => void
}

export function AdvancedTechniqueSelector({
  exercise,
  userLevel,
  onSelectTechnique
}: AdvancedTechniqueSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null)
  const [showTechniqueDialog, setShowTechniqueDialog] = useState(false)
  
  // Filtrar técnicas adecuadas para el ejercicio y nivel del usuario
  const suitableTechniques = Object.entries(ADVANCED_TECHNIQUES)
    .filter(([id, technique]) => {
      // Verificar si la técnica es adecuada para el tipo de ejercicio
      const isExerciseSuitable = technique.suitableExercises.some(type => {
        if (type === 'compound' && exercise.isCompound) return true;
        if (type === 'isolation' && !exercise.isCompound) return true;
        if (type === exercise.category) return true;
        if (type === exercise.mechanics) return true;
        if (type === 'all') return true;
        return false;
      });
      
      // Verificar si el nivel del usuario es adecuado
      const isLevelSuitable = 
        (technique.difficulty === 'intermediate' && ['intermediate', 'advanced', 'elite'].includes(userLevel)) ||
        (technique.difficulty === 'advanced' && ['advanced', 'elite'].includes(userLevel)) ||
        (technique.difficulty === 'elite' && userLevel === 'elite');
      
      return isExerciseSuitable && isLevelSuitable;
    });
  
  // Si no hay técnicas adecuadas, mostrar mensaje
  if (suitableTechniques.length === 0) {
    return (
      <Card3D className="bg-muted/50 mb-4">
        <Card3DContent className="p-4">
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <p className="text-sm">No hay técnicas avanzadas disponibles para este ejercicio con tu nivel actual.</p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Agrupar técnicas por categoría
  const techniquesByCategory: Record<string, [string, TechniqueDetails][]> = {};
  suitableTechniques.forEach(technique => {
    const category = technique[1].category;
    if (!techniquesByCategory[category]) {
      techniquesByCategory[category] = [];
    }
    techniquesByCategory[category].push(technique);
  });
  
  // Traducir categorías
  const categoryLabels: Record<string, string> = {
    'intensity': 'Intensidad',
    'volume': 'Volumen',
    'tempo': 'Tempo',
    'mechanical': 'Mecánica',
    'metabolic': 'Metabólica',
    'specialized': 'Especializada'
  };
  
  // Seleccionar una técnica
  const handleSelectTechnique = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    setShowTechniqueDialog(true);
  };
  
  // Confirmar la selección de técnica
  const confirmTechniqueSelection = () => {
    if (selectedTechnique) {
      onSelectTechnique(selectedTechnique);
      setShowTechniqueDialog(false);
    }
  };
  
  return (
    <>
      <Card3D className="mb-4">
        <Card3DContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              <h3 className="text-base font-medium">Técnicas Avanzadas</h3>
            </div>
            <Button3D 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button3D>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-4">
              {Object.entries(techniquesByCategory).map(([category, techniques]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium mb-2">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {techniques.map(([id, technique]) => (
                      <div 
                        key={id} 
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectTechnique(id)}
                      >
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{technique.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${
                                technique.difficulty === 'intermediate' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                technique.difficulty === 'advanced' ? 'bg-purple-100 dark:bg-purple-900/20' :
                                'bg-red-100 dark:bg-red-900/20'
                              }`}
                            >
                              {technique.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {technique.description}
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card3DContent>
      </Card3D>
      
      {/* Diálogo de detalles de técnica */}
      {selectedTechnique && (
        <Dialog open={showTechniqueDialog} onOpenChange={setShowTechniqueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ADVANCED_TECHNIQUES[selectedTechnique].name}</DialogTitle>
              <DialogDescription>
                {ADVANCED_TECHNIQUES[selectedTechnique].description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Implementación */}
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                  Implementación
                </h4>
                <p className="text-sm text-muted-foreground">
                  {ADVANCED_TECHNIQUES[selectedTechnique].implementationNotes}
                </p>
              </div>
              
              {/* Beneficios */}
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Beneficios
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {ADVANCED_TECHNIQUES[selectedTechnique].benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Precauciones */}
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  Precauciones
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {ADVANCED_TECHNIQUES[selectedTechnique].cautions.map((caution, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{caution}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recomendaciones */}
              <div className="grid grid-cols-2 gap-4">
                {ADVANCED_TECHNIQUES[selectedTechnique].recommendedReps && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Repeticiones</h4>
                    <p className="text-sm">
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedReps?.[0]}-
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedReps?.[1]}
                    </p>
                  </div>
                )}
                
                {ADVANCED_TECHNIQUES[selectedTechnique].recommendedSets && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Series</h4>
                    <p className="text-sm">
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedSets?.[0]}-
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedSets?.[1]}
                    </p>
                  </div>
                )}
                
                {ADVANCED_TECHNIQUES[selectedTechnique].recommendedRir && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">RIR</h4>
                    <p className="text-sm">
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedRir?.[0]}-
                      {ADVANCED_TECHNIQUES[selectedTechnique].recommendedRir?.[1]}
                    </p>
                  </div>
                )}
                
                {ADVANCED_TECHNIQUES[selectedTechnique].frequencyPerWeek && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Frecuencia</h4>
                    <p className="text-sm">
                      {ADVANCED_TECHNIQUES[selectedTechnique].frequencyPerWeek}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button3D variant="outline" onClick={() => setShowTechniqueDialog(false)}>
                Cancelar
              </Button3D>
              <Button3D onClick={confirmTechniqueSelection}>
                Aplicar Técnica
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
