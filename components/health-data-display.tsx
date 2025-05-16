"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useHealthData } from "@/hooks/use-health-data"
import { 
  Activity, 
  Heart, 
  Droplet, 
  Moon, 
  Flame,
  RefreshCw,
  Settings,
  Info
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface HealthDataDisplayProps {
  showDetails?: boolean
  compact?: boolean
}

export function HealthDataDisplay({ 
  showDetails = false,
  compact = false
}: HealthDataDisplayProps) {
  const { healthStats, isLoading, error } = useHealthData()
  const router = useRouter()
  
  // Efecto para mostrar errores
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }, [error])
  
  // Función para navegar a la página de detalles
  const handleViewDetails = () => {
    router.push("/health-data")
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Datos de Salud</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-2 w-full" />
            
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Si no hay datos de salud
  if (!healthStats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Datos de Salud</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Info className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos disponibles</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleViewDetails}
            >
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Renderizar datos de salud
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Datos de Salud</CardTitle>
          {!compact && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewDetails}
            >
              {showDetails ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pasos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">Pasos</div>
              </div>
              <div className="text-sm font-medium">
                {healthStats.steps.current.toLocaleString()} / {healthStats.steps.goal.toLocaleString()}
              </div>
            </div>
            <Progress value={healthStats.steps.percentage} className="h-2" />
          </div>
          
          {/* Frecuencia cardíaca */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`rounded-md p-1.5 mr-3 ${
                  healthStats.heart_rate.status === 'normal' ? 'bg-green-100 text-green-600' :
                  healthStats.heart_rate.status === 'high' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Heart className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">Frecuencia Cardíaca</div>
              </div>
              <div className="text-sm font-medium">
                {healthStats.heart_rate.current} BPM
              </div>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-0 bottom-0 w-1 bg-black"
                style={{ 
                  left: `${Math.min(100, Math.max(0, (healthStats.heart_rate.current - 40) / 1.4))}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{healthStats.heart_rate.min}</span>
              <span>Normal</span>
              <span>{healthStats.heart_rate.max}</span>
            </div>
          </div>
          
          {/* Mostrar detalles adicionales si se solicita */}
          {showDetails && (
            <>
              {/* Calorías */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-orange-100 text-orange-600 rounded-md p-1.5 mr-3">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">Calorías</div>
                  </div>
                  <div className="text-sm font-medium">
                    {healthStats.calories.burned} / {healthStats.calories.goal} kcal
                  </div>
                </div>
                <Progress value={healthStats.calories.percentage} className="h-2" />
              </div>
              
              {/* Sueño */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 text-indigo-600 rounded-md p-1.5 mr-3">
                      <Moon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">Sueño</div>
                  </div>
                  <div className="text-sm font-medium">
                    {healthStats.sleep.duration} / {healthStats.sleep.goal} h
                  </div>
                </div>
                <Progress value={healthStats.sleep.percentage} className="h-2" />
              </div>
              
              {/* Agua */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-600 rounded-md p-1.5 mr-3">
                      <Droplet className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">Agua</div>
                  </div>
                  <div className="text-sm font-medium">
                    {healthStats.water.intake} / {healthStats.water.goal} L
                  </div>
                </div>
                <Progress value={healthStats.water.percentage} className="h-2" />
              </div>
            </>
          )}
          
          {/* Botón para ver detalles en modo compacto */}
          {compact && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleViewDetails}
            >
              Ver detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
