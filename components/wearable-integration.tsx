"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  Watch, 
  Heart, 
  Activity, 
  BarChart2, 
  Zap, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Smartphone,
  Link,
  Link2Off
} from "lucide-react"
import { 
  getConnectedWearables, 
  connectWearable, 
  disconnectWearable,
  getWearableData
} from "@/lib/supabase-wearables"

interface WearableIntegrationProps {
  userId: string
}

export default function WearableIntegration({ userId }: WearableIntegrationProps) {
  const [activeTab, setActiveTab] = useState("connected")
  const [connectedDevices, setConnectedDevices] = useState([])
  const [availableDevices, setAvailableDevices] = useState([
    { id: "fitbit", name: "Fitbit", icon: <Watch className="h-5 w-5" />, connected: false },
    { id: "garmin", name: "Garmin", icon: <Watch className="h-5 w-5" />, connected: false },
    { id: "apple_watch", name: "Apple Watch", icon: <Watch className="h-5 w-5" />, connected: false },
    { id: "samsung_health", name: "Samsung Health", icon: <Heart className="h-5 w-5" />, connected: false },
    { id: "google_fit", name: "Google Fit", icon: <Activity className="h-5 w-5" />, connected: false },
    { id: "strava", name: "Strava", icon: <Zap className="h-5 w-5" />, connected: false },
    { id: "polar", name: "Polar", icon: <Heart className="h-5 w-5" />, connected: false },
    { id: "suunto", name: "Suunto", icon: <Watch className="h-5 w-5" />, connected: false }
  ])
  const [wearableData, setWearableData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(true)

  // Cargar dispositivos conectados al montar el componente
  useEffect(() => {
    async function loadConnectedDevices() {
      try {
        setIsLoading(true)
        const { data, error } = await getConnectedWearables(userId)
        
        if (error) throw error
        
        if (data) {
          setConnectedDevices(data)
          
          // Actualizar estado de conexión en dispositivos disponibles
          const updatedAvailableDevices = availableDevices.map(device => ({
            ...device,
            connected: data.some(d => d.device_id === device.id)
          }))
          setAvailableDevices(updatedAvailableDevices)
          
          // Si hay dispositivos conectados, cargar datos del primero
          if (data.length > 0) {
            loadWearableData(data[0].device_id)
          }
        }
      } catch (error) {
        console.error("Error al cargar dispositivos conectados:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los dispositivos conectados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadConnectedDevices()
  }, [userId, availableDevices])

  // Cargar datos de un dispositivo
  async function loadWearableData(deviceId) {
    try {
      setIsRefreshing(true)
      const { data, error } = await getWearableData(userId, deviceId)
      
      if (error) throw error
      
      if (data) {
        setWearableData(data)
      }
    } catch (error) {
      console.error("Error al cargar datos del dispositivo:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dispositivo",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Conectar un dispositivo
  async function handleConnectDevice(deviceId) {
    try {
      setIsConnecting(true)
      const { error } = await connectWearable(userId, deviceId)
      
      if (error) throw error
      
      // Actualizar lista de dispositivos conectados
      const { data: updatedDevices } = await getConnectedWearables(userId)
      if (updatedDevices) {
        setConnectedDevices(updatedDevices)
        
        // Actualizar estado de conexión en dispositivos disponibles
        const updatedAvailableDevices = availableDevices.map(device => ({
          ...device,
          connected: updatedDevices.some(d => d.device_id === device.id)
        }))
        setAvailableDevices(updatedAvailableDevices)
      }
      
      toast({
        title: "Dispositivo conectado",
        description: "El dispositivo ha sido conectado correctamente",
      })
    } catch (error) {
      console.error("Error al conectar dispositivo:", error)
      toast({
        title: "Error",
        description: "No se pudo conectar el dispositivo",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Desconectar un dispositivo
  async function handleDisconnectDevice(deviceId) {
    try {
      const { error } = await disconnectWearable(userId, deviceId)
      
      if (error) throw error
      
      // Actualizar lista de dispositivos conectados
      const { data: updatedDevices } = await getConnectedWearables(userId)
      if (updatedDevices) {
        setConnectedDevices(updatedDevices)
        
        // Actualizar estado de conexión en dispositivos disponibles
        const updatedAvailableDevices = availableDevices.map(device => ({
          ...device,
          connected: updatedDevices.some(d => d.device_id === device.id)
        }))
        setAvailableDevices(updatedAvailableDevices)
      }
      
      // Si el dispositivo desconectado es el que se está mostrando, limpiar datos
      if (wearableData && wearableData.device_id === deviceId) {
        setWearableData(null)
      }
      
      toast({
        title: "Dispositivo desconectado",
        description: "El dispositivo ha sido desconectado correctamente",
      })
    } catch (error) {
      console.error("Error al desconectar dispositivo:", error)
      toast({
        title: "Error",
        description: "No se pudo desconectar el dispositivo",
        variant: "destructive",
      })
    }
  }

  // Renderizar dispositivos conectados
  function renderConnectedDevices() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
          ))}
        </div>
      )
    }

    if (connectedDevices.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Link2Off className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay dispositivos conectados</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Conecta un dispositivo para sincronizar tus datos de actividad
          </p>
          <Button onClick={() => setActiveTab("available")}>
            Conectar dispositivo
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {connectedDevices.map((device) => {
          const deviceInfo = availableDevices.find(d => d.id === device.device_id) || {
            name: device.device_name,
            icon: <Watch className="h-5 w-5" />
          }
          
          return (
            <div key={device.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 text-primary rounded-full p-2">
                  {deviceInfo.icon}
                </div>
                <div>
                  <h3 className="font-medium">{deviceInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Conectado: {new Date(device.connected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadWearableData(device.device_id)}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Actualizar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDisconnectDevice(device.device_id)}
                >
                  <Link2Off className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar dispositivos disponibles
  function renderAvailableDevices() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableDevices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 text-primary rounded-full p-2">
                {device.icon}
              </div>
              <div>
                <h3 className="font-medium">{device.name}</h3>
                <div className="flex items-center mt-1">
                  {device.connected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      No conectado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant={device.connected ? "outline" : "default"} 
              size="sm"
              onClick={() => device.connected ? handleDisconnectDevice(device.id) : handleConnectDevice(device.id)}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Skeleton className="h-4 w-4 rounded-full animate-spin" />
              ) : device.connected ? (
                <>
                  <Link2Off className="h-4 w-4 mr-2" />
                  Desconectar
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar datos del dispositivo
  function renderWearableData() {
    if (!wearableData) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay datos disponibles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona un dispositivo para ver sus datos
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="font-medium text-2xl">{wearableData.steps.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Objetivo: 10,000
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Calorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="font-medium text-2xl">{wearableData.calories.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Activas: {wearableData.active_calories.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distancia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="font-medium text-2xl">{wearableData.distance.toFixed(2)} km</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Objetivo: 5 km
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ritmo cardíaco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="font-medium text-2xl">{wearableData.heart_rate} bpm</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Máx: {wearableData.max_heart_rate} bpm
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Datos de las últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">Gráfico de actividad (en desarrollo)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrenamientos</CardTitle>
            <CardDescription>
              Últimos entrenamientos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wearableData.workouts.map((workout, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{workout.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Activity className="h-3 w-3 mr-1" />
                      {workout.duration} · {workout.calories} kcal
                    </div>
                  </div>
                  <Badge variant="outline">{workout.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Integración con Wearables</h1>
        <div className="flex items-center space-x-2">
          <Switch 
            id="sync-enabled" 
            checked={syncEnabled} 
            onCheckedChange={setSyncEnabled}
          />
          <Label htmlFor="sync-enabled">Sincronización automática</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
              <CardDescription>
                Gestiona tus dispositivos conectados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 rounded-none border-b">
                  <TabsTrigger value="connected" className="rounded-none">
                    Conectados
                  </TabsTrigger>
                  <TabsTrigger value="available" className="rounded-none">
                    Disponibles
                  </TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="connected" className="m-0">
                    {renderConnectedDevices()}
                  </TabsContent>
                  <TabsContent value="available" className="m-0">
                    {renderAvailableDevices()}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>También puedes conectar desde la app móvil</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Actividad</CardTitle>
              <CardDescription>
                Información sincronizada de tus dispositivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderWearableData()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
