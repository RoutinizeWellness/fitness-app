"use client"

import { useState } from 'react'
import { PointsDisplay } from '@/components/gamification/points-display'
import { TrainerAvatar } from '@/components/gamification/trainer-avatar'
import { CustomDashboard } from '@/components/gamification/custom-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, LayoutDashboard } from 'lucide-react'
import { User3D } from '@/components/icons/user-3d'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('points')
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA758]"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#FFF3E9]">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3"
              onClick={() => router.push('/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#573353]">
              Gamificación
            </h1>
          </div>
        </div>
      </header>

      <main className="px-6 pt-20 pb-32 overflow-y-auto h-[calc(896px-80px)] relative z-10">
        <Tabs defaultValue="points" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="points" className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Puntos
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center">
              <User3D className="h-4 w-4 mr-2" />
              Entrenador
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-6">
            <PointsDisplay />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Logros Desbloqueados</CardTitle>
                <CardDescription>Completa entrenamientos para desbloquear logros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9F9F9] rounded-lg p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FDA758] flex items-center justify-center mr-3">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Primer Entrenamiento</p>
                      <p className="text-xs text-[#573353]/70">+100 puntos</p>
                    </div>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-lg p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#5DE292] flex items-center justify-center mr-3">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Racha de 3 días</p>
                      <p className="text-xs text-[#573353]/70">+50 puntos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Próximos Logros</CardTitle>
                <CardDescription>Logros que puedes desbloquear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-[#F9F9F9] rounded-lg p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center mr-3">
                      <Trophy className="h-5 w-5 text-[#573353]/30" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Racha de 7 días</p>
                      <p className="text-xs text-[#573353]/70">Entrena 7 días seguidos</p>
                      <div className="h-1.5 bg-[#F0F0F0] rounded-full mt-1">
                        <div className="h-full rounded-full bg-[#FDA758]" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-lg p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center mr-3">
                      <Trophy className="h-5 w-5 text-[#573353]/30" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">10 Entrenamientos</p>
                      <p className="text-xs text-[#573353]/70">Completa 10 entrenamientos</p>
                      <div className="h-1.5 bg-[#F0F0F0] rounded-full mt-1">
                        <div className="h-full rounded-full bg-[#FDA758]" style={{ width: '20%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-6">
            <TrainerAvatar />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Personalización</CardTitle>
                <CardDescription>Personaliza tu entrenador virtual</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#573353]/70 mb-4">
                  Desbloquea más opciones de personalización completando logros y ganando puntos.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9F9F9] rounded-lg p-3 text-center">
                    <p className="text-sm font-medium mb-1">Cambiar Outfit</p>
                    <p className="text-xs text-[#573353]/70">500 puntos</p>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-lg p-3 text-center">
                    <p className="text-sm font-medium mb-1">Cambiar Voz</p>
                    <p className="text-xs text-[#573353]/70">750 puntos</p>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-lg p-3 text-center">
                    <p className="text-sm font-medium mb-1">Nuevas Animaciones</p>
                    <p className="text-xs text-[#573353]/70">1000 puntos</p>
                  </div>

                  <div className="bg-[#F9F9F9] rounded-lg p-3 text-center">
                    <p className="text-sm font-medium mb-1">Personalidad</p>
                    <p className="text-xs text-[#573353]/70">1500 puntos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <CustomDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
