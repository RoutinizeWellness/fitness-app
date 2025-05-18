"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  title: string
  description?: string
  timestamp: string | Date
  icon?: React.ReactNode
  status?: "completed" | "in-progress" | "planned" | "cancelled"
  category?: string
}

interface ActivityCardProps {
  title: string
  items: ActivityItem[]
  maxItems?: number
  showTimestamp?: boolean
  className?: string
  emptyMessage?: string
  onItemClick?: (item: ActivityItem) => void
}

export function ActivityCard({
  title,
  items,
  maxItems = 5,
  showTimestamp = true,
  className,
  emptyMessage = "No hay actividades recientes",
  onItemClick,
}: ActivityCardProps) {
  const displayItems = items.slice(0, maxItems)
  
  // Formatear fecha
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    }).format(dateObj)
  }
  
  // Estilos de estado
  const statusStyles = {
    "completed": "bg-green-500",
    "in-progress": "bg-blue-500",
    "planned": "bg-orange-500",
    "cancelled": "bg-red-500",
  }
  
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      
      {displayItems.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {displayItems.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "flex items-start p-2 rounded-md hover:bg-muted/50 transition-colors",
                onItemClick && "cursor-pointer"
              )}
              onClick={() => onItemClick && onItemClick(item)}
            >
              {/* Icono o indicador de estado */}
              <div className="mr-3 mt-0.5">
                {item.icon ? (
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                ) : (
                  item.status && (
                    <div className="relative flex h-2 w-2 mt-1.5">
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        statusStyles[item.status]
                      )} />
                      <span className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        statusStyles[item.status]
                      )} />
                    </div>
                  )
                )}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {showTimestamp && (
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {formatDate(item.timestamp)}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.category && (
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      
      {items.length > maxItems && (
        <div className="mt-3 text-center">
          <button className="text-xs text-primary hover:underline">
            Ver todas ({items.length})
          </button>
        </div>
      )}
    </div>
  )
}
