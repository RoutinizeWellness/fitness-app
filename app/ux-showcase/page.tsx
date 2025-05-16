"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb, 
  Zap, 
  Sparkles, 
  Palette, 
  Layers, 
  Smartphone, 
  Loader2, 
  Check, 
  AlertCircle, 
  Info 
} from "lucide-react"
import { useFeedback, useLoadingFeedback } from "@/components/feedback/action-feedback"
import { 
  FadeInElement, 
  StaggeredList, 
  CardEntrance 
} from "@/components/transitions/page-transition"
import { 
  ThemeSelector, 
  AccentColorSelector, 
  useEnhancedTheme 
} from "@/components/theme/theme-provider"
import { 
  ModuleCardSkeleton, 
  MealCardSkeleton, 
  RecipeCardSkeleton 
} from "@/components/ui/enhanced-skeletons"

export default function UXShowcase() {
  const [activeTab, setActiveTab] = useState("design")
  const { showFeedback } = useFeedback()
  const { showLoading, updateToSuccess, updateToError } = useLoadingFeedback()
  const { 
    accentColor, 
    setAccentColor, 
    fontSize, 
    setFontSize, 
    reducedMotion, 
    setReducedMotion, 
    borderRadius, 
    setBorderRadius 
  } = useEnhancedTheme()
  
  // Mostrar feedback
  const handleShowFeedback = (type: "success" | "error" | "info" | "loading") => {
    showFeedback({
      message: `Este es un mensaje de ${type === "success" ? "éxito" : type === "error" ? "error" : type === "info" ? "información" : "carga"}`,
      type,
      position: "bottom"
    })
  }
  
  // Mostrar feedback de carga
  const handleShowLoadingFeedback = () => {
    const id = showLoading("Cargando datos...")
    
    // Simular una operación asíncrona
    setTimeout(() => {
      // 50% de probabilidad de éxito
      if (Math.random() > 0.5) {
        updateToSuccess(id, "Datos cargados correctamente")
      } else {
        updateToError(id, "Error al cargar los datos")
      }
    }, 2000)
  }
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <FadeInElement>
        <h1 className="text-3xl font-bold mb-2 gradient-text">Showcase de UX</h1>
        <p className="text-gray-500 mb-6">
          Demostración de las mejoras de experiencia de usuario
        </p>
      </FadeInElement>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="design" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Palette className="h-4 w-4 mr-2" />
            Diseño
          </TabsTrigger>
          <TabsTrigger value="interactions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Zap className="h-4 w-4 mr-2" />
            Interacciones
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Lightbulb className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="design">
          <CardEntrance>
            <Card3D className="mb-6">
              <Card3DHeader>
                <Card3DTitle>Tema y Apariencia</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tema</h3>
                    <ThemeSelector />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Color de acento</h3>
                    <AccentColorSelector />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tamaño de fuente</h3>
                    <div className="flex space-x-2">
                      <Button3D
                        variant={fontSize === "small" ? "default" : "outline"}
                        onClick={() => setFontSize("small")}
                      >
                        Pequeño
                      </Button3D>
                      <Button3D
                        variant={fontSize === "default" ? "default" : "outline"}
                        onClick={() => setFontSize("default")}
                      >
                        Normal
                      </Button3D>
                      <Button3D
                        variant={fontSize === "large" ? "default" : "outline"}
                        onClick={() => setFontSize("large")}
                      >
                        Grande
                      </Button3D>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Radio de bordes</h3>
                    <div className="flex space-x-2">
                      <Button3D
                        variant={borderRadius === "none" ? "default" : "outline"}
                        onClick={() => setBorderRadius("none")}
                        className="rounded-none"
                      >
                        Ninguno
                      </Button3D>
                      <Button3D
                        variant={borderRadius === "small" ? "default" : "outline"}
                        onClick={() => setBorderRadius("small")}
                        className="rounded-sm"
                      >
                        Pequeño
                      </Button3D>
                      <Button3D
                        variant={borderRadius === "default" ? "default" : "outline"}
                        onClick={() => setBorderRadius("default")}
                      >
                        Normal
                      </Button3D>
                      <Button3D
                        variant={borderRadius === "large" ? "default" : "outline"}
                        onClick={() => setBorderRadius("large")}
                        className="rounded-lg"
                      >
                        Grande
                      </Button3D>
                      <Button3D
                        variant={borderRadius === "full" ? "default" : "outline"}
                        onClick={() => setBorderRadius("full")}
                        className="rounded-full"
                      >
                        Completo
                      </Button3D>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Reducir movimiento</h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reduce-motion"
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="reduce-motion" className="text-sm">Activar</label>
                    </div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </CardEntrance>
          
          <CardEntrance delay={0.1}>
            <Card3D className="mb-6">
              <Card3DHeader>
                <Card3DTitle>Componentes</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value="buttons">
                    <AccordionTrigger>Botones</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button3D>Default</Button3D>
                        <Button3D variant="destructive">Destructive</Button3D>
                        <Button3D variant="outline">Outline</Button3D>
                        <Button3D variant="ghost">Ghost</Button3D>
                        <Button3D variant="link">Link</Button3D>
                        <Button3D variant="gradient">Gradient</Button3D>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <Button3D size="icon" className="rounded-full">
                          <ThumbsUp className="h-4 w-4" />
                        </Button3D>
                        <Button3D size="icon" variant="outline" className="rounded-full">
                          <ThumbsDown className="h-4 w-4" />
                        </Button3D>
                        <Button3D size="icon" variant="ghost" className="rounded-full">
                          <Sparkles className="h-4 w-4" />
                        </Button3D>
                        <Button3D size="icon" variant="gradient" className="rounded-full">
                          <Zap className="h-4 w-4" />
                        </Button3D>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="inputs">
                    <AccordionTrigger>Inputs</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Input placeholder="Texto simple" className="input-focus" />
                        
                        <Textarea placeholder="Texto multilínea" className="input-focus" />
                        
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">Opción 1</SelectItem>
                            <SelectItem value="option2">Opción 2</SelectItem>
                            <SelectItem value="option3">Opción 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cards">
                    <AccordionTrigger>Tarjetas</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Card3D className="card-hover">
                          <Card3DHeader>
                            <Card3DTitle>Tarjeta con hover</Card3DTitle>
                          </Card3DHeader>
                          <Card3DContent>
                            <p className="text-sm text-gray-500">
                              Esta tarjeta tiene un efecto de elevación al pasar el cursor.
                            </p>
                          </Card3DContent>
                        </Card3D>
                        
                        <Card3D className="bg-gradient-primary text-white">
                          <Card3DHeader>
                            <Card3DTitle>Tarjeta con gradiente</Card3DTitle>
                          </Card3DHeader>
                          <Card3DContent>
                            <p className="text-sm text-white/80">
                              Esta tarjeta tiene un fondo con gradiente.
                            </p>
                          </Card3DContent>
                        </Card3D>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card3DContent>
            </Card3D>
          </CardEntrance>
        </TabsContent>
        
        <TabsContent value="interactions">
          <StaggeredList
            staggerDelay={0.1}
            className="space-y-6"
          >
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Animaciones</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Entrada con fade</h3>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 bg-primary/10 rounded-lg"
                    >
                      <p className="text-sm">Este elemento aparece con un efecto de fade.</p>
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Entrada con slide</h3>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 bg-primary/10 rounded-lg"
                    >
                      <p className="text-sm">Este elemento se desliza desde la izquierda.</p>
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Entrada con escala</h3>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 bg-primary/10 rounded-lg"
                    >
                      <p className="text-sm">Este elemento crece al aparecer.</p>
                    </motion.div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
            
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Estados de carga</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Esqueletos de carga</h3>
                    <div className="space-y-4">
                      <ModuleCardSkeleton />
                      <div className="grid grid-cols-2 gap-4">
                        <RecipeCardSkeleton />
                        <RecipeCardSkeleton />
                      </div>
                    </div>
                  </div>
                </div>
              </Card3DContent>
            </Card3D>
          </StaggeredList>
        </TabsContent>
        
        <TabsContent value="feedback">
          <CardEntrance>
            <Card3D className="mb-6">
              <Card3DHeader>
                <Card3DTitle>Notificaciones</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button3D onClick={() => handleShowFeedback("success")}>
                    <Check className="h-4 w-4 mr-2" />
                    Éxito
                  </Button3D>
                  <Button3D onClick={() => handleShowFeedback("error")}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Error
                  </Button3D>
                  <Button3D onClick={() => handleShowFeedback("info")}>
                    <Info className="h-4 w-4 mr-2" />
                    Info
                  </Button3D>
                  <Button3D onClick={() => handleShowFeedback("loading")}>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando
                  </Button3D>
                </div>
              </Card3DContent>
            </Card3D>
          </CardEntrance>
          
          <CardEntrance delay={0.1}>
            <Card3D>
              <Card3DHeader>
                <Card3DTitle>Feedback de carga</Card3DTitle>
              </Card3DHeader>
              <Card3DContent>
                <p className="text-sm text-gray-500 mb-4">
                  Este ejemplo muestra cómo actualizar un feedback de carga a éxito o error.
                </p>
                <Button3D onClick={handleShowLoadingFeedback} className="w-full">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Iniciar operación
                </Button3D>
              </Card3DContent>
            </Card3D>
          </CardEntrance>
        </TabsContent>
      </Tabs>
    </div>
  )
}
