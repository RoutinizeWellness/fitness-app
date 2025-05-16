"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  Star,
  Award,
  Zap,
  Flame,
  Target,
  Medal,
  Crown,
  Gift,
  Bell,
  ChevronRight,
  ChevronLeft,
  Info,
  Lock,
  Check,
  Clock
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import confetti from 'canvas-confetti'

interface AchievementSystemProps {
  userId: string
  className?: string
}

interface Achievement {
  id: string
  category: 'training' | 'nutrition' | 'sleep' | 'wellness' | 'general'
  name: string
  description: string
  criteria: string
  icon: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  progress?: number
  maxProgress?: number
  isUnlocked?: boolean
  unlockedAt?: string
}

interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  progress: number
  isUnlocked: boolean
  unlockedAt?: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalPoints: number
  level: number
  nextLevelPoints: number
  achievementsUnlocked: number
  totalAchievements: number
  streakDays: number
  lastActive: string
}

export function AchievementSystem({
  userId,
  className
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    nextLevelPoints: 100,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    streakDays: 0,
    lastActive: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showAchievementDialog, setShowAchievementDialog] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement[]>([])
  
  // Cargar logros y estadísticas del usuario
  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true)
      
      try {
        // Cargar todos los logros
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('category', { ascending: true })
          .order('level', { ascending: true })
        
        if (achievementsError) {
          throw achievementsError
        }
        
        // Cargar logros del usuario
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
        
        if (userAchievementsError) {
          throw userAchievementsError
        }
        
        // Transformar los datos
        const transformedAchievements: Achievement[] = achievementsData.map(achievement => ({
          id: achievement.id,
          category: achievement.category,
          name: achievement.name,
          description: achievement.description,
          criteria: achievement.criteria,
          icon: achievement.icon,
          level: achievement.level,
          points: achievement.points,
          maxProgress: achievement.max_progress
        }))
        
        const transformedUserAchievements: UserAchievement[] = userAchievementsData.map(userAchievement => ({
          id: userAchievement.id,
          userId: userAchievement.user_id,
          achievementId: userAchievement.achievement_id,
          progress: userAchievement.progress,
          isUnlocked: userAchievement.is_unlocked,
          unlockedAt: userAchievement.unlocked_at,
          createdAt: userAchievement.created_at,
          updatedAt: userAchievement.updated_at
        }))
        
        // Combinar datos para tener información completa
        const combinedAchievements = transformedAchievements.map(achievement => {
          const userAchievement = transformedUserAchievements.find(ua => ua.achievementId === achievement.id)
          
          return {
            ...achievement,
            progress: userAchievement?.progress || 0,
            isUnlocked: userAchievement?.isUnlocked || false,
            unlockedAt: userAchievement?.unlockedAt
          }
        })
        
        setAchievements(combinedAchievements)
        setUserAchievements(transformedUserAchievements)
        
        // Calcular estadísticas del usuario
        const unlockedAchievements = combinedAchievements.filter(a => a.isUnlocked)
        const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)
        const level = Math.max(1, Math.floor(Math.sqrt(totalPoints / 10)))
        const nextLevelPoints = (level + 1) * (level + 1) * 10
        
        // Obtener logros desbloqueados recientemente (últimos 7 días)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const recentUnlocked = unlockedAchievements.filter(a => 
          a.unlockedAt && new Date(a.unlockedAt) >= oneWeekAgo
        ).sort((a, b) => 
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
        )
        
        setRecentlyUnlocked(recentUnlocked)
        
        // Cargar estadísticas adicionales
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError
        }
        
        setUserStats({
          totalPoints,
          level,
          nextLevelPoints,
          achievementsUnlocked: unlockedAchievements.length,
          totalAchievements: combinedAchievements.length,
          streakDays: statsData?.streak_days || 0,
          lastActive: statsData?.last_active || new Date().toISOString()
        })
      } catch (error) {
        console.error("Error al cargar logros:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los logros",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadAchievements()
    }
  }, [userId])
  
  // Filtrar logros por categoría
  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory)
  
  // Obtener color según nivel
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-700'
      case 'silver': return 'bg-gray-400'
      case 'gold': return 'bg-yellow-400'
      case 'platinum': return 'bg-cyan-300'
      default: return 'bg-gray-300'
    }
  }
  
  // Obtener icono según categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training': return <Dumbbell className="h-4 w-4" />
      case 'nutrition': return <Utensils className="h-4 w-4" />
      case 'sleep': return <Moon className="h-4 w-4" />
      case 'wellness': return <Heart className="h-4 w-4" />
      case 'general': return <Star className="h-4 w-4" />
      default: return <Trophy className="h-4 w-4" />
    }
  }
  
  // Obtener nombre de categoría
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'training': return 'Entrenamiento'
      case 'nutrition': return 'Nutrición'
      case 'sleep': return 'Sueño'
      case 'wellness': return 'Bienestar'
      case 'general': return 'General'
      default: return 'Desconocido'
    }
  }
  
  // Obtener icono según nombre
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="h-6 w-6" />
      case 'star': return <Star className="h-6 w-6" />
      case 'award': return <Award className="h-6 w-6" />
      case 'zap': return <Zap className="h-6 w-6" />
      case 'flame': return <Flame className="h-6 w-6" />
      case 'target': return <Target className="h-6 w-6" />
      case 'medal': return <Medal className="h-6 w-6" />
      case 'crown': return <Crown className="h-6 w-6" />
      case 'gift': return <Gift className="h-6 w-6" />
      case 'dumbbell': return <Dumbbell className="h-6 w-6" />
      case 'utensils': return <Utensils className="h-6 w-6" />
      case 'moon': return <Moon className="h-6 w-6" />
      case 'heart': return <Heart className="h-6 w-6" />
      default: return <Trophy className="h-6 w-6" />
    }
  }
  
  // Mostrar detalles de un logro
  const showAchievementDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setShowAchievementDialog(true)
  }
  
  // Simular desbloqueo de logro (solo para demostración)
  const simulateUnlock = async (achievement: Achievement) => {
    if (achievement.isUnlocked) return
    
    try {
      const now = new Date().toISOString()
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: achievement.maxProgress || 1,
          is_unlocked: true,
          unlocked_at: now,
          updated_at: now
        })
      
      if (error) {
        throw error
      }
      
      // Actualizar estado local
      setAchievements(achievements.map(a => 
        a.id === achievement.id 
          ? { ...a, isUnlocked: true, progress: a.maxProgress || 1, unlockedAt: now } 
          : a
      ))
      
      // Actualizar estadísticas
      const updatedStats = {
        ...userStats,
        totalPoints: userStats.totalPoints + achievement.points,
        achievementsUnlocked: userStats.achievementsUnlocked + 1
      }
      
      // Recalcular nivel
      updatedStats.level = Math.max(1, Math.floor(Math.sqrt(updatedStats.totalPoints / 10)))
      updatedStats.nextLevelPoints = (updatedStats.level + 1) * (updatedStats.level + 1) * 10
      
      setUserStats(updatedStats)
      
      // Añadir a logros recientes
      setRecentlyUnlocked([{ ...achievement, isUnlocked: true, unlockedAt: now }, ...recentlyUnlocked])
      
      // Mostrar notificación
      toast({
        title: "¡Logro desbloqueado!",
        description: `Has desbloqueado "${achievement.name}"`,
        variant: "default"
      })
      
      // Lanzar confeti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (error) {
      console.error("Error al simular desbloqueo:", error)
    }
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Sistema de logros</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-primary mr-2" />
            <Card3DTitle>Sistema de logros</Card3DTitle>
          </div>
          
          <Badge variant="outline" className="font-bold">
            Nivel {userStats.level}
          </Badge>
        </div>
      </Card3DHeader>
      
      <Card3DContent>
        {/* Estadísticas del usuario */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progreso de nivel</span>
            <span className="text-sm text-gray-500">
              {userStats.totalPoints} / {userStats.nextLevelPoints} puntos
            </span>
          </div>
          <Progress3D 
            value={(userStats.totalPoints / userStats.nextLevelPoints) * 100} 
            className="h-2" 
          />
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{userStats.achievementsUnlocked}</p>
              <p className="text-xs text-gray-500">Logros</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{userStats.totalPoints}</p>
              <p className="text-xs text-gray-500">Puntos</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{userStats.streakDays}</p>
              <p className="text-xs text-gray-500">Racha</p>
            </div>
          </div>
        </div>
        
        {/* Logros recientes */}
        {recentlyUnlocked.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Logros recientes</h3>
            <ScrollArea className="h-24">
              <div className="flex space-x-3 pb-2">
                {recentlyUnlocked.map(achievement => (
                  <div 
                    key={achievement.id}
                    className="flex-shrink-0 w-20 text-center cursor-pointer"
                    onClick={() => showAchievementDetails(achievement)}
                  >
                    <div className={`
                      w-12 h-12 mx-auto rounded-full flex items-center justify-center
                      ${getLevelColor(achievement.level)} text-white
                    `}>
                      {getIconComponent(achievement.icon)}
                    </div>
                    <p className="text-xs mt-1 line-clamp-2">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Lista de logros */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Todos los logros</h3>
            <div className="text-xs text-gray-500">
              {userStats.achievementsUnlocked} / {userStats.totalAchievements} completados
            </div>
          </div>
          
          <div className="mb-4 overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <Button3D
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                Todos
              </Button3D>
              
              <Button3D
                variant={activeCategory === 'training' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('training')}
              >
                <Dumbbell className="h-4 w-4 mr-1" />
                Entrenamiento
              </Button3D>
              
              <Button3D
                variant={activeCategory === 'nutrition' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('nutrition')}
              >
                <Utensils className="h-4 w-4 mr-1" />
                Nutrición
              </Button3D>
              
              <Button3D
                variant={activeCategory === 'sleep' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('sleep')}
              >
                <Moon className="h-4 w-4 mr-1" />
                Sueño
              </Button3D>
              
              <Button3D
                variant={activeCategory === 'wellness' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('wellness')}
              >
                <Heart className="h-4 w-4 mr-1" />
                Bienestar
              </Button3D>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`
                    bg-gray-50 p-3 rounded-lg cursor-pointer
                    ${achievement.isUnlocked ? 'border-l-4 border-green-500' : ''}
                  `}
                  onClick={() => showAchievementDetails(achievement)}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mr-3
                      ${achievement.isUnlocked ? getLevelColor(achievement.level) : 'bg-gray-200'}
                      ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}
                    `}>
                      {achievement.isUnlocked ? (
                        getIconComponent(achievement.icon)
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs"
                        >
                          {achievement.points} pts
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {achievement.description}
                      </p>
                      
                      {achievement.maxProgress && achievement.maxProgress > 1 && (
                        <div className="mt-1">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span>{achievement.progress} / {achievement.maxProgress}</span>
                            <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                          </div>
                          <Progress3D 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-2">
                      {achievement.isUnlocked ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin logros</h3>
                <p className="text-sm text-gray-500">
                  No hay logros disponibles en esta categoría.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card3DContent>
      
      {/* Diálogo de detalles de logro */}
      <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
        <DialogContent>
          {selectedAchievement && (
            <>
              <DialogHeader>
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mr-3
                    ${selectedAchievement.isUnlocked ? getLevelColor(selectedAchievement.level) : 'bg-gray-200'}
                    ${selectedAchievement.isUnlocked ? 'text-white' : 'text-gray-400'}
                  `}>
                    {selectedAchievement.isUnlocked ? (
                      getIconComponent(selectedAchievement.icon)
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <DialogTitle>{selectedAchievement.name}</DialogTitle>
                </div>
                <DialogDescription>
                  {getCategoryName(selectedAchievement.category)} • {selectedAchievement.points} puntos
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm">{selectedAchievement.description}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Criterios</h4>
                  <p className="text-sm text-gray-600">{selectedAchievement.criteria}</p>
                </div>
                
                {selectedAchievement.maxProgress && selectedAchievement.maxProgress > 1 && (
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span>Progreso</span>
                      <span>{selectedAchievement.progress} / {selectedAchievement.maxProgress}</span>
                    </div>
                    <Progress3D 
                      value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                      className="h-2" 
                    />
                  </div>
                )}
                
                {selectedAchievement.isUnlocked && selectedAchievement.unlockedAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Desbloqueado el {format(parseISO(selectedAchievement.unlockedAt), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {!selectedAchievement.isUnlocked && (
                  <Button3D onClick={() => simulateUnlock(selectedAchievement)}>
                    Simular desbloqueo
                  </Button3D>
                )}
                <Button3D variant="outline" onClick={() => setShowAchievementDialog(false)}>
                  Cerrar
                </Button3D>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card3D>
  )
}
