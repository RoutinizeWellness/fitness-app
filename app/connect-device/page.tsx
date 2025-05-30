"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Bluetooth,
  Smartphone,
  Watch,
  Heart,
  RefreshCw,
  Plus,
  Info
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/auth-context"
import { BluetoothService, BluetoothDevice } from "@/lib/bluetooth-service"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ConnectDevicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [connectedDevices, setConnectedDevices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(false)

  // Inicializar servicio Bluetooth
  useEffect(() => {
    const bluetoothService = BluetoothService.getInstance()

    // Verificar disponibilidad de Bluetooth
    setIsBluetoothAvailable(bluetoothService.isBluetoothAvailable())

    // Cargar dispositivos guardados
    if (user) {
      bluetoothService.setUserId(user.id)
      setBluetoothDevices(bluetoothService.getSavedDevices())
    }

    setIsLoading(false)
  }, [user])

  const handleConnectDevice = (deviceId: string) => {
    if (connectedDevices.includes(deviceId)) {
      setConnectedDevices(connectedDevices.filter((id) => id !== deviceId))
    } else {
      setConnectedDevices([...connectedDevices, deviceId])
    }
  }

  // Buscar dispositivos Bluetooth
  const handleScanBluetoothDevices = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para conectar dispositivos",
        variant: "destructive"
      })
      return
    }

    setIsScanning(true)

    try {
      const bluetoothService = BluetoothService.getInstance()
      const newDevices = await bluetoothService.scanForHeartRateDevices()

      // Actualizar lista de dispositivos
      setBluetoothDevices(prevDevices => {
        // Combinar dispositivos existentes con nuevos
        const deviceMap = new Map<string, BluetoothDevice>()

        // Agregar dispositivos existentes
        prevDevices.forEach(device => {
          deviceMap.set(device.id, device)
        })

        // Agregar o actualizar nuevos dispositivos
        newDevices.forEach(device => {
          deviceMap.set(device.id, device)
        })

        return Array.from(deviceMap.values())
      })

      toast({
        title: "Escaneo completado",
        description: `Se encontraron ${newDevices.length} dispositivos`,
      })
    } catch (error) {
      console.error('Error al escanear dispositivos:', error)
      toast({
        title: "Error",
        description: "No se pudieron encontrar dispositivos. Asegúrate de que Bluetooth esté activado.",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Conectar a un dispositivo Bluetooth
  const handleConnectBluetoothDevice = async (device: BluetoothDevice) => {
    if (!user) return

    setIsConnecting(true)
    setSelectedDevice(device)

    try {
      const bluetoothService = BluetoothService.getInstance()
      const success = await bluetoothService.connectToHeartRateDevice(device.id)

      if (success) {
        // Actualizar estado del dispositivo
        setBluetoothDevices(prevDevices =>
          prevDevices.map(d =>
            d.id === device.id ? { ...d, connected: true } : d
          )
        )

        toast({
          title: "Dispositivo conectado",
          description: `${device.name} conectado correctamente`,
        })
      } else {
        throw new Error("No se pudo conectar al dispositivo")
      }
    } catch (error) {
      console.error('Error al conectar dispositivo:', error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al dispositivo. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
      setSelectedDevice(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-md mx-auto p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-4">
            <h1 className="font-bold">Connect Devices</h1>
            <p className="text-sm text-gray-500">Sync your fitness trackers and smartwatches</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="space-y-4">
          {!isBluetoothAvailable && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Bluetooth no disponible</AlertTitle>
              <AlertDescription>
                Tu dispositivo o navegador no soporta la API Web Bluetooth.
                Intenta usar Chrome en un dispositivo compatible.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Bluetooth Devices</CardTitle>
                  <CardDescription>
                    Connect heart rate monitors and fitness trackers via Bluetooth
                  </CardDescription>
                </div>
                {isBluetoothAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScanBluetoothDevices}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Scan
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bluetoothDevices.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                    <Bluetooth className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No Bluetooth devices found</p>
                    {isBluetoothAvailable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleScanBluetoothDevices}
                        disabled={isScanning}
                      >
                        {isScanning ? "Scanning..." : "Scan for devices"}
                      </Button>
                    )}
                  </div>
                ) : (
                  bluetoothDevices.map(device => (
                    <div key={device.id} className="flex items-center border rounded-lg p-3">
                      <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                        {device.type === 'heart_rate' ? (
                          <Heart className="h-5 w-5" />
                        ) : device.type === 'smart_watch' ? (
                          <Watch className="h-5 w-5" />
                        ) : (
                          <Bluetooth className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{device.name}</h3>
                          {device.connected && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {device.type === 'heart_rate' ? 'Heart Rate Monitor' :
                           device.type === 'smart_watch' ? 'Smart Watch' :
                           device.type === 'activity_tracker' ? 'Activity Tracker' : 'Bluetooth Device'}
                        </p>
                      </div>
                      <Button
                        variant={device.connected ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleConnectBluetoothDevice(device)}
                        disabled={isConnecting && selectedDevice?.id === device.id}
                      >
                        {isConnecting && selectedDevice?.id === device.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : device.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connected Services</CardTitle>
              <CardDescription>
                Connect your fitness trackers and smartwatches to enhance your workout experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DeviceItem
                  id="apple-health"
                  name="Apple Health"
                  icon={<AppleIcon className="h-5 w-5" />}
                  description="Connect to Apple Health to sync your activity, workouts, and health data"
                  isConnected={connectedDevices.includes("apple-health")}
                  onConnect={() => handleConnectDevice("apple-health")}
                />

                <DeviceItem
                  id="google-fit"
                  name="Google Fit"
                  icon={<GoogleFitIcon className="h-5 w-5" />}
                  description="Connect to Google Fit to sync your activity, workouts, and health data"
                  isConnected={connectedDevices.includes("google-fit")}
                  onConnect={() => handleConnectDevice("google-fit")}
                />

                <DeviceItem
                  id="fitbit"
                  name="Fitbit"
                  icon={<FitbitIcon className="h-5 w-5" />}
                  description="Connect to Fitbit to sync your activity, sleep, and heart rate data"
                  isConnected={connectedDevices.includes("fitbit")}
                  onConnect={() => handleConnectDevice("fitbit")}
                />

                <DeviceItem
                  id="garmin"
                  name="Garmin Connect"
                  icon={<GarminIcon className="h-5 w-5" />}
                  description="Connect to Garmin to sync your activity, workouts, and health data"
                  isConnected={connectedDevices.includes("garmin")}
                  onConnect={() => handleConnectDevice("garmin")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Data Sync Settings</CardTitle>
              <CardDescription>Control what data is synced from your connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activity Data</Label>
                    <p className="text-sm text-muted-foreground">Steps, distance, calories burned</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Heart Rate</Label>
                    <p className="text-sm text-muted-foreground">Continuous and workout heart rate</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sleep Data</Label>
                    <p className="text-sm text-muted-foreground">Sleep duration and quality</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Workouts</Label>
                    <p className="text-sm text-muted-foreground">Automatically import external workouts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Body Metrics</Label>
                    <p className="text-sm text-muted-foreground">Weight, body fat percentage</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sync Frequency</CardTitle>
              <CardDescription>Control how often data is synced from your devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <input type="radio" id="realtime" name="sync-frequency" className="h-4 w-4" defaultChecked />
                  <Label htmlFor="realtime" className="flex-1 cursor-pointer">
                    <div className="font-medium">Real-time</div>
                    <div className="text-sm text-gray-500">Sync data as it becomes available</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <input type="radio" id="hourly" name="sync-frequency" className="h-4 w-4" />
                  <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                    <div className="font-medium">Hourly</div>
                    <div className="text-sm text-gray-500">Sync data every hour</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <input type="radio" id="daily" name="sync-frequency" className="h-4 w-4" />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer">
                    <div className="font-medium">Daily</div>
                    <div className="text-sm text-gray-500">Sync data once per day</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <input type="radio" id="manual" name="sync-frequency" className="h-4 w-4" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Manual Only</div>
                    <div className="text-sm text-gray-500">Only sync when you manually refresh</div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  )
}

interface DeviceItemProps {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  isConnected: boolean
  onConnect: () => void
}

function DeviceItem({ id, name, icon, description, isConnected, onConnect }: DeviceItemProps) {
  return (
    <div className="flex items-center border rounded-lg p-3">
      <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className="font-medium">{name}</h3>
          {isConnected && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
              Connected
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Button variant={isConnected ? "outline" : "default"} size="sm" onClick={onConnect}>
        {isConnected ? "Disconnect" : "Connect"}
      </Button>
    </div>
  )
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.91-3.83.91s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z" />
    </svg>
  )
}

function GoogleFitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
      <path d="M12,7a5,5,0,1,0,5,5A5,5,0,0,0,12,7Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z" />
    </svg>
  )
}

function FitbitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12,6a2,2,0,1,0,2,2A2,2,0,0,0,12,6Z" />
      <path d="M12,16a2,2,0,1,0,2,2A2,2,0,0,0,12,16Z" />
      <path d="M6,12a2,2,0,1,0,2,2A2,2,0,0,0,6,12Z" />
      <path d="M16,12a2,2,0,1,0,2,2A2,2,0,0,0,16,12Z" />
    </svg>
  )
}

function GarminIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
      <path d="M12,6a6,6,0,1,0,6,6A6,6,0,0,0,12,6Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" />
    </svg>
  )
}
