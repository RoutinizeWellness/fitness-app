"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, User } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { HighContrastToggle } from "@/components/ui/high-contrast-toggle"

interface CircularNavBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function CircularNavBar({ activeTab, onTabChange, className }: CircularNavBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Navigation items with custom icons matching the image
  const navItems = [
    {
      id: "dashboard",
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L2 12H5V21H19V12H22L12 3Z" fill={activeTab === "dashboard" ? "#FF6B6B" : "#888888"} />
          </svg>
        </div>
      ),
      label: "Inicio",
      color: "#FF6B6B",
      route: "/dashboard"
    },
    {
      id: "training",
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z" fill={activeTab === "training" ? "#000000" : "#888888"} />
          </svg>
        </div>
      ),
      label: "Entreno",
      color: "#000000",
      route: "/training"
    },

    {
      id: "nutrition",
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill={activeTab === "nutrition" ? "#444444" : "#888888"} />
          </svg>
        </div>
      ),
      label: "Nutrición",
      color: "#444444",
      route: "/nutrition"
    },
    {
      id: "wellness",
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={activeTab === "wellness" ? "#FF6B6B" : "#888888"} />
          </svg>
        </div>
      ),
      label: "Bienestar",
      color: "#FF6B6B",
      route: "/wellness/recovery"
    },
    {
      id: "profile",
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill={activeTab === "profile" ? "#888888" : "#888888"} />
          </svg>
        </div>
      ),
      label: "Perfil",
      color: "#888888",
      route: "/profile"
    }
  ]

  const toggleAddMenu = () => {
    setIsAddMenuOpen(!isAddMenuOpen)
  }

  // Simular notificaciones no leídas
  useEffect(() => {
    // En una implementación real, esto vendría de una API o base de datos
    setUnreadNotifications(Math.floor(Math.random() * 5))
  }, [])

  return (
    <>
      {/* Header minimalista */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">Routinize</span>
          </div>

          <div className="flex items-center space-x-3">
            <HighContrastToggle />

            <button
              className="relative"
              onClick={() => router.push("/notifications")}
              aria-label={`Notificaciones${unreadNotifications > 0 ? `, ${unreadNotifications} no leídas` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                  aria-hidden="true"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            <button
              onClick={() => router.push("/profile")}
              aria-label="Perfil de usuario"
            >
              <Avatar className="h-8 w-8">
                <img
                  src={profile?.avatar_url || "/placeholder.svg"}
                  alt={`Foto de perfil de ${profile?.full_name || 'usuario'}`}
                />
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de navegación principal */}
      <div className={cn("fixed bottom-6 left-0 right-0 z-50 flex justify-center", className)}>
        <div className="relative">
          {/* Main navigation bar - exact styling from the image */}
          <div className="flex items-center bg-white rounded-full h-14 px-6 shadow-md">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id

            // Add spacing around the center button
            const isBeforeCenter = index === 1
            const isAfterCenter = index === 2

            return (
              <button
                key={item.id}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                  isBeforeCenter ? "mr-12" : isAfterCenter ? "ml-12" : "mx-3",
                  isActive ? "text-primary" : "text-gray-500 hover:text-gray-700 focus:text-gray-700"
                )}
                onClick={() => {
                  onTabChange(item.id)
                  router.push(item.route)
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Center add button - orange circle with plus */}
        <motion.button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#FDA758] rounded-full flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FDA758]"
          whileTap={{ scale: 0.95 }}
          onClick={toggleAddMenu}
          aria-label="Abrir menú de acciones"
          aria-expanded={isAddMenuOpen}
          aria-haspopup="true"
        >
          <motion.div
            animate={{ rotate: isAddMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.button>

        {/* Add menu (optional) */}
        <AnimatePresence>
          {isAddMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -70 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-4 w-48"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              <div className="space-y-2" role="none">
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-offset-1 focus:ring-[#FDA758]"
                  onClick={() => {
                    router.push("/training/new")
                    setIsAddMenuOpen(false)
                  }}
                  role="menuitem"
                >
                  Nuevo Entrenamiento
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-offset-1 focus:ring-[#FDA758]"
                  onClick={() => {
                    router.push("/nutrition/add-meal")
                    setIsAddMenuOpen(false)
                  }}
                  role="menuitem"
                >
                  Nueva Comida
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-offset-1 focus:ring-[#FDA758]"
                  onClick={() => {
                    router.push("/add-habit")
                    setIsAddMenuOpen(false)
                  }}
                  role="menuitem"
                >
                  Nuevo Hábito
                </button>
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-offset-1 focus:ring-[#FDA758]"
                  onClick={() => {
                    router.push("/ai-personalization")
                    setIsAddMenuOpen(false)
                  }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FEA800" />
                  </svg>
                  IA Personalizada
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  )
}

// Import AnimatePresence at the top level to avoid TypeScript errors
import { AnimatePresence } from "framer-motion"
