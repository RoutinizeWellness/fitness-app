"use client"

import { useState, useEffect } from "react"
import {
  Dumbbell, Plus, Trash2, Edit, Copy, Play, Save, Info, Shuffle,
  Check, X, ChevronRight, ChevronDown, ChevronUp, Filter, Search
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkoutRoutine } from "@/lib/types/training"
import { toast } from "@/components/ui/use-toast"
import { saveWorkoutRoutine, getWorkoutRoutines } from "@/lib/supabase-training"

interface TemplateManagerProps {
  userId: string
  onSelectTemplate: (template: WorkoutRoutine) => void
  onCancel: () => void
}

export function TemplateManager({
  userId,
  onSelectTemplate,
  onCancel
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<WorkoutRoutine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("my-templates")

  // Cargar plantillas
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true)
      try {
        // Cargar plantillas del usuario
        const { data: userTemplates, error: userError } = await getWorkoutRoutines(userId, true)
        
        if (userError) {
          console.error("Error al cargar plantillas del usuario:", userError)
          toast({
            title: "Error",
            description: "No se pudieron cargar tus plantillas personalizadas",
            variant: "destructive"
          })
        }
        
        // Cargar plantillas predefinidas (públicas)
        const { data: publicTemplates, error: publicError } = await getWorkoutRoutines("public", true)
        
        if (publicError) {
          console.error("Error al cargar plantillas predefinidas:", publicError)
        }
        
        // Combinar plantillas
        const allTemplates = [
          ...(userTemplates || []),
          ...(publicTemplates || [])
        ]
        
        setTemplates(allTemplates)
      } catch (error) {
        console.error("Error al cargar plantillas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTemplates()
  }, [userId])

  // Filtrar plantillas según búsqueda y pestaña activa
  const filteredTemplates = templates.filter(template => {
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === "" || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtrar por tipo (mis plantillas o predefinidas)
    const matchesTab = activeTab === "all" || 
      (activeTab === "my-templates" && template.userId === userId) ||
      (activeTab === "predefined" && template.userId !== userId)
    
    return matchesSearch && matchesTab
  })

  // Guardar rutina como plantilla
  const saveAsTemplate = async (routine: WorkoutRoutine) => {
    try {
      // Crear una copia de la rutina como plantilla
      const templateRoutine: WorkoutRoutine = {
        ...routine,
        id: `template-${Date.now()}`,
        userId,
        isTemplate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const { data, error } = await saveWorkoutRoutine(templateRoutine)
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Plantilla guardada",
        description: "La rutina se ha guardado como plantilla personalizada",
        variant: "default"
      })
      
      // Actualizar la lista de plantillas
      setTemplates([...templates, templateRoutine])
      
    } catch (error) {
      console.error("Error al guardar plantilla:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive"
      })
    }
  }

  // Eliminar plantilla
  const deleteTemplate = async (templateId: string) => {
    try {
      // Implementar eliminación de plantilla
      // ...
      
      // Actualizar la lista de plantillas
      setTemplates(templates.filter(t => t.id !== templateId))
      
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada correctamente",
        variant: "default"
      })
    } catch (error) {
      console.error("Error al eliminar plantilla:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive"
      })
    }
  }

  // Renderizar plantilla
  const renderTemplate = (template: WorkoutRoutine) => {
    const isExpanded = expandedTemplate === template.id
    const isUserTemplate = template.userId === userId
    
    return (
      <Card3D key={template.id} className="overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-gray-500">{template.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  {template.goal === "strength" ? "Fuerza" :
                   template.goal === "hypertrophy" ? "Hipertrofia" :
                   template.goal === "endurance" ? "Resistencia" :
                   template.goal === "weight_loss" ? "Pérdida de peso" :
                   "General"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.level === "beginner" ? "Principiante" :
                   template.level === "intermediate" ? "Intermedio" :
                   "Avanzado"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {template.frequency} días/semana
                </Badge>
                {isUserTemplate && (
                  <Badge variant="default" className="text-xs">
                    Personalizada
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button3D
                variant="outline"
                size="sm"
                className="mr-1"
                onClick={() => onSelectTemplate(template)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Usar
              </Button3D>
              {isUserTemplate && (
                <Button3D
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button3D>
              )}
              <Button3D
                variant="ghost"
                size="icon"
                onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button3D>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Días de entrenamiento</h4>
                  <div className="space-y-2">
                    {template.days.map((day, index) => (
                      <div key={day.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{day.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {day.exerciseSets.length / 3} ejercicios
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {day.targetMuscleGroups.map(group => (
                            <Badge key={group} variant="secondary" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card3D>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Plantillas de entrenamiento</h2>
        <Button3D variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button3D>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar plantillas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="my-templates">Mis plantillas</TabsTrigger>
          <TabsTrigger value="predefined">Predefinidas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-templates" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando plantillas...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {filteredTemplates.map(template => renderTemplate(template))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes plantillas personalizadas</p>
              <p className="text-sm text-gray-400">
                Guarda tus rutinas como plantillas para reutilizarlas en el futuro
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="predefined" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando plantillas...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {filteredTemplates.map(template => renderTemplate(template))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay plantillas predefinidas disponibles</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando plantillas...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {filteredTemplates.map(template => renderTemplate(template))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay plantillas disponibles</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
      </div>
    </div>
  )
}
