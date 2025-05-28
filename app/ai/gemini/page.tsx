"use client"

import { GeminiAIHub } from "@/components/gemini-ai-hub"
import { GeminiChat } from "@/components/gemini-chat"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Bot, Lightbulb, Brain } from "lucide-react"

export default function GeminiAIPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Gemini AI</h1>
          <p className="text-muted-foreground">
            Potencia tu entrenamiento con inteligencia artificial avanzada
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                Gemini AI Hub
              </CardTitle>
              <CardDescription>
                Centro de inteligencia artificial para tu entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeminiAIHub />
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 text-primary mr-2" />
                  Asistente Gemini
                </CardTitle>
                <CardDescription>
                  Tu asistente personal de fitness con IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  El asistente Gemini utiliza inteligencia artificial avanzada para responder a tus preguntas sobre fitness, nutrición y bienestar. Puedes preguntarle sobre ejercicios, planes de entrenamiento, consejos nutricionales y más.
                </p>
                <div className="flex justify-center">
                  <GeminiProvider context={{ currentModule: "ai" }}>
                    <GeminiChat initialOpen={true} />
                  </GeminiProvider>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 text-primary mr-2" />
                  Capacidades de Gemini
                </CardTitle>
                <CardDescription>
                  Funcionalidades de la integración con Gemini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="features">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="features">Características</TabsTrigger>
                    <TabsTrigger value="examples">Ejemplos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="features" className="space-y-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Recomendaciones personalizadas</h3>
                        <p className="text-sm text-muted-foreground">Recibe recomendaciones adaptadas a tu perfil, objetivos y preferencias.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Asistente conversacional</h3>
                        <p className="text-sm text-muted-foreground">Interactúa de forma natural con el asistente para resolver tus dudas sobre fitness.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Memoria de conversación</h3>
                        <p className="text-sm text-muted-foreground">El asistente recuerda el contexto de la conversación para ofrecer respuestas más relevantes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Sugerencias inteligentes</h3>
                        <p className="text-sm text-muted-foreground">Recibe sugerencias de preguntas relacionadas para continuar la conversación.</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="examples" className="space-y-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Preguntas sobre ejercicios</h3>
                        <p className="text-sm text-muted-foreground">"¿Cuáles son los mejores ejercicios para fortalecer la espalda?"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Consejos de nutrición</h3>
                        <p className="text-sm text-muted-foreground">"¿Qué alimentos debo comer después de entrenar?"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Planificación de entrenamientos</h3>
                        <p className="text-sm text-muted-foreground">"Ayúdame a crear una rutina de 3 días para ganar masa muscular"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Consejos de bienestar</h3>
                        <p className="text-sm text-muted-foreground">"¿Cómo puedo mejorar la calidad de mi sueño?"</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
