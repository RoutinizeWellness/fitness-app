"use client"

import React from "react"
import { DebugFixesTest } from "@/components/testing/debug-fixes-test"
import { StrengthProgressCard } from "@/components/training/strength-progress-card"
import { UnifiedBottomNav } from "@/components/navigation/unified-bottom-nav"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/contexts/auth-context"
import { CheckCircle, AlertTriangle, Database, Palette, Navigation, Code } from "lucide-react"

export default function DebugTestPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#FFF3E9] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#DDDCFE] px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#1B237E] font-manrope">
            Pruebas de Corrección
          </h1>
          <p className="text-sm text-[#573353] mt-1">
            Verificación de las correcciones implementadas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <CheckCircle className="h-5 w-5 mr-2" />
              Estado de Correcciones
            </CardTitle>
            <CardDescription>
              Resumen de los problemas corregidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Badge Import Fix</span>
                <Badge variant="default">✅ Corregido</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supabase Queries</span>
                <Badge variant="default">✅ Actualizado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Color Palette</span>
                <Badge variant="default">✅ Aplicado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Navigation Structure</span>
                <Badge variant="default">✅ Mejorado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Button Styles</span>
                <Badge variant="default">✅ Actualizado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Palette className="h-5 w-5 mr-2" />
              Paleta de Colores Routinize
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#1B237E] rounded"></div>
                <span className="text-xs">#1B237E Primary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#FEA800] rounded"></div>
                <span className="text-xs">#FEA800 Accent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#FF6767] rounded"></div>
                <span className="text-xs">#FF6767 Danger</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#573353] rounded"></div>
                <span className="text-xs">#573353 Dark</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#B1AFE9] rounded"></div>
                <span className="text-xs">#B1AFE9 Light</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#DDDCFE] rounded"></div>
                <span className="text-xs">#DDDCFE Lighter</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Code className="h-5 w-5 mr-2" />
              SafeClientButton Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <SafeClientButton variant="default" size="sm">
                  Default
                </SafeClientButton>
                <SafeClientButton variant="accent" size="sm">
                  Accent
                </SafeClientButton>
                <SafeClientButton variant="secondary" size="sm">
                  Secondary
                </SafeClientButton>
              </div>
              <div className="flex gap-2 flex-wrap">
                <SafeClientButton variant="gradient" size="sm">
                  Gradient
                </SafeClientButton>
                <SafeClientButton variant="destructive" size="sm">
                  Destructive
                </SafeClientButton>
                <SafeClientButton variant="outline" size="sm">
                  Outline
                </SafeClientButton>
              </div>
              <div className="flex gap-2 flex-wrap">
                <SafeClientButton variant="ghost" size="sm">
                  Ghost
                </SafeClientButton>
                <SafeClientButton variant="pill" size="sm">
                  Pill
                </SafeClientButton>
                <SafeClientButton variant="organic" size="sm">
                  Organic
                </SafeClientButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Component Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Badge Component (Corregido)
            </CardTitle>
            <CardDescription>
              Componente Badge ahora importado correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Navigation className="h-5 w-5 mr-2" />
              Navegación Mejorada
            </CardTitle>
            <CardDescription>
              5 módulos principales con estilos actualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>🏋️ Entrenamiento</span>
                <Badge variant="outline">Módulo 1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>🍎 Nutrición</span>
                <Badge variant="outline">Módulo 2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>😴 Sueño</span>
                <Badge variant="outline">Módulo 3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>🧠 Productividad</span>
                <Badge variant="outline">Módulo 4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>❤️ Bienestar</span>
                <Badge variant="outline">Módulo 5</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#1B237E]">
              <Database className="h-5 w-5 mr-2" />
              Prueba de Base de Datos
            </CardTitle>
            <CardDescription>
              Componente StrengthProgressCard con nuevas consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <StrengthProgressCard />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">
                  Inicia sesión para probar las consultas de base de datos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automated Tests */}
        <DebugFixesTest />

        {/* Admin Test */}
        {user?.email === 'admin@routinize.com' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#1B237E]">
                <CheckCircle className="h-5 w-5 mr-2" />
                Acceso de Administrador
              </CardTitle>
              <CardDescription>
                Funcionalidades específicas para admin@routinize.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="default">✅ Usuario Admin Detectado</Badge>
                <p className="text-sm text-gray-600">
                  Tienes acceso a todas las funcionalidades administrativas.
                </p>
                <SafeClientButton 
                  variant="accent" 
                  size="sm"
                  onClick={() => window.location.href = '/admin'}
                >
                  Ir al Dashboard de Admin
                </SafeClientButton>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Bottom Navigation Demo */}
      <UnifiedBottomNav activeTab="training" />
    </div>
  )
}
