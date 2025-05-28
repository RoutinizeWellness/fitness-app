"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/contexts/auth-context"
import { updateUserProfile } from "@/lib/supabase-client"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Settings, CreditCard, HelpCircle, LogOut, Shield, Bell } from "lucide-react"

export default function ProfileTab({ profile, onProfileUpdated }) {
  const { user, signOut, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    weight: profile?.weight || "",
    height: profile?.height || "",
    goal: profile?.goal || "build_muscle",
    level: profile?.level || "intermediate",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await updateUserProfile(user.id, formData)

      if (error) {
        throw error
      }

      await refreshProfile()

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold">{profile?.full_name || "Usuario"}</h2>
                <p className="text-gray-500">{user?.email}</p>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing ? (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="70"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="175"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Objetivo Principal</Label>
                    <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Selecciona un objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="build_muscle">Ganar Músculo</SelectItem>
                        <SelectItem value="lose_weight">Perder Peso</SelectItem>
                        <SelectItem value="improve_fitness">Mejorar Condición Física</SelectItem>
                        <SelectItem value="maintain">Mantener</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel de Experiencia</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="text-lg font-medium">
                        {profile?.weight ? `${profile.weight} kg` : "No especificado"}
                      </p>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Altura</p>
                      <p className="text-lg font-medium">
                        {profile?.height ? `${profile.height} cm` : "No especificado"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Objetivo Principal</p>
                    <p className="text-lg font-medium">
                      {profile?.goal === "build_muscle" && "Ganar Músculo"}
                      {profile?.goal === "lose_weight" && "Perder Peso"}
                      {profile?.goal === "improve_fitness" && "Mejorar Condición Física"}
                      {profile?.goal === "maintain" && "Mantener"}
                      {!profile?.goal && "No especificado"}
                    </p>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Nivel de Experiencia</p>
                    <p className="text-lg font-medium">
                      {profile?.level === "beginner" && "Principiante"}
                      {profile?.level === "intermediate" && "Intermedio"}
                      {profile?.level === "advanced" && "Avanzado"}
                      {!profile?.level && "No especificado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">0</p>
                  <p className="text-xs text-gray-500">Días Consecutivos</p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">0</p>
                  <p className="text-xs text-gray-500">Entrenamientos</p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">0</p>
                  <p className="text-xs text-gray-500">Logros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Ajustes de Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Información Personal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notificaciones
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Suscripción
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacidad y Seguridad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda y Soporte
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-500" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Preferencias de la Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración General
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-gray-500 mt-6">
            <p>Routinize Wellness v1.0.0</p>
            <p className="mt-1">© 2023 Todos los derechos reservados</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
