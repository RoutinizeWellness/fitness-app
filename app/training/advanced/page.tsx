"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Flame, 
  RefreshCw,
  Dumbbell,
  BarChart3,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdvancedTechniquesShowcase } from "@/components/training/advanced-techniques-showcase"
import { FatigueAnalysis } from "@/components/training/fatigue-analysis"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function AdvancedTrainingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("techniques")
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <RoutinizeLayout activeTab="training" title="Entrenamiento Avanzado">
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
          <h1 className="text-2xl font-bold">Entrenamiento Avanzado</h1>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <PulseLoader message="Cargando funcionalidades avanzadas..." />
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="techniques" className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Técnicas</span>
                </TabsTrigger>
                <TabsTrigger value="fatigue" className="flex items-center">
                  <Flame className="h-4 w-4 mr-2" />
                  <span>Fatiga</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  <span>IA</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="techniques" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Técnicas avanzadas de entrenamiento</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Las técnicas avanzadas de entrenamiento te permiten romper estancamientos, 
                        aumentar la intensidad y estimular nuevas adaptaciones musculares. 
                        Utilízalas estratégicamente en tus entrenamientos para maximizar resultados.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Técnicas de intensidad</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Aumentan la intensidad del entrenamiento sin necesidad de añadir más peso.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                          <h3 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Técnicas de volumen</h3>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            Permiten acumular más volumen de entrenamiento en menos tiempo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>
                
                <AdvancedTechniquesShowcase />
                
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Aplicación práctica</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Para implementar estas técnicas en tus entrenamientos actuales, 
                        puedes seguir estas recomendaciones:
                      </p>
                      
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="font-semibold">1</span>
                            </div>
                            <div>
                              <h4 className="font-medium">Selecciona 1-2 técnicas por sesión</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                No sobrecargues tu entrenamiento con demasiadas técnicas avanzadas.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="font-semibold">2</span>
                            </div>
                            <div>
                              <h4 className="font-medium">Aplícalas en los últimos ejercicios</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Usa estas técnicas después de completar tus series principales.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="font-semibold">3</span>
                            </div>
                            <div>
                              <h4 className="font-medium">Monitoriza la recuperación</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Estas técnicas aumentan la fatiga, asegúrate de recuperarte adecuadamente.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button3D className="w-full" onClick={() => router.push('/training/workout-builder')}>
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Crear entrenamiento con técnicas avanzadas
                      </Button3D>
                    </div>
                  </Card3DContent>
                </Card3D>
              </TabsContent>
              
              <TabsContent value="fatigue" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Análisis de fatiga</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        El análisis de fatiga te permite optimizar tu entrenamiento, 
                        evitar el sobreentrenamiento y planificar periodos de descarga 
                        estratégicos para maximizar tus resultados a largo plazo.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                          <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Fatiga sistémica</h3>
                          <p className="text-sm text-orange-600 dark:text-orange-300">
                            Afecta a todo el cuerpo y sistema nervioso central.
                          </p>
                        </div>
                        
                        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                          <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">Fatiga local</h3>
                          <p className="text-sm text-red-600 dark:text-red-300">
                            Específica de grupos musculares concretos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card3DContent>
                </Card3D>
                
                <FatigueAnalysis userId={user?.id || ""} />
                
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Estrategias de recuperación</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <RefreshCw className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <h4 className="font-medium">Semanas de descarga</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Reduce el volumen un 40-50% cada 4-6 semanas para permitir una recuperación completa.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <RefreshCw className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <h4 className="font-medium">Rotación de ejercicios</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Cambia regularmente los ejercicios para evitar la fatiga excesiva en patrones de movimiento específicos.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <RefreshCw className="h-5 w-5 text-purple-500 mr-3" />
                          <div>
                            <h4 className="font-medium">Periodización de la intensidad</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Alterna periodos de alta y baja intensidad para gestionar la fatiga acumulada.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button3D className="w-full" onClick={() => router.push('/training/recovery')}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Ver estrategias de recuperación completas
                      </Button3D>
                    </div>
                  </Card3DContent>
                </Card3D>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-6">
                <Card3D>
                  <Card3DHeader>
                    <Card3DTitle gradient={true}>Recomendaciones de IA</Card3DTitle>
                  </Card3DHeader>
                  <Card3DContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Nuestro sistema de inteligencia artificial analiza tus patrones de entrenamiento, 
                        respuesta a la fatiga y progresión para ofrecerte recomendaciones personalizadas 
                        que optimicen tus resultados.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Brain className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="font-medium text-blue-700 dark:text-blue-400">Ajuste de volumen</h3>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Basado en tu historial de entrenamiento, recomendamos aumentar el volumen 
                            para pecho en un 15% para estimular nuevo crecimiento.
                          </p>
                          <Button3D variant="outline" size="sm" className="mt-3">
                            Aplicar recomendación
                          </Button3D>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Brain className="h-5 w-5 text-green-500 mr-2" />
                            <h3 className="font-medium text-green-700 dark:text-green-400">Técnica recomendada</h3>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            Para romper tu estancamiento en bíceps, recomendamos incorporar 
                            series de rest-pause en tu próximo entrenamiento.
                          </p>
                          <Button3D variant="outline" size="sm" className="mt-3">
                            Ver detalles
                          </Button3D>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Brain className="h-5 w-5 text-purple-500 mr-2" />
                            <h3 className="font-medium text-purple-700 dark:text-purple-400">Recuperación</h3>
                          </div>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            Tu fatiga en piernas es alta. Recomendamos una semana de descarga 
                            para optimizar la recuperación y el rendimiento futuro.
                          </p>
                          <Button3D variant="outline" size="sm" className="mt-3">
                            Planificar descarga
                          </Button3D>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Análisis completo de IA</h4>
                          <p className="text-sm text-gray-500">Obtén un análisis detallado de tu entrenamiento</p>
                        </div>
                        <Button3D onClick={() => router.push('/training/ai-analysis')}>
                          <Brain className="h-4 w-4 mr-2" />
                          Ver análisis
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button3D>
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
