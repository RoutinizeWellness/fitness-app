"use client"

import React, { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobileOptimizerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  enableZoom?: boolean
  optimizeTouch?: boolean
  adaptFontSize?: boolean
  hideOnMobile?: boolean
  showOnlyOnMobile?: boolean
}

export function MobileOptimizer({
  children,
  className = "",
  mobileClassName = "",
  enableZoom = true,
  optimizeTouch = true,
  adaptFontSize = true,
  hideOnMobile = false,
  showOnlyOnMobile = false,
}: MobileOptimizerProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimizar para dispositivos táctiles
  useEffect(() => {
    if (!mounted) return

    if (isMobile && optimizeTouch) {
      // Aumentar el área táctil para elementos interactivos
      const style = document.createElement('style')
      style.id = 'touch-optimizer'
      style.innerHTML = `
        button, a, .interactive, [role="button"], input, select, textarea {
          min-height: 44px;
          min-width: 44px;
        }
        
        input, select, textarea {
          font-size: 16px; /* Evita zoom automático en iOS */
        }
      `
      document.head.appendChild(style)

      // Controlar el zoom
      const metaViewport = document.querySelector('meta[name="viewport"]')
      if (metaViewport) {
        metaViewport.setAttribute(
          'content',
          `width=device-width, initial-scale=1, maximum-scale=${enableZoom ? '5' : '1'}, user-scalable=${enableZoom ? 'yes' : 'no'}`
        )
      }

      return () => {
        const styleElement = document.getElementById('touch-optimizer')
        if (styleElement) {
          styleElement.remove()
        }
        
        // Restaurar viewport
        if (metaViewport) {
          metaViewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1'
          )
        }
      }
    }
  }, [isMobile, optimizeTouch, enableZoom, mounted])

  // Adaptar tamaño de fuente
  useEffect(() => {
    if (!mounted) return

    if (isMobile && adaptFontSize) {
      const style = document.createElement('style')
      style.id = 'font-size-optimizer'
      style.innerHTML = `
        html {
          font-size: 14px;
        }
        
        h1 {
          font-size: 1.75rem !important;
        }
        
        h2 {
          font-size: 1.5rem !important;
        }
        
        h3 {
          font-size: 1.25rem !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        const styleElement = document.getElementById('font-size-optimizer')
        if (styleElement) {
          styleElement.remove()
        }
      }
    }
  }, [isMobile, adaptFontSize, mounted])

  if (!mounted) return <>{children}</>

  // Ocultar en móvil si se especifica
  if (isMobile && hideOnMobile) return null
  
  // Mostrar solo en móvil si se especifica
  if (!isMobile && showOnlyOnMobile) return null

  return (
    <div className={cn(className, isMobile ? mobileClassName : "")}>
      {children}
    </div>
  )
}

// Componente para mostrar contenido alternativo en móvil
export function MobileAlternative({
  children,
  mobileContent,
}: {
  children: React.ReactNode
  mobileContent: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return <>{isMobile ? mobileContent : children}</>
}

// Componente para optimizar formularios en móvil
export function MobileFormOptimizer({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (isMobile) {
      // Optimizar formularios para móvil
      const style = document.createElement('style')
      style.id = 'form-optimizer'
      style.innerHTML = `
        input, select, textarea {
          font-size: 16px !important; /* Evita zoom automático en iOS */
          padding: 12px !important;
        }
        
        label {
          margin-bottom: 8px !important;
          display: block !important;
        }
        
        button[type="submit"] {
          width: 100% !important;
          margin-top: 16px !important;
          padding: 12px !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        const styleElement = document.getElementById('form-optimizer')
        if (styleElement) {
          styleElement.remove()
        }
      }
    }
  }, [isMobile, mounted])

  if (!mounted) return <>{children}</>

  return (
    <div className={cn("w-full", className, isMobile ? "space-y-4" : "")}>
      {children}
    </div>
  )
}
