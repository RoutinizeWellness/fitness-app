"use client"

import { useState } from "react"
import {
  Dumbbell, ChevronDown, ChevronUp, 
  ArrowRight, Check, X, Info,
  Target, RotateCw, Filter
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
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
import { ExerciseData, ExerciseVariation } from "@/lib/exercise-library"

interface AdvancedExerciseVariantsProps {
  exercise: ExerciseData
  onSelectVariant: (exerciseName: string, variation: ExerciseVariation) => void
}

export function AdvancedExerciseVariants({
  exercise,
  onSelectVariant
}: AdvancedExerciseVariantsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation | null>(null)
  const [showVariationDialog, setShowVariationDialog] = useState(false)
  
  // Agrupar variaciones por tipo
  const groupedVariations = exercise.variations.reduce((acc, variation) => {
    // Determinar el tipo de variación basado en su nombre o descripción
    let type = 'other'
    
    if (variation.name.includes('Agarre') || variation.name.includes('Grip')) {
      type = 'grip'
    } else if (variation.name.includes('Inclinación') || variation.name.includes('Incline') || variation.name.includes('Decline')) {
      type = 'angle'
    } else if (variation.name.includes('Tempo') || variation.name.includes('Pausa')) {
      type = 'tempo'
    } else if (variation.equipment?.some(e => e.includes('machine') || e.includes('cable'))) {
      type = 'equipment'
    }
    
    if (!acc[type]) {
      acc[type] = []
    }
    
    acc[type].push(variation)
    return acc
  }, {} as Record<string, ExerciseVariation[]>)
  
  // Traducir los tipos de variación
  const typeLabels: Record<string, string> = {
    'grip': 'Agarre',
    'angle': 'Ángulo',
    'tempo': 'Tempo/Pausa',
    'equipment': 'Equipamiento',
    'other': 'Otras Variantes'
  }
  
  // Seleccionar una variación
  const handleSelectVariation = (variation: ExerciseVariation) => {
    setSelectedVariation(variation)
    setShowVariationDialog(true)
  }
  
  // Confirmar la selección de variación
  const confirmVariationSelection = () => {
    if (selectedVariation) {
      onSelectVariant(`${exercise.name} (${selectedVariation.name})`, selectedVariation)
      setShowVariationDialog(false)
    }
  }
  
  // Renderizar el indicador de dificultad
  const renderDifficultyIndicator = (modifier: number) => {
    if (modifier === 0) {
      return <Badge variant="outline" className="ml-2">Dificultad similar</Badge>
    } else if (modifier > 0) {
      return <Badge variant="destructive" className="ml-2">Más difícil (+{modifier})</Badge>
    } else {
      return <Badge variant="secondary" className="ml-2">Más fácil ({modifier})</Badge>
    }
  }
  
  // Si no hay variaciones, mostrar un mensaje
  if (exercise.variations.length === 0) {
    return (
      <Card3D className="bg-muted/50">
        <Card3DContent className="p-4">
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <p className="text-sm">No hay variantes disponibles para este ejercicio.</p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <>
      <Card3D>
        <Card3DHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <RotateCw className="h-5 w-5 mr-2 text-blue-500" />
              <Card3DTitle>Variantes del Ejercicio</Card3DTitle>
              <Badge className="ml-2">{exercise.variations.length}</Badge>
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
            <Tabs defaultValue={Object.keys(groupedVariations)[0] || 'other'}>
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Object.keys(groupedVariations).length}, 1fr)` }}>
                {Object.keys(groupedVariations).map(type => (
                  <TabsTrigger key={type} value={type}>
                    {typeLabels[type] || type}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(groupedVariations).map(([type, variations]) => (
                <TabsContent key={type} value={type} className="mt-4 space-y-3">
                  {variations.map((variation, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-start p-3 rounded-md border bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div>
                        <div className="font-medium flex items-center">
                          {variation.name}
                          {renderDifficultyIndicator(variation.difficultyModifier)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {variation.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {variation.targetEmphasis.map((target, i) => (
                            <Badge key={i} variant="outline" className="flex items-center text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {target.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button3D 
                        size="sm"
                        onClick={() => handleSelectVariation(variation)}
                        className="ml-2 flex-shrink-0"
                      >
                        Seleccionar
                      </Button3D>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </Card3DContent>
        )}
      </Card3D>
      
      <Dialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Variante</DialogTitle>
            <DialogDescription>
              ¿Quieres usar esta variante para el ejercicio actual?
            </DialogDescription>
          </DialogHeader>
          
          {selectedVariation && (
            <div className="py-4">
              <div className="font-medium text-lg">{exercise.name} ({selectedVariation.name})</div>
              <p className="text-muted-foreground mt-1">{selectedVariation.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Énfasis muscular:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {selectedVariation.targetEmphasis.map((target, i) => (
                      <Badge key={i} variant="outline">
                        {target.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Dificultad:</span>
                  <div className="ml-2">
                    {renderDifficultyIndicator(selectedVariation.difficultyModifier)}
                  </div>
                </div>
                
                {selectedVariation.equipment && (
                  <div className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Equipamiento:</span>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {selectedVariation.equipment.map((eq, i) => (
                        <Badge key={i} variant="outline">
                          {eq.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowVariationDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button3D>
            <Button3D onClick={confirmVariationSelection}>
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
