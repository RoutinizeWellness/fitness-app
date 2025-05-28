"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AIAssistantEnhanced } from "@/components/ai-assistant-enhanced"
import { Bot, Search, HelpCircle, BookOpen, MessageSquare, Lightbulb } from "lucide-react"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("assistant")
  
  // Filtrar preguntas frecuentes basadas en la búsqueda
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Centro de Ayuda</h1>
      <p className="text-muted-foreground mb-8">
        Encuentra respuestas a tus preguntas y aprende a sacar el máximo provecho de Routinize
      </p>
      
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar ayuda..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>Asistente IA</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Preguntas Frecuentes</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Guías</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Asistente de Ayuda IA
              </CardTitle>
              <CardDescription>
                Pregunta lo que quieras saber sobre Routinize y obtén respuestas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">¿Cómo puedo ayudarte?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Haz clic en el botón del asistente en la esquina inferior derecha para comenzar una conversación
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => window.open('/training', '_self')}>
                    Módulo de Entrenamiento
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/nutrition', '_self')}>
                    Módulo de Nutrición
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/wellness', '_self')}>
                    Módulo de Bienestar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faqs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Respuestas a las preguntas más comunes sobre Routinize
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setSearchQuery("")}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {(searchQuery ? filteredFaqs : faqs).map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm max-w-none">
                          <p>{faq.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guías y Tutoriales</CardTitle>
              <CardDescription>
                Aprende a utilizar todas las funciones de Routinize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((guide, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(guide.link, '_self')}
                      >
                        Ver Guía
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Datos de ejemplo para preguntas frecuentes
const faqs = [
  {
    question: "¿Cómo puedo crear una rutina de entrenamiento personalizada?",
    answer: "Para crear una rutina personalizada, ve al módulo de Entrenamiento y haz clic en 'Crear Rutina'. Allí podrás seleccionar tus objetivos, nivel de experiencia, días de entrenamiento y preferencias. El sistema generará una rutina adaptada a tus necesidades que podrás modificar según tus preferencias."
  },
  {
    question: "¿Cómo funciona el seguimiento de progreso?",
    answer: "El seguimiento de progreso te permite registrar tu peso, medidas corporales y fotos periódicamente. Para utilizarlo, ve a la sección 'Progreso' dentro del módulo de Entrenamiento. Allí podrás añadir nuevos registros y ver gráficos de tu evolución a lo largo del tiempo."
  },
  {
    question: "¿Puedo sincronizar Routinize con mi smartwatch o dispositivo de fitness?",
    answer: "Sí, Routinize es compatible con varios dispositivos y aplicaciones de fitness. Ve a 'Configuración' > 'Conexiones' para vincular tu dispositivo. Actualmente soportamos Apple Health, Google Fit, Fitbit, Garmin y otros servicios populares."
  },
  {
    question: "¿Cómo puedo crear un plan de alimentación personalizado?",
    answer: "Para crear un plan de alimentación, ve al módulo de Nutrición y selecciona 'Plan de Alimentación'. Completa el cuestionario sobre tus objetivos, preferencias alimentarias y restricciones dietéticas. El sistema generará un plan personalizado que podrás ajustar según tus necesidades."
  },
  {
    question: "¿Cómo funciona el asistente de IA?",
    answer: "El asistente de IA utiliza inteligencia artificial para proporcionarte recomendaciones personalizadas, responder a tus preguntas y ayudarte a alcanzar tus objetivos. Puedes interactuar con él haciendo clic en el icono del asistente en la esquina inferior derecha de la pantalla."
  },
  {
    question: "¿Mis datos están seguros en Routinize?",
    answer: "Sí, la seguridad y privacidad de tus datos son nuestra prioridad. Utilizamos encriptación de extremo a extremo y seguimos las mejores prácticas de seguridad. No compartimos tus datos con terceros sin tu consentimiento explícito. Puedes revisar nuestra política de privacidad para más detalles."
  },
  {
    question: "¿Puedo usar Routinize sin conexión a internet?",
    answer: "Sí, muchas funciones de Routinize están disponibles sin conexión. Puedes registrar entrenamientos, comidas y hábitos sin internet. Los datos se sincronizarán automáticamente cuando vuelvas a conectarte."
  },
  {
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer: "Para cancelar tu suscripción, ve a 'Configuración' > 'Suscripción' y selecciona 'Cancelar suscripción'. Podrás seguir utilizando Routinize hasta el final de tu período de facturación actual."
  }
]

// Datos de ejemplo para guías
const guides = [
  {
    title: "Primeros pasos con Routinize",
    description: "Aprende a configurar tu perfil y comenzar a utilizar todas las funciones de Routinize.",
    link: "/guides/getting-started"
  },
  {
    title: "Guía completa de entrenamiento",
    description: "Descubre cómo sacar el máximo provecho del módulo de entrenamiento.",
    link: "/guides/training"
  },
  {
    title: "Planificación nutricional avanzada",
    description: "Aprende a crear planes de alimentación personalizados y seguir tu progreso nutricional.",
    link: "/guides/nutrition"
  },
  {
    title: "Seguimiento de hábitos y productividad",
    description: "Guía para crear y mantener hábitos saludables con nuestras herramientas de seguimiento.",
    link: "/guides/habits"
  },
  {
    title: "Análisis de datos y estadísticas",
    description: "Cómo interpretar tus datos y estadísticas para optimizar tus resultados.",
    link: "/guides/analytics"
  },
  {
    title: "Integración con dispositivos y apps",
    description: "Conecta Routinize con tus dispositivos y aplicaciones favoritas.",
    link: "/guides/integrations"
  }
]
