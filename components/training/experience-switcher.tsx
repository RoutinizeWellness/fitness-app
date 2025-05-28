"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dumbbell,
  Award,
  TrendingUp,
  Zap,
  ChevronRight,
  BarChart,
  Calendar,
  Calculator
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import { supabase } from "@/lib/supabase-client"
import { processSupabaseResponse } from "@/lib/supabase-utils"
import { useToast } from "@/components/ui/use-toast"

interface ExperienceSwitcherProps {
  className?: string
  onClose?: () => void
}

export function ExperienceSwitcher({ className, onClose }: ExperienceSwitcherProps) {
  const [activeTab, setActiveTab] = useState("beginner")
  const [userExperience, setUserExperience] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  // Load user experience level when component mounts
  useEffect(() => {
    if (user) {
      loadUserExperience()
    }
  }, [user])

  // Load user experience level from Supabase
  const loadUserExperience = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('training_profiles')
          .select('experience_level')
          .eq('user_id', user.id)
          .single(),
        null,
        "Carga de perfil de entrenamiento"
      )

      if (error) {
        console.error("Error loading user experience:", error)
        return
      }

      if (data) {
        setUserExperience(data.experience_level)
        setActiveTab(data.experience_level === "advanced" || data.experience_level === "elite" ? "advanced" : "beginner")
      }
    } catch (error) {
      console.error("Error in loadUserExperience:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save user experience level to Supabase
  const saveUserExperience = async (experience: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar tu nivel de experiencia",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error, usingFallback } = processSupabaseResponse(
        await supabase
          .from('training_profiles')
          .upsert({
            user_id: user.id,
            experience_level: experience,
            updated_at: new Date().toISOString()
          })
          .select(),
        null,
        "Guardado de perfil de entrenamiento"
      )

      if (error) {
        console.error("Error saving user experience:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar tu nivel de experiencia",
          variant: "destructive"
        })
        return
      }

      setUserExperience(experience)

      toast({
        title: "Perfil actualizado",
        description: "Tu nivel de experiencia ha sido actualizado correctamente"
      })

      // Navigate to the appropriate page
      if (experience === "beginner") {
        router.push("/training/beginner")
      } else {
        router.push("/training/advanced")
      }

      // Close the modal if onClose is provided
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Error in saveUserExperience:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar tu nivel de experiencia",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedFade className={className}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Selecciona tu Nivel de Experiencia</CardTitle>
          <CardDescription>
            Personaliza tu experiencia de entrenamiento según tu nivel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="beginner">Principiante</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            <TabsContent value="beginner" className="space-y-4 pt-4">
              <AnimatedSlide>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Dumbbell className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Modo Principiante</h3>
                      <p className="text-muted-foreground">
                        Diseñado para personas que están comenzando su viaje fitness o tienen menos de 1 año de experiencia.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Características del Modo Principiante:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Fundamentos Claros</h5>
                          <p className="text-sm text-muted-foreground">
                            Explicaciones detalladas de técnicas y conceptos básicos.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Dumbbell className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Rutinas Simplificadas</h5>
                          <p className="text-sm text-muted-foreground">
                            Programas de entrenamiento fáciles de seguir con progresión gradual.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Zap className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Guía Paso a Paso</h5>
                          <p className="text-sm text-muted-foreground">
                            Instrucciones detalladas para cada ejercicio con vídeos demostrativos.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Seguimiento Simple</h5>
                          <p className="text-sm text-muted-foreground">
                            Sistema de seguimiento de progreso fácil de entender y utilizar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => saveUserExperience("beginner")}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          Seleccionar Modo Principiante
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AnimatedSlide>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <AnimatedSlide>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <BarChart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Modo Avanzado</h3>
                      <p className="text-muted-foreground">
                        Diseñado para atletas con experiencia que buscan optimizar su rendimiento y resultados.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Características del Modo Avanzado:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Calculator className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Calculadoras Avanzadas</h5>
                          <p className="text-sm text-muted-foreground">
                            Herramientas para calcular RM, volumen óptimo y más.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Periodización</h5>
                          <p className="text-sm text-muted-foreground">
                            Planificación de macrociclos, mesociclos y microciclos.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Análisis Detallado</h5>
                          <p className="text-sm text-muted-foreground">
                            Seguimiento y análisis detallado de métricas de rendimiento.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">Técnicas Especializadas</h5>
                          <p className="text-sm text-muted-foreground">
                            Métodos avanzados como series descendentes, rest-pause y más.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => saveUserExperience("advanced")}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          Seleccionar Modo Avanzado
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AnimatedSlide>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Puedes cambiar tu nivel en cualquier momento</span>
          </div>
        </CardFooter>
      </Card>
    </AnimatedFade>
  )
}
