"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Clock,
  Dumbbell,
  ChevronRight,
  BarChart,
  TrendingUp,
  Flame
} from "lucide-react"
import { motion } from "framer-motion"
import { getWorkoutLogs } from "@/lib/training-service"

interface WorkoutHistoryProps {
  userId: string
  limit?: number
  showViewAll?: boolean
}

export default function ImprovedWorkoutHistory({
  userId,
  limit = 5,
  showViewAll = true
}: WorkoutHistoryProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  
  // Load workout logs
  useEffect(() => {
    const loadWorkoutLogs = async () => {
      if (!userId) return
      
      try {
        const { data, error } = await getWorkoutLogs(userId)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setWorkoutLogs(data)
        }
      } catch (error) {
        console.error("Error loading workout logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkoutLogs()
  }, [userId])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      
      if (isToday(date)) {
        return "Hoy"
      } else if (isYesterday(date)) {
        return "Ayer"
      } else if (isThisWeek(date)) {
        return format(date, "EEEE", { locale: es })
      } else {
        return format(date, "d 'de' MMMM", { locale: es })
      }
    } catch (error) {
      return dateString
    }
  }
  
  // Calculate streak
  const calculateStreak = () => {
    if (workoutLogs.length === 0) return 0
    
    const sortedLogs = [...workoutLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    // Check if the most recent workout is from today or yesterday
    const mostRecentDate = new Date(sortedLogs[0].date)
    if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
      return 0
    }
    
    let streak = 1
    let currentDate = mostRecentDate
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date)
      const diffDays = Math.round(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (diffDays === 1) {
        streak++
        currentDate = logDate
      } else if (diffDays > 1) {
        break
      }
    }
    
    return streak
  }
  
  // Calculate total workouts this month
  const calculateMonthlyWorkouts = () => {
    return workoutLogs.filter(log => {
      const logDate = new Date(log.date)
      return isThisMonth(logDate)
    }).length
  }
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }
  
  // If no workout logs, show empty state
  if (workoutLogs.length === 0) {
    return (
      <Card className="bg-white rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-[#573353]">Historial de Entrenamientos</CardTitle>
          <CardDescription>Registra tus entrenamientos para ver tu progreso</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Dumbbell className="h-12 w-12 mx-auto text-[#573353]/30 mb-4" />
          <p className="text-[#573353] mb-4">No hay entrenamientos registrados</p>
          <Button 
            className="bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
            onClick={() => router.push("/training")}
          >
            Iniciar Entrenamiento
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Get limited logs
  const limitedLogs = workoutLogs.slice(0, limit)
  
  return (
    <Card className="bg-white rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-[#573353]">Historial de Entrenamientos</CardTitle>
        <CardDescription>Tus últimos entrenamientos registrados</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#FFF3E0] rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mx-auto mb-1">
              <Flame className="h-4 w-4 text-[#FDA758]" />
            </div>
            <p className="text-lg font-bold text-[#573353]">{calculateStreak()}</p>
            <p className="text-xs text-[#573353]/70">Racha</p>
          </div>
          
          <div className="bg-[#E8F5E9] rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-[#5DE292]/20 flex items-center justify-center mx-auto mb-1">
              <Calendar className="h-4 w-4 text-[#5DE292]" />
            </div>
            <p className="text-lg font-bold text-[#573353]">{calculateMonthlyWorkouts()}</p>
            <p className="text-xs text-[#573353]/70">Este mes</p>
          </div>
          
          <div className="bg-[#E3F2FD] rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-[#8C80F8]/20 flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="h-4 w-4 text-[#8C80F8]" />
            </div>
            <p className="text-lg font-bold text-[#573353]">{workoutLogs.length}</p>
            <p className="text-xs text-[#573353]/70">Total</p>
          </div>
        </div>
        
        {/* Workout logs */}
        <div className="space-y-3">
          {limitedLogs.map((log, index) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-3 bg-[#F9F9F9] rounded-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#FDA758]/10 flex items-center justify-center mr-3">
                    <Dumbbell className="h-5 w-5 text-[#FDA758]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#573353]">{log.routineName || "Entrenamiento"}</h4>
                    <div className="flex items-center text-xs text-[#573353]/70">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(log.date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center mr-3 text-xs text-[#573353]/70">
                    <Clock className="h-3 w-3 mr-1" />
                    {log.duration} min
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => router.push(`/training/workout-details/${log.id}`)}
                  >
                    <ChevronRight className="h-4 w-4 text-[#573353]/70" />
                  </Button>
                </div>
              </div>
              
              {log.performance && (
                <Badge 
                  className={`rounded-full px-2 text-xs ${
                    log.performance === 'excellent' ? 'bg-[#5DE292]/10 text-[#5DE292]' :
                    log.performance === 'good' ? 'bg-[#8C80F8]/10 text-[#8C80F8]' :
                    log.performance === 'average' ? 'bg-[#FDA758]/10 text-[#FDA758]' :
                    'bg-[#FF7285]/10 text-[#FF7285]'
                  }`}
                >
                  {log.performance === 'excellent' ? 'Excelente' :
                   log.performance === 'good' ? 'Bueno' :
                   log.performance === 'average' ? 'Normal' :
                   log.performance === 'poor' ? 'Regular' : 'Bajo'}
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
      
      {showViewAll && workoutLogs.length > limit && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full rounded-full border-[#573353]/20 text-[#573353]"
            onClick={() => router.push("/training/history")}
          >
            Ver todo el historial
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
