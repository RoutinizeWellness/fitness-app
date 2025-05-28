"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Calendar, History, Settings, Sparkles } from "lucide-react"
import WorkoutCalendar from "@/components/training/workout-calendar"
import GeneralFitnessPlan from "@/components/training/general-fitness-plan"
import WorkoutProgressCard from "@/components/training/workout-progress-card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function GeneralFitnessPage() {
  const [activeTab, setActiveTab] = useState("plan")
  const { toast } = useToast()
  const router = useRouter()

  const handleEditPlan = () => {
    toast({
      title: "Edición de plan",
      description: "La funcionalidad de edición de planes estará disponible próximamente.",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plan de Fitness General</h1>
          <p className="text-muted-foreground">
            Tu plan personalizado para mejorar tu condición física general
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditPlan}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button onClick={() => router.push("/training/history")}>
            <History className="h-4 w-4 mr-2" />
            Historial
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="plan" className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2" />
            Plan de Entrenamiento
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Recomendaciones IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <GeneralFitnessPlan />
            </div>
            <div className="md:col-span-1">
              <WorkoutProgressCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <WorkoutCalendar />
            </div>
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Entrenamientos</CardTitle>
                  <CardDescription>
                    Tus próximas sesiones programadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs mr-3">
                          L
                        </div>
                        <div>
                          <p className="font-medium">Día 1: Piernas</p>
                          <p className="text-xs text-muted-foreground">Lunes, 9:00 AM</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/training/start-workout/day-1')}>
                        Ver
                      </Button>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs mr-3">
                          X
                        </div>
                        <div>
                          <p className="font-medium">Día 3: Hombros y Brazos</p>
                          <p className="text-xs text-muted-foreground">Miércoles, 9:00 AM</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/training/start-workout/day-3')}>
                        Ver
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs mr-3">
                          V
                        </div>
                        <div>
                          <p className="font-medium">Día 5: Cuerpo Completo</p>
                          <p className="text-xs text-muted-foreground">Viernes, 9:00 AM</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/training/start-workout/day-5')}>
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de IA</CardTitle>
              <CardDescription>
                Recomendaciones personalizadas basadas en tu progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Recomendaciones en desarrollo</h3>
                <p className="text-muted-foreground mb-4">
                  Esta funcionalidad estará disponible próximamente
                </p>
                <Button variant="outline" onClick={() => setActiveTab("plan")}>
                  Volver al Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
