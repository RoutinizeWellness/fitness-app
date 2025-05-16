"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Download, X } from "lucide-react"

// Interfaz para el evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Registrar el service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker registrado con éxito:", registration.scope)
          })
          .catch((error) => {
            console.error("Error al registrar el Service Worker:", error)
          })
      })
    }

    // Detectar si la app ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre el prompt automáticamente
      e.preventDefault()
      // Guardar el evento para usarlo más tarde
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Mostrar el banner después de 3 segundos
      setTimeout(() => {
        setShowBanner(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Detectar cuando la app se instala
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowBanner(false)
      setInstallPrompt(null)
      toast({
        title: "¡Instalación completada!",
        description: "La aplicación se ha instalado correctamente.",
      })
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    // Mostrar el prompt de instalación
    await installPrompt.prompt()

    // Esperar a que el usuario responda al prompt
    const choiceResult = await installPrompt.userChoice

    if (choiceResult.outcome === "accepted") {
      console.log("Usuario aceptó la instalación")
    } else {
      console.log("Usuario rechazó la instalación")
    }

    // Limpiar el prompt guardado
    setInstallPrompt(null)
  }

  if (isInstalled || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 flex items-center justify-between z-50">
      <div>
        <h3 className="font-medium">Instala Routinize</h3>
        <p className="text-sm opacity-90">Añade la app a tu pantalla de inicio para un acceso más rápido</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="sm" onClick={() => setShowBanner(false)}>
          <X className="h-4 w-4 mr-1" />
          Ahora no
        </Button>
        <Button variant="outline" size="sm" onClick={handleInstallClick}>
          <Download className="h-4 w-4 mr-1" />
          Instalar
        </Button>
      </div>
    </div>
  )
}
