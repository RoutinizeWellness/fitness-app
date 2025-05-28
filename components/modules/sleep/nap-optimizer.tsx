"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  Clock,
  Calendar,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Battery,
  BatteryCharging,
  Timer,
  AlarmClock,
  Info,
  Play,
  Pause,
  RotateCcw,
  Check,
  Brain
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { NapEntry } from "@/lib/types/wellness"

interface NapOptimizerProps {
  userId: string
}

export function NapOptimizer({ userId }: NapOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [napEntries, setNapEntries] = useState<NapEntry[]>([])
  const [showAddNapDialog, setShowAddNapDialog] = useState(false)
  const [showNapTimerDialog, setShowNapTimerDialog] = useState(false)
  const [selectedNapDuration, setSelectedNapDuration] = useState(20)

  // Cargar datos de siestas (simulado)
  useEffect(() => {
    const loadNapData = async () => {
      setIsLoading(true)

      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Datos de ejemplo
        const exampleNaps: NapEntry[] = [
          {
            id: '1',
            userId,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '14:30',
            endTime: '14:50',
            duration: 20,
            quality: 8,
            preNapEnergy: 3,
            postNapEnergy: 7,
            notes: 'Siesta rápida después del almuerzo'
          },
          {
            id: '2',
            userId,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '15:00',
            endTime: '15:30',
            duration: 30,
            quality: 9,
            preNapEnergy: 2,
            postNapEnergy: 8,
            notes: 'Siesta profunda, me desperté muy descansado'
          }
        ]

        setNapEntries(exampleNaps)
      } catch (error) {
        console.error('Error al cargar datos de siestas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNapData()
  }, [userId])

  // Manejar guardado de siesta
  const handleSaveNap = (entry: NapEntry) => {
    // Simular guardado
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    }

    setNapEntries([newEntry, ...napEntries])

    toast({
      title: "Siesta guardada",
      description: "El registro de siesta ha sido guardado correctamente"
    })

    setShowAddNapDialog(false)
  }

  // Renderizar recomendaciones de siesta
  const renderNapRecommendations = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card3D className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <Card3DContent className="p-4">
            <div className="flex items-center mb-3">
              <Zap className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900">Siesta de Energía</h3>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                20 minutos
              </Badge>

              <Button3D size="sm" variant="outline" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100" onClick={() => {
                setSelectedNapDuration(20)
                setShowNapTimerDialog(true)
              }}>
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button3D>
            </div>

            <p className="text-sm text-green-800">
              Ideal para un impulso rápido de energía sin entrar en sueño profundo.
              Perfecta para mitad del día.
            </p>
          </Card3DContent>
        </Card3D>

        <Card3D className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <Card3DContent className="p-4">
            <div className="flex items-center mb-3">
              <BatteryCharging className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Siesta de Recuperación</h3>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                30 minutos
              </Badge>

              <Button3D size="sm" variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100" onClick={() => {
                setSelectedNapDuration(30)
                setShowNapTimerDialog(true)
              }}>
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button3D>
            </div>

            <p className="text-sm text-blue-800">
              Permite algo de sueño profundo para recuperación física.
              Ideal después de entrenamientos o días intensos.
            </p>
          </Card3DContent>
        </Card3D>

        <Card3D className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
          <Card3DContent className="p-4">
            <div className="flex items-center mb-3">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-medium text-purple-900">Siesta Completa</h3>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                <Clock className="h-3 w-3 mr-1" />
                90 minutos
              </Badge>

              <Button3D size="sm" variant="outline" className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100" onClick={() => {
                setSelectedNapDuration(90)
                setShowNapTimerDialog(true)
              }}>
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button3D>
            </div>

            <p className="text-sm text-purple-800">
              Incluye un ciclo completo de sueño con fase REM.
              Ideal para recuperación cognitiva y creatividad.
            </p>
          </Card3DContent>
        </Card3D>
      </div>
    )
  }

  // Renderizar historial de siestas
  const renderNapHistory = () => {
    if (napEntries.length === 0) {
      return (
        <Card3D>
          <Card3DContent className="flex flex-col items-center justify-center py-8">
            <Zap className="h-12 w-12 text-primary/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay registros de siestas</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comienza a registrar tus siestas para ver su impacto en tu energía
            </p>
            <Button3D onClick={() => setShowAddNapDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Siesta
            </Button3D>
          </Card3DContent>
        </Card3D>
      )
    }

    return (
      <div className="space-y-3">
        {napEntries.map(nap => (
          <Card3D key={nap.id} className="border hover:border-primary/30 transition-colors">
            <Card3DContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {new Date(nap.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{nap.startTime} - {nap.endTime}</span>
                    <span className="mx-1">•</span>
                    <span>{nap.duration} minutos</span>
                  </div>
                </div>

                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Calidad: {nap.quality}/10
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span>Impacto en energía</span>
                  <span>+{nap.postNapEnergy - nap.preNapEnergy} puntos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(nap.preNapEnergy / 10) * 100}%` }}
                    ></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(nap.postNapEnergy / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span>Antes: {nap.preNapEnergy}/10</span>
                  <span>Después: {nap.postNapEnergy}/10</span>
                </div>
              </div>

              {nap.notes && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {nap.notes}
                </div>
              )}
            </Card3DContent>
          </Card3D>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Optimizador de Siestas</h3>

        <div className="flex space-x-2">
          <Button3D variant="outline" onClick={() => setShowNapTimerDialog(true)}>
            <Timer className="h-4 w-4 mr-2" />
            Temporizador
          </Button3D>

          <Button3D onClick={() => setShowAddNapDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Siesta
          </Button3D>
        </div>
      </div>

      <Card3D className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-100">
        <Card3DContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-white/80 rounded-full p-3">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h3 className="text-lg font-medium text-indigo-900 mb-2">Potencia tu día con siestas estratégicas</h3>
              <p className="text-indigo-800/80 mb-4">
                Las siestas bien planificadas pueden aumentar tu energía, mejorar la concentración y potenciar la recuperación.
                Utiliza nuestras recomendaciones para maximizar los beneficios.
              </p>

              <div className="flex items-center text-sm text-indigo-700">
                <Info className="h-4 w-4 mr-1" />
                <span>El mejor momento para una siesta es entre las 13:00 y las 15:00</span>
              </div>
            </div>
          </div>
        </Card3DContent>
      </Card3D>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recomendaciones de siesta</h3>
        {renderNapRecommendations()}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Historial de siestas</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ) : (
          renderNapHistory()
        )}
      </div>

      {/* Diálogo para añadir siesta */}
      <Dialog open={showAddNapDialog} onOpenChange={setShowAddNapDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Siesta</DialogTitle>
            <DialogDescription>
              Registra los detalles de tu siesta para hacer un seguimiento de su impacto
            </DialogDescription>
          </DialogHeader>

          <AddNapEntryForm
            userId={userId}
            onSave={handleSaveNap}
            onCancel={() => setShowAddNapDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para temporizador de siesta */}
      <Dialog open={showNapTimerDialog} onOpenChange={setShowNapTimerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Temporizador de Siesta</DialogTitle>
            <DialogDescription>
              Configura y controla tu siesta para maximizar sus beneficios
            </DialogDescription>
          </DialogHeader>

          <NapTimer
            duration={selectedNapDuration}
            onComplete={() => {
              toast({
                title: "Siesta completada",
                description: "Tu siesta ha terminado. ¿Cómo te sientes?"
              })
              setShowNapTimerDialog(false)
              setShowAddNapDialog(true)
            }}
            onCancel={() => setShowNapTimerDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para añadir registro de siesta
function AddNapEntryForm({
  userId,
  onSave,
  onCancel
}: {
  userId: string;
  onSave: (entry: NapEntry) => void;
  onCancel: () => void;
}) {
  const today = new Date()

  const [date, setDate] = useState(today.toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('14:00')
  const [duration, setDuration] = useState(20)
  const [quality, setQuality] = useState(7)
  const [preNapEnergy, setPreNapEnergy] = useState(4)
  const [postNapEnergy, setPostNapEnergy] = useState(7)
  const [notes, setNotes] = useState('')

  // Calcular hora de fin
  const calculateEndTime = (): string => {
    const [hours, minutes] = startTime.split(':').map(Number)

    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)

    const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    const entry: NapEntry = {
      userId,
      date,
      startTime,
      endTime: calculateEndTime(),
      duration,
      quality,
      preNapEnergy,
      postNapEnergy,
      notes
    }

    onSave(entry)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Hora de inicio</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="duration">Duración (minutos)</Label>
          <span className="text-sm">{duration} min</span>
        </div>
        <Slider
          id="duration"
          min={5}
          max={120}
          step={5}
          value={[duration]}
          onValueChange={(value) => setDuration(value[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 min</span>
          <span>120 min</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quality">Calidad (1-10)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="quality"
            min={1}
            max={10}
            step={1}
            value={[quality]}
            onValueChange={(value) => setQuality(value[0])}
          />
          <span className="w-8 text-center">{quality}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Impacto en energía (1-10)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="preNapEnergy" className="text-xs">Antes</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="preNapEnergy"
                min={1}
                max={10}
                step={1}
                value={[preNapEnergy]}
                onValueChange={(value) => setPreNapEnergy(value[0])}
              />
              <span className="w-8 text-center">{preNapEnergy}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="postNapEnergy" className="text-xs">Después</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="postNapEnergy"
                min={1}
                max={10}
                step={1}
                value={[postNapEnergy]}
                onValueChange={(value) => setPostNapEnergy(value[0])}
              />
              <span className="w-8 text-center">{postNapEnergy}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          placeholder="Notas sobre tu siesta..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
        <Button3D onClick={handleSubmit}>
          Guardar
        </Button3D>
      </DialogFooter>
    </div>
  )
}

// Componente para temporizador de siesta
function NapTimer({
  duration,
  onComplete,
  onCancel
}: {
  duration: number;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration * 60) // en segundos
  const [selectedDuration, setSelectedDuration] = useState(duration)

  // Iniciar/pausar temporizador
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Reiniciar temporizador
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedDuration * 60)
  }

  // Cambiar duración
  const changeDuration = (newDuration: number) => {
    setSelectedDuration(newDuration)
    setTimeLeft(newDuration * 60)
    setIsRunning(false)
  }

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Efecto para temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsRunning(false)
            onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, onComplete])

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
          </div>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * timeLeft) / (selectedDuration * 60)}
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button3D
          variant="outline"
          size="icon"
          onClick={resetTimer}
        >
          <RotateCcw className="h-4 w-4" />
        </Button3D>

        <Button3D
          size="icon"
          onClick={toggleTimer}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button3D>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Duración de siesta</Label>
        <div className="flex justify-between space-x-2">
          {[10, 20, 30, 90].map(mins => (
            <Button3D
              key={mins}
              variant={selectedDuration === mins ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeDuration(mins)}
            >
              {mins} min
            </Button3D>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sonido de alarma</Label>
        <Select defaultValue="gentle">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar sonido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gentle">Suave</SelectItem>
            <SelectItem value="nature">Naturaleza</SelectItem>
            <SelectItem value="chimes">Campanillas</SelectItem>
            <SelectItem value="energetic">Energético</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button3D variant="outline" onClick={onCancel}>
          Cancelar
        </Button3D>
      </DialogFooter>
    </div>
  )
}
