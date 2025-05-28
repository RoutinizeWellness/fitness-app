"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/contexts/notification-context"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { NotificationProvider } from "@/lib/contexts/notification-context"
import { cn } from "@/lib/utils"

interface NotificationIconProps {
  className?: string
  iconClassName?: string
  badgeClassName?: string
}

export function NotificationIcon({
  className,
  iconClassName,
  badgeClassName
}: NotificationIconProps) {
  const { unreadCount, isLoading } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [animateBadge, setAnimateBadge] = useState(false)

  // Animar el badge cuando cambia el número de notificaciones no leídas
  useEffect(() => {
    if (unreadCount > 0) {
      setAnimateBadge(true)
      const timeout = setTimeout(() => {
        setAnimateBadge(false)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [unreadCount])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={() => setIsOpen(true)}
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} no leídas` : ''}`}
      >
        <Bell className={cn("h-5 w-5", iconClassName)} />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium",
              animateBadge && "animate-pulse",
              badgeClassName
            )}
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationProvider>
        <NotificationCenter isOpen={isOpen} onOpenChange={setIsOpen} />
      </NotificationProvider>
    </>
  )
}
