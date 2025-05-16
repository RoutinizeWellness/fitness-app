"use client"

import { useState, useEffect } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { 
  Search, 
  X, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Zap, 
  Target, 
  BarChart, 
  Users, 
  ChevronRight, 
  Filter, 
  Star, 
  Info 
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ProgramTemplate,
  TrainingLevel,
  TrainingGoal,
  TrainingType
} from "@/lib/types/training-program"
import { getProgramTemplates } from "@/lib/training-program-service"
import { useToast } from "@/components/ui/use-toast"

// Plantillas de ejemplo para demostración
const SAMPLE_TEMPLATES: ProgramTemplate[] = [
  {
    id: "template-1",
    name: "Programa de fuerza 5x5",
    description: "Programa clásico de fuerza basado en 5 series de 5 repeticiones con ejercicios compuestos",
    level: "intermediate",
    type: "full_body",
    duration: 8,
    frequency: 3,
    goal: "strength",
    structure: "mesocycle",
    hasDeload: true,
    deloadFrequency: 4,
    sampleExercises: ["Sentadilla", "Press de banca", "Peso muerto", "Press militar", "Remo con barra"],
    imageUrl: "/images/templates/strength-5x5.jpg",
    popularity: 9,
    createdBy: "system",
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "template-2",
    name: "Hipertrofia Push/Pull/Legs",
    description: "Programa de hipertrofia dividido en días de empuje, tirón y piernas",
    level: "intermediate",
    type: "push_pull_legs",
    duration: 12,
    frequency: 6,
    goal: "hypertrophy",
    structure: "mesocycle",
    hasDeload: true,
    deloadFrequency: 6,
    sampleExercises: ["Press de banca", "Press militar", "Fondos", "Jalones al pecho", "Remo", "Sentadilla", "Peso muerto"],
    imageUrl: "/images/templates/ppl-hypertrophy.jpg",
    popularity: 10,
    createdBy: "system",
    createdAt: "2023-01-02T00:00:00Z"
  },
  {
    id: "template-3",
    name: "Principiante Full Body",
    description: "Programa para principiantes con entrenamiento de cuerpo completo 3 veces por semana",
    level: "beginner",
    type: "full_body",
    duration: 8,
    frequency: 3,
    goal: "general_fitness",
    structure: "simple",
    hasDeload: false,
    sampleExercises: ["Sentadilla", "Press de banca", "Remo", "Press militar", "Curl de bíceps", "Extensiones de tríceps"],
    imageUrl: "/images/templates/beginner-full-body.jpg",
    popularity: 8,
    createdBy: "system",
    createdAt: "2023-01-03T00:00:00Z"
  },
  {
    id: "template-4",
    name: "Upper/Lower 4 días",
    description: "Programa dividido en tren superior e inferior para 4 días a la semana",
    level: "intermediate",
    type: "upper_lower",
    duration: 12,
    frequency: 4,
    goal: "hypertrophy",
    structure: "mesocycle",
    hasDeload: true,
    deloadFrequency: 6,
    sampleExercises: ["Press de banca", "Remo", "Press militar", "Dominadas", "Sentadilla", "Peso muerto", "Extensiones de cuádriceps"],
    imageUrl: "/images/templates/upper-lower.jpg",
    popularity: 7,
    createdBy: "system",
    createdAt: "2023-01-04T00:00:00Z"
  },
  {
    id: "template-5",
    name: "Pérdida de peso HIIT",
    description: "Programa de alta intensidad enfocado en pérdida de peso y acondicionamiento",
    level: "intermediate",
    type: "full_body",
    duration: 8,
    frequency: 5,
    goal: "weight_loss",
    structure: "simple",
    hasDeload: false,
    sampleExercises: ["Burpees", "Mountain climbers", "Jumping jacks", "Sentadillas", "Flexiones", "Kettlebell swings"],
    imageUrl: "/images/templates/hiit-weight-loss.jpg",
    popularity: 8,
    createdBy: "system",
    createdAt: "2023-01-05T00:00:00Z"
  },
  {
    id: "template-6",
    name: "Powerlifting avanzado",
    description: "Programa de powerlifting para atletas avanzados enfocado en los tres grandes levantamientos",
    level: "advanced",
    type: "custom",
    duration: 16,
    frequency: 4,
    goal: "strength",
    structure: "macrocycle",
    hasDeload: true,
    deloadFrequency: 4,
    sampleExercises: ["Sentadilla", "Press de banca", "Peso muerto", "Sentadilla frontal", "Press de banca inclinado", "Peso muerto sumo"],
    imageUrl: "/images/templates/advanced-powerlifting.jpg",
    popularity: 6,
    createdBy: "system",
    createdAt: "2023-01-06T00:00:00Z"
  }
]

interface ProgramTemplateSelectorProps {
  onSelect: (template: ProgramTemplate) => void
  onCancel: () => void
}

export function ProgramTemplateSelector({
  onSelect,
  onCancel
}: ProgramTemplateSelectorProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<ProgramTemplate[]>(SAMPLE_TEMPLATES)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null)
  
  // Cargar plantillas
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await getProgramTemplates()
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setTemplates(data)
        } else {
          // Si no hay datos, usar las plantillas de ejemplo
          setTemplates(SAMPLE_TEMPLATES)
        }
      } catch (error) {
        console.error("Error al cargar plantillas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas. Usando datos de ejemplo.",
          variant: "destructive"
        })
        // Usar plantillas de ejemplo en caso de error
        setTemplates(SAMPLE_TEMPLATES)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTemplates()
  }, [toast])
  
  // Filtrar plantillas
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = selectedLevel === null || template.level === selectedLevel
    const matchesGoal = selectedGoal === null || template.goal === selectedGoal
    const matchesType = selectedType === null || template.type === selectedType
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "beginner" && template.level === "beginner") ||
      (activeTab === "intermediate" && template.level === "intermediate") ||
      (activeTab === "advanced" && template.level === "advanced") ||
      (activeTab === "strength" && template.goal === "strength") ||
      (activeTab === "hypertrophy" && template.goal === "hypertrophy") ||
      (activeTab === "weight_loss" && template.goal === "weight_loss")
    
    return matchesSearch && matchesLevel && matchesGoal && matchesType && matchesTab
  })
  
  // Ordenar plantillas por popularidad
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.popularity - a.popularity)
  
  // Seleccionar una plantilla
  const handleSelectTemplate = (template: ProgramTemplate) => {
    setSelectedTemplate(template)
  }
  
  // Confirmar selección
  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
    }
  }
  
  // Renderizar detalles de la plantilla seleccionada
  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
          </div>
          <Button3D variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
            <X className="h-5 w-5" />
          </Button3D>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium mb-1">
              <Target className="h-4 w-4 mr-2 text-primary" />
              Nivel
            </div>
            <div className="text-lg font-semibold capitalize">
              {selectedTemplate.level === 'beginner' ? 'Principiante' :
               selectedTemplate.level === 'intermediate' ? 'Intermedio' :
               selectedTemplate.level === 'advanced' ? 'Avanzado' : selectedTemplate.level}
            </div>
          </div>
          
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium mb-1">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              Objetivo
            </div>
            <div className="text-lg font-semibold capitalize">
              {selectedTemplate.goal === 'strength' ? 'Fuerza' :
               selectedTemplate.goal === 'hypertrophy' ? 'Hipertrofia' :
               selectedTemplate.goal === 'endurance' ? 'Resistencia' :
               selectedTemplate.goal === 'weight_loss' ? 'Pérdida de peso' :
               selectedTemplate.goal === 'general_fitness' ? 'Fitness general' : selectedTemplate.goal}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium mb-1">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              Duración
            </div>
            <div className="text-lg font-semibold">{selectedTemplate.duration} semanas</div>
          </div>
          
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium mb-1">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Frecuencia
            </div>
            <div className="text-lg font-semibold">{selectedTemplate.frequency} días/semana</div>
          </div>
          
          <div className="bg-accent/10 p-3 rounded-lg">
            <div className="flex items-center text-sm font-medium mb-1">
              <BarChart className="h-4 w-4 mr-2 text-primary" />
              Estructura
            </div>
            <div className="text-lg font-semibold capitalize">
              {selectedTemplate.structure === 'mesocycle' ? 'Mesociclo' :
               selectedTemplate.structure === 'macrocycle' ? 'Macrociclo' :
               selectedTemplate.structure === 'simple' ? 'Simple' : selectedTemplate.structure}
            </div>
          </div>
        </div>
        
        <div className="bg-accent/10 p-3 rounded-lg">
          <div className="flex items-center text-sm font-medium mb-2">
            <Dumbbell className="h-4 w-4 mr-2 text-primary" />
            Ejercicios incluidos
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTemplate.sampleExercises.map((exercise, index) => (
              <Badge key={index} variant="outline" className="bg-background">
                {exercise}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">Popularidad: {selectedTemplate.popularity}/10</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Creado: {new Date(selectedTemplate.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button3D variant="outline" onClick={() => setSelectedTemplate(null)}>
            Volver
          </Button3D>
          <Button3D onClick={handleConfirmSelection}>
            Usar esta plantilla
          </Button3D>
        </div>
      </div>
    )
  }
  
  // Renderizar lista de plantillas
  const renderTemplatesList = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-2.5"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button3D variant="outline" size="icon" onClick={() => {
                setSelectedLevel(null)
                setSelectedGoal(null)
                setSelectedType(null)
              }}>
                <Filter className="h-4 w-4" />
              </Button3D>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpiar filtros</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedLevel && (
          <Badge variant="outline" className="bg-primary/10 flex items-center gap-1">
            Nivel: {selectedLevel === 'beginner' ? 'Principiante' :
                   selectedLevel === 'intermediate' ? 'Intermedio' :
                   selectedLevel === 'advanced' ? 'Avanzado' : selectedLevel}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedLevel(null)} />
          </Badge>
        )}
        
        {selectedGoal && (
          <Badge variant="outline" className="bg-primary/10 flex items-center gap-1">
            Objetivo: {selectedGoal === 'strength' ? 'Fuerza' :
                     selectedGoal === 'hypertrophy' ? 'Hipertrofia' :
                     selectedGoal === 'endurance' ? 'Resistencia' :
                     selectedGoal === 'weight_loss' ? 'Pérdida de peso' :
                     selectedGoal === 'general_fitness' ? 'Fitness general' : selectedGoal}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedGoal(null)} />
          </Badge>
        )}
        
        {selectedType && (
          <Badge variant="outline" className="bg-primary/10 flex items-center gap-1">
            Tipo: {selectedType === 'full_body' ? 'Cuerpo completo' :
                 selectedType === 'upper_lower' ? 'Superior/Inferior' :
                 selectedType === 'push_pull_legs' ? 'Push/Pull/Legs' :
                 selectedType === 'body_part_split' ? 'Split por grupos' :
                 selectedType === 'custom' ? 'Personalizado' : selectedType}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedType(null)} />
          </Badge>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="beginner">Principiante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          <TabsTrigger value="strength">Fuerza</TabsTrigger>
          <TabsTrigger value="hypertrophy">Hipertrofia</TabsTrigger>
          <TabsTrigger value="weight_loss">Pérdida de peso</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {sortedTemplates.map(template => (
            <Card3D
              key={template.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-primary/5">
                      {template.level === 'beginner' ? 'Principiante' :
                       template.level === 'intermediate' ? 'Intermedio' :
                       template.level === 'advanced' ? 'Avanzado' : template.level}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-primary/5">
                      {template.goal === 'strength' ? 'Fuerza' :
                       template.goal === 'hypertrophy' ? 'Hipertrofia' :
                       template.goal === 'endurance' ? 'Resistencia' :
                       template.goal === 'weight_loss' ? 'Pérdida de peso' :
                       template.goal === 'general_fitness' ? 'Fitness general' : template.goal}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-primary/5">
                      {template.duration} semanas
                    </Badge>
                    
                    <Badge variant="outline" className="bg-primary/5">
                      {template.frequency} días/semana
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{template.popularity}/10</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card3D>
          ))}
          
          {sortedTemplates.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No se encontraron plantillas con los filtros seleccionados
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
      </DialogFooter>
    </div>
  )
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar plantilla de programa</DialogTitle>
          <DialogDescription>
            Elige una plantilla predefinida para crear tu programa de entrenamiento
          </DialogDescription>
        </DialogHeader>
        
        {selectedTemplate ? renderTemplateDetails() : renderTemplatesList()}
      </DialogContent>
    </Dialog>
  )
}
