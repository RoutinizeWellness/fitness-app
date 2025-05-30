"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, MessageSquare, Calendar, BarChart2, Lightbulb } from "lucide-react"
import AIAssistant from "./ai-assistant"
import AIWorkoutPlanner from "./ai-workout-planner"
import AIProgressAnalyzer from "./ai-progress-analyzer"
import SmartRecommendations from "./smart-recommendations"
import { useAuth } from "@/lib/auth/auth-context"

export default function AIFitnessHub() {
  const [activeTab, setActiveTab] = useState("assistant")
  const { user } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500">Inicia sesión para acceder a las funcionalidades de IA</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-6 w-6 text-blue-500" />
        <h1 className="text-3xl font-bold tracking-tight">Centro de IA</h1>
      </div>

      <p className="text-muted-foreground">
        Potencia tu entrenamiento con inteligencia artificial personalizada
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="assistant" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Asistente
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Planificador
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Smart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="mt-0">
          <AIAssistant userId={user.id} />
        </TabsContent>

        <TabsContent value="planner" className="mt-0">
          <AIWorkoutPlanner userId={user.id} />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-0">
          <AIProgressAnalyzer userId={user.id} />
        </TabsContent>

        <TabsContent value="smart" className="mt-0">
          <SmartRecommendations userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
