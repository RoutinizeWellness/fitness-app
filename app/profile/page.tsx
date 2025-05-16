"use client"

import { useState, useEffect } from "react"
import { OrganicLayout, OrganicSection } from "@/components/organic-layout"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Settings,
  LogOut,
  Shield,
  Bell,
  Heart,
  Award,
  Calendar,
  Clock,
  Edit,
  Camera,
  Moon,
  Languages,
  HelpCircle,
  Briefcase,
  Building,
  Activity,
  Brain,
  Save,
  Loader2
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user, profile, refreshProfile, isLoading, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("personal")
  const { toast } = useToast()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Datos personales
  const [personalData, setPersonalData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    bio: ""
  })

  // Datos profesionales
  const [professionalData, setProData] = useState({
    job_title: "",
    company: "",
    industry: "",
    work_type: "", // remoto, presencial, híbrido
    experience_level: "", // junior, mid, senior, director, etc.
    work_hours_per_week: 40,
    work_environment: "", // oficina, coworking, casa, etc.
    stress_level: 5, // 1-10
  })

  // Objetivos y preferencias
  const [goalsData, setGoalsData] = useState({
    primary_goal: "", // perder peso, ganar músculo, mejorar resistencia, reducir estrés, etc.
    secondary_goal: "",
    fitness_level: "", // principiante, intermedio, avanzado
    preferred_workout_time: "", // mañana, mediodía, tarde, noche
    preferred_workout_duration: 30, // minutos
    preferred_workout_days: [] as string[],
    preferred_workout_types: [] as string[],
    dietary_restrictions: [] as string[],
    sleep_goal_hours: 8,
  })

  // Configuración
  const [settingsData, setSettingsData] = useState({
    email_notifications: true,
    push_notifications: true,
    workout_reminders: true,
    meal_reminders: true,
    sleep_reminders: true,
    data_sharing: false,
    dark_mode: false,
    language: "es",
    units: "metric", // metric, imperial
  })

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Cargar datos del perfil cuando esté disponible
  useEffect(() => {
    if (profile) {
      // Datos personales
      setPersonalData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        full_name: profile.full_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        birth_date: profile.birth_date || "",
        gender: profile.gender || "",
        bio: profile.bio || ""
      })

      // Datos profesionales
      setProData({
        job_title: profile.job_title || "",
        company: profile.company || "",
        industry: profile.industry || "",
        work_type: profile.work_type || "",
        experience_level: profile.experience_level || "",
        work_hours_per_week: profile.work_hours_per_week || 40,
        work_environment: profile.work_environment || "",
        stress_level: profile.stress_level || 5,
      })

      // Objetivos y preferencias
      setGoalsData({
        primary_goal: profile.primary_goal || "",
        secondary_goal: profile.secondary_goal || "",
        fitness_level: profile.fitness_level || "",
        preferred_workout_time: profile.preferred_workout_time || "",
        preferred_workout_duration: profile.preferred_workout_duration || 30,
        preferred_workout_days: profile.preferred_workout_days || [],
        preferred_workout_types: profile.preferred_workout_types || [],
        dietary_restrictions: profile.dietary_restrictions || [],
        sleep_goal_hours: profile.sleep_goal_hours || 8,
      })

      // Configuración
      setSettingsData({
        email_notifications: profile.email_notifications !== false,
        push_notifications: profile.push_notifications !== false,
        workout_reminders: profile.workout_reminders !== false,
        meal_reminders: profile.meal_reminders !== false,
        sleep_reminders: profile.sleep_reminders !== false,
        data_sharing: profile.data_sharing === true,
        dark_mode: profile.dark_mode === true,
        language: profile.language || "es",
        units: profile.units || "metric",
      })

      // Avatar
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url)
      }
    }
  }, [profile, user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  const handlePersonalDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPersonalData(prev => ({ ...prev, [name]: value }))
  }

  const handleProDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Determinar a qué conjunto de datos pertenece este campo
    if (name in personalData) {
      setPersonalData(prev => ({ ...prev, [name]: value }))
    } else if (name in professionalData) {
      setProData(prev => ({ ...prev, [name]: value }))
    } else if (name in goalsData) {
      setGoalsData(prev => ({ ...prev, [name]: value }))
    } else if (name in settingsData) {
      setSettingsData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettingsData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    if (name === "stress_level") {
      setProData(prev => ({ ...prev, stress_level: value[0] }))
    } else if (name === "work_hours_per_week") {
      setProData(prev => ({ ...prev, work_hours_per_week: value[0] }))
    } else if (name === "preferred_workout_duration") {
      setGoalsData(prev => ({ ...prev, preferred_workout_duration: value[0] }))
    } else if (name === "sleep_goal_hours") {
      setGoalsData(prev => ({ ...prev, sleep_goal_hours: value[0] }))
    }
  }

  const handleMultiSelectToggle = (name: string, value: string) => {
    setGoalsData(prev => {
      const currentArray = prev[name as keyof typeof goalsData] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [name]: newArray }
    })
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      // Combinar todos los datos
      const updatedProfile = {
        ...personalData,
        ...professionalData,
        ...goalsData,
        ...settingsData,
      }

      // Subir avatar si hay uno nuevo
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, avatarFile)

        if (uploadError) {
          throw uploadError
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath)

        updatedProfile.avatar_url = publicUrl
      }

      // Actualizar perfil en Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()

      if (error) throw error

      // Actualizar el contexto
      await refreshProfile()

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error al cerrar sesión:", error)
        toast({
          title: "Error",
          description: "No se pudo cerrar sesión",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      })

      router.push("/auth/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Opciones de avatar predefinidas
  const avatarOptions = [
    "/avatars/avatar1.svg",
    "/avatars/avatar2.svg",
    "/avatars/avatar3.svg",
    "/avatars/avatar4.svg",
    "/avatars/avatar5.svg",
    "/avatars/avatar6.svg",
    "/avatars/avatar7.svg",
    "/avatars/avatar8.svg",
  ]

  // Estado para el avatar seleccionado
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

  // Actualizar avatar
  const handleUpdateAvatar = async () => {
    if (!user || !selectedAvatar) return

    setIsUpdatingAvatar(true)

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          avatar_url: selectedAvatar
        }
      })

      if (error) {
        throw error
      }

      toast({
        title: "Avatar actualizado",
        description: "Tu avatar ha sido actualizado correctamente",
      })

      // Actualizar el usuario local
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: selectedAvatar
        }
      })
    } catch (error: any) {
      console.error("Error al actualizar el avatar:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el avatar",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  // Renderizar información del perfil
  const renderProfileInfo = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No se pudo cargar la información del perfil</p>
        </div>
      )
    }

    const fullName = user.user_metadata?.full_name || "Usuario"
    const email = user.email || "usuario@ejemplo.com"
    const avatarUrl = user.user_metadata?.avatar_url

    // Inicializar el avatar seleccionado si no está establecido
    if (selectedAvatar === null && avatarUrl) {
      setSelectedAvatar(avatarUrl)
    }

    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-28 w-28" bordered={true} size="xl">
                  <AvatarImage src={selectedAvatar || avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback colorful={true}>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="pill"
                  size="icon"
                  className="absolute bottom-0 right-0 bg-primary text-white shadow-md"
                  onClick={() => document.getElementById('avatar-selector')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-gray-500">{email}</p>

              {isAdmin && (
                <Badge variant="soft" className="mt-2 bg-blue-100 text-blue-700">
                  Administrador
                </Badge>
              )}
            </div>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.1}>
          <Card organic={true} className="p-6" id="avatar-selector">
            <OrganicSection title="Personalizar avatar">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {avatarOptions.map((avatar, index) => (
                  <button
                    key={index}
                    className={`relative rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar ? "border-primary shadow-md scale-110" : "border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-16 h-16 object-cover" />
                  </button>
                ))}
              </div>

              <Button
                variant="pill"
                className="w-full"
                onClick={handleUpdateAvatar}
                disabled={isUpdatingAvatar || selectedAvatar === avatarUrl}
              >
                {isUpdatingAvatar ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </div>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Guardar avatar
                  </>
                )}
              </Button>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.2}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Información personal">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Miembro desde</span>
                  <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.3}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Preferencias">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones</p>
                    <p className="text-sm text-gray-500">Recibir notificaciones de la app</p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo oscuro</p>
                    <p className="text-sm text-gray-500">Activar tema oscuro</p>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Unidades métricas</p>
                    <p className="text-sm text-gray-500">Usar sistema métrico</p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.4}>
          <Button variant="destructive" className="w-full rounded-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </OrganicElement>
      </div>
    )
  }

  // Renderizar estadísticas
  const renderStats = () => {
    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} className="p-6">
            <OrganicSection title="Resumen de actividad">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Entrenamientos</p>
                  <p className="text-xl font-semibold">24</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Días activos</p>
                  <p className="text-xl font-semibold">18</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Racha actual</p>
                  <p className="text-xl font-semibold">5 días</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Mejor racha</p>
                  <p className="text-xl font-semibold">14 días</p>
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.1}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Logros">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-4 mb-3 shadow-sm">
                    <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-sm text-center">Primera semana</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-3 shadow-sm">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-center">10 entrenamientos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 mb-3 shadow-sm">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-center">Racha de 7 días</span>
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.2}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Actividad reciente">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mr-4 shadow-sm">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Entrenamiento completado</p>
                    <p className="text-xs text-gray-500">Hoy, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4 shadow-sm">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Nuevo plan de comidas</p>
                    <p className="text-xs text-gray-500">Ayer, 2:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4 shadow-sm">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Registro de sueño</p>
                    <p className="text-xs text-gray-500">Hace 2 días, 8:00 AM</p>
                  </div>
                </div>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>
      </div>
    )
  }

  // Renderizar configuración
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <OrganicElement type="fade">
          <Card organic={true} className="p-6">
            <OrganicSection title="Cuenta">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-full">
                  <User className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferencias
                </Button>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        <OrganicElement type="fade" delay={0.1}>
          <Card organic={true} className="p-6">
            <OrganicSection title="Aplicación">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Objetivos de salud
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacidad y seguridad
                </Button>
              </div>
            </OrganicSection>
          </Card>
        </OrganicElement>

        {isAdmin && (
          <OrganicElement type="fade" delay={0.2}>
            <Card organic={true} className="p-6">
              <OrganicSection title="Administración">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start rounded-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Panel de administrador
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    Gestionar usuarios
                  </Button>
                </div>
              </OrganicSection>
            </Card>
          </OrganicElement>
        )}

        <OrganicElement type="fade" delay={0.3}>
          <div className="pt-4">
            <Button variant="destructive" className="w-full rounded-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </OrganicElement>
      </div>
    )
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // No mostrar nada si no hay usuario (redirigiendo)
  if (!user) {
    return null
  }

  return (
    <OrganicLayout activeTab="profile" title="Mi Perfil" profile={user}>
      <OrganicElement type="fade">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="md:self-end"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 rounded-full p-1">
              <TabsTrigger value="personal" className="flex items-center gap-2 rounded-full">
                <User className="h-4 w-4" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2 rounded-full">
                <Briefcase className="h-4 w-4" />
                <span>Profesional</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2 rounded-full">
                <Activity className="h-4 w-4" />
                <span>Objetivos</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 rounded-full">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de información personal */}
            <TabsContent value="personal" className="space-y-6">
              <Card organic={true} className="p-6">
                <OrganicSection title="Información básica">
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="relative mb-4">
                        <Avatar className="h-28 w-28" bordered={true} size="xl">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback colorful={true}>{personalData.first_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                          <div className="rounded-full bg-primary text-white p-2 shadow-md">
                            <Camera className="h-4 w-4" />
                          </div>
                          <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">Haz clic en el icono para cambiar tu foto</p>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Nombre</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={personalData.first_name}
                          onChange={handlePersonalDataChange}
                          placeholder="Tu nombre"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name">Apellidos</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={personalData.last_name}
                          onChange={handlePersonalDataChange}
                          placeholder="Tus apellidos"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={personalData.email}
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={personalData.phone}
                          onChange={handlePersonalDataChange}
                          placeholder="Tu número de teléfono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                        <Input
                          id="birth_date"
                          name="birth_date"
                          type="date"
                          value={personalData.birth_date}
                          onChange={handlePersonalDataChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select
                          value={personalData.gender}
                          onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Femenino</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefiero no decirlo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={personalData.bio}
                      onChange={handlePersonalDataChange}
                      placeholder="Cuéntanos un poco sobre ti..."
                      rows={4}
                    />
                  </div>
                </OrganicSection>
              </Card>
            </TabsContent>

            {/* Pestaña de información profesional */}
            <TabsContent value="professional" className="space-y-6">
              <Card organic={true} className="p-6">
                <OrganicSection title="Información profesional">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Puesto de trabajo</Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={professionalData.job_title}
                        onChange={handleProDataChange}
                        placeholder="Tu puesto actual"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        value={professionalData.company}
                        onChange={handleProDataChange}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Sector</Label>
                      <Select
                        value={professionalData.industry}
                        onValueChange={(value) => handleSelectChange("industry", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Tecnología</SelectItem>
                          <SelectItem value="healthcare">Salud</SelectItem>
                          <SelectItem value="finance">Finanzas</SelectItem>
                          <SelectItem value="education">Educación</SelectItem>
                          <SelectItem value="retail">Comercio</SelectItem>
                          <SelectItem value="manufacturing">Fabricación</SelectItem>
                          <SelectItem value="services">Servicios</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work_type">Tipo de trabajo</Label>
                      <Select
                        value={professionalData.work_type}
                        onValueChange={(value) => handleSelectChange("work_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de trabajo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remoto</SelectItem>
                          <SelectItem value="office">Presencial</SelectItem>
                          <SelectItem value="hybrid">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Nivel de experiencia</Label>
                      <Select
                        value={professionalData.experience_level}
                        onValueChange={(value) => handleSelectChange("experience_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Junior</SelectItem>
                          <SelectItem value="mid">Intermedio</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Líder</SelectItem>
                          <SelectItem value="executive">Directivo</SelectItem>
                          <SelectItem value="entrepreneur">Emprendedor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="work_environment">Entorno de trabajo</Label>
                      <Select
                        value={professionalData.work_environment}
                        onValueChange={(value) => handleSelectChange("work_environment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu entorno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporate_office">Oficina corporativa</SelectItem>
                          <SelectItem value="home_office">Oficina en casa</SelectItem>
                          <SelectItem value="coworking">Coworking</SelectItem>
                          <SelectItem value="travel">Viajando frecuentemente</SelectItem>
                          <SelectItem value="mixed">Entorno mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Horas de trabajo semanales: {professionalData.work_hours_per_week}</Label>
                      <Slider
                        value={[professionalData.work_hours_per_week]}
                        min={10}
                        max={80}
                        step={1}
                        onValueChange={(value) => handleSliderChange("work_hours_per_week", value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Nivel de estrés laboral: {professionalData.stress_level}/10</Label>
                      <Slider
                        value={[professionalData.stress_level]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => handleSliderChange("stress_level", value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </OrganicSection>
              </Card>
            </TabsContent>

            {/* Pestaña de objetivos */}
            <TabsContent value="goals" className="space-y-6">
              <Card organic={true} className="p-6">
                <OrganicSection title="Objetivos y preferencias">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary_goal">Objetivo principal</Label>
                      <Select
                        value={goalsData.primary_goal}
                        onValueChange={(value) => handleSelectChange("primary_goal", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu objetivo principal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Perder peso</SelectItem>
                          <SelectItem value="muscle_gain">Ganar músculo</SelectItem>
                          <SelectItem value="improve_fitness">Mejorar condición física</SelectItem>
                          <SelectItem value="reduce_stress">Reducir estrés</SelectItem>
                          <SelectItem value="improve_sleep">Mejorar calidad del sueño</SelectItem>
                          <SelectItem value="increase_energy">Aumentar energía</SelectItem>
                          <SelectItem value="improve_health">Mejorar salud general</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_goal">Objetivo secundario</Label>
                      <Select
                        value={goalsData.secondary_goal}
                        onValueChange={(value) => handleSelectChange("secondary_goal", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu objetivo secundario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Perder peso</SelectItem>
                          <SelectItem value="muscle_gain">Ganar músculo</SelectItem>
                          <SelectItem value="improve_fitness">Mejorar condición física</SelectItem>
                          <SelectItem value="reduce_stress">Reducir estrés</SelectItem>
                          <SelectItem value="improve_sleep">Mejorar calidad del sueño</SelectItem>
                          <SelectItem value="increase_energy">Aumentar energía</SelectItem>
                          <SelectItem value="improve_health">Mejorar salud general</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fitness_level">Nivel de condición física</Label>
                      <Select
                        value={goalsData.fitness_level}
                        onValueChange={(value) => handleSelectChange("fitness_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_workout_time">Horario preferido</Label>
                      <Select
                        value={goalsData.preferred_workout_time}
                        onValueChange={(value) => handleSelectChange("preferred_workout_time", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu horario preferido" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="early_morning">Temprano en la mañana (5-8am)</SelectItem>
                          <SelectItem value="morning">Mañana (8-12pm)</SelectItem>
                          <SelectItem value="afternoon">Tarde (12-5pm)</SelectItem>
                          <SelectItem value="evening">Noche (5-8pm)</SelectItem>
                          <SelectItem value="late_evening">Tarde noche (8-11pm)</SelectItem>
                          <SelectItem value="flexible">Horario flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <Label>Duración preferida de entrenamiento: {goalsData.preferred_workout_duration} minutos</Label>
                      <Slider
                        value={[goalsData.preferred_workout_duration]}
                        min={10}
                        max={120}
                        step={5}
                        onValueChange={(value) => handleSliderChange("preferred_workout_duration", value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Objetivo de horas de sueño: {goalsData.sleep_goal_hours} horas</Label>
                      <Slider
                        value={[goalsData.sleep_goal_hours]}
                        min={5}
                        max={10}
                        step={0.5}
                        onValueChange={(value) => handleSliderChange("sleep_goal_hours", value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Días preferidos para entrenar</Label>
                      <div className="flex flex-wrap gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const isSelected = goalsData.preferred_workout_days.includes(day)
                          return (
                            <Badge
                              key={day}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleMultiSelectToggle("preferred_workout_days", day)}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Tipos de entrenamiento preferidos</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'strength', label: 'Fuerza' },
                          { id: 'cardio', label: 'Cardio' },
                          { id: 'hiit', label: 'HIIT' },
                          { id: 'yoga', label: 'Yoga' },
                          { id: 'pilates', label: 'Pilates' },
                          { id: 'functional', label: 'Funcional' },
                          { id: 'crossfit', label: 'CrossFit' },
                          { id: 'calisthenics', label: 'Calistenia' }
                        ].map((type) => {
                          const isSelected = goalsData.preferred_workout_types.includes(type.id)
                          return (
                            <Badge
                              key={type.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleMultiSelectToggle("preferred_workout_types", type.id)}
                            >
                              {type.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Restricciones alimentarias</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'vegetarian', label: 'Vegetariano' },
                          { id: 'vegan', label: 'Vegano' },
                          { id: 'gluten_free', label: 'Sin gluten' },
                          { id: 'lactose_free', label: 'Sin lactosa' },
                          { id: 'keto', label: 'Keto' },
                          { id: 'paleo', label: 'Paleo' },
                          { id: 'low_carb', label: 'Bajo en carbohidratos' },
                          { id: 'no_restrictions', label: 'Sin restricciones' }
                        ].map((restriction) => {
                          const isSelected = goalsData.dietary_restrictions.includes(restriction.id)
                          return (
                            <Badge
                              key={restriction.id}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleMultiSelectToggle("dietary_restrictions", restriction.id)}
                            >
                              {restriction.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </OrganicSection>
              </Card>
            </TabsContent>

            {/* Pestaña de configuración */}
            <TabsContent value="settings" className="space-y-6">
              <Card organic={true} className="p-6">
                <OrganicSection title="Notificaciones">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificaciones por email</p>
                        <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                      </div>
                      <Switch
                        checked={settingsData.email_notifications}
                        onCheckedChange={(checked) => handleSwitchChange("email_notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificaciones push</p>
                        <p className="text-sm text-gray-500">Recibir notificaciones en el dispositivo</p>
                      </div>
                      <Switch
                        checked={settingsData.push_notifications}
                        onCheckedChange={(checked) => handleSwitchChange("push_notifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recordatorios de entrenamiento</p>
                        <p className="text-sm text-gray-500">Recibir recordatorios para tus entrenamientos</p>
                      </div>
                      <Switch
                        checked={settingsData.workout_reminders}
                        onCheckedChange={(checked) => handleSwitchChange("workout_reminders", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recordatorios de comidas</p>
                        <p className="text-sm text-gray-500">Recibir recordatorios para tus comidas</p>
                      </div>
                      <Switch
                        checked={settingsData.meal_reminders}
                        onCheckedChange={(checked) => handleSwitchChange("meal_reminders", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recordatorios de sueño</p>
                        <p className="text-sm text-gray-500">Recibir recordatorios para tu hora de dormir</p>
                      </div>
                      <Switch
                        checked={settingsData.sleep_reminders}
                        onCheckedChange={(checked) => handleSwitchChange("sleep_reminders", checked)}
                      />
                    </div>
                  </div>
                </OrganicSection>
              </Card>

              <Card organic={true} className="p-6">
                <OrganicSection title="Preferencias de la aplicación">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Modo oscuro</p>
                        <p className="text-sm text-gray-500">Activar tema oscuro</p>
                      </div>
                      <Switch
                        checked={settingsData.dark_mode}
                        onCheckedChange={(checked) => handleSwitchChange("dark_mode", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={settingsData.language}
                        onValueChange={(value) => handleSelectChange("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="units">Unidades</Label>
                      <Select
                        value={settingsData.units}
                        onValueChange={(value) => handleSelectChange("units", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el sistema de unidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Métrico (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compartir datos anónimos</p>
                        <p className="text-sm text-gray-500">Ayúdanos a mejorar compartiendo datos anónimos de uso</p>
                      </div>
                      <Switch
                        checked={settingsData.data_sharing}
                        onCheckedChange={(checked) => handleSwitchChange("data_sharing", checked)}
                      />
                    </div>
                  </div>
                </OrganicSection>
              </Card>

              <Card organic={true} className="p-6">
                <OrganicSection title="Cuenta">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start rounded-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Cambiar contraseña
                    </Button>

                    <Button variant="destructive" className="w-full rounded-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </Button>
                  </div>
                </OrganicSection>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </OrganicElement>
    </OrganicLayout>
  )
}
