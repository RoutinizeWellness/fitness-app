"use client"

import { useState, useEffect } from "react"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Moon,
  Calendar,
  BarChart,
  PlusCircle,
  Clock,
  ChevronRight,
  Bed,
  Sunrise,
  Sunset,
  AlarmClock
} from "lucide-react"
import {
  SleepEntry,
  SleepGoal,
  getSleepEntries,
  getSleepGoals,
  saveSleepEntry
} from "@/lib/sleep-service"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

export default function SleepPage() {
  const [activeTab, setActiveTab] = useState("tracker")
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [sleepGoal, setSleepGoal] = useState<SleepGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }

    fetchUser()
  }, [])

  // Cargar registros de sueño
  useEffect(() => {
    const loadSleepEntries = async () => {
      if (!userId) return

      try {
        const { data, error } = await getSleepEntries(userId, { limit: 10 })

        if (error) {
          console.error("Error al cargar registros de sueño:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los registros de sueño",
            variant: "destructive"
          })
          return
        }

        if (data) {
          setSleepEntries(data)
        }
      } catch (error) {
        console.error("Error al cargar registros de sueño:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSleepEntries()
  }, [userId, toast])

  // Cargar objetivos de sueño
  useEffect(() => {
    const loadSleepGoals = async () => {
      if (!userId) return

      try {
        const { data, error } = await getSleepGoals(userId)

        if (error) {
          console.error("Error al cargar objetivos de sueño:", error)
          return
        }

        if (data) {
          setSleepGoal(data)
        }
      } catch (error) {
        console.error("Error al cargar objetivos de sueño:", error)
      }
    }

    loadSleepGoals()
  }, [userId])

  // Crear un nuevo registro de sueño
  const createSleepEntry = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrar tu sueño",
        variant: "destructive"
      })
      return
    }

    // Obtener la fecha actual
    const today = new Date().toISOString().split('T')[0]

    // Crear un nuevo registro
    const newEntry: SleepEntry = {
      id: uuidv4(),
      userId,
      date: today,
      startTime: "23:00",
      endTime: "07:00",
      duration: 8 * 60, // 8 horas en minutos
      quality: 4,
      deepSleep: 120,
      remSleep: 90,
      lightSleep: 240,
      awakeTime: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      const { data, error } = await saveSleepEntry(newEntry)

      if (error) {
        console.error("Error al guardar registro de sueño:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el registro de sueño",
          variant: "destructive"
        })
        return
      }

      if (data) {
        setSleepEntries(prev => [data, ...prev])
        toast({
          title: "Éxito",
          description: "Registro de sueño guardado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al guardar registro de sueño:", error)
    }
  }

  // Renderizar el rastreador de sueño
  const renderSleepTracker = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Card organic={true} className="p-6">
          <OrganicSection title="Registrar sueño">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Hora de acostarse</p>
              <div className="flex items-center">
                <Sunset className="h-4 w-4 mr-2 text-orange-500" />
                <input
                  type="time"
                  defaultValue="23:00"
                  className="border rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Hora de despertar</p>
              <div className="flex items-center">
                <Sunrise className="h-4 w-4 mr-2 text-yellow-500" />
                <input
                  type="time"
                  defaultValue="07:00"
                  className="border rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Calidad del sueño</p>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map(value => (
                <Button
                  key={value}
                  variant={value === 4 ? "default" : "outline"}
                  className="flex-1 mx-1 rounded-full"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full rounded-full" onClick={createSleepEntry}>
            Guardar registro
          </Button>
        </OrganicSection>
        </Card>

        <h3 className="font-semibold mb-3">Registros recientes</h3>
        {sleepEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay registros de sueño</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sleepEntries.map(entry => (
              <Card key={entry.id} organic={true} hover={true} className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Sunset className="h-3 w-3 mr-1 text-orange-500" />
                      <span>{entry.startTime}</span>
                      <span className="mx-1">-</span>
                      <Sunrise className="h-3 w-3 mr-1 text-yellow-500" />
                      <span>{entry.endTime}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</span>
                      <span className="mx-2">•</span>
                      <span>Calidad: {entry.quality}/5</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Detalles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Renderizar los objetivos de sueño
  const renderSleepGoals = () => {
    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} className="p-6">
            <OrganicSection title="Mis objetivos de sueño">
              {sleepGoal ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Duración objetivo</p>
                      <p className="font-medium">{Math.floor(sleepGoal.targetDuration / 60)}h {sleepGoal.targetDuration % 60}m</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Editar
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-2">Hora de acostarse</p>
                      <div className="flex items-center">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-2">
                          <Sunset className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                        </div>
                        <p className="font-medium">{sleepGoal.targetBedtime}</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                      <p className="text-sm text-gray-500 mb-2">Hora de despertar</p>
                      <div className="flex items-center">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mr-2">
                          <Sunrise className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <p className="font-medium">{sleepGoal.targetWakeTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">No has establecido objetivos de sueño</p>
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      if (userId) {
                        const defaultGoal = {
                          userId,
                          targetDuration: 480, // 8 horas en minutos
                          targetBedtime: '22:30',
                          targetWakeTime: '06:30'
                        }
                        saveSleepGoals(defaultGoal)
                          .then(({ data, error }) => {
                            if (error) {
                              console.error("Error al establecer objetivos:", error)
                              toast({
                                title: "Error",
                                description: "No se pudieron establecer los objetivos de sueño",
                                variant: "destructive"
                              })
                            } else if (data) {
                              setSleepGoal(data)
                              toast({
                                title: "Éxito",
                                description: "Objetivos de sueño establecidos correctamente"
                              })
                            }
                          })
                      }
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Establecer objetivos
                  </Button>
                </div>
              )}
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.1}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Recomendaciones para mejorar tu sueño">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mr-3 mt-0.5 shadow-sm">
                    <AlarmClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Mantén un horario de sueño constante, incluso los fines de semana.</p>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2 mr-3 mt-0.5 shadow-sm">
                    <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Evita la cafeína y el alcohol antes de acostarte.</p>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 mr-3 mt-0.5 shadow-sm">
                    <Bed className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Crea un ambiente propicio para dormir: oscuro, silencioso y fresco.</p>
                </li>
              </ul>
            </OrganicSection>
          </Card>
        </OrganicElement>
      </div>
    )
  }

  // Renderizar las estadísticas de sueño
  const renderSleepStats = () => {
    // Calcular estadísticas básicas
    const totalEntries = sleepEntries.length

    if (totalEntries === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay suficientes datos para mostrar estadísticas</p>
        </div>
      )
    }

    const totalDuration = sleepEntries.reduce((acc, entry) => acc + entry.duration, 0)
    const avgDuration = totalDuration / totalEntries

    const totalQuality = sleepEntries.reduce((acc, entry) => acc + entry.quality, 0)
    const avgQuality = totalQuality / totalEntries

    // Calcular tiempo promedio en cada fase
    const entriesWithPhases = sleepEntries.filter(entry =>
      entry.deepSleep !== undefined &&
      entry.remSleep !== undefined &&
      entry.lightSleep !== undefined
    )

    let avgDeepSleep = 0
    let avgRemSleep = 0
    let avgLightSleep = 0

    if (entriesWithPhases.length > 0) {
      const totalDeepSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.deepSleep || 0), 0)
      const totalRemSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.remSleep || 0), 0)
      const totalLightSleep = entriesWithPhases.reduce((acc, entry) => acc + (entry.lightSleep || 0), 0)

      avgDeepSleep = totalDeepSleep / entriesWithPhases.length
      avgRemSleep = totalRemSleep / entriesWithPhases.length
      avgLightSleep = totalLightSleep / entriesWithPhases.length
    }

    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} className="p-6">
            <OrganicSection title="Resumen de sueño">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Duración promedio</p>
                  <p className="text-xl font-semibold">{Math.floor(avgDuration / 60)}h {Math.round(avgDuration % 60)}m</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Calidad promedio</p>
                  <p className="text-xl font-semibold">{avgQuality.toFixed(1)}/5</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Sueño profundo</p>
                  <p className="text-xl font-semibold">{Math.round(avgDeepSleep)} min</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Sueño REM</p>
                  <p className="text-xl font-semibold">{Math.round(avgRemSleep)} min</p>
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.1}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Duración del sueño (últimos 7 días)">
              <div className="h-40 flex items-end justify-between">
                {sleepEntries.slice(0, 7).reverse().map((entry, index) => {
                  // Calcular la altura de la barra según la duración del sueño
                  const maxHeight = 120 // Altura máxima en píxeles
                  const maxDuration = 10 * 60 // 10 horas en minutos
                  const height = Math.min((entry.duration / maxDuration) * maxHeight, maxHeight)

                  const date = new Date(entry.date)
                  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' })

                  return (
                    <div key={entry.id} className="flex flex-col items-center">
                      <div
                        className="bg-primary rounded-t-xl w-10"
                        style={{ height: `${height}px` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">{dayName}</p>
                    </div>
                  )
                })}
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>
      </div>
    )
  }

  return (
    <OrganicLayout
      activeTab="sleep"
      title="Sueño"
      showFloatingAction={true}
      floatingActionIcon={<PlusCircle className="h-6 w-6" />}
      onFloatingActionClick={createSleepEntry}
    >
      <OrganicElement type="fade">
        <h1 className="text-2xl font-bold mb-6">Sueño</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4 rounded-full p-1">
            <TabsTrigger value="tracker" className="flex items-center rounded-full">
              <Moon className="h-4 w-4 mr-2" />
              <span>Registro</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center rounded-full">
              <AlarmClock className="h-4 w-4 mr-2" />
              <span>Objetivos</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center rounded-full">
              <BarChart className="h-4 w-4 mr-2" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker">
            {renderSleepTracker()}
          </TabsContent>

          <TabsContent value="goals">
            {renderSleepGoals()}
          </TabsContent>

          <TabsContent value="stats">
            {renderSleepStats()}
          </TabsContent>
        </Tabs>
      </OrganicElement>
    </OrganicLayout>
  )
}
