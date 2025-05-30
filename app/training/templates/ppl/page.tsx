"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  ChevronRight,
  Clock,
  Zap,
  RefreshCw,
  BarChart3,
  BookOpen,
  Lightbulb,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { createPureBodybuildingPPL } from "@/lib/templates/pure-bodybuilding-ppl"
import { createPureBodybuildingHypertrophyTemplate } from "@/lib/templates/pure-bodybuilding-hypertrophy"
import { createHipertrofiaMaximaTemplate } from "@/lib/templates/hipertrofia-maxima-template"
import { toast } from "@/components/ui/use-toast"
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization"
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system"
import { ExerciseDemonstration } from "@/components/training/exercise-demonstration"

export default function PPLTemplatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCreateRoutine = async (templateType: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }

    setIsCreatingRoutine(true)
    setSelectedTemplate(templateType)

    try {
      // Create the routine based on the selected template
      let routine

      switch (templateType) {
        case "pure-bodybuilding-ppl":
          routine = createPureBodybuildingPPL(user.id)
          break
        case "pure-bodybuilding-hypertrophy":
          routine = createPureBodybuildingHypertrophyTemplate(user.id)
          break
        case "hipertrofia-maxima":
          routine = createHipertrofiaMaximaTemplate(user.id)
          break
        default:
          routine = createPureBodybuildingPPL(user.id)
      }

      // In a real implementation, save the routine to Supabase
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Rutina creada",
        description: "La rutina se ha creado correctamente",
      })

      // Navigate to the routine page
      router.push(`/training/routine/${routine.id}`)
    } catch (error) {
      console.error("Error creating routine:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive"
      })
    } finally {
      setIsCreatingRoutine(false)
    }
  }

  return (
    <RoutinizeLayout activeTab="training" title="Plantillas PPL">
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
          <h1 className="text-2xl font-bold">Plantillas Push Pull Legs (PPL)</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <PulseLoader message="Cargando plantillas..." />
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Visión General</TabsTrigger>
                <TabsTrigger value="templates">Plantillas</TabsTrigger>
                <TabsTrigger value="advanced">Características Avanzadas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Push Pull Legs (PPL)</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        El sistema Push Pull Legs (PPL) es uno de los splits de entrenamiento más efectivos y populares para hipertrofia.
                        Divide el entrenamiento en tres tipos de días:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card3D>
                          <Card3DContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">Push (Empuje)</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Entrena todos los músculos que participan en movimientos de empuje.
                            </p>
                            <ul className="text-sm space-y-1">
                              <li>• Pecho</li>
                              <li>• Hombros</li>
                              <li>• Tríceps</li>
                            </ul>
                          </Card3DContent>
                        </Card3D>

                        <Card3D>
                          <Card3DContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">Pull (Tirón)</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Entrena todos los músculos que participan en movimientos de tirón.
                            </p>
                            <ul className="text-sm space-y-1">
                              <li>• Espalda</li>
                              <li>• Bíceps</li>
                              <li>• Antebrazos</li>
                            </ul>
                          </Card3DContent>
                        </Card3D>

                        <Card3D>
                          <Card3DContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2">Legs (Piernas)</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Entrena todos los músculos de las piernas.
                            </p>
                            <ul className="text-sm space-y-1">
                              <li>• Cuádriceps</li>
                              <li>• Isquiotibiales</li>
                              <li>• Glúteos</li>
                              <li>• Pantorrillas</li>
                            </ul>
                          </Card3DContent>
                        </Card3D>
                      </div>

                      <h3 className="font-semibold text-lg mt-6">Beneficios del PPL</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Alta frecuencia:</strong> Permite entrenar cada grupo muscular 2 veces por semana con suficiente recuperación.</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Sinergia muscular:</strong> Agrupa músculos que trabajan juntos, maximizando la eficiencia del entrenamiento.</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Flexibilidad:</strong> Puede adaptarse a 3, 4, 5 o 6 días de entrenamiento por semana.</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span><strong>Escalabilidad:</strong> Funciona para principiantes, intermedios y avanzados con los ajustes adecuados.</span>
                        </li>
                      </ul>

                      <div className="mt-6">
                        <Button3D onClick={() => setActiveTab("templates")}>
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Ver plantillas PPL
                        </Button3D>
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>

                <MesocycleProgressVisualization />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card3D>
                    <Card3DContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">Pure Bodybuilding PPL</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge>Intermedio</Badge>
                            <Badge>Hipertrofia</Badge>
                            <Badge>6 días/semana</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            Rutina Push Pull Legs de 6 días para maximizar la hipertrofia con técnicas avanzadas y periodización.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center mt-4 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">12 semanas</span>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span>Deload cada 4 semanas</span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between">
                        <Button3D
                          variant="outline"
                          onClick={() => router.push(`/training/templates/ppl/pure-bodybuilding`)}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button3D>
                        <div className="flex space-x-2">
                          <Button3D
                            onClick={() => handleCreateRoutine("pure-bodybuilding-ppl")}
                            disabled={isCreatingRoutine}
                          >
                            {isCreatingRoutine && selectedTemplate === "pure-bodybuilding-ppl" ? (
                              <>
                                <PulseLoader size="sm" className="mr-2" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Usar plantilla
                              </>
                            )}
                          </Button3D>
                          <Button3D
                            variant="outline"
                            onClick={() => router.push('/training/templates/ppl/use')}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Personalizar
                          </Button3D>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>

                  <Card3D>
                    <Card3DContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Pure Bodybuilding Hypertrophy</h3>
                            <Badge className="ml-2 bg-amber-100 text-amber-800">Nuevo</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge>Avanzado</Badge>
                            <Badge>Hipertrofia</Badge>
                            <Badge>6 días/semana</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            Programa avanzado de hipertrofia basado en Pure Bodybuilding Phase 2 Hypertrophy Handbook. Incluye periodización por bloques y técnicas avanzadas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center mt-4 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">12 semanas</span>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span>Deload cada 4 semanas</span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between">
                        <Button3D
                          variant="outline"
                          onClick={() => router.push(`/training/templates/ppl/pure-bodybuilding-hypertrophy`)}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button3D>
                        <div className="flex space-x-2">
                          <Button3D
                            onClick={() => handleCreateRoutine("pure-bodybuilding-hypertrophy")}
                            disabled={isCreatingRoutine}
                          >
                            {isCreatingRoutine && selectedTemplate === "pure-bodybuilding-hypertrophy" ? (
                              <>
                                <PulseLoader size="sm" className="mr-2" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Usar plantilla
                              </>
                            )}
                          </Button3D>
                          <Button3D
                            variant="outline"
                            onClick={() => router.push('/training/templates/ppl/use')}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Personalizar
                          </Button3D>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>

                  <Card3D>
                    <Card3DContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Hipertrofia Máxima Bazman</h3>
                            <Badge className="ml-2 bg-amber-100 text-amber-800">Nuevo</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge>Avanzado</Badge>
                            <Badge>Hipertrofia</Badge>
                            <Badge>5 días/semana</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            Programa avanzado de hipertrofia basado en Hipertrofia Maxima Bazman Science 2. Incluye periodización ondulante y técnicas avanzadas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center mt-4 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">12 semanas</span>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span>Deload cada 4 semanas</span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between">
                        <Button3D
                          variant="outline"
                          onClick={() => router.push(`/training/templates/ppl/hipertrofia-maxima`)}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button3D>
                        <div className="flex space-x-2">
                          <Button3D
                            onClick={() => handleCreateRoutine("hipertrofia-maxima")}
                            disabled={isCreatingRoutine}
                          >
                            {isCreatingRoutine && selectedTemplate === "hipertrofia-maxima" ? (
                              <>
                                <PulseLoader size="sm" className="mr-2" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Usar plantilla
                              </>
                            )}
                          </Button3D>
                          <Button3D
                            variant="outline"
                            onClick={() => router.push('/training/templates/ppl/use')}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Personalizar
                          </Button3D>
                        </div>
                      </div>
                    </Card3DContent>
                  </Card3D>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FatigueManagementSystem />
                  <ExerciseDemonstration />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </RoutinizeLayout>
  )
}
