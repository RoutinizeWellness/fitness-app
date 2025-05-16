"use client"

import { useState, useEffect } from "react"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Battery,
  BarChart,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  BatteryCharging,
  BatteryWarning
} from "lucide-react"
import { FatigueAnalysis } from "@/components/training/fatigue-analysis"
import { AdaptiveRecommendations } from "@/components/training/adaptive-recommendations"
import { WeightRecommendationChart } from "@/components/training/weight-recommendation-chart"
import {
  getUserFatigue,
  getTrainingPreferences,
  learnFromWorkoutPatterns
} from "@/lib/adaptive-learning-service"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

export default function TrainingAnalysisPage() {
  const [activeTab, setActiveTab] = useState("fatigue")
  const [userId, setUserId] = useState<string | null>(null)
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [routines, setRoutines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLearning, setIsLearning] = useState(false)
  const { toast } = useToast()

  // Obtener el usuario actual y cargar datos
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Error al obtener usuario:", userError)
          return
        }

        setUserId(user.id)

        // Cargar registros de entrenamiento
        const { data: logs, error: logsError } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (logsError) {
          console.error("Error al cargar registros de entrenamiento:", logsError)
        } else if (logs) {
          setWorkoutLogs(logs)
        }

        // Cargar rutinas
        const { data: routinesData, error: routinesError } = await supabase
          .from('workout_routines')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (routinesError) {
          console.error("Error al cargar rutinas:", routinesError)
        } else if (routinesData) {
          setRoutines(routinesData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Iniciar aprendizaje de patrones
  const handleLearnPatterns = async () => {
    if (!userId || workoutLogs.length === 0) return

    setIsLearning(true)

    try {
      const updatedPreferences = await learnFromWorkoutPatterns(userId, workoutLogs)

      if (updatedPreferences) {
        toast({
          title: "Aprendizaje completado",
          description: "Se han actualizado tus preferencias de entrenamiento basadas en tus patrones"
        })
      } else {
        toast({
          title: "Aprendizaje incompleto",
          description: "No hay suficientes datos para aprender patrones significativos"
        })
      }
    } catch (error) {
      console.error("Error al aprender patrones:", error)
      toast({
        title: "Error",
        description: "No se pudieron analizar los patrones de entrenamiento",
        variant: "destructive"
      })
    } finally {
      setIsLearning(false)
    }
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Análisis de entrenamiento</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="fatigue" className="flex items-center">
              <Battery className="h-4 w-4 mr-2" />
              <span>Fatiga</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              <span>Patrones</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              <span>Recomendaciones</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fatigue">
            {userId && (
              <FatigueAnalysis
                userId={userId}
                workoutLogs={workoutLogs}
              />
            )}
          </TabsContent>

          <TabsContent value="patterns">
            <Card3D className="p-4 mb-4">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Patrones de entrenamiento</h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              ) : workoutLogs.length < 5 ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Se necesitan al menos 5 entrenamientos registrados para detectar patrones significativos.
                    Actualmente tienes {workoutLogs.length} entrenamientos.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      Continúa registrando tus entrenamientos para obtener recomendaciones personalizadas.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-md p-3">
                        <p className="text-xs text-gray-500 mb-1">Hora preferida</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-600" />
                          <p className="text-sm font-medium">Tarde</p>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-md p-3">
                        <p className="text-xs text-gray-500 mb-1">Frecuencia</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-green-600" />
                          <p className="text-sm font-medium">4 días/semana</p>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-md p-3">
                        <p className="text-xs text-gray-500 mb-1">Duración</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-purple-600" />
                          <p className="text-sm font-medium">65 minutos</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-md p-3">
                        <p className="text-xs text-gray-500 mb-1">Ejercicios</p>
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-1 text-amber-600" />
                          <p className="text-sm font-medium">7 por sesión</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Tendencias detectadas</h4>
                      <ul className="space-y-2 text-xs text-gray-600">
                        <li className="flex items-start">
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1 mt-0.5" />
                          <span>Mayor rendimiento en entrenamientos de tarde</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowDown className="h-3 w-3 text-red-600 mr-1 mt-0.5" />
                          <span>Menor rendimiento después de 3 días consecutivos</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1 mt-0.5" />
                          <span>Mejor recuperación con 48h entre grupos musculares</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Button3D
                    className="w-full"
                    onClick={handleLearnPatterns}
                    disabled={isLearning}
                  >
                    {isLearning ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                        Analizando patrones...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Actualizar análisis de patrones
                      </>
                    )}
                  </Button3D>
                </div>
              )}
            </Card3D>

            <Card3D className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Progreso de entrenamiento</h3>
              </div>

              <div className="h-40 flex items-end justify-between mb-4">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => {
                  // Simular datos de volumen de entrenamiento
                  const height = Math.random() * 80 + 20

                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className="bg-primary rounded-t-md w-8"
                        style={{ height: `${height}px` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-1">{day}</p>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Volumen semanal</p>
                  <p className="text-sm font-medium">12,450 kg</p>
                </div>

                <div className="bg-green-50 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Series totales</p>
                  <p className="text-sm font-medium">86 series</p>
                </div>
              </div>
            </Card3D>
          </TabsContent>

          <TabsContent value="recommendations">
            {userId && routines.length > 0 && (
              <>
                <AdaptiveRecommendations
                  userId={userId}
                  routine={routines[0]}
                  workoutLogs={workoutLogs}
                />

                {/* Recomendaciones de peso para ejercicios populares */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Recomendaciones de peso</h3>

                  <div className="space-y-6">
                    {/* Press de banca */}
                    <WeightRecommendationChart
                      userId={userId}
                      exerciseId="bench-press"
                      exerciseName="Press de banca"
                      workoutLogs={workoutLogs}
                      targetReps={8}
                      targetRir={2}
                    />

                    {/* Sentadilla */}
                    <WeightRecommendationChart
                      userId={userId}
                      exerciseId="squat"
                      exerciseName="Sentadilla"
                      workoutLogs={workoutLogs}
                      targetReps={8}
                      targetRir={2}
                    />
                  </div>
                </div>
              </>
            )}

            {(!userId || routines.length === 0) && (
              <Card3D className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Recomendaciones adaptativas</h3>
                </div>
                <p className="text-sm text-gray-500">
                  No hay rutinas activas para generar recomendaciones.
                  Crea una rutina de entrenamiento para recibir recomendaciones personalizadas.
                </p>
              </Card3D>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoutinizeLayout>
  )
}
