"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function CopilotDemoPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<{ content: string; sender: "user" | "bot" }[]>([
    { content: "¡Hola! Soy tu asistente de fitness. ¿En qué puedo ayudarte hoy?", sender: "bot" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Añadir mensaje del usuario
    setMessages(prev => [...prev, { content: input, sender: "user" }])
    const userInput = input
    setInput("")
    setIsLoading(true)

    // Simular respuesta del bot
    setTimeout(() => {
      let botResponse = ""
      const lowerInput = userInput.toLowerCase()

      if (lowerInput.includes("entrena") || lowerInput.includes("ejercicio")) {
        botResponse = "Puedes encontrar rutinas de entrenamiento personalizadas en la sección de Entrenamiento. ¿Quieres que te ayude a crear una rutina adaptada a tus objetivos?"
      } else if (lowerInput.includes("nutri") || lowerInput.includes("comida") || lowerInput.includes("dieta")) {
        botResponse = "En la sección de Nutrición encontrarás planes alimenticios y seguimiento de macronutrientes. ¿Necesitas ayuda con tu plan de alimentación?"
      } else if (lowerInput.includes("sueño") || lowerInput.includes("dormir")) {
        botResponse = "El sueño es fundamental para la recuperación. En la sección de Sueño puedes hacer seguimiento de tus patrones de descanso y recibir recomendaciones para mejorar."
      } else if (lowerInput.includes("hola") || lowerInput.includes("saludos")) {
        botResponse = "¡Hola! Estoy aquí para ayudarte con tu bienestar. Puedo asistirte con entrenamiento, nutrición, sueño y más. ¿En qué área necesitas ayuda hoy?"
      } else {
        botResponse = "Gracias por tu mensaje. Como asistente de fitness, puedo ayudarte con rutinas de entrenamiento, planes de nutrición, seguimiento de sueño y hábitos saludables. ¿Podrías darme más detalles sobre lo que necesitas?"
      }

      setMessages(prev => [...prev, { content: botResponse, sender: "bot" }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Microsoft Copilot Studio Demo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sobre esta demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Esta es una demostración de cómo se integraría Microsoft Copilot Studio con nuestra aplicación de fitness.
            </p>
            <p className="mb-4">
              Microsoft Copilot Studio permite crear asistentes virtuales personalizados que pueden ayudar a los usuarios con diversas tareas, como:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Responder preguntas sobre entrenamientos y nutrición</li>
              <li>Proporcionar recomendaciones personalizadas</li>
              <li>Ayudar a navegar por la aplicación</li>
              <li>Registrar actividades y comidas</li>
              <li>Ofrecer motivación y consejos</li>
            </ul>
            <p>
              Prueba a interactuar con el asistente virtual a la derecha. Puedes preguntarle sobre entrenamientos, nutrición, sueño o cualquier otro tema relacionado con el fitness.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat con el Asistente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-3">
                  <div className="inline-block px-3 py-2 rounded-lg bg-muted">
                    <span className="flex items-center space-x-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-75">.</span>
                      <span className="animate-bounce delay-150">.</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-l-none"
              >
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
