"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Heart, MessageSquare, Share2, MoreHorizontal, ThumbsUp, User, Users, Dumbbell } from "lucide-react"
import { getCommunityActivities, addCommunityActivity, getUserProfile, type CommunityActivity } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ComunidadTabProps {
  userId: string
}

export default function ComunidadTab({ userId }: ComunidadTabProps) {
  const [activities, setActivities] = useState<CommunityActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Cargar perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data, error } = await getUserProfile(userId)

        if (error) {
          throw error
        }

        if (data) {
          setUserProfile(data)
        }
      } catch (error) {
        console.error("Error al cargar perfil de usuario:", error)
      }
    }

    loadUserProfile()
  }, [userId])

  // Cargar actividades de la comunidad
  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getCommunityActivities()

      if (error) {
        throw error
      }

      if (data) {
        setActivities(data)
      }
    } catch (error) {
      console.error("Error al cargar actividades:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades de la comunidad",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar actividades al montar el componente
  useEffect(() => {
    fetchActivities()
  }, [])

  // Publicar nueva actividad
  const handlePost = async () => {
    if (!postText.trim()) return

    setIsPosting(true)
    try {
      const newActivity = {
        user_id: userId,
        content: postText,
        type: "post",
        // Pasamos la información del perfil para que se use en la simulación
        profiles: userProfile ? {
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url
        } : undefined
      }

      const { data, error } = await addCommunityActivity(newActivity)

      if (error) {
        throw error
      }

      // Recargar todas las actividades para asegurarnos de tener los datos más recientes
      await fetchActivities()

      setPostText("")
      toast({
        title: "Publicación exitosa",
        description: "Tu publicación ha sido compartida con la comunidad",
      })
    } catch (error) {
      console.error("Error al publicar:", error)
      toast({
        title: "Error",
        description: "No se pudo publicar tu actividad",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  // Renderizar tiempo relativo
  const renderRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } catch (error) {
      return "hace un momento"
    }
  }

  return (
    <div className="space-y-6 py-4">
      <h2 className="text-2xl font-bold">Comunidad</h2>

      <Tabs defaultValue="feed">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
          <TabsTrigger value="friends">Amigos</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback>{userProfile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="¿Qué estás pensando?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handlePost} disabled={!postText.trim() || isPosting}>
                      {isPosting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        "Publicar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse">
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={activity.profiles?.avatar_url || ""} />
                        <AvatarFallback>{activity.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <p className="font-medium">{activity.profiles?.full_name || "Usuario"}</p>
                            {activity.type === "workout" && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                                Entrenamiento
                              </Badge>
                            )}
                            {activity.type === "achievement" && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                                Logro
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center">
                            <p className="text-xs text-gray-500 mr-2">{renderRelativeTime(activity.created_at)}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Guardar</DropdownMenuItem>
                                <DropdownMenuItem>Reportar</DropdownMenuItem>
                                {activity.user_id === userId && (
                                  <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <p className="text-sm">{activity.content}</p>
                        {activity.image_url && (
                          <div className="mt-3 rounded-md overflow-hidden">
                            <img
                              src={activity.image_url}
                              alt="Imagen de la publicación"
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Me gusta
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Comentar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <Share2 className="h-4 w-4 mr-1" />
                            Compartir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-gray-500">No hay publicaciones aún. ¡Sé el primero en compartir!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descubre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium">Usuarios Populares</p>
                        <p className="text-sm text-gray-500">Encuentra personas con intereses similares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium">Grupos</p>
                        <p className="text-sm text-gray-500">Únete a comunidades de fitness</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Heart className="h-5 w-5 text-purple-700" />
                      </div>
                      <div>
                        <p className="font-medium">Retos</p>
                        <p className="text-sm text-gray-500">Participa en desafíos de fitness</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Dumbbell className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium">Entrenamientos</p>
                        <p className="text-sm text-gray-500">Descubre nuevas rutinas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-gray-500">
                  Próximamente: Descubre tendencias y contenido popular relacionado con tus intereses.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amigos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-gray-500">
                  Próximamente: Conecta con amigos y sigue su progreso de fitness.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
