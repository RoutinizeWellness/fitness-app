"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
// import { useRequireAuth } from "@/lib/hooks/use-auth-redirect"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dumbbell,
  Utensils,
  Heart,
  Moon,
  ChevronRight,
  LogOut,
  BarChart2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "@/components/ui/mobile-nav"
import { FeatureCard } from "@/components/ui/feature-card"
import { StatCard } from "@/components/ui/stat-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import { AuthProfileDebug } from "@/components/debug/auth-profile-debug"

export default function DashboardPage() {
  const { user, profile, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [userExperienceLevel, setUserExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null)

  // ✅ ENHANCED: Detect user experience level and handle routing
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("Dashboard: Usuario no autenticado, redirigiendo a login")
      router.push("/auth/login?returnUrl=/dashboard")
      return
    }

    if (profile) {
      // Determine user experience level
      const experienceLevel = profile.experience_level || 'beginner'
      setUserExperienceLevel(experienceLevel)

      console.log('🎯 Dashboard: Nivel de experiencia detectado:', experienceLevel)

      // Check if user needs onboarding
      if (profile.onboarding_completed === false) {
        console.log('🎯 Dashboard: Usuario necesita completar onboarding')
        router.push('/onboarding/beginner')
        return
      }
    }
  }, [user, profile, isLoading, router])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Cargando tu perfil..." />
      </div>
    )
  }

  // No mostrar nada si no está autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Verificando autenticación..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'Usuario'}</p>
        </div>
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">{profile?.first_name?.[0] || profile?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <FeatureCard
          icon={Dumbbell}
          title="Entrenamiento"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          onClick={() => {
            // ✅ ENHANCED: Route based on user experience level
            if (userExperienceLevel === 'beginner') {
              router.push('/training/beginner')
            } else if (userExperienceLevel === 'advanced') {
              router.push('/training/advanced')
            } else {
              router.push('/training')
            }
          }}
        />

        <FeatureCard
          icon={Utensils}
          title="Nutrición"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          onClick={() => router.push('/nutrition')}
        />

        <FeatureCard
          icon={Moon}
          title="Sueño"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          onClick={() => router.push('/sleep')}
        />

        <FeatureCard
          icon={Heart}
          title="Bienestar"
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          onClick={() => router.push('/wellness')}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Entrenamiento de hoy</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Fuerza - Tren Superior</h3>
                <p className="text-sm text-muted-foreground">45 min • 6 ejercicios</p>
              </div>
              <Button
                onClick={() => {
                  // ✅ ENHANCED: Route based on user experience level
                  if (userExperienceLevel === 'beginner') {
                    router.push('/training/beginner')
                  } else if (userExperienceLevel === 'advanced') {
                    router.push('/training/advanced')
                  } else {
                    router.push('/training')
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md hover:shadow-lg"
              >
                Iniciar
              </Button>
            </div>
          </div>
          <div className="h-2 bg-primary/10 w-full">
            <div className="h-full bg-primary w-0 transition-all duration-300"></div>
          </div>
        </Card>

        <StatCard
          title="Progreso semanal"
          value="75%"
          description="3 de 4 entrenamientos"
          icon={<BarChart2 className="h-5 w-5" />}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          trend={{ value: 15, isPositive: true, label: "vs. semana pasada" }}
        />
      </div>

      <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Perfil</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/profile')}
            className="rounded-full hover:bg-primary/10 border-primary/20 hover:border-primary shadow-sm"
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-red-200 hover:border-red-300 font-medium"
          onClick={() => {
            // Cerrar sesión
            signOut?.();
            router.push('/auth/login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </Card>

      {/* Debug component - temporarily disabled */}
      <div className="mt-8">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg">Debug Info</h3>
          <div className="space-y-2 mt-2">
            <div><strong>Usuario:</strong> {user ? `${user.email} (${user.id})` : 'No autenticado'}</div>
            <div><strong>Perfil:</strong> {profile ? `${profile.full_name || profile.fullName} (${profile.id})` : 'No encontrado'}</div>
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
          </div>
        </div>
      </div>

      <MobileNav className="md:hidden" />
    </div>
  )
}
