"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dumbbell,
  BookOpen,
  Play,
  Award,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  HelpCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { AnimatedFade, AnimatedSlide } from "@/components/animations/animated-transitions"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BeginnerTrainingPage() {
  const [activeTab, setActiveTab] = useState("basics")
  const router = useRouter()
  const { user } = useAuth()

  // Handle back button
  const handleBack = () => {
    router.push("/training")
  }

  // Handle start workout
  const handleStartWorkout = () => {
    router.push("/training/beginner/workout")
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Entrenamiento para Principiantes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="basics">Fundamentos</TabsTrigger>
          <TabsTrigger value="routines">Rutinas</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <AnimatedFade>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fundamentos del Entrenamiento</CardTitle>
                  <CardDescription>
                    Conceptos básicos para comenzar tu viaje fitness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src="/images/training-basics.jpg"
                      alt="Fundamentos del entrenamiento"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <h2 className="text-white text-xl font-bold">Comienza tu viaje fitness</h2>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Bienvenido al mundo del fitness. Esta sección te guiará a través de los conceptos fundamentales
                    que necesitas entender para comenzar tu entrenamiento de manera efectiva y segura.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Dumbbell className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Principios Básicos del Entrenamiento</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11">
                        <div className="space-y-3">
                          <p>
                            El entrenamiento efectivo se basa en algunos principios fundamentales que te ayudarán
                            a progresar de manera constante y segura:
                          </p>
                          <ul className="space-y-2 pl-5 list-disc">
                            <li><strong>Sobrecarga progresiva:</strong> Aumentar gradualmente la intensidad para seguir progresando.</li>
                            <li><strong>Especificidad:</strong> Entrenar de manera específica para tus objetivos.</li>
                            <li><strong>Recuperación:</strong> Permitir que tus músculos se recuperen entre sesiones.</li>
                            <li><strong>Consistencia:</strong> Mantener un entrenamiento regular a lo largo del tiempo.</li>
                            <li><strong>Variación:</strong> Cambiar estímulos periódicamente para evitar estancamientos.</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <BookOpen className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Terminología Básica</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11">
                        <div className="space-y-3">
                          <p>
                            Familiarízate con estos términos básicos que te ayudarán a entender mejor tus rutinas:
                          </p>
                          <ul className="space-y-2">
                            <li><strong>Repetición (Rep):</strong> Un movimiento completo de un ejercicio.</li>
                            <li><strong>Serie:</strong> Un conjunto de repeticiones realizadas sin descanso.</li>
                            <li><strong>Descanso:</strong> Tiempo de recuperación entre series.</li>
                            <li><strong>Peso:</strong> La resistencia utilizada en un ejercicio.</li>
                            <li><strong>Volumen:</strong> La cantidad total de trabajo (series × repeticiones × peso).</li>
                            <li><strong>Intensidad:</strong> El nivel de esfuerzo o porcentaje de tu capacidad máxima.</li>
                            <li><strong>Rango de movimiento (ROM):</strong> La amplitud completa de un movimiento.</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Heart className="h-4 w-4 text-purple-600" />
                          </div>
                          <span>Técnica y Seguridad</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11">
                        <div className="space-y-3">
                          <p>
                            La técnica correcta es fundamental para prevenir lesiones y maximizar resultados:
                          </p>
                          <ul className="space-y-2 pl-5 list-disc">
                            <li><strong>Calentamiento:</strong> Siempre realiza 5-10 minutos de calentamiento general antes de entrenar.</li>
                            <li><strong>Postura:</strong> Mantén una postura neutra de la columna en la mayoría de los ejercicios.</li>
                            <li><strong>Respiración:</strong> Exhala durante el esfuerzo (fase concéntrica) e inhala durante la fase de menor esfuerzo (fase excéntrica).</li>
                            <li><strong>Progresión:</strong> Domina la técnica con pesos ligeros antes de aumentar la carga.</li>
                            <li><strong>Rango completo:</strong> Realiza los movimientos en su rango completo para maximizar beneficios.</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <Award className="h-4 w-4 text-amber-600" />
                          </div>
                          <span>Progresión para Principiantes</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-11">
                        <div className="space-y-3">
                          <p>
                            Como principiante, puedes progresar rápidamente siguiendo estas pautas:
                          </p>
                          <ul className="space-y-2 pl-5 list-disc">
                            <li><strong>Semanas 1-4:</strong> Enfócate en aprender la técnica correcta con pesos ligeros.</li>
                            <li><strong>Semanas 5-8:</strong> Comienza a aumentar gradualmente el peso mientras mantienes buena técnica.</li>
                            <li><strong>Semanas 9-12:</strong> Incrementa el volumen añadiendo más series o ejercicios.</li>
                            <li><strong>Después de 12 semanas:</strong> Considera introducir técnicas más avanzadas o rutinas más específicas.</li>
                          </ul>
                          <Alert className="mt-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Consejo importante</AlertTitle>
                            <AlertDescription>
                              Es normal sentir algo de dolor muscular (agujetas) al principio, pero nunca deberías sentir dolor articular agudo. Si lo sientes, detente y consulta a un profesional.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Separator className="my-4" />

                  <div className="flex flex-col space-y-4">
                    <Button
                      variant="link"
                      className="self-start -ml-3"
                      onClick={() => router.push("/training/glossary")}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Consultar glosario de términos de fitness
                    </Button>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver
                      </Button>
                      <Button onClick={() => setActiveTab("routines")}>
                        Rutinas para Principiantes
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedFade>
        </TabsContent>

        <TabsContent value="routines">
          <AnimatedSlide>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rutinas para Principiantes</CardTitle>
                  <CardDescription>
                    Programas de entrenamiento diseñados para quienes están comenzando
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Estas rutinas están diseñadas específicamente para principiantes, con un enfoque en aprender
                    los movimientos básicos, desarrollar fuerza fundamental y crear el hábito del entrenamiento regular.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card className="border-green-200 overflow-hidden">
                      <div className="h-40 bg-green-50 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Dumbbell className="h-16 w-16 text-green-200" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Recomendado
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">Rutina de Cuerpo Completo</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Perfecta para principiantes, entrena todo el cuerpo en cada sesión.
                        </p>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span>Frecuencia:</span>
                            <span className="font-medium">3 días por semana</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duración:</span>
                            <span className="font-medium">45-60 minutos</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nivel:</span>
                            <span className="font-medium">Principiante</span>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleStartWorkout}>
                          <Play className="mr-2 h-4 w-4" />
                          Comenzar Rutina
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 overflow-hidden">
                      <div className="h-40 bg-blue-50 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Dumbbell className="h-16 w-16 text-blue-200" />
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Próximamente
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">Rutina de Torso/Pierna</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Divide el entrenamiento en días de torso y días de pierna.
                        </p>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span>Frecuencia:</span>
                            <span className="font-medium">4 días por semana</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duración:</span>
                            <span className="font-medium">45-60 minutos</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nivel:</span>
                            <span className="font-medium">Principiante-Intermedio</span>
                          </div>
                        </div>
                        <Button className="w-full" disabled>
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Próximamente
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="font-medium">¿Qué incluyen nuestras rutinas para principiantes?</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span>Instrucciones detalladas para cada ejercicio con imágenes y vídeos</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span>Progresión gradual de peso y volumen a lo largo de las semanas</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span>Alternativas para cada ejercicio según el equipo disponible</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <span>Seguimiento de progreso integrado para mantener la motivación</span>
                      </li>
                    </ul>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("basics")}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Fundamentos
                    </Button>
                    <Button onClick={() => setActiveTab("progress")}>
                      Seguimiento de Progreso
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSlide>
        </TabsContent>

        <TabsContent value="progress">
          <AnimatedSlide>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seguimiento de Progreso</CardTitle>
                  <CardDescription>
                    Monitorea tu evolución y celebra tus logros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    El seguimiento de tu progreso es fundamental para mantenerte motivado y asegurar que estás
                    avanzando hacia tus objetivos. Aquí puedes ver tu evolución y establecer nuevas metas.
                  </p>

                  {user ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Progreso de Entrenamiento</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Asistencia Semanal</span>
                              <span>2/3 sesiones</span>
                            </div>
                            <Progress value={66} />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progreso del Programa</span>
                              <span>Semana 3/12</span>
                            </div>
                            <Progress value={25} />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Consistencia</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-medium">Logros Desbloqueados</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="border rounded-lg p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                              <Award className="h-6 w-6 text-amber-600" />
                            </div>
                            <h4 className="font-medium">Primera Semana</h4>
                            <p className="text-xs text-muted-foreground">Completaste tu primera semana de entrenamiento</p>
                          </div>

                          <div className="border rounded-lg p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                              <Dumbbell className="h-6 w-6 text-amber-600" />
                            </div>
                            <h4 className="font-medium">Técnica Básica</h4>
                            <p className="text-xs text-muted-foreground">Dominaste la técnica de los ejercicios básicos</p>
                          </div>

                          <div className="border rounded-lg p-4 text-center bg-gray-50 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                              <Award className="h-6 w-6 text-gray-400" />
                            </div>
                            <h4 className="font-medium">Primer Mes</h4>
                            <p className="text-xs text-muted-foreground">Completa un mes de entrenamiento consistente</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setActiveTab("routines")}>
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Rutinas
                        </Button>
                        <Button onClick={handleStartWorkout}>
                          Comenzar Entrenamiento
                          <Play className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Inicia sesión para ver tu progreso</p>
                      <Button onClick={() => router.push("/login")}>Iniciar Sesión</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </AnimatedSlide>
        </TabsContent>
      </Tabs>
    </div>
  )
}
