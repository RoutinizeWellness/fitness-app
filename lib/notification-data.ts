import { Notification } from "@/lib/types/notifications"

// Datos de notificaciones para demostración
export const notificationData: Notification[] = [
  {
    id: "notif-1",
    title: "Nuevo entrenamiento disponible",
    message: "Hemos añadido un nuevo entrenamiento de yoga para ti.",
    type: "training",
    icon: "dumbbell",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    actionUrl: "/routinize?tab=training"
  },
  {
    id: "notif-2",
    title: "¡Felicidades!",
    message: "Has completado tu objetivo semanal de actividad.",
    type: "achievement",
    icon: "heart",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    actionUrl: "/routinize?tab=stats"
  },
  {
    id: "notif-3",
    title: "Recordatorio de meditación",
    message: "No olvides tu sesión de meditación diaria.",
    type: "wellness",
    icon: "brain",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    actionUrl: "/routinize?tab=wellness"
  },
  {
    id: "notif-4",
    title: "Actualización de la aplicación",
    message: "Hemos añadido nuevas funcionalidades a la aplicación.",
    type: "system",
    icon: "bell",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
    actionUrl: "/routinize"
  },
  {
    id: "notif-5",
    title: "Nuevo plan nutricional",
    message: "Hemos creado un nuevo plan nutricional basado en tus preferencias.",
    type: "nutrition",
    icon: "utensils",
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
    actionUrl: "/routinize?tab=nutrition"
  }
]
