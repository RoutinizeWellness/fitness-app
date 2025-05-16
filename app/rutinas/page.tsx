"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Dumbbell, Plus, Edit, Trash2, Copy, Play } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import RutinasPersonalizadas from "@/components/rutinas-personalizadas"
import { Skeleton } from "@/components/ui/skeleton"

export default function RutinasPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("mis-rutinas")
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  const handleStartWorkout = (routineId: string) => {
    router.push(`/workout-active?routineId=${routineId}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">Rutinas de Entrenamiento</h1>
          <div className="w-9"></div> {/* Spacer para centrar el título */}
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold">Mis Rutinas</h2>
            <p className="text-muted-foreground">
              Crea y gestiona tus rutinas de entrenamiento personalizadas
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : user ? (
            <RutinasPersonalizadas
              userId={user.id}
              onRoutineSelected={(routine) => handleStartWorkout(routine.id)}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Inicia sesión para ver tus rutinas</h3>
                <p className="text-muted-foreground mb-4">
                  Necesitas iniciar sesión para crear y gestionar tus rutinas de entrenamiento
                </p>
                <Button onClick={() => router.push("/login")}>
                  Iniciar Sesión
                </Button>
              </CardContent>
            </Card>
          )}

          <Separator className="my-8" />

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-bold">Consejos para crear rutinas efectivas</h2>
              <p className="text-muted-foreground">
                Sigue estos consejos para diseñar rutinas de entrenamiento efectivas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Principio de Sobrecarga Progresiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Aumenta gradualmente la intensidad (peso, repeticiones o series) para seguir progresando.
                  El cuerpo se adapta a los estímulos, por lo que necesitas desafiarlo constantemente.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variedad de Ejercicios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Incluye diferentes ejercicios para cada grupo muscular para estimular todas las fibras
                  musculares y prevenir el estancamiento.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Descanso Adecuado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Permite suficiente tiempo de recuperación entre entrenamientos del mismo grupo muscular
                  (generalmente 48-72 horas). El músculo crece durante el descanso, no durante el entrenamiento.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estructura Balanceada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Diseña rutinas que trabajen todos los grupos musculares de forma equilibrada para evitar
                  desequilibrios y posibles lesiones.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
