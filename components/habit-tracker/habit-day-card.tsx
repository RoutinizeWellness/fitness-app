"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface HabitDayCardProps {
  day: number
  isActive?: boolean
  isToday?: boolean
  onClick?: () => void
  className?: string
}

export function HabitDayCard({
  day,
  isActive = false,
  isToday = false,
  onClick,
  className,
}: HabitDayCardProps) {
  return (
    <div
      className={cn(
        "relative w-10 h-10 rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
        isActive ? "bg-white shadow-sm" : "bg-transparent",
        isToday && "ring-2 ring-[#573353]",
        className
      )}
      onClick={onClick}
    >
      {/* Vector line at top */}
      <div className="absolute top-[2%] left-[34%] right-[34%] border-t-3 border-[#573353] shadow-habit"></div>

      {/* Day label */}
      <div className="text-[10px] font-bold text-[#573353] opacity-50 leading-[13px] tracking-tight">
        Day
      </div>

      {/* Date number */}
      <div className="text-base font-bold text-[#573353] leading-[13px] tracking-tight">
        {day}
      </div>
    </div>
  )
}

export function HabitDayGrid({
  selectedDay,
  onSelectDay,
  startDay = 1,
  daysCount = 31,
  className,
}: {
  selectedDay: number
  onSelectDay: (day: number) => void
  startDay?: number
  daysCount?: number
  className?: string
}) {
  const today = new Date().getDate()

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {Array.from({ length: daysCount }, (_, i) => startDay + i).map((day) => (
        <HabitDayCard
          key={day}
          day={day}
          isActive={selectedDay === day}
          isToday={today === day}
          onClick={() => onSelectDay(day)}
        />
      ))}
    </div>
  )
}
