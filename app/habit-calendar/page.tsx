"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import { HabitCard } from "@/components/habit-tracker/habit-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Sample data for habits
const sampleHabits = [
  {
    id: "1",
    title: "Drink Water",
    subtitle: "2 liters daily",
    category: "water",
    progress: 1.5,
    goal: 2,
    streak: 5,
    completed: true
  },
  {
    id: "2",
    title: "Read Book",
    subtitle: "30 minutes daily",
    category: "reading",
    progress: 15,
    goal: 30,
    streak: 3,
    completed: false
  },
  {
    id: "3",
    title: "Exercise",
    subtitle: "30 minutes workout",
    category: "exercise",
    progress: 30,
    goal: 30,
    streak: 7,
    completed: true
  }
]

export default function HabitCalendarPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("calendar")
  const [habits, setHabits] = useState(sampleHabits)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Handle habit completion toggle
  const handleToggleComplete = (id: string, completed: boolean) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === id ? { ...habit, completed } : habit
      )
    )
  }

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    // Adjust for starting week on Monday (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
  }

  // Check if a date is in the past
  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' })
  }

  // Get day name
  const getDayName = (date: Date) => {
    return date.toLocaleString('default', { weekday: 'short' })
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <HabitBuilderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={3}
      />

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Calendar Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#573353] mb-1">Calendar</h1>
          <p className="text-[#573353]/70">Track your habits progress 📅</p>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousMonth}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="h-6 w-6 text-[#573353]" />
          </button>

          <h2 className="text-xl font-semibold text-[#573353]">
            {getMonthName(currentMonth)} {currentMonth.getFullYear()}
          </h2>

          <button
            onClick={goToNextMonth}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"
          >
            <ChevronRight className="h-6 w-6 text-[#573353]" />
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={index} className="text-center text-[#573353]/70 text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square p-1">
                {day ? (
                  <button
                    onClick={() => handleDateSelect(day)}
                    className={`w-full h-full rounded-full flex items-center justify-center text-sm font-medium
                      ${isToday(day) ? 'border-2 border-[#FDA758] font-semibold' : ''}
                      ${isSelected(day) ? 'bg-[#FDA758] text-white shadow-sm' : ''}
                      ${!isToday(day) && !isSelected(day) && isPast(day) ? 'bg-[#F5F5F5] text-[#573353]/50' : ''}
                      ${!isToday(day) && !isSelected(day) && !isPast(day) ? 'hover:bg-[#FFF5EB] text-[#573353]' : ''}
                    `}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#573353]">
              {getDayName(selectedDate)}, {selectedDate.getDate()} {getMonthName(selectedDate)}
            </h2>

            <div className="bg-[#F5F5F5] px-3 py-1.5 rounded-full text-sm text-[#573353]/70">
              {habits.length} habits
            </div>
          </div>

          {/* Habits for Selected Date */}
          <div className="space-y-4">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                category={habit.category as any}
                progress={habit.progress}
                goal={habit.goal}
                streak={habit.streak}
                completed={habit.completed}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
