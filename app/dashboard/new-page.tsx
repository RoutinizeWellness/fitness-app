"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import HomepageTrackingHabits from "@/components/habit-tracker/HomepageTrackingHabits"

// Sample data for habits
const sampleHabits = [
  {
    id: "1",
    title: "Read a book",
    subtitle: "30 minutes daily",
    category: "reading",
    progress: 30,
    goal: 30,
    streak: 5,
    completed: true
  },
  {
    id: "2",
    title: "Exercise",
    subtitle: "30 minutes workout",
    category: "exercise",
    progress: 30,
    goal: 30,
    streak: 7,
    completed: true
  },
  {
    id: "3",
    title: "Wake up early",
    subtitle: "Before 7:00 AM",
    category: "productivity",
    progress: 1,
    goal: 1,
    streak: 3,
    completed: true
  },
  {
    id: "4",
    title: "Walk Dog",
    subtitle: "30 minutes walk",
    category: "health",
    progress: 30,
    goal: 30,
    streak: 4,
    completed: true
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [habits, setHabits] = useState(sampleHabits)

  // Redirect to welcome if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/welcome")
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Don't show anything if not authenticated (redirecting)
  if (!user) {
    return null
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] mx-auto overflow-hidden relative">
      <HabitBuilderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={3}
      />

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#573353] mb-1">Hello, {user?.user_metadata?.full_name || "User"}!</h1>
          <p className="text-[#573353]/70">Let's make today count 💪</p>
        </div>

        {/* Motivational Quote */}
        <div className="mb-8 bg-white rounded-[24px] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FDA758]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#8C80F8]/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <h2 className="text-xl font-bold text-[#573353] mb-2">WE FIRST MAKE OUR HABITS, AND THEN OUR HABITS MAKES US.</h2>
          <p className="text-[#573353]/70 text-sm">-ANONYMOUS</p>
        </div>

        {/* In Progress Habits */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[#573353] mb-4">IN PROGRESS</h2>

          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="bg-white rounded-[24px] p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg mr-4 flex items-center justify-center ${
                    habit.category === 'reading' ? 'bg-[#FDA758]/20' :
                    habit.category === 'exercise' ? 'bg-[#FF6767]/20' :
                    habit.category === 'productivity' ? 'bg-[#8C80F8]/20' :
                    'bg-[#5DE292]/20'
                  }`}>
                    <div className={`w-8 h-8 rounded-md ${
                      habit.category === 'reading' ? 'bg-[#FDA758]' :
                      habit.category === 'exercise' ? 'bg-[#FF6767]' :
                      habit.category === 'productivity' ? 'bg-[#8C80F8]' :
                      'bg-[#5DE292]'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#573353]">{habit.title}</h3>
                    <p className="text-sm text-[#573353]/70">{habit.subtitle}</p>
                  </div>
                </div>
                <button className="bg-[#F5F5F5] text-[#573353] font-medium rounded-full px-4 py-2 text-sm">
                  Done!
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[#573353] mb-4">Weekly Progress</h2>

          {/* Enhanced Tracking Visualization */}
          <HomepageTrackingHabits />

          <p className="text-center text-[#573353]/70 text-sm mt-3">
            Track your daily habits and build consistency
          </p>
        </div>

        {/* Add Habit Button */}
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          <button className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  )
}
