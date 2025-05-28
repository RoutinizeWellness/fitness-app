"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Utensils,
  Sparkles,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import NutritionAssessment from "@/components/nutrition/nutrition-assessment"
import { getNutritionProfile } from "@/lib/nutrition-personalization-service"
import { generateMealPlan } from "@/lib/meal-plan-generator-fixed"

export default function GenerateNutritionPlanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("assessment")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasAssessment, setHasAssessment] = useState(false)

  // Verificar si el usuario ya tiene una evaluación
  useEffect(() => {
    const checkAssessment = async () => {
      if (!user) return

      try {
        const { data, error } = await getNutritionProfile(user.id)

        if (!error && data) {
          setHasAssessment(true)
        }
      } catch (error) {
        console.error("Error al verificar la evaluación:", error)
      }
    }

    checkAssessment()
  }, [user])

  // Generar plan de alimentación
  const handleGeneratePlan = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para generar un plan",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Obtener el perfil nutricional
      const { data: profile, error: profileError } = await getNutritionProfile(user.id)

      if (profileError) {
        console.error("Error al obtener el perfil nutricional:", profileError)
        throw new Error("No se pudo obtener el perfil nutricional")
      }

      if (!profile) {
        console.error("Perfil nutricional no encontrado")
        throw new Error("No se encontró el perfil nutricional. Por favor, completa la evaluación primero.")
      }

      // Generar el plan
      console.log("Generando plan con perfil:", profile)
      const plan = await generateMealPlan(user.id, profile)

      if (!plan) {
        console.error("El generador de planes devolvió null")
        throw new Error("No se pudo generar el plan de alimentación")
      }

      console.log("Plan generado exitosamente:", plan.id)
      toast({
        title: "Plan generado",
        description: "Tu plan de alimentación ha sido generado con éxito",
      })

      // Redirigir a la página del plan
      router.push("/nutrition")
    } catch (error: any) {
      console.error("Error al generar el plan:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el plan de alimentación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Generar Plan Nutricional</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="assessment" className="flex items-center">
            <Utensils className="h-4 w-4 mr-2" />
            Evaluación
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center" disabled={!hasAssessment}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generar Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <NutritionAssessment />

          {hasAssessment && (
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("generate")}>
                Continuar a Generación
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Generación de Plan Nutricional Personalizado
              </CardTitle>
              <CardDescription>
                Nuestro sistema de IA generará un plan de alimentación personalizado basado en tu evaluación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">¿Qué incluye tu plan nutricional personalizado?</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Plan de 7 días con comidas adaptadas a tus preferencias</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Distribución de macronutrientes según tu objetivo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Recetas sencillas y deliciosas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Consideración de alergias e intolerancias</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Lista de compra automática</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar Mi Plan Nutricional
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500">
              <p>Puedes modificar tu plan después de generarlo</p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
