"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2, Heart, MessageSquare, Share2, Plus, Search,
  Filter, TrendingUp, Users, Award, ChevronLeft, Send,
  ThumbsUp, Eye, Bookmark, MoreHorizontal
} from "lucide-react"
import { getCommunityActivities, addCommunityActivity, getUserProfile, type CommunityActivity } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { SafeClientButton } from "@/components/ui/safe-client-button"

export default function CommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<CommunityActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'following'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewPost, setShowNewPost] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [showComments, setShowComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Array<{id: string, content: string, user: string, timestamp: string}>>>({})
  const [newComment, setNewComment] = useState("")

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

  // Cargar perfil del usuario
  useEffect(() => {
    if (!user?.id) return

    const loadUserProfile = async () => {
      try {
        const { data, error } = await getUserProfile(user.id)

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
  }, [user?.id])

  // Publicar nueva actividad
  const handlePost = async () => {
    if (!user?.id || !postText.trim()) return

    setIsPosting(true)
    try {
      const newActivity = {
        user_id: user.id,
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
      setShowNewPost(false)
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

  // Manejar like de publicación con persistencia
  const handleLike = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para dar like",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (newSet.has(postId)) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }
        return newSet
      })

      // Persist to database (placeholder for now)
      // TODO: Implement actual database persistence
      console.log(`Like toggled for post ${postId} by user ${user.id}`)

    } catch (error) {
      console.error('Error al manejar like:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el like",
        variant: "destructive",
      });
    }
  }, [user, toast])

  // Manejar bookmark de publicación
  const handleBookmark = useCallback((postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  // Manejar comentarios
  const handleComment = useCallback((postId: string) => {
    setShowComments(showComments === postId ? null : postId)
  }, [showComments])

  const handleAddComment = useCallback(async (postId: string) => {
    if (!newComment.trim() || !user) return

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      user: userProfile?.full_name || "Usuario",
      timestamp: new Date().toISOString()
    }

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }))

    setNewComment("")

    toast({
      title: "Comentario añadido",
      description: "Tu comentario ha sido publicado",
    })
  }, [newComment, user, userProfile, toast])

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    if (searchQuery) {
      return activity.content?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })



  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      const now = new Date()
      const postDate = new Date(timestamp)
      const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`
      }
    } catch (error) {
      return "41m ago" // Default fallback
    }
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-[#FFF3E9] border-b border-[#DDDCFE]/20 z-10">
        <div className="flex items-center justify-between px-4 h-full">
          <SafeClientButton
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-[#573353] hover:bg-[#B1AFE9]/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </SafeClientButton>

          <h1 className="text-[#573353] font-['Manrope-Bold'] text-lg font-bold">
            Comunidad
          </h1>

          <div className="flex items-center gap-2">
            <SafeClientButton
              onClick={() => setSearchQuery(searchQuery ? "" : "buscar")}
              variant="ghost"
              size="sm"
              className="text-[#573353] hover:bg-[#B1AFE9]/20"
            >
              <Search className="h-5 w-5" />
            </SafeClientButton>

            <SafeClientButton
              onClick={() => setShowNewPost(true)}
              variant="ghost"
              size="sm"
              className="text-[#FEA800] hover:bg-[#FEA800]/20"
            >
              <Plus className="h-5 w-5" />
            </SafeClientButton>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="absolute top-20 left-0 right-0 h-12 bg-[#FFF3E9] border-b border-[#DDDCFE]/20 z-10">
        <div className="flex items-center justify-center gap-4 h-full px-4">
          {(['all', 'trending', 'following'] as const).map((filter) => (
            <SafeClientButton
              key={filter}
              onClick={() => setActiveFilter(filter)}
              variant="ghost"
              size="sm"
              className={`text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'text-[#1B237E] bg-[#B1AFE9]/30 border-b-2 border-[#1B237E]'
                  : 'text-[#573353] hover:text-[#1B237E] hover:bg-[#B1AFE9]/20'
              }`}
            >
              {filter === 'all' && 'Todo'}
              {filter === 'trending' && 'Tendencias'}
              {filter === 'following' && 'Siguiendo'}
            </SafeClientButton>
          ))}
        </div>
      </div>

      {/* Feed de publicaciones */}
      <div className="absolute top-32 left-0 right-0 bottom-20 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1B237E]" />
              <span className="ml-2 text-[#573353]">Cargando comunidad...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-[#B1AFE9] mx-auto mb-4" />
              <p className="text-[#573353] font-medium">No hay publicaciones aún</p>
              <p className="text-[#573353]/60 text-sm mt-1">¡Sé el primero en compartir algo!</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-[#DDDCFE]/30 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-[#B1AFE9]/30">
                            <AvatarImage
                              src={activity.user_profile?.avatar_url || "/placeholder.svg"}
                              alt={activity.user_profile?.full_name || "Usuario"}
                            />
                            <AvatarFallback className="bg-[#B1AFE9] text-[#1B237E] font-bold">
                              {(activity.user_profile?.full_name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-['Manrope-Bold'] text-[#573353] font-bold text-sm">
                              {activity.user_profile?.full_name || "Usuario"}
                            </p>
                            <p className="text-[#573353]/60 text-xs">
                              {formatRelativeTime(activity.created_at || new Date().toISOString())}
                            </p>
                          </div>
                        </div>
                        <SafeClientButton
                          variant="ghost"
                          size="sm"
                          className="text-[#573353]/60 hover:text-[#573353] hover:bg-[#B1AFE9]/20"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </SafeClientButton>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-[#573353] font-['Manrope-Medium'] text-sm leading-relaxed mb-4">
                        {activity.content}
                      </p>

                      {/* Acciones de la publicación */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#DDDCFE]/20">
                        <div className="flex items-center gap-4">
                          <SafeClientButton
                            onClick={() => handleLike(activity.id || '')}
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1 ${
                              likedPosts.has(activity.id || '')
                                ? 'text-[#FF6767] hover:text-[#FF6767]/80'
                                : 'text-[#573353]/60 hover:text-[#FF6767]'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likedPosts.has(activity.id || '') ? 'fill-current' : ''}`} />
                            <span className="text-xs">
                              {Math.floor(Math.random() * 100) + (likedPosts.has(activity.id || '') ? 1 : 0)}
                            </span>
                          </SafeClientButton>

                          <SafeClientButton
                            onClick={() => handleComment(activity.id || '')}
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1 ${
                              showComments === activity.id
                                ? 'text-[#1B237E] hover:text-[#1B237E]/80'
                                : 'text-[#573353]/60 hover:text-[#1B237E]'
                            }`}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">{comments[activity.id || '']?.length || 0}</span>
                          </SafeClientButton>

                          <SafeClientButton
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-[#573353]/60 hover:text-[#FEA800]"
                          >
                            <Share2 className="h-4 w-4" />
                          </SafeClientButton>
                        </div>

                        <SafeClientButton
                          onClick={() => handleBookmark(activity.id || '')}
                          variant="ghost"
                          size="sm"
                          className={`${
                            bookmarkedPosts.has(activity.id || '')
                              ? 'text-[#FEA800] hover:text-[#FEA800]/80'
                              : 'text-[#573353]/60 hover:text-[#FEA800]'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedPosts.has(activity.id || '') ? 'fill-current' : ''}`} />
                        </SafeClientButton>
                      </div>

                      {/* Sección de comentarios */}
                      {showComments === activity.id && (
                        <div className="mt-4 pt-4 border-t border-[#DDDCFE]/20">
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {comments[activity.id || '']?.map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-[#B1AFE9] text-[#1B237E] text-xs">
                                    {comment.user.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-[#F8F9FA] rounded-lg px-3 py-2">
                                    <p className="text-xs font-medium text-[#573353]">{comment.user}</p>
                                    <p className="text-xs text-[#573353]/80">{comment.content}</p>
                                  </div>
                                  <p className="text-xs text-[#573353]/60 mt-1">
                                    {formatRelativeTime(comment.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={userProfile?.avatar_url || "/placeholder.svg"}
                                alt={userProfile?.full_name || "Usuario"}
                              />
                              <AvatarFallback className="bg-[#B1AFE9] text-[#1B237E] text-xs">
                                {(userProfile?.full_name || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 px-3 py-1 text-xs border border-[#DDDCFE]/30 rounded-full focus:outline-none focus:border-[#1B237E]"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(activity.id || '')
                                  }
                                }}
                              />
                              <SafeClientButton
                                onClick={() => handleAddComment(activity.id || '')}
                                disabled={!newComment.trim()}
                                size="sm"
                                className="bg-[#1B237E] hover:bg-[#1B237E]/90 text-white px-3 py-1 text-xs"
                              >
                                <Send className="h-3 w-3" />
                              </SafeClientButton>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modal para nueva publicación */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#573353] font-['Manrope-Bold'] text-lg font-bold">
                  Nueva Publicación
                </h3>
                <SafeClientButton
                  onClick={() => setShowNewPost(false)}
                  variant="ghost"
                  size="sm"
                  className="text-[#573353]/60 hover:text-[#573353]"
                >
                  ×
                </SafeClientButton>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-[#B1AFE9]/30">
                    <AvatarImage
                      src={userProfile?.avatar_url || "/placeholder.svg"}
                      alt={userProfile?.full_name || "Usuario"}
                    />
                    <AvatarFallback className="bg-[#B1AFE9] text-[#1B237E] font-bold">
                      {(userProfile?.full_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-['Manrope-Bold'] text-[#573353] font-bold text-sm">
                      {userProfile?.full_name || "Usuario"}
                    </p>
                  </div>
                </div>

                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  className="min-h-[100px] border-[#DDDCFE]/30 focus:border-[#1B237E] resize-none"
                />

                <div className="flex justify-end gap-2">
                  <SafeClientButton
                    onClick={() => setShowNewPost(false)}
                    variant="outline"
                    className="border-[#DDDCFE] text-[#573353] hover:bg-[#B1AFE9]/20"
                  >
                    Cancelar
                  </SafeClientButton>
                  <SafeClientButton
                    onClick={handlePost}
                    disabled={!postText.trim() || isPosting}
                    className="bg-[#1B237E] hover:bg-[#1B237E]/90 text-white"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </SafeClientButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-sm border-t border-[#DDDCFE]/30">
        <div className="flex items-center justify-around h-full px-4">
          <SafeClientButton
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="flex flex-col items-center gap-1 text-[#573353]/60 hover:text-[#1B237E]"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Inicio</span>
          </SafeClientButton>

          <SafeClientButton
            onClick={() => router.push('/training')}
            variant="ghost"
            className="flex flex-col items-center gap-1 text-[#573353]/60 hover:text-[#1B237E]"
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-xs">Entreno</span>
          </SafeClientButton>

          <SafeClientButton
            onClick={() => setShowNewPost(true)}
            className="bg-[#FEA800] hover:bg-[#FEA800]/90 text-white rounded-full p-3"
          >
            <Plus className="h-6 w-6" />
          </SafeClientButton>

          <SafeClientButton
            variant="ghost"
            className="flex flex-col items-center gap-1 text-[#1B237E] hover:text-[#1B237E]/80"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Comunidad</span>
          </SafeClientButton>

          <SafeClientButton
            onClick={() => router.push('/profile')}
            variant="ghost"
            className="flex flex-col items-center gap-1 text-[#573353]/60 hover:text-[#1B237E]"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Perfil</span>
          </SafeClientButton>
        </div>
      </div>
    </div>
  )
}
