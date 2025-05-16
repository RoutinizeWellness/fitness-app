"use client"

import { useState } from "react"
import {
  Dumbbell, ChevronDown, ChevronUp, 
  ArrowRight, Check, X, Info,
  Target, Shuffle, Filter, Search,
  BarChart3, Layers, Zap
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  ExerciseData, 
  getAlternativeExercises 
} from "@/lib/exercise-library"

interface AdvancedExerciseAlternativesProps {
  exercise: ExerciseData
  onSelectAlternative: (alternativeExercise: ExerciseData) => void
}

export function AdvancedExerciseAlternatives({
  exercise,
  onSelectAlternative
}: AdvancedExerciseAlternativesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<ExerciseData | null>(null)
  const [showAlternativeDialog, setShowAlternativeDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Obtener ejercicios alternativos
  const alternativeExercises = getAlternativeExercises(exercise.id)
  
  // Filtrar por búsqueda
  const filteredAlternatives = searchQuery 
    ? alternativeExercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.secondaryMuscleGroups.some(group => 
          group.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : alternativeExercises
  
  // Agrupar alternativas por tipo
  const groupedAlternatives = filteredAlternatives.reduce((acc, alt) => {
    // Determinar el tipo basado en el grupo muscular primario y dificultad
    let type = alt.primaryMuscleGroup === exercise.primaryMuscleGroup 
      ? 'same_muscle' 
      : 'different_muscle'
    
    if (alt.difficulty !== exercise.difficulty) {
      type = alt.difficulty === 'beginner' 
        ? 'easier' 
        : 'harder'
    }
    
    if (!acc[type]) {
      acc[type] = []
    }
    
    acc[type].push(alt)
    return acc
  }, {} as Record<string, ExerciseData[]>)
  
  // Traducir los tipos de alternativas
  const typeLabels: Record<string, string> = {
    'same_muscle': 'Mismo Músculo',
    'different_muscle': 'Músculos Relacionados',
    'easier': 'Más Fáciles',
    'harder': 'Más Difíciles'
  }
  
  // Seleccionar una alternativa
  const handleSelectAlternative = (alternative: ExerciseData) => {
    setSelectedAlternative(alternative)
    setShowAlternativeDialog(true)
  }
  
  // Confirmar la selección de alternativa
  const confirmAlternativeSelection = () => {
    if (selectedAlternative) {
      onSelectAlternative(selectedAlternative)
      setShowAlternativeDialog(false)
    }
  }
  
  // Si no hay alternativas, mostrar un mensaje
  if (alternativeExercises.length === 0) {
    return (
      <Card3D className="bg-muted/50">
        <Card3DContent className="p-4">
          <div className="flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <p className="text-sm">No hay alternativas disponibles para este ejercicio.</p>
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
              <Shuffle className="h-5 w-5 mr-2 text-purple-500" />
              <Card3DTitle>Ejercicios Alternativos</Card3DTitle>
              <Badge className="ml-2">{alternativeExercises.length}</Badge>
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
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alternativas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {Object.keys(groupedAlternatives).length > 0 ? (
              <Tabs defaultValue={Object.keys(groupedAlternatives)[0] || 'same_muscle'}>
                <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Object.keys(groupedAlternatives).length}, 1fr)` }}>
                  {Object.keys(groupedAlternatives).map(type => (
                    <TabsTrigger key={type} value={type}>
                      {typeLabels[type] || type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(groupedAlternatives).map(([type, alternatives]) => (
                  <TabsContent key={type} value={type} className="mt-4 space-y-3">
                    {alternatives.map((alternative) => (
                      <div 
                        key={alternative.id}
                        className="flex justify-between items-start p-3 rounded-md border bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div>
                          <div className="font-medium flex items-center">
                            {alternative.name}
                            <Badge 
                              variant={alternative.difficulty === 'beginner' ? 'secondary' : 
                                      alternative.difficulty === 'advanced' ? 'destructive' : 'outline'}
                              className="ml-2"
                            >
                              {alternative.difficulty}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="flex items-center text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {alternative.primaryMuscleGroup.replace('_', ' ')}
                            </Badge>
                            {alternative.secondaryMuscleGroups.slice(0, 2).map((group, i) => (
                              <Badge key={i} variant="outline" className="flex items-center text-xs opacity-70">
                                {group.replace('_', ' ')}
                              </Badge>
                            ))}
                            {alternative.secondaryMuscleGroups.length > 2 && (
                              <Badge variant="outline" className="text-xs opacity-70">
                                +{alternative.secondaryMuscleGroups.length - 2} más
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Dumbbell className="h-3 w-3 mr-1" />
                            {alternative.equipment.slice(0, 2).join(', ')}
                            {alternative.equipment.length > 2 && ', ...'}
                          </div>
                        </div>
                        <Button3D 
                          size="sm"
                          onClick={() => handleSelectAlternative(alternative)}
                          className="ml-2 flex-shrink-0"
                        >
                          Seleccionar
                        </Button3D>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>No se encontraron alternativas con "{searchQuery}"</p>
                <Button3D 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Limpiar búsqueda
                </Button3D>
              </div>
            )}
          </Card3DContent>
        )}
      </Card3D>
      
      <Dialog open={showAlternativeDialog} onOpenChange={setShowAlternativeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alternativa</DialogTitle>
            <DialogDescription>
              ¿Quieres reemplazar {exercise.name} por esta alternativa?
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlternative && (
            <div className="py-4">
              <div className="font-medium text-lg">{selectedAlternative.name}</div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Grupos musculares:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    <Badge variant="default">
                      {selectedAlternative.primaryMuscleGroup.replace('_', ' ')}
                    </Badge>
                    {selectedAlternative.secondaryMuscleGroups.map((group, i) => (
                      <Badge key={i} variant="outline">
                        {group.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Dificultad:</span>
                  <Badge 
                    variant={selectedAlternative.difficulty === 'beginner' ? 'secondary' : 
                            selectedAlternative.difficulty === 'advanced' ? 'destructive' : 'outline'}
                    className="ml-2"
                  >
                    {selectedAlternative.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">Equipamiento:</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {selectedAlternative.equipment.map((eq, i) => (
                      <Badge key={i} variant="outline">
                        {eq.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-indigo-500" />
                  <span className="font-medium">Tipo:</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedAlternative.isCompound ? 'Compuesto' : 'Aislamiento'}
                  </Badge>
                </div>
                
                {selectedAlternative.mechanics && (
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="font-medium">Mecánica:</span>
                    <Badge variant="outline" className="ml-2">
                      {selectedAlternative.mechanics}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center mb-2">
                  <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Comparación con {exercise.name}:</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  {selectedAlternative.primaryMuscleGroup === exercise.primaryMuscleGroup ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      Mismo grupo muscular principal
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <Info className="h-4 w-4 mr-1" />
                      Diferente grupo muscular principal
                    </div>
                  )}
                  
                  {selectedAlternative.isCompound === exercise.isCompound ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      Mismo tipo de ejercicio ({selectedAlternative.isCompound ? 'compuesto' : 'aislamiento'})
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <Info className="h-4 w-4 mr-1" />
                      Diferente tipo de ejercicio
                    </div>
                  )}
                  
                  {selectedAlternative.difficulty === exercise.difficulty ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      Misma dificultad
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <Info className="h-4 w-4 mr-1" />
                      {selectedAlternative.difficulty === 'beginner' ? 'Más fácil' : 
                       selectedAlternative.difficulty === 'advanced' ? 'Más difícil' : 
                       'Dificultad diferente'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAlternativeDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button3D>
            <Button3D onClick={confirmAlternativeSelection}>
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
