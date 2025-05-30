"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Video, Play, Pause, RotateCcw, Upload, Save, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { analyzeWorkoutVideo } from "@/lib/edge-functions-service"

interface PostureAnalysisProps {
  onSave?: (feedback: any) => void
}

export default function PostureAnalysis({ onSave }: PostureAnalysisProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [selectedExercise, setSelectedExercise] = useState("sentadilla")
  const [viewMode, setViewMode] = useState<"camera" | "feedback">("camera")

  // Lista de ejercicios para análisis
  const exercises = [
    // Ejercicios compuestos principales
    { id: "sentadilla", name: "Sentadilla" },
    { id: "peso_muerto", name: "Peso Muerto" },
    { id: "press_banca", name: "Press de Banca" },
    { id: "dominadas", name: "Dominadas" },
    { id: "overhead_press", name: "Press Militar" },
    { id: "fondos", name: "Fondos" },

    // Ejercicios para piernas
    { id: "prensa_piernas", name: "Prensa de Piernas" },
    { id: "extension_cuadriceps", name: "Extensión de Cuádriceps" },
    { id: "curl_isquiotibiales", name: "Curl de Isquiotibiales" },
    { id: "elevacion_pantorrillas", name: "Elevación de Pantorrillas" },
    { id: "sentadilla_bulgara", name: "Sentadilla Búlgara" },
    { id: "hip_thrust", name: "Hip Thrust" },
    { id: "zancadas", name: "Zancadas" },

    // Ejercicios para espalda
    { id: "remo_barra", name: "Remo con Barra" },
    { id: "remo_mancuerna", name: "Remo con Mancuerna" },
    { id: "jalon_pecho", name: "Jalón al Pecho" },
    { id: "pull_over", name: "Pull-over" },
    { id: "hiperextensiones", name: "Hiperextensiones" },

    // Ejercicios para pecho
    { id: "press_inclinado", name: "Press Inclinado" },
    { id: "press_declinado", name: "Press Declinado" },
    { id: "aperturas_mancuernas", name: "Aperturas con Mancuernas" },
    { id: "crossover_polea", name: "Crossover en Polea" },

    // Ejercicios para hombros
    { id: "elevaciones_laterales", name: "Elevaciones Laterales" },
    { id: "elevaciones_frontales", name: "Elevaciones Frontales" },
    { id: "remo_menton", name: "Remo al Mentón" },
    { id: "face_pull", name: "Face Pull" },

    // Ejercicios para brazos
    { id: "curl_biceps_barra", name: "Curl de Bíceps con Barra" },
    { id: "curl_biceps_mancuernas", name: "Curl de Bíceps con Mancuernas" },
    { id: "extension_triceps_polea", name: "Extensión de Tríceps en Polea" },
    { id: "press_frances", name: "Press Francés" },
    { id: "curl_martillo", name: "Curl de Martillo" },

    // Ejercicios funcionales
    { id: "burpees", name: "Burpees" },
    { id: "mountain_climbers", name: "Mountain Climbers" },
    { id: "kettlebell_swing", name: "Kettlebell Swing" },
    { id: "turkish_getup", name: "Turkish Get-up" },
    { id: "clean_and_jerk", name: "Clean and Jerk" },
    { id: "snatch", name: "Snatch" }
  ]

  // Activar/desactivar cámara
  const toggleCamera = async () => {
    if (cameraActive) {
      // Detener cámara
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setCameraActive(false)
      setRecording(false)
    } else {
      try {
        // Iniciar cámara
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setCameraActive(true)
      } catch (error) {
        console.error("Error al acceder a la cámara:", error)
        toast({
          title: "Error",
          description: "No se pudo acceder a la cámara.",
          variant: "destructive"
        })
      }
    }
  }

  // Iniciar/detener grabación
  const toggleRecording = () => {
    if (recording) {
      // Detener grabación
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setRecording(false)
    } else {
      // Iniciar grabación
      if (streamRef.current) {
        const mediaRecorder = new MediaRecorder(streamRef.current)
        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" })
          setVideoBlob(blob)
          setVideoUrl(URL.createObjectURL(blob))
        }

        mediaRecorder.start()
        setRecording(true)
      }
    }
  }

  // Subir video
  const uploadVideo = async () => {
    if (!videoBlob || !user) return

    try {
      // Generar nombre de archivo único
      const fileName = `${user.id}/${Date.now()}_${selectedExercise}.webm`

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("user_videos")
        .upload(fileName, videoBlob, {
          contentType: "video/webm",
          cacheControl: "3600"
        })

      if (error) throw error

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("user_videos")
        .getPublicUrl(fileName)

      toast({
        title: "Video subido",
        description: "El video se ha subido correctamente."
      })

      return urlData.publicUrl
    } catch (error) {
      console.error("Error al subir el video:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el video.",
        variant: "destructive"
      })
      return null
    }
  }

  // Analizar postura
  const analyzePosture = async () => {
    if (!videoBlob || !user) return

    setAnalyzing(true)
    setViewMode("feedback")

    try {
      // Subir video
      let videoUrl = null
      try {
        videoUrl = await uploadVideo()

        if (!videoUrl) {
          throw new Error("No se pudo obtener la URL del video")
        }

        console.log("Video subido exitosamente:", videoUrl)

        // Analizar el video utilizando la API de Supabase
        const { data, error } = await analyzeWorkoutVideo(user.id, videoUrl, selectedExercise)

        if (error) {
          console.error("Error al analizar video:", error)
          throw error
        }

        // Mostrar feedback
        const analysisFeedback = {
          exercise: selectedExercise,
          posture: data.posture || "neutral",
          issues: data.issues || [],
          recommendations: data.recommendations || [],
          score: data.score || 0,
          timestamp: new Date().toISOString()
        }

        setFeedback(analysisFeedback)

        // Llamar al callback si existe
        if (onSave) {
          onSave(analysisFeedback)
        }

        toast({
          title: "Análisis completado",
          description: "Se ha analizado tu postura correctamente."
        })
      } catch (uploadError) {
        console.error("Error al subir o analizar video:", uploadError)

        // Continuar con el modo de demostración
        const demoFeedback = generateDemoFeedback(selectedExercise)
        setFeedback(demoFeedback)

        // Llamar al callback si existe
        if (onSave) {
          onSave(demoFeedback)
        }

        toast({
          title: "Modo demostración",
          description: "Se está mostrando feedback de ejemplo.",
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Error al analizar postura:", error)

      // Generar feedback de ejemplo para demostración
      const demoFeedback = generateDemoFeedback(selectedExercise)
      setFeedback(demoFeedback)

      toast({
        title: "Modo demostración",
        description: "Se está mostrando feedback de ejemplo.",
        variant: "default"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // Generar feedback de demostración
  const generateDemoFeedback = (exercise: string) => {
    // Plantillas de feedback para ejercicios básicos
    const basicFeedbackTemplates: Record<string, any> = {
      sentadilla: {
        exercise: "sentadilla",
        posture: "needs_improvement",
        issues: [
          "Rodillas hacia adentro durante el descenso",
          "Espalda demasiado inclinada hacia adelante",
          "Talones se levantan del suelo"
        ],
        recommendations: [
          "Mantén las rodillas alineadas con los pies",
          "Mantén el pecho erguido y la espalda recta",
          "Asegúrate de que los talones permanezcan en contacto con el suelo"
        ],
        score: 65,
        timestamp: new Date().toISOString()
      },
      peso_muerto: {
        exercise: "peso_muerto",
        posture: "good",
        issues: [
          "Ligera curvatura en la espalda baja"
        ],
        recommendations: [
          "Mantén la espalda completamente recta durante todo el movimiento",
          "Empuja con los talones al levantar el peso"
        ],
        score: 85,
        timestamp: new Date().toISOString()
      },
      press_banca: {
        exercise: "press_banca",
        posture: "excellent",
        issues: [],
        recommendations: [
          "Mantén los hombros retraídos y estables durante todo el movimiento"
        ],
        score: 95,
        timestamp: new Date().toISOString()
      },
      dominadas: {
        exercise: "dominadas",
        posture: "needs_improvement",
        issues: [
          "Movimiento de balanceo excesivo",
          "No se completa el rango de movimiento"
        ],
        recommendations: [
          "Mantén el cuerpo estable y evita balancearte",
          "Asegúrate de bajar completamente y subir hasta que la barbilla supere la barra"
        ],
        score: 70,
        timestamp: new Date().toISOString()
      },
      overhead_press: {
        exercise: "overhead_press",
        posture: "poor",
        issues: [
          "Arqueamiento excesivo de la espalda baja",
          "Codos no alineados con los hombros",
          "Movimiento no es vertical"
        ],
        recommendations: [
          "Mantén el core activado para evitar arquear la espalda",
          "Alinea los codos directamente debajo de las muñecas",
          "Mueve la barra en línea recta vertical"
        ],
        score: 50,
        timestamp: new Date().toISOString()
      },
      fondos: {
        exercise: "fondos",
        posture: "good",
        issues: [
          "Hombros ligeramente elevados",
          "Codos se abren demasiado"
        ],
        recommendations: [
          "Mantén los hombros bajos y alejados de las orejas",
          "Mantén los codos cerca del cuerpo durante el movimiento"
        ],
        score: 80,
        timestamp: new Date().toISOString()
      }
    }

    // Plantillas de feedback para ejercicios de piernas
    const legFeedbackTemplates: Record<string, any> = {
      prensa_piernas: {
        exercise: "prensa_piernas",
        posture: "good",
        issues: [
          "Rodillas se juntan ligeramente al final del movimiento",
          "Espalda se despega del respaldo"
        ],
        recommendations: [
          "Mantén las rodillas alineadas con los pies durante todo el movimiento",
          "Mantén la espalda y los glúteos en contacto con el asiento y el respaldo"
        ],
        score: 82,
        timestamp: new Date().toISOString()
      },
      extension_cuadriceps: {
        exercise: "extension_cuadriceps",
        posture: "excellent",
        issues: [],
        recommendations: [
          "Mantén el movimiento controlado, especialmente en la fase excéntrica"
        ],
        score: 95,
        timestamp: new Date().toISOString()
      },
      curl_isquiotibiales: {
        exercise: "curl_isquiotibiales",
        posture: "good",
        issues: [
          "Cadera se eleva ligeramente del asiento"
        ],
        recommendations: [
          "Mantén las caderas firmemente apoyadas en el asiento durante todo el movimiento"
        ],
        score: 88,
        timestamp: new Date().toISOString()
      },
      sentadilla_bulgara: {
        exercise: "sentadilla_bulgara",
        posture: "needs_improvement",
        issues: [
          "Rodilla delantera sobrepasa demasiado la punta del pie",
          "Torso demasiado inclinado hacia adelante",
          "Inestabilidad en la postura"
        ],
        recommendations: [
          "Mantén la rodilla alineada con el pie, sin sobrepasar demasiado la punta",
          "Mantén el torso más erguido",
          "Enfócate en la estabilidad antes de aumentar el peso"
        ],
        score: 68,
        timestamp: new Date().toISOString()
      }
    }

    // Plantillas de feedback para ejercicios de espalda
    const backFeedbackTemplates: Record<string, any> = {
      remo_barra: {
        exercise: "remo_barra",
        posture: "needs_improvement",
        issues: [
          "Espalda redondeada durante el movimiento",
          "Movimiento principalmente con los brazos, no con la espalda",
          "Balanceo excesivo del torso"
        ],
        recommendations: [
          "Mantén la espalda recta y el core activado durante todo el movimiento",
          "Concéntrate en contraer los músculos de la espalda, no solo en mover el peso",
          "Reduce el balanceo del torso para aislar mejor los músculos de la espalda"
        ],
        score: 65,
        timestamp: new Date().toISOString()
      },
      jalon_pecho: {
        exercise: "jalon_pecho",
        posture: "good",
        issues: [
          "Ligero movimiento de balanceo al final del movimiento"
        ],
        recommendations: [
          "Mantén el torso estable durante todo el movimiento",
          "Enfócate en llevar la barra hacia el pecho, no el pecho hacia la barra"
        ],
        score: 85,
        timestamp: new Date().toISOString()
      }
    }

    // Plantillas de feedback para ejercicios de pecho
    const chestFeedbackTemplates: Record<string, any> = {
      press_inclinado: {
        exercise: "press_inclinado",
        posture: "good",
        issues: [
          "Arco excesivo en la espalda baja"
        ],
        recommendations: [
          "Mantén la espalda baja en contacto con el banco",
          "Activa el core para estabilizar la columna"
        ],
        score: 82,
        timestamp: new Date().toISOString()
      },
      aperturas_mancuernas: {
        exercise: "aperturas_mancuernas",
        posture: "needs_improvement",
        issues: [
          "Codos demasiado extendidos",
          "Rango de movimiento excesivo",
          "Hombros no estabilizados"
        ],
        recommendations: [
          "Mantén una ligera flexión en los codos durante todo el movimiento",
          "Limita el rango de movimiento para proteger los hombros",
          "Retrae y estabiliza los omóplatos contra el banco"
        ],
        score: 70,
        timestamp: new Date().toISOString()
      }
    }

    // Plantillas de feedback para ejercicios funcionales
    const functionalFeedbackTemplates: Record<string, any> = {
      burpees: {
        exercise: "burpees",
        posture: "needs_improvement",
        issues: [
          "Espalda redondeada en la posición de plancha",
          "Salto con poca altura",
          "Rodillas no alineadas con los pies en la sentadilla"
        ],
        recommendations: [
          "Mantén la espalda recta en la posición de plancha",
          "Explota hacia arriba en el salto usando la fuerza de las piernas",
          "Asegúrate de que las rodillas estén alineadas con los pies en la sentadilla"
        ],
        score: 68,
        timestamp: new Date().toISOString()
      },
      kettlebell_swing: {
        exercise: "kettlebell_swing",
        posture: "good",
        issues: [
          "Ligera flexión en la espalda al final del movimiento"
        ],
        recommendations: [
          "Mantén la espalda completamente recta durante todo el movimiento",
          "Usa la fuerza de las caderas, no de los brazos, para impulsar el kettlebell"
        ],
        score: 85,
        timestamp: new Date().toISOString()
      }
    }

    // Combinar todas las plantillas
    const feedbackTemplates = {
      ...basicFeedbackTemplates,
      ...legFeedbackTemplates,
      ...backFeedbackTemplates,
      ...chestFeedbackTemplates,
      ...functionalFeedbackTemplates
    }

    return feedbackTemplates[exercise] || feedbackTemplates.sentadilla
  }

  // Renderizar feedback
  const renderFeedback = () => {
    if (!feedback) {
      return (
        <div className="flex flex-col items-center justify-center h-60">
          <p className="text-gray-500">Analizando tu postura...</p>
        </div>
      )
    }

    const getPostureColor = () => {
      switch (feedback.posture) {
        case "excellent": return "text-green-500"
        case "good": return "text-blue-500"
        case "needs_improvement": return "text-amber-500"
        case "poor": return "text-red-500"
        default: return "text-gray-500"
      }
    }

    const getPostureIcon = () => {
      switch (feedback.posture) {
        case "excellent": return <CheckCircle className="h-6 w-6 text-green-500" />
        case "good": return <CheckCircle className="h-6 w-6 text-blue-500" />
        case "needs_improvement": return <AlertTriangle className="h-6 w-6 text-amber-500" />
        case "poor": return <AlertTriangle className="h-6 w-6 text-red-500" />
        default: return null
      }
    }

    const getPostureText = () => {
      switch (feedback.posture) {
        case "excellent": return "Excelente"
        case "good": return "Buena"
        case "needs_improvement": return "Necesita mejorar"
        case "poor": return "Deficiente"
        default: return "Neutral"
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Análisis de {exercises.find(e => e.id === feedback.exercise)?.name || feedback.exercise}
          </h3>
          <div className="flex items-center">
            {getPostureIcon()}
            <span className={`ml-1 font-medium ${getPostureColor()}`}>
              {getPostureText()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium">Puntuación de técnica</span>
          <span className="text-lg font-bold">{feedback.score}/100</span>
        </div>

        {feedback.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Problemas detectados:</h4>
            <ul className="space-y-1 pl-5 list-disc">
              {feedback.issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recomendaciones:</h4>
            <ul className="space-y-1 pl-5 list-disc">
              {feedback.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => setViewMode("camera")}>
            Volver a la cámara
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2 text-primary" />
          Análisis de Postura
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "camera" | "feedback")}>
          <TabsList className="mb-4">
            <TabsTrigger value="camera">Cámara</TabsTrigger>
            <TabsTrigger value="feedback" disabled={!feedback}>Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="flex justify-between items-center">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar ejercicio" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="sentadilla" disabled className="font-bold text-primary">
                    Ejercicios Compuestos Principales
                  </SelectItem>
                  {exercises.slice(0, 6).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="piernas_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios para Piernas
                  </SelectItem>
                  {exercises.slice(6, 13).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="espalda_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios para Espalda
                  </SelectItem>
                  {exercises.slice(13, 18).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="pecho_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios para Pecho
                  </SelectItem>
                  {exercises.slice(18, 22).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="hombros_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios para Hombros
                  </SelectItem>
                  {exercises.slice(22, 26).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="brazos_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios para Brazos
                  </SelectItem>
                  {exercises.slice(26, 31).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}

                  <SelectItem value="funcionales_header" disabled className="font-bold text-primary mt-2">
                    Ejercicios Funcionales
                  </SelectItem>
                  {exercises.slice(31).map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={toggleCamera}>
                {cameraActive ? "Detener Cámara" : "Iniciar Cámara"}
              </Button>
            </div>

            <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: "none" }}
              />

              {!cameraActive && videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={() => {
                    if (videoRef.current && videoUrl) {
                      videoRef.current.src = videoUrl
                      videoRef.current.play()
                    }
                  }}>
                    <Play className="h-4 w-4 mr-1" />
                    Reproducir
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-2">
              {cameraActive && (
                <Button
                  variant={recording ? "destructive" : "default"}
                  onClick={toggleRecording}
                >
                  <Video className="h-4 w-4 mr-1" />
                  {recording ? "Detener Grabación" : "Grabar"}
                </Button>
              )}

              {videoBlob && (
                <Button onClick={analyzePosture} disabled={analyzing}>
                  {analyzing ? "Analizando..." : "Analizar Postura"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            {renderFeedback()}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          Graba un video realizando el ejercicio para recibir feedback sobre tu técnica.
        </p>
      </CardFooter>
    </Card>
  )
}
