"use client"

import { useState, useEffect } from "react"
import { HabitCard } from "./habit-card"
import { BarChart2, Calendar, TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface Habit {
  id: string
  title: string
  subtitle?: string
  category: "water" | "reading" | "exercise" | "nutrition" | "sleep" | "custom"
  progress: number
  goal: number
  streak: number
  completed: boolean
}

interface HabitDashboardProps {
  habits: Habit[]
  userName: string
  className?: string
}

export function HabitDashboard({
  habits,
  userName,
  className
}: HabitDashboardProps) {
  const [greeting, setGreeting] = useState("")
  const [todayHabits, setTodayHabits] = useState<Habit[]>([])
  const [completedCount, setCompletedCount] = useState(0)

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()

    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }

    // Set today's habits
    setTodayHabits(habits)

    // Count completed habits
    const completed = habits.filter(habit => habit.completed).length
    setCompletedCount(completed)
  }, [habits])

  // Handle habit completion toggle
  const handleToggleComplete = (id: string, completed: boolean) => {
    setTodayHabits(prev =>
      prev.map(habit =>
        habit.id === id ? { ...habit, completed } : habit
      )
    )

    // Update completed count
    setCompletedCount(prev => completed ? prev + 1 : prev - 1)
  }

  // Calculate completion percentage
  const completionPercentage = todayHabits.length > 0
    ? Math.round((completedCount / todayHabits.length) * 100)
    : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#573353]">{greeting}, {userName}</h1>
        <p className="text-[#573353]/70 mt-1">Track your daily habits</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-lg font-medium text-[#573353] mb-4">Today's Progress</h3>

        <div className="h-2.5 bg-[#F5F5F5] rounded-full mb-3">
          <div
            className="h-full rounded-full bg-[#FDA758]"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-[#573353]/70">{completedCount} of {todayHabits.length} completed</span>
          <span className="text-sm font-medium text-[#FDA758]">{completionPercentage}%</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDA758]">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-[#573353]/70 text-sm">Current Streak</span>
          </div>
          <p className="text-xl font-bold text-[#573353]">7 days</p>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDA758]">
              <Award className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-[#573353]/70 text-sm">Best Streak</span>
          </div>
          <p className="text-xl font-bold text-[#573353]">14 days</p>
        </div>
      </div>

      {/* Habits List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[#573353]">Today's Habits</h3>
          <button className="text-sm text-[#FDA758] flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            View Calendar
          </button>
        </div>

        <div className="space-y-4">
          {todayHabits.length > 0 ? (
            todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                category={habit.category}
                progress={habit.progress}
                goal={habit.goal}
                streak={habit.streak}
                completed={habit.completed}
                onToggleComplete={handleToggleComplete}
              />
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-3xl shadow-sm">
              <p className="text-[#573353]/70">No habits for today</p>
              <button
                className="mt-4 px-6 py-3 bg-[#FDA758] text-white rounded-full font-medium"
              >
                Add a Habit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDA758]">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-medium text-[#573353] ml-3">Insights</h3>
        </div>

        <p className="text-[#573353]/70 mb-4">You're most consistent with your water intake habit. Keep it up!</p>

        <button className="w-full py-3 rounded-full border-2 border-[#FDA758] text-[#FDA758] font-medium">
          View Detailed Analytics
        </button>
      </div>
    </div>
  )
}
