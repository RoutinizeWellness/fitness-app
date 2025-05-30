"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface GeminiMessage {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  suggestions?: string[]
}

interface GeminiContextType {
  messages: GeminiMessage[]
  isLoading: boolean
  sendMessage: (message: string, additionalContext?: Record<string, any>) => Promise<void>
  clearMessages: () => void
  generateRecommendations: (type: string) => Promise<any[]>
  isInitialized: boolean
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined)

export function GeminiProvider({ children, context = {} }: { children: ReactNode, context?: Record<string, any> }) {
  // Safely get auth context
  let user = null
  let profile = null
  try {
    const authContext = useAuth()
    user = authContext?.user || null
    profile = authContext?.profile || null
  } catch (error) {
    console.warn('GeminiProvider: AuthContext not available yet')
    user = null
    profile = null
  }

  const { toast } = useToast()
  const [messages, setMessages] = useState<GeminiMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Supabase client
  const supabase = createClient()

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: `¡Hola${profile?.full_name ? ` ${profile.full_name}` : ""}! Soy tu asistente de fitness con IA de Gemini. ¿En qué puedo ayudarte hoy?`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "¿Qué ejercicios me recomiendas?",
            "Dame consejos de nutrición",
            "¿Cómo puedo mejorar mi descanso?"
          ]
        }
      ])
    }
  }, [profile?.full_name, messages.length])

  // Check if API key is available
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        console.log("Checking Gemini API key...")
        const response = await fetch("/api/gemini/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        const data = await response.json()

        if (response.ok) {
          if (data.status === "success") {
            console.log("Gemini API key is valid:", data.message)
            setIsInitialized(true)
          } else if (data.status === "limited") {
            console.warn("Gemini API is rate limited:", data.message)
            toast({
              title: "Aviso",
              description: `El asistente de IA está experimentando alta demanda. Algunas funciones pueden estar limitadas temporalmente. Intenta de nuevo en ${data.retryAfter || 60} segundos.`,
              variant: "warning"
            })
            // Still set as initialized but with limited functionality
            setIsInitialized(true)
          } else {
            console.warn("Gemini API key not configured properly:", data.message)
            toast({
              title: "Aviso",
              description: "El asistente de IA puede no estar disponible. Por favor, contacta con soporte.",
              variant: "destructive"
            })
            setIsInitialized(false)
          }
        } else {
          console.warn("Gemini API key not configured properly:", data.message)
          toast({
            title: "Aviso",
            description: "El asistente de IA puede no estar disponible. Por favor, contacta con soporte.",
            variant: "destructive"
          })
          setIsInitialized(false)
        }
      } catch (error) {
        console.error("Error checking Gemini API:", error)
        toast({
          title: "Error",
          description: "No se pudo conectar con el servicio de IA. Inténtalo más tarde.",
          variant: "destructive"
        })
        setIsInitialized(false)
      }
    }

    checkApiKey()
  }, [])

  const sendMessage = async (message: string, additionalContext: Record<string, any> = {}) => {
    if (!message.trim()) return

    // Check if Gemini API is initialized
    if (!isInitialized) {
      toast({
        title: "Error",
        description: "El servicio de IA no está disponible en este momento. Por favor, inténtalo más tarde.",
        variant: "destructive",
      })
      return
    }

    const userMessage: GeminiMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    console.log("Sending message to Gemini API...")

    try {
      // Obtener el módulo actual basado en la URL
      const pathname = window.location.pathname
      let currentModule = "dashboard"

      if (pathname.includes("/training")) {
        currentModule = "training"
      } else if (pathname.includes("/nutrition")) {
        currentModule = "nutrition"
      } else if (pathname.includes("/sleep")) {
        currentModule = "sleep"
      } else if (pathname.includes("/wellness")) {
        currentModule = "wellness"
      }

      // Obtener datos relevantes de Supabase según el contexto
      let contextData: Record<string, any> = {
        ...context,
        ...additionalContext,
        currentModule
      }

      // Si la pregunta es sobre entrenamiento, obtener datos relevantes
      if (message.toLowerCase().includes("entrenamiento") ||
          message.toLowerCase().includes("ejercicio") ||
          currentModule === "training") {
        try {
          // Obtener el plan de entrenamiento activo del usuario
          const { data: workoutPlan } = await supabase
            .from('workout_plans')
            .select('*, workout_routines(*)')
            .eq('user_id', user?.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (workoutPlan) {
            contextData.workoutPlan = workoutPlan
          }
        } catch (error) {
          console.error("Error al obtener datos de entrenamiento:", error)
        }
      }

      // Si la pregunta es sobre nutrición, obtener datos relevantes
      if (message.toLowerCase().includes("nutrición") ||
          message.toLowerCase().includes("comida") ||
          message.toLowerCase().includes("dieta") ||
          currentModule === "nutrition") {
        try {
          // Obtener el plan de nutrición activo del usuario
          const { data: nutritionPlan } = await supabase
            .from('nutrition_plans')
            .select('*')
            .eq('user_id', user?.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (nutritionPlan) {
            contextData.nutritionPlan = nutritionPlan
          }
        } catch (error) {
          console.error("Error al obtener datos de nutrición:", error)
        }
      }

      // Update chat history with user message
      const updatedHistory = [
        ...chatHistory,
        { role: "user", parts: message }
      ]
      setChatHistory(updatedHistory)

      // Llamar a la API de Gemini
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: contextData,
          history: updatedHistory
        }),
      })

      if (!response.ok) {
        throw new Error("Error al comunicarse con el asistente")
      }

      const data = await response.json()

      // Check if we got a rate-limited response
      if (data.response && data.response.limited) {
        console.log("Received rate-limited response from Gemini API")

        // Show a toast notification about the rate limit
        toast({
          title: "Aviso",
          description: `El asistente de IA está experimentando alta demanda. Intenta de nuevo en ${data.response.retryAfter || 60} segundos.`,
          variant: "warning"
        })
      }

      // Update chat history with bot response
      setChatHistory([
        ...updatedHistory,
        { role: "model", parts: data.response.message }
      ])

      // Crear mensaje de respuesta del bot con sugerencias
      const botResponse: GeminiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response.message,
        sender: "bot",
        timestamp: new Date(),
        suggestions: data.response.suggestions || []
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error)

      // Mensaje de error como respuesta del bot
      const errorMessage: GeminiMessage = {
        id: (Date.now() + 1).toString(),
        content: `Lo siento, estoy teniendo problemas para procesar tu solicitud: ${error.message || "Error desconocido"}. Por favor, inténtalo de nuevo más tarde.`,
        sender: "bot",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      toast({
        title: "Error",
        description: error.message || "No se pudo conectar con el servicio de IA. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        content: `¡Hola${profile?.full_name ? ` ${profile.full_name}` : ""}! Soy tu asistente de fitness con IA de Gemini. ¿En qué puedo ayudarte hoy?`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "¿Qué ejercicios me recomiendas?",
          "Dame consejos de nutrición",
          "¿Cómo puedo mejorar mi descanso?"
        ]
      }
    ])
    setChatHistory([])
  }

  const generateRecommendations = async (type: string) => {
    try {
      const response = await fetch(`/api/gemini?type=${type}`)

      if (!response.ok) {
        throw new Error("Error al obtener recomendaciones")
      }

      const data = await response.json()

      // Check if we got a rate-limited response
      if (data.limited) {
        console.log("Received rate-limited recommendations from Gemini API")

        // Show a toast notification about the rate limit
        toast({
          title: "Aviso",
          description: `Usando recomendaciones predefinidas debido a alta demanda. Intenta de nuevo en ${data.retryAfter || 60} segundos.`,
          variant: "warning"
        })
      }

      return data.recommendations || []
    } catch (error) {
      console.error("Error al generar recomendaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron generar recomendaciones. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
      return []
    }
  }

  return (
    <GeminiContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        generateRecommendations,
        isInitialized
      }}
    >
      {children}
    </GeminiContext.Provider>
  )
}

export function useGemini() {
  const context = useContext(GeminiContext)
  if (context === undefined) {
    throw new Error("useGemini must be used within a GeminiProvider")
  }
  return context
}
