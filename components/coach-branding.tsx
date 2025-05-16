"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { toast } from "@/components/ui/use-toast"
import { 
  Palette, 
  Image, 
  Type, 
  Layout, 
  Upload, 
  Check, 
  Smartphone,
  Monitor,
  Eye
} from "lucide-react"
import { updateCoachBranding } from "@/lib/supabase-coach"

interface CoachBrandingProps {
  coachId: string
}

export default function CoachBranding({ coachId }: CoachBrandingProps) {
  const [activeTab, setActiveTab] = useState("colors")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#f97316")
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc")
  const [textColor, setTextColor] = useState("#1e293b")
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [brandName, setBrandName] = useState("Mi Marca de Fitness")
  const [slogan, setSlogan] = useState("Transforma tu cuerpo, transforma tu vida")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [isSaving, setIsSaving] = useState(false)
  const [whiteLabel, setWhiteLabel] = useState(true)

  // Manejar cambio de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Guardar configuración de marca
  const handleSaveBranding = async () => {
    try {
      setIsSaving(true)
      
      const brandingData = {
        coach_id: coachId,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        background_color: backgroundColor,
        text_color: textColor,
        brand_name: brandName,
        slogan,
        font_family: fontFamily,
        white_label: whiteLabel
      }
      
      // Si hay un nuevo logo, añadirlo a los datos
      if (logo) {
        brandingData.logo = logo
      }
      
      const { error } = await updateCoachBranding(brandingData)
      
      if (error) throw error
      
      toast({
        title: "Configuración guardada",
        description: "Tu configuración de marca ha sido actualizada",
      })
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personalización de Marca</h1>
        <Button onClick={handleSaveBranding} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Marca</CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu aplicación para tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="colors" className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Colores
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Logo
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center">
                    <Type className="h-4 w-4 mr-2" />
                    Tipografía
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="flex items-center">
                    <Layout className="h-4 w-4 mr-2" />
                    Diseño
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Color Primario</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input 
                          id="primary-color" 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Color Secundario</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <Input 
                          id="secondary-color" 
                          value={secondaryColor} 
                          onChange={(e) => setSecondaryColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="background-color">Color de Fondo</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: backgroundColor }}
                        />
                        <Input 
                          id="background-color" 
                          value={backgroundColor} 
                          onChange={(e) => setBackgroundColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text-color">Color de Texto</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-md border" 
                          style={{ backgroundColor: textColor }}
                        />
                        <Input 
                          id="text-color" 
                          value={textColor} 
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="brand-name">Nombre de la Marca</Label>
                      <Input 
                        id="brand-name" 
                        value={brandName} 
                        onChange={(e) => setBrandName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slogan">Eslogan</Label>
                      <Input 
                        id="slogan" 
                        value={slogan} 
                        onChange={(e) => setSlogan(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo</Label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                          ) : (
                            <Image className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Button variant="outline" onClick={() => document.getElementById('logo-upload').click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Logo
                          </Button>
                          <input 
                            id="logo-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange} 
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recomendado: PNG o SVG, 512x512px
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="white-label" 
                        checked={whiteLabel} 
                        onCheckedChange={setWhiteLabel}
                      />
                      <Label htmlFor="white-label">Modo marca blanca (ocultar "Powered by")</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="font-family">Familia de Fuente</Label>
                      <select 
                        id="font-family" 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                    <div>
                      <Label>Tamaño de Fuente Base</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">Pequeño</span>
                        <Slider defaultValue={[16]} min={12} max={20} step={1} className="flex-1" />
                        <span className="text-sm">Grande</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-2">Vista previa</h3>
                      <p className="mb-2" style={{ fontFamily }}>
                        Este es un texto de ejemplo para mostrar cómo se verá la fuente {fontFamily} en tu aplicación.
                      </p>
                      <h4 className="font-medium mb-1" style={{ fontFamily }}>Encabezado de ejemplo</h4>
                      <p className="text-sm" style={{ fontFamily }}>
                        Texto más pequeño para elementos secundarios.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Estilo de Navegación</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="border rounded-md p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-primary">
                          <div className="w-full h-32 bg-muted rounded-md flex flex-col">
                            <div className="h-8 bg-primary/20 rounded-t-md"></div>
                            <div className="flex-1 flex">
                              <div className="w-1/4 bg-muted-foreground/10"></div>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                          <span className="text-sm">Barra lateral</span>
                        </div>
                        <div className="border rounded-md p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-primary border-primary">
                          <div className="w-full h-32 bg-muted rounded-md flex flex-col">
                            <div className="h-8 bg-primary/20 rounded-t-md"></div>
                            <div className="flex-1"></div>
                            <div className="h-8 bg-muted-foreground/10 rounded-b-md"></div>
                          </div>
                          <span className="text-sm">Barra superior e inferior</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Densidad de Contenido</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">Compacto</span>
                        <Slider defaultValue={[2]} min={1} max={3} step={1} className="flex-1" />
                        <span className="text-sm">Espaciado</span>
                      </div>
                    </div>
                    <div>
                      <Label>Estilo de Tarjetas</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="border rounded-md p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-primary">
                          <div className="w-full h-20 bg-background border rounded-md shadow-sm"></div>
                          <span className="text-sm">Plano</span>
                        </div>
                        <div className="border rounded-md p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-primary border-primary">
                          <div className="w-full h-20 bg-background border rounded-md shadow-md"></div>
                          <span className="text-sm">Elevado</span>
                        </div>
                        <div className="border rounded-md p-4 flex flex-col items-center space-y-2 cursor-pointer hover:border-primary">
                          <div className="w-full h-20 bg-background border-0 rounded-md shadow-lg"></div>
                          <span className="text-sm">Flotante</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Así se verá tu aplicación para tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Móvil
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      Escritorio
                    </Button>
                  </div>
                </div>

                <div 
                  className="border rounded-md overflow-hidden"
                  style={{ 
                    backgroundColor, 
                    color: textColor,
                    fontFamily
                  }}
                >
                  {/* Simulación de la app */}
                  <div className="h-8 flex items-center px-4" style={{ backgroundColor: primaryColor, color: "white" }}>
                    <div className="flex-1 text-sm font-medium">{brandName}</div>
                    <div className="w-4 h-4 rounded-full bg-white/20"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                      )}
                      <div className="font-medium">{brandName}</div>
                    </div>
                    <div className="h-24 rounded-md" style={{ backgroundColor: primaryColor + "20" }}></div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded-sm" style={{ backgroundColor: primaryColor + "40" }}></div>
                      <div className="h-4 w-full rounded-sm" style={{ backgroundColor: primaryColor + "30" }}></div>
                      <div className="h-4 w-5/6 rounded-sm" style={{ backgroundColor: primaryColor + "20" }}></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 h-8 rounded-md flex items-center justify-center text-xs" style={{ backgroundColor: primaryColor, color: "white" }}>
                        Botón Primario
                      </div>
                      <div className="flex-1 h-8 rounded-md flex items-center justify-center text-xs border" style={{ borderColor: primaryColor, color: primaryColor }}>
                        Botón Secundario
                      </div>
                    </div>
                  </div>
                  <div className="h-8 flex items-center justify-around px-4 border-t" style={{ backgroundColor }}>
                    <div className="w-4 h-4" style={{ backgroundColor: primaryColor + "60" }}></div>
                    <div className="w-4 h-4" style={{ backgroundColor: primaryColor + "60" }}></div>
                    <div className="w-4 h-4" style={{ backgroundColor: primaryColor + "60" }}></div>
                    <div className="w-4 h-4" style={{ backgroundColor: primaryColor + "60" }}></div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => window.open("/preview-brand", "_blank")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista previa completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
