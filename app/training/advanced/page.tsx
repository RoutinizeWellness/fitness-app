"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Plus, 
  BarChart4, 
  Target, 
  Dumbbell, 
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MacrocycleEditor } from "@/components/training/advanced/macrocycle-editor"
import { MacrocycleTimeline } from "@/components/training/advanced/macrocycle-timeline"
import { MesocycleEditor } from "@/components/training/advanced/mesocycle-editor"
import { 
  Macrocycle, 
  Mesocycle,
  AdvancedTrainingProfile
} from "@/lib/types/advanced-training"
import { 
  getUserMacrocycles, 
  deleteMacrocycle,
  getAdvancedTrainingProfile,
  updateAdvancedTrainingProfile
} from "@/lib/services/advanced-training-service"
import { supabase } from "@/lib/supabase-client"

export default function AdvancedTrainingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [macrocycles, setMacrocycles] = useState<Macrocycle[]>([])
  const [trainingProfile, setTrainingProfile] = useState<AdvancedTrainingProfile | null>(null)
  
  const [activeTab, setActiveTab] = useState("overview")
  const [showMacrocycleEditor, setShowMacrocycleEditor] = useState(false)
  const [showMesocycleEditor, setShowMesocycleEditor] = useState(false)
  const [selectedMacrocycle, setSelectedMacrocycle] = useState<Macrocycle | null>(null)
  const [selectedMesocycle, setSelectedMesocycle] = useState<Mesocycle | null>(null)
  const [mesocycleWeekStart, setMesocycleWeekStart] = useState(0)
  
  // Obtener el usuario actual y cargar datos
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserId(user.id)
          
          // Cargar macrociclos
          const macrocyclesData = await getUserMacrocycles(user.id)
          if (macrocyclesData) {
            setMacrocycles(macrocyclesData)
          }
          
          // Cargar perfil de entrenamiento
          const profileData = await getAdvancedTrainingProfile(user.id)
          if (profileData) {
            setTrainingProfile(profileData)
          } else {
            // Si no existe un perfil, crear uno por defecto
            const defaultProfile: Partial<AdvancedTrainingProfile> = {
              user_id: user.id,
              experience_level: "intermediate",
              training_age: 2,
              primary_goal: "strength",
              secondary_goals: ["hypertrophy"],
              weekly_availability: 8,
              session_duration_preference: 75,
              equipment_access: ["dumbbells", "barbell", "bench", "rack"],
              training_preferences: {
                preferred_split: "upper_lower",
                preferred_frequency: 4,
                preferred_volume: 7,
                preferred_intensity: 7,
                preferred_exercise_selection: [],
                avoided_exercise_selection: []
              },
              recovery_profile: {
                general_recovery: 7,
                sleep_quality: 7,
                stress_level: 5,
                nutrition_quality: 7
              }
            }
            
            const newProfile = await updateAdvancedTrainingProfile(defaultProfile as any)
            if (newProfile) {
              setTrainingProfile(newProfile)
            }
          }
        } else {
          // Redirigir a la página de inicio de sesión si no hay usuario
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error al obtener datos:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndData()
  }, [router])
  
  // Manejar la creación de un nuevo macrociclo
  const handleCreateMacrocycle = () => {
    setSelectedMacrocycle(null)
    setShowMacrocycleEditor(true)
    setActiveTab("editor")
  }
  
  // Manejar la edición de un macrociclo existente
  const handleEditMacrocycle = (macrocycle: Macrocycle) => {
    setSelectedMacrocycle(macrocycle)
    setShowMacrocycleEditor(true)
    setActiveTab("editor")
  }
  
  // Manejar la eliminación de un macrociclo
  const handleDeleteMacrocycle = async (macrocycleId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este macrociclo? Esta acción no se puede deshacer.")) {
      try {
        const success = await deleteMacrocycle(macrocycleId)
        
        if (success) {
          // Actualizar la lista de macrociclos
          setMacrocycles(prev => prev.filter(m => m.id !== macrocycleId))
        }
      } catch (error) {
        console.error("Error al eliminar macrociclo:", error)
      }
    }
  }
  
  // Manejar la creación de un nuevo mesociclo
  const handleCreateMesocycle = (macrocycleId: string, weekStart: number) => {
    const macrocycle = macrocycles.find(m => m.id === macrocycleId)
    
    if (macrocycle) {
      setSelectedMacrocycle(macrocycle)
      setMesocycleWeekStart(weekStart)
      setSelectedMesocycle(null)
      setShowMesocycleEditor(true)
      setActiveTab("mesocycle-editor")
    }
  }
  
  // Manejar la edición de un mesociclo existente
  const handleEditMesocycle = (mesocycle: Mesocycle) => {
    const macrocycle = macrocycles.find(m => m.id === mesocycle.macrocycle_id)
    
    if (macrocycle) {
      setSelectedMacrocycle(macrocycle)
      setSelectedMesocycle(mesocycle)
      setShowMesocycleEditor(true)
      setActiveTab("mesocycle-editor")
    }
  }
  
  // Manejar la eliminación de un mesociclo
  const handleDeleteMesocycle = async (mesocycleId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este mesociclo? Esta acción no se puede deshacer.")) {
      try {
        // Implementar la eliminación del mesociclo
        console.log("Eliminar mesociclo:", mesocycleId)
        
        // Recargar los macrociclos para actualizar la vista
        if (userId) {
          const macrocyclesData = await getUserMacrocycles(userId)
          if (macrocyclesData) {
            setMacrocycles(macrocyclesData)
          }
        }
      } catch (error) {
        console.error("Error al eliminar mesociclo:", error)
      }
    }
  }
  
  // Manejar el guardado de un macrociclo
  const handleSaveMacrocycle = async (macrocycle: Macrocycle) => {
    // Actualizar la lista de macrociclos
    setMacrocycles(prev => {
      const index = prev.findIndex(m => m.id === macrocycle.id)
      
      if (index >= 0) {
        // Actualizar macrociclo existente
        const updated = [...prev]
        updated[index] = macrocycle
        return updated
      } else {
        // Añadir nuevo macrociclo
        return [...prev, macrocycle]
      }
    })
    
    // Cerrar el editor y volver a la vista general
    setShowMacrocycleEditor(false)
    setActiveTab("overview")
  }
  
  // Manejar el guardado de un mesociclo
  const handleSaveMesocycle = async (mesocycle: Mesocycle) => {
    // Recargar los macrociclos para actualizar la vista
    if (userId) {
      const macrocyclesData = await getUserMacrocycles(userId)
      if (macrocyclesData) {
        setMacrocycles(macrocyclesData)
      }
    }
    
    // Cerrar el editor y volver a la vista general
    setShowMesocycleEditor(false)
    setActiveTab("overview")
  }
  
  // Renderizar el estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF3E9]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#FDA758] animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Encabezado */}
      <div className="bg-[#1B237E] text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronRight className="h-5 w-5 mr-1" />
            Dashboard
          </Button>
          
          <h1 className="text-xl font-bold">Entrenamiento Avanzado</h1>
          
          <div className="w-8"></div> {/* Espaciador para centrar el título */}
        </div>
        
        <p className="text-white/80 text-center mb-6">
          Planificación y periodización avanzada para atletas experimentados
        </p>
        
        <div className="flex justify-center">
          <TabsList className="bg-[#2A3190]">
            <TabsTrigger 
              value="overview" 
              className={`text-white ${activeTab === "overview" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => {
                setActiveTab("overview")
                setShowMacrocycleEditor(false)
                setShowMesocycleEditor(false)
              }}
            >
              Visión General
            </TabsTrigger>
            <TabsTrigger 
              value="editor" 
              className={`text-white ${activeTab === "editor" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
              onClick={() => {
                if (!showMacrocycleEditor) {
                  handleCreateMacrocycle()
                } else {
                  setActiveTab("editor")
                }
              }}
            >
              {showMacrocycleEditor ? "Editor de Macrociclo" : "Crear Macrociclo"}
            </TabsTrigger>
            {showMesocycleEditor && (
              <TabsTrigger 
                value="mesocycle-editor" 
                className={`text-white ${activeTab === "mesocycle-editor" ? "bg-[#FDA758]" : "hover:bg-[#3A41A0]"}`}
                onClick={() => setActiveTab("mesocycle-editor")}
              >
                {selectedMesocycle ? "Editor de Mesociclo" : "Crear Mesociclo"}
              </TabsTrigger>
            )}
          </TabsList>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Pestaña de visión general */}
          <TabsContent value="overview" className="space-y-6">
            {/* Introducción */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#573353] mb-4">
                Planificación de Entrenamiento Avanzado
              </h2>
              <p className="text-[#573353] opacity-80 mb-4">
                Diseña y gestiona tus ciclos de entrenamiento con herramientas avanzadas de periodización.
                Organiza tu entrenamiento en macrociclos, mesociclos y microciclos para maximizar tus resultados.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Macrociclos</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80 mb-3">
                    Planificación a largo plazo (3-12 meses) con objetivos específicos y periodización.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 p-0 h-auto"
                    onClick={handleCreateMacrocycle}
                  >
                    Crear macrociclo
                    <Plus className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <BarChart4 className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Mesociclos</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80 mb-3">
                    Bloques de entrenamiento de 3-6 semanas con foco específico y progresión.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-purple-600 p-0 h-auto"
                    disabled={macrocycles.length === 0}
                    onClick={() => {
                      if (macrocycles.length > 0) {
                        handleCreateMesocycle(macrocycles[0].id, 0)
                      }
                    }}
                  >
                    Crear mesociclo
                    <Plus className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-[#573353]">Microciclos</h3>
                  </div>
                  <p className="text-sm text-[#573353] opacity-80 mb-3">
                    Planificación semanal detallada con sesiones específicas y distribución de carga.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-amber-600 p-0 h-auto"
                    disabled={true}
                  >
                    Próximamente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Macrociclos */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#573353]">
                  Tus Macrociclos
                </h2>
                
                <Button
                  onClick={handleCreateMacrocycle}
                  className="bg-[#FDA758] hover:bg-[#FD9A40]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Macrociclo
                </Button>
              </div>
              
              {macrocycles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#573353] mb-2">No tienes macrociclos</h3>
                  <p className="text-[#573353] opacity-70 mb-6 max-w-md mx-auto">
                    Los macrociclos te permiten planificar tu entrenamiento a largo plazo con objetivos específicos y periodización.
                  </p>
                  <Button
                    onClick={handleCreateMacrocycle}
                    className="bg-[#FDA758] hover:bg-[#FD9A40]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Crear tu primer macrociclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {macrocycles.map((macrocycle) => (
                    <MacrocycleTimeline
                      key={macrocycle.id}
                      macrocycle={macrocycle}
                      onAddMesocycle={handleCreateMesocycle}
                      onEditMesocycle={handleEditMesocycle}
                      onDeleteMesocycle={handleDeleteMesocycle}
                      onEditMacrocycle={handleEditMacrocycle}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Pestaña de editor de macrociclo */}
          <TabsContent value="editor">
            {showMacrocycleEditor && userId && (
              <MacrocycleEditor
                userId={userId}
                initialData={selectedMacrocycle || undefined}
                onSave={handleSaveMacrocycle}
                onCancel={() => {
                  setShowMacrocycleEditor(false)
                  setActiveTab("overview")
                }}
              />
            )}
          </TabsContent>
          
          {/* Pestaña de editor de mesociclo */}
          <TabsContent value="mesocycle-editor">
            {showMesocycleEditor && selectedMacrocycle && (
              <MesocycleEditor
                macrocycleId={selectedMacrocycle.id}
                initialData={selectedMesocycle || undefined}
                weekStart={mesocycleWeekStart}
                onSave={handleSaveMesocycle}
                onCancel={() => {
                  setShowMesocycleEditor(false)
                  setActiveTab("overview")
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
