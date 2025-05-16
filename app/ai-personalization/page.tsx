"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  Brain,
  Activity,
  Heart,
  Dumbbell,
  Utensils,
  Moon,
  Camera,
  AlertTriangle,
  BarChart2,
  Settings,
  Info,
  BookOpen,
  ClipboardList
} from "lucide-react"
import AICoreDashboard from "@/components/ai-core-dashboard"
import FatigueInjuryPrediction from "@/components/fatigue-injury-prediction"
import HolisticWellnessScore from "@/components/holistic-wellness-score"
import ExerciseFormAnalyzer from "@/components/exercise-form-analyzer"
import AIAssessmentWizard from "@/components/ai-assessment-wizard"
import ExerciseLibrary from "@/components/exercise-library"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

export default function AIPersonalizationPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)

  // Check if user has completed the assessment
  useEffect(() => {
    const checkAssessment = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_assessments')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (!error && data && data.length > 0) {
          setHasCompletedAssessment(true)
        }
      } catch (error) {
        console.error("Error checking assessment:", error)
      }
    }

    checkAssessment()
  }, [user])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-primary" />
          Núcleo de IA para Hiperpersonalización
        </h1>
        <p className="text-gray-500">
          Algoritmos adaptativos que personalizan tu experiencia basándose en tus datos y objetivos
        </p>
      </div>

      {!hasCompletedAssessment && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-primary" />
              Evaluación Inicial
            </CardTitle>
            <CardDescription>
              Completa esta evaluación para que nuestra IA pueda crear un plan personalizado para ti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Para ofrecerte recomendaciones verdaderamente personalizadas, necesitamos conocer más sobre ti,
              tus objetivos y preferencias. Esta evaluación nos ayudará a crear un plan adaptado específicamente a ti.
            </p>
            <Button onClick={() => setActiveTab("assessment")}>
              Comenzar Evaluación
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            Bienestar
          </TabsTrigger>
          <TabsTrigger value="fatigue" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Fatiga y Lesiones
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Análisis de Forma
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Ejercicios
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-2" />
            Evaluación
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AICoreDashboard />
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          <HolisticWellnessScore />
        </TabsContent>

        <TabsContent value="fatigue" className="space-y-6">
          <FatigueInjuryPrediction />
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Análisis de Forma en Tiempo Real</h2>
              <Badge variant="outline" className="bg-primary/10">
                Experimental
              </Badge>
            </div>

            <p className="text-gray-500">
              Utiliza la cámara de tu dispositivo para analizar tu técnica de ejercicio en tiempo real y recibir feedback instantáneo.
            </p>

            <ExerciseFormAnalyzer
              exerciseName="Sentadilla"
              exerciseId="squat"
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  Cómo funciona
                </CardTitle>
                <CardDescription>
                  Información sobre el análisis de forma en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                        1
                      </div>
                      <h3 className="font-medium">Posiciona la cámara</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Coloca tu dispositivo de manera que pueda ver todo tu cuerpo durante el ejercicio.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                        2
                      </div>
                      <h3 className="font-medium">Inicia el análisis</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Pulsa el botón de inicio y comienza a realizar el ejercicio a un ritmo controlado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-2">
                        3
                      </div>
                      <h3 className="font-medium">Recibe feedback</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Obtén correcciones en tiempo real sobre tu postura, rango de movimiento y técnica.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Ejercicios soportados</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="outline" className="justify-center">Sentadilla</Badge>
                    <Badge variant="outline" className="justify-center">Press de banca</Badge>
                    <Badge variant="outline" className="justify-center">Peso muerto</Badge>
                    <Badge variant="outline" className="justify-center">Dominadas</Badge>
                    <Badge variant="outline" className="justify-center">Flexiones</Badge>
                    <Badge variant="outline" className="justify-center">Zancadas</Badge>
                    <Badge variant="outline" className="justify-center">Press militar</Badge>
                    <Badge variant="outline" className="justify-center">Remo con barra</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <ExerciseLibrary />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <AIAssessmentWizard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Configuración de IA</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personalización de IA</CardTitle>
                <CardDescription>
                  Configura cómo funciona el núcleo de IA para adaptarse a tus preferencias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Nivel de personalización</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="low">Bajo - Recomendaciones generales</option>
                      <option value="medium" selected>Medio - Equilibrio entre general y personalizado</option>
                      <option value="high">Alto - Completamente personalizado</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Determina cuánto se personalizan las recomendaciones según tus datos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium">Velocidad de adaptación</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="slow">Lenta - Cambios graduales</option>
                      <option value="medium" selected>Media - Equilibrio entre estabilidad y adaptación</option>
                      <option value="fast">Rápida - Adaptación inmediata</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Controla qué tan rápido se adapta la IA a tus nuevos datos y feedback
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="font-medium">Fuentes de datos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="wearable-data" checked />
                      <label htmlFor="wearable-data">Datos de wearables</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="sleep-data" checked />
                      <label htmlFor="sleep-data">Datos de sueño</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nutrition-data" checked />
                      <label htmlFor="nutrition-data">Datos de nutrición</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="workout-data" checked />
                      <label htmlFor="workout-data">Datos de entrenamiento</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="mental-data" checked />
                      <label htmlFor="mental-data">Datos de bienestar mental</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="form-data" checked />
                      <label htmlFor="form-data">Análisis de forma</label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="font-medium">Privacidad y datos</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="data-collection" checked />
                      <label htmlFor="data-collection">Permitir recopilación de datos para mejorar la IA</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="anonymous-data" checked />
                      <label htmlFor="anonymous-data">Compartir datos anónimos para investigación</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="third-party" />
                      <label htmlFor="third-party">Permitir integración con servicios de terceros</label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tus datos siempre se mantienen seguros y encriptados. Puedes solicitar la eliminación de tus datos en cualquier momento.
                  </p>
                </div>
              </CardContent>
              <div className="px-6 py-4 flex justify-end">
                <Button>Guardar configuración</Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conexiones con dispositivos</CardTitle>
                <CardDescription>
                  Gestiona tus conexiones con wearables y otros dispositivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Fitbit Sense</h3>
                        <p className="text-xs text-gray-500">Conectado • Última sincronización: hace 2 horas</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Desconectar</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Apple Health</h3>
                        <p className="text-xs text-gray-500">Conectado • Última sincronización: hace 1 día</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Desconectar</Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Conectar nuevo dispositivo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
