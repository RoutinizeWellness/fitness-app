"use client"

import { useState } from "react"
import { EnhancedOrganicLayout } from "@/components/enhanced-organic-layout"
import { OrganicThemeConfigurator } from "@/components/theme/organic-theme-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Palette, 
  Monitor, 
  Moon, 
  Sun, 
  Laptop, 
  Sparkles, 
  Zap, 
  Layers, 
  RefreshCw,
  Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useOrganicTheme } from "@/components/theme/organic-theme-provider"

export default function AppearanceSettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance")
  const { toast } = useToast()
  const { theme, setTheme, animation, setAnimation } = useOrganicTheme()
  
  const resetSettings = () => {
    // Restablecer configuración por defecto
    setTheme("light")
    setAnimation("subtle")
    
    toast({
      title: "Configuración restablecida",
      description: "Se ha restaurado la configuración por defecto",
      variant: "default",
    })
  }
  
  return (
    <EnhancedOrganicLayout
      activeTab="settings"
      title="Apariencia"
      showBackButton={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Personalización</h1>
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Personaliza la apariencia de la aplicación según tus preferencias.
        </p>
        
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="animations">
              <Sparkles className="h-4 w-4 mr-2" />
              Animaciones
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Layers className="h-4 w-4 mr-2" />
              Avanzado
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tema de la aplicación</CardTitle>
                <CardDescription>
                  Elige entre modo claro, oscuro o automático según la configuración del sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-8 w-8" />
                  <span>Claro</span>
                  {theme === "light" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-8 w-8" />
                  <span>Oscuro</span>
                  {theme === "dark" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setTheme("system")}
                >
                  <Laptop className="h-8 w-8" />
                  <span>Sistema</span>
                  {theme === "system" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
            
            <OrganicThemeConfigurator />
          </TabsContent>
          
          <TabsContent value="animations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Animaciones</CardTitle>
                <CardDescription>
                  Configura el nivel de animaciones en la interfaz.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <Button
                  variant={animation === "none" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setAnimation("none")}
                >
                  <div className="h-8 w-8 flex items-center justify-center">🚫</div>
                  <span>Ninguna</span>
                  {animation === "none" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={animation === "subtle" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setAnimation("subtle")}
                >
                  <div className="h-8 w-8 flex items-center justify-center">✨</div>
                  <span>Sutiles</span>
                  {animation === "subtle" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
                
                <Button
                  variant={animation === "playful" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setAnimation("playful")}
                >
                  <div className="h-8 w-8 flex items-center justify-center">🎭</div>
                  <span>Juguetón</span>
                  {animation === "playful" && <Check className="absolute top-2 right-2 h-4 w-4" />}
                </Button>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>
                  Las animaciones pueden afectar al rendimiento en dispositivos antiguos.
                  Si experimentas problemas, considera reducir o desactivar las animaciones.
                </p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ejemplos de animación</CardTitle>
                <CardDescription>
                  Previsualiza cómo se verán las animaciones con tu configuración actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4 h-32 flex items-center justify-center">
                  <div className={`w-16 h-16 bg-primary rounded-full ${
                    animation === "none" ? "" : 
                    animation === "subtle" ? "animate-pulse" : 
                    "animate-bounce"
                  }`}></div>
                </div>
                
                <div className="bg-muted rounded-xl p-4 h-32 flex items-center justify-center">
                  <div className={`w-16 h-16 bg-gradient-primary rounded-xl ${
                    animation === "none" ? "" : 
                    animation === "subtle" ? "animate-pulse" : 
                    "animate-spin"
                  }`}></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración avanzada</CardTitle>
                <CardDescription>
                  Opciones adicionales para personalizar la interfaz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">Reducir movimiento</p>
                    <p className="text-sm text-muted-foreground">
                      Minimiza las animaciones para mejorar la accesibilidad
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    data-state={animation === "none" ? "checked" : "unchecked"}
                    onClick={() => setAnimation(animation === "none" ? "subtle" : "none")}
                  >
                    <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                      data-state={animation === "none" ? "checked" : "unchecked"}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">Modo de alto contraste</p>
                    <p className="text-sm text-muted-foreground">
                      Aumenta el contraste para mejorar la legibilidad
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    data-state="unchecked"
                  >
                    <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                      data-state="unchecked"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">Fuente de gran tamaño</p>
                    <p className="text-sm text-muted-foreground">
                      Aumenta el tamaño del texto en toda la aplicación
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    data-state="unchecked"
                  >
                    <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                      data-state="unchecked"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={resetSettings}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restablecer todos los ajustes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedOrganicLayout>
  )
}
