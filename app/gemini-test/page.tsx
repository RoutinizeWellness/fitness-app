"use client"

import { GeminiTest } from "@/components/gemini-test"
import { GeminiProvider } from "@/lib/contexts/gemini-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function GeminiTestPage() {
  const router = useRouter()
  
  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Gemini AI</CardTitle>
          <CardDescription>
            Esta página permite verificar que la integración con Gemini AI está funcionando correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Para que la integración funcione correctamente, asegúrate de que:
          </p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>La variable de entorno <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_GEMINI_API_KEY</code> está configurada</li>
            <li>La API de Gemini está disponible y responde correctamente</li>
            <li>El componente GeminiProvider está correctamente implementado</li>
            <li>Las rutas de API para Gemini están funcionando</li>
          </ul>
        </CardContent>
      </Card>
      
      <GeminiProvider>
        <GeminiTest />
      </GeminiProvider>
    </div>
  )
}
