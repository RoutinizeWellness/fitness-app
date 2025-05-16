"use client"

import { useState } from "react"
import { 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Info,
  BookOpen,
  Award,
  Zap,
  RefreshCw,
  Download,
  Play,
  Plus
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DETAILED_WORKOUT_TEMPLATES } from "@/lib/predefined-workout-templates"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface DetailedTemplateViewProps {
  templateId: string
  onCreateRoutine?: (routineId: string) => void
}

export function DetailedTemplateView({
  templateId,
  onCreateRoutine
}: DetailedTemplateViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "guide" | "techniques">("overview")
  const [isCreating, setIsCreating] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  
  // Encontrar la plantilla por ID
  const template = DETAILED_WORKOUT_TEMPLATES.find(t => t.id === templateId)
  
  if (!template) {
    return (
      <Card3D>
        <Card3DContent className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <Info className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Plantilla no encontrada</h3>
            <p className="text-gray-500 mb-4">
              La plantilla que estás buscando no existe o no está disponible.
            </p>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  // Manejar creación de rutina
  const handleCreateRoutine = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }
    
    setIsCreating(true)
    
    try {
      // Crear la rutina usando la función de creación de la plantilla
      const routine = template.createFunction ? template.createFunction(user.id) : null
      
      if (!routine) {
        throw new Error("No se pudo crear la rutina")
      }
      
      // Aquí iría la lógica para guardar la rutina en la base de datos
      // Por ahora, simulamos un retraso y éxito
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Rutina creada",
        description: `La rutina ${template.name} ha sido creada con éxito`,
      })
      
      // Llamar al callback si existe
      if (onCreateRoutine) {
        onCreateRoutine(routine.id)
      }
      
      // Redirigir a la página de la rutina
      router.push(`/training/routine/${routine.id}`)
    } catch (error) {
      console.error("Error al crear la rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }
  
  // Renderizar la guía de la plantilla
  const renderGuide = () => {
    if (!template.guide) {
      return (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Guía no disponible</h3>
          <p className="text-gray-500">
            Esta plantilla no tiene una guía detallada disponible.
          </p>
        </div>
      )
    }
    
    const guide = template.guide
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">{guide.title || "Guía del Programa"}</h3>
          <p className="text-muted-foreground mt-1">{guide.description}</p>
        </div>
        
        {guide.steps && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Progresión del Programa</h4>
            {guide.steps.map((step: any, index: number) => (
              <Card3D key={index}>
                <Card3DContent className="p-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium">{step.week}</h5>
                      <Badge className="mt-1 mb-2">{step.focus}</Badge>
                      <p className="text-sm text-muted-foreground">{step.instructions}</p>
                    </div>
                  </div>
                </Card3DContent>
              </Card3D>
            ))}
          </div>
        )}
        
        {guide.blocks && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Bloques de Entrenamiento</h4>
            {guide.blocks.map((block: any, index: number) => (
              <Card3D key={index}>
                <Card3DContent className="p-4">
                  <div>
                    <h5 className="font-medium">{block.name}</h5>
                    <Badge className="mt-1 mb-2">{block.focus}</Badge>
                    <p className="text-sm text-muted-foreground">{block.instructions}</p>
                  </div>
                </Card3DContent>
              </Card3D>
            ))}
          </div>
        )}
        
        {guide.advancedTechniques && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Técnicas Avanzadas</h4>
            <Accordion type="single" collapsible className="w-full">
              {guide.advancedTechniques.map((technique: any, index: number) => (
                <AccordionItem key={index} value={`technique-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      {technique.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm">{technique.description}</p>
                      {technique.benefits && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Beneficios:</p>
                          <p className="text-sm text-muted-foreground">{technique.benefits}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
        
        {guide.tips && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Consejos</h4>
            <ul className="space-y-1">
              {guide.tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {guide.commonMistakes && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Errores Comunes</h4>
            <ul className="space-y-1">
              {guide.commonMistakes.map((mistake: string, index: number) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-1 text-red-500 flex-shrink-0" />
                  <span className="text-sm">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {guide.whenToProgress && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <h4 className="text-md font-semibold flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Cuándo Progresar
            </h4>
            <p className="text-sm mt-2">{guide.whenToProgress}</p>
          </div>
        )}
      </div>
    )
  }
  
  // Renderizar las técnicas avanzadas
  const renderTechniques = () => {
    if (!template.advancedTechniques && !template.guide?.advancedTechniques) {
      return (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Técnicas no disponibles</h3>
          <p className="text-gray-500">
            Esta plantilla no tiene técnicas avanzadas documentadas.
          </p>
        </div>
      )
    }
    
    const techniques = template.guide?.advancedTechniques || []
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Técnicas Avanzadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techniques.map((technique: any, index: number) => (
            <Card3D key={index}>
              <Card3DHeader>
                <Card3DTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  {technique.name}
                </Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <p className="text-sm text-muted-foreground mb-3">{technique.description}</p>
                {technique.benefits && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Beneficios:</h4>
                    <p className="text-sm text-muted-foreground">{technique.benefits}</p>
                  </div>
                )}
              </Card3DContent>
            </Card3D>
          ))}
        </div>
        
        <div className="p-4 bg-primary/10 rounded-lg">
          <h4 className="text-md font-semibold flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Nota Importante
          </h4>
          <p className="text-sm mt-2">
            Las técnicas avanzadas deben implementarse gradualmente y con buena técnica. 
            No utilices todas las técnicas en cada entrenamiento, sino que selecciona 
            estratégicamente 1-2 técnicas por sesión para maximizar resultados y minimizar 
            el riesgo de sobreentrenamiento.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{template.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">
              {template.level === "beginner" ? "Principiante" : 
               template.level === "intermediate" ? "Intermedio" : "Avanzado"}
            </Badge>
            <Badge variant="outline">
              {template.daysPerWeek} días/semana
            </Badge>
            <Badge variant="outline">
              {template.duration} semanas
            </Badge>
            {template.includesDeload && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                Deload cada {template.deloadFrequency} semanas
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">{template.description}</p>
        </div>
        
        <Button3D onClick={handleCreateRoutine} disabled={isCreating}>
          {isCreating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Crear Rutina
            </>
          )}
        </Button3D>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="guide">Guía</TabsTrigger>
          <TabsTrigger value="techniques">Técnicas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Split</p>
                    <p className="text-lg font-medium">
                      {template.split === "full_body" ? "Cuerpo Completo" :
                       template.split === "upper_lower" ? "Superior/Inferior" :
                       template.split === "push_pull_legs" ? "Push/Pull/Legs" :
                       template.split === "body_part" ? "Por Grupos Musculares" :
                       template.split === "push_pull" ? "Push/Pull" :
                       template.split === "bro_split" ? "Bro Split" : template.split}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="text-lg font-medium">{template.duration} semanas</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Objetivo</p>
                    <p className="text-lg font-medium">
                      {template.category.includes("strength") ? "Fuerza" :
                       template.category.includes("hypertrophy") ? "Hipertrofia" :
                       template.category.includes("powerbuilding") ? "Powerbuilding" :
                       template.category.includes("endurance") ? "Resistencia" :
                       template.category.includes("weight_loss") ? "Pérdida de peso" : "General"}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </div>
          
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Detalles del Programa</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Características</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                      <span className="text-sm">{template.daysPerWeek} días de entrenamiento por semana</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                      <span className="text-sm">Duración total: {template.duration} semanas</span>
                    </li>
                    {template.includesDeload && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                        <span className="text-sm">Incluye semanas de descarga cada {template.deloadFrequency} semanas</span>
                      </li>
                    )}
                    {template.periodizationType && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                        <span className="text-sm">Periodización: {template.periodizationType}</span>
                      </li>
                    )}
                    {template.estimatedTimePerSession && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                        <span className="text-sm">Tiempo estimado por sesión: {template.estimatedTimePerSession} minutos</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Ideal para</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                      <span className="text-sm">Nivel: {template.level === "beginner" ? "Principiante" : 
                                                        template.level === "intermediate" ? "Intermedio" : "Avanzado"}</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                      <span className="text-sm">Objetivo: {template.category.map(c => 
                        c === "strength" ? "Fuerza" :
                        c === "hypertrophy" ? "Hipertrofia" :
                        c === "powerbuilding" ? "Powerbuilding" :
                        c === "endurance" ? "Resistencia" :
                        c === "weight_loss" ? "Pérdida de peso" :
                        c === "beginner" ? "Principiantes" :
                        c === "intermediate" ? "Intermedios" :
                        c === "advanced" ? "Avanzados" : c
                      ).join(", ")}</span>
                    </li>
                    {template.targetMuscleGroups && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-1 text-primary flex-shrink-0" />
                        <span className="text-sm">Grupos musculares: {template.targetMuscleGroups.join(", ")}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Fuente: {template.source}
                </p>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-6">
          {renderGuide()}
        </TabsContent>
        
        <TabsContent value="techniques" className="space-y-6">
          {renderTechniques()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
