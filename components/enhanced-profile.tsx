"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth/auth-context"
import { updateUserProfile, getUserProfile, createUserProfile } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Settings, CreditCard, HelpCircle, LogOut, Shield, Bell, Camera, Save, Edit3 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function EnhancedProfile() {
  const { user, signOut, refreshProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: "",
    weight: "",
    height: "",
    goal: "build_muscle",
    level: "intermediate",
    bio: "",
    age: "",
    gender: "",
    preferences: {
      notifications: true,
      darkMode: false,
      publicProfile: false
    }
  })

  // Cargar perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        console.log("Cargando perfil para usuario:", user.id)

        const { data, error } = await getUserProfile(user.id)

        console.log("Respuesta de getUserProfile:", { data, error })

        if (error) {
          console.error("Error al cargar perfil:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar tu perfil",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (data) {
          console.log("Perfil cargado correctamente:", data)
          setProfile(data)

          // Convertir valores numéricos a string para los inputs
          const weightStr = data.weight !== null ? String(data.weight) : ""
          const heightStr = data.height !== null ? String(data.height) : ""
          const ageStr = data.age !== null ? String(data.age) : ""

          setFormData({
            full_name: data.full_name || "",
            weight: weightStr,
            height: heightStr,
            goal: data.goal || "build_muscle",
            level: data.level || "intermediate",
            bio: data.bio || "",
            age: ageStr,
            gender: data.gender || "",
            preferences: {
              notifications: data.preferences?.notifications !== false,
              darkMode: data.preferences?.darkMode || false,
              publicProfile: data.preferences?.publicProfile || false
            }
          })

          console.log("Formulario inicializado con:", {
            full_name: data.full_name || "",
            weight: weightStr,
            height: heightStr,
            goal: data.goal || "build_muscle",
            level: data.level || "intermediate",
            bio: data.bio || "",
            age: ageStr,
            gender: data.gender || "",
          })
        } else {
          console.error("No se recibieron datos del perfil")
          toast({
            title: "Advertencia",
            description: "No se pudo cargar tu perfil completo",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error inesperado al cargar perfil:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado al cargar tu perfil",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, toast])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar cambios en selects
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar cambios en preferencias
  const handlePreferenceChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }))
  }

  // Guardar cambios del perfil
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Iniciando actualización de perfil para usuario:", user?.id)

      // Validar datos del formulario
      if (!formData.full_name || !formData.full_name.trim()) {
        toast({
          title: "Error",
          description: "El nombre es obligatorio",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Convertir valores numéricos
      const processedFormData = {
        ...formData,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        age: formData.age ? Number(formData.age) : null
      }

      // Preparar los datos del perfil
      const profileData = {
        ...processedFormData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      console.log("Datos del perfil a actualizar:", profileData)

      // Actualizar el perfil directamente usando la función mejorada
      const { data, error } = await updateUserProfile(user.id, profileData)

      console.log("Respuesta de updateUserProfile:", { data, error })

      if (error) {
        console.error("Error al actualizar perfil:", error)
        toast({
          title: "Error",
          description: typeof error === 'string' ? error : "No se pudo actualizar el perfil",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // La función updateUserProfile siempre devuelve datos (reales o simulados)
      await refreshProfile()

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error inesperado al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al actualizar tu perfil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular IMC
  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return null

    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height) / 100 // convertir cm a m

    if (isNaN(weight) || isNaN(height) || height === 0) return null

    const bmi = weight / (height * height)
    return bmi.toFixed(1)
  }

  // Obtener categoría de IMC
  const getBMICategory = (bmi) => {
    if (!bmi) return null

    const numBmi = parseFloat(bmi)

    if (numBmi < 18.5) return { label: "Bajo peso", color: "blue" }
    if (numBmi < 25) return { label: "Peso normal", color: "green" }
    if (numBmi < 30) return { label: "Sobrepeso", color: "yellow" }
    return { label: "Obesidad", color: "red" }
  }

  const bmi = calculateBMI()
  const bmiCategory = getBMICategory(bmi)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <CardContent className="pt-0 relative">
              <div className="flex flex-col items-center -mt-16">
                <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-4xl">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-0 right-4 rounded-full h-8 w-8 bg-white"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <h2 className="mt-4 text-2xl font-bold">{profile?.full_name || "Usuario"}</h2>
                <p className="text-gray-500">{user?.email}</p>

                {profile?.bio && (
                  <p className="text-center mt-4 text-gray-700">{profile.bio}</p>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Nivel</p>
                    <p className="font-medium">{profile?.level === "beginner" ? "Principiante" :
                      profile?.level === "intermediate" ? "Intermedio" :
                      profile?.level === "advanced" ? "Avanzado" : "No especificado"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-medium">{profile?.weight ? `${profile.weight} kg` : "-"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Altura</p>
                    <p className="font-medium">{profile?.height ? `${profile.height} cm` : "-"}</p>
                  </div>
                </div>

                {bmi && (
                  <div className="mt-6 w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">IMC</p>
                      <Badge className={`bg-${bmiCategory.color}-100 text-${bmiCategory.color}-800`}>
                        {bmiCategory.label}
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${bmiCategory.color}-500`}
                        style={{ width: `${Math.min(100, (parseFloat(bmi) / 40) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-center mt-1 font-medium">{bmi}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>Actualiza tu información personal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Edad</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Edad"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange("gender", value)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Peso en kg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Altura en cm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Cuéntanos sobre ti"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Objetivo principal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => handleSelectChange("goal", value)}
                    >
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Selecciona un objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose_weight">Perder peso</SelectItem>
                        <SelectItem value="build_muscle">Ganar músculo</SelectItem>
                        <SelectItem value="improve_fitness">Mejorar condición física</SelectItem>
                        <SelectItem value="maintain">Mantenerme en forma</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel de experiencia</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => handleSelectChange("level", value)}
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de tu actividad y progreso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Actividad reciente</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Entrenamientos</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-sm text-gray-600">Objetivos</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">3</p>
                      <p className="text-sm text-gray-600">Logros</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Progreso</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Fuerza</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Resistencia</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Flexibilidad</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-purple-600 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logros</CardTitle>
              <CardDescription>Tus insignias y reconocimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-center">Primer entrenamiento</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-xs text-center text-gray-400">7 días seguidos</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-center text-gray-400">5 objetivos completados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>Personaliza tu experiencia en la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="font-medium">Notificaciones</Label>
                    <p className="text-sm text-gray-500">Recibe alertas sobre tu actividad</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.preferences.notifications}
                    onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="font-medium">Modo oscuro</Label>
                    <p className="text-sm text-gray-500">Cambia la apariencia de la aplicación</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={formData.preferences.darkMode}
                    onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicProfile" className="font-medium">Perfil público</Label>
                    <p className="text-sm text-gray-500">Permite que otros usuarios vean tu perfil</p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={formData.preferences.publicProfile}
                    onCheckedChange={(checked) => handlePreferenceChange("publicProfile", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar preferencias"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>Gestiona tu cuenta y seguridad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Cambiar correo electrónico
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda y soporte
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
