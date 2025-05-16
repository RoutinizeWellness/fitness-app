// Componente de servidor
export default function EditRoutinePageServer({ params }: { params: { id: string } }) {
  // Este componente se ejecuta en el servidor
  const { use } = require('react');
  // Usar React.use() para desenvolver los parámetros
  const unwrappedParams = use(params);
  const routineId = unwrappedParams.id;

  // Renderizar el componente cliente pasando el ID como prop
  return <EditRoutineClient routineId={routineId} />;
}

// Componente cliente
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutinizeLayout } from "@/components/routinize-layout";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, Dumbbell, Calendar, MoreHorizontal, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PulseLoader } from "@/components/ui/enhanced-skeletons";
import { v4 as uuidv4 } from "uuid";

// Tipos
interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  weight?: string;
  notes?: string;
}

interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  frequency: string;
  days: WorkoutDay[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Componente cliente que recibe el ID como prop
function EditRoutineClient({ routineId }: { routineId: string }) {
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Importar la función para obtener rutinas
  const { getUserRoutineById } = require('@/lib/training-service');

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para editar rutinas",
        variant: "destructive"
      });
      router.push("/welcome");
    }
  }, [user, authLoading, router, toast]);

  // Cargar la rutina
  useEffect(() => {
    // No cargar la rutina si no hay usuario autenticado
    if (authLoading || !user) return;

    const loadRoutine = async () => {
      try {
        console.log("Cargando rutina con ID:", routineId);

        // Intentar obtener la rutina real de Supabase
        const { data, error } = await getUserRoutineById(routineId);

        if (error) {
          console.error("Error al obtener la rutina:", error);
          toast({
            title: "Error",
            description: "No se pudo obtener la rutina: " + (error.message || JSON.stringify(error)),
            variant: "destructive"
          });
          return;
        }

        if (!data) {
          console.error("No se encontró la rutina con ID:", routineId);
          toast({
            title: "Error",
            description: "No se encontró la rutina solicitada",
            variant: "destructive"
          });
          return;
        }

        console.log("Rutina cargada correctamente:", data);
        setRoutine(data);
      } catch (error) {
        console.error("Error al cargar la rutina:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina de entrenamiento",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutine();
  }, [routineId, toast, user, authLoading]);

  // Importar la función para guardar rutinas
  const { saveWorkoutRoutine } = require('@/lib/training-service');

  // Guardar cambios
  const handleSave = async () => {
    if (!routine) return;

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar cambios",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Asegurarse de que la rutina tenga el ID de usuario correcto
      const updatedRoutine = {
        ...routine,
        userId: user.id,
        updatedAt: new Date().toISOString()
      };

      console.log("Guardando rutina:", updatedRoutine);

      // Guardar en Supabase
      const { data, error } = await saveWorkoutRoutine(updatedRoutine);

      if (error) {
        console.error("Error al guardar la rutina:", error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios: " + (error.message || JSON.stringify(error)),
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Rutina guardada",
        description: "Los cambios se han guardado correctamente",
      });

      // Redirigir a la página de entrenamiento después de un breve retraso
      setTimeout(() => {
        router.push("/training");
      }, 500);
    } catch (error) {
      console.error("Error al guardar la rutina:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Actualizar nombre de la rutina
  const updateRoutineName = (name: string) => {
    if (!routine) return;
    setRoutine({ ...routine, name });
  };

  // Actualizar descripción de la rutina
  const updateRoutineDescription = (description: string) => {
    if (!routine) return;
    setRoutine({ ...routine, description });
  };

  // Actualizar nivel de la rutina
  const updateRoutineLevel = (level: string) => {
    if (!routine) return;
    setRoutine({ ...routine, level });
  };

  // Actualizar objetivo de la rutina
  const updateRoutineGoal = (goal: string) => {
    if (!routine) return;
    setRoutine({ ...routine, goal });
  };

  // Actualizar frecuencia de la rutina
  const updateRoutineFrequency = (frequency: string) => {
    if (!routine) return;
    setRoutine({ ...routine, frequency });
  };

  // Añadir un nuevo día
  const addDay = () => {
    if (!routine) return;

    const newDay: WorkoutDay = {
      id: uuidv4(),
      name: `Día ${routine.days.length + 1}`,
      exercises: []
    };

    setRoutine({
      ...routine,
      days: [...routine.days, newDay]
    });
  };

  // Eliminar un día
  const removeDay = (dayId: string) => {
    if (!routine) return;

    setRoutine({
      ...routine,
      days: routine.days.filter(day => day.id !== dayId)
    });
  };

  // Actualizar nombre de un día
  const updateDayName = (dayId: string, name: string) => {
    if (!routine) return;

    setRoutine({
      ...routine,
      days: routine.days.map(day =>
        day.id === dayId ? { ...day, name } : day
      )
    });
  };

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24 flex items-center justify-center min-h-screen">
          <PulseLoader message="Cargando rutina..." />
        </div>
      </RoutinizeLayout>
    );
  }

  // Si no se encontró la rutina
  if (!routine) {
    return (
      <RoutinizeLayout>
        <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Rutina no encontrada</h1>
            <p className="text-gray-500 mb-6">No se pudo encontrar la rutina solicitada</p>
            <Button onClick={() => router.push("/training")}>
              Volver a Entrenamientos
            </Button>
          </div>
        </div>
      </RoutinizeLayout>
    );
  }

  return (
    <RoutinizeLayout>
      <div className="container max-w-md mx-auto p-4 pt-20 pb-24">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Editar Rutina</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="general" className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-2" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="days" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Días</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la rutina</Label>
                  <Input
                    id="name"
                    value={routine.name}
                    onChange={(e) => updateRoutineName(e.target.value)}
                    placeholder="Nombre de la rutina"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={routine.description}
                    onChange={(e) => updateRoutineDescription(e.target.value)}
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent"
                    placeholder="Describe tu rutina de entrenamiento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel</Label>
                    <Select value={routine.level} onValueChange={updateRoutineLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Objetivo</Label>
                    <Select value={routine.goal} onValueChange={updateRoutineGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fuerza">Fuerza</SelectItem>
                        <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                        <SelectItem value="resistencia">Resistencia</SelectItem>
                        <SelectItem value="pérdida de peso">Pérdida de peso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select value={routine.frequency} onValueChange={updateRoutineFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-3 días por semana">2-3 días por semana</SelectItem>
                      <SelectItem value="3-4 días por semana">3-4 días por semana</SelectItem>
                      <SelectItem value="4-5 días por semana">4-5 días por semana</SelectItem>
                      <SelectItem value="5-6 días por semana">5-6 días por semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="days" className="space-y-4">
            {routine.days.map((day, index) => (
              <Card key={day.id} className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <Input
                      value={day.name}
                      onChange={(e) => updateDayName(day.id, e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeDay(day.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {day.exercises.length > 0 ? (
                    day.exercises.map((exercise, exIndex) => (
                      <div key={exercise.id} className="flex items-center border rounded-lg p-3">
                        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          {exIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{exercise.name}</h3>
                          <div className="flex text-sm text-gray-500">
                            <span>{exercise.sets} series × {exercise.reps} reps</span>
                            <span className="mx-2">•</span>
                            <span>{exercise.rest}s descanso</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/training/edit/${routineId}/exercise/${exercise.id}`)}>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No hay ejercicios en este día</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push(`/training/edit/${routineId}/day/${day.id}/add-exercise`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir ejercicio
                  </Button>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={addDay}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir día
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/training")}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  );
}
