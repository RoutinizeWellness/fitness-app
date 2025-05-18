"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react"
import { motion } from "framer-motion"

interface WorkoutTimerProps {
  duration: number // in seconds
  onComplete?: () => void
  autoStart?: boolean
  showControls?: boolean
  size?: "sm" | "md" | "lg"
}

export default function WorkoutTimer({
  duration,
  onComplete,
  autoStart = false,
  showControls = true,
  size = "md"
}: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress percentage
  const progress = ((duration - timeLeft) / duration) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start timer
  const startTimer = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true)
  }

  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false)
  }

  // Reset timer
  const resetTimer = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeLeft(duration)
  }

  // Skip timer
  const skipTimer = () => {
    setTimeLeft(0)
  }

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsActive(false)
            onComplete && onComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, onComplete])

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration)
    if (autoStart) {
      setIsActive(true)
      setIsPaused(false)
    } else {
      setIsActive(false)
      setIsPaused(false)
    }
  }, [duration, autoStart])

  // Determine size classes
  const sizeClasses = {
    sm: {
      container: "w-24 h-24",
      text: "text-xl",
      progressSize: 4,
      buttonSize: "sm"
    },
    md: {
      container: "w-32 h-32",
      text: "text-2xl",
      progressSize: 6,
      buttonSize: "default"
    },
    lg: {
      container: "w-40 h-40",
      text: "text-3xl",
      progressSize: 8,
      buttonSize: "lg"
    }
  }[size]

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses.container} flex items-center justify-center mb-4`}>
        {/* Circular progress */}
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={sizeClasses.progressSize}
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#FDA758"
            strokeWidth={sizeClasses.progressSize}
            strokeLinecap="round"
            strokeDasharray={283} // 2 * π * r
            strokeDashoffset={283 - (283 * progress) / 100}
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Timer display */}
        <div className={`${sizeClasses.text} font-bold text-[#573353]`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex space-x-2">
          {!isActive ? (
            <Button 
              onClick={startTimer} 
              size={sizeClasses.buttonSize as "default" | "sm" | "lg"} 
              className="bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
            >
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          ) : isPaused ? (
            <Button 
              onClick={resumeTimer} 
              size={sizeClasses.buttonSize as "default" | "sm" | "lg"} 
              className="bg-[#FDA758] hover:bg-[#FDA758]/90 rounded-full"
            >
              <Play className="h-4 w-4 mr-1" />
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              size={sizeClasses.buttonSize as "default" | "sm" | "lg"} 
              variant="outline"
              className="border-[#FDA758]/20 text-[#FDA758] hover:bg-[#FDA758]/10 rounded-full"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pausar
            </Button>
          )}
          
          <Button 
            onClick={resetTimer} 
            size={sizeClasses.buttonSize as "default" | "sm" | "lg"} 
            variant="outline"
            className="border-[#573353]/20 text-[#573353]/70 hover:bg-[#573353]/10 rounded-full"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reiniciar
          </Button>
          
          <Button 
            onClick={skipTimer} 
            size={sizeClasses.buttonSize as "default" | "sm" | "lg"} 
            variant="outline"
            className="border-[#573353]/20 text-[#573353]/70 hover:bg-[#573353]/10 rounded-full"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Omitir
          </Button>
        </div>
      )}
    </div>
  )
}
