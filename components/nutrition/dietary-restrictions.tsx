"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Info, Plus, Search, ShieldAlert, X } from "lucide-react"

// Tipos de datos
interface Restriction {
  id: string
  name: string
  type: "allergy" | "intolerance" | "preference"
  severity?: "mild" | "moderate" | "severe"
  notes?: string
  active: boolean
}

// Datos de ejemplo
const initialRestrictions: Restriction[] = [
  {
    id: "r1",
    name: "Gluten",
    type: "allergy",
    severity: "severe",
    notes: "Celiaquía diagnosticada. Evitar completamente.",
    active: true
  },
  {
    id: "r2",
    name: "Lactosa",
    type: "intolerance",
    severity: "moderate",
    notes: "Pequeñas cantidades son tolerables.",
    active: true
  },
  {
    id: "r3",
    name: "Frutos secos",
    type: "allergy",
    severity: "severe",
    notes: "Reacción alérgica grave. Llevar EpiPen.",
    active: true
  },
  {
    id: "r4",
    name: "Mariscos",
    type: "allergy",
    severity: "moderate",
    notes: "",
    active: true
  },
  {
    id: "r5",
    name: "Carne roja",
    type: "preference",
    notes: "Preferencia personal, no médica.",
    active: true
  }
]

// Lista de alergias e intolerancias comunes para añadir
const commonRestrictions = [
  { id: "gluten", name: "Gluten", type: "allergy" },
  { id: "lactose", name: "Lactosa", type: "intolerance" },
  { id: "nuts", name: "Frutos secos", type: "allergy" },
  { id: "peanuts", name: "Cacahuetes", type: "allergy" },
  { id: "shellfish", name: "Mariscos", type: "allergy" },
  { id: "fish", name: "Pescado", type: "allergy" },
  { id: "eggs", name: "Huevos", type: "allergy" },
  { id: "soy", name: "Soja", type: "allergy" },
  { id: "wheat", name: "Trigo", type: "allergy" },
  { id: "dairy", name: "Lácteos", type: "intolerance" },
  { id: "fructose", name: "Fructosa", type: "intolerance" },
  { id: "histamine", name: "Histamina", type: "intolerance" },
  { id: "fodmap", name: "FODMAP", type: "intolerance" },
  { id: "nightshades", name: "Solanáceas", type: "intolerance" }
]

export default function DietaryRestrictions() {
  const [activeTab, setActiveTab] = useState("current")
  const [restrictions, setRestrictions] = useState<Restriction[]>(initialRestrictions)
  const [searchTerm, setSearchTerm] = useState("")
  const [newRestriction, setNewRestriction] = useState<Partial<Restriction>>({
    type: "allergy",
    severity: "moderate",
    active: true
  })

  // Filtrar restricciones según el término de búsqueda
  const filteredRestrictions = restrictions.filter(restriction => 
    restriction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restriction.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar restricciones por tipo
  const allergies = filteredRestrictions.filter(r => r.type === "allergy" && r.active)
  const intolerances = filteredRestrictions.filter(r => r.type === "intolerance" && r.active)
  const preferences = filteredRestrictions.filter(r => r.type === "preference" && r.active)
  const inactive = filteredRestrictions.filter(r => !r.active)

  // Manejar cambio en el estado activo de una restricción
  const handleToggleActive = (id: string) => {
    setRestrictions(prev => 
      prev.map(r => 
        r.id === id ? { ...r, active: !r.active } : r
      )
    )
  }

  // Manejar eliminación de una restricción
  const handleDelete = (id: string) => {
    setRestrictions(prev => prev.filter(r => r.id !== id))
  }

  // Manejar cambio en los campos del formulario
  const handleInputChange = (field: keyof Restriction, value: any) => {
    setNewRestriction(prev => ({ ...prev, [field]: value }))
  }

  // Manejar añadir una nueva restricción
  const handleAddRestriction = () => {
    if (!newRestriction.name || newRestriction.name.trim() === "") return

    const newId = `r${restrictions.length + 1}`
    const restriction: Restriction = {
      id: newId,
      name: newRestriction.name,
      type: newRestriction.type as "allergy" | "intolerance" | "preference",
      severity: newRestriction.type !== "preference" ? 
        (newRestriction.severity as "mild" | "moderate" | "severe") : undefined,
      notes: newRestriction.notes,
      active: true
    }

    setRestrictions(prev => [...prev, restriction])
    setNewRestriction({
      type: "allergy",
      severity: "moderate",
      active: true
    })
    setActiveTab("current")
  }

  // Manejar añadir una restricción común
  const handleAddCommonRestriction = (item: typeof commonRestrictions[0]) => {
    // Verificar si ya existe
    const exists = restrictions.some(r => 
      r.name.toLowerCase() === item.name.toLowerCase()
    )

    if (exists) return

    const newId = `r${restrictions.length + 1}`
    const restriction: Restriction = {
      id: newId,
      name: item.name,
      type: item.type as "allergy" | "intolerance" | "preference",
      severity: item.type !== "preference" ? "moderate" : undefined,
      active: true
    }

    setRestrictions(prev => [...prev, restriction])
  }

  // Renderizar el color de la insignia según la severidad
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "mild": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "moderate": return "bg-orange-100 text-orange-800 border-orange-300"
      case "severe": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Renderizar el icono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "allergy": return <ShieldAlert className="h-4 w-4 mr-1 text-red-500" />
      case "intolerance": return <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
      case "preference": return <Check className="h-4 w-4 mr-1 text-green-500" />
      default: return <Info className="h-4 w-4 mr-1 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="current">Actuales</TabsTrigger>
          <TabsTrigger value="add">Añadir</TabsTrigger>
          <TabsTrigger value="common">Comunes</TabsTrigger>
        </TabsList>

        {/* Pestaña de restricciones actuales */}
        <TabsContent value="current" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar restricciones..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredRestrictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron restricciones</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allergies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <ShieldAlert className="h-5 w-5 mr-2 text-red-500" />
                    Alergias
                  </h3>
                  <div className="space-y-3">
                    {allergies.map(restriction => (
                      <Card key={restriction.id} className="bg-white shadow-sm border-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{restriction.name}</h4>
                                {restriction.severity && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(restriction.severity)}`}>
                                    {restriction.severity}
                                  </span>
                                )}
                              </div>
                              {restriction.notes && (
                                <p className="text-sm text-gray-500 mt-1">{restriction.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={restriction.active}
                                onCheckedChange={() => handleToggleActive(restriction.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => handleDelete(restriction.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {intolerances.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Intolerancias
                  </h3>
                  <div className="space-y-3">
                    {intolerances.map(restriction => (
                      <Card key={restriction.id} className="bg-white shadow-sm border-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{restriction.name}</h4>
                                {restriction.severity && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(restriction.severity)}`}>
                                    {restriction.severity}
                                  </span>
                                )}
                              </div>
                              {restriction.notes && (
                                <p className="text-sm text-gray-500 mt-1">{restriction.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={restriction.active}
                                onCheckedChange={() => handleToggleActive(restriction.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => handleDelete(restriction.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {preferences.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Preferencias
                  </h3>
                  <div className="space-y-3">
                    {preferences.map(restriction => (
                      <Card key={restriction.id} className="bg-white shadow-sm border-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{restriction.name}</h4>
                              {restriction.notes && (
                                <p className="text-sm text-gray-500 mt-1">{restriction.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={restriction.active}
                                onCheckedChange={() => handleToggleActive(restriction.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => handleDelete(restriction.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {inactive.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-500">
                    Inactivas
                  </h3>
                  <div className="space-y-3">
                    {inactive.map(restriction => (
                      <Card key={restriction.id} className="bg-gray-50 shadow-sm border-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-500">{restriction.name}</h4>
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                  {restriction.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={restriction.active}
                                onCheckedChange={() => handleToggleActive(restriction.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => handleDelete(restriction.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Pestaña para añadir nueva restricción */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Añadir nueva restricción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input 
                    id="name" 
                    placeholder="Ej: Gluten, Lactosa, etc." 
                    value={newRestriction.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="flex space-x-2">
                    {["allergy", "intolerance", "preference"].map((type) => (
                      <Button 
                        key={type}
                        variant={newRestriction.type === type ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => handleInputChange("type", type)}
                      >
                        {getTypeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {newRestriction.type !== "preference" && (
                  <div className="space-y-2">
                    <Label>Severidad</Label>
                    <div className="flex space-x-2">
                      {["mild", "moderate", "severe"].map((severity) => (
                        <Button 
                          key={severity}
                          variant={newRestriction.severity === severity ? "default" : "outline"}
                          className={`flex-1 ${getSeverityColor(severity)}`}
                          onClick={() => handleInputChange("severity", severity)}
                        >
                          <span className="capitalize">{severity}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input 
                    id="notes" 
                    placeholder="Añade información adicional" 
                    value={newRestriction.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAddRestriction}
                  disabled={!newRestriction.name || newRestriction.name.trim() === ""}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir restricción
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de restricciones comunes */}
        <TabsContent value="common" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar restricciones comunes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-red-500" />
                Alergias comunes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {commonRestrictions
                  .filter(r => r.type === "allergy" && r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(restriction => (
                    <Card 
                      key={restriction.id} 
                      className="bg-white shadow-sm border-none cursor-pointer hover:bg-gray-50"
                      onClick={() => handleAddCommonRestriction(restriction)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-sm">{restriction.name}</span>
                          </div>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                Intolerancias comunes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {commonRestrictions
                  .filter(r => r.type === "intolerance" && r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(restriction => (
                    <Card 
                      key={restriction.id} 
                      className="bg-white shadow-sm border-none cursor-pointer hover:bg-gray-50"
                      onClick={() => handleAddCommonRestriction(restriction)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="text-sm">{restriction.name}</span>
                          </div>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Alergias alimentarias:</strong> Reacciones del sistema inmunológico que pueden ser graves o potencialmente mortales.
                </p>
                <p>
                  <strong>Intolerancias alimentarias:</strong> Dificultad para digerir ciertos alimentos que no involucra al sistema inmunológico.
                </p>
                <p>
                  <strong>Preferencias alimentarias:</strong> Elecciones personales que no están relacionadas con problemas médicos.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Nota: Esta información se utilizará para personalizar tus planes de comidas y recomendaciones nutricionales.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
