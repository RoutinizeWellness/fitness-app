"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Moon, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Clock,
  BarChart3,
  Save,
  Sparkles,
  Battery
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SiestaSession, saveSiestaSession, getSiestaStats, SiestaStats } from "@/lib/siesta-service"

interface SiestaTimerProps {
  userId: string
  className?: string
}

export function SiestaTimer({
  userId,
  className
}: SiestaTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutos en segundos
  const [totalTime, setTotalTime] = useState(25 * 60) // 25 minutos en segundos
  const [isMuted, setIsMuted] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [siestaStats, setSiestaStats] = useState<SiestaStats | null>(null)
  const [siestaSession, setSiestaSession] = useState<Partial<SiestaSession>>({
    quality: 3,
    preSiestaEnergy: 3,
    postSiestaEnergy: 3,
    notes: ""
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Cargar estadísticas
  useEffect(() => {
    if (userId) {
      loadStats()
    }
  }, [userId])

  const loadStats = async () => {
    try {
      const { data, error } = await getSiestaStats(userId)
      
      if (error) {
        console.error("Error al cargar estadísticas:", error)
        return
      }
      
      if (data) {
        setSiestaStats(data)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  // Iniciar/pausar el temporizador
  const toggleTimer = () => {
    if (isRunning) {
      // Pausar
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else {
      // Iniciar
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Tiempo terminado
            clearInterval(timerRef.current as NodeJS.Timeout)
            playAlarm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    setIsRunning(!isRunning)
  }

  // Reiniciar el temporizador
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimeRemaining(totalTime)
    setIsRunning(false)
  }

  // Cambiar la duración del temporizador
  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0] * 60 // Convertir minutos a segundos
    setTotalTime(newDuration)
    setTimeRemaining(newDuration)
  }

  // Reproducir alarma
  const playAlarm = () => {
    if (!isMuted && audioRef.current) {
      audioRef.current.play()
    }
    
    // Mostrar notificación
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Siesta completada', {
        body: 'Tu siesta científica ha terminado. ¡Hora de volver a la actividad!',
        icon: '/icons/icon-192x192.png'
      })
    }
    
    // Mostrar diálogo para guardar sesión
    setShowSaveDialog(true)
  }

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás una notificación cuando termine tu siesta"
        })
      }
    }
  }

  // Guardar sesión de siesta
  const handleSaveSiestaSession = async () => {
    if (!userId) return
    
    try {
      const sessionData: Omit<SiestaSession, 'id' | 'createdAt'> = {
        userId,
        date: new Date().toISOString(),
        duration: Math.round((totalTime - timeRemaining) / 60), // Convertir segundos a minutos
        quality: siestaSession.quality,
        preSiestaEnergy: siestaSession.preSiestaEnergy,
        postSiestaEnergy: siestaSession.postSiestaEnergy,
        notes: siestaSession.notes
      }
      
      const { data, error } = await saveSiestaSession(sessionData)
      
      if (error) {
        console.error("Error al guardar sesión:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar la sesión",
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Éxito",
        description: "Sesión de siesta guardada correctamente"
      })
      
      // Cerrar diálogo y reiniciar temporizador
      setShowSaveDialog(false)
      resetTimer()
      
      // Actualizar estadísticas
      loadStats()
    } catch (error) {
      console.error("Error al guardar sesión:", error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular porcentaje de progreso
  const calculateProgress = (): number => {
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className={className}>
      <Card3D className="overflow-hidden">
        <Card3DHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <Card3DTitle className="flex items-center">
              <Moon className="h-5 w-5 mr-2" />
              Siesta Científica
            </Card3DTitle>
            <Button3D
              variant="glass"
              size="icon"
              className="h-8 w-8 text-white border-white/30"
              onClick={() => setShowStatsDialog(true)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button3D>
          </div>
        </Card3DHeader>
        
        <Card3DContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-4">
              {formatTime(timeRemaining)}
            </div>
            
            <Progress3D
              value={calculateProgress()}
              max={100}
              className="w-full mb-6"
              height="8px"
            />
            
            <div className="flex justify-center space-x-2 mb-6">
              <Button3D
                variant={isRunning ? "outline" : "default"}
                size="icon"
                className="h-12 w-12"
                onClick={toggleTimer}
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button3D>
              
              <Button3D
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={resetTimer}
              >
                <SkipForward className="h-6 w-6" />
              </Button3D>
              
              <Button3D
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button3D>
            </div>
            
            <div className="w-full mb-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Duración (minutos)</Label>
                <span className="text-sm font-medium">{totalTime / 60}</span>
              </div>
              <Slider
                defaultValue={[25]}
                min={5}
                max={30}
                step={5}
                onValueChange={handleDurationChange}
                disabled={isRunning}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>30 min</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-4 text-center">
              <p>La siesta científica ideal dura entre 20-30 minutos para evitar la inercia del sueño.</p>
              <p className="mt-1">Mejora la alerta, el rendimiento cognitivo y el estado de ánimo.</p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
      
      {/* Audio para la alarma */}
      <audio ref={audioRef} src="/sounds/gentle-wake.mp3" />
      
      {/* Diálogo para guardar sesión */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Guardar sesión de siesta</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>¿Cómo calificarías la calidad de tu siesta?</Label>
              <RadioGroup
                value={siestaSession.quality?.toString()}
                onValueChange={(value) => setSiestaSession(prev => ({ ...prev, quality: parseInt(value) }))}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`quality-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`quality-${value}`}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                        siestaSession.quality === value ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <span className="text-2xl mb-1">
                        {value === 1 ? '😴' : value === 2 ? '😐' : value === 3 ? '🙂' : value === 4 ? '😊' : '😃'}
                      </span>
                      <span className="text-xs">
                        {value === 1 ? 'Mala' : value === 2 ? 'Regular' : value === 3 ? 'Normal' : value === 4 ? 'Buena' : 'Excelente'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label>Nivel de energía antes de la siesta</Label>
              <RadioGroup
                value={siestaSession.preSiestaEnergy?.toString()}
                onValueChange={(value) => setSiestaSession(prev => ({ ...prev, preSiestaEnergy: parseInt(value) }))}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`pre-energy-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`pre-energy-${value}`}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                        siestaSession.preSiestaEnergy === value ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Battery className={`h-5 w-5 ${
                        value === 1 ? 'text-red-500' : 
                        value === 2 ? 'text-orange-500' : 
                        value === 3 ? 'text-yellow-500' : 
                        value === 4 ? 'text-green-500' : 
                        'text-emerald-500'
                      }`} />
                      <span className="text-xs mt-1">
                        {value === 1 ? 'Muy baja' : value === 2 ? 'Baja' : value === 3 ? 'Media' : value === 4 ? 'Alta' : 'Muy alta'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label>Nivel de energía después de la siesta</Label>
              <RadioGroup
                value={siestaSession.postSiestaEnergy?.toString()}
                onValueChange={(value) => setSiestaSession(prev => ({ ...prev, postSiestaEnergy: parseInt(value) }))}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`post-energy-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`post-energy-${value}`}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-md ${
                        siestaSession.postSiestaEnergy === value ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Battery className={`h-5 w-5 ${
                        value === 1 ? 'text-red-500' : 
                        value === 2 ? 'text-orange-500' : 
                        value === 3 ? 'text-yellow-500' : 
                        value === 4 ? 'text-green-500' : 
                        'text-emerald-500'
                      }`} />
                      <span className="text-xs mt-1">
                        {value === 1 ? 'Muy baja' : value === 2 ? 'Baja' : value === 3 ? 'Media' : value === 4 ? 'Alta' : 'Muy alta'}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={siestaSession.notes}
                onChange={(e) => setSiestaSession(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="¿Cómo te sientes después de la siesta?"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSaveSiestaSession}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para estadísticas */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Estadísticas de siesta</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {!siestaStats ? (
              <p className="text-center text-gray-500">No hay estadísticas disponibles</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Clock className="h-8 w-8 text-indigo-500 mb-2" />
                      <span className="text-sm text-gray-500">Duración promedio</span>
                      <span className="text-xl font-bold">{Math.round(siestaStats.averageDuration)} min</span>
                    </div>
                  </Card3D>
                  
                  <Card3D className="p-4">
                    <div className="flex flex-col items-center">
                      <Sparkles className="h-8 w-8 text-amber-500 mb-2" />
                      <span className="text-sm text-gray-500">Calidad promedio</span>
                      <span className="text-xl font-bold">{siestaStats.averageQuality.toFixed(1)}/5</span>
                    </div>
                  </Card3D>
                </div>
                
                <Card3D className="p-4">
                  <div className="flex flex-col items-center">
                    <Battery className="h-8 w-8 text-green-500 mb-2" />
                    <span className="text-sm text-gray-500">Mejora de energía promedio</span>
                    <span className="text-xl font-bold">
                      {siestaStats.averageEnergyImprovement > 0 ? '+' : ''}
                      {siestaStats.averageEnergyImprovement.toFixed(1)} puntos
                    </span>
                  </div>
                </Card3D>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Recomendaciones personalizadas</h3>
                  
                  {siestaStats.totalSessions < 5 ? (
                    <p className="text-sm text-gray-500">
                      Completa al menos 5 sesiones para recibir recomendaciones personalizadas.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {siestaStats.mostProductiveTime && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Hora más productiva:</span> {siestaStats.mostProductiveTime}
                          </p>
                        </div>
                      )}
                      
                      {siestaStats.recommendedDuration && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Duración recomendada:</span> {siestaStats.recommendedDuration} minutos
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <Sparkles className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Consejo:</span> Las siestas cortas (20-30 min) evitan la inercia del sueño y mejoran el rendimiento cognitivo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Total de sesiones: {siestaStats.totalSessions} | Última semana: {siestaStats.lastWeekSessions}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button3D onClick={() => setShowStatsDialog(false)}>
              Cerrar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
