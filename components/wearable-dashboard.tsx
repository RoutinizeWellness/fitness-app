"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Watch,
  Heart,
  Activity,
  BarChart2,
  Zap,
  RefreshCw,
  Footprints,
  Flame,
  Clock,
  Moon,
  Smartphone,
  Bluetooth,
  Loader2
} from "lucide-react"
import { BluetoothService } from "@/lib/bluetooth-service"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Tipos para los datos de actividad
interface ActivityData {
  steps: number
  caloriesBurned: number
  activeMinutes: number
  heartRate: {
    current: number
    resting: number
    max: number
  }
  sleep: {
    duration: number
    quality: number
  }
  lastUpdated: Date
}

// Tipos para los dispositivos
interface Device {
  id: string
  name: string
  type: string
  connected: boolean
  batteryLevel?: number
  lastSynced?: Date
}

export default function WearableDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activityData, setActivityData] = useState<ActivityData>({
    steps: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    heartRate: {
      current: 0,
      resting: 0,
      max: 0
    },
    sleep: {
      duration: 0,
      quality: 0
    },
    lastUpdated: new Date()
  })
  const [devices, setDevices] = useState<Device[]>([])
  const [historyData, setHistoryData] = useState<any[]>([])
  const [bluetoothService, setBluetoothService] = useState<BluetoothService | null>(null)

  // Inicializar el servicio Bluetooth
  useEffect(() => {
    const service = new BluetoothService()
    setBluetoothService(service)

    if (user?.id) {
      service.setUserId(user.id)
    }

    return () => {
      // Limpiar recursos si es necesario
    }
  }, [user?.id])

  // Cargar datos de actividad y dispositivos
  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Cargar dispositivos
        await loadDevices()

        // Cargar datos de actividad
        await loadActivityData()

        // Cargar datos históricos
        await loadHistoryData()
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  // Cargar dispositivos conectados
  const loadDevices = async () => {
    try {
      // Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('bluetooth_devices')
        .select('*')
        .eq('user_id', user?.id)

      if (error) {
        console.warn("Error al cargar dispositivos:", error)
        // Usar datos de ejemplo si hay error
        setDevices([
          {
            id: "device-1",
            name: "Mi Smart Band 6",
            type: "fitness_tracker",
            connected: true,
            batteryLevel: 78,
            lastSynced: new Date(Date.now() - 3600000) // 1 hora atrás
          },
          {
            id: "device-2",
            name: "Polar H10",
            type: "heart_rate",
            connected: false,
            batteryLevel: 92,
            lastSynced: new Date(Date.now() - 86400000) // 1 día atrás
          }
        ])
        return
      }

      if (data && data.length > 0) {
        const formattedDevices = data.map(device => ({
          id: device.device_id,
          name: device.name,
          type: device.type,
          connected: device.last_connected ?
            (new Date().getTime() - new Date(device.last_connected).getTime() < 3600000) : false,
          batteryLevel: device.battery_level || Math.floor(Math.random() * 30) + 70, // Simular nivel de batería
          lastSynced: device.last_connected ? new Date(device.last_connected) : new Date()
        }))
        setDevices(formattedDevices)
      } else {
        // Usar datos de ejemplo si no hay dispositivos
        setDevices([
          {
            id: "device-1",
            name: "Mi Smart Band 6",
            type: "fitness_tracker",
            connected: true,
            batteryLevel: 78,
            lastSynced: new Date(Date.now() - 3600000) // 1 hora atrás
          }
        ])
      }
    } catch (error) {
      console.error("Error al cargar dispositivos:", error)
      // Usar datos de ejemplo en caso de error
      setDevices([
        {
          id: "device-1",
          name: "Mi Smart Band 6",
          type: "fitness_tracker",
          connected: true,
          batteryLevel: 78,
          lastSynced: new Date(Date.now() - 3600000) // 1 hora atrás
        }
      ])
    }
  }

  // Cargar datos de actividad
  const loadActivityData = async () => {
    try {
      // Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(1)

      if (error) {
        console.warn("Error al cargar datos de actividad:", error)
        // Usar datos de ejemplo si hay error
        generateSampleActivityData()
        return
      }

      if (data && data.length > 0) {
        const latestData = data[0]
        setActivityData({
          steps: latestData.steps || 0,
          caloriesBurned: latestData.calories_burned || 0,
          activeMinutes: latestData.active_minutes || 0,
          heartRate: {
            current: latestData.heart_rate?.average || 0,
            resting: latestData.heart_rate?.resting || 0,
            max: latestData.heart_rate?.max || 0
          },
          sleep: {
            duration: latestData.sleep?.duration || 0,
            quality: latestData.sleep?.score || 0
          },
          lastUpdated: new Date(latestData.created_at)
        })
      } else {
        // Usar datos de ejemplo si no hay datos
        generateSampleActivityData()
      }
    } catch (error) {
      console.error("Error al cargar datos de actividad:", error)
      // Usar datos de ejemplo en caso de error
      generateSampleActivityData()
    }
  }

  // Generar datos de actividad de ejemplo
  const generateSampleActivityData = () => {
    const now = new Date()
    const steps = Math.floor(Math.random() * 5000) + 3000
    const caloriesBurned = Math.floor(steps * 0.05)
    const activeMinutes = Math.floor(steps / 100)

    setActivityData({
      steps,
      caloriesBurned,
      activeMinutes,
      heartRate: {
        current: Math.floor(Math.random() * 20) + 65,
        resting: 62,
        max: 142
      },
      sleep: {
        duration: 7.2,
        quality: 82
      },
      lastUpdated: now
    })
  }

  // Cargar datos históricos
  const loadHistoryData = async () => {
    try {
      // Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('wearable_data')
        .select('date, steps, calories_burned, active_minutes, heart_rate')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(7)

      if (error) {
        console.warn("Error al cargar datos históricos:", error)
        // Usar datos de ejemplo si hay error
        generateSampleHistoryData()
        return
      }

      if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short' }),
          steps: item.steps || 0,
          calories: item.calories_burned || 0,
          activeMinutes: item.active_minutes || 0,
          heartRate: item.heart_rate?.average || 0
        })).reverse()

        setHistoryData(formattedData)
      } else {
        // Usar datos de ejemplo si no hay datos
        generateSampleHistoryData()
      }
    } catch (error) {
      console.error("Error al cargar datos históricos:", error)
      // Usar datos de ejemplo en caso de error
      generateSampleHistoryData()
    }
  }

  // Generar datos históricos de ejemplo
  const generateSampleHistoryData = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const data = days.map((day, index) => ({
      date: day,
      steps: Math.floor(Math.random() * 5000) + 3000,
      calories: Math.floor(Math.random() * 300) + 200,
      activeMinutes: Math.floor(Math.random() * 60) + 30,
      heartRate: Math.floor(Math.random() * 20) + 65
    }))

    setHistoryData(data)
  }

  // Refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadActivityData()
      await loadHistoryData()

      toast({
        title: "Datos actualizados",
        description: "Los datos de actividad han sido actualizados correctamente"
      })
    } catch (error) {
      console.error("Error al refrescar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Conectar nuevo dispositivo
  const handleConnectDevice = async () => {
    if (!bluetoothService) {
      toast({
        title: "Error",
        description: "El servicio Bluetooth no está disponible",
        variant: "destructive"
      })
      return
    }

    setIsConnecting(true)
    try {
      const newDevices = await bluetoothService.scanForHeartRateDevices()

      if (newDevices && newDevices.length > 0) {
        toast({
          title: "Dispositivo encontrado",
          description: `Se ha conectado a ${newDevices[0].name}`
        })

        // Actualizar lista de dispositivos
        await loadDevices()
      } else {
        toast({
          title: "No se encontraron dispositivos",
          description: "No se encontraron dispositivos compatibles cercanos"
        })
      }
    } catch (error) {
      console.error("Error al conectar dispositivo:", error)
      toast({
        title: "Error",
        description: "No se pudo conectar al dispositivo",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Actividad Física</h2>
          <p className="text-muted-foreground">Monitorea tu actividad física y conecta tus dispositivos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden md:inline">Actualizar</span>
          </Button>
          <Button
            size="sm"
            onClick={handleConnectDevice}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Bluetooth className="h-4 w-4 mr-2" />
            )}
            Conectar Dispositivo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Historial</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Watch className="h-4 w-4" />
            <span>Dispositivos</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tarjeta de Pasos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pasos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
                    <Footprints className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activityData.steps.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Meta: 10,000 • {Math.round((activityData.steps / 10000) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress value={(activityData.steps / 10000) * 100} className="mt-3" />
              </CardContent>
            </Card>

            {/* Tarjeta de Calorías */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Calorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activityData.caloriesBurned.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Meta: 500 • {Math.round((activityData.caloriesBurned / 500) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress value={(activityData.caloriesBurned / 500) * 100} className="mt-3 bg-orange-100 dark:bg-orange-900/20" indicatorColor="bg-orange-500" />
              </CardContent>
            </Card>

            {/* Tarjeta de Minutos Activos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Minutos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activityData.activeMinutes}</div>
                    <div className="text-xs text-muted-foreground">
                      Meta: 60 • {Math.round((activityData.activeMinutes / 60) * 100)}%
                    </div>
                  </div>
                </div>
                <Progress value={(activityData.activeMinutes / 60) * 100} className="mt-3 bg-green-100 dark:bg-green-900/20" indicatorColor="bg-green-500" />
              </CardContent>
            </Card>

            {/* Tarjeta de Frecuencia Cardíaca */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Frecuencia Cardíaca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activityData.heartRate.current} bpm</div>
                    <div className="text-xs text-muted-foreground">
                      Reposo: {activityData.heartRate.resting} • Máx: {activityData.heartRate.max}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1">
                  <div className="h-1 rounded-full bg-blue-200"></div>
                  <div className="h-1 rounded-full bg-green-200"></div>
                  <div className="h-1 rounded-full bg-yellow-200"></div>
                  <div className="h-1 rounded-full bg-orange-200"></div>
                  <div className="h-1 rounded-full bg-red-200"></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Reposo</span>
                  <span>Máx</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tarjeta de Sueño */}
          <Card>
            <CardHeader>
              <CardTitle>Sueño</CardTitle>
              <CardDescription>Duración y calidad del sueño</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Moon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{activityData.sleep.duration} horas</div>
                      <div className="text-xs text-muted-foreground">
                        Meta: 8 horas • {Math.round((activityData.sleep.duration / 8) * 100)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={(activityData.sleep.duration / 8) * 100} className="mb-2 bg-indigo-100 dark:bg-indigo-900/20" indicatorColor="bg-indigo-500" />
                  <div className="grid grid-cols-4 gap-1 mt-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Profundo</div>
                      <div className="font-medium">{Math.round(activityData.sleep.duration * 0.2)} h</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Ligero</div>
                      <div className="font-medium">{Math.round(activityData.sleep.duration * 0.5)} h</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">REM</div>
                      <div className="font-medium">{Math.round(activityData.sleep.duration * 0.25)} h</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Despierto</div>
                      <div className="font-medium">{Math.round(activityData.sleep.duration * 0.05)} h</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{activityData.sleep.quality}/100</div>
                      <div className="text-xs text-muted-foreground">
                        Calidad del sueño
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Tiempo para dormir</span>
                      <span>15 min</span>
                    </div>
                    <Progress value={75} className="bg-indigo-100 dark:bg-indigo-900/20" indicatorColor="bg-indigo-500" />

                    <div className="flex justify-between text-xs">
                      <span>Consistencia</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="bg-indigo-100 dark:bg-indigo-900/20" indicatorColor="bg-indigo-500" />

                    <div className="flex justify-between text-xs">
                      <span>Interrupciones</span>
                      <span>2</span>
                    </div>
                    <Progress value={90} className="bg-indigo-100 dark:bg-indigo-900/20" indicatorColor="bg-indigo-500" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Última actualización: {activityData.lastUpdated.toLocaleString()}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Historial */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
              <CardDescription>Datos de los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#3b82f6" name="Pasos" />
                    <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#f97316" name="Calorías" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                  Pasos
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400">
                  Calorías
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                  Minutos Activos
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                  Frecuencia Cardíaca
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Semanal</CardTitle>
              <CardDescription>Comparación con la semana anterior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Pasos</div>
                  <div className="text-2xl font-bold mt-1">42,651</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <span className="text-xs">+12% vs semana anterior</span>
                  </div>
                </div>

                <div className="flex flex-col p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Calorías</div>
                  <div className="text-2xl font-bold mt-1">3,245</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <span className="text-xs">+8% vs semana anterior</span>
                  </div>
                </div>

                <div className="flex flex-col p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Minutos Activos</div>
                  <div className="text-2xl font-bold mt-1">320</div>
                  <div className="flex items-center mt-2 text-red-600">
                    <span className="text-xs">-5% vs semana anterior</span>
                  </div>
                </div>

                <div className="flex flex-col p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Sueño (promedio)</div>
                  <div className="text-2xl font-bold mt-1">7.2h</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <span className="text-xs">+0.5h vs semana anterior</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Dispositivos */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos Conectados</CardTitle>
              <CardDescription>Gestiona tus dispositivos de seguimiento de actividad</CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length > 0 ? (
                <div className="space-y-4">
                  {devices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${device.connected ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {device.type === 'heart_rate' ? (
                            <Heart className="h-6 w-6" />
                          ) : (
                            <Watch className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            {device.connected ? (
                              <>
                                <span className="flex items-center text-green-600 dark:text-green-400">
                                  <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 mr-1"></span>
                                  Conectado
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center text-gray-500">
                                  <span className="h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                                  Desconectado
                                </span>
                              </>
                            )}
                            {device.lastSynced && (
                              <span className="ml-2">
                                • Última sincronización: {device.lastSynced.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {device.batteryLevel !== undefined && (
                          <div className="text-xs text-muted-foreground mr-4">
                            Batería: {device.batteryLevel}%
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          {device.connected ? "Desconectar" : "Conectar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay dispositivos conectados</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecta un dispositivo para comenzar a rastrear tu actividad física
                  </p>
                  <Button onClick={handleConnectDevice} disabled={isConnecting}>
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Bluetooth className="h-4 w-4 mr-2" />
                    )}
                    Conectar Dispositivo
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t">
              <div className="w-full">
                <h3 className="text-sm font-medium mb-2">Dispositivos Compatibles</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Fitbit</Badge>
                  <Badge variant="outline">Garmin</Badge>
                  <Badge variant="outline">Apple Watch</Badge>
                  <Badge variant="outline">Samsung Galaxy Watch</Badge>
                  <Badge variant="outline">Xiaomi Mi Band</Badge>
                  <Badge variant="outline">Polar</Badge>
                  <Badge variant="outline">Dispositivos Bluetooth</Badge>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
