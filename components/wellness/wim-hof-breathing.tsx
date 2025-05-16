"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wind, Play, Pause, SkipForward, 
  RefreshCw, Save, Clock, Award,
  ChevronUp, ChevronDown, Info, X,
  Lungs, Timer, BarChart3
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Progress3D } from "@/components/ui/progress-3d"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { saveBreathSession } from "@/lib/breathing-service"
import { useUser } from "@/hooks/use-user"

interface WimHofBreathingProps {
  onComplete?: (sessionData: any) => void
  onCancel?: () => void
}

export function WimHofBreathing({
  onComplete,
  onCancel
}: WimHofBreathingProps) {
  // Estados para la sesión
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'retention' | 'recovery' | 'complete'>('intro')
  const [round, setRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(3)
  const [breathCount, setBreathCount] = useState(0)
  const [retentionTime, setRetentionTime] = useState(0)
  const [retentionTimes, setRetentionTimes] = useState<number[]>([])
  const [isBreathing, setIsBreathing] = useState(false)
  const [recoveryTime, setRecoveryTime] = useState(15)
  const [isRecovering, setIsRecovering] = useState(false)
  const [feelingBefore, setFeelingBefore] = useState<number | null>(null)
  const [feelingAfter, setFeelingAfter] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  
  // Referencias para los temporizadores
  const breathingInterval = useRef<NodeJS.Timeout | null>(null)
  const retentionInterval = useRef<NodeJS.Timeout | null>(null)
  const recoveryInterval = useRef<NodeJS.Timeout | null>(null)
  
  // Obtener usuario actual
  const { user } = useUser()
  
  // Función para iniciar la fase de respiración
  const startBreathing = () => {
    setPhase('breathing')
    setBreathCount(0)
    setIsBreathing(true)
    
    // Iniciar el contador de respiraciones (una cada 1.5 segundos)
    breathingInterval.current = setInterval(() => {
      setBreathCount(prev => {
        // Al llegar a 30 respiraciones, pasar a retención
        if (prev >= 29) {
          clearInterval(breathingInterval.current as NodeJS.Timeout)
          startRetention()
          return 0
        }
        return prev + 1
      })
    }, 1500)
  }
  
  // Función para iniciar la fase de retención
  const startRetention = () => {
    setPhase('retention')
    setRetentionTime(0)
    
    // Iniciar el contador de tiempo de retención
    retentionInterval.current = setInterval(() => {
      setRetentionTime(prev => prev + 1)
    }, 1000)
  }
  
  // Función para finalizar la retención
  const endRetention = () => {
    if (retentionInterval.current) {
      clearInterval(retentionInterval.current)
      
      // Guardar el tiempo de retención
      setRetentionTimes(prev => [...prev, retentionTime])
      
      // Iniciar la fase de recuperación
      startRecovery()
    }
  }
  
  // Función para iniciar la fase de recuperación
  const startRecovery = () => {
    setPhase('recovery')
    setRecoveryTime(15)
    setIsRecovering(true)
    
    // Iniciar el contador de tiempo de recuperación
    recoveryInterval.current = setInterval(() => {
      setRecoveryTime(prev => {
        if (prev <= 1) {
          clearInterval(recoveryInterval.current as NodeJS.Timeout)
          setIsRecovering(false)
          
          // Si no hemos completado todas las rondas, iniciar la siguiente
          if (round < totalRounds) {
            setRound(prev => prev + 1)
            startBreathing()
          } else {
            // Si hemos completado todas las rondas, finalizar la sesión
            completeSession()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  
  // Función para completar la sesión
  const completeSession = () => {
    setPhase('complete')
  }
  
  // Función para guardar la sesión
  const saveSession = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar la sesión",
        variant: "destructive"
      })
      return
    }
    
    // Calcular estadísticas
    const avgRetentionTime = Math.round(
      retentionTimes.reduce((acc, time) => acc + time, 0) / retentionTimes.length
    )
    const maxRetentionTime = Math.max(...retentionTimes)
    const minRetentionTime = Math.min(...retentionTimes)
    
    // Crear objeto de sesión
    const sessionData = {
      userId: user.id,
      date: new Date().toISOString(),
      sessionType: 'wim_hof',
      rounds: totalRounds,
      avgRetentionTime,
      maxRetentionTime,
      minRetentionTime,
      feelingBefore: feelingBefore || undefined,
      feelingAfter: feelingAfter || undefined,
      notes: notes || undefined
    }
    
    try {
      const { data, error } = await saveBreathSession(sessionData)
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo guardar la sesión",
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Sesión guardada",
        description: "Tu sesión de respiración se ha guardado correctamente",
        variant: "default"
      })
      
      // Notificar al componente padre
      if (onComplete) {
        onComplete(data)
      }
    } catch (error) {
      console.error("Error al guardar la sesión:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la sesión",
        variant: "destructive"
      })
    }
  }
  
  // Limpiar los intervalos al desmontar el componente
  useEffect(() => {
    return () => {
      if (breathingInterval.current) clearInterval(breathingInterval.current)
      if (retentionInterval.current) clearInterval(retentionInterval.current)
      if (recoveryInterval.current) clearInterval(recoveryInterval.current)
    }
  }, [])
  
  // Renderizar la fase de introducción
  const renderIntro = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Wind className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Método de Respiración Wim Hof</h2>
        <p className="text-gray-500 mb-6">
          Prepárate para una poderosa técnica de respiración que puede mejorar tu energía, 
          reducir el estrés y fortalecer tu sistema inmunológico.
        </p>
      </div>
      
      <Card3D className="p-6">
        <h3 className="font-semibold mb-4">Configura tu sesión</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Número de rondas</span>
              <span className="text-sm">{totalRounds} rondas</span>
            </div>
            <Slider
              value={[totalRounds]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setTotalRounds(value[0])}
            />
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">¿Cómo te sientes ahora?</div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button3D
                  key={value}
                  variant={feelingBefore === value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFeelingBefore(value)}
                >
                  {value}
                </Button3D>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mal</span>
              <span>Excelente</span>
            </div>
          </div>
        </div>
      </Card3D>
      
      <div className="flex justify-between items-center">
        <Button3D variant="outline" onClick={() => setShowInfo(!showInfo)}>
          <Info className="h-4 w-4 mr-2" />
          {showInfo ? "Ocultar instrucciones" : "Ver instrucciones"}
        </Button3D>
        
        <Button3D onClick={() => startBreathing()}>
          <Play className="h-4 w-4 mr-2" />
          Comenzar
        </Button3D>
      </div>
      
      {showInfo && (
        <Card3D className="p-6 bg-blue-50/50">
          <h3 className="font-semibold mb-2">Instrucciones</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>
              <strong>Respiración potente:</strong> Realiza 30-40 respiraciones profundas, inhalando completamente y exhalando sin forzar.
            </li>
            <li>
              <strong>Retención:</strong> Después de la última exhalación, retén la respiración tanto como puedas cómodamente.
            </li>
            <li>
              <strong>Recuperación:</strong> Inhala profundamente y mantén durante 15 segundos, luego exhala.
            </li>
            <li>
              Repite el ciclo 3-5 veces.
            </li>
          </ol>
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium">Precauciones:</p>
            <p>Realiza esta práctica sentado o acostado. No la practiques en agua o mientras conduces. Si sientes mareos, detente y respira normalmente.</p>
          </div>
        </Card3D>
      )}
    </div>
  )
  
  // Renderizar la fase de respiración
  const renderBreathing = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Ronda {round} de {totalRounds}</h2>
        <p className="text-gray-500">Respiración potente</p>
      </div>
      
      <div className="flex justify-center">
        <div className="relative">
          <motion.div
            animate={{ 
              scale: isBreathing ? [1, 1.3, 1] : 1,
              opacity: isBreathing ? [0.7, 1, 0.7] : 0.7
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="bg-blue-100 rounded-full p-12"
          >
            <Lungs className="h-16 w-16 text-blue-600" />
          </motion.div>
          
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <div className="text-2xl font-bold">{breathCount}</div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">
          Inhala profundamente por la nariz o boca y exhala sin forzar
        </p>
        <p className="text-sm font-medium">
          {breathCount}/30 respiraciones
        </p>
        <Progress3D value={(breathCount / 30) * 100} max={100} className="mt-2" />
      </div>
      
      <div className="flex justify-center">
        <Button3D 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (breathingInterval.current) {
              clearInterval(breathingInterval.current)
              startRetention()
            }
          }}
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Saltar a retención
        </Button3D>
      </div>
    </div>
  )
  
  // Renderizar la fase de retención
  const renderRetention = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Ronda {round} de {totalRounds}</h2>
        <p className="text-gray-500">Retención de respiración</p>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-indigo-100 rounded-full p-12">
          <Timer className="h-16 w-16 text-indigo-600" />
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">
          {Math.floor(retentionTime / 60)}:{(retentionTime % 60).toString().padStart(2, '0')}
        </div>
        <p className="text-sm text-gray-500">
          Mantén la respiración tanto como puedas cómodamente
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button3D onClick={endRetention}>
          He tomado aire
        </Button3D>
      </div>
    </div>
  )
  
  // Renderizar la fase de recuperación
  const renderRecovery = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Ronda {round} de {totalRounds}</h2>
        <p className="text-gray-500">Respiración de recuperación</p>
      </div>
      
      <div className="flex justify-center">
        <motion.div
          animate={{ 
            scale: isRecovering ? [1, 1.2, 1] : 1,
            opacity: isRecovering ? [0.7, 1, 0.7] : 0.7
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="bg-green-100 rounded-full p-12"
        >
          <Clock className="h-16 w-16 text-green-600" />
        </motion.div>
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">
          {recoveryTime}
        </div>
        <p className="text-sm text-gray-500">
          Inhala profundamente y mantén el aire
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button3D 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (recoveryInterval.current) {
              clearInterval(recoveryInterval.current)
              setIsRecovering(false)
              
              if (round < totalRounds) {
                setRound(prev => prev + 1)
                startBreathing()
              } else {
                completeSession()
              }
            }
          }}
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Siguiente ronda
        </Button3D>
      </div>
    </div>
  )
  
  // Renderizar la fase de completado
  const renderComplete = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Award className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Sesión completada!</h2>
        <p className="text-gray-500 mb-6">
          Has completado {totalRounds} rondas del método Wim Hof.
        </p>
      </div>
      
      <Card3D className="p-6">
        <h3 className="font-semibold mb-4">Resultados de la sesión</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span>Tiempo promedio de retención:</span>
              <span className="font-medium">
                {Math.round(retentionTimes.reduce((acc, time) => acc + time, 0) / retentionTimes.length)} segundos
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm">
              <span>Tiempo máximo de retención:</span>
              <span className="font-medium">
                {Math.max(...retentionTimes)} segundos
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Tiempos de retención por ronda:</div>
            <div className="grid grid-cols-5 gap-2">
              {retentionTimes.map((time, index) => (
                <div key={index} className="bg-gray-100 rounded p-2 text-center">
                  <div className="text-xs text-gray-500">Ronda {index + 1}</div>
                  <div className="font-medium">{time}s</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">¿Cómo te sientes ahora?</div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button3D
                  key={value}
                  variant={feelingAfter === value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFeelingAfter(value)}
                >
                  {value}
                </Button3D>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mal</span>
              <span>Excelente</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Notas (opcional)</div>
            <Textarea
              placeholder="Escribe tus observaciones sobre la sesión..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card3D>
      
      <div className="flex justify-between">
        <Button3D variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cerrar
        </Button3D>
        
        <Button3D onClick={saveSession}>
          <Save className="h-4 w-4 mr-2" />
          Guardar sesión
        </Button3D>
      </div>
    </div>
  )
  
  // Renderizar la fase actual
  const renderPhase = () => {
    switch (phase) {
      case 'intro':
        return renderIntro()
      case 'breathing':
        return renderBreathing()
      case 'retention':
        return renderRetention()
      case 'recovery':
        return renderRecovery()
      case 'complete':
        return renderComplete()
      default:
        return renderIntro()
    }
  }
  
  return (
    <div className="max-w-md mx-auto p-4">
      {renderPhase()}
    </div>
  )
}
