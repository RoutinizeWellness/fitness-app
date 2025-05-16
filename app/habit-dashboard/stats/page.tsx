"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import { ChevronDown, ChevronUp, Calendar, ArrowRight } from "lucide-react"

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
    completed: true,
    completionRate: 85,
    color: "#FDA758"
  },
  {
    id: "2",
    title: "Read Book",
    subtitle: "30 minutes daily",
    category: "reading",
    progress: 15,
    goal: 30,
    streak: 3,
    completed: false,
    completionRate: 65,
    color: "#8C80F8"
  },
  {
    id: "3",
    title: "Exercise",
    subtitle: "30 minutes workout",
    category: "exercise",
    progress: 30,
    goal: 30,
    streak: 7,
    completed: true,
    completionRate: 90,
    color: "#5DE292"
  },
  {
    id: "4",
    title: "Healthy Meal",
    subtitle: "Eat vegetables",
    category: "nutrition",
    progress: 2,
    goal: 3,
    streak: 2,
    completed: false,
    completionRate: 70,
    color: "#FF7285"
  },
  {
    id: "5",
    title: "Sleep Well",
    subtitle: "8 hours of sleep",
    category: "sleep",
    progress: 7,
    goal: 8,
    streak: 4,
    completed: false,
    completionRate: 80,
    color: "#5CC2FF"
  }
]

export default function StatsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("stats")
  const [habits, setHabits] = useState(sampleHabits)
  const [timeRange, setTimeRange] = useState("This Week")
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Time range options
  const timeRangeOptions = ["Today", "This Week", "This Month", "This Year"]

  // Handle time range selection
  const handleTimeRangeSelect = (range: string) => {
    setTimeRange(range)
    setShowTimeRangeDropdown(false)
  }

  // Calculate overall completion rate
  const overallCompletionRate = Math.round(
    habits.reduce((sum, habit) => sum + habit.completionRate, 0) / habits.length
  )

  // Sort habits by completion rate (descending)
  const sortedHabits = [...habits].sort((a, b) => b.completionRate - a.completionRate)

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <HabitBuilderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={3}
      />

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Stats Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#573353] mb-1">Statistics</h1>
          <p className="text-[#573353]/70">Track your progress 📊</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 relative">
          <button
            className="w-full bg-white rounded-full py-3.5 px-5 flex items-center justify-between shadow-sm"
            onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-[#573353]/70 mr-3" />
              <span className="text-[#573353] font-medium">{timeRange}</span>
            </div>
            {showTimeRangeDropdown ? (
              <ChevronUp className="h-5 w-5 text-[#573353]/70" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#573353]/70" />
            )}
          </button>

          {showTimeRangeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-md z-10">
              {timeRangeOptions.map((range) => (
                <button
                  key={range}
                  className={`w-full text-left px-5 py-3.5 hover:bg-[#FFF5EB] ${
                    range === timeRange ? 'text-[#FDA758] font-medium' : 'text-[#573353]'
                  }`}
                  onClick={() => handleTimeRangeSelect(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overall Completion Rate */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-[#573353] mb-5">Overall Completion Rate</h2>

          <div className="flex items-center justify-between mb-5">
            <div className="text-4xl font-bold text-[#573353]">{overallCompletionRate}%</div>
            <div className="text-sm text-[#573353]/70 bg-[#F5F5F5] px-3 py-1.5 rounded-full">
              {timeRange}
            </div>
          </div>

          <div className="h-3.5 bg-[#F5F5F5] rounded-full mb-3">
            <div
              className="h-full rounded-full bg-[#FDA758]"
              style={{ width: `${overallCompletionRate}%` }}
            />
          </div>

          <div className="text-sm text-[#573353]/70">
            {overallCompletionRate >= 80
              ? 'Excellent! Keep up the good work. 🎉'
              : overallCompletionRate >= 60
                ? 'Good progress. You can do better! 💪'
                : 'You need to improve your consistency. 🚀'}
          </div>
        </div>

        {/* Habits Completion Rates */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-[#573353]">Habits Completion</h2>
            <button className="text-sm text-[#FDA758] font-medium flex items-center">
              View Details
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {sortedHabits.map((habit) => (
              <div key={habit.id} className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: habit.color }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[#573353] font-medium">{habit.title}</h3>
                      <p className="text-[#573353]/70 text-sm">{habit.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#573353]">{habit.completionRate}%</div>
                </div>

                <div className="h-2 bg-[#F5F5F5] rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${habit.completionRate}%`, backgroundColor: habit.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Overview */}
        <div>
          <h2 className="text-lg font-medium text-[#573353] mb-4">Weekly Overview</h2>

          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-end h-40 mb-4">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                // Generate random height for each bar (in a real app, this would be actual data)
                const height = Math.floor(Math.random() * 80) + 20
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 rounded-full bg-[#FDA758]/20"
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className="w-full rounded-full bg-[#FDA758]"
                        style={{ height: `${height * 0.7}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#573353]/70 mt-2">{day}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <div className="text-[#573353]/70">Average</div>
                <div className="text-[#573353] font-medium">78%</div>
              </div>
              <div>
                <div className="text-[#573353]/70">Best Day</div>
                <div className="text-[#573353] font-medium">Wednesday</div>
              </div>
              <div>
                <div className="text-[#573353]/70">Worst Day</div>
                <div className="text-[#573353] font-medium">Sunday</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
