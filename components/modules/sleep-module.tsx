"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Moon, Clock, Calendar, Filter,
  ChevronRight, Play, Bookmark, Share2,
  BarChart3, Sun, BedDouble, Music,
  Waves, CloudRain, Wind, Plus,
  Heart, Zap, Settings, Smartphone,
  ChevronDown, ChevronUp, Alarm, Coffee,
  Wine, Tv, Activity, Thermometer,
  RefreshCw, Info, Target, BarChart2,
  Lightbulb, Brain
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"
import { SleepEntry, SleepGoal, SleepStats, DeviceSource } from "@/lib/types/wellness"
import { SleepService } from "@/lib/services/sleep-service"
import { WearableService } from "@/lib/services/wearable-service"
import { SleepTracker } from "./sleep/sleep-tracker"
import { SleepAnalytics } from "./sleep/sleep-analytics"
import { SleepDeviceIntegration } from "./sleep/sleep-device-integration"
import { NapOptimizer } from "./sleep/nap-optimizer"
import { SleepRecommendations } from "./sleep/sleep-recommendations"
import { AddSleepEntryForm } from "./sleep/AddSleepEntryForm"
import { SleepGoalForm } from "./sleep/SleepGoalForm"

interface SleepModuleProps {
  profile: User | null
  isAdmin: boolean
  isLoading?: boolean
  onNavigate?: (path: string) => void
}

export function SleepModule({
  profile,
  isAdmin,
  isLoading: initialLoading = false,
  onNavigate
}: SleepModuleProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('tracker')
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [sleepGoal, setSleepGoal] = useState<SleepGoal | null>(null)
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [showAddSleepDialog, setShowAddSleepDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showDeviceDialog, setShowDeviceDialog] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  // Categorías de sueño
  const categories = [
    { id: "all", name: "Todos" },
    { id: "sounds", name: "Sonidos" },
    { id: "meditation", name: "Meditación" },
    { id: "stories", name: "Historias" },
    { id: "music", name: "Música" }
  ]

  // Datos para el registro de sueño
  const sleepData = [
    { day: "Lun", hours: 7.5, quality: 85 },
    { day: "Mar", hours: 6.2, quality: 65 },
    { day: "Mié", hours: 8.0, quality: 90 },
    { day: "Jue", hours: 7.8, quality: 88 },
    { day: "Vie", hours: 6.5, quality: 70 },
    { day: "Sáb", hours: 8.5, quality: 95 },
    { day: "Dom", hours: 7.2, quality: 80 }
  ]

  // Datos para los sonidos para dormir
  const sleepSounds = [
    {
      id: "sound1",
      title: "Lluvia suave",
      duration: "45 min",
      icon: CloudRain,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "sound2",
      title: "Ruido blanco",
      duration: "60 min",
      icon: Waves,
      color: "bg-gray-100 text-gray-600"
    },
    {
      id: "sound3",
      title: "Bosque nocturno",
      duration: "30 min",
      icon: Wind,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "sound4",
      title: "Melodía relajante",
      duration: "40 min",
      icon: Music,
      color: "bg-purple-100 text-purple-600"
    }
  ]

  // Datos para las rutinas de sueño
  const sleepRoutines = [
    {
      id: "routine1",
      title: "Rutina para dormir profundamente",
      duration: "15 min",
      steps: 4,
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "routine2",
      title: "Meditación para conciliar el sueño",
      duration: "10 min",
      steps: 3,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "routine3",
      title: "Respiración 4-7-8 para dormir",
      duration: "5 min",
      steps: 2,
      color: "from-purple-500 to-pink-600"
    }
  ]

  // Cargar datos de sueño
  useEffect(() => {
    const loadSleepData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Cargar registros de sueño
        const { data: entries, error: entriesError } = await SleepService.getSleepEntries(user.id, {
          limit: 30
        })

        if (entriesError) {
          throw entriesError
        }

        setSleepEntries(entries || [])

        // Cargar objetivo de sueño
        const { data: goal, error: goalError } = await SleepService.getSleepGoal(user.id)

        if (goalError) {
          throw goalError
        }

        setSleepGoal(goal)

        // Cargar estadísticas de sueño
        const { data: stats, error: statsError } = await SleepService.getSleepStats(user.id)

        if (statsError) {
          throw statsError
        }

        setSleepStats(stats)
      } catch (error) {
        console.error('Error al cargar datos de sueño:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de sueño",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSleepData()
  }, [user])

  // Manejar guardado de registro de sueño
  const handleSaveSleepEntry = async (entry: SleepEntry) => {
    if (!user) return

    try {
      const { data, error } = await SleepService.saveSleepEntry(entry)

      if (error) {
        throw error
      }

      // Actualizar lista de registros
      setSleepEntries(prev => [data!, ...prev.filter(e => e.id !== data!.id)])

      // Actualizar estadísticas
      const { data: stats } = await SleepService.getSleepStats(user.id)
      setSleepStats(stats || null)

      toast({
        title: "Registro guardado",
        description: "El registro de sueño ha sido guardado correctamente"
      })

      setShowAddSleepDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar registro de sueño'
      console.error('Error al guardar registro de sueño:', {
        error: errorMessage,
        userId: user?.id,
        entryDate: entry.date,
        details: error
      })
      toast({
        title: "Error",
        description: errorMessage || "No se pudo guardar el registro de sueño",
        variant: "destructive"
      })
    }
  }

  // Manejar guardado de objetivo de sueño
  const handleSaveSleepGoal = async (goal: SleepGoal) => {
    if (!user) return

    try {
      const { data, error } = await SleepService.saveSleepGoal(goal)

      if (error) {
        throw error
      }

      setSleepGoal(data)

      toast({
        title: "Objetivo guardado",
        description: "El objetivo de sueño ha sido guardado correctamente"
      })

      setShowGoalDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar objetivo de sueño'
      console.error('Error al guardar objetivo de sueño:', {
        error: errorMessage,
        userId: user?.id,
        targetDuration: goal.targetDuration,
        details: error
      })
      toast({
        title: "Error",
        description: errorMessage || "No se pudo guardar el objetivo de sueño",
        variant: "destructive"
      })
    }
  }

  // Manejar conexión con dispositivo
  const handleConnectDevice = async (deviceType: DeviceSource) => {
    if (!user) return

    try {
      // Simular conexión con dispositivo
      const authData = {
        authToken: 'sample-token',
        refreshToken: 'sample-refresh-token',
        expiresIn: 3600
      }

      const { data, error } = await WearableService.connectWearable(user.id, deviceType, authData)

      if (error) {
        throw error
      }

      toast({
        title: "Dispositivo conectado",
        description: `Se ha conectado correctamente con ${getDeviceName(deviceType)}`
      })

      // Sincronizar datos
      await WearableService.syncWearableData(user.id, deviceType)

      // Recargar datos
      const { data: entries } = await SleepService.getSleepEntries(user.id, {
        limit: 30
      })

      setSleepEntries(entries || [])

      setShowDeviceDialog(false)
    } catch (error) {
      console.error('Error al conectar dispositivo:', error)
      toast({
        title: "Error",
        description: "No se pudo conectar con el dispositivo",
        variant: "destructive"
      })
    }
  }

  // Obtener nombre de dispositivo
  const getDeviceName = (deviceType: DeviceSource): string => {
    switch (deviceType) {
      case 'oura':
        return 'Oura Ring'
      case 'whoop':
        return 'Whoop'
      case 'garmin':
        return 'Garmin'
      case 'apple_watch':
        return 'Apple Watch'
      case 'fitbit':
        return 'Fitbit'
      case 'polar':
        return 'Polar'
      default:
        return 'Manual'
    }
  }

  // Función para manejar la navegación
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Calcular el promedio de horas de sueño
  const averageSleepHours = sleepData.reduce((acc, day) => acc + day.hours, 0) / sleepData.length

  // Calcular el promedio de calidad de sueño
  const averageSleepQuality = sleepData.reduce((acc, day) => acc + day.quality, 0) / sleepData.length

  // Renderizar resumen de sueño
  const renderSleepSummary = () => {
    if (!sleepStats) return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card3D className="p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-2xl font-bold">{Math.floor(sleepStats.averageDuration / 60)}h {sleepStats.averageDuration % 60}m</h3>
            <p className="text-sm text-muted-foreground">Duración media</p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <Moon className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-2xl font-bold">{sleepStats.averageQuality.toFixed(1)}/10</h3>
            <p className="text-sm text-muted-foreground">Calidad media</p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <Heart className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-2xl font-bold">{sleepStats.averageHrv?.toFixed(0) || '--'}</h3>
            <p className="text-sm text-muted-foreground">HRV medio (ms)</p>
          </div>
        </Card3D>

        <Card3D className="p-4">
          <div className="flex flex-col items-center justify-center h-full">
            <Activity className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-2xl font-bold">{sleepStats.averageRestingHeartRate?.toFixed(0) || '--'}</h3>
            <p className="text-sm text-muted-foreground">FC en reposo</p>
          </div>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sueño</h2>
          <p className="text-muted-foreground">Seguimiento y análisis de tu sueño</p>
        </div>

        <div className="flex space-x-2">
          <Button3D variant="outline" onClick={() => setShowDeviceDialog(true)}>
            <Smartphone className="h-4 w-4 mr-2" />
            Conectar Dispositivo
          </Button3D>

          <Button3D variant="outline" onClick={() => setShowGoalDialog(true)}>
            <Target className="h-4 w-4 mr-2" />
            Objetivos
          </Button3D>

          <Button3D onClick={() => setShowAddSleepDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Registro
          </Button3D>
        </div>
      </div>

      {renderSleepSummary()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="tracker">
            <Moon className="h-4 w-4 mr-2" />
            Registro
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="naps">
            <Zap className="h-4 w-4 mr-2" />
            Siestas
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-0">
          <SleepTracker
            entries={sleepEntries}
            goal={sleepGoal}
            onAddEntry={() => setShowAddSleepDialog(true)}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <SleepAnalytics
            stats={sleepStats}
            entries={sleepEntries}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="naps" className="mt-0">
          <NapOptimizer userId={user?.id || profile?.id || ''} />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <SleepRecommendations
            stats={sleepStats}
            goal={sleepGoal}
            entries={sleepEntries}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogo para añadir registro de sueño */}
      <Dialog open={showAddSleepDialog} onOpenChange={setShowAddSleepDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Registro de Sueño</DialogTitle>
            <DialogDescription>
              Registra los detalles de tu sueño para hacer un seguimiento de tu descanso
            </DialogDescription>
          </DialogHeader>

          <AddSleepEntryForm
            userId={user?.id || profile?.id || ''}
            onSave={handleSaveSleepEntry}
            onCancel={() => setShowAddSleepDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para configurar objetivos de sueño */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Objetivos de Sueño</DialogTitle>
            <DialogDescription>
              Establece tus objetivos de sueño para mejorar tu descanso
            </DialogDescription>
          </DialogHeader>

          <SleepGoalForm
            userId={user?.id || profile?.id || ''}
            currentGoal={sleepGoal}
            onSave={handleSaveSleepGoal}
            onCancel={() => setShowGoalDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para conectar dispositivos */}
      <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Dispositivo</DialogTitle>
            <DialogDescription>
              Conecta tu dispositivo wearable para sincronizar automáticamente tus datos de sueño
            </DialogDescription>
          </DialogHeader>

          <SleepDeviceIntegration
            userId={user?.id || profile?.id || ''}
            onConnect={handleConnectDevice}
            onCancel={() => setShowDeviceDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Botón flotante para registrar sueño */}
      <div className="fixed bottom-20 right-4">
        <Button3D
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 border-none hover:shadow-indigo-200 hover:scale-105 transition-all"
          onClick={() => setShowAddSleepDialog(true)}
        >
          <Plus className="h-7 w-7 text-white" />
        </Button3D>
      </div>
    </div>
  )
}
