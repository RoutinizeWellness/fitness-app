"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ProfileEditor } from "@/components/profile/profile-editor"
import { NotificationsList } from "@/components/profile/notifications-list"
import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"

interface ProfileModalProps {
  trigger?: React.ReactNode
  defaultView?: "profile" | "notifications"
  unreadCount?: number
}

export function ProfileModal({ 
  trigger, 
  defaultView = "profile",
  unreadCount = 0
}: ProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<"profile" | "notifications">(defaultView)
  
  const handleClose = () => {
    setIsOpen(false)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="p-0 h-auto">
            <User className="h-6 w-6 text-[#573353]" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-3 text-center ${
              view === "profile" 
                ? "text-[#FDA758] border-b-2 border-[#FDA758]" 
                : "text-[#573353]"
            }`}
            onClick={() => setView("profile")}
          >
            Profile
          </button>
          
          <button
            className={`flex-1 py-3 text-center relative ${
              view === "notifications" 
                ? "text-[#FDA758] border-b-2 border-[#FDA758]" 
                : "text-[#573353]"
            }`}
            onClick={() => setView("notifications")}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute top-2 right-1/4 w-5 h-5 rounded-full bg-[#FDA758] text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        
        {view === "profile" ? (
          <ProfileEditor onClose={handleClose} />
        ) : (
          <NotificationsList onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
