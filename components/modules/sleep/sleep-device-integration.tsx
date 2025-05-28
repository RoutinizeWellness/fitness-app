"use client"

import { useState, useEffect } from "react"
import { 
  Smartphone, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Settings,
  ExternalLink
} from "lucide-react"
import { Card3D, Card3DContent } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { DeviceSource, WearableIntegration } from "@/lib/types/wellness"
import { WearableService } from "@/lib/services/wearable-service"

interface SleepDeviceIntegrationProps {
  userId: string
  onConnect: (deviceType: DeviceSource) => void
  onCancel: () => void
}

export function SleepDeviceIntegration({ 
  userId, 
  onConnect, 
  onCancel 
}: SleepDeviceIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [integrations, setIntegrations] = useState<Record<DeviceSource, WearableIntegration | null>>({
    manual: null,
    whoop: null,
    oura: null,
    garmin: null,
    apple_watch: null,
    fitbit: null,
    polar: null
  })
  
  // Cargar integraciones
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true)
      
      try {
        const deviceTypes: DeviceSource[] = [
          'whoop', 'oura', 'garmin', 'apple_watch', 'fitbit', 'polar'
        ]
        
        const loadedIntegrations: Record<DeviceSource, WearableIntegration | null> = {
          manual: null,
          whoop: null,
          oura: null,
          garmin: null,
          apple_watch: null,
          fitbit: null,
          polar: null
        }
        
        for (const deviceType of deviceTypes) {
          const { data } = await WearableService.getWearableIntegration(userId, deviceType)
          loadedIntegrations[deviceType] = data
        }
        
        setIntegrations(loadedIntegrations)
      } catch (error) {
        console.error('Error al cargar integraciones:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadIntegrations()
  }, [userId])
  
  // Manejar clic en dispositivo
  const handleDeviceClick = (deviceType: DeviceSource) => {
    onConnect(deviceType)
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
  
  // Obtener logo de dispositivo
  const getDeviceLogo = (deviceType: DeviceSource): string => {
    switch (deviceType) {
      case 'oura':
        return '/images/devices/oura.png'
      case 'whoop':
        return '/images/devices/whoop.png'
      case 'garmin':
        return '/images/devices/garmin.png'
      case 'apple_watch':
        return '/images/devices/apple-watch.png'
      case 'fitbit':
        return '/images/devices/fitbit.png'
      case 'polar':
        return '/images/devices/polar.png'
      default:
        return ''
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando dispositivos...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(integrations)
          .filter(([deviceType]) => deviceType !== 'manual')
          .map(([deviceType, integration]) => (
            <Card3D 
              key={deviceType}
              className={`border p-4 hover:border-primary/30 transition-colors cursor-pointer ${
                integration?.isConnected ? 'border-primary/30 bg-primary/5' : ''
              }`}
              onClick={() => handleDeviceClick(deviceType as DeviceSource)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getDeviceLogo(deviceType as DeviceSource) ? (
                    <img 
                      src={getDeviceLogo(deviceType as DeviceSource)} 
                      alt={getDeviceName(deviceType as DeviceSource)}
                      className="h-8 w-8 mr-3"
                    />
                  ) : (
                    <Smartphone className="h-8 w-8 text-primary mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium">{getDeviceName(deviceType as DeviceSource)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {integration?.isConnected ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Conectado
                        </span>
                      ) : (
                        <span className="flex items-center text-muted-foreground">
                          <X className="h-3 w-3 mr-1" />
                          No conectado
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {integration?.isConnected && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Clock className="h-3 w-3 mr-1" />
                    {integration.lastSyncAt ? (
                      new Date(integration.lastSyncAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'Nunca'
                    )}
                  </Badge>
                )}
              </div>
            </Card3D>
          ))}
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Configuración de sincronización</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="sync-auto" className="mb-1">Sincronización automática</Label>
            <span className="text-xs text-muted-foreground">
              Sincronizar datos automáticamente cada día
            </span>
          </div>
          <Switch id="sync-auto" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="sync-sleep" className="mb-1">Datos de sueño</Label>
            <span className="text-xs text-muted-foreground">
              Sincronizar duración, fases y calidad del sueño
            </span>
          </div>
          <Switch id="sync-sleep" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="sync-hrv" className="mb-1">Datos de HRV</Label>
            <span className="text-xs text-muted-foreground">
              Sincronizar variabilidad de la frecuencia cardíaca
            </span>
          </div>
          <Switch id="sync-hrv" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor="sync-temp" className="mb-1">Temperatura corporal</Label>
            <span className="text-xs text-muted-foreground">
              Sincronizar datos de temperatura durante el sueño
            </span>
          </div>
          <Switch id="sync-temp" defaultChecked />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Información</h3>
        
        <p className="text-xs text-muted-foreground">
          La conexión con dispositivos permite sincronizar automáticamente tus datos de sueño.
          Selecciona un dispositivo para conectarlo y comenzar a sincronizar tus datos.
        </p>
        
        <div className="flex items-center text-xs text-primary mt-2">
          <ExternalLink className="h-3 w-3 mr-1" />
          <a href="#" className="hover:underline">Más información sobre la integración con dispositivos</a>
        </div>
      </div>
      
      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cerrar
        </Button3D>
      </DialogFooter>
    </div>
  )
}
