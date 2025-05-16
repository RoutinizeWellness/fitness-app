// Tipos para el sistema de notificaciones

export interface Notification {
  id: string
  title: string
  message: string
  type: 'training' | 'nutrition' | 'sleep' | 'productivity' | 'wellness' | 'achievement' | 'system'
  icon: string
  read: boolean
  createdAt: string
  actionUrl?: string
  userId?: string
}

export interface NotificationPreferences {
  userId: string
  enablePush: boolean
  enableEmail: boolean
  enableInApp: boolean
  mutedTypes: string[]
  mutedUntil?: string
  dailySummary: boolean
  weeklySummary: boolean
}
