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
  Calculator,
  Clock,
  BarChart3,
  Dumbbell,
  Zap,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Activity,
  Heart
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
import { PeriodizedSession, SpecialTechnique } from "@/lib/types/advanced-periodization"
import { SpreadsheetEditor } from "./spreadsheet-editor"
import { SpecialTechniquesConfigurator } from "./special-techniques-configurator"
import { PhysiologicalPreview } from "./physiological-preview"

interface AdvancedSessionEditorProps {
  session: PeriodizedSession
  onSave: (session: PeriodizedSession) => void
  onCancel: () => void
  userFatigue?: number // 0-100
  userReadiness?: number // 0-100
}

export function AdvancedSessionEditor({ 
  session, 
  onSave, 
  onCancel,
  userFatigue = 50,
  userReadiness = 50
}: AdvancedSessionEditorProps) {
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'techniques' | 'preview'>('spreadsheet')
  const [editedSession, setEditedSession] = useState<PeriodizedSession>(session)
  const [savedTechniques, setSavedTechniques] = useState<SpecialTechnique[]>([])
  
  // Cargar técnicas guardadas
  useEffect(() => {
    // Aquí se cargarían las técnicas guardadas desde la base de datos
    // Por ahora, usamos un array vacío
  }, [])
  
  // Manejar guardado de la sesión desde la hoja de cálculo
  const handleSaveFromSpreadsheet = (updatedSession: PeriodizedSession) => {
    setEditedSession(updatedSession)
    toast({
      title: "Cambios guardados",
      description: "Los cambios en la hoja de cálculo han sido guardados"
    })
  }
  
  // Manejar selección de técnica especial
  const handleSelectTechnique = (technique: SpecialTechnique) => {
    // Añadir técnica a la sesión
    const updatedSession = {
      ...editedSession,
      special_techniques: [
        ...(editedSession.special_techniques || []),
        technique
      ]
    }
    
    setEditedSession(updatedSession)
  }
  
  // Manejar guardado de plantilla de técnica
  const handleSaveTechniqueTemplate = (technique: SpecialTechnique) => {
    setSavedTechniques([...savedTechniques, technique])
  }
  
  // Guardar sesión completa
  const handleSaveSession = () => {
    onSave(editedSession)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{editedSession.name}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="bg-primary/10">
              Día {editedSession.day_of_week}
            </Badge>
            {editedSession.focus && editedSession.focus.map((focus, index) => (
              <Badge key={index} variant="outline">
                {focus}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button3D variant="outline" onClick={onCancel}>
            Cancelar
          </Button3D>
          <Button3D onClick={handleSaveSession}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Sesión
          </Button3D>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <div className="w-64">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Métricas de Sesión</Card3DTitle>
            </Card3DHeader>
            <Card3DContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Duración Estimada</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{editedSession.duration_minutes || 60} minutos</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Objetivo RPE</Label>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="font-medium">{editedSession.rpe_target || 7}/10</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Objetivo RIR</Label>
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="font-medium">{editedSession.rir_target || 2} reps en reserva</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tu Estado Actual</Label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1 text-red-500" />
                      Fatiga
                    </span>
                    <span>{userFatigue}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${userFatigue}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-green-500" />
                      Preparación
                    </span>
                    <span>{userReadiness}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${userReadiness}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Técnicas Especiales</Label>
                {editedSession.special_techniques && editedSession.special_techniques.length > 0 ? (
                  <div className="space-y-2">
                    {editedSession.special_techniques.map((technique, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{technique.name}</span>
                        <Button3D 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            // Eliminar técnica
                            const updatedTechniques = [...(editedSession.special_techniques || [])];
                            updatedTechniques.splice(index, 1);
                            setEditedSession({
                              ...editedSession,
                              special_techniques: updatedTechniques
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button3D>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay técnicas aplicadas</p>
                )}
              </div>
            </Card3DContent>
          </Card3D>
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="spreadsheet">
                <Calculator className="h-4 w-4 mr-2" />
                Hoja de Cálculo
              </TabsTrigger>
              <TabsTrigger value="techniques">
                <Zap className="h-4 w-4 mr-2" />
                Técnicas Especiales
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Activity className="h-4 w-4 mr-2" />
                Impacto Fisiológico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spreadsheet" className="mt-0">
              <Card3D>
                <Card3DContent>
                  <SpreadsheetEditor
                    session={editedSession}
                    onSave={handleSaveFromSpreadsheet}
                    onCancel={() => {}}
                  />
                </Card3DContent>
              </Card3D>
            </TabsContent>
            
            <TabsContent value="techniques" className="mt-0">
              <Card3D>
                <Card3DContent>
                  <SpecialTechniquesConfigurator
                    onSelectTechnique={handleSelectTechnique}
                    onSaveTemplate={handleSaveTechniqueTemplate}
                    savedTemplates={savedTechniques}
                  />
                </Card3DContent>
              </Card3D>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <Card3D>
                <Card3DContent>
                  <PhysiologicalPreview
                    session={editedSession}
                    userFatigue={userFatigue}
                    userReadiness={userReadiness}
                  />
                </Card3DContent>
              </Card3D>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
