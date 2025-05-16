"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, ChevronRight, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample categories
const categories = [
  { id: "fitness", name: "Fitness", color: "#FDA758" },
  { id: "productivity", name: "Productivity", color: "#8C80F8" },
  { id: "mindfulness", name: "Mindfulness", color: "#5DE292" },
  { id: "health", name: "Health", color: "#FF7285" },
  { id: "learning", name: "Learning", color: "#5CC2FF" }
]

// Sample frequency options
const frequencyOptions = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "custom", name: "Custom" }
]

// Sample reminder times
const reminderTimes = [
  { id: "morning", name: "Morning", time: "08:00 AM" },
  { id: "afternoon", name: "Afternoon", time: "02:00 PM" },
  { id: "evening", name: "Evening", time: "07:00 PM" }
]

export default function AddHabitPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("add")

  // Form state
  const [habitName, setHabitName] = useState("")
  const [habitDescription, setHabitDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>("daily")
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])
  const [selectedReminders, setSelectedReminders] = useState<string[]>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowCategoryDropdown(false)
  }

  // Handle frequency selection
  const handleFrequencySelect = (frequencyId: string) => {
    setSelectedFrequency(frequencyId)
    setShowFrequencyDropdown(false)

    // Reset selected days for certain frequencies
    if (frequencyId === "daily") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])
    } else if (frequencyId === "weekly") {
      setSelectedDays(["mon"])
    } else if (frequencyId === "monthly") {
      setSelectedDays([])
    }
  }

  // Handle day selection
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  // Handle reminder selection
  const handleReminderToggle = (reminderId: string) => {
    if (selectedReminders.includes(reminderId)) {
      setSelectedReminders(selectedReminders.filter(r => r !== reminderId))
    } else {
      setSelectedReminders([...selectedReminders, reminderId])
    }
  }

  // Get selected category
  const getSelectedCategory = () => {
    return categories.find(category => category.id === selectedCategory)
  }

  // Get selected frequency
  const getSelectedFrequency = () => {
    return frequencyOptions.find(frequency => frequency.id === selectedFrequency)
  }

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!habitName) {
      alert("Please enter a habit name")
      return
    }

    if (!selectedCategory) {
      alert("Please select a category")
      return
    }

    if (!selectedFrequency) {
      alert("Please select a frequency")
      return
    }

    if (selectedDays.length === 0 && selectedFrequency !== "monthly") {
      alert("Please select at least one day")
      return
    }

    // Create habit object
    const newHabit = {
      name: habitName,
      description: habitDescription,
      category: selectedCategory,
      frequency: selectedFrequency,
      days: selectedDays,
      reminders: selectedReminders
    }

    console.log("New habit:", newHabit)

    // In a real app, you would save this to your database
    // For now, just navigate back to the dashboard
    router.push("/habit-dashboard")
  }

  // Go back to dashboard
  const goBack = () => {
    router.push("/habit-dashboard")
  }

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <HabitBuilderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={3}
      />

      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white mr-4"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5 text-[#573353]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#573353] mb-1">Create New Habit</h1>
            <p className="text-[#573353]/70">Add a new habit to track</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Habit Name */}
          <div>
            <label htmlFor="habit-name" className="block text-[#573353] font-medium mb-2">
              Habit Name
            </label>
            <Input
              id="habit-name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="e.g. Drink Water"
              className="w-full px-4 py-3 rounded-full border border-gray-200 text-[#573353]"
            />
          </div>

          {/* Habit Description */}
          <div>
            <label htmlFor="habit-description" className="block text-[#573353] font-medium mb-2">
              Description (Optional)
            </label>
            <Textarea
              id="habit-description"
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
              placeholder="e.g. Drink 2 liters of water daily"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#573353] min-h-[100px]"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-[#573353] font-medium mb-2">
              Category
            </label>
            <div className="relative">
              <button
                id="category"
                className="w-full bg-white rounded-full py-3 px-4 flex items-center justify-between border border-gray-200"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                {selectedCategory ? (
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: getSelectedCategory()?.color }}
                    ></div>
                    <span className="text-[#573353]">{getSelectedCategory()?.name}</span>
                  </div>
                ) : (
                  <span className="text-[#573353]/70">Select a category</span>
                )}
                {showCategoryDropdown ? (
                  <ChevronUp className="h-5 w-5 text-[#573353]/70" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#573353]/70" />
                )}
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-md z-10">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className="w-full text-left px-4 py-3 hover:bg-[#FFF5EB] flex items-center"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className={`${selectedCategory === category.id ? 'text-[#FDA758] font-medium' : 'text-[#573353]'}`}>
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-[#573353] font-medium mb-2">
              Frequency
            </label>
            <div className="relative">
              <button
                id="frequency"
                className="w-full bg-white rounded-full py-3 px-4 flex items-center justify-between border border-gray-200"
                onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
              >
                {selectedFrequency ? (
                  <span className="text-[#573353]">{getSelectedFrequency()?.name}</span>
                ) : (
                  <span className="text-[#573353]/70">Select frequency</span>
                )}
                {showFrequencyDropdown ? (
                  <ChevronUp className="h-5 w-5 text-[#573353]/70" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#573353]/70" />
                )}
              </button>

              {showFrequencyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-md z-10">
                  {frequencyOptions.map((frequency) => (
                    <button
                      key={frequency.id}
                      className={`w-full text-left px-4 py-3 hover:bg-[#FFF5EB] ${
                        selectedFrequency === frequency.id ? 'text-[#FDA758] font-medium' : 'text-[#573353]'
                      }`}
                      onClick={() => handleFrequencySelect(frequency.id)}
                    >
                      {frequency.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Days */}
          {(selectedFrequency === "daily" || selectedFrequency === "weekly" || selectedFrequency === "custom") && (
            <div>
              <label className="block text-[#573353] font-medium mb-2">
                Days
              </label>
              <div className="flex justify-between">
                {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                  <button
                    key={day}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedDays.includes(day)
                        ? 'bg-[#FDA758] text-white'
                        : 'bg-white border border-gray-200 text-[#573353]'
                    }`}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminders */}
          <div>
            <label className="block text-[#573353] font-medium mb-2">
              Reminders (Optional)
            </label>
            <div className="space-y-2">
              {reminderTimes.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded-full border ${
                    selectedReminders.includes(reminder.id)
                      ? 'border-[#FDA758] bg-[#FDA758]/10'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => handleReminderToggle(reminder.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      selectedReminders.includes(reminder.id)
                        ? 'bg-[#FDA758] text-white'
                        : 'border border-gray-300'
                    }`}>
                      {selectedReminders.includes(reminder.id) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[#573353]">{reminder.name}</span>
                  </div>
                  <span className="text-[#573353]/70">{reminder.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#FDA758] hover:bg-[#FDA758]/90 text-white font-medium rounded-full py-6"
          >
            Create Habit
          </Button>
        </div>
      </main>
    </div>
  )
}
