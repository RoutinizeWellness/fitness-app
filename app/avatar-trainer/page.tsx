"use client"

import { useState, useEffect } from 'react'
import { ThreeDAvatar } from '@/components/avatar/3d-avatar'
import { ExerciseDemonstrator } from '@/components/avatar/exercise-demonstrator'
import { AvatarCustomizer } from '@/components/avatar/avatar-customizer'
import { AvatarIntelligence } from '@/components/avatar/avatar-intelligence'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dumbbell, Palette, Brain } from 'lucide-react'
import { User3D } from '@/components/icons/user-3d'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

export default function AvatarTrainerPage() {
  const [activeTab, setActiveTab] = useState('avatar')
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
              Entrenador Virtual 3D
            </h1>
          </div>
        </div>
      </header>

      <main className="px-6 pt-20 pb-32 overflow-y-auto h-[calc(896px-80px)] relative z-10">
        <Tabs defaultValue="avatar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="avatar" className="flex items-center">
              <User3D className="h-4 w-4 mr-2" />
              Entrenador
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-2" />
              Ejercicios
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Personalizar
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar" className="space-y-6">
            <ThreeDAvatar />

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-[#573353]">Sobre tu Entrenador Virtual</h3>
              <p className="text-sm text-[#573353]/80 mb-4">
                Tu entrenador virtual 3D está diseñado para ayudarte en tu viaje fitness. Puede demostrar ejercicios,
                proporcionar consejos personalizados y motivarte durante tus entrenamientos.
              </p>

              <h4 className="font-medium text-[#573353] mb-2">Características principales:</h4>
              <ul className="text-sm text-[#573353]/80 space-y-1 list-disc pl-5">
                <li>Demostraciones de ejercicios en 3D con técnica correcta</li>
                <li>Conversaciones naturales con inteligencia artificial</li>
                <li>Recomendaciones personalizadas basadas en tus objetivos</li>
                <li>Análisis de forma y correcciones en tiempo real</li>
                <li>Personalización completa de apariencia y personalidad</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <ExerciseDemonstrator />

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-[#573353]">Biblioteca de Ejercicios</h3>
              <p className="text-sm text-[#573353]/80 mb-4">
                Tu entrenador virtual puede demostrar una amplia variedad de ejercicios con técnica perfecta.
                Observa los movimientos desde cualquier ángulo y recibe consejos personalizados.
              </p>

              <h4 className="font-medium text-[#573353] mb-2">Categorías de ejercicios:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-[#F9F9F9] p-2 rounded">
                  <span className="font-medium">Fuerza</span>
                  <p className="text-xs text-[#573353]/70">45 ejercicios</p>
                </div>
                <div className="bg-[#F9F9F9] p-2 rounded">
                  <span className="font-medium">Cardio</span>
                  <p className="text-xs text-[#573353]/70">28 ejercicios</p>
                </div>
                <div className="bg-[#F9F9F9] p-2 rounded">
                  <span className="font-medium">Flexibilidad</span>
                  <p className="text-xs text-[#573353]/70">32 ejercicios</p>
                </div>
                <div className="bg-[#F9F9F9] p-2 rounded">
                  <span className="font-medium">Equilibrio</span>
                  <p className="text-xs text-[#573353]/70">15 ejercicios</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <AvatarCustomizer />

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-[#573353]">Personalización Avanzada</h3>
              <p className="text-sm text-[#573353]/80 mb-4">
                Personaliza completamente la apariencia y personalidad de tu entrenador virtual para crear
                una experiencia única que se adapte a tus preferencias.
              </p>

              <h4 className="font-medium text-[#573353] mb-2">Opciones de personalización:</h4>
              <ul className="text-sm text-[#573353]/80 space-y-1 list-disc pl-5">
                <li>Apariencia física: tipo de cuerpo, rasgos faciales, color de piel</li>
                <li>Estilo: peinado, ropa, accesorios, colores</li>
                <li>Personalidad: motivacional, técnico, apoyo o desafiante</li>
                <li>Especialización: fuerza, cardio, flexibilidad o general</li>
                <li>Voz y forma de comunicación</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <AvatarIntelligence />

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-[#573353]">Inteligencia Artificial</h3>
              <p className="text-sm text-[#573353]/80 mb-4">
                Tu entrenador virtual utiliza inteligencia artificial avanzada para ofrecerte una experiencia
                personalizada y adaptativa que evoluciona con el tiempo.
              </p>

              <h4 className="font-medium text-[#573353] mb-2">Capacidades de IA:</h4>
              <ul className="text-sm text-[#573353]/80 space-y-1 list-disc pl-5">
                <li>Reconocimiento de ejercicios y análisis de forma</li>
                <li>Conversación natural con comprensión contextual</li>
                <li>Recomendaciones personalizadas basadas en tu progreso</li>
                <li>Adaptación a tu nivel de energía y estado de recuperación</li>
                <li>Aprendizaje continuo de tus preferencias y necesidades</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
