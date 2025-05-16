"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Dumbbell, 
  Zap, 
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Info,
  Settings,
  Download,
  Share2
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress3D } from "@/components/ui/progress-3d"
import { PeriodizationVisualization } from "@/components/training/periodization-visualization"
import { 
  MesoCycle, 
  MicroCycle, 
  TrainingPhase, 
  TrainingGoal,
  TrainingLevel
} from "@/lib/enhanced-periodization"
import { WorkoutLog } from "@/lib/types/training"
import { format, addWeeks, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"

interface TrainingPeriodizationDashboardProps {
  userId: string
  workoutLogs?: WorkoutLog[]
}

export function TrainingPeriodizationDashboard({
  userId,
  workoutLogs = []
}: TrainingPeriodizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<"current" | "history" | "create">("current")
  const [currentMesocycle, setCurrentMesocycle] = useState<MesoCycle | null>(null)
  const [mesocycleHistory, setMesocycleHistory] = useState<MesoCycle[]>([])
  
  // Cargar datos de mesociclos (simulado)
  useEffect(() => {
    // Simulación de carga de datos
    // En una implementación real, esto cargaría desde Supabase
    
    // Mesociclo actual (simulado)
    const sampleCurrentMesocycle: MesoCycle = {
      id: "current-mesocycle",
      name: "Mesociclo de Hipertrofia Q2 2023",
      duration: 6, // 6 semanas
      microCycles: [
        {
          id: "micro-1",
          name: "Semana 1 - Adaptación",
          weekNumber: 1,
          volume: "moderate",
          intensity: "low",
          frequency: 4,
          isDeload: false
        },
        {
          id: "micro-2",
          name: "Semana 2 - Acumulación",
          weekNumber: 2,
          volume: "high",
          intensity: "moderate",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-3",
          name: "Semana 3 - Intensificación",
          weekNumber: 3,
          volume: "high",
          intensity: "high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-4",
          name: "Semana 4 - Sobrecarga",
          weekNumber: 4,
          volume: "very_high",
          intensity: "high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-5",
          name: "Semana 5 - Intensificación",
          weekNumber: 5,
          volume: "high",
          intensity: "very_high",
          frequency: 5,
          isDeload: false
        },
        {
          id: "micro-6",
          name: "Semana 6 - Descarga",
          weekNumber: 6,
          volume: "low",
          intensity: "moderate",
          frequency: 3,
          isDeload: true
        }
      ],
      phase: "hypertrophy",
      goal: "hypertrophy",
      volumeProgression: "wave",
      intensityProgression: "ascending",
      includesDeload: true,
      deloadStrategy: {
        type: "volume",
        volumeReduction: 50,
        intensityReduction: 20,
        frequencyReduction: 2,
        duration: 7,
        timing: "fixed"
      }
    }
    
    // Historial de mesociclos (simulado)
    const sampleMesocycleHistory: MesoCycle[] = [
      {
        id: "past-mesocycle-1",
        name: "Mesociclo de Fuerza Q1 2023",
        duration: 4,
        microCycles: [
          {
            id: "past-micro-1-1",
            name: "Semana 1",
            weekNumber: 1,
            volume: "moderate",
            intensity: "high",
            frequency: 4,
            isDeload: false
          },
          {
            id: "past-micro-1-2",
            name: "Semana 2",
            weekNumber: 2,
            volume: "moderate",
            intensity: "very_high",
            frequency: 4,
            isDeload: false
          },
          {
            id: "past-micro-1-3",
            name: "Semana 3",
            weekNumber: 3,
            volume: "moderate",
            intensity: "very_high",
            frequency: 4,
            isDeload: false
          },
          {
            id: "past-micro-1-4",
            name: "Semana 4",
            weekNumber: 4,
            volume: "low",
            intensity: "moderate",
            frequency: 3,
            isDeload: true
          }
        ],
        phase: "strength",
        goal: "strength",
        volumeProgression: "constant",
        intensityProgression: "ascending",
        includesDeload: true,
        deloadStrategy: {
          type: "intensity",
          volumeReduction: 30,
          intensityReduction: 40,
          frequencyReduction: 1,
          duration: 7,
          timing: "fixed"
        }
      },
      {
        id: "past-mesocycle-2",
        name: "Mesociclo de Volumen Q4 2022",
        duration: 5,
        microCycles: [
          {
            id: "past-micro-2-1",
            name: "Semana 1",
            weekNumber: 1,
            volume: "moderate",
            intensity: "low",
            frequency: 5,
            isDeload: false
          },
          {
            id: "past-micro-2-2",
            name: "Semana 2",
            weekNumber: 2,
            volume: "high",
            intensity: "moderate",
            frequency: 5,
            isDeload: false
          },
          {
            id: "past-micro-2-3",
            name: "Semana 3",
            weekNumber: 3,
            volume: "very_high",
            intensity: "moderate",
            frequency: 5,
            isDeload: false
          },
          {
            id: "past-micro-2-4",
            name: "Semana 4",
            weekNumber: 4,
            volume: "high",
            intensity: "moderate",
            frequency: 5,
            isDeload: false
          },
          {
            id: "past-micro-2-5",
            name: "Semana 5",
            weekNumber: 5,
            volume: "low",
            intensity: "low",
            frequency: 3,
            isDeload: true
          }
        ],
        phase: "hypertrophy",
        goal: "hypertrophy",
        volumeProgression: "wave",
        intensityProgression: "constant",
        includesDeload: true,
        deloadStrategy: {
          type: "volume",
          volumeReduction: 60,
          intensityReduction: 20,
          frequencyReduction: 2,
          duration: 7,
          timing: "fixed"
        }
      }
    ]
    
    setCurrentMesocycle(sampleCurrentMesocycle)
    setMesocycleHistory(sampleMesocycleHistory)
  }, [])
  
  // Función para crear un nuevo mesociclo
  const handleCreateMesocycle = () => {
    toast({
      title: "Crear nuevo mesociclo",
      description: "Esta funcionalidad estará disponible próximamente.",
    })
  }
  
  // Función para exportar datos
  const handleExportData = () => {
    toast({
      title: "Exportar datos",
      description: "Esta funcionalidad estará disponible próximamente.",
    })
  }
  
  // Renderizar el mesociclo actual
  const renderCurrentMesocycle = () => {
    if (!currentMesocycle) {
      return (
        <Card3D>
          <Card3DContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay mesociclo activo</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer mesociclo de entrenamiento para visualizar tu progreso
              </p>
              <Button3D onClick={() => setActiveTab("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Mesociclo
              </Button3D>
            </div>
          </Card3DContent>
        </Card3D>
      )
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{currentMesocycle.name}</h2>
            <div className="flex items-center mt-1">
              <Badge className="mr-2">
                {currentMesocycle.phase === "hypertrophy" ? "Hipertrofia" : 
                 currentMesocycle.phase === "strength" ? "Fuerza" : 
                 currentMesocycle.phase === "power" ? "Potencia" : 
                 currentMesocycle.phase === "deload" ? "Descarga" : 
                 "Fase de entrenamiento"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {currentMesocycle.duration} semanas
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button3D variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button3D>
            <Button3D variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button3D>
          </div>
        </div>
        
        <PeriodizationVisualization 
          mesoCycle={currentMesocycle}
          workoutLogs={workoutLogs}
          userId={userId}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Progreso del Mesociclo</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Progreso</span>
                    <span className="text-sm font-medium">
                      {Math.round((new Date().getTime() - new Date().getTime() + 14 * 24 * 60 * 60 * 1000) / 
                      (currentMesocycle.duration * 7 * 24 * 60 * 60 * 1000) * 100)}%
                    </span>
                  </div>
                  <Progress3D 
                    value={Math.round((new Date().getTime() - new Date().getTime() + 14 * 24 * 60 * 60 * 1000) / 
                    (currentMesocycle.duration * 7 * 24 * 60 * 60 * 1000) * 100)} 
                    max={100} 
                  />
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Microciclo Actual</h4>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Semana 3</span>
                      <Badge variant="outline">Intensificación</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Volumen:</span>
                        <span className="text-xs font-medium">Alto</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Intensidad:</span>
                        <span className="text-xs font-medium">Alta</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Frecuencia:</span>
                        <span className="text-xs font-medium">5 días/semana</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Descarga:</span>
                        <span className="text-xs font-medium">No</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
          
          <Card3D className="md:col-span-2">
            <Card3DHeader>
              <Card3DTitle>Próximos Microciclos</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-3">
                {currentMesocycle.microCycles
                  .filter(micro => micro.weekNumber > 3)
                  .map(micro => (
                    <div key={micro.id} className="flex items-center p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="mr-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{micro.weekNumber}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{micro.name}</span>
                          {micro.isDeload && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                              Descarga
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-muted-foreground mr-2">
                            Volumen: {micro.volume === "very_high" ? "Muy alto" : 
                                      micro.volume === "high" ? "Alto" : 
                                      micro.volume === "moderate" ? "Moderado" : 
                                      micro.volume === "low" ? "Bajo" : "Muy bajo"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Intensidad: {micro.intensity === "very_high" ? "Muy alta" : 
                                        micro.intensity === "high" ? "Alta" : 
                                        micro.intensity === "moderate" ? "Moderada" : 
                                        micro.intensity === "low" ? "Baja" : "Muy baja"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
              </div>
            </Card3DContent>
          </Card3D>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="current">Mesociclo Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="create">Crear Nuevo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          {renderCurrentMesocycle()}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {mesocycleHistory.map(mesocycle => (
              <Card3D key={mesocycle.id}>
                <Card3DContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{mesocycle.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge className="mr-2">
                          {mesocycle.phase === "hypertrophy" ? "Hipertrofia" : 
                           mesocycle.phase === "strength" ? "Fuerza" : 
                           mesocycle.phase === "power" ? "Potencia" : 
                           mesocycle.phase === "deload" ? "Descarga" : 
                           "Fase de entrenamiento"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {mesocycle.duration} semanas
                        </span>
                      </div>
                    </div>
                    <Button3D variant="outline" size="sm">
                      Ver Detalles
                    </Button3D>
                  </div>
                </Card3DContent>
              </Card3D>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-6">
          <Card3D>
            <Card3DContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Crear Nuevo Mesociclo</h3>
              <p className="text-muted-foreground mb-6">
                Esta funcionalidad estará disponible próximamente. Podrás crear mesociclos personalizados
                con periodización avanzada, técnicas especializadas y seguimiento detallado.
              </p>
              <Button3D onClick={handleCreateMesocycle}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Mesociclo
              </Button3D>
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>
    </div>
  )
}
