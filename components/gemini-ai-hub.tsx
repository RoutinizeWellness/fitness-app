"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, MessageSquare, Lightbulb } from "lucide-react"
import { GeminiChat } from "./gemini-chat"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { GeminiRecommendations } from "./gemini-recommendations"
import { useAuth } from "@/lib/contexts/auth-context"

interface GeminiAIHubProps {
  className?: string
}

export function GeminiAIHub({ className }: GeminiAIHubProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const { user } = useAuth()

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            Gemini AI Hub
          </CardTitle>
          <CardDescription>
            Inicia sesión para acceder a las funcionalidades de IA
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Gemini AI Hub</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Asistente
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recomendaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asistente Gemini</CardTitle>
              <CardDescription>
                Pregúntame sobre ejercicios, nutrición, planes de entrenamiento o cualquier duda sobre fitness
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <GeminiProvider context={{ currentModule: activeTab }}>
                <GeminiChat initialOpen={true} />
              </GeminiProvider>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <GeminiRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  )
}
