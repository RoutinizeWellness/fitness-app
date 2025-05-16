"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  Camera, 
  Video, 
  Pause, 
  Play, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Maximize,
  Minimize,
  Settings,
  Sparkles
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ExerciseFormAnalyzerProps {
  exerciseName?: string
  exerciseId?: string
  onFormAnalysis?: (analysis: ExerciseFormAnalysis) => void
  className?: string
}

interface ExerciseFormAnalysis {
  exerciseId: string
  exerciseName: string
  formScore: number // 0-100
  repetitions: number
  issues: {
    type: 'posture' | 'range_of_motion' | 'tempo' | 'alignment' | 'other'
    severity: 'low' | 'medium' | 'high'
    description: string
    timestamp: number
  }[]
  feedback: string
  timestamp: string
}

export default function ExerciseFormAnalyzer({
  exerciseName = "Ejercicio",
  exerciseId = "unknown",
  onFormAnalysis,
  className
}: ExerciseFormAnalyzerProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [formAnalysis, setFormAnalysis] = useState<ExerciseFormAnalysis | null>(null)
  const [settings, setSettings] = useState({
    showSkeleton: true,
    showFeedback: true,
    countReps: true,
    sensitivity: 'medium' as 'low' | 'medium' | 'high',
    detectionConfidence: 0.7
  })
  
  // Request camera permission and list available cameras
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setCameraPermission(true)
        
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop())
        
        // Get list of available cameras
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter(device => device.kind === 'videoinput')
        setAvailableCameras(cameras)
        
        // Select the first camera by default
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId)
        }
      } catch (error) {
        console.error("Error requesting camera permission:", error)
        setCameraPermission(false)
        toast({
          title: "Error de cámara",
          description: "No se pudo acceder a la cámara. Por favor, concede permisos de cámara para usar esta función.",
          variant: "destructive",
        })
      }
    }
    
    requestCameraPermission()
  }, [toast])
  
  // Start/stop camera stream
  useEffect(() => {
    let stream: MediaStream | null = null
    
    const startCamera = async () => {
      if (!videoRef.current || !selectedCamera) return
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      } catch (error) {
        console.error("Error starting camera:", error)
        toast({
          title: "Error de cámara",
          description: "No se pudo iniciar la cámara.",
          variant: "destructive",
        })
      }
    }
    
    if (isAnalyzing && !isPaused && selectedCamera) {
      startCamera()
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isAnalyzing, isPaused, selectedCamera, toast])
  
  // Handle form analysis
  useEffect(() => {
    let animationFrameId: number
    let lastAnalysisTime = 0
    const ANALYSIS_INTERVAL = 500 // ms
    
    const analyzeFrame = async () => {
      if (!videoRef.current || !canvasRef.current || isPaused) return
      
      const now = Date.now()
      
      // Only analyze every ANALYSIS_INTERVAL ms
      if (now - lastAnalysisTime >= ANALYSIS_INTERVAL) {
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        
        // Draw the current video frame to the canvas
        ctx.drawImage(
          videoRef.current,
          0, 0,
          canvasRef.current.width,
          canvasRef.current.height
        )
        
        // In a real implementation, here we would:
        // 1. Send the canvas data to a pose estimation model
        // 2. Analyze the pose for the specific exercise
        // 3. Provide feedback based on the analysis
        
        // For now, we'll simulate the analysis
        simulateFormAnalysis()
        
        lastAnalysisTime = now
      }
      
      animationFrameId = requestAnimationFrame(analyzeFrame)
    }
    
    if (isAnalyzing && !isPaused) {
      animationFrameId = requestAnimationFrame(analyzeFrame)
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isAnalyzing, isPaused, exerciseId, exerciseName])
  
  // Simulate form analysis (in a real implementation, this would use ML models)
  const simulateFormAnalysis = () => {
    // Generate a random form score between 70 and 100
    const formScore = Math.floor(Math.random() * 30) + 70
    
    // Generate random issues
    const issueTypes = ['posture', 'range_of_motion', 'tempo', 'alignment'] as const
    const severities = ['low', 'medium', 'high'] as const
    
    const issues = []
    
    // Add 0-2 random issues
    const numIssues = Math.floor(Math.random() * 3)
    for (let i = 0; i < numIssues; i++) {
      const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      
      let description = ""
      switch (issueType) {
        case 'posture':
          description = "Mantén la espalda recta durante todo el movimiento"
          break
        case 'range_of_motion':
          description = "Aumenta el rango de movimiento para mayor efectividad"
          break
        case 'tempo':
          description = "Controla la velocidad del movimiento, especialmente en la fase excéntrica"
          break
        case 'alignment':
          description = "Alinea mejor las rodillas con los pies durante el ejercicio"
          break
      }
      
      issues.push({
        type: issueType,
        severity,
        description,
        timestamp: Date.now()
      })
    }
    
    // Create the analysis object
    const analysis: ExerciseFormAnalysis = {
      exerciseId,
      exerciseName,
      formScore,
      repetitions: Math.floor(Math.random() * 5) + 1, // 1-5 reps
      issues,
      feedback: formScore >= 90
        ? "Excelente forma! Mantén la técnica."
        : formScore >= 80
        ? "Buena forma. Pequeños ajustes mejorarían tu técnica."
        : "Forma aceptable. Revisa los puntos mencionados para mejorar.",
      timestamp: new Date().toISOString()
    }
    
    setFormAnalysis(analysis)
    
    if (onFormAnalysis) {
      onFormAnalysis(analysis)
    }
  }
  
  // Toggle analysis
  const toggleAnalysis = () => {
    if (isAnalyzing) {
      setIsAnalyzing(false)
      setIsPaused(false)
      setFormAnalysis(null)
    } else {
      setIsAnalyzing(true)
    }
  }
  
  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused)
    
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  // Render camera permission request
  if (cameraPermission === false) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Análisis de Forma</CardTitle>
          <CardDescription>
            Se requiere acceso a la cámara para analizar tu forma durante el ejercicio
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Camera className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-center text-gray-500 mb-4">
            Por favor, concede permisos de cámara para usar esta función
          </p>
          <Button onClick={() => setCameraPermission(null)}>
            Solicitar permisos de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Render loading state
  if (cameraPermission === null) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Análisis de Forma</CardTitle>
          <CardDescription>
            Solicitando acceso a la cámara...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Análisis de Forma: {exerciseName}
            </CardTitle>
            <CardDescription>
              Usa la cámara para analizar tu técnica en tiempo real
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={1280}
              height={720}
            />
            
            {/* Overlay for form feedback */}
            {isAnalyzing && formAnalysis && settings.showFeedback && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Badge variant={
                      formAnalysis.formScore >= 90 ? "success" :
                      formAnalysis.formScore >= 80 ? "default" : "warning"
                    }>
                      Forma: {formAnalysis.formScore}/100
                    </Badge>
                    {settings.countReps && (
                      <Badge variant="outline" className="ml-2 bg-white/10">
                        Repeticiones: {formAnalysis.repetitions}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {formAnalysis.issues.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {formAnalysis.issues.map((issue, index) => (
                      <div key={index} className="flex items-start text-white text-sm">
                        {issue.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-500 mr-1 mt-0.5" />}
                        {issue.severity === 'medium' && <Info className="h-4 w-4 text-yellow-500 mr-1 mt-0.5" />}
                        {issue.severity === 'low' && <Info className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />}
                        <span>{issue.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-white text-sm">{formAnalysis.feedback}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4">
          <Button
            variant={isAnalyzing ? "destructive" : "default"}
            onClick={toggleAnalysis}
          >
            {isAnalyzing ? "Detener análisis" : "Iniciar análisis"}
          </Button>
          
          {isAnalyzing && (
            <Button variant="outline" onClick={togglePause}>
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Reanudar" : "Pausar"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de análisis</DialogTitle>
            <DialogDescription>
              Personaliza cómo funciona el análisis de forma
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-skeleton">Mostrar esqueleto</Label>
              <Switch
                id="show-skeleton"
                checked={settings.showSkeleton}
                onCheckedChange={(checked) => setSettings({...settings, showSkeleton: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-feedback">Mostrar feedback en tiempo real</Label>
              <Switch
                id="show-feedback"
                checked={settings.showFeedback}
                onCheckedChange={(checked) => setSettings({...settings, showFeedback: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="count-reps">Contar repeticiones</Label>
              <Switch
                id="count-reps"
                checked={settings.countReps}
                onCheckedChange={(checked) => setSettings({...settings, countReps: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Sensibilidad</Label>
              <div className="flex space-x-2">
                <Button
                  variant={settings.sensitivity === 'low' ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSettings({...settings, sensitivity: 'low'})}
                >
                  Baja
                </Button>
                <Button
                  variant={settings.sensitivity === 'medium' ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSettings({...settings, sensitivity: 'medium'})}
                >
                  Media
                </Button>
                <Button
                  variant={settings.sensitivity === 'high' ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSettings({...settings, sensitivity: 'high'})}
                >
                  Alta
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cámara</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Cámara ${camera.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Guardar configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
