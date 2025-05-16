"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Heart, Dumbbell, Utensils, Brain, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrganicElement, OrganicStaggeredList } from "@/components/transitions/organic-transitions"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Tipos para los elementos favoritos
interface FavoriteItem {
  id: string
  type: "workout" | "meal" | "exercise" | "meditation"
  title: string
  description: string
  imageUrl?: string
  discount?: {
    text: string
    isNew?: boolean
  }
}

interface FavoritesSectionProps {
  className?: string
  title?: string
  onSeeAll?: () => void
}

export function FavoritesSection({
  className,
  title = "Tus favoritos",
  onSeeAll
}: FavoritesSectionProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulación de carga de favoritos
  useEffect(() => {
    // Aquí podrías cargar los favoritos reales desde Supabase
    const timer = setTimeout(() => {
      setFavorites([
        {
          id: "1",
          type: "workout",
          title: "Push Pull Legs",
          description: "Rutina completa de 6 días",
          imageUrl: "/images/workouts/ppl.jpg",
          discount: {
            text: "50% off tus primeros 2 meses",
            isNew: true
          }
        },
        {
          id: "2",
          type: "meal",
          title: "Desayuno proteico",
          description: "Alto en proteínas, bajo en grasas",
          imageUrl: "/images/meals/protein-breakfast.jpg",
          discount: {
            text: "50% off tu primer pedido"
          }
        },
        {
          id: "3",
          type: "meditation",
          title: "Meditación guiada",
          description: "10 minutos para reducir estrés",
          imageUrl: "/images/meditation/guided.jpg"
        }
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll()
    } else {
      router.push("/favorites")
    }
  }

  const handleItemClick = (item: FavoriteItem) => {
    switch (item.type) {
      case "workout":
        router.push(`/training/routines/${item.id}`)
        break
      case "meal":
        router.push(`/nutrition/meals/${item.id}`)
        break
      case "exercise":
        router.push(`/training/exercises/${item.id}`)
        break
      case "meditation":
        router.push(`/wellness/meditations/${item.id}`)
        break
    }
  }

  // Icono según el tipo
  const getIcon = (type: FavoriteItem["type"]) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="h-4 w-4" />
      case "meal":
        return <Utensils className="h-4 w-4" />
      case "exercise":
        return <Dumbbell className="h-4 w-4" />
      case "meditation":
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-500 rounded-full"
          onClick={handleSeeAll}
        >
          Ver todo
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} organic={true} className="h-32 animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-800 h-full rounded-xl"></div>
            </Card>
          ))}
        </div>
      ) : (
        <OrganicStaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item)}
              className="cursor-pointer"
            >
              <Card organic={true} hover={true} className="overflow-hidden h-32">
                <div className="relative h-full">
                  {/* Imagen de fondo */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback si la imagen no existe
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/300x150?text=Routinize";
                        }}
                      />
                    )}
                  </div>

                  {/* Overlay oscuro */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Contenido */}
                  <div className="relative h-full p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30 flex items-center rounded-full">
                          {getIcon(item.type)}
                          <span className="ml-1 text-xs">
                            {item.type === "workout" ? "Entrenamiento" :
                             item.type === "meal" ? "Comida" :
                             item.type === "exercise" ? "Ejercicio" : "Meditación"}
                          </span>
                        </Badge>
                      </div>
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-white/80 text-sm">{item.description}</p>
                    </div>

                    {/* Descuento */}
                    {item.discount && (
                      <div className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full inline-flex items-center">
                        {item.discount.isNew && (
                          <span className="bg-white text-blue-500 text-xs px-1.5 py-0.5 rounded-full mr-1.5">Nuevo</span>
                        )}
                        {item.discount.text}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </OrganicStaggeredList>
      )}
    </div>
  )
}
