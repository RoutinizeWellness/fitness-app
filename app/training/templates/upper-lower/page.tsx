"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { MesocycleProgressVisualization } from "@/components/training/mesocycle-progress-visualization"
import { FatigueManagementSystem } from "@/components/training/fatigue-management-system"
import { ExerciseDemonstration } from "@/components/training/exercise-demonstration"
import { createUpperLowerTemplate } from "@/lib/templates/upper-lower-template"
import { saveWorkoutRoutine } from "@/lib/supabase-training"
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  BarChart3,
  Zap,
  Award,
  Clock,
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react"

export default function UpperLowerTemplatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Función para crear la rutina a partir de la plantilla
  const createRoutineFromTemplate = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una rutina",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)

    try {
      // Crear la rutina basada en la plantilla Upper/Lower
      const routine = createUpperLowerTemplate(user.id)

      // Guardar la rutina en Supabase
      const { data, error } = await saveWorkoutRoutine(routine)

      if (error) throw error

      toast({
        title: "Rutina creada",
        description: "La rutina Upper/Lower se ha creado correctamente",
      })

      // Redirigir a la página de entrenamiento
      router.push("/training")
    } catch (error) {
      console.error("Error al crear la rutina:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la rutina. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <RoutinizeLayout activeTab="training" title="Upper/Lower Split">
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
          <h1 className="text-2xl font-bold">Upper/Lower Split</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card3D>
              <Card3DHeader>
                <Card3DTitle gradient={true}>Upper/Lower Split Avanzado</Card3DTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50">Científica</Badge>
                  <Badge variant="outline" className="bg-green-50">Hipertrofia</Badge>
                  <Badge variant="outline" className="bg-purple-50">Fuerza</Badge>
                </div>
              </Card3DHeader>
              <Card3DContent>
                <p className="text-gray-600 mb-4">
                  Rutina de 4 días dividida en tren superior e inferior con técnicas avanzadas para maximizar la hipertrofia muscular.
                  Incluye periodización y semanas de descarga programadas para optimizar el progreso y la recuperación.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Dumbbell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nivel</p>
                      <p className="font-medium">Intermedio-Avanzado</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duración</p>
                      <p className="font-medium">12 semanas</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Frecuencia</p>
                      <p className="font-medium">4 días por semana</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <RefreshCw className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deload</p>
                      <p className="font-medium">Cada 4 semanas</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-3 justify-end">
                  <Button3D variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button3D>
                  <Button3D variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button3D>
                  <Button3D
                    onClick={createRoutineFromTemplate}
                    disabled={isCreating}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isCreating ? "Creando..." : "Usar esta plantilla"}
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          </div>

          <div>
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Beneficios clave</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Equilibrio perfecto entre frecuencia, volumen y recuperación</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Ideal para desarrollo de fuerza e hipertrofia</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Periodización científica para maximizar resultados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Incluye técnicas avanzadas como series descendentes y rest-pause</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Sistema de gestión de fatiga integrado</span>
                  </li>
                </ul>
              </Card3DContent>
            </Card3D>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Visión general</TabsTrigger>
            <TabsTrigger value="structure">Estructura</TabsTrigger>
            <TabsTrigger value="progression">Progresión</TabsTrigger>
            <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Descripción general</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <p className="text-gray-600 mb-4">
                  El Upper/Lower Split es una de las divisiones de entrenamiento más eficientes y versátiles.
                  Divide el cuerpo en dos partes principales: tren superior (pecho, espalda, hombros, brazos)
                  y tren inferior (piernas, glúteos, core), permitiendo entrenar cada parte dos veces por semana
                  con suficiente recuperación entre sesiones.
                </p>
                <p className="text-gray-600 mb-4">
                  Esta plantilla avanzada incorpora principios científicos de periodización, gestión de fatiga
                  y técnicas especializadas para maximizar tanto la hipertrofia como la fuerza. El programa está
                  diseñado para 4 días de entrenamiento por semana, típicamente organizados como:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600">
                  <li>Lunes: Tren Superior A (enfocado en pecho/espalda)</li>
                  <li>Martes: Tren Inferior A (enfocado en cuádriceps)</li>
                  <li>Jueves: Tren Superior B (enfocado en hombros/brazos)</li>
                  <li>Viernes: Tren Inferior B (enfocado en isquiotibiales/glúteos)</li>
                </ul>
                <p className="text-gray-600">
                  El programa incluye semanas de descarga programadas cada 4 semanas para optimizar la recuperación
                  y prevenir el sobreentrenamiento, permitiendo progresar de manera sostenible durante las 12 semanas
                  completas del programa.
                </p>
              </Card3DContent>
            </Card3D>

            <MesocycleProgressVisualization />
          </TabsContent>

          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Tren Superior A</Card3DTitle>
                  <Badge>Pecho/Espalda enfocado</Badge>
                </Card3DHeader>
                <Card3DContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Press de banca</p>
                        <p className="text-sm text-gray-500">4 series x 6-8 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Remo con barra</p>
                        <p className="text-sm text-gray-500">4 series x 8-10 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Press inclinado con mancuernas</p>
                        <p className="text-sm text-gray-500">3 series x 8-10 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Dominadas</p>
                        <p className="text-sm text-gray-500">3 series x 8-12 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Press militar</p>
                        <p className="text-sm text-gray-500">3 series x 8-10 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Curl de bíceps con barra</p>
                        <p className="text-sm text-gray-500">3 series x 10-12 reps (RIR 1)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Extensiones de tríceps</p>
                        <p className="text-sm text-gray-500">3 series x 10-12 reps (RIR 1)</p>
                      </div>
                    </li>
                  </ul>
                </Card3DContent>
              </Card3D>

              <Card3D>
                <Card3DHeader>
                  <Card3DTitle>Tren Inferior A</Card3DTitle>
                  <Badge>Cuádriceps enfocado</Badge>
                </Card3DHeader>
                <Card3DContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Sentadilla con barra</p>
                        <p className="text-sm text-gray-500">4 series x 6-8 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Peso muerto rumano</p>
                        <p className="text-sm text-gray-500">3 series x 8-10 reps (RIR 1-2)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Prensa de piernas</p>
                        <p className="text-sm text-gray-500">3 series x 10-12 reps (RIR 1)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Extensiones de cuádriceps</p>
                        <p className="text-sm text-gray-500">3 series x 12-15 reps (RIR 0-1)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Elevaciones de pantorrilla</p>
                        <p className="text-sm text-gray-500">4 series x 12-15 reps (RIR 1)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Dumbbell className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Abdominales</p>
                        <p className="text-sm text-gray-500">3 series x 15-20 reps</p>
                      </div>
                    </li>
                  </ul>
                </Card3DContent>
              </Card3D>
            </div>
          </TabsContent>

          <TabsContent value="progression" className="space-y-6">
            <FatigueManagementSystem />

            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Sistema de progresión</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <p className="text-gray-600 mb-4">
                  Esta plantilla utiliza un sistema de periodización ondulante modificada, donde la intensidad
                  y el volumen varían a lo largo del mesociclo para optimizar tanto la hipertrofia como la fuerza.
                </p>

                <div className="space-y-4 mb-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Semanas 1-3: Fase de acumulación</h3>
                    <p className="text-gray-600">
                      Enfoque en volumen moderado-alto con intensidad moderada. El RIR (Repeticiones en Reserva)
                      comienza en 2-3 y progresa a 1-2 a medida que avanza la fase.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Semana 4: Deload</h3>
                    <p className="text-gray-600">
                      Reducción del 40% en volumen y 20% en intensidad para permitir la recuperación completa
                      antes de la siguiente fase.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Semanas 5-7: Fase de intensificación</h3>
                    <p className="text-gray-600">
                      Aumento de la intensidad con volumen moderado. El RIR se reduce a 0-1 en los ejercicios
                      principales para maximizar las ganancias de fuerza.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Semana 8: Deload</h3>
                    <p className="text-gray-600">
                      Segunda semana de descarga para preparar el cuerpo para la fase final.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Semanas 9-11: Fase de especialización</h3>
                    <p className="text-gray-600">
                      Incorporación de técnicas avanzadas como series descendentes, rest-pause y supersets
                      para maximizar la hipertrofia y romper plateaus.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2">Semana 12: Deload final</h3>
                    <p className="text-gray-600">
                      Descarga final antes de comenzar un nuevo ciclo o cambiar de programa.
                    </p>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <ExerciseDemonstration />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center">
          <Button3D variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a plantillas
          </Button3D>

          <Button3D onClick={createRoutineFromTemplate} disabled={isCreating}>
            <Zap className="h-4 w-4 mr-2" />
            {isCreating ? "Creando..." : "Usar esta plantilla"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button3D>
        </div>
      </div>
    </RoutinizeLayout>
  )
}
