"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, Clock, Wind, 
  ChevronRight, Filter, Search,
  Lungs, RefreshCw
} from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getBreathSessions, BreathSession } from "@/lib/breathing-service"
import { useUser } from "@/hooks/use-user"

interface BreathingHistoryProps {
  onSelectSession?: (session: BreathSession) => void
  className?: string
}

export function BreathingHistory({
  onSelectSession,
  className
}: BreathingHistoryProps) {
  const [sessions, setSessions] = useState<BreathSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("")
  
  const { user } = useUser()
  
  // Cargar sesiones
  const loadSessions = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      const { data, error } = await getBreathSessions(user.id)
      
      if (error) {
        console.error('Error al cargar sesiones:', error)
        return
      }
      
      setSessions(data || [])
    } catch (error) {
      console.error('Error al cargar sesiones:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cargar sesiones al montar el componente
  useEffect(() => {
    loadSessions()
  }, [user])
  
  // Filtrar sesiones
  const filteredSessions = sessions.filter(session => {
    if (!filter) return true
    
    const searchLower = filter.toLowerCase()
    const date = new Date(session.date).toLocaleDateString()
    const notes = session.notes?.toLowerCase() || ""
    
    return (
      date.includes(searchLower) ||
      session.sessionType.toLowerCase().includes(searchLower) ||
      notes.includes(searchLower)
    )
  })
  
  // Formatear el tipo de sesión
  const formatSessionType = (type: string) => {
    switch (type) {
      case 'wim_hof':
        return 'Wim Hof'
      case 'box_breathing':
        return 'Respiración cuadrada'
      case 'alternate_nostril':
        return 'Fosas nasales alternas'
      default:
        return type.replace('_', ' ')
    }
  }
  
  // Formatear el tiempo en minutos y segundos
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card3D className={className}>
        <Card3DHeader>
          <Card3DTitle>Historial de respiración</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <Card3D className={className}>
      <Card3DHeader>
        <div className="flex justify-between items-center">
          <Card3DTitle>Historial de respiración</Card3DTitle>
          <Button3D variant="ghost" size="icon" onClick={loadSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button3D>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar sesiones..."
              className="pl-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="text-center py-6">
              <Wind className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay sesiones</h3>
              <p className="text-sm text-gray-500">
                {filter ? "No se encontraron sesiones con ese filtro." : "Completa tu primera sesión de respiración."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <Card3D 
                    key={session.id} 
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectSession && onSelectSession(session)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span className="mx-1 text-gray-300">•</span>
                          <Badge variant="outline" className="text-xs">
                            {formatSessionType(session.sessionType)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <div className="text-xs text-gray-500">Rondas</div>
                            <div className="font-medium">{session.rounds}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">Promedio</div>
                            <div className="font-medium">{formatTime(session.avgRetentionTime)}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">Máximo</div>
                            <div className="font-medium">{formatTime(session.maxRetentionTime)}</div>
                          </div>
                          
                          {session.feelingBefore !== undefined && session.feelingAfter !== undefined && (
                            <div>
                              <div className="text-xs text-gray-500">Cambio</div>
                              <div className="font-medium">
                                {session.feelingAfter > session.feelingBefore ? '+' : ''}
                                {session.feelingAfter - session.feelingBefore}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {session.notes && (
                          <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {session.notes}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  </Card3D>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card3DContent>
    </Card3D>
  )
}
