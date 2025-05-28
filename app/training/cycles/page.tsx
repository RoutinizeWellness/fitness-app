"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import {
  ArrowLeft,
  Calendar,
  Download,
  Share2,
  Filter,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Dumbbell,
  Zap,
  ChevronRight,
  ChevronLeft,
  Plus,
  FileText
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { TrainingCyclesVisualization } from "@/components/training/training-cycles-visualization"
import { PeriodizationVisualization } from "@/components/training/periodization-visualization"
import { getWorkoutLogs } from "@/lib/supabase-training"
import { WorkoutLog } from "@/lib/types/training"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TrainingCyclesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("current")

  // Datos de ejemplo para mesociclos
  const [mesoCycles, setMesoCycles] = useState<any[]>([
    {
      id: "meso-1",
      name: "Mesociclo de Hipertrofia",
      duration: 6,
      microCycles: [
        {
          id: "micro-1",
          name: "Semana 1 - Adaptación",
          weekNumber: 1,
          volume: "moderate",
          intensity: "low",
          frequency: 4,
          isDeload: false,
          isCompleted: true
        },
        {
          id: "micro-2",
          name: "Semana 2 - Acumulación",
          weekNumber: 2,
          volume: "high",
          intensity: "moderate",
          frequency: 5,
          isDeload: false,
          isCompleted: true
        },
        {
          id: "micro-3",
          name: "Semana 3 - Intensificación",
          weekNumber: 3,
          volume: "high",
          intensity: "high",
          frequency: 5,
          isDeload: false,
          isActive: true
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
      isActive: true,
      progress: 40
    },
    {
      id: "meso-2",
      name: "Mesociclo de Fuerza",
      duration: 4,
      microCycles: [
        {
          id: "micro-7",
          name: "Semana 1 - Adaptación",
          weekNumber: 1,
          volume: "moderate",
          intensity: "high",
          frequency: 4,
          isDeload: false
        },
        {
          id: "micro-8",
          name: "Semana 2 - Intensificación",
          weekNumber: 2,
          volume: "moderate",
          intensity: "very_high",
          frequency: 4,
          isDeload: false
        },
        {
          id: "micro-9",
          name: "Semana 3 - Sobrecarga",
          weekNumber: 3,
          volume: "low",
          intensity: "very_high",
          frequency: 4,
          isDeload: false
        },
        {
          id: "micro-10",
          name: "Semana 4 - Descarga",
          weekNumber: 4,
          volume: "low",
          intensity: "moderate",
          frequency: 3,
          isDeload: true
        }
      ],
      phase: "strength",
      goal: "strength",
      volumeProgression: "descending",
      intensityProgression: "ascending",
      includesDeload: true
    }
  ])

  // Cargar logs de entrenamiento
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        setIsLoading(true)
        const { data, error } = await getWorkoutLogs(user.id)

        if (error) {
          console.error("Error al cargar logs:", error)
          throw error
        }

        if (data) {
          setLogs(data)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        // Usar datos de ejemplo en caso de error
        setLogs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  // Obtener el color según la fase
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "anatomical_adaptation": return "bg-blue-500"
      case "hypertrophy": return "bg-purple-500"
      case "strength": return "bg-orange-500"
      case "power": return "bg-red-500"
      case "deload": return "bg-green-500"
      case "maintenance": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  // Obtener el texto según la fase
  const getPhaseText = (phase: string) => {
    switch (phase) {
      case "anatomical_adaptation": return "Adaptación Anatómica"
      case "hypertrophy": return "Hipertrofia"
      case "strength": return "Fuerza"
      case "power": return "Potencia"
      case "deload": return "Descarga"
      case "maintenance": return "Mantenimiento"
      default: return phase
    }
  }

  // Obtener el mesociclo activo
  const activeMesoCycle = mesoCycles.find(cycle => cycle.isActive) || mesoCycles[0]

  return (
    <RoutinizeLayout activeTab="training" title="Ciclos de Entrenamiento">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button3D
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold">Ciclos de Entrenamiento</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <PulseLoader message="Cargando datos de ciclos..." />
          </div>
        ) : (
          <div className="space-y-6">
            <Card3D>
              <Card3DHeader>
                <Card3DTitle gradient={true}>Periodización del entrenamiento</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    La periodización es la planificación sistemática del entrenamiento para maximizar
                    los resultados y minimizar el riesgo de sobreentrenamiento. Organiza tu entrenamiento
                    en ciclos con objetivos específicos.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-blue-700 dark:text-blue-400">Macrociclo</h3>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Periodo largo (3-12 meses) con un objetivo general.
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                        <h3 className="font-medium text-purple-700 dark:text-purple-400">Mesociclo</h3>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Periodo medio (3-6 semanas) con un objetivo específico.
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Dumbbell className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="font-medium text-green-700 dark:text-green-400">Microciclo</h3>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Periodo corto (1 semana) con entrenamientos específicos.
                      </p>
                    </div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="current" className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Actual</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Historial</span>
                </TabsTrigger>
                <TabsTrigger value="planning" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Planificación</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-6">
                {activeMesoCycle && (
                  <>
                    <Card3D>
                      <Card3DHeader>
                        <Card3DTitle gradient={true}>Mesociclo actual</Card3DTitle>
                        <Badge className={getPhaseColor(activeMesoCycle.phase)}>
                          {getPhaseText(activeMesoCycle.phase)}
                        </Badge>
                      </Card3DHeader>
                      <Card3DContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-bold">{activeMesoCycle.name}</h2>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span>{activeMesoCycle.duration} semanas</span>
                                <span className="mx-2">•</span>
                                <span>Semana actual: {activeMesoCycle.microCycles.find((m: any) => m.isActive)?.weekNumber || "-"}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button3D variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                              </Button3D>
                              <Button3D variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Compartir
                              </Button3D>
                            </div>
                          </div>

                          {activeMesoCycle.progress !== undefined && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso del mesociclo</span>
                                <span>{activeMesoCycle.progress}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${activeMesoCycle.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card3DContent>
                    </Card3D>

                    <PeriodizationVisualization mesoCycle={activeMesoCycle} workoutLogs={logs} />

                    <Card3D>
                      <Card3DHeader>
                        <Card3DTitle gradient={true}>Microciclos</Card3DTitle>
                      </Card3DHeader>
                      <Card3DContent>
                        <div className="space-y-4">
                          {activeMesoCycle.microCycles.map((micro: any) => (
                            <div
                              key={micro.id}
                              className={`border rounded-lg p-4 ${
                                micro.isActive
                                  ? 'border-primary bg-primary/5'
                                  : micro.isCompleted
                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                                    : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium">{micro.name}</h3>
                                    {micro.isActive && (
                                      <Badge className="ml-2 bg-blue-500">Actual</Badge>
                                    )}
                                    {micro.isCompleted && (
                                      <Badge className="ml-2 bg-green-500">Completado</Badge>
                                    )}
                                    {micro.isDeload && (
                                      <Badge className="ml-2 bg-yellow-500">Descarga</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">Semana {micro.weekNumber} de {activeMesoCycle.duration}</p>
                                </div>
                                <Button3D
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/training/cycles/microcycle/${micro.id}`)}
                                >
                                  Ver detalles
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button3D>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                  <p className="text-xs text-gray-500">Volumen</p>
                                  <p className="font-medium capitalize">{micro.volume.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Intensidad</p>
                                  <p className="font-medium capitalize">{micro.intensity.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Frecuencia</p>
                                  <p className="font-medium">{micro.frequency} días/semana</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card3DContent>
                    </Card3D>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Historial de ciclos</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Aquí puedes ver tus ciclos de entrenamiento completados y analizar tu progreso a lo largo del tiempo.
                      </p>

                      <div className="text-center py-8">
                        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay ciclos completados</h3>
                        <p className="text-gray-500 mb-4">Completa tu primer mesociclo para ver tu historial</p>
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>

                <TrainingCyclesVisualization logs={logs} userId={user?.id || ""} />
              </TabsContent>

              <TabsContent value="planning" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Planificación a largo plazo</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Planifica tus próximos ciclos de entrenamiento para alcanzar tus objetivos a largo plazo.
                      </p>

                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Próximos mesociclos</h3>
                        <Button3D size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear nuevo ciclo
                        </Button3D>
                      </div>

                      <div className="space-y-3">
                        {mesoCycles.filter(cycle => !cycle.isActive).map((cycle) => (
                          <div
                            key={cycle.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium">{cycle.name}</h3>
                                  <Badge className={`ml-2 ${getPhaseColor(cycle.phase)}`}>
                                    {getPhaseText(cycle.phase)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{cycle.duration} semanas</p>
                              </div>
                              <Button3D
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/training/cycles/mesocycle/${cycle.id}`)}
                              >
                                Ver detalles
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button3D>
                            </div>
                          </div>
                        ))}

                        {mesoCycles.filter(cycle => !cycle.isActive).length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No hay mesociclos planificados</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}
