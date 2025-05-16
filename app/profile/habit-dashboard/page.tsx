"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { ChevronRight, Settings, CreditCard, User, LogOut, Bell } from "lucide-react"
import { ProfileModal } from "@/components/profile/profile-modal"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ProfileEditor } from "@/components/profile/profile-editor"
import { NotificationsList } from "@/components/profile/notifications-list"
import { ProfileService, HabitProgress, UserStats } from "@/lib/services/profile-service"
import { NotificationService } from "@/lib/services/notification-service"
import { toast } from "@/components/ui/use-toast"

export default function ProfileDashboardPage() {
  const { user, signOut } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Estados para datos del perfil
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [habitProgress, setHabitProgress] = useState<HabitProgress[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Servicios
  const profileService = new ProfileService(supabase)
  const notificationService = new NotificationService(supabase)

  // Cargar datos del perfil
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadProfileData = async () => {
      try {
        // Cargar estadísticas del usuario
        const stats = await profileService.getUserStats(user.id)
        if (stats) {
          setUserStats(stats)
        } else {
          // Si no hay estadísticas, usar datos de ejemplo
          setUserStats({
            weekly_habits: 18,
            completed_habits: 12,
            streak_days: 20
          })
        }

        // Cargar progreso de hábitos
        const progress = await profileService.getHabitProgress(user.id)
        if (progress && progress.length > 0) {
          setHabitProgress(progress)
        } else {
          // Si no hay progreso, usar datos de ejemplo
          setHabitProgress([
            { user_id: user.id, habit_id: "1", habit_name: "Sleep", progress: 75 },
            { user_id: user.id, habit_id: "2", habit_name: "Diet", progress: 60 },
            { user_id: user.id, habit_id: "3", habit_name: "Gym", progress: 90 },
            { user_id: user.id, habit_id: "4", habit_name: "Study", progress: 45 },
            { user_id: user.id, habit_id: "5", habit_name: "Water", progress: 80 },
            { user_id: user.id, habit_id: "6", habit_name: "Meditate", progress: 65 }
          ])
        }

        // Cargar conteo de notificaciones no leídas
        const unreadCount = await notificationService.getUnreadCount(user.id)
        setUnreadNotifications(unreadCount)

      } catch (error) {
        console.error("Error loading profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [user, router, supabase])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF3E9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA758]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href="/habit-dashboard" className="text-[#573353]">
          <ChevronRight className="h-6 w-6 transform rotate-180" />
        </Link>
        <h1 className="text-[#573353] text-lg font-medium">Profile</h1>
        <ProfileModal
          trigger={
            <button className="relative">
              <Bell className="h-6 w-6 text-[#573353]" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FDA758] text-white text-xs flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
          }
          defaultView="notifications"
          unreadCount={unreadNotifications}
        />
      </div>

      {/* Profile Card */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center">
          <Dialog>
            <DialogTrigger>
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#FDA758]/20 mr-4 cursor-pointer">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#573353] text-xl font-medium">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0">
              <ProfileEditor />
            </DialogContent>
          </Dialog>

          <div>
            <h2 className="text-[#573353] text-lg font-medium">
              {user?.user_metadata?.full_name || "User"}
            </h2>
            <p className="text-[#573353]/70 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-[#FFF2E9] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-[#573353] text-xs">Weekly Habits</div>
              <div className="w-6 h-6 rounded-full bg-[#FDA758]/20 flex items-center justify-center">
                <span className="text-[#FDA758] text-xs">🔥</span>
              </div>
            </div>
            <div className="mt-2 text-[#573353] text-2xl font-bold">{userStats?.weekly_habits || 0}</div>
          </div>

          <div className="bg-[#FFF2E9] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-[#573353] text-xs">Completed</div>
              <div className="w-6 h-6 rounded-full bg-[#FDA758]/20 flex items-center justify-center">
                <span className="text-[#FDA758] text-xs">✓</span>
              </div>
            </div>
            <div className="mt-2 text-[#573353] text-2xl font-bold">{userStats?.completed_habits || 0}</div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="mt-4 flex items-center justify-between p-4 bg-[#FFF2E9] rounded-2xl">
          <div>
            <div className="text-[#573353] text-sm font-medium">Longest Streak</div>
            <div className="text-[#573353] text-lg font-bold">{userStats?.streak_days || 0} Days</div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#573353]" />
        </div>
      </div>

      {/* Habit Progress */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h3 className="text-[#573353] text-lg font-medium mb-4">Habit Progress</h3>
        <div className="space-y-4">
          {habitProgress.length > 0 ? (
            habitProgress.map((habit, index) => (
              <div key={habit.habit_id || index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#573353] text-sm">{habit.habit_name}</span>
                  <span className="text-[#573353] text-sm">{habit.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#FFF2E9] rounded-full">
                  <div
                    className="h-2 bg-[#FDA758] rounded-full"
                    style={{ width: `${habit.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[#573353]/70">
              <p>No habits tracked yet.</p>
              <Link href="/habit-dashboard/habits" className="text-[#FDA758] mt-2 inline-block">
                Start tracking habits
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Menu Options */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="space-y-4">
          <Link href="/profile/habit-settings" className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <Settings className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </Link>

          <Link href="/profile/habit-subscription" className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <CreditCard className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">Subscription</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-2"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">Log out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3">
        <Link href="/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.02 2.84L3.63 7.04C2.73 7.74 2 9.23 2 10.36V17.77C2 20.09 3.89 21.99 6.21 21.99H17.79C20.11 21.99 22 20.09 22 17.78V10.5C22 9.29 21.19 7.74 20.2 7.05L14.02 2.72C12.62 1.74 10.37 1.79 9.02 2.84Z" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17.99V14.99" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Home</span>
        </Link>

        <Link href="/habit-dashboard/habits" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="#573353" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="#573353" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13.01H12" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9.01H12" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.99561 13H6.00459" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.99561 9H6.00459" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Habits</span>
        </Link>

        <Link href="/habit-dashboard/stats" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10.74V13.94" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V15.68" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 10.74V13.94" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#573353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#573353]/70 mt-1">Stats</span>
        </Link>

        <Link href="/profile/habit-dashboard" className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-[#FDA758] mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
