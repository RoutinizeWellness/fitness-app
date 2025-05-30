"use client"

import { useState, useEffect } from 'react'
import { getUserGamificationState } from '@/lib/gamification-service'
import { GamificationState } from '@/lib/types/gamification'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Trophy, Flame, Award, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/components/ui/use-toast'

export function PointsDisplay() {
  const [gamificationState, setGamificationState] = useState<GamificationState | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function loadGamificationState() {
      if (!user) return

      try {
        setLoading(true)
        const state = await getUserGamificationState(user.id)
        setGamificationState(state)
      } catch (error) {
        console.error('Error loading gamification state:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos de gamificación',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadGamificationState()
  }, [user, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDA758]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!gamificationState) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Puntos y Recompensas</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-[#573353]/70">Completa entrenamientos para ganar puntos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { points, level, nextLevelPoints } = gamificationState
  const progressPercentage = Math.min(
    Math.round((points.total / nextLevelPoints) * 100),
    100
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-[#FDA758] to-[#FE9870]">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-white">Nivel {level}</CardTitle>
            <CardDescription className="text-white/80">
              {points.total} puntos totales
            </CardDescription>
          </div>
          <div className="bg-white/20 rounded-full p-2">
            <Trophy className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Progreso al nivel {level + 1}</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-[#FDA758] mr-2" />
              <span className="text-sm font-medium">Entrenamientos</span>
            </div>
            <p className="text-lg font-semibold">{points.workoutPoints} pts</p>
          </div>

          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Flame className="h-4 w-4 text-[#FF6767] mr-2" />
              <span className="text-sm font-medium">Rachas</span>
            </div>
            <p className="text-lg font-semibold">{points.streakPoints} pts</p>
          </div>

          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Award className="h-4 w-4 text-[#8C80F8] mr-2" />
              <span className="text-sm font-medium">Logros</span>
            </div>
            <p className="text-lg font-semibold">{points.milestonePoints} pts</p>
          </div>

          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-[#5DE292] mr-2" />
              <span className="text-sm font-medium">Nutrición</span>
            </div>
            <p className="text-lg font-semibold">{points.nutritionPoints} pts</p>
          </div>
        </div>

        {gamificationState.achievements.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Logros Recientes</h3>
            <div className="flex flex-wrap gap-2">
              {gamificationState.achievements.slice(0, 3).map(achievement => (
                <Badge
                  key={achievement.id}
                  variant="secondary"
                  className="bg-[#F9F9F9] text-[#573353] hover:bg-[#F5F5F5]"
                >
                  {achievement.name}
                </Badge>
              ))}
              {gamificationState.achievements.length > 3 && (
                <Badge variant="outline">
                  +{gamificationState.achievements.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
