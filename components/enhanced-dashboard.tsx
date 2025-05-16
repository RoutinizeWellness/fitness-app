"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { StatCard3D } from "@/components/ui/stat-card-3d"
import { QuickAction3D } from "@/components/ui/quick-action-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import {
  Dumbbell, Heart, Utensils, Activity, ArrowRight,
  Flame, Zap, Users, Trophy, Brain, Plus, BarChart3,
  Calendar, Clock, TrendingUp, Award
} from "lucide-react"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isToday, isYesterday, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { motion } from "framer-motion"
import { CardHoverEffect } from "@/components/ui/card-hover-effect"
import type { Workout, Mood, NutritionEntry } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface EnhancedDashboardProps {
  workoutLog: Workout[]
  moodLog: Mood[]
  nutritionLog: NutritionEntry[]
  profile: User | null
  isLoading: boolean
  setActiveTab: (tab: string) => void
}

export default function EnhancedDashboard({
  workoutLog,
  moodLog,
  nutritionLog,
  profile,
  isLoading,
  setActiveTab,
}: EnhancedDashboardProps) {
  // Estados
  const [greeting, setGreeting] = useState("Buenos días")
  const [weeklyProgress, setWeeklyProgress] = useState(0)
  const [todayCalories, setTodayCalories] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Establecer saludo según la hora del día
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting("Buenos días")
    } else if (hour >= 12 && hour < 19) {
      setGreeting("Buenas tardes")
    } else {
      setGreeting("Buenas noches")
    }
  }, [])

  // Calcular progreso semanal
  useEffect(() => {
    if (!workoutLog) return

    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const workoutsThisWeek = workoutLog.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= startOfWeek
    })

    // Asumimos que el objetivo es 5 entrenamientos por semana
    const weeklyTarget = 5
    const progress = Math.min((workoutsThisWeek.length / weeklyTarget) * 100, 100)
    setWeeklyProgress(progress)
  }, [workoutLog])

  // Calcular calorías de hoy
  useEffect(() => {
    if (!nutritionLog) return

    const today = new Date().toISOString().split("T")[0]
    const calories = nutritionLog
      .filter((entry) => entry.date === today)
      .reduce((sum, entry) => sum + entry.calories, 0)

    setTodayCalories(calories)
  }, [nutritionLog])

  // Efecto para indicar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mostrar esqueleto mientras carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <Skeleton className="h-[150px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 depth-background pb-6">
      {/* Encabezado con saludo y avatar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">
            {greeting}, {profile?.user_metadata?.full_name?.split(" ")[0] || "Amigo"}
          </h1>
          <p className="text-muted-foreground">¿Cómo te sientes hoy?</p>
        </div>
        <Avatar3D className="h-14 w-14" glowOnHover={true} glowColor="rgba(59, 130, 246, 0.5)">
          <Avatar3DImage src={profile?.user_metadata?.avatar_url || "/placeholder.svg"} />
          <Avatar3DFallback>{profile?.user_metadata?.full_name?.charAt(0) || "U"}</Avatar3DFallback>
        </Avatar3D>
      </div>

      {/* Tarjeta de progreso semanal */}
      <Card3D>
        <Card3DContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 text-blue-700 p-2 w-fit mr-2">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Progreso Semanal</h3>
            </div>
            <Badge variant="outline" className="glass-effect">
              <AnimatedCounter value={Math.round(weeklyProgress)} formatter={(value) => `${value}%`} />
            </Badge>
          </div>

          {/* Barra de progreso 3D */}
          <Progress3D
            value={weeklyProgress}
            max={100}
            className="mb-4"
            animate={true}
            animationDuration={1.5}
          />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                <AnimatedCounter
                  value={
                    workoutLog?.filter((w) => {
                      const date = new Date(w.date)
                      const today = new Date()
                      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
                    }).length || 0
                  }
                />{" "}
                entrenamientos este mes
              </p>
              <p className="text-sm text-muted-foreground">
                <AnimatedCounter value={moodLog?.filter((m) => m.mood_level >= 4).length || 0} /> días de buen ánimo
              </p>
            </div>

            <Button3D
              variant="gradient"
              size="sm"
              onClick={() => setActiveTab("progress")}
            >
              Ver detalles
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button3D>
          </div>
        </Card3DContent>
      </Card3D>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard3D
          title="Entrenamientos"
          value={workoutLog?.length || 0}
          icon={Dumbbell}
          description="Total registrado"
          iconColor="text-blue-700"
          iconBgColor="bg-blue-100"
        />

        <StatCard3D
          title="Calorías"
          value={todayCalories}
          icon={Flame}
          description="Consumidas hoy"
          iconColor="text-red-700"
          iconBgColor="bg-red-100"
          animationDelay={0.2}
        />
      </div>

      {/* Acciones rápidas */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Acciones Rápidas</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction3D
              icon={Dumbbell}
              label="Entrenar"
              onClick={() => setActiveTab("workout")}
            />
            <QuickAction3D
              icon={BarChart3}
              label="Progreso"
              onClick={() => setActiveTab("progress")}
            />
            <QuickAction3D
              icon={Utensils}
              label="Nutrición"
              onClick={() => setActiveTab("nutrition")}
            />
          </div>
        </Card3DContent>
      </Card3D>

      {/* Actividad reciente */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Actividad Reciente</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="space-y-4">
            {workoutLog && workoutLog.length > 0 ? (
              workoutLog.slice(0, 3).map((workout, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div className="rounded-full bg-blue-100 text-blue-700 p-2 w-fit">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{workout.name || "Entrenamiento"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(workout.date), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay actividad reciente
              </p>
            )}
          </div>
        </Card3DContent>
      </Card3D>

      {/* Logros */}
      <Card3D>
        <Card3DHeader>
          <Card3DTitle gradient={true}>Tus Logros</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              className="flex flex-col items-center p-3 glass-effect rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            >
              <Award className="h-6 w-6 text-yellow-500 mb-1" />
              <span className="text-xs font-medium text-center">Primer Entrenamiento</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center p-3 glass-effect rounded-lg"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            >
              <Trophy className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-xs font-medium text-center">3 Días Seguidos</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center p-3 glass-effect rounded-lg opacity-50"
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            >
              <TrendingUp className="h-6 w-6 text-green-500 mb-1" />
              <span className="text-xs font-medium text-center">Mejora Continua</span>
            </motion.div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
}
