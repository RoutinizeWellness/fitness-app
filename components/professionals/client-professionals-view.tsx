"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users, UserPlus, Calendar, MessageSquare, ClipboardList,
  Dumbbell, Utensils, Search, ChevronRight, ExternalLink
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { getClientRelationships } from "@/lib/professional-service"
import { ClientRelationship } from "@/lib/types/professionals"
import { getUserProfile } from "@/lib/supabase-client"

type ProfessionalWithDetails = {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  professionalType: 'trainer' | 'nutritionist';
  specialties: string[];
  experienceYears: number;
  relationshipId: string;
  relationshipStatus: 'pending' | 'active' | 'paused' | 'terminated';
  startDate?: string;
};

export function ClientProfessionalsView() {
  const router = useRouter()
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<ProfessionalWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar relaciones con profesionales
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para ver tus profesionales",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setIsLoading(true)

      try {
        // Cargar relaciones con profesionales
        const { data: relationships, error: relationshipsError } = await getClientRelationships(user.id, 'client')

        if (relationshipsError) {
          console.error("Error al cargar relaciones con profesionales:", relationshipsError)
          toast({
            title: "Error",
            description: "No se pudieron cargar tus profesionales",
            variant: "destructive",
          })
        }

        // Cargar información de cada profesional
        if (relationships && relationships.length > 0) {
          const professionalsData: ProfessionalWithDetails[] = []

          for (const relationship of relationships) {
            try {
              const { data: professionalProfile } = await getUserProfile(relationship.professionalId)

              if (professionalProfile) {
                professionalsData.push({
                  id: relationship.professionalId,
                  userId: relationship.professionalId,
                  name: professionalProfile.full_name || "Profesional sin nombre",
                  avatar: professionalProfile.avatar_url,
                  professionalType: relationship.professionalType,
                  specialties: ["Entrenamiento personalizado"], // Esto se cargaría del perfil profesional
                  experienceYears: 5, // Esto se cargaría del perfil profesional
                  relationshipId: relationship.id,
                  relationshipStatus: relationship.status,
                  startDate: relationship.startDate,
                })
              }
            } catch (error) {
              console.error("Error al cargar perfil de profesional:", error)
            }
          }

          setProfessionals(professionalsData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, router])

  // Filtrar profesionales por término de búsqueda y tipo
  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = activeTab === "all" ||
                        (activeTab === "trainers" && professional.professionalType === "trainer") ||
                        (activeTab === "nutritionists" && professional.professionalType === "nutritionist")
    return matchesSearch && matchesType
  })

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando profesionales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Mis profesionales</h2>
        <Button3D onClick={() => router.push("/find-professionals")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Buscar profesionales
        </Button3D>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="trainers">Entrenadores</TabsTrigger>
          <TabsTrigger value="nutritionists">Nutricionistas</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar profesionales..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredProfessionals.length > 0 ? (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {filteredProfessionals.map((professional) => (
                <Card3D key={professional.relationshipId} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={professional.avatar || undefined} />
                          <AvatarFallback>{professional.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{professional.name}</h3>
                            <Badge
                              variant={professional.professionalType === 'trainer' ? 'default' : 'secondary'}
                              className="ml-2 text-xs"
                            >
                              {professional.professionalType === 'trainer' ? 'Entrenador' : 'Nutricionista'}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant={professional.relationshipStatus === 'active' ? 'outline' :
                                      professional.relationshipStatus === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {professional.relationshipStatus === 'active' ? 'Activo' :
                               professional.relationshipStatus === 'pending' ? 'Pendiente' :
                               professional.relationshipStatus === 'paused' ? 'Pausado' : 'Terminado'}
                            </Badge>
                            {professional.startDate && (
                              <span className="text-xs text-gray-500 ml-2">
                                Desde {new Date(professional.startDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button3D size="sm">
                        Ver perfil
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button3D>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No se encontraron profesionales</p>
            {searchTerm || activeTab !== "all" ? (
              <p className="text-sm text-gray-400">Prueba con otros filtros de búsqueda</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-2">
                  Aún no tienes profesionales asignados
                </p>
                <Button3D onClick={() => router.push("/find-professionals")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Buscar profesionales
                </Button3D>
              </div>
            )}
          </div>
        )}
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Entrenadores personales</Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="p-6">
            <p className="text-gray-500 mb-4">
              Los entrenadores personales te ayudarán a crear rutinas de entrenamiento personalizadas y a realizar un seguimiento de tu progreso.
            </p>
            <Button3D onClick={() => router.push("/find-professionals?type=trainer")}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Buscar entrenador
            </Button3D>
          </Card3DContent>
        </Card3D>

        <Card3D>
          <Card3DHeader>
            <Card3DTitle>Nutricionistas</Card3DTitle>
          </Card3DHeader>
          <Card3DContent className="p-6">
            <p className="text-gray-500 mb-4">
              Los nutricionistas te ayudarán a crear planes de alimentación personalizados y a realizar un seguimiento de tu nutrición.
            </p>
            <Button3D onClick={() => router.push("/find-professionals?type=nutritionist")}>
              <Utensils className="h-4 w-4 mr-2" />
              Buscar nutricionista
            </Button3D>
          </Card3DContent>
        </Card3D>
      </div>
    </div>
  )
}
