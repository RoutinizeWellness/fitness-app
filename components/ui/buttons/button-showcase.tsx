"use client"

import React, { useState } from "react"
import { 
  Button, 
  ImprovedButton, 
  FabButton, 
  QuickActionButton, 
  ButtonGroup, 
  SegmentedButton, 
  LoadingButton, 
  IconButton 
} from "."
import { 
  Plus, 
  Home, 
  Settings, 
  User, 
  Bell, 
  Calendar, 
  Search, 
  Heart, 
  Mail, 
  Menu, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Trash, 
  Edit, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  Loader2 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs"

export function ButtonShowcase() {
  const [segmentedValue, setSegmentedValue] = useState("day")
  const [isLoading, setIsLoading] = useState(false)
  const [buttonStatus, setButtonStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [progressValue, setProgressValue] = useState(0)
  
  // Simular carga para el botón de carga
  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }
  
  // Simular progreso para el botón de progreso
  const simulateProgress = () => {
    setButtonStatus("loading")
    setProgressValue(0)
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setButtonStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }
  
  // Simular error para el botón de error
  const simulateError = () => {
    setButtonStatus("loading")
    setTimeout(() => {
      setButtonStatus("error")
    }, 2000)
  }
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="standard">
        <TabsList className="mb-4">
          <TabsTrigger value="standard">Botones Estándar</TabsTrigger>
          <TabsTrigger value="improved">Botones Mejorados</TabsTrigger>
          <TabsTrigger value="special">Botones Especiales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botones estándar */}
            <Card>
              <CardHeader>
                <CardTitle>Botones Estándar</CardTitle>
                <CardDescription>Botones básicos con diferentes variantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>Disabled</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <Mail className="mr-2 h-4 w-4" /> Login with Email
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Botones de icono */}
            <Card>
              <CardHeader>
                <CardTitle>Botones de Icono</CardTitle>
                <CardDescription>Botones con solo iconos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="icon" variant="default">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button size="sm" variant="outline">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button disabled size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="improved">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botones mejorados */}
            <Card>
              <CardHeader>
                <CardTitle>Botones Mejorados</CardTitle>
                <CardDescription>Botones con efectos y animaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <ImprovedButton withEffect="scale">Scale Effect</ImprovedButton>
                  <ImprovedButton withEffect="lift" variant="primary">Lift Effect</ImprovedButton>
                  <ImprovedButton withEffect="rotate" variant="green">Rotate Effect</ImprovedButton>
                  <ImprovedButton withEffect="pulse" variant="purple">Pulse Effect</ImprovedButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <ImprovedButton variant="primary" leftIcon={<Heart />}>Con Icono</ImprovedButton>
                  <ImprovedButton variant="outline" rightIcon={<ChevronRight />}>Ver más</ImprovedButton>
                  <ImprovedButton variant="subtle">Sutil</ImprovedButton>
                  <ImprovedButton variant="gradient">Gradiente</ImprovedButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <ImprovedButton shape="rounded" variant="primary">Redondeado</ImprovedButton>
                  <ImprovedButton shape="pill" variant="green">Píldora</ImprovedButton>
                  <ImprovedButton shape="organic" variant="purple">Orgánico</ImprovedButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <ImprovedButton shadow="md" variant="primary">Con Sombra</ImprovedButton>
                  <ImprovedButton shadow="lg" variant="green">Sombra Grande</ImprovedButton>
                </div>
              </CardContent>
            </Card>
            
            {/* Botones de carga */}
            <Card>
              <CardHeader>
                <CardTitle>Botones de Carga</CardTitle>
                <CardDescription>Botones con estados de carga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <ImprovedButton 
                    isLoading={isLoading} 
                    onClick={simulateLoading}
                    variant="primary"
                  >
                    Cargar
                  </ImprovedButton>
                  
                  <ImprovedButton 
                    isLoading={isLoading} 
                    loadingText="Cargando..." 
                    onClick={simulateLoading}
                    variant="green"
                  >
                    Con Texto
                  </ImprovedButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <LoadingButton 
                    status={buttonStatus} 
                    onClick={simulateProgress}
                    loadingVariant="progress"
                    progressValue={progressValue}
                    variant="primary"
                  >
                    Progreso
                  </LoadingButton>
                  
                  <LoadingButton 
                    status={buttonStatus} 
                    onClick={simulateError}
                    variant="destructive"
                  >
                    Error
                  </LoadingButton>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <LoadingButton 
                    isLoading={isLoading} 
                    onClick={simulateLoading}
                    loadingVariant="dots"
                    variant="primary"
                  >
                    Puntos
                  </LoadingButton>
                  
                  <LoadingButton 
                    isLoading={isLoading} 
                    onClick={simulateLoading}
                    loadingPosition="right"
                    variant="outline"
                  >
                    Derecha
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="special">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botones especiales */}
            <Card>
              <CardHeader>
                <CardTitle>Botones Especiales</CardTitle>
                <CardDescription>Botones con funcionalidades especiales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Botones de Grupo</h3>
                  <ButtonGroup className="mb-4">
                    <Button variant="outline">Día</Button>
                    <Button variant="outline">Semana</Button>
                    <Button variant="outline">Mes</Button>
                  </ButtonGroup>
                  
                  <ButtonGroup variant="pills" className="mb-4">
                    <Button variant="ghost" className={segmentedValue === "day" ? "active" : ""} onClick={() => setSegmentedValue("day")}>Día</Button>
                    <Button variant="ghost" className={segmentedValue === "week" ? "active" : ""} onClick={() => setSegmentedValue("week")}>Semana</Button>
                    <Button variant="ghost" className={segmentedValue === "month" ? "active" : ""} onClick={() => setSegmentedValue("month")}>Mes</Button>
                  </ButtonGroup>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Botones Segmentados</h3>
                  <SegmentedButton 
                    options={[
                      { value: "day", label: "Día" },
                      { value: "week", label: "Semana" },
                      { value: "month", label: "Mes" }
                    ]}
                    value={segmentedValue}
                    onChange={setSegmentedValue}
                    className="mb-4"
                  />
                  
                  <SegmentedButton 
                    options={[
                      { value: "day", label: "Día", icon: <Calendar className="h-4 w-4" /> },
                      { value: "week", label: "Semana", icon: <Calendar className="h-4 w-4" /> },
                      { value: "month", label: "Mes", icon: <Calendar className="h-4 w-4" /> }
                    ]}
                    value={segmentedValue}
                    onChange={setSegmentedValue}
                    variant="primary"
                    shape="rounded"
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Botones de Icono</h3>
                  <div className="flex flex-wrap gap-2">
                    <IconButton 
                      icon={<Heart />} 
                      variant="primary" 
                      tooltip="Me gusta"
                    />
                    <IconButton 
                      icon={<Bell />} 
                      variant="green-subtle" 
                      badge={3}
                      tooltip="Notificaciones"
                    />
                    <IconButton 
                      icon={<Settings />} 
                      variant="outline" 
                      withEffect="rotate"
                      tooltip="Configuración"
                    />
                    <IconButton 
                      icon={<Search />} 
                      variant="ghost" 
                      size="lg"
                      iconSize="lg"
                      tooltip="Buscar"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Botones de acción */}
            <Card>
              <CardHeader>
                <CardTitle>Botones de Acción</CardTitle>
                <CardDescription>Botones para acciones específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Botones de Acción Rápida</h3>
                  <div className="flex flex-wrap gap-2">
                    <QuickActionButton 
                      icon={<Home />} 
                      label="Inicio" 
                      variant="primary"
                    />
                    <QuickActionButton 
                      icon={<Calendar />} 
                      label="Calendario" 
                      variant="green"
                    />
                    <QuickActionButton 
                      icon={<User />} 
                      label="Perfil" 
                      variant="purple"
                    />
                    <QuickActionButton 
                      icon={<Bell />} 
                      label="Alertas" 
                      variant="pink"
                      badge={5}
                    />
                  </div>
                </div>
                
                <div className="relative h-40 border border-dashed border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Botones Flotantes (FAB)</h3>
                  <FabButton 
                    icon={<Plus />} 
                    position="bottom-right" 
                    variant="primary"
                    className="relative"
                    style={{ position: "absolute" }}
                  />
                  
                  <FabButton 
                    icon={<Plus />} 
                    label="Crear" 
                    showLabel 
                    position="bottom-left" 
                    variant="green"
                    className="relative"
                    style={{ position: "absolute" }}
                  />
                  
                  <FabButton 
                    icon={<Menu />} 
                    position="top-right" 
                    variant="purple"
                    withMenu
                    menuItems={[
                      { icon: <Edit />, label: "Editar", onClick: () => {} },
                      { icon: <Trash />, label: "Eliminar", onClick: () => {} },
                      { icon: <Share />, label: "Compartir", onClick: () => {} }
                    ]}
                    className="relative"
                    style={{ position: "absolute" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente Share para el ejemplo
function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
