"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGemini } from "@/lib/contexts/gemini-provider"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export function GeminiTest() {
  const { isInitialized, sendMessage, messages, isLoading, clearMessages } = useGemini()
  const [testMessage, setTestMessage] = useState("¿Puedes darme un consejo de entrenamiento para hoy?")
  const [apiStatus, setApiStatus] = useState<"checking" | "success" | "error">("checking")
  const [statusMessage, setStatusMessage] = useState("Verificando estado de la API...")

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/gemini/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        const data = await response.json()
        
        if (response.ok && data.status === "success") {
          console.log("Gemini API check successful:", data.message)
          setApiStatus("success")
          setStatusMessage("API de Gemini conectada correctamente")
        } else {
          console.error("Gemini API check failed:", data.message)
          setApiStatus("error")
          setStatusMessage(`Error: ${data.message || "No se pudo conectar con la API de Gemini"}`)
        }
      } catch (error) {
        console.error("Error checking Gemini API:", error)
        setApiStatus("error")
        setStatusMessage("Error al verificar el estado de la API de Gemini")
      }
    }

    checkApiStatus()
  }, [])

  const handleSendTest = () => {
    if (testMessage.trim()) {
      sendMessage(testMessage)
    }
  }

  const handleClear = () => {
    clearMessages()
    setTestMessage("¿Puedes darme un consejo de entrenamiento para hoy?")
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test de Integración de Gemini AI
          {apiStatus === "checking" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {apiStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {apiStatus === "error" && <AlertTriangle className="h-5 w-5 text-red-500" />}
        </CardTitle>
        <CardDescription>
          {statusMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No hay mensajes. Envía un mensaje de prueba para verificar la integración.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-100 ml-8"
                      : "bg-gray-100 mr-8"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {message.sender === "user" ? "Tú" : "Gemini AI"}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setTestMessage(suggestion)
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Escribe un mensaje de prueba..."
            disabled={isLoading || apiStatus !== "success"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendTest()
              }
            }}
          />
          <Button 
            onClick={handleSendTest} 
            disabled={isLoading || apiStatus !== "success" || !testMessage.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClear}>
          Limpiar conversación
        </Button>
        <div className="text-sm text-gray-500">
          {isInitialized ? "Gemini AI inicializado" : "Gemini AI no inicializado"}
        </div>
      </CardFooter>
    </Card>
  )
}
