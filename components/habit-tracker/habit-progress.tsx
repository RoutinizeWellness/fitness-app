"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitProgressProps {
  habitId: string
  habitName: string
  completedDays: string[] // ISO date strings of completed days
  startDate: string // ISO date string
  className?: string
}

export function HabitProgress({
  habitId,
  habitName,
  completedDays,
  startDate,
  className
}: HabitProgressProps) {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([])

  // Generate current week days
  useEffect(() => {
    const today = new Date()
    const day = today.getDay() // 0 is Sunday, 6 is Saturday

    // Calculate the date of the previous Monday (or today if it's Monday)
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1))

    // Generate array of dates for the week
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDays.push(date)
    }

    setCurrentWeek(weekDays)
  }, [])

  // Format date to YYYY-MM-DD for comparison
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Check if a day is completed
  const isDayCompleted = (date: Date): boolean => {
    const formattedDate = formatDate(date)
    return completedDays.includes(formattedDate)
  }

  // Get day name
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  // Calculate streak
  const calculateStreak = (): number => {
    if (completedDays.length === 0) return 0

    // Sort completed days
    const sortedDays = [...completedDays].sort()

    // Convert to Date objects
    const dates = sortedDays.map(day => new Date(day))

    // Start from the most recent date
    let currentDate = new Date()
    let streak = 0

    // Count backwards until we find a day that wasn't completed
    while (true) {
      const formattedDate = formatDate(currentDate)
      if (completedDays.includes(formattedDate)) {
        streak++
      } else {
        break
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  // Calculate completion rate
  const calculateCompletionRate = (): number => {
    if (completedDays.length === 0) return 0

    const start = new Date(startDate)
    const today = new Date()

    // Calculate total days since start
    const totalDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return Math.round((completedDays.length / totalDays) * 100)
  }

  const streak = calculateStreak()
  const completionRate = calculateCompletionRate()

  return (
    <div className={cn("p-5 bg-white rounded-3xl shadow-sm", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium text-[#573353]">{habitName}</h3>
        <div className="flex items-center text-sm text-[#573353]/70">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Started {new Date(startDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="flex justify-between mb-6">
        {currentWeek.map((date, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center",
              isToday(date) && "font-medium"
            )}
          >
            <span className="text-xs text-[#573353]/70 mb-1">{getDayName(date)}</span>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isDayCompleted(date)
                  ? "bg-[#FDA758] text-white"
                  : "bg-[#F5F5F5] text-[#573353]/40"
              )}
            >
              {isDayCompleted(date) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                date.getDate()
              )}
            </div>
            <span className={cn(
              "text-xs mt-1",
              isToday(date) ? "text-[#FDA758] font-medium" : "text-[#573353]/70"
            )}>
              {isToday(date) ? "Today" : date.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#FFF5EB] p-4 rounded-3xl">
          <div className="text-sm text-[#573353]/70 mb-1">Current Streak</div>
          <div className="text-xl font-bold text-[#573353] flex items-center">
            🔥 {streak} {streak === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="bg-[#FFF5EB] p-4 rounded-3xl">
          <div className="text-sm text-[#573353]/70 mb-1">Completion Rate</div>
          <div className="text-xl font-bold text-[#573353] flex items-center">
            {completionRate}%
          </div>
        </div>
      </div>
    </div>
  )
}
