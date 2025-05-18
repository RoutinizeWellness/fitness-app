"use client"

import { useState } from "react"
import { UnifiedNavigation } from "@/components/unified-navigation"
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardDescription, EnhancedCardContent, EnhancedCardFooter } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Heart, Brain, Utensils, Moon } from "lucide-react"

export default function UIDemo() {
  const [activeTab, setActiveTab] = useState("cards")
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Demostración de UI</h1>
          <ThemeSwitcher />
        </div>

        <Tabs defaultValue="cards" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="cards">Tarjetas</TabsTrigger>
            <TabsTrigger value="buttons">Botones</TabsTrigger>
            <TabsTrigger value="navigation">Navegación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Tarjetas Mejoradas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Efecto de Elevación</EnhancedCardTitle>
                  <EnhancedCardDescription>Esta tarjeta se eleva al pasar el cursor</EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p>Pasa el cursor sobre esta tarjeta para ver cómo se eleva con una sombra más pronunciada.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm">Acción</EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="glow">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Efecto de Brillo</EnhancedCardTitle>
                  <EnhancedCardDescription>Esta tarjeta brilla al pasar el cursor</EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p>Pasa el cursor sobre esta tarjeta para ver cómo brilla con un resplandor del color primario.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle">Acción</EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="border">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Efecto de Borde</EnhancedCardTitle>
                  <EnhancedCardDescription>El borde cambia de color al pasar el cursor</EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p>Pasa el cursor sobre esta tarjeta para ver cómo el borde cambia al color primario.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="outline">Acción</EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="none">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Sin Efecto</EnhancedCardTitle>
                  <EnhancedCardDescription>Esta tarjeta no tiene efectos especiales</EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p>Esta tarjeta no tiene efectos especiales al pasar el cursor, pero mantiene el estilo base.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="ghost">Acción</EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">Tarjetas de Módulos</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <EnhancedCardTitle>Entrenamiento</EnhancedCardTitle>
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm">Gestiona tus rutinas y seguimiento de ejercicios.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle" className="w-full">
                    Explorar
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <EnhancedCardTitle>Nutrición</EnhancedCardTitle>
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm">Planifica tus comidas y controla tu ingesta diaria.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle" className="w-full">
                    Explorar
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <EnhancedCardTitle>Sueño</EnhancedCardTitle>
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm">Optimiza tu descanso y mejora la calidad del sueño.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle" className="w-full">
                    Explorar
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <EnhancedCardTitle>Bienestar</EnhancedCardTitle>
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm">Técnicas de respiración y ejercicios de mindfulness.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle" className="w-full">
                    Explorar
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
              
              <EnhancedCard hoverEffect="lift">
                <EnhancedCardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <EnhancedCardTitle>IA</EnhancedCardTitle>
                  </div>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm">Recomendaciones personalizadas con inteligencia artificial.</p>
                </EnhancedCardContent>
                <EnhancedCardFooter>
                  <EnhancedButton size="sm" variant="subtle" className="w-full">
                    Explorar
                  </EnhancedButton>
                </EnhancedCardFooter>
              </EnhancedCard>
            </div>
          </TabsContent>
          
          <TabsContent value="buttons" className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Botones Mejorados</h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Default</h3>
                  <EnhancedButton>Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Outline</h3>
                  <EnhancedButton variant="outline">Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Secondary</h3>
                  <EnhancedButton variant="secondary">Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Ghost</h3>
                  <EnhancedButton variant="ghost">Botón</EnhancedButton>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Gradient</h3>
                  <EnhancedButton variant="gradient">Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Subtle</h3>
                  <EnhancedButton variant="subtle">Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Destructive</h3>
                  <EnhancedButton variant="destructive">Botón</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Link</h3>
                  <EnhancedButton variant="link">Botón</EnhancedButton>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-4">Efectos de Animación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Efecto de Escala</h3>
                  <EnhancedButton withEffect="scale">Escala</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Efecto de Elevación</h3>
                  <EnhancedButton withEffect="lift">Elevación</EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sin Efecto</h3>
                  <EnhancedButton withEffect="none">Sin Efecto</EnhancedButton>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-4">Estados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Cargando</h3>
                  <EnhancedButton 
                    isLoading={isLoading} 
                    loadingText="Cargando..." 
                    onClick={handleLoadingDemo}
                  >
                    Cargar
                  </EnhancedButton>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Deshabilitado</h3>
                  <EnhancedButton disabled>Deshabilitado</EnhancedButton>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Navegación Unificada</h2>
            
            <div className="space-y-4">
              <p>
                La navegación unificada se adapta automáticamente a dispositivos móviles y de escritorio.
                Prueba a cambiar el tamaño de la ventana para ver cómo cambia.
              </p>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium mb-2">Características:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Barra superior con logo y navegación principal</li>
                  <li>Navegación inferior en dispositivos móviles</li>
                  <li>Menú lateral desplegable</li>
                  <li>Selector de tema (claro/oscuro)</li>
                  <li>Animaciones suaves en las transiciones</li>
                  <li>Indicador visual de la página activa</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
