"use client"

import { useState, useEffect } from "react"
import { 
  User, Settings, Save, ArrowLeft,
  Camera, Upload, Trash, AlertCircle
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar3D, Avatar3DImage, Avatar3DFallback } from "@/components/ui/avatar-3d"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { User as UserType } from "@supabase/supabase-js"
import { updateUserProfile } from "@/lib/supabase-client"

interface ProfileSettingsProps {
  profile: UserType | null
  isLoading?: boolean
  onSave?: () => void
  onCancel?: () => void
}

export function ProfileSettings({
  profile,
  isLoading = false,
  onSave,
  onCancel
}: ProfileSettingsProps) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    fullName: profile?.user_metadata?.full_name || "",
    weight: profile?.user_metadata?.weight || 70,
    height: profile?.user_metadata?.height || 170,
    goal: profile?.user_metadata?.goal || "maintain",
    level: profile?.user_metadata?.level || "intermediate",
    age: profile?.user_metadata?.age || 30,
    gender: profile?.user_metadata?.gender || "other",
    bio: profile?.user_metadata?.bio || "",
    preferredEquipment: profile?.user_metadata?.preferred_equipment || ["barbell", "dumbbell", "bodyweight"],
    trainingFrequency: profile?.user_metadata?.training_frequency || 3,
    availableTime: profile?.user_metadata?.available_time || 60,
    notificationsEnabled: profile?.user_metadata?.notifications_enabled !== false,
    darkMode: profile?.user_metadata?.dark_mode || false
  })
  
  // Estado para el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  
  // Manejar cambios en los campos del formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!profile) return
    
    setIsSubmitting(true)
    
    try {
      // Preparar los datos para actualizar
      const userData = {
        user_metadata: {
          ...profile.user_metadata,
          full_name: formData.fullName,
          weight: formData.weight,
          height: formData.height,
          goal: formData.goal,
          level: formData.level,
          age: formData.age,
          gender: formData.gender,
          bio: formData.bio,
          preferred_equipment: formData.preferredEquipment,
          training_frequency: formData.trainingFrequency,
          available_time: formData.availableTime,
          notifications_enabled: formData.notificationsEnabled,
          dark_mode: formData.darkMode
        }
      }
      
      // Actualizar el perfil
      const { error } = await updateUserProfile(profile.id, userData)
      
      if (error) {
        console.error('Error al actualizar perfil:', error)
        toast({
          title: 'Error al guardar',
          description: 'No se pudo actualizar tu perfil. Inténtalo de nuevo.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Perfil actualizado',
          description: 'Tu perfil ha sido actualizado correctamente.',
          variant: 'default'
        })
        
        if (onSave) onSave()
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast({
        title: 'Error al guardar',
        description: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Renderizar la pestaña de información personal
  const renderPersonalTab = () => (
    <div className="space-y-6">
      <Card3D className="p-6">
        <Card3DHeader>
          <Card3DTitle>Información personal</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="space-y-4 pt-4">
          <div className="flex flex-col items-center mb-4">
            <Avatar3D className="h-24 w-24 mb-4">
              <Avatar3DImage src={profile?.user_metadata?.avatar_url || "/placeholder.svg"} />
              <Avatar3DFallback>{formData.fullName.charAt(0) || "U"}</Avatar3DFallback>
            </Avatar3D>
            <Button3D variant="outline" size="sm" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              Cambiar foto
            </Button3D>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input 
              id="fullName" 
              value={formData.fullName} 
              onChange={(e) => handleChange('fullName', e.target.value)} 
              placeholder="Tu nombre completo" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea 
              id="bio" 
              value={formData.bio} 
              onChange={(e) => handleChange('bio', e.target.value)} 
              placeholder="Cuéntanos sobre ti" 
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input 
                id="age" 
                type="number" 
                value={formData.age} 
                onChange={(e) => handleChange('age', parseInt(e.target.value))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Seleccionar género" />
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input 
                id="weight" 
                type="number" 
                value={formData.weight} 
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input 
                id="height" 
                type="number" 
                value={formData.height} 
                onChange={(e) => handleChange('height', parseFloat(e.target.value))} 
              />
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
  
  // Renderizar la pestaña de entrenamiento
  const renderTrainingTab = () => (
    <div className="space-y-6">
      <Card3D className="p-6">
        <Card3DHeader>
          <Card3DTitle>Preferencias de entrenamiento</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Objetivo principal</Label>
            <Select 
              value={formData.goal} 
              onValueChange={(value) => handleChange('goal', value)}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder="Seleccionar objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="build_muscle">Ganar músculo</SelectItem>
                <SelectItem value="lose_weight">Perder peso</SelectItem>
                <SelectItem value="maintain">Mantener</SelectItem>
                <SelectItem value="improve_strength">Mejorar fuerza</SelectItem>
                <SelectItem value="improve_endurance">Mejorar resistencia</SelectItem>
                <SelectItem value="general_fitness">Fitness general</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="level">Nivel de experiencia</Label>
            <Select 
              value={formData.level} 
              onValueChange={(value) => handleChange('level', value)}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trainingFrequency">Frecuencia de entrenamiento: {formData.trainingFrequency} días/semana</Label>
            <Slider 
              id="trainingFrequency"
              min={1}
              max={7}
              step={1}
              value={[formData.trainingFrequency]}
              onValueChange={(value) => handleChange('trainingFrequency', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availableTime">Tiempo disponible por sesión: {formData.availableTime} minutos</Label>
            <Slider 
              id="availableTime"
              min={15}
              max={120}
              step={5}
              value={[formData.availableTime]}
              onValueChange={(value) => handleChange('availableTime', value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Equipamiento preferido</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "barbell", label: "Barra" },
                { id: "dumbbell", label: "Mancuernas" },
                { id: "machine", label: "Máquinas" },
                { id: "cable", label: "Cables" },
                { id: "bodyweight", label: "Peso corporal" },
                { id: "kettlebell", label: "Kettlebell" }
              ].map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id={`equipment-${item.id}`} 
                    checked={formData.preferredEquipment.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange('preferredEquipment', [...formData.preferredEquipment, item.id])
                      } else {
                        handleChange('preferredEquipment', formData.preferredEquipment.filter(eq => eq !== item.id))
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`equipment-${item.id}`} className="text-sm font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
  
  // Renderizar la pestaña de preferencias
  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <Card3D className="p-6">
        <Card3DHeader>
          <Card3DTitle>Preferencias de la aplicación</Card3DTitle>
        </Card3DHeader>
        <Card3DContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notificationsEnabled">Notificaciones</Label>
              <p className="text-sm text-gray-500">Recibir recordatorios y actualizaciones</p>
            </div>
            <Switch 
              id="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onCheckedChange={(checked) => handleChange('notificationsEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Modo oscuro</Label>
              <p className="text-sm text-gray-500">Cambiar a tema oscuro</p>
            </div>
            <Switch 
              id="darkMode"
              checked={formData.darkMode}
              onCheckedChange={(checked) => handleChange('darkMode', checked)}
            />
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  )
  
  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Configuración de perfil</h2>
        {onCancel && (
          <Button3D variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button3D>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="training">Entrenamiento</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          {renderPersonalTab()}
        </TabsContent>
        
        <TabsContent value="training" className="space-y-4">
          {renderTrainingTab()}
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          {renderPreferencesTab()}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button3D variant="outline" onClick={onCancel}>
            Cancelar
          </Button3D>
        )}
        <Button3D onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button3D>
      </div>
    </div>
  )
}
