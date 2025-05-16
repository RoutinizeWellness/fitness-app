"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Trophy,
  Award,
  Star,
  Gift,
  Zap,
  Flame,
  Heart,
  Calendar,
  Clock,
  Dumbbell,
  Utensils,
  Moon,
  Brain,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import Image from "next/image"

interface Reward {
  id: string
  name: string
  description: string
  category: string
  points_required: number
  icon: string
  is_achieved: boolean
  achieved_date?: string
  progress: number
}

interface Achievement {
  id: string
  name: string
  description: string
  category: string
  level: number
  is_achieved: boolean
  achieved_date?: string
  icon: string
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rewards")
  const { toast } = useToast()

  useEffect(() => {
    const fetchRewardsData = async () => {
      setIsLoading(true)
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error(userError?.message || "Usuario no autenticado")
        }

        // Get user points - handle case where user_points entry doesn't exist
        const { data: pointsData, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points')
          .eq('user_id', user.id)
          .single()

        // If no points record exists, create one
        if (pointsError && pointsError.code === 'PGRST116') {
          // No points record found, create one with default 0 points
          const { error: insertError } = await supabase
            .from('user_points')
            .insert({
              user_id: user.id,
              total_points: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error("Error creating user points record:", insertError)
          } else {
            setUserPoints(0)
          }
        } else if (!pointsError && pointsData) {
          setUserPoints(pointsData.total_points)
        }

        // Get rewards with error handling
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*')
          .order('points_required', { ascending: true })

        if (rewardsError) {
          console.error("Error fetching rewards:", rewardsError)
          // Continue with empty rewards array
          setRewards([])
        } else {
          // Get user rewards
          const { data: userRewardsData, error: userRewardsError } = await supabase
            .from('user_rewards')
            .select('reward_id, achieved_date')
            .eq('user_id', user.id)

          if (userRewardsError) {
            console.error("Error fetching user rewards:", userRewardsError)
            // Continue with empty user rewards
            const currentPoints = pointsData?.total_points || 0
            const mappedRewards = rewardsData?.map(reward => ({
              ...reward,
              is_achieved: false,
              achieved_date: null,
              progress: Math.min(100, (currentPoints / reward.points_required) * 100)
            })) || []
            setRewards(mappedRewards)
          } else {
            // Map rewards with achievement status
            const userRewardsMap = new Map()
            userRewardsData?.forEach(ur => userRewardsMap.set(ur.reward_id, ur.achieved_date))

            const currentPoints = pointsData?.total_points || 0
            const mappedRewards = rewardsData?.map(reward => ({
              ...reward,
              is_achieved: userRewardsMap.has(reward.id),
              achieved_date: userRewardsMap.get(reward.id),
              progress: Math.min(100, (currentPoints / reward.points_required) * 100)
            })) || []

            setRewards(mappedRewards)
          }
        }

        // Get achievements with error handling
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('category, level', { ascending: true })

        if (achievementsError) {
          console.error("Error fetching achievements:", achievementsError)
          // Continue with empty achievements array
          setAchievements([])
        } else {
          // Get user achievements
          const { data: userAchievementsData, error: userAchievementsError } = await supabase
            .from('user_achievements')
            .select('achievement_id, achieved_date')
            .eq('user_id', user.id)

          if (userAchievementsError) {
            console.error("Error fetching user achievements:", userAchievementsError)
            // Continue with empty user achievements
            const mappedAchievements = achievementsData?.map(achievement => ({
              ...achievement,
              is_achieved: false,
              achieved_date: null
            })) || []
            setAchievements(mappedAchievements)
          } else {
            // Map achievements with achievement status
            const userAchievementsMap = new Map()
            userAchievementsData?.forEach(ua => userAchievementsMap.set(ua.achievement_id, ua.achieved_date))

            const mappedAchievements = achievementsData?.map(achievement => ({
              ...achievement,
              is_achieved: userAchievementsMap.has(achievement.id),
              achieved_date: userAchievementsMap.get(achievement.id)
            })) || []

            setAchievements(mappedAchievements)
          }
        }
      } catch (error) {
        console.error("Error fetching rewards data:", error)
        // Use default data if there's an error
        setRewards([])
        setAchievements([])
        toast({
          title: "Error",
          description: "No se pudieron cargar las recompensas y logros. Usando datos por defecto.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRewardsData()
  }, [toast])

  const getIconComponent = (iconName: string, className = "h-6 w-6") => {
    switch (iconName) {
      case 'trophy': return <Trophy className={className} />
      case 'award': return <Award className={className} />
      case 'star': return <Star className={className} />
      case 'gift': return <Gift className={className} />
      case 'zap': return <Zap className={className} />
      case 'flame': return <Flame className={className} />
      case 'heart': return <Heart className={className} />
      case 'calendar': return <Calendar className={className} />
      case 'clock': return <Clock className={className} />
      case 'dumbbell': return <Dumbbell className={className} />
      case 'utensils': return <Utensils className={className} />
      case 'moon': return <Moon className={className} />
      case 'brain': return <Brain className={className} />
      default: return <Star className={className} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'training': return 'bg-blue-100 text-blue-800'
      case 'nutrition': return 'bg-green-100 text-green-800'
      case 'sleep': return 'bg-purple-100 text-purple-800'
      case 'wellness': return 'bg-yellow-100 text-yellow-800'
      case 'productivity': return 'bg-orange-100 text-orange-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const claimReward = async (rewardId: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Check if user has enough points
      const reward = rewards.find(r => r.id === rewardId)
      if (!reward) return

      if (userPoints < reward.points_required) {
        toast({
          title: "Puntos insuficientes",
          description: `Necesitas ${reward.points_required - userPoints} puntos más para reclamar esta recompensa.`,
          variant: "destructive"
        })
        return
      }

      // Claim reward
      const { error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          achieved_date: new Date().toISOString()
        })

      if (error) throw error

      // Update user points
      const { error: pointsError } = await supabase
        .from('user_points')
        .update({
          total_points: userPoints - reward.points_required,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (pointsError) throw pointsError

      // Update local state
      setUserPoints(prev => prev - reward.points_required)
      setRewards(prev => prev.map(r =>
        r.id === rewardId
          ? { ...r, is_achieved: true, achieved_date: new Date().toISOString() }
          : r
      ))

      toast({
        title: "¡Recompensa reclamada!",
        description: `Has reclamado la recompensa: ${reward.name}`,
      })
    } catch (error) {
      console.error("Error claiming reward:", error)
      toast({
        title: "Error",
        description: "No se pudo reclamar la recompensa.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Cargando recompensas y logros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recompensas y Logros</h1>
          <p className="text-muted-foreground">Gana puntos, desbloquea recompensas y consigue logros</p>
        </div>
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Tus puntos</p>
              <p className="text-2xl font-bold">{userPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={reward.is_achieved ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${getCategoryColor(reward.category)}`}>
                        {getIconComponent(reward.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={reward.is_achieved ? "default" : "secondary"}>
                      {reward.points_required} puntos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progreso</span>
                      <span>{Math.min(100, Math.round(reward.progress))}%</span>
                    </div>
                    <Progress value={reward.progress} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  {reward.is_achieved ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Trophy className="mr-2 h-4 w-4" />
                      Reclamado
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={userPoints < reward.points_required}
                      onClick={() => claimReward(reward.id)}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Reclamar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.is_achieved ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${getCategoryColor(achievement.category)}`}>
                        {getIconComponent(achievement.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Nivel {achievement.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
                <CardFooter>
                  {achievement.is_achieved ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Trophy className="mr-2 h-4 w-4" />
                      Conseguido
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <Award className="mr-2 h-4 w-4" />
                      Pendiente
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
