"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data for habits
const sampleHabits = [
  {
    id: "1",
    title: "Drink Water",
    category: "water",
    color: "var(--habit-gradient-tertiary)",
    completedDates: [
      "2023-05-01", "2023-05-02", "2023-05-03", "2023-05-05",
      "2023-05-06", "2023-05-07", "2023-05-08", "2023-05-10",
      "2023-05-11", "2023-05-12", "2023-05-15", "2023-05-16",
      "2023-05-17", "2023-05-18", "2023-05-19", "2023-05-22",
      "2023-05-23", "2023-05-24", "2023-05-25", "2023-05-26"
    ]
  },
  {
    id: "2",
    title: "Read Book",
    category: "reading",
    color: "var(--habit-gradient-secondary)",
    completedDates: [
      "2023-05-01", "2023-05-03", "2023-05-05", "2023-05-07",
      "2023-05-09", "2023-05-11", "2023-05-13", "2023-05-15",
      "2023-05-17", "2023-05-19", "2023-05-21", "2023-05-23",
      "2023-05-25", "2023-05-27", "2023-05-29"
    ]
  },
  {
    id: "3",
    title: "Exercise",
    category: "exercise",
    color: "var(--habit-gradient-primary)",
    completedDates: [
      "2023-05-01", "2023-05-02", "2023-05-03", "2023-05-04",
      "2023-05-05", "2023-05-08", "2023-05-09", "2023-05-10",
      "2023-05-11", "2023-05-12", "2023-05-15", "2023-05-16",
      "2023-05-17", "2023-05-18", "2023-05-19", "2023-05-22",
      "2023-05-23", "2023-05-24", "2023-05-25", "2023-05-26"
    ]
  }
]

export default function CalendarPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Check if a habit was completed on a specific date
  const isHabitCompletedOnDate = (habitId: string, date: Date): boolean => {
    const habit = sampleHabits.find(h => h.id === habitId)
    if (!habit) return false

    const formattedDate = formatDate(date)
    return habit.completedDates.includes(formattedDate)
  }

  // Get month name
  const getMonthName = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long' })
  }

  // Get year
  const getYear = (date: Date): number => {
    return date.getFullYear()
  }

  // Generate calendar days
  const generateCalendarDays = (): Date[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Array to hold all calendar days
    const days: Date[] = []

    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i)
      days.push(prevMonthDay)
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i))
      }
    }

    return days
  }

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  // Get habits completed on a specific date
  const getHabitsForDate = (date: Date): any[] => {
    const formattedDate = formatDate(date)
    return sampleHabits.filter(habit =>
      habit.completedDates.includes(formattedDate)
    )
  }

  // Calendar days
  const calendarDays = generateCalendarDays()

  return (
    <div className="min-h-screen bg-[rgb(var(--habit-background))]">
      <HabitBuilderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <h1 className="habit-h1 mb-6">Calendar</h1>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>

          <h2 className="habit-h2">
            {getMonthName(currentMonth)} {getYear(currentMonth)}
          </h2>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100"
            onClick={nextMonth}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Calendar */}
        <div className="habit-card p-4 mb-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const habitsForDate = getHabitsForDate(date)
              const hasHabits = habitsForDate.length > 0

              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square p-1 rounded-md cursor-pointer",
                    isCurrentMonth(date) ? "bg-white" : "bg-gray-50 text-gray-400",
                    isToday(date) && "ring-2 ring-[rgb(var(--habit-primary))]",
                    selectedDate && formatDate(date) === formatDate(selectedDate) && "bg-gray-100"
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="h-full flex flex-col">
                    <div className="text-right text-sm p-1">
                      {date.getDate()}
                    </div>

                    {hasHabits && (
                      <div className="flex flex-wrap justify-center mt-auto mb-1">
                        {habitsForDate.slice(0, 3).map((habit, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full mx-0.5"
                            style={{ background: habit.color }}
                          />
                        ))}
                        {habitsForDate.length > 3 && (
                          <span className="text-xs">+{habitsForDate.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="habit-card p-4">
            <h3 className="habit-h3 mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>

            <div className="space-y-3">
              {sampleHabits.map(habit => {
                const isCompleted = isHabitCompletedOnDate(habit.id, selectedDate)

                return (
                  <div
                    key={habit.id}
                    className={cn(
                      "p-3 rounded-lg flex items-center justify-between",
                      isCompleted ? "bg-gray-50" : "bg-gray-50 opacity-60"
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ background: habit.color }}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <X className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{habit.title}</span>
                    </div>

                    <span className="text-sm">
                      {isCompleted ? "Completed" : "Missed"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
