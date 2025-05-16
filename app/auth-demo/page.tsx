"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDemoPage() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null)
  
  const authScreens = [
    { name: "Login", path: "/auth/login", description: "Pantalla de inicio de sesión" },
    { name: "Register", path: "/auth/register", description: "Pantalla de registro de usuario" },
    { name: "Forgot Password", path: "/auth/forgot-password", description: "Pantalla de recuperación de contraseña" },
    { name: "Reset Password", path: "/auth/reset-password", description: "Pantalla de restablecimiento de contraseña" },
    { name: "Verify Email", path: "/auth/verify-email", description: "Pantalla de verificación de correo electrónico" },
    { name: "Onboarding", path: "/habit-onboarding", description: "Pantalla de onboarding" }
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Demostración de Pantallas de Autenticación</h1>
        <p className="text-gray-500 mb-6">Selecciona una pantalla para visualizarla</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {authScreens.map((screen) => (
            <Card key={screen.path} className={activeScreen === screen.path ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{screen.name}</CardTitle>
                <CardDescription>{screen.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={screen.path} className="w-full">
                  <Button className="w-full">Ver pantalla</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {activeScreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Visualizando {activeScreen}</h2>
            <iframe src={activeScreen} className="w-full h-[600px] border rounded" />
            <Button 
              className="mt-4 w-full" 
              variant="outline"
              onClick={() => setActiveScreen(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
