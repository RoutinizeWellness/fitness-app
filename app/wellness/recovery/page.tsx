"use client"

import { useState } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WellnessScoreTracker } from "@/components/wellness/wellness-score-tracker"
import { EmotionalJournal } from "@/components/wellness/emotional-journal"
import { RecoverySessions } from "@/components/wellness/recovery-sessions"
import { 
  Activity, 
  BookHeart, 
  Yoga, 
  Heart, 
  Info
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"

export default function RecoveryPage() {
  const [activeTab, setActiveTab] = useState("wellness-score")
  
  return (
    <div className="container mx-auto py-8">
      <PageTransition>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Bienestar y Recuperación</h1>
            <p className="text-muted-foreground mt-2">
              Mejora tu bienestar físico y mental con nuestras herramientas de recuperación
            </p>
          </div>
          
          {/* Tarjetas de información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard hoverEffect="lift" delay={0}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Puntuación de Bienestar</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registra tu estado de ánimo, sueño y estrés para obtener una puntuación de recuperación personalizada.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2" 
                  onClick={() => setActiveTab("wellness-score")}
                >
                  Ver más
                </Button>
              </CardContent>
            </AnimatedCard>
            
            <AnimatedCard hoverEffect="lift" delay={1}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BookHeart className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg">Diario Emocional</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registra tus pensamientos y emociones para mejorar tu autoconocimiento y bienestar mental.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2" 
                  onClick={() => setActiveTab("journal")}
                >
                  Ver más
                </Button>
              </CardContent>
            </AnimatedCard>
            
            <AnimatedCard hoverEffect="lift" delay={2}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Yoga className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Sesiones de Recuperación</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Meditaciones guiadas, yoga y ejercicios de respiración para mejorar tu recuperación.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-2" 
                  onClick={() => setActiveTab("recovery")}
                >
                  Ver más
                </Button>
              </CardContent>
            </AnimatedCard>
          </div>
          
          {/* Tarjeta informativa */}
          <Card className="mb-8 bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <CardTitle>¿Por qué es importante el bienestar?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                El bienestar integral es fundamental para optimizar tu rendimiento físico y mental. 
                La recuperación adecuada, la gestión del estrés y el equilibrio emocional son 
                componentes esenciales para alcanzar tus objetivos de fitness y salud.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Recuperación física</h4>
                    <p className="text-xs text-muted-foreground">
                      Permite la reparación muscular y previene lesiones
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Bienestar mental</h4>
                    <p className="text-xs text-muted-foreground">
                      Reduce el estrés y mejora la concentración
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Equilibrio emocional</h4>
                    <p className="text-xs text-muted-foreground">
                      Favorece la motivación y la consistencia
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contenido principal */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wellness-score">
                <Activity className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Puntuación</span>
                <span className="inline md:hidden">Puntuación</span>
              </TabsTrigger>
              <TabsTrigger value="journal">
                <BookHeart className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Diario Emocional</span>
                <span className="inline md:hidden">Diario</span>
              </TabsTrigger>
              <TabsTrigger value="recovery">
                <Yoga className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Sesiones</span>
                <span className="inline md:hidden">Sesiones</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="wellness-score" className="mt-6">
              <WellnessScoreTracker />
            </TabsContent>
            
            <TabsContent value="journal" className="mt-6">
              <EmotionalJournal />
            </TabsContent>
            
            <TabsContent value="recovery" className="mt-6">
              <RecoverySessions />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </div>
  )
}
