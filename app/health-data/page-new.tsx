"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Heart,
  LineChart,
  Moon,
  RefreshCw,
  Watch,
  Dumbbell,
  Smartphone,
  Bluetooth,
  Settings
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { HealthDataDisplay } from "@/components/health-data-display"
import { useHealthData } from "@/hooks/use-health-data"
import { toast } from "@/components/ui/use-toast"

export default function HealthDataNewPage() {
  const router = useRouter()
  const { healthStats, isLoading, error } = useHealthData()
  const [activeTab, setActiveTab] = useState("activity")

  // Efecto para mostrar errores
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }, [error])

  // Función para refrescar datos
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-md mx-auto p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-4">
            <h1 className="font-bold">Datos de Salud</h1>
            <p className="text-sm text-gray-500">Sincronizado en tiempo real</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sensores Activos</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/connect-device")}>
              Gestionar
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Card className="border-none shadow-sm min-w-[140px]">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-green-100 text-green-600 rounded-full p-2 mb-2">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Acelerómetro</div>
                <div className="text-xs text-green-500">Activo</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-w-[140px]">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-red-100 text-red-600 rounded-full p-2 mb-2">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Ritmo Cardíaco</div>
                <div className="text-xs text-green-500">Activo</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-w-[140px]">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-2 mb-2">
                  <Bluetooth className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Añadir Dispositivo</div>
                <div className="text-xs text-primary">Conectar</div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="heart">Corazón</TabsTrigger>
              <TabsTrigger value="sleep">Sueño</TabsTrigger>
              <TabsTrigger value="settings">Ajustes</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Actividad de Hoy</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Pasos - Datos en tiempo real */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                              <Activity className="h-4 w-4" />
                            </div>
                            <div className="text-sm font-medium">Pasos</div>
                          </div>
                          <div className="text-sm font-medium">
                            {healthStats?.steps.current.toLocaleString()} / {healthStats?.steps.goal.toLocaleString()}
                          </div>
                        </div>
                        <Progress value={healthStats?.steps.percentage} className="h-2" />
                      </div>

                      {/* Calorías - Datos en tiempo real */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-orange-100 text-orange-600 rounded-md p-1.5 mr-3">
                              <Flame className="h-4 w-4" />
                            </div>
                            <div className="text-sm font-medium">Calorías</div>
                          </div>
                          <div className="text-sm font-medium">
                            {healthStats?.calories.burned} / {healthStats?.calories.goal} kcal
                          </div>
                        </div>
                        <Progress value={healthStats?.calories.percentage} className="h-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heart" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Ritmo Cardíaco</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="relative">
                        <div className="text-5xl font-bold text-center">{healthStats?.heart_rate.current}</div>
                        <div className="text-sm text-gray-500 text-center">BPM</div>
                        <Heart className="absolute -top-2 -right-6 h-6 w-6 text-red-500 animate-pulse" />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                        style={{ width: '100%' }}
                      />
                      {!isLoading && healthStats && (
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-black"
                          style={{
                            left: `${Math.min(100, Math.max(0, (healthStats.heart_rate.current - 40) / 1.4))}%`,
                            transform: 'translateX(-50%)'
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Reposo</span>
                      <span>Normal</span>
                      <span>Activo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Sueño</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-3xl font-bold">{healthStats?.sleep.duration}h</div>
                          <div className="text-sm text-gray-500">Tiempo total de sueño</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Meta: {healthStats?.sleep.goal}h</div>
                          <div className="text-sm text-gray-500">
                            {healthStats?.sleep.percentage.toFixed(0)}% completado
                          </div>
                        </div>
                      </div>

                      <Progress value={healthStats?.sleep.percentage} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Configuración</CardTitle>
                  <CardDescription>Ajusta tus metas y preferencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Permisos de sensores</div>
                      <Button variant="outline" size="sm">Gestionar</Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Metas diarias</div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Sincronización</div>
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Privacidad</div>
                      <Button variant="outline" size="sm">Ajustes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function Flame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}
