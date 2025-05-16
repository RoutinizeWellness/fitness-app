"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutCardProps {
  id: string
  title: string
  duration: number
  equipmentType: string
  imageUrl?: string
  isLocked?: boolean
  onClick?: () => void
  className?: string
}

export function WorkoutCard({
  id,
  title,
  duration,
  equipmentType,
  imageUrl,
  isLocked = false,
  onClick,
  className
}: WorkoutCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (!isLocked) {
      router.push(`/training/workouts/${id}`)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-background shadow-sm border border-border/50",
        isLocked ? "opacity-80" : "",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex h-full">
        {/* Imagen del entrenamiento */}
        <div className="relative h-24 w-24 flex-shrink-0 rounded-l-[20px] overflow-hidden">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
              <span className="text-2xl font-bold text-primary/70">
                {title.charAt(0)}
              </span>
            </div>
          )}

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Lock className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Información del entrenamiento */}
        <div className="flex flex-1 flex-col justify-center p-4">
          <h3 className="font-medium line-clamp-2">{title}</h3>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">{duration} min</span>
            <span className="mx-2">•</span>
            <span className="text-xs">{equipmentType}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface WorkoutListProps {
  workouts: WorkoutCardProps[]
  className?: string
  emptyMessage?: string
}

export function WorkoutList({
  workouts,
  className,
  emptyMessage = "No workouts found"
}: WorkoutListProps) {
  if (!workouts || workouts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          id={workout.id}
          title={workout.title}
          duration={workout.duration}
          equipmentType={workout.equipmentType}
          imageUrl={workout.imageUrl}
          isLocked={workout.isLocked}
          onClick={workout.onClick}
        />
      ))}
    </div>
  )
}
