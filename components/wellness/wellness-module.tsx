"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  Wind,
  Brain,
  Smile,
  Sun,
  Plus,
  Calendar,
  BarChart3
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
import { BreathingExercise } from "@/components/wellness/breathing-exercise"
import EnhancedMeditationModule from "@/components/wellness/enhanced-meditation-module"
import { supabase } from "@/lib/supabase-client"
import { UserProfile } from "@/lib/types/user"

interface WellnessModuleProps {
  profile: UserProfile
}

export function WellnessModule({
  profile
}: WellnessModuleProps) {
  const [activeTab, setActiveTab] = useState('breathing')
  const [isLoading, setIsLoading] = useState(true)
  
  // Cargar datos de bienestar
  useEffect(() => {
    const loadWellnessData = async () => {
      setIsLoading(true)
      
      try {
        // Aquí cargaríamos datos adicionales si fuera necesario
      } catch (error) {
        console.error("Error al cargar datos de bienestar:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (profile) {
      loadWellnessData()
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
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="breathing">Respiración</TabsTrigger>
          <TabsTrigger value="meditation">Meditación</TabsTrigger>
          <TabsTrigger value="mood">Estado de ánimo</TabsTrigger>
          <TabsTrigger value="journal">Diario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breathing" className="space-y-4">
          {profile && (
            <BreathingExercise userId={profile.id} />
          )}
        </TabsContent>
        
        <TabsContent value="meditation" className="space-y-4">
          <EnhancedMeditationModule />
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>Seguimiento del estado de ánimo</Card3DTitle>
                
                <Button3D size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button3D>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="text-center py-8">
                <Smile className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin registros</h3>
                <p className="text-sm text-gray-500">
                  Registra tu estado de ánimo diariamente para ver patrones y tendencias.
                </p>
                <Button3D className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Primer registro
                </Button3D>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
        
        <TabsContent value="journal" className="space-y-4">
          <Card3D>
            <Card3DHeader>
              <div className="flex justify-between items-center">
                <Card3DTitle>Diario de gratitud</Card3DTitle>
                
                <Button3D size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva entrada
                </Button3D>
              </div>
            </Card3DHeader>
            <Card3DContent>
              <div className="text-center py-8">
                <Sun className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin entradas</h3>
                <p className="text-sm text-gray-500">
                  Escribe en tu diario de gratitud para mejorar tu bienestar mental.
                </p>
                <Button3D className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Primera entrada
                </Button3D>
              </div>
            </Card3DContent>
          </Card3D>
        </TabsContent>
      </Tabs>
    </div>
  )
}
