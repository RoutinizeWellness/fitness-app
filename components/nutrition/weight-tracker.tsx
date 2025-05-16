"use client"

import { useState, useEffect } from "react"
import { 
  Card3D, 
  Card3DContent, 
  Card3DHeader, 
  Card3DTitle 
} from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Scale, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  getWeightLogs, 
  addWeightLog, 
  updateWeightLog, 
  deleteWeightLog 
} from "@/lib/nutrition-profile-service"
import { WeightLog } from "@/lib/types/nutrition"
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"

interface WeightTrackerProps {
  userId: string
  initialWeight?: number
  targetWeight?: number
}

export function WeightTracker({
  userId,
  initialWeight,
  targetWeight
}: WeightTrackerProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedLog, setSelectedLog] = useState<WeightLog | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    notes: ''
  })
  
  // Cargar registros de peso
  useEffect(() => {
    const loadWeightLogs = async () => {
      setIsLoading(true)
      
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        
        const { data, error } = await getWeightLogs(userId, {
          startDate: start,
          endDate: end
        })
        
        if (error) {
          console.error("Error al cargar registros de peso:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los registros de peso",
            variant: "destructive"
          })
        } else if (data) {
          setWeightLogs(data)
        }
      } catch (error) {
        console.error("Error inesperado:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadWeightLogs()
    }
  }, [userId, currentMonth, toast])
  
  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Abrir diálogo de edición
  const handleEdit = (log: WeightLog) => {
    setSelectedLog(log)
    setFormData({
      date: format(parseISO(log.date), 'yyyy-MM-dd'),
      weight: log.weight,
      notes: log.notes || ''
    })
    setShowEditDialog(true)
  }
  
  // Guardar nuevo registro
  const handleSave = async () => {
    try {
      const { data, error } = await addWeightLog({
        user_id: userId,
        date: formData.date,
        weight: formData.weight,
        notes: formData.notes
      })
      
      if (error) throw error
      
      setWeightLogs(prev => [data, ...prev])
      setShowAddDialog(false)
      
      toast({
        title: "Registro guardado",
        description: "Tu registro de peso ha sido guardado correctamente"
      })
    } catch (error) {
      console.error("Error al guardar registro:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el registro de peso",
        variant: "destructive"
      })
    }
  }
  
  // Actualizar registro existente
  const handleUpdate = async () => {
    if (!selectedLog) return
    
    try {
      const { data, error } = await updateWeightLog(selectedLog.id, {
        date: formData.date,
        weight: formData.weight,
        notes: formData.notes
      })
      
      if (error) throw error
      
      setWeightLogs(prev => prev.map(log => 
        log.id === selectedLog.id ? data : log
      ))
      setShowEditDialog(false)
      
      toast({
        title: "Registro actualizado",
        description: "Tu registro de peso ha sido actualizado correctamente"
      })
    } catch (error) {
      console.error("Error al actualizar registro:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de peso",
        variant: "destructive"
      })
    }
  }
  
  // Eliminar registro
  const handleDelete = async () => {
    if (!selectedLog) return
    
    try {
      const { error } = await deleteWeightLog(selectedLog.id)
      
      if (error) throw error
      
      setWeightLogs(prev => prev.filter(log => log.id !== selectedLog.id))
      setShowEditDialog(false)
      
      toast({
        title: "Registro eliminado",
        description: "Tu registro de peso ha sido eliminado correctamente"
      })
    } catch (error) {
      console.error("Error al eliminar registro:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de peso",
        variant: "destructive"
      })
    }
  }
  
  // Navegar entre meses
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }
  
  // Calcular estadísticas
  const calculateStats = () => {
    if (weightLogs.length === 0) return null
    
    const sortedLogs = [...weightLogs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const firstLog = sortedLogs[0]
    const lastLog = sortedLogs[sortedLogs.length - 1]
    
    const weightChange = lastLog.weight - firstLog.weight
    const weightChangePercent = (weightChange / firstLog.weight) * 100
    
    return {
      firstWeight: firstLog.weight,
      lastWeight: lastLog.weight,
      weightChange,
      weightChangePercent
    }
  }
  
  const stats = calculateStats()
  
  if (isLoading) {
    return (
      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Seguimiento de Peso</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card3DContent>
      </Card3D>
    )
  }
  
  return (
    <>
      <Card3D>
        <Card3DHeader>
          <div className="flex justify-between items-center">
            <Card3DTitle>Seguimiento de Peso</Card3DTitle>
            
            <Button3D size="sm" onClick={() => {
              setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                weight: weightLogs.length > 0 ? weightLogs[0].weight : initialWeight || 70,
                notes: ''
              })
              setShowAddDialog(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir
            </Button3D>
          </div>
        </Card3DHeader>
        <Card3DContent>
          {/* Navegación de meses */}
          <div className="flex justify-between items-center mb-4">
            <Button3D variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button3D>
            
            <h3 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            
            <Button3D variant="outline" size="sm" onClick={handleNextMonth}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button3D>
          </div>
          
          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${
                stats.weightChange < 0 ? 'bg-green-50' : 
                stats.weightChange > 0 ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center mb-2">
                  {stats.weightChange < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
                  ) : stats.weightChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                  ) : (
                    <Minus className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-sm font-medium">Cambio de peso</span>
                </div>
                <div className={`text-xl font-bold ${
                  stats.weightChange < 0 ? 'text-green-600' : 
                  stats.weightChange > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-500">
                  {stats.weightChangePercent.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Scale className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Peso actual</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {stats.lastWeight.toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-500">
                  {format(parseISO(weightLogs[0].date), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>
          )}
          
          {/* Lista de registros */}
          {weightLogs.length > 0 ? (
            <div className="space-y-3">
              {weightLogs.map(log => (
                <div 
                  key={log.id} 
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => handleEdit(log)}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{log.weight.toFixed(1)} kg</div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(log.date), 'EEEE, d MMMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                  
                  <Button3D variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button3D>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin registros de peso</h3>
              <p className="text-sm text-gray-500 mb-4">
                Añade tu primer registro de peso para comenzar el seguimiento
              </p>
              <Button3D onClick={() => {
                setFormData({
                  date: format(new Date(), 'yyyy-MM-dd'),
                  weight: initialWeight || 70,
                  notes: ''
                })
                setShowAddDialog(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir registro
              </Button3D>
            </div>
          )}
        </Card3DContent>
      </Card3D>
      
      {/* Diálogo para añadir registro */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir registro de peso</DialogTitle>
            <DialogDescription>
              Registra tu peso actual para hacer seguimiento de tu progreso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Añade notas sobre tu peso, como factores que pueden haberlo afectado"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button3D variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button3D>
            <Button3D onClick={handleSave}>
              Guardar
            </Button3D>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar registro */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar registro de peso</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu registro de peso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Peso (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas (opcional)</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Añade notas sobre tu peso, como factores que pueden haberlo afectado"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button3D variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button3D>
            <div className="space-x-2">
              <Button3D variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button3D>
              <Button3D onClick={handleUpdate}>
                Guardar cambios
              </Button3D>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
