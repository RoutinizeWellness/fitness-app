"use client"

import { useState } from "react"
import { Check, MoreVertical, Droplets, Book, Dumbbell, Apple, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitCardProps {
  id: string
  title: string
  subtitle?: string
  category: "water" | "reading" | "exercise" | "nutrition" | "sleep" | "custom"
  progress: number
  goal: number
  streak?: number
  completed?: boolean
  onToggleComplete?: (id: string, completed: boolean) => void
  onClick?: () => void
  className?: string
}

export function HabitCard({
  id,
  title,
  subtitle,
  category,
  progress,
  goal,
  streak = 0,
  completed = false,
  onToggleComplete,
  onClick,
  className
}: HabitCardProps) {
  const [isCompleted, setIsCompleted] = useState(completed)

  // Get icon based on category
  const getIcon = () => {
    switch (category) {
      case "water":
        return <Droplets className="h-5 w-5 text-white" />
      case "reading":
        return <Book className="h-5 w-5 text-white" />
      case "exercise":
        return <Dumbbell className="h-5 w-5 text-white" />
      case "nutrition":
        return <Apple className="h-5 w-5 text-white" />
      case "sleep":
        return <Moon className="h-5 w-5 text-white" />
      default:
        return <Check className="h-5 w-5 text-white" />
    }
  }

  // Get background color based on category
  const getBackgroundStyle = () => {
    switch (category) {
      case "water":
        return { background: '#FDA758' }
      case "reading":
        return { background: '#8C80F8' }
      case "exercise":
        return { background: '#5DE292' }
      case "nutrition":
        return { background: '#FF7285' }
      case "sleep":
        return { background: '#5CC2FF' }
      default:
        return { background: '#FDA758' }
    }
  }

  // Handle checkbox click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = !isCompleted
    setIsCompleted(newValue)
    if (onToggleComplete) {
      onToggleComplete(id, newValue)
    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (progress / goal) * 100)

  return (
    <div
      className={cn("bg-white rounded-3xl p-5 shadow-sm flex items-center", className)}
      onClick={onClick}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
        style={getBackgroundStyle()}
      >
        {getIcon()}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[#573353] font-semibold text-base">{title}</h3>
            {subtitle && <p className="text-[#573353]/70 text-sm mt-0.5">{subtitle}</p>}
          </div>

          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center border-2 cursor-pointer",
              isCompleted
                ? "bg-[#FDA758] border-[#FDA758]"
                : "border-[#573353]/30"
            )}
            onClick={handleCheckboxClick}
          >
            {isCompleted && <Check className="h-4 w-4 text-white" />}
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 bg-[#F5F5F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPercentage}%`,
                background: getBackgroundStyle().background
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs">
            <span className="text-[#573353]/70">{progress} / {goal}</span>
            {streak > 0 && (
              <span className="font-medium" style={{ color: getBackgroundStyle().background }}>
                🔥 {streak} day streak
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
