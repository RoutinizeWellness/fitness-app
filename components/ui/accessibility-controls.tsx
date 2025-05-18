"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Eye, 
  Type, 
  MousePointer, 
  Contrast, 
  Sparkles, 
  RotateCcw, 
  Check
} from "lucide-react"

interface AccessibilitySettings {
  fontSize: number
  contrastMode: "default" | "high" | "dark" | "light"
  reduceMotion: boolean
  largePointer: boolean
  focusHighlight: boolean
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100, // percentage
  contrastMode: "default",
  reduceMotion: false,
  largePointer: false,
  focusHighlight: true
}

export function AccessibilityControls() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibilitySettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error parsing accessibility settings:", error)
      }
    }
  }, [])

  // Apply settings to the document
  useEffect(() => {
    // Font size
    document.documentElement.style.fontSize = `${settings.fontSize}%`
    
    // Contrast mode
    document.documentElement.classList.remove(
      "contrast-default", 
      "contrast-high", 
      "contrast-dark", 
      "contrast-light"
    )
    document.documentElement.classList.add(`contrast-${settings.contrastMode}`)
    
    // Reduce motion
    if (settings.reduceMotion) {
      document.documentElement.classList.add("reduce-motion")
    } else {
      document.documentElement.classList.remove("reduce-motion")
    }
    
    // Large pointer
    if (settings.largePointer) {
      document.documentElement.classList.add("large-pointer")
    } else {
      document.documentElement.classList.remove("large-pointer")
    }
    
    // Focus highlight
    if (settings.focusHighlight) {
      document.documentElement.classList.add("focus-highlight")
    } else {
      document.documentElement.classList.remove("focus-highlight")
    }
  }, [settings])

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings))
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  // Reset settings to default
  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("accessibilitySettings")
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  // Update a single setting
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 shadow-md bg-white"
          aria-label="Controles de accesibilidad"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Opciones de accesibilidad</SheetTitle>
          <SheetDescription>
            Personaliza la aplicación para mejorar tu experiencia
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="text" className="flex flex-col items-center gap-1 py-2">
                <Type className="h-4 w-4" />
                <span className="text-xs">Texto</span>
              </TabsTrigger>
              <TabsTrigger value="contrast" className="flex flex-col items-center gap-1 py-2">
                <Contrast className="h-4 w-4" />
                <span className="text-xs">Contraste</span>
              </TabsTrigger>
              <TabsTrigger value="motion" className="flex flex-col items-center gap-1 py-2">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Movimiento</span>
              </TabsTrigger>
              <TabsTrigger value="pointer" className="flex flex-col items-center gap-1 py-2">
                <MousePointer className="h-4 w-4" />
                <span className="text-xs">Puntero</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="font-size">Tamaño de texto</Label>
                    <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
                  </div>
                  <Slider 
                    id="font-size"
                    min={75} 
                    max={200} 
                    step={5} 
                    value={[settings.fontSize]} 
                    onValueChange={([value]) => updateSetting("fontSize", value)}
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Pequeño</span>
                    <span>Normal</span>
                    <span>Grande</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <p className="mb-2">Vista previa:</p>
                  <p>Este es un texto de ejemplo para mostrar el tamaño actual.</p>
                  <p className="text-sm mt-2">Este es un texto más pequeño.</p>
                  <p className="text-lg mt-2">Este es un texto más grande.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contrast" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={settings.contrastMode === "default" ? "default" : "outline"}
                    className="justify-start px-3 py-6"
                    onClick={() => updateSetting("contrastMode", "default")}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 mb-2"></div>
                      <span>Normal</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={settings.contrastMode === "high" ? "default" : "outline"}
                    className="justify-start px-3 py-6"
                    onClick={() => updateSetting("contrastMode", "high")}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="w-12 h-12 rounded-md bg-black border-2 border-white mb-2"></div>
                      <span>Alto contraste</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={settings.contrastMode === "dark" ? "default" : "outline"}
                    className="justify-start px-3 py-6"
                    onClick={() => updateSetting("contrastMode", "dark")}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="w-12 h-12 rounded-md bg-gray-900 mb-2"></div>
                      <span>Modo oscuro</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={settings.contrastMode === "light" ? "default" : "outline"}
                    className="justify-start px-3 py-6"
                    onClick={() => updateSetting("contrastMode", "light")}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 mb-2"></div>
                      <span>Modo claro</span>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="motion" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-motion">Reducir movimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimiza animaciones y transiciones
                    </p>
                  </div>
                  <Switch 
                    id="reduce-motion"
                    checked={settings.reduceMotion}
                    onCheckedChange={(checked) => updateSetting("reduceMotion", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="focus-highlight">Resaltar enfoque</Label>
                    <p className="text-sm text-muted-foreground">
                      Resalta elementos al navegar con teclado
                    </p>
                  </div>
                  <Switch 
                    id="focus-highlight"
                    checked={settings.focusHighlight}
                    onCheckedChange={(checked) => updateSetting("focusHighlight", checked)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pointer" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="large-pointer">Cursor grande</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta el tamaño del cursor para mejor visibilidad
                    </p>
                  </div>
                  <Switch 
                    id="large-pointer"
                    checked={settings.largePointer}
                    onCheckedChange={(checked) => updateSetting("largePointer", checked)}
                  />
                </div>
                
                <div className="p-4 border rounded-md">
                  <p className="mb-2">Prueba el cursor:</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button variant="outline">Botón de ejemplo</Button>
                    <Button>Botón primario</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {showSuccessMessage && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 rounded-md flex items-center">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm">Configuración guardada</span>
          </div>
        )}
        
        <SheetFooter>
          <div className="flex w-full space-x-2">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button 
              onClick={saveSettings}
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
