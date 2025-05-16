"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HabitBuilderNavigation from "@/components/habit-builder-navigation"
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Moon, 
  Sun,
  Award,
  TrendingUp,
  Calendar,
  Share2,
  HelpCircle,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHabitBuilderTheme } from "@/components/theme/habit-builder-theme-provider"

export default function HabitProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()
  const { theme, setTheme } = useHabitBuilderTheme()
  const [activeTab, setActiveTab] = useState("profile")
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  
  // Handle logout
  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }
  
  return (
    <div className="min-h-screen bg-[rgb(var(--habit-background))]">
      <HabitBuilderNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      <main className="container max-w-md mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <h1 className="habit-h1 mb-6">Profile</h1>
        
        {/* User Profile */}
        <div className="habit-card p-6 mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            
            <div>
              <h2 className="habit-h2">{user?.user_metadata?.full_name || "User"}</h2>
              <p className="habit-body">{user?.email}</p>
              <button 
                className="mt-2 text-sm flex items-center"
                style={{ color: 'rgb(var(--habit-primary))' }}
                onClick={() => router.push("/profile/edit")}
              >
                Edit Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--habit-gradient-primary)' }}>
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Total Habits</span>
            </div>
            <p className="habit-h3">5</p>
          </div>
          
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--habit-gradient-secondary)' }}>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Best Streak</span>
            </div>
            <p className="habit-h3">21 days</p>
          </div>
          
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--habit-gradient-tertiary)' }}>
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Days Active</span>
            </div>
            <p className="habit-h3">45 days</p>
          </div>
          
          <div className="habit-card p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--habit-gradient-success)' }}>
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 habit-caption">Completion Rate</span>
            </div>
            <p className="habit-h3">82%</p>
          </div>
        </div>
        
        {/* Settings */}
        <div className="habit-card p-4 mb-6">
          <h3 className="habit-h3 mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <Bell className="h-4 w-4 text-gray-600" />
                </div>
                <span>Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Sun className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <span>Dark Mode</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--habit-primary))]"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </div>
                <span>Share Progress</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                </div>
                <span>Help & Support</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          className="habit-button w-full mb-6"
          style={{ background: 'var(--habit-gradient-primary)' }}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
        
        {/* App Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Routinize Habit Builder</p>
          <p>Version 1.0.0</p>
        </div>
      </main>
    </div>
  )
}
