"use client"

import { useState } from "react"
import {
  ArrowLeft, Wind, Lungs,
  BarChart3, Plus, Play
} from "lucide-react"
import { Button3D } from "@/components/ui/button-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { WimHofBreathing } from "@/components/wellness/wim-hof-breathing"
import { BreathingStats } from "@/components/wellness/breathing-stats"
import { BreathingHistory } from "@/components/wellness/breathing-history"
import { useRouter } from "next/navigation"

export default function BreathingPage() {
  const [showWimHof, setShowWimHof] = useState(false)
  const router = useRouter()

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button3D variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button3D>
        <h1 className="text-2xl font-bold gradient-text">Respiración consciente</h1>
      </div>

      <p className="text-gray-500 mb-6">
        Explora diferentes técnicas de respiración para mejorar tu bienestar físico y mental.
      </p>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <BreathingStats />

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg overflow-hidden">
            <div className="p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Método Wim Hof</h2>
                  <p className="text-white/80 mb-4">
                    Técnica de respiración potente que puede mejorar tu energía,
                    reducir el estrés y fortalecer tu sistema inmunológico.
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Lungs className="h-8 w-8 text-white" />
                </div>
              </div>

              <Button3D
                variant="glass"
                className="w-full border-white/30 text-white"
                onClick={() => setShowWimHof(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar sesión
              </Button3D>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg overflow-hidden">
              <div className="p-6 text-white">
                <h3 className="font-semibold mb-2">Respiración 4-7-8</h3>
                <p className="text-sm text-white/80 mb-3">
                  Técnica para reducir la ansiedad y conciliar el sueño.
                </p>
                <Button3D variant="glass" size="sm" className="border-white/30 text-white">
                  Iniciar
                </Button3D>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg overflow-hidden">
              <div className="p-6 text-white">
                <h3 className="font-semibold mb-2">Respiración alterna</h3>
                <p className="text-sm text-white/80 mb-3">
                  Técnica de yoga para equilibrar la energía.
                </p>
                <Button3D variant="glass" size="sm" className="border-white/30 text-white">
                  Iniciar
                </Button3D>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <BreathingHistory />
        </TabsContent>
      </Tabs>

      {/* Botón flotante para iniciar una sesión */}
      <div className="fixed bottom-20 right-4">
        <Button3D
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setShowWimHof(true)}
        >
          <Plus className="h-6 w-6" />
        </Button3D>
      </div>

      {/* Diálogo para el método Wim Hof */}
      <Dialog open={showWimHof} onOpenChange={setShowWimHof}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Método de Respiración Wim Hof</DialogTitle>
          <WimHofBreathing
            onComplete={() => setShowWimHof(false)}
            onCancel={() => setShowWimHof(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
