"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle, Card3DDescription } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Dumbbell,
  Utensils,
  Moon,
  Brain,
  BarChart2,
  User,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Edit,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Heart,
  FileText,
  LineChart,
  PieChart,
  BarChart,
  Activity
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"
import { Avatar3D, Avatar3DFallback, Avatar3DImage } from "@/components/ui/avatar-3d"

// Tipos
interface ClientUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
  status?: 'active' | 'suspended' | 'pending'
  role?: 'user' | 'trainer' | 'nutritionist' | 'admin'
}

interface WorkoutRoutine {
  id: string
  name: string
  description?: string
  level: string
  created_at: string
  last_used_at?: string
}

interface NutritionPlan {
  id: string
  name: string
  description?: string
  created_at: string
  status: string
}

interface SleepRecord {
  id: string
  date: string
  duration: number
  quality: number
}

interface WellnessActivity {
  id: string
  type: string
  name: string
  date: string
  duration: number
}

interface ClientNote {
  id: string
  content: string
  created_at: string
  created_by: string
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [clientUser, setClientUser] = useState<ClientUser | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [workoutRoutines, setWorkoutRoutines] = useState<WorkoutRoutine[]>([])
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([])
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [wellnessActivities, setWellnessActivities] = useState<WellnessActivity[]>([])
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [recommendations, setRecommendations] = useState<Record<string, string[]>>({
    training: [],
    nutrition: [],
    sleep: [],
    wellness: []
  })
  const [isAddingRecommendation, setIsAddingRecommendation] = useState(false)
  const [newRecommendation, setNewRecommendation] = useState("")
  const [recommendationModule, setRecommendationModule] = useState("training")
  const [isEditingRecommendation, setIsEditingRecommendation] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<{module: string, index: number, text: string} | null>(null)

  // Cargar datos del cliente
  useEffect(() => {
    if (isAdmin && unwrappedParams.id) {
      loadClientData(unwrappedParams.id)
    }
  }, [isAdmin, unwrappedParams.id])

  // Cargar datos del cliente desde Supabase
  const loadClientData = async (clientId: string) => {
    setIsLoading(true)
    try {
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(clientId)

      if (userError) throw userError

      // Obtener perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', clientId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') throw profileError

      // Combinar datos
      const clientUserData: ClientUser = {
        id: userData.user.id,
        email: userData.user.email || '',
        full_name: profileData?.full_name || userData.user.user_metadata?.full_name || '',
        avatar_url: profileData?.avatar_url || userData.user.user_metadata?.avatar_url || '',
        created_at: userData.user.created_at,
        last_sign_in_at: userData.user.last_sign_in_at,
        status: userData.user.banned ? 'suspended' : (userData.user.email_confirmed_at ? 'active' : 'pending'),
        role: profileData?.role || 'user'
      }

      setClientUser(clientUserData)

      // Cargar rutinas de entrenamiento
      loadWorkoutRoutines(clientId)

      // Cargar planes de nutrición
      loadNutritionPlans(clientId)

      // Cargar registros de sueño
      loadSleepRecords(clientId)

      // Cargar actividades de bienestar
      loadWellnessActivities(clientId)

      // Cargar notas del cliente
      loadClientNotes(clientId)

      // Cargar recomendaciones
      loadRecommendations(clientId)

    } catch (error) {
      console.error("Error al cargar datos del cliente:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del cliente",
        variant: "destructive"
      })
      router.push("/admin/users")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar rutinas de entrenamiento
  const loadWorkoutRoutines = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setWorkoutRoutines(data || [])
    } catch (error) {
      console.error("Error al cargar rutinas:", error)
    }
  }

  // Cargar planes de nutrición
  const loadNutritionPlans = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNutritionPlans(data || [])
    } catch (error) {
      console.error("Error al cargar planes de nutrición:", error)
      // Usar datos de ejemplo si no hay datos reales
      setNutritionPlans([
        {
          id: '1',
          name: 'Plan de nutrición básico',
          description: 'Plan de alimentación equilibrado',
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ])
    }
  }

  // Cargar registros de sueño
  const loadSleepRecords = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('sleep_records')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false })
        .limit(10)

      if (error) throw error

      setSleepRecords(data || [])
    } catch (error) {
      console.error("Error al cargar registros de sueño:", error)
      // Usar datos de ejemplo si no hay datos reales
      setSleepRecords([
        {
          id: '1',
          date: new Date().toISOString(),
          duration: 7.5,
          quality: 4
        }
      ])
    }
  }

  // Cargar actividades de bienestar
  const loadWellnessActivities = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('wellness_activities')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false })
        .limit(10)

      if (error) throw error

      setWellnessActivities(data || [])
    } catch (error) {
      console.error("Error al cargar actividades de bienestar:", error)
      // Usar datos de ejemplo si no hay datos reales
      setWellnessActivities([
        {
          id: '1',
          type: 'meditation',
          name: 'Meditación guiada',
          date: new Date().toISOString(),
          duration: 15
        }
      ])
    }
  }

  // Cargar notas del cliente
  const loadClientNotes = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setClientNotes(data || [])
    } catch (error) {
      console.error("Error al cargar notas del cliente:", error)
      // Usar datos de ejemplo si no hay datos reales
      setClientNotes([])
    }
  }

  // Cargar recomendaciones
  const loadRecommendations = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_recommendations')
        .select('*')
        .eq('user_id', clientId)

      if (error) throw error

      // Organizar recomendaciones por módulo
      const recs: Record<string, string[]> = {
        training: [],
        nutrition: [],
        sleep: [],
        wellness: []
      }

      if (data && data.length > 0) {
        data.forEach(rec => {
          if (rec.module && rec.recommendations) {
            recs[rec.module] = rec.recommendations
          }
        })
      } else {
        // Generar recomendaciones de ejemplo si no hay datos
        recs.training = [
          "Aumentar la frecuencia de entrenamiento a 4 días por semana",
          "Incluir más ejercicios de movilidad en la rutina",
          "Realizar estiramientos después de cada entrenamiento"
        ]
        recs.nutrition = [
          "Añadir más proteínas a la dieta diaria",
          "Incluir más vegetales en la dieta",
          "Aumentar la ingesta de agua diaria"
        ]
        recs.sleep = [
          "Mejorar la calidad del sueño con técnicas de relajación",
          "Establecer una rutina de sueño consistente"
        ]
        recs.wellness = [
          "Incorporar ejercicios de respiración para reducir el estrés",
          "Practicar meditación 10 minutos diarios"
        ]
      }

      setRecommendations(recs)
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
    }
  }

  // Añadir una nueva nota
  const handleAddNote = async () => {
    if (!newNote.trim() || !clientUser) return

    setIsAddingNote(true)

    try {
      const newNoteObj = {
        user_id: clientUser.id,
        content: newNote,
        created_by: user?.id || '',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('client_notes')
        .insert(newNoteObj)
        .select()

      if (error) throw error

      // Actualizar la lista de notas
      setClientNotes([...(data || []), ...clientNotes])
      setNewNote("")

      toast({
        title: "Nota añadida",
        description: "La nota ha sido añadida correctamente"
      })
    } catch (error) {
      console.error("Error al añadir nota:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la nota",
        variant: "destructive"
      })
    } finally {
      setIsAddingNote(false)
    }
  }

  // Añadir una nueva recomendación
  const handleAddRecommendation = async () => {
    if (!newRecommendation.trim() || !clientUser) return

    setIsAddingRecommendation(true)

    try {
      // Actualizar estado local primero
      const updatedRecommendations = { ...recommendations }
      updatedRecommendations[recommendationModule] = [
        ...updatedRecommendations[recommendationModule],
        newRecommendation
      ]

      setRecommendations(updatedRecommendations)

      // Guardar en la base de datos
      const { error } = await supabase
        .from('client_recommendations')
        .upsert({
          user_id: clientUser.id,
          module: recommendationModule,
          recommendations: updatedRecommendations[recommendationModule]
        })

      if (error) throw error

      setNewRecommendation("")
      setIsAddingRecommendation(false)

      toast({
        title: "Recomendación añadida",
        description: "La recomendación ha sido añadida correctamente"
      })
    } catch (error) {
      console.error("Error al añadir recomendación:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la recomendación",
        variant: "destructive"
      })
      setIsAddingRecommendation(false)
    }
  }

  // Editar una recomendación existente
  const handleEditRecommendation = async () => {
    if (!selectedRecommendation || !clientUser) return

    setIsEditingRecommendation(true)

    try {
      // Actualizar estado local primero
      const updatedRecommendations = { ...recommendations }
      updatedRecommendations[selectedRecommendation.module][selectedRecommendation.index] = selectedRecommendation.text

      setRecommendations(updatedRecommendations)

      // Guardar en la base de datos
      const { error } = await supabase
        .from('client_recommendations')
        .upsert({
          user_id: clientUser.id,
          module: selectedRecommendation.module,
          recommendations: updatedRecommendations[selectedRecommendation.module]
        })

      if (error) throw error

      setSelectedRecommendation(null)
      setIsEditingRecommendation(false)

      toast({
        title: "Recomendación actualizada",
        description: "La recomendación ha sido actualizada correctamente"
      })
    } catch (error) {
      console.error("Error al actualizar recomendación:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la recomendación",
        variant: "destructive"
      })
      setIsEditingRecommendation(false)
    }
  }

  // Eliminar una recomendación
  const handleDeleteRecommendation = async (module: string, index: number) => {
    if (!clientUser) return

    try {
      // Actualizar estado local primero
      const updatedRecommendations = { ...recommendations }
      updatedRecommendations[module] = updatedRecommendations[module].filter((_, i) => i !== index)

      setRecommendations(updatedRecommendations)

      // Guardar en la base de datos
      const { error } = await supabase
        .from('client_recommendations')
        .upsert({
          user_id: clientUser.id,
          module: module,
          recommendations: updatedRecommendations[module]
        })

      if (error) throw error

      toast({
        title: "Recomendación eliminada",
        description: "La recomendación ha sido eliminada correctamente"
      })
    } catch (error) {
      console.error("Error al eliminar recomendación:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la recomendación",
        variant: "destructive"
      })
    }
  }

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
          <Card3D>
            <Card3DContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-6 text-center">
                No tienes permisos de administrador para acceder a esta página.
              </p>
              <Button3D onClick={() => router.push("/")}>
                Volver al inicio
              </Button3D>
            </Card3DContent>
          </Card3D>
        </div>
      </RoutinizeLayout>
    )
  }
