"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useAuth } from "@/contexts/auth-context"
import { getEnhancedUserProfile, updateUserPreferences } from "@/lib/services/user-profile-service"
import { UserPreferences } from "@/lib/types/user-profile"
import { 
  Palette, 
  Layout, 
  Bell, 
  Languages, 
  Save, 
  RotateCcw, 
  Monitor, 
  Moon, 
  Sun,
  BarChart3,
  Table,
  Layers
} from "lucide-react"

export function UIPersonalization() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("appearance")
  
  // Estado para las preferencias de UI
  const [uiPreferences, setUiPreferences] = useState<UserPreferences["uiPreferences"]>({
    theme: "system",
    accentColor: "blue",
    dashboardLayout: "detailed",
    notificationsEnabled: true,
    notificationTypes: {
      workout: true,
      nutrition: true,
      wellness: true,
      progress: true,
      tips: true
    },
    language: "es",
    measurementSystem: "metric",
    dataVisualizationPreference: "charts"
  })
  
  // Cargar preferencias del usuario
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])
  
  // Cargar preferencias del usuario desde la base de datos
  const loadUserPreferences = async () => {
    setIsLoading(true)
    
    try {
      const userProfile = await getEnhancedUserProfile(user?.id || "")
      
      if (userProfile && userProfile.preferences.uiPreferences) {
        setUiPreferences(userProfile.preferences.uiPreferences)
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar tus preferencias",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Guardar preferencias del usuario
  const saveUserPreferences = async () => {
    if (!user) return
    
    setIsSaving(true)
    
    try {
      const userProfile = await getEnhancedUserProfile(user.id)
      
      if (!userProfile) {
        throw new Error("No se pudo obtener el perfil del usuario")
      }
      
      // Actualizar solo las preferencias de UI
      const updatedPreferences = {
        ...userProfile.preferences,
        uiPreferences
      }
      
      const success = await updateUserPreferences(user.id, updatedPreferences)
      
      if (success) {
        toast({
          title: "Preferencias guardadas",
          description: "Tus preferencias de interfaz han sido actualizadas",
        })
        
        // Aplicar cambios de tema
        applyThemeChanges(uiPreferences.theme)
        
        // Aplicar cambios de color de acento
        applyAccentColorChanges(uiPreferences.accentColor)
      } else {
        throw new Error("No se pudieron guardar las preferencias")
      }
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar tus preferencias",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Restablecer preferencias predeterminadas
  const resetToDefaults = () => {
    setUiPreferences({
      theme: "system",
      accentColor: "blue",
      dashboardLayout: "detailed",
      notificationsEnabled: true,
      notificationTypes: {
        workout: true,
        nutrition: true,
        wellness: true,
        progress: true,
        tips: true
      },
      language: "es",
      measurementSystem: "metric",
      dataVisualizationPreference: "charts"
    })
    
    toast({
      title: "Preferencias restablecidas",
      description: "Se han restablecido las preferencias predeterminadas",
    })
  }
  
  // Aplicar cambios de tema
  const applyThemeChanges = (theme: string) => {
    const root = document.documentElement
    
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      // Sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }
  
  // Aplicar cambios de color de acento
  const applyAccentColorChanges = (color: string) => {
    // Aquí se implementaría la lógica para cambiar el color de acento
    // Por ejemplo, cambiando variables CSS personalizadas
    console.log("Aplicando color de acento:", color)
  }
  
  // Manejar cambios en las preferencias de notificaciones
  const handleNotificationTypeChange = (type: string, enabled: boolean) => {
    setUiPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: enabled
      }
    }))
  }
  
  // Colores de acento disponibles
  const accentColors = [
    { value: "blue", label: "Azul", color: "#3b82f6" },
    { value: "green", label: "Verde", color: "#10b981" },
    { value: "purple", label: "Púrpura", color: "#8b5cf6" },
    { value: "red", label: "Rojo", color: "#ef4444" },
    { value: "orange", label: "Naranja", color: "#f97316" },
    { value: "pink", label: "Rosa", color: "#ec4899" },
    { value: "teal", label: "Turquesa", color: "#14b8a6" }
  ]
  
  // Idiomas disponibles
  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" }
  ]
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingAnimation />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Diseño
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema y colores</CardTitle>
              <CardDescription>
                Personaliza la apariencia visual de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Tema</Label>
                  <RadioGroup
                    value={uiPreferences.theme}
                    onValueChange={(value) => setUiPreferences({...uiPreferences, theme: value as any})}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="flex items-center">
                        <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                        Claro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="flex items-center">
                        <Moon className="h-4 w-4 mr-2 text-blue-500" />
                        Oscuro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2 text-gray-500" />
                        Sistema
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Color de acento</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        className={`h-10 rounded-md flex items-center justify-center ${
                          uiPreferences.accentColor === color.value 
                            ? "ring-2 ring-offset-2 ring-offset-background ring-primary" 
                            : ""
                        }`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => setUiPreferences({...uiPreferences, accentColor: color.value})}
                        aria-label={`Color ${color.label}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Idioma</Label>
                  <Select
                    value={uiPreferences.language}
                    onValueChange={(value) => setUiPreferences({...uiPreferences, language: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Sistema de medidas</Label>
                  <RadioGroup
                    value={uiPreferences.measurementSystem}
                    onValueChange={(value) => setUiPreferences({...uiPreferences, measurementSystem: value as any})}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="metric" id="system-metric" />
                      <Label htmlFor="system-metric">Métrico (kg, cm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="imperial" id="system-imperial" />
                      <Label htmlFor="system-imperial">Imperial (lb, in)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diseño y visualización</CardTitle>
              <CardDescription>
                Personaliza cómo se muestra la información en la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Diseño del panel</Label>
                  <RadioGroup
                    value={uiPreferences.dashboardLayout}
                    onValueChange={(value) => setUiPreferences({...uiPreferences, dashboardLayout: value as any})}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="layout-compact" />
                      <Label htmlFor="layout-compact" className="flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        Compacto
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="layout-detailed" />
                      <Label htmlFor="layout-detailed" className="flex items-center">
                        <Layout className="h-4 w-4 mr-2" />
                        Detallado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="layout-minimal" />
                      <Label htmlFor="layout-minimal" className="flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        Minimalista
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Visualización de datos</Label>
                  <RadioGroup
                    value={uiPreferences.dataVisualizationPreference}
                    onValueChange={(value) => setUiPreferences({...uiPreferences, dataVisualizationPreference: value as any})}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="charts" id="viz-charts" />
                      <Label htmlFor="viz-charts" className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Gráficos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tables" id="viz-tables" />
                      <Label htmlFor="viz-tables" className="flex items-center">
                        <Table className="h-4 w-4 mr-2" />
                        Tablas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="viz-both" />
                      <Label htmlFor="viz-both" className="flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        Ambos
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Densidad de contenido</Label>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[50]}
                      max={100}
                      step={25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Compacto</span>
                      <span>Espaciado</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
              <CardDescription>
                Configura qué notificaciones quieres recibir y cómo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled" className="text-base">Notificaciones</Label>
                <Switch
                  id="notifications-enabled"
                  checked={uiPreferences.notificationsEnabled}
                  onCheckedChange={(checked) => setUiPreferences({...uiPreferences, notificationsEnabled: checked})}
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-base">Tipos de notificaciones</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-workout" className="flex-1">Entrenamientos</Label>
                    <Switch
                      id="notification-workout"
                      checked={uiPreferences.notificationTypes.workout}
                      onCheckedChange={(checked) => handleNotificationTypeChange("workout", checked)}
                      disabled={!uiPreferences.notificationsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios de entrenamientos y logros
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-nutrition" className="flex-1">Nutrición</Label>
                    <Switch
                      id="notification-nutrition"
                      checked={uiPreferences.notificationTypes.nutrition}
                      onCheckedChange={(checked) => handleNotificationTypeChange("nutrition", checked)}
                      disabled={!uiPreferences.notificationsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios de comidas y seguimiento nutricional
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-wellness" className="flex-1">Bienestar</Label>
                    <Switch
                      id="notification-wellness"
                      checked={uiPreferences.notificationTypes.wellness}
                      onCheckedChange={(checked) => handleNotificationTypeChange("wellness", checked)}
                      disabled={!uiPreferences.notificationsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios de meditación y actividades de bienestar
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-progress" className="flex-1">Progreso</Label>
                    <Switch
                      id="notification-progress"
                      checked={uiPreferences.notificationTypes.progress}
                      onCheckedChange={(checked) => handleNotificationTypeChange("progress", checked)}
                      disabled={!uiPreferences.notificationsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Actualizaciones sobre tu progreso y estadísticas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notification-tips" className="flex-1">Consejos</Label>
                    <Switch
                      id="notification-tips"
                      checked={uiPreferences.notificationTypes.tips}
                      onCheckedChange={(checked) => handleNotificationTypeChange("tips", checked)}
                      disabled={!uiPreferences.notificationsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consejos personalizados y recomendaciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        
        <Button onClick={saveUserPreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <LoadingAnimation size="sm" type="spinner" showText={false} className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
