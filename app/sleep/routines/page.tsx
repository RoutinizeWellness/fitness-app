"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Play, Clock, BedDouble,
  ChevronRight, Plus, Search, Star
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Card3D } from "@/components/ui/card-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function SleepRoutinesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoutine, setSelectedRoutine] = useState<any | null>(null)
  const [showRoutineDetails, setShowRoutineDetails] = useState(false)

  // Datos para las rutinas de sueño
  const sleepRoutines = [
    {
      id: "routine1",
      title: "Rutina para dormir profundamente",
      duration: "15 min",
      steps: 4,
      color: "from-indigo-500 to-purple-600",
      difficulty: "Intermedio",
      description: "Una rutina completa para ayudarte a conciliar un sueño profundo y reparador",
      stepsDetail: [
        { name: "Respiración profunda", duration: "3 min", description: "Inhala por 4 segundos, mantén 4 segundos, exhala por 6 segundos" },
        { name: "Relajación muscular", duration: "5 min", description: "Tensa y relaja cada grupo muscular desde los pies hasta la cabeza" },
        { name: "Visualización", duration: "5 min", description: "Imagina un lugar tranquilo y seguro con todos tus sentidos" },
        { name: "Preparación para dormir", duration: "2 min", description: "Acomódate en tu posición favorita para dormir y suelta toda tensión" }
      ]
    },
    {
      id: "routine2",
      title: "Meditación para conciliar el sueño",
      duration: "10 min",
      steps: 3,
      color: "from-blue-500 to-indigo-600",
      difficulty: "Principiante",
      description: "Una meditación guiada para calmar la mente y prepararte para un sueño reparador",
      stepsDetail: [
        { name: "Atención a la respiración", duration: "3 min", description: "Enfócate en tu respiración natural sin intentar cambiarla" },
        { name: "Escaneo corporal", duration: "4 min", description: "Recorre mentalmente cada parte de tu cuerpo, relajándola" },
        { name: "Liberación de pensamientos", duration: "3 min", description: "Observa tus pensamientos sin juzgarlos y déjalos ir" }
      ]
    },
    {
      id: "routine3",
      title: "Respiración 4-7-8 para dormir",
      duration: "5 min",
      steps: 2,
      color: "from-purple-500 to-pink-600",
      difficulty: "Principiante",
      description: "Técnica de respiración desarrollada por el Dr. Andrew Weil para inducir el sueño rápidamente",
      stepsDetail: [
        { name: "Preparación", duration: "1 min", description: "Siéntate o acuéstate cómodamente y relaja tu cuerpo" },
        { name: "Respiración 4-7-8", duration: "4 min", description: "Inhala por la nariz durante 4 segundos, mantén la respiración durante 7 segundos, exhala por la boca durante 8 segundos. Repite." }
      ]
    },
    {
      id: "routine4",
      title: "Relajación muscular progresiva",
      duration: "12 min",
      steps: 3,
      color: "from-green-500 to-teal-600",
      difficulty: "Intermedio",
      description: "Técnica que consiste en tensar y relajar grupos musculares para liberar tensión física",
      stepsDetail: [
        { name: "Extremidades inferiores", duration: "4 min", description: "Tensa y relaja pies, pantorrillas y muslos" },
        { name: "Tronco y brazos", duration: "4 min", description: "Tensa y relaja abdomen, pecho, espalda, manos y brazos" },
        { name: "Cabeza y cuello", duration: "4 min", description: "Tensa y relaja cuello, mandíbula, ojos y frente" }
      ]
    }
  ]

  // Filtrar rutinas según la búsqueda
  const filteredRoutines = sleepRoutines.filter(routine =>
    routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    routine.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Iniciar una rutina
  const startRoutine = (routine: any) => {
    toast({
      title: `Iniciando: ${routine.title}`,
      description: "La rutina comenzará en unos segundos",
    })

    // En una implementación real, aquí navegaríamos a una página de reproducción
    // o mostraríamos un modal con la rutina paso a paso
    setSelectedRoutine(routine)
    setShowRoutineDetails(true)
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      {/* Encabezado con efecto de gradiente */}
      <div className="relative mb-10">
        <div className="flex items-center justify-between mb-2">
          <Button3D
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
          <h1 className="text-2xl font-bold gradient-text">Rutinas para dormir</h1>
          <div className="w-10"></div> {/* Espaciador para centrar el título */}
        </div>
        <p className="text-center text-gray-500 text-sm">Mejora tu descanso con rutinas guiadas</p>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
      </div>

      {/* Buscador con estilo mejorado */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-purple-400" />
        </div>
        <Input
          placeholder="Buscar rutinas para dormir..."
          className="pl-10 border-purple-100 focus:border-purple-300 rounded-xl shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista de rutinas */}
      <div className="space-y-5">
        {filteredRoutines.map((routine) => (
          <Card3D
            key={routine.id}
            className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all"
          >
            <div className="relative h-36">
              <div className={`absolute inset-0 bg-gradient-to-br ${routine.color} opacity-95`}></div>
              <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="relative p-5 text-white h-full flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-flex items-center">
                      <Moon className="h-3 w-3 mr-1" />
                      {routine.difficulty}
                    </span>
                    <h3 className="text-xl font-bold mt-2 group-hover:translate-x-1 transition-transform">{routine.title}</h3>
                  </div>

                  <Button3D
                    variant="glass"
                    size="icon"
                    className="h-10 w-10 text-white border-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform"
                    onClick={() => startRoutine(routine)}
                  >
                    <Play className="h-5 w-5" />
                  </Button3D>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{routine.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BedDouble className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{routine.steps} pasos</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <p className="text-sm text-gray-600 line-clamp-1 font-medium">{routine.description}</p>
              <Button3D
                variant="outline"
                size="sm"
                className="flex-shrink-0 rounded-full border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                onClick={() => {
                  setSelectedRoutine(routine)
                  setShowRoutineDetails(true)
                }}
              >
                <span className="text-xs flex items-center">
                  Detalles
                  <ChevronRight className="h-3 w-3 ml-1" />
                </span>
              </Button3D>
            </div>
          </Card3D>
        ))}
      </div>

      {/* Modal de detalles de la rutina */}
      {selectedRoutine && (
        <Dialog open={showRoutineDetails} onOpenChange={setShowRoutineDetails}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className={`bg-gradient-to-br ${selectedRoutine.color} p-6 text-white`}>
              <DialogTitle className="text-2xl font-bold text-white mb-2">{selectedRoutine.title}</DialogTitle>
              <DialogDescription className="text-white/90">
                {selectedRoutine.description}
              </DialogDescription>

              <div className="flex items-center justify-between mt-4 mb-2">
                <Badge variant="outline" className="flex items-center gap-1 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  {selectedRoutine.duration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Star className="h-3 w-3" />
                  {selectedRoutine.difficulty}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-bold text-lg mb-4 text-gray-800">Pasos de la rutina:</h4>
              <div className="space-y-4">
                {selectedRoutine.stepsDetail.map((step: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-purple-100 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-800 flex items-center">
                        <span className="flex items-center justify-center bg-purple-100 text-purple-600 rounded-full w-6 h-6 mr-2 text-xs font-bold">
                          {index + 1}
                        </span>
                        {step.name}
                      </h5>
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="p-6 pt-0">
              <Button3D
                onClick={() => startRoutine(selectedRoutine)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Play className="h-5 w-5 mr-2" />
                <span className="font-medium">Iniciar rutina</span>
              </Button3D>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
