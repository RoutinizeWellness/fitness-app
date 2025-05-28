"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingLayout } from "@/components/layouts/training-layout"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Image from "next/image"
import confetti from 'canvas-confetti'
import { Trophy, Star, ArrowRight, CheckCircle, Dumbbell, Calendar } from "lucide-react"

export default function LevelUpPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [newLevel, setNewLevel] = useState("Principiante")
  const [previousLevel, setPreviousLevel] = useState("Amateur Cero")
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('name, experience_level, previous_level')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setUserName(data.name || user.email?.split('@')[0] || "")
          setNewLevel(data.experience_level === 'beginner' ? 'Principiante' : data.experience_level)
          setPreviousLevel(data.previous_level === 'amateur_zero' ? 'Amateur Cero' : data.previous_level)
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, router])

  // Lanzar confeti cuando se carga la página
  useEffect(() => {
    if (!isLoading) {
      // Lanzar confeti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Lanzar confeti desde diferentes ángulos
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <TrainingLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </TrainingLayout>
    )
  }

  return (
    <TrainingLayout>
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 opacity-75 blur-lg"></div>
                <div className="relative bg-amber-100 rounded-full p-4">
                  <Trophy className="h-12 w-12 text-amber-500" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">¡Felicidades, {userName}!</CardTitle>
            <CardDescription className="text-lg">
              Has avanzado al nivel <span className="font-bold text-primary">{newLevel}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center p-4 border rounded-lg bg-muted/30 w-32">
                <div className="text-sm text-muted-foreground">Nivel Anterior</div>
                <div className="font-medium mt-1">{previousLevel}</div>
              </div>
              
              <ArrowRight className="h-6 w-6 text-primary" />
              
              <div className="text-center p-4 border-2 border-primary rounded-lg bg-primary/10 w-32">
                <div className="text-sm text-primary">Nivel Actual</div>
                <div className="font-medium mt-1">{newLevel}</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 text-center">Nuevas Funcionalidades Desbloqueadas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Dumbbell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Rutinas Avanzadas</h4>
                      <p className="text-sm text-muted-foreground">Acceso a entrenamientos más desafiantes</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Personalización</h4>
                      <p className="text-sm text-muted-foreground">Más opciones para adaptar tus entrenamientos</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Planificación</h4>
                      <p className="text-sm text-muted-foreground">Herramientas de planificación semanal</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-amber-100 rounded-full p-2 mr-3">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Nuevos Logros</h4>
                      <p className="text-sm text-muted-foreground">Desbloquea logros más desafiantes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground">
                Tu dedicación y consistencia te han llevado a este nuevo nivel. 
                ¡Sigue así para desbloquear más funcionalidades y avanzar en tu viaje fitness!
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => router.push('/training/dashboard')}
            >
              Continuar Mi Viaje
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TrainingLayout>
  )
}
