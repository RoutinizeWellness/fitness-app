"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { ChevronRight, Bell, Shield, Info, HelpCircle, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ProfileService, UserSettings } from "@/lib/services/profile-service"
import { NotificationService } from "@/lib/services/notification-service"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para las configuraciones
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [notifications, setNotifications] = useState({
    enabled: true,
    customizeNotifications: true
  })

  const [moreCustomization, setMoreCustomization] = useState({
    enabled: true
  })

  // Servicios
  const profileService = new ProfileService(supabase)
  const notificationService = new NotificationService(supabase)

  // Cargar configuraciones del usuario
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadUserSettings = async () => {
      try {
        const userSettings = await profileService.getUserSettings(user.id)

        if (userSettings) {
          setSettings(userSettings)

          // Actualizar estados de UI
          setNotifications({
            enabled: userSettings.notifications_enabled || true,
            customizeNotifications: userSettings.customize_notifications || true
          })

          setMoreCustomization({
            enabled: userSettings.more_customization_enabled || true
          })
        }
      } catch (error) {
        console.error("Error loading user settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Using default values.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserSettings()
  }, [user, router, supabase])

  // Guardar cambios en las configuraciones
  const saveSettings = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const updatedSettings: UserSettings = {
        user_id: user.id,
        notifications_enabled: notifications.enabled,
        customize_notifications: notifications.customizeNotifications,
        more_customization_enabled: moreCustomization.enabled
      }

      const result = await profileService.updateUserSettings(updatedSettings)

      if (result) {
        toast({
          title: "Success",
          description: "Settings saved successfully.",
        })

        // Actualizar estado local
        setSettings(result)
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar notificaciones
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: value }

      // Guardar automáticamente los cambios
      setTimeout(() => {
        saveSettings()
      }, 500)

      return updated
    })
  }

  // Actualizar más personalización
  const handleCustomizationChange = (value: boolean) => {
    setMoreCustomization({ enabled: value })

    // Guardar automáticamente los cambios
    setTimeout(() => {
      saveSettings()
    }, 500)
  }

  // Solicitar permiso para notificaciones push
  const requestPushPermission = async () => {
    if (!user) return

    try {
      const permissionGranted = await notificationService.requestPushPermission()

      if (permissionGranted) {
        toast({
          title: "Success",
          description: "Push notifications enabled successfully.",
        })

        // Actualizar estado local
        setNotifications(prev => ({ ...prev, enabled: true }))

        // Guardar en la base de datos
        saveSettings()
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
        })
      }
    } catch (error) {
      console.error("Error requesting push permission:", error)
      toast({
        title: "Error",
        description: "Failed to enable push notifications.",
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
        <Link href="/profile/habit-dashboard" className="text-[#573353]">
          <ChevronRight className="h-6 w-6 transform rotate-180" />
        </Link>
        <h1 className="text-[#573353] text-lg font-medium">Settings</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Profile Section */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h3 className="text-[#573353] text-lg font-medium mb-4">Check Your Profile</h3>
        <div className="flex items-center justify-between bg-[#FFF2E9] rounded-2xl p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
              <User className="h-6 w-6 text-[#FDA758]" />
            </div>
            <div>
              <h4 className="text-[#573353] text-base font-medium">
                {user?.user_metadata?.full_name || "User"}
              </h4>
              <p className="text-[#573353]/70 text-xs">{user?.email}</p>
            </div>
          </div>
          <button className="bg-[#FDA758] text-white px-4 py-2 rounded-xl text-sm">
            View
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-6">
        <h3 className="text-[#573353] text-lg font-medium mb-4">General</h3>

        {/* Notifications */}
        <div className="border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <Bell className="h-4 w-4 text-[#FDA758]" />
              </div>
              <div>
                <h4 className="text-[#573353] text-base font-medium">Notifications</h4>
                <p className="text-[#573353]/70 text-xs">Customize notifications</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[#573353] text-sm">Enable notifications</span>
            <Switch
              checked={notifications.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  // Si está activando, solicitar permiso
                  requestPushPermission()
                } else {
                  // Si está desactivando, simplemente actualizar
                  handleNotificationChange('enabled', checked)
                }
              }}
              className="data-[state=checked]:bg-[#FDA758]"
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#573353] text-sm">Customize notifications to fit your usage</span>
            <Switch
              checked={notifications.customizeNotifications}
              onCheckedChange={(checked) => handleNotificationChange('customizeNotifications', checked)}
              className="data-[state=checked]:bg-[#FDA758]"
              disabled={!notifications.enabled || isSaving}
            />
          </div>
        </div>

        {/* More Customization */}
        <div className="border-b border-gray-100 pb-4 mb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z" stroke="#FDA758" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#573353] text-base font-medium">More customization</h4>
                  <p className="text-[#573353]/70 text-xs">Customize more to fit your usage</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#573353]" />
            </div>

            <div className="flex items-center justify-between pl-11">
              <span className="text-[#573353] text-sm">Enable advanced customization</span>
              <Switch
                checked={moreCustomization.enabled}
                onCheckedChange={(checked) => handleCustomizationChange(checked)}
                className="data-[state=checked]:bg-[#FDA758]"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm mb-20">
        <h3 className="text-[#573353] text-lg font-medium mb-4">Support</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <HelpCircle className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">Contact</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </div>

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V13" stroke="#FDA758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.9946 16H12.0036" stroke="#FDA758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[#573353]">Feedback</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </div>

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <Shield className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">Privacy Policy</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </div>

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FDA758]/20 flex items-center justify-center mr-3">
                <Info className="h-4 w-4 text-[#FDA758]" />
              </div>
              <span className="text-[#573353]">About</span>
            </div>
            <ChevronRight className="h-5 w-5 text-[#573353]" />
          </div>
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
