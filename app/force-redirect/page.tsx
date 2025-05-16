"use client"

import { useEffect } from "react"
import { PulseLoader } from "@/components/ui/enhanced-skeletons"

export default function ForceRedirectPage() {
  useEffect(() => {
    // Función para forzar la redirección
    const forceRedirect = () => {
      console.log("Forzando redirección al dashboard desde página dedicada")
      
      // Usar window.location.replace (método más fuerte)
      window.location.replace("/dashboard")
    }
    
    // Ejecutar inmediatamente
    forceRedirect()
    
    // También configurar un intervalo para intentar cada 500ms
    const redirectInterval = setInterval(() => {
      if (window.location.pathname !== "/dashboard") {
        console.log("Reintentando redirección...")
        forceRedirect()
      } else {
        clearInterval(redirectInterval)
      }
    }, 500)
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(redirectInterval)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF3E9]">
      <h1 className="text-2xl font-bold mb-6 text-[#573353]">Redirigiendo al Dashboard</h1>
      <PulseLoader message="Redirigiendo..." />
      
      <div className="mt-8">
        <p className="text-[#573353] mb-4">Si no eres redirigido automáticamente, haz clic en el botón:</p>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-6 py-3 bg-[#FDA758] text-white rounded-full font-medium hover:bg-[#FDA758]/90 transition-colors"
        >
          Ir al Dashboard
        </button>
      </div>
      
      <div className="mt-8 max-w-md text-center">
        <p className="text-[#573353] text-sm">
          Si continúas teniendo problemas, intenta limpiar la caché de tu navegador o abrir la aplicación en una ventana de incógnito.
        </p>
      </div>
      
      {/* Script para forzar redirección */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Función para forzar redirección
          function forceRedirectToDashboard() {
            console.log("Ejecutando script de redirección");
            window.location.replace("/dashboard");
          }
          
          // Ejecutar inmediatamente
          forceRedirectToDashboard();
          
          // También intentar después de un breve retraso
          setTimeout(forceRedirectToDashboard, 100);
          setTimeout(forceRedirectToDashboard, 500);
          setTimeout(forceRedirectToDashboard, 1000);
        `
      }} />
    </div>
  )
}
