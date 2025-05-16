"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2, LineChart, Scale, Ruler } from "lucide-react"
import { 
  getBodyMeasurements, 
  addBodyMeasurement, 
  updateBodyMeasurement, 
  deleteBodyMeasurement,
  getHealthData,
  type BodyMeasurement
} from "@/lib/body-measurements"
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface MedidasCorporalesProps {
  userId: string
}

export default function MedidasCorporales({ userId }: MedidasCorporalesProps) {
  const { toast } = useToast()
  
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("registro")
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState<BodyMeasurement | null>(null)
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    body_fat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: ""
  })
  
  // Cargar medidas corporales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Cargar medidas corporales
        const { data, error } = await getBodyMeasurements(userId, {
          orderBy: { column: 'date', ascending: false }
        })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setMeasurements(data)
        }
      } catch (error) {
        console.error("Error al cargar medidas corporales:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las medidas corporales",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [userId, toast])
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      weight: "",
      body_fat: "",
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: ""
    })
    setSelectedMeasurement(null)
  }
  
  // Abrir diálogo para editar medida
  const handleEditMeasurement = (measurement: BodyMeasurement) => {
    setSelectedMeasurement(measurement)
    setFormData({
      date: measurement.date,
      weight: measurement.weight?.toString() || "",
      body_fat: measurement.body_fat?.toString() || "",
      chest: measurement.chest?.toString() || "",
      waist: measurement.waist?.toString() || "",
      hips: measurement.hips?.toString() || "",
      arms: measurement.arms?.toString() || "",
      thighs: measurement.thighs?.toString() || ""
    })
    setDialogOpen(true)
  }
  
  // Abrir diálogo para nueva medida
  const handleNewMeasurement = () => {
    resetForm()
    setDialogOpen(true)
  }
  
  // Validar formulario
  const validateForm = () => {
    // Al menos un campo debe tener valor
    return (
      formData.weight.trim() !== "" ||
      formData.body_fat.trim() !== "" ||
      formData.chest.trim() !== "" ||
      formData.waist.trim() !== "" ||
      formData.hips.trim() !== "" ||
      formData.arms.trim() !== "" ||
      formData.thighs.trim() !== ""
    )
  }
  
  // Guardar medida corporal
  const handleSaveMeasurement = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Debes completar al menos un campo de medida",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const measurementData = {
        user_id: userId,
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        body_fat: formData.body_fat ? parseFloat(formData.body_fat) : undefined,
        chest: formData.chest ? parseFloat(formData.chest) : undefined,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        hips: formData.hips ? parseFloat(formData.hips) : undefined,
        arms: formData.arms ? parseFloat(formData.arms) : undefined,
        thighs: formData.thighs ? parseFloat(formData.thighs) : undefined
      }
      
      if (selectedMeasurement) {
        // Actualizar medida existente
        const { data, error } = await updateBodyMeasurement(selectedMeasurement.id, measurementData)
        
        if (error) {
          throw error
        }
        
        if (data) {
          // Actualizar lista de medidas
          setMeasurements(measurements.map(m => m.id === data.id ? data : m))
          
          toast({
            title: "Medida actualizada",
            description: "La medida corporal ha sido actualizada correctamente",
          })
        }
      } else {
        // Crear nueva medida
        const { data, error } = await addBodyMeasurement(measurementData)
        
        if (error) {
          throw error
        }
        
        if (data) {
          // Añadir a la lista de medidas
          setMeasurements([data, ...measurements])
          
          toast({
            title: "Medida registrada",
            description: "La medida corporal ha sido registrada correctamente",
          })
        }
      }
      
      // Cerrar diálogo y resetear formulario
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error al guardar medida corporal:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la medida corporal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Eliminar medida corporal
  const handleDeleteMeasurement = async (id: string) => {
    try {
      const { error } = await deleteBodyMeasurement(id)
      
      if (error) {
        throw error
      }
      
      // Actualizar lista de medidas
      setMeasurements(measurements.filter(m => m.id !== id))
      
      toast({
        title: "Medida eliminada",
        description: "La medida corporal ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar medida corporal:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la medida corporal",
        variant: "destructive",
      })
    }
  }
  
  // Preparar datos para gráficos
  const prepareChartData = () => {
    // Ordenar medidas por fecha (ascendente)
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    return sortedMeasurements.map(m => ({
      date: format(new Date(m.date), "dd/MM/yy"),
      weight: m.weight,
      body_fat: m.body_fat,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      arms: m.arms,
      thighs: m.thighs
    }))
  }
  
  const chartData = prepareChartData()
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="registro">Registro</TabsTrigger>
            <TabsTrigger value="progreso">Progreso</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleNewMeasurement}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Medida
          </Button>
        </div>
        
        <TabsContent value="registro" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Scale className="h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Cargando medidas corporales...</p>
            </div>
          ) : measurements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay medidas registradas</h3>
                <p className="text-gray-500 mb-4">
                  Registra tus medidas corporales para hacer seguimiento de tu progreso
                </p>
                <Button onClick={handleNewMeasurement}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Medidas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <Card key={measurement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {format(new Date(measurement.date), "PPP", { locale: es })}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {measurement.weight !== undefined && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Peso</p>
                          <p className="text-lg font-medium">{measurement.weight} kg</p>
                        </div>
                      )}
                      
                      {measurement.body_fat !== undefined && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Grasa Corporal</p>
                          <p className="text-lg font-medium">{measurement.body_fat}%</p>
                        </div>
                      )}
                      
                      {measurement.chest !== undefined && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Pecho</p>
                          <p className="text-lg font-medium">{measurement.chest} cm</p>
                        </div>
                      )}
                      
                      {measurement.waist !== undefined && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Cintura</p>
                          <p className="text-lg font-medium">{measurement.waist} cm</p>
                        </div>
                      )}
                      
                      {measurement.hips !== undefined && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Cadera</p>
                          <p className="text-lg font-medium">{measurement.hips} cm</p>
                        </div>
                      )}
                      
                      {measurement.arms !== undefined && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Brazos</p>
                          <p className="text-lg font-medium">{measurement.arms} cm</p>
                        </div>
                      )}
                      
                      {measurement.thighs !== undefined && (
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Muslos</p>
                          <p className="text-lg font-medium">{measurement.thighs} cm</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleEditMeasurement(measurement)}
                    >
                      Editar Medidas
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="progreso" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <LineChart className="h-8 w-8 animate-pulse mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Cargando datos de progreso...</p>
            </div>
          ) : measurements.length < 2 ? (
            <Card>
              <CardContent className="text-center py-8">
                <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Datos insuficientes</h3>
                <p className="text-gray-500 mb-4">
                  Necesitas al menos dos registros de medidas para ver tu progreso
                </p>
                <Button onClick={handleNewMeasurement}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Medidas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución del Peso</CardTitle>
                  <CardDescription>
                    Seguimiento de tu peso corporal a lo largo del tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          name="Peso (kg)" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {chartData.some(d => d.body_fat !== undefined) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución de la Grasa Corporal</CardTitle>
                    <CardDescription>
                      Seguimiento de tu porcentaje de grasa corporal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="body_fat" 
                            name="Grasa Corporal (%)" 
                            stroke="#10b981" 
                            activeDot={{ r: 8 }} 
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Medidas Corporales</CardTitle>
                  <CardDescription>
                    Evolución de tus medidas en centímetros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {chartData.some(d => d.chest !== undefined) && (
                          <Line 
                            type="monotone" 
                            dataKey="chest" 
                            name="Pecho (cm)" 
                            stroke="#8884d8" 
                          />
                        )}
                        {chartData.some(d => d.waist !== undefined) && (
                          <Line 
                            type="monotone" 
                            dataKey="waist" 
                            name="Cintura (cm)" 
                            stroke="#f97316" 
                          />
                        )}
                        {chartData.some(d => d.hips !== undefined) && (
                          <Line 
                            type="monotone" 
                            dataKey="hips" 
                            name="Cadera (cm)" 
                            stroke="#ec4899" 
                          />
                        )}
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMeasurement ? "Editar Medidas" : "Registrar Medidas"}
            </DialogTitle>
            <DialogDescription>
              {selectedMeasurement 
                ? "Actualiza tus medidas corporales" 
                : "Registra tus medidas corporales actuales"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    id="date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date 
                      ? format(new Date(formData.date), "PPP", { locale: es }) 
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => 
                      setFormData({ 
                        ...formData, 
                        date: date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0] 
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Ej: 70.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body_fat">Grasa Corporal (%)</Label>
                <Input
                  id="body_fat"
                  type="number"
                  step="0.1"
                  value={formData.body_fat}
                  onChange={(e) => setFormData({ ...formData, body_fat: e.target.value })}
                  placeholder="Ej: 15.5"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Pecho (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  placeholder="Ej: 95"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="waist">Cintura (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  placeholder="Ej: 80"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hips">Cadera (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  placeholder="Ej: 95"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arms">Brazos (cm)</Label>
                <Input
                  id="arms"
                  type="number"
                  step="0.1"
                  value={formData.arms}
                  onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                  placeholder="Ej: 35"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thighs">Muslos (cm)</Label>
              <Input
                id="thighs"
                type="number"
                step="0.1"
                value={formData.thighs}
                onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                placeholder="Ej: 55"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMeasurement} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
