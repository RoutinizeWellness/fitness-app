"use client"

import { useState, useEffect } from "react"
import {
  Moon,
  BarChart3,
  Calendar,
  Plus,
  Clock,
  Zap,
  Brain,
  Heart
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { SleepTracker } from "@/components/sleep/sleep-tracker"
import { supabase } from "@/lib/supabase-client"
import { UserProfile } from "@/lib/types/user"

interface SleepModuleProps {
  profile: UserProfile
}

export function SleepModule({
  profile
}: SleepModuleProps) {
  const [activeTab, setActiveTab] = useState('tracker')
  const [isLoading, setIsLoading] = useState(true)
  
  // Cargar datos de sueño
  useEffect(() => {
    const loadSleepData = async () => {
      setIsLoading(true)
      
      try {
        // Aquí cargaríamos datos adicionales si fuera necesario
      } catch (error) {
        console.error("Error al cargar datos de sueño:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (profile) {
      loadSleepData()
    }
  }, [profile])
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {/* Pestañas de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tracker">Seguimiento</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="tips">Consejos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracker" className="space-y-4">
          {profile && (
            <SleepTracker userId={profile.id} />
          )}
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Análisis del sueño</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin datos suficientes</h3>
                <p className="text-sm text-gray-500">
                  Registra tu sueño durante al menos una semana para ver análisis detallados.
                </p>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
        
        <TabsContent value="tips" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <Card3DTitle>Consejos para mejorar el sueño</Card3DTitle>
            </Card3DHeader>
            <Card3DContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Mantén un horario regular</h3>
                      <p className="text-sm text-gray-600">
                        Acuéstate y levántate a la misma hora todos los días, incluso los fines de semana.
                        Esto ayuda a regular tu reloj biológico interno.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Evita la cafeína y el alcohol</h3>
                      <p className="text-sm text-gray-600">
                        Limita el consumo de cafeína después del mediodía y evita el alcohol antes de dormir,
                        ya que ambos pueden interferir con la calidad del sueño.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 text-green-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Crea una rutina relajante</h3>
                      <p className="text-sm text-gray-600">
                        Establece una rutina relajante antes de dormir, como leer, meditar o tomar un baño caliente.
                        Evita las pantallas al menos una hora antes de acostarte.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Heart className="h-5 w-5 text-amber-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Optimiza tu entorno</h3>
                      <p className="text-sm text-gray-600">
                        Mantén tu habitación fresca, oscura y silenciosa. Considera usar tapones para los oídos,
                        una máscara para dormir o una máquina de ruido blanco si es necesario.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>
    </div>
  )
}
