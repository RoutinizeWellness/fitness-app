"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import { 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  Award,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data for habit progress
const sampleHabitProgress = [
  {
    id: "1",
    name: "Drink Water",
    category: "water",
    color: "var(--habit-gradient-tertiary)",
    streak: 5,
    longestStreak: 12,
    completionRate: 85,
    weeklyData: [
      { day: "Mon", completed: true, value: 2 },
      { day: "Tue", completed: true, value: 2 },
      { day: "Wed", completed: true, value: 1.5 },
      { day: "Thu", completed: false, value: 1 },
      { day: "Fri", completed: true, value: 2 },
      { day: "Sat", completed: true, value: 1.8 },
      { day: "Sun", completed: false, value: 0.5 }
    ],
    monthlyData: [0.8, 0.9, 0.7, 0.85]
  },
  {
    id: "2",
    name: "Read Book",
    category: "reading",
    color: "var(--habit-gradient-secondary)",
    streak: 3,
    longestStreak: 14,
    completionRate: 70,
    weeklyData: [
      { day: "Mon", completed: true, value: 30 },
      { day: "Tue", completed: true, value: 25 },
      { day: "Wed", completed: false, value: 10 },
      { day: "Thu", completed: true, value: 30 },
      { day: "Fri", completed: false, value: 15 },
      { day: "Sat", completed: true, value: 45 },
      { day: "Sun", completed: false, value: 0 }
    ],
    monthlyData: [0.6, 0.8, 0.7, 0.65]
  },
  {
    id: "3",
    name: "Exercise",
    category: "exercise",
    color: "var(--habit-gradient-primary)",
    streak: 7,
    longestStreak: 21,
    completionRate: 90,
    weeklyData: [
      { day: "Mon", completed: true, value: 30 },
      { day: "Tue", completed: true, value: 45 },
      { day: "Wed", completed: true, value: 30 },
      { day: "Thu", completed: true, value: 60 },
      { day: "Fri", completed: true, value: 30 },
      { day: "Sat", completed: true, value: 45 },
      { day: "Sun", completed: true, value: 30 }
    ],
    monthlyData: [0.85, 0.9, 0.95, 0.9]
  }
]

export default function HabitProgressPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("progress")
  const [selectedHabit, setSelectedHabit] = useState(sampleHabitProgress[0])
  const [timeframe, setTimeframe] = useState("week")
  const [currentWeek, setCurrentWeek] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(0)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])
  
  // Handle habit selection
  const handleHabitSelect = (habit: any) => {
    setSelectedHabit(habit)
  }
  
  // Navigate timeframe
  const navigatePrevious = () => {
    if (timeframe === "week") {
      setCurrentWeek(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }
  
  const navigateNext = () => {
    if (timeframe === "week" && currentWeek > 0) {
      setCurrentWeek(prev => prev - 1)
    } else if (timeframe === "month" && currentMonth > 0) {
      setCurrentMonth(prev => prev - 1)
    }
  }
  
  // Get timeframe label
  const getTimeframeLabel = () => {
    if (timeframe === "week") {
      if (currentWeek === 0) return "This Week"
      if (currentWeek === 1) return "Last Week"
      return `${currentWeek} Weeks Ago`
    } else {
      if (currentMonth === 0) return "This Month"
      if (currentMonth === 1) return "Last Month"
      return `${currentMonth} Months Ago`
    }
  }
  
  return (
    <div className="min-h-screen bg-[rgb(var(--habit-background))]">
      <HabitBuilderNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <h1 className="habit-h1 mb-6">Progress Tracking</h1>
        
        {/* Habit Selection */}
        <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4">
          {sampleHabitProgress.map(habit => (
            <div
              key={habit.id}
              className={cn(
                "habit-card flex-shrink-0 p-4 mr-4 w-40 cursor-pointer",
                selectedHabit.id === habit.id && "ring-2 ring-offset-2"
              )}
              style={selectedHabit.id === habit.id ? { ringColor: habit.color.split(',')[0].replace('var(--habit-gradient-', 'rgb(var(--habit-').replace(')', '')') } : {}}
              onClick={() => handleHabitSelect(habit)}
            >
              <h3 className="font-medium mb-2">{habit.name}</h3>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{habit.streak} day streak</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: selectedHabit.color }}>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Current Streak</span>
            </div>
            <p className="habit-h3">{selectedHabit.streak} days</p>
          </div>
          
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: selectedHabit.color }}>
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Best Streak</span>
            </div>
            <p className="habit-h3">{selectedHabit.longestStreak} days</p>
          </div>
          
          <div className="habit-card p-4 col-span-2">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: selectedHabit.color }}>
                <BarChart2 className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Completion Rate</span>
            </div>
            <div className="mt-2">
              <div className="habit-progress-container mb-2">
                <div 
                  className="habit-progress-bar"
                  style={{ 
                    width: `${selectedHabit.completionRate}%`,
                    background: selectedHabit.color
                  }}
                />
              </div>
              <p className="habit-h3">{selectedHabit.completionRate}%</p>
            </div>
          </div>
        </div>
        
        {/* Timeframe Selection */}
        <div className="habit-card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                className={cn(
                  "px-4 py-2 rounded-full text-sm",
                  timeframe === "week" 
                    ? "bg-[rgb(var(--habit-primary))] text-white" 
                    : "bg-gray-100 text-gray-600"
                )}
                onClick={() => setTimeframe("week")}
              >
                Week
              </button>
              <button
                className={cn(
                  "px-4 py-2 rounded-full text-sm",
                  timeframe === "month" 
                    ? "bg-[rgb(var(--habit-primary))] text-white" 
                    : "bg-gray-100 text-gray-600"
                )}
                onClick={() => setTimeframe("month")}
              >
                Month
              </button>
            </div>
            
            <div className="flex items-center">
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
                onClick={navigatePrevious}
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <span className="mx-2 text-sm">{getTimeframeLabel()}</span>
              <button 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  (timeframe === "week" && currentWeek === 0) || (timeframe === "month" && currentMonth === 0)
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 text-gray-500"
                )}
                onClick={navigateNext}
                disabled={(timeframe === "week" && currentWeek === 0) || (timeframe === "month" && currentMonth === 0)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Weekly Chart */}
          {timeframe === "week" && (
            <div>
              <div className="flex justify-between mb-2">
                {selectedHabit.weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                        day.completed ? "text-white" : "bg-gray-100 text-gray-400"
                      )}
                      style={day.completed ? { background: selectedHabit.color } : {}}
                    >
                      {day.completed ? "✓" : "✗"}
                    </div>
                    <span className="text-xs">{day.day}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-end h-32 mb-2">
                  {selectedHabit.weeklyData.map((day, index) => {
                    // Calculate height percentage based on value
                    const maxValue = Math.max(...selectedHabit.weeklyData.map(d => d.value))
                    const heightPercentage = (day.value / maxValue) * 100
                    
                    return (
                      <div 
                        key={index}
                        className="w-8 rounded-t-md"
                        style={{ 
                          height: `${heightPercentage}%`,
                          background: day.completed ? selectedHabit.color : 'rgba(var(--habit-text-tertiary), 0.3)'
                        }}
                      />
                    )
                  })}
                </div>
                
                <div className="flex justify-between">
                  {selectedHabit.weeklyData.map((day, index) => (
                    <div key={index} className="text-xs text-center w-8">
                      {day.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Monthly Chart */}
          {timeframe === "month" && (
            <div>
              <div className="flex justify-between items-end h-32 mb-2">
                {selectedHabit.monthlyData.map((value, index) => (
                  <div 
                    key={index}
                    className="w-16 rounded-t-md"
                    style={{ 
                      height: `${value * 100}%`,
                      background: selectedHabit.color
                    }}
                  />
                ))}
              </div>
              
              <div className="flex justify-between">
                <div className="text-xs text-center w-16">Week 1</div>
                <div className="text-xs text-center w-16">Week 2</div>
                <div className="text-xs text-center w-16">Week 3</div>
                <div className="text-xs text-center w-16">Week 4</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Insights */}
        <div className="habit-card p-6">
          <h3 className="habit-h3 mb-4">Insights</h3>
          
          <div className="space-y-4">
            <p className="habit-body">
              You've been consistent with your {selectedHabit.name} habit. Keep up the good work!
            </p>
            
            <p className="habit-body">
              Your current streak of {selectedHabit.streak} days is impressive. Your best streak is {selectedHabit.longestStreak} days.
            </p>
            
            <p className="habit-body">
              Your completion rate of {selectedHabit.completionRate}% shows your dedication.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
