"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User, Calendar, Clock, Dumbbell, Target, Brain, Heart,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Edit, Save, X, Settings, BarChart3, Activity,
  MapPin, Phone, Mail, Shield, Award, Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { UserAdaptiveProfile, updateUserAdaptiveProfile } from "@/lib/adaptive-routine-engine"
import { useToast } from "@/components/ui/use-toast"

interface UserDetailViewProps {
  user: any
  onClose: () => void
  onUserUpdated: (updatedUser: any) => void
}

interface EditableProfile extends UserAdaptiveProfile {
  personalInfo: {
    fullName: string
    email: string
    phone?: string
    dateOfBirth?: string
    location?: string
    emergencyContact?: string
  }
  preferences: {
    notifications: boolean
    dataSharing: boolean
    publicProfile: boolean
    language: string
    timezone: string
  }
  adminNotes: string
}

export function UserDetailView({ user, onClose, onUserUpdated }: UserDetailViewProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    ...user.adaptiveProfile,
    personalInfo: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      location: user.location || '',
      emergencyContact: user.emergencyContact || ''
    },
    preferences: {
      notifications: user.preferences?.notifications ?? true,
      dataSharing: user.preferences?.dataSharing ?? false,
      publicProfile: user.preferences?.publicProfile ?? false,
      language: user.preferences?.language || 'es',
      timezone: user.preferences?.timezone || 'Europe/Madrid'
    },
    adminNotes: user.adminNotes || ''
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Actualizar perfil adaptativo
      const success = await updateUserAdaptiveProfile(user.id, {
        experienceLevel: editableProfile.experienceLevel,
        fitnessGoals: editableProfile.fitnessGoals,
        availableEquipment: editableProfile.availableEquipment,
        timeConstraints: editableProfile.timeConstraints,
        physicalLimitations: editableProfile.physicalLimitations,
        preferredExerciseTypes: editableProfile.preferredExerciseTypes,
        avoidedExercises: editableProfile.avoidedExercises,
        progressionPreferences: editableProfile.progressionPreferences,
        recoveryCapacity: editableProfile.recoveryCapacity,
        motivationLevel: editableProfile.motivationLevel
      })

      if (success) {
        // Actualizar información personal y preferencias
        // (esto requeriría endpoints adicionales en Supabase)
        
        toast({
          title: "Perfil Actualizado",
          description: "Los cambios se han guardado correctamente",
        })
        
        setIsEditing(false)
        onUserUpdated({ ...user, adaptiveProfile: editableProfile })
      } else {
        throw new Error('Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditableProfile({
      ...user.adaptiveProfile,
      personalInfo: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        location: user.location || '',
        emergencyContact: user.emergencyContact || ''
      },
      preferences: {
        notifications: user.preferences?.notifications ?? true,
        dataSharing: user.preferences?.dataSharing ?? false,
        publicProfile: user.preferences?.publicProfile ?? false,
        language: user.preferences?.language || 'es',
        timezone: user.preferences?.timezone || 'Europe/Madrid'
      },
      adminNotes: user.adminNotes || ''
    })
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFatigueColor = (fatigue: number) => {
    if (fatigue <= 40) return 'text-green-600'
    if (fatigue <= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <Badge className={getStatusColor(user.status)}>
                {user.status === 'active' ? 'Activo' :
                 user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <SafeClientButton
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </SafeClientButton>
                <SafeClientButton
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </SafeClientButton>
              </>
            ) : (
              <SafeClientButton
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </SafeClientButton>
            )}
            <SafeClientButton variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </SafeClientButton>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="profile">Perfil Adaptativo</TabsTrigger>
              <TabsTrigger value="progress">Progreso</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Tab: Resumen */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Miembro desde</p>
                          <p className="text-lg font-bold text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Dumbbell className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
                          <p className="text-lg font-bold text-gray-900">
                            {user.progressMetrics?.totalWorkouts || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Adherencia</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(user.progressMetrics?.adherenceRate || 0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Brain className="h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Fatiga</p>
                          <p className={`text-lg font-bold ${getFatigueColor(user.progressMetrics?.avgFatigue || 50)}`}>
                            {Math.round(user.progressMetrics?.avgFatigue || 50)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Información personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre Completo</Label>
                        {isEditing ? (
                          <Input
                            value={editableProfile.personalInfo.fullName}
                            onChange={(e) => setEditableProfile(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            }))}
                          />
                        ) : (
                          <p className="text-gray-900">{user.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Email</Label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      
                      <div>
                        <Label>Teléfono</Label>
                        {isEditing ? (
                          <Input
                            value={editableProfile.personalInfo.phone}
                            onChange={(e) => setEditableProfile(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                          />
                        ) : (
                          <p className="text-gray-900">{user.phone || 'No especificado'}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Ubicación</Label>
                        {isEditing ? (
                          <Input
                            value={editableProfile.personalInfo.location}
                            onChange={(e) => setEditableProfile(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                          />
                        ) : (
                          <p className="text-gray-900">{user.location || 'No especificado'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estado actual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Estado Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Adherencia</span>
                          <span className="text-sm text-gray-600">
                            {Math.round(user.progressMetrics?.adherenceRate || 0)}%
                          </span>
                        </div>
                        <Progress value={user.progressMetrics?.adherenceRate || 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Nivel de Fatiga</span>
                          <span className={`text-sm font-medium ${getFatigueColor(user.progressMetrics?.avgFatigue || 50)}`}>
                            {Math.round(user.progressMetrics?.avgFatigue || 50)}/100
                          </span>
                        </div>
                        <Progress 
                          value={user.progressMetrics?.avgFatigue || 50} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tendencia de Progreso</span>
                          <div className="flex items-center">
                            {getProgressIcon(user.progressMetrics?.progressTrend || 'stable')}
                            <span className="ml-2 text-sm">
                              {user.progressMetrics?.progressTrend === 'improving' ? 'Mejorando' :
                               user.progressMetrics?.progressTrend === 'declining' ? 'Declinando' : 'Estable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Perfil Adaptativo */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Perfil Adaptativo</CardTitle>
                    <CardDescription>
                      Ajusta los parámetros que determinan cómo se adaptan las rutinas para este usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nivel de experiencia */}
                    <div>
                      <Label>Nivel de Experiencia</Label>
                      {isEditing ? (
                        <Select
                          value={editableProfile.experienceLevel}
                          onValueChange={(value: any) => setEditableProfile(prev => ({
                            ...prev,
                            experienceLevel: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Principiante</SelectItem>
                            <SelectItem value="intermediate">Intermedio</SelectItem>
                            <SelectItem value="advanced">Avanzado</SelectItem>
                            <SelectItem value="expert">Experto</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-900 capitalize">
                          {user.adaptiveProfile?.experienceLevel || 'No definido'}
                        </p>
                      )}
                    </div>

                    {/* Objetivos de fitness */}
                    <div>
                      <Label>Objetivos de Fitness</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(user.adaptiveProfile?.fitnessGoals || []).map((goal: string) => (
                          <Badge key={goal} variant="outline">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Capacidad de recuperación */}
                    <div>
                      <Label>Capacidad de Recuperación (1-10)</Label>
                      {isEditing ? (
                        <div className="mt-2">
                          <Slider
                            value={[editableProfile.recoveryCapacity || 7]}
                            onValueChange={([value]) => setEditableProfile(prev => ({
                              ...prev,
                              recoveryCapacity: value
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Baja</span>
                            <span>Alta</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {user.adaptiveProfile?.recoveryCapacity || 7}/10
                        </p>
                      )}
                    </div>

                    {/* Nivel de motivación */}
                    <div>
                      <Label>Nivel de Motivación (1-10)</Label>
                      {isEditing ? (
                        <div className="mt-2">
                          <Slider
                            value={[editableProfile.motivationLevel || 7]}
                            onValueChange={([value]) => setEditableProfile(prev => ({
                              ...prev,
                              motivationLevel: value
                            }))}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Baja</span>
                            <span>Alta</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {user.adaptiveProfile?.motivationLevel || 7}/10
                        </p>
                      )}
                    </div>

                    {/* Limitaciones de tiempo */}
                    <div>
                      <Label>Limitaciones de Tiempo</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label className="text-sm">Sesiones por semana</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              max="7"
                              value={editableProfile.timeConstraints?.sessionsPerWeek || 3}
                              onChange={(e) => setEditableProfile(prev => ({
                                ...prev,
                                timeConstraints: {
                                  ...prev.timeConstraints,
                                  sessionsPerWeek: parseInt(e.target.value)
                                }
                              }))}
                            />
                          ) : (
                            <p className="text-gray-900">
                              {user.adaptiveProfile?.timeConstraints?.sessionsPerWeek || 3}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-sm">Minutos por sesión</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="15"
                              max="180"
                              value={editableProfile.timeConstraints?.minutesPerSession || 60}
                              onChange={(e) => setEditableProfile(prev => ({
                                ...prev,
                                timeConstraints: {
                                  ...prev.timeConstraints,
                                  minutesPerSession: parseInt(e.target.value)
                                }
                              }))}
                            />
                          ) : (
                            <p className="text-gray-900">
                              {user.adaptiveProfile?.timeConstraints?.minutesPerSession || 60}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Equipamiento disponible */}
                    <div>
                      <Label>Equipamiento Disponible</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(user.adaptiveProfile?.availableEquipment || []).map((equipment: string) => (
                          <Badge key={equipment} variant="outline">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Progreso */}
              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Progreso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Gráficos de progreso y análisis detallado próximamente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Configuración */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferencias del Usuario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones</Label>
                        <p className="text-sm text-gray-600">Recibir notificaciones de la aplicación</p>
                      </div>
                      <Switch
                        checked={editableProfile.preferences.notifications}
                        onCheckedChange={(checked) => setEditableProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, notifications: checked }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compartir Datos</Label>
                        <p className="text-sm text-gray-600">Permitir uso de datos para investigación</p>
                      </div>
                      <Switch
                        checked={editableProfile.preferences.dataSharing}
                        onCheckedChange={(checked) => setEditableProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, dataSharing: checked }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Perfil Público</Label>
                        <p className="text-sm text-gray-600">Hacer visible el perfil a otros usuarios</p>
                      </div>
                      <Switch
                        checked={editableProfile.preferences.publicProfile}
                        onCheckedChange={(checked) => setEditableProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, publicProfile: checked }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Admin */}
              <TabsContent value="admin" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Notas de Administrador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        placeholder="Notas internas sobre el usuario..."
                        value={editableProfile.adminNotes}
                        onChange={(e) => setEditableProfile(prev => ({
                          ...prev,
                          adminNotes: e.target.value
                        }))}
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {user.adminNotes || 'Sin notas administrativas'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Administrativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SafeClientButton variant="outline" className="justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Resetear Configuración
                      </SafeClientButton>
                      
                      <SafeClientButton variant="outline" className="justify-start">
                        <Zap className="h-4 w-4 mr-2" />
                        Recalcular Métricas
                      </SafeClientButton>
                      
                      <SafeClientButton variant="outline" className="justify-start">
                        <Award className="h-4 w-4 mr-2" />
                        Otorgar Logro
                      </SafeClientButton>
                      
                      <SafeClientButton variant="destructive" className="justify-start">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Suspender Usuario
                      </SafeClientButton>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}
