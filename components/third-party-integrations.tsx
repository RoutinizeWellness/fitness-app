"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  RefreshCw, 
  Link, 
  Link2Off, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Settings
} from "lucide-react"
import { 
  getUserIntegrations, 
  disconnectIntegration, 
  syncIntegrationData,
  SUPPORTED_PROVIDERS
} from "@/lib/third-party-integrations"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useIsMobile } from "@/hooks/use-mobile"

interface ThirdPartyIntegrationsProps {
  userId: string
}

export function ThirdPartyIntegrations({ userId }: ThirdPartyIntegrationsProps) {
  const [activeTab, setActiveTab] = useState("connected")
  const [integrations, setIntegrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProvider, setSyncProvider] = useState("")
  const [autoSync, setAutoSync] = useState(true)
  const isMobile = useIsMobile()

  // Cargar integraciones al montar el componente
  useEffect(() => {
    loadIntegrations()
  }, [userId])

  async function loadIntegrations() {
    try {
      setIsLoading(true)
      const { data, error } = await getUserIntegrations(userId)
      
      if (error) throw error
      
      if (data) {
        setIntegrations(data)
      }
    } catch (error) {
      console.error("Error al cargar integraciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las integraciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Iniciar proceso de conexión con un proveedor
  function handleConnect(provider) {
    // En una implementación real, esto redigiría al flujo de OAuth del proveedor
    const providerConfig = SUPPORTED_PROVIDERS.find(p => p.id === provider.id)
    
    if (!providerConfig || !providerConfig.authUrl) {
      if (provider.id === 'apple_health') {
        toast({
          title: "Integración nativa requerida",
          description: "Apple Health requiere la aplicación móvil nativa para conectarse",
        })
        return
      }
      
      toast({
        title: "No implementado",
        description: `La conexión con ${provider.name} aún no está implementada`,
      })
      return
    }
    
    // Simular redirección a OAuth
    toast({
      title: "Conectando...",
      description: `Redirigiendo a ${provider.name} para autorización`,
    })
    
    // En una implementación real, esto sería una redirección a la URL de autorización
    setTimeout(() => {
      // Simular una conexión exitosa
      loadIntegrations()
      setActiveTab("connected")
      toast({
        title: "Conexión exitosa",
        description: `Se ha conectado correctamente con ${provider.name}`,
      })
    }, 1500)
  }

  // Desconectar una integración
  async function handleDisconnect(provider) {
    try {
      const { error } = await disconnectIntegration(userId, provider)
      
      if (error) throw error
      
      // Actualizar la lista de integraciones
      await loadIntegrations()
      
      toast({
        title: "Desconexión exitosa",
        description: `Se ha desconectado correctamente de ${provider}`,
      })
    } catch (error) {
      console.error("Error al desconectar integración:", error)
      toast({
        title: "Error",
        description: "No se pudo desconectar la integración",
        variant: "destructive",
      })
    }
  }

  // Sincronizar datos de una integración
  async function handleSync(provider) {
    try {
      setIsSyncing(true)
      setSyncProvider(provider)
      
      const { data, error } = await syncIntegrationData(userId, provider)
      
      if (error) throw error
      
      // Actualizar la lista de integraciones para reflejar la última sincronización
      await loadIntegrations()
      
      toast({
        title: "Sincronización exitosa",
        description: `Se han sincronizado los datos de ${provider}`,
      })
    } catch (error) {
      console.error("Error al sincronizar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron sincronizar los datos",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setSyncProvider("")
    }
  }

  // Renderizar integraciones conectadas
  function renderConnectedIntegrations() {
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

    if (integrations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Link2Off className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay integraciones conectadas</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Conecta servicios externos para sincronizar tus datos
          </p>
          <Button onClick={() => setActiveTab("available")}>
            Conectar servicio
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {integrations.map((integration) => {
          const provider = SUPPORTED_PROVIDERS.find(p => p.id === integration.provider) || {
            name: integration.provider,
            icon: '/icons/default-service.svg',
            description: 'Servicio externo'
          }
          
          return (
            <div key={integration.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-2 w-12 h-12 flex items-center justify-center">
                  <img src={provider.icon} alt={provider.name} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {integration.last_sync_at 
                        ? `Última sincronización: ${new Date(integration.last_sync_at).toLocaleString()}`
                        : 'No sincronizado'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSync(integration.provider)}
                  disabled={isSyncing}
                >
                  {isSyncing && syncProvider === integration.provider ? (
                    <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sincronizar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDisconnect(integration.provider)}
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

  // Renderizar servicios disponibles
  function renderAvailableServices() {
    // Filtrar servicios ya conectados
    const connectedProviders = integrations.map(i => i.provider)
    const availableProviders = SUPPORTED_PROVIDERS.filter(p => !connectedProviders.includes(p.id))
    
    if (availableProviders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Check className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-medium">Todos los servicios conectados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Has conectado todos los servicios disponibles
          </p>
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableProviders.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 rounded-full p-2 w-12 h-12 flex items-center justify-center">
                <img src={provider.icon} alt={provider.name} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleConnect(provider)}
            >
              <Link className="h-4 w-4 mr-2" />
              Conectar
            </Button>
          </div>
        ))}
      </div>
    )
  }

  // Renderizar datos sincronizados
  function renderSyncedData() {
    if (integrations.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay datos sincronizados</AlertTitle>
          <AlertDescription>
            Conecta servicios externos para ver tus datos sincronizados
          </AlertDescription>
        </Alert>
      )
    }
    
    return (
      <div className="space-y-6">
        {/* Datos de nutrición */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrición</CardTitle>
            <CardDescription>
              Datos de calorías y macronutrientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Calorías</p>
                  <p className="text-2xl font-bold">1,850</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Proteínas</p>
                  <p className="text-2xl font-bold">120g</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Carbohidratos</p>
                  <p className="text-2xl font-bold">180g</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Grasas</p>
                  <p className="text-2xl font-bold">65g</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Fuente: MyFitnessPal</p>
                <Button variant="ghost" size="sm" className="text-sm">
                  Ver detalles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Datos de actividad */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
            <CardDescription>
              Datos de pasos, distancia y calorías
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Pasos</p>
                  <p className="text-2xl font-bold">8,742</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Distancia</p>
                  <p className="text-2xl font-bold">6.3 km</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Calorías activas</p>
                  <p className="text-2xl font-bold">450</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Fuente: Fitbit, Strava</p>
                <Button variant="ghost" size="sm" className="text-sm">
                  Ver detalles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Entrenamientos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Entrenamientos recientes</CardTitle>
            <CardDescription>
              Actividades registradas por tus dispositivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Carrera matutina</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>5.2 km · 30 min · 450 kcal</span>
                  </div>
                </div>
                <Badge>Strava</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Entrenamiento de fuerza</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>45 min · 320 kcal</span>
                  </div>
                </div>
                <Badge>Fitbit</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">Ciclismo</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>25 km · 1h 15min · 850 kcal</span>
                  </div>
                </div>
                <Badge>Strava</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Integraciones</h1>
        <div className="flex items-center space-x-2">
          <Switch 
            id="auto-sync" 
            checked={autoSync} 
            onCheckedChange={setAutoSync}
          />
          <Label htmlFor="auto-sync">Sincronización automática</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={isMobile ? "order-2" : "md:col-span-1"}>
          <Card>
            <CardHeader>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>
                Gestiona tus conexiones con servicios externos
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
                    {renderConnectedIntegrations()}
                  </TabsContent>
                  <TabsContent value="available" className="m-0">
                    {renderAvailableServices()}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración de sincronización
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configuración de sincronización</DialogTitle>
                    <DialogDescription>
                      Personaliza cómo se sincronizan tus datos
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-frequency">Frecuencia de sincronización</Label>
                        <p className="text-sm text-muted-foreground">
                          Con qué frecuencia se sincronizan tus datos
                        </p>
                      </div>
                      <select 
                        id="sync-frequency" 
                        className="w-32 rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="1">Cada hora</option>
                        <option value="6">Cada 6 horas</option>
                        <option value="12">Cada 12 horas</option>
                        <option value="24" selected>Cada día</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Datos a sincronizar</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="sync-nutrition" defaultChecked />
                          <Label htmlFor="sync-nutrition">Nutrición</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sync-activity" defaultChecked />
                          <Label htmlFor="sync-activity">Actividad</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sync-workouts" defaultChecked />
                          <Label htmlFor="sync-workouts">Entrenamientos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sync-sleep" defaultChecked />
                          <Label htmlFor="sync-sleep">Sueño</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sync-weight" defaultChecked />
                          <Label htmlFor="sync-weight">Peso y medidas</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Guardar cambios</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className={isMobile ? "order-1" : "md:col-span-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Datos sincronizados</CardTitle>
              <CardDescription>
                Información importada de tus servicios conectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className={isMobile ? "h-[400px]" : "h-auto"}>
                {renderSyncedData()}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
