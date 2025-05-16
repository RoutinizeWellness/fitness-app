"use client"

import { useState, useEffect } from "react"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Brain,
  Smile,
  Calendar,
  Activity,
  PlusCircle,
  Wind,
  Moon,
  Building,
  Shield,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { MoodEntry, WellnessActivity, getWellnessActivities, getMoodEntries } from "@/lib/wellness-service"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { SiestaTimer } from "@/components/wellness/siesta-timer"
import { MindfulnessExercises } from "@/components/wellness/mindfulness-exercises"
import EnhancedMindfulness from "@/components/wellness/enhanced-mindfulness"
import { CorporateWellness } from "@/components/wellness/corporate-wellness"

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState("mindfulness")
  const [activities, setActivities] = useState<WellnessActivity[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Cargar actividades de bienestar
  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return

      try {
        const { data, error } = await getWellnessActivities()

        if (error) {
          console.error("Error al cargar actividades:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las actividades de bienestar",
            variant: "destructive"
          })
          return
        }

        if (data) {
          setActivities(data)
        }
      } catch (error) {
        console.error("Error al cargar actividades:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [user, toast])

  // Cargar registros de estado de ánimo
  useEffect(() => {
    const loadMoodEntries = async () => {
      if (!user) return

      try {
        const { data, error } = await getMoodEntries(user.id, { limit: 10 })

        if (error) {
          console.error("Error al cargar registros de estado de ánimo:", error)
          return
        }

        if (data) {
          setMoodEntries(data)
        }
      } catch (error) {
        console.error("Error al cargar registros de estado de ánimo:", error)
      }
    }

    loadMoodEntries()
  }, [user])

  // Renderizar actividades por categoría
  const renderActivitiesByCategory = (category: string) => {
    const filteredActivities = activities.filter(activity => activity.category === category)

    if (filteredActivities.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay actividades disponibles en esta categoría</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map(activity => (
          <Card key={activity.id} organic={true} hover={true} className="p-5">
            <div className="flex flex-col h-full">
              {activity.imageUrl && (
                <div className="h-32 rounded-xl overflow-hidden mb-3">
                  <img
                    src={activity.imageUrl}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold mb-1">{activity.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{activity.description}</p>
              <div className="flex items-center text-xs text-gray-400 mb-3">
                <Clock className="h-3 w-3 mr-1" />
                <span>{activity.duration} min</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{activity.difficulty}</span>
              </div>
              <div className="mt-auto">
                <Button className="w-full rounded-full">
                  Comenzar actividad
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Renderizar el rastreador de estado de ánimo
  const renderMoodTracker = () => {
    return (
      <div>
        <Card organic={true} className="p-6 mb-4">
          <OrganicSection title="¿Cómo te sientes hoy?">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map(value => (
              <Button
                key={value}
                variant={value === 3 ? "default" : "outline"}
                className="flex-1 mx-1 rounded-full"
              >
                {value === 1 && "😔"}
                {value === 2 && "😐"}
                {value === 3 && "🙂"}
                {value === 4 && "😊"}
                {value === 5 && "😁"}
              </Button>
            ))}
          </div>
          <Button className="w-full rounded-full">
            Guardar estado de ánimo
          </Button>
        </OrganicSection>
        </Card>

        <h3 className="font-semibold mb-3">Historial reciente</h3>
        {moodEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay registros de estado de ánimo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moodEntries.map(entry => (
              <Card key={entry.id} organic={true} hover={true} className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{entry.date}</p>
                    <p className="text-sm text-gray-500">
                      Ánimo: {entry.mood}/5 • Energía: {entry.energy}/5 • Estrés: {entry.stress}/5
                    </p>
                  </div>
                  <div className="text-2xl">
                    {entry.mood === 1 && "😔"}
                    {entry.mood === 2 && "😐"}
                    {entry.mood === 3 && "🙂"}
                    {entry.mood === 4 && "😊"}
                    {entry.mood === 5 && "😁"}
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-500 mt-2">{entry.notes}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <OrganicLayout
      activeTab="wellness"
      title="Bienestar"
      profile={user}
      showFloatingAction={true}
      floatingActionIcon={<Heart className="h-6 w-6" />}
      onFloatingActionClick={() => setActiveTab("mood")}
    >
      <OrganicElement type="fade">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4 rounded-full p-1">
            <TabsTrigger value="mindfulness" className="flex items-center rounded-full">
              <Brain className="h-4 w-4 mr-2" />
              <span>Mindfulness</span>
            </TabsTrigger>
            <TabsTrigger value="siesta" className="flex items-center rounded-full">
              <Moon className="h-4 w-4 mr-2" />
              <span>Siesta</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center rounded-full">
              <Smile className="h-4 w-4 mr-2" />
              <span>Estado</span>
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center rounded-full">
              <Building className="h-4 w-4 mr-2" />
              <span>Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center rounded-full">
              <Activity className="h-4 w-4 mr-2" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mindfulness">
            {user && (
              <div className="space-y-4">
                <Card organic={true} className="p-6">
                  <OrganicSection title="Mindfulness Avanzado">
                    <div className="flex items-center mb-4">
                      <Badge variant="outline" className="bg-primary/10 mr-2">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA Avanzada
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        Nuevo
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Experimenta nuestra nueva experiencia de mindfulness mejorada con IA, diseñada para adaptarse a tus necesidades específicas.
                    </p>
                    <Button onClick={() => router.push("/wellness/mindfulness")}>
                      Probar ahora
                    </Button>
                  </OrganicSection>
                </Card>
                <MindfulnessExercises userId={user.id} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="siesta">
            {user && <SiestaTimer userId={user.id} />}
          </TabsContent>

          <TabsContent value="mood">
            {renderMoodTracker()}
          </TabsContent>

          <TabsContent value="corporate">
            {user && <CorporateWellness userId={user.id} companyId="default-company" />}
          </TabsContent>

          <TabsContent value="activities">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Actividades recomendadas</h3>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Nueva
                </Button>
              </div>

              <Tabs defaultValue="mental" className="mb-6">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="mental">Mental</TabsTrigger>
                  <TabsTrigger value="emotional">Emocional</TabsTrigger>
                  <TabsTrigger value="physical">Física</TabsTrigger>
                </TabsList>

                <TabsContent value="mental">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    renderActivitiesByCategory("mental")
                  )}
                </TabsContent>

                <TabsContent value="emotional">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    renderActivitiesByCategory("emotional")
                  )}
                </TabsContent>

                <TabsContent value="physical">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    renderActivitiesByCategory("physical")
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              <Card organic={true} className="p-6">
                <OrganicSection title="Resumen de bienestar">
                <p className="text-sm text-gray-500 mb-4">
                  Aquí podrás ver estadísticas sobre tu bienestar mental y emocional.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">Estado de ánimo promedio</p>
                    <p className="text-xl font-semibold">4.2/5</p>
                  </div>
                  <div className="bg-green-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">Nivel de estrés</p>
                    <p className="text-xl font-semibold">2.1/5</p>
                  </div>
                  <div className="bg-purple-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">Actividades completadas</p>
                    <p className="text-xl font-semibold">12</p>
                  </div>
                  <div className="bg-orange-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">Minutos de meditación</p>
                    <p className="text-xl font-semibold">120</p>
                  </div>
                </div>
              </OrganicSection>
              </Card>

              <Card organic={true} className="p-6">
                <OrganicSection title="Tendencia de estado de ánimo">
                <div className="h-40 flex items-end justify-between">
                  {[3, 4, 3, 5, 4, 2, 3].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-primary rounded-t-md w-8"
                        style={{ height: `${value * 15}px` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              </OrganicSection>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </OrganicElement>
    </OrganicLayout>
  )
}

// Componente auxiliar para el icono de reloj
function Clock(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
