"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Sparkles, Trophy, Star } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

interface RewardsCardProps {
  className?: string
  onSeeMore?: () => void
}

export function RewardsCard({ className, onSeeMore }: RewardsCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [points, setPoints] = useState(0)
  const [isNew, setIsNew] = useState(true)

  // Simulación de carga de puntos
  useEffect(() => {
    // Aquí podrías cargar los puntos reales desde Supabase
    const timer = setTimeout(() => {
      setPoints(Math.floor(Math.random() * 100))
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSeeMore = () => {
    if (onSeeMore) {
      onSeeMore()
    } else {
      router.push("/rewards")
    }
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500" />

      {/* Etiqueta BETA */}
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className="bg-white/20 text-white border-white/30 rounded-full">
          BETA
        </Badge>
      </div>

      {/* Contenido */}
      <div className="relative p-5 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="bg-white/20 rounded-full p-1.5 mr-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">Routinize Rewards</h3>
          </div>

          <div className="flex items-center mt-3">
            <div className="bg-yellow-400 rounded-full p-2 mr-3 shadow-md">
              <Star className="h-5 w-5 text-yellow-800" />
            </div>
            <span className="text-white text-3xl font-bold">{points}</span>
          </div>

          <button
            onClick={handleSeeMore}
            className="flex items-center text-white/90 text-sm mt-4 hover:text-white bg-white/10 px-3 py-1.5 rounded-full"
          >
            Ver más recompensas
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Mascota/Personaje */}
        <div className="relative h-24 w-24">
          <Image
            src="/images/rewards-mascot.png"
            alt="Rewards Mascot"
            width={120}
            height={120}
            className="object-contain"
            onError={(e) => {
              // Fallback si la imagen no existe
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/120?text=🏆";
            }}
          />

          {/* Personaje secundario */}
          <div className="absolute -bottom-2 -right-2">
            <div className="bg-yellow-300 rounded-full p-2 shadow-lg">
              <Trophy className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
