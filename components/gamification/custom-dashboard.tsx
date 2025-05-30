"use client"

import { useState, useEffect } from 'react'
import { getUserDashboards, createDashboard, updateDashboard, DashboardWidget, UserDashboard } from '@/lib/custom-dashboard-service'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeClientButton as Button } from '@/components/ui/safe-client-button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Settings, BarChart, LineChart, PieChart, Calendar, Table, Gauge, Edit, Trash2, Move, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function CustomDashboard() {
  const [dashboards, setDashboards] = useState<UserDashboard[]>([])
  const [activeDashboard, setActiveDashboard] = useState<UserDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [newWidgetConfig, setNewWidgetConfig] = useState<Partial<DashboardWidget>>({
    title: '',
    type: 'workout_frequency',
    size: 'medium',
    config: {
      dataSource: 'workout_sessions',
      timeRange: 'month',
      visualization: 'bar',
      metrics: ['count'],
      colors: ['#FDA758']
    }
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboards() {
      if (!user) return

      try {
        setLoading(true)
        const userDashboards = await getUserDashboards(user.id)
        setDashboards(userDashboards)

        if (userDashboards.length > 0) {
          setActiveDashboard(userDashboards[0])
        }
      } catch (error) {
        console.error('Error loading dashboards:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los dashboards',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboards()
  }, [user, toast])

  const handleCreateDashboard = async () => {
    if (!user || !newDashboardName.trim()) return

    try {
      const newDashboard = await createDashboard(user.id, newDashboardName)

      if (newDashboard) {
        setDashboards(prev => [...prev, newDashboard])
        setActiveDashboard(newDashboard)
        setNewDashboardName('')

        toast({
          title: 'Dashboard creado',
          description: `Se ha creado el dashboard "${newDashboardName}"`,
        })
      }
    } catch (error) {
      console.error('Error creating dashboard:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear el dashboard',
        variant: 'destructive'
      })
    }
  }

  const handleAddWidget = async () => {
    if (!user || !activeDashboard) return

    try {
      // Create a new widget with the current configuration
      const newWidget: DashboardWidget = {
        id: crypto.randomUUID(),
        title: newWidgetConfig.title || 'Nuevo Widget',
        type: newWidgetConfig.type || 'workout_frequency',
        size: newWidgetConfig.size || 'medium',
        position: {
          x: 0,
          y: activeDashboard.widgets.length > 0 ?
              Math.max(...activeDashboard.widgets.map(w => w.position.y)) + 1 :
              0
        },
        config: newWidgetConfig.config || {
          dataSource: 'workout_sessions',
          timeRange: 'month',
          visualization: 'bar',
          metrics: ['count'],
          colors: ['#FDA758']
        }
      }

      // Update the dashboard with the new widget
      const updatedDashboard = {
        ...activeDashboard,
        widgets: [...activeDashboard.widgets, newWidget]
      }

      const success = await updateDashboard(user.id, activeDashboard.id, updatedDashboard)

      if (success) {
        setActiveDashboard(updatedDashboard)
        setDashboards(prev =>
          prev.map(d => d.id === activeDashboard.id ? updatedDashboard : d)
        )

        toast({
          title: 'Widget añadido',
          description: `Se ha añadido el widget "${newWidget.title}"`,
        })
      }
    } catch (error) {
      console.error('Error adding widget:', error)
      toast({
        title: 'Error',
        description: 'No se pudo añadir el widget',
        variant: 'destructive'
      })
    }
  }

  const handleRemoveWidget = async (widgetId: string) => {
    if (!user || !activeDashboard) return

    try {
      // Remove the widget from the dashboard
      const updatedDashboard = {
        ...activeDashboard,
        widgets: activeDashboard.widgets.filter(w => w.id !== widgetId)
      }

      const success = await updateDashboard(user.id, activeDashboard.id, updatedDashboard)

      if (success) {
        setActiveDashboard(updatedDashboard)
        setDashboards(prev =>
          prev.map(d => d.id === activeDashboard.id ? updatedDashboard : d)
        )

        toast({
          title: 'Widget eliminado',
          description: 'Se ha eliminado el widget',
        })
      }
    } catch (error) {
      console.error('Error removing widget:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el widget',
        variant: 'destructive'
      })
    }
  }

  const renderWidgetContent = (widget: DashboardWidget) => {
    // This is a placeholder for actual widget rendering
    // In a real implementation, this would render different visualizations based on widget type and config

    switch (widget.config.visualization) {
      case 'bar':
        return (
          <div className="flex items-center justify-center h-full">
            <BarChart className="h-12 w-12 text-[#FDA758] opacity-50" />
          </div>
        )
      case 'line':
        return (
          <div className="flex items-center justify-center h-full">
            <LineChart className="h-12 w-12 text-[#5DE292] opacity-50" />
          </div>
        )
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <PieChart className="h-12 w-12 text-[#8C80F8] opacity-50" />
          </div>
        )
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-full">
            <Calendar className="h-12 w-12 text-[#FF6767] opacity-50" />
          </div>
        )
      case 'table':
        return (
          <div className="flex items-center justify-center h-full">
            <Table className="h-12 w-12 text-[#5CC2FF] opacity-50" />
          </div>
        )
      case 'progress':
      case 'card':
        return (
          <div className="flex items-center justify-center h-full">
            <Gauge className="h-12 w-12 text-[#FDA758] opacity-50" />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[#573353]/50">Vista previa no disponible</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cargando dashboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDA758]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activeDashboard) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Dashboard Personalizado</CardTitle>
          <CardDescription>No hay dashboards disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center">
            <p className="text-sm text-[#573353]/70 mb-4">Crea tu primer dashboard personalizado</p>
            <div className="flex space-x-2">
              <Input
                placeholder="Nombre del dashboard"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                className="w-64"
              />
              <Button
                onClick={handleCreateDashboard}
                disabled={!newDashboardName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">{activeDashboard.name}</CardTitle>
            <CardDescription>
              Dashboard personalizado con {activeDashboard.widgets.length} widgets
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Añadir Widget</DialogTitle>
                  <DialogDescription>
                    Configura un nuevo widget para tu dashboard.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Título</label>
                    <Input
                      className="col-span-3"
                      placeholder="Título del widget"
                      value={newWidgetConfig.title || ''}
                      onChange={(e) => setNewWidgetConfig(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Tipo</label>
                    <Select
                      value={newWidgetConfig.type}
                      onValueChange={(value) => setNewWidgetConfig(prev => ({
                        ...prev,
                        type: value as any
                      }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de widget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workout_frequency">Frecuencia de Entrenamiento</SelectItem>
                        <SelectItem value="workout_performance">Rendimiento de Entrenamiento</SelectItem>
                        <SelectItem value="nutrition_tracker">Seguimiento Nutricional</SelectItem>
                        <SelectItem value="goal_progress">Progreso de Objetivos</SelectItem>
                        <SelectItem value="body_metrics">Métricas Corporales</SelectItem>
                        <SelectItem value="streak_calendar">Calendario de Racha</SelectItem>
                        <SelectItem value="personal_records">Récords Personales</SelectItem>
                        <SelectItem value="recovery_metrics">Métricas de Recuperación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Tamaño</label>
                    <Select
                      value={newWidgetConfig.size}
                      onValueChange={(value) => setNewWidgetConfig(prev => ({
                        ...prev,
                        size: value as any
                      }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tamaño del widget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Mediano</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Visualización</label>
                    <Select
                      value={newWidgetConfig.config?.visualization}
                      onValueChange={(value) => setNewWidgetConfig(prev => ({
                        ...prev,
                        config: {
                          ...prev.config!,
                          visualization: value as any
                        }
                      }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Tipo de visualización" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Gráfico de Barras</SelectItem>
                        <SelectItem value="line">Gráfico de Líneas</SelectItem>
                        <SelectItem value="pie">Gráfico Circular</SelectItem>
                        <SelectItem value="progress">Barra de Progreso</SelectItem>
                        <SelectItem value="calendar">Calendario</SelectItem>
                        <SelectItem value="table">Tabla</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleAddWidget}>
                    Añadir Widget
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {activeDashboard.widgets.map(widget => (
            <div
              key={widget.id}
              className={`
                ${widget.size === 'small' ? 'col-span-1' :
                  widget.size === 'large' ? 'col-span-2' : 'col-span-1'}
                ${isEditing ? 'border-2 border-dashed border-[#FDA758]/50' : ''}
              `}
            >
              <Card>
                <CardHeader className="p-3 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => handleRemoveWidget(widget.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`
                    ${widget.size === 'small' ? 'h-24' :
                      widget.size === 'large' ? 'h-48' : 'h-32'}
                  `}>
                    {renderWidgetContent(widget)}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {activeDashboard.widgets.length === 0 && (
            <div className="col-span-2 h-48 flex items-center justify-center bg-[#F9F9F9] rounded-lg">
              <div className="text-center">
                <p className="text-sm text-[#573353]/70 mb-4">No hay widgets en este dashboard</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Widget
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    {/* Dialog content same as above */}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
