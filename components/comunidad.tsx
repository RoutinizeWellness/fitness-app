"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { getCommunityActivities, addCommunityActivity } from "@/lib/supabase-client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"

export default function Comunidad({ userId, profile }) {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  // Cargar actividades de la comunidad
  useEffect(() => {
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
      }
      
      const { data, error } = await addCommunityActivity(newActivity)
      
      if (error) {
        throw error
      }
      
      // Actualizar lista de actividades
      const { data: updatedActivities } = await getCommunityActivities()
      if (updatedActivities) {
        setActivities(updatedActivities)
      }
      
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
  const renderRelativeTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } catch (error) {
      return "hace un momento"
    }
  }

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="feed">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="discover">Descubrir</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
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
                <Card key={i} className="border-none shadow-md">
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
                <Card key={activity.id} className="border-none shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={activity.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{activity.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium">{activity.profiles?.full_name || "Usuario"}</p>
                          <p className="text-xs text-gray-500">{renderRelativeTime(activity.created_at)}</p>
                        </div>
                        <p className="text-sm">{activity.content}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            Me gusta
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="py-6 text-center">
                <p className="text-gray-500">No hay publicaciones aún. ¡Sé el primero en compartir!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="discover" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardContent className="py-6 text-center">
              <p className="text-gray-500">Próximamente: Descubre usuarios y contenido relacionado con tus intereses.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
