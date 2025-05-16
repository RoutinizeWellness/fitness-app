"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutinizeLayout } from "@/components/routinize-layout";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Save, Dumbbell, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PulseLoader } from "@/components/ui/enhanced-skeletons";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase-client";
import { v4 as uuidv4 } from "uuid";

// Tipos
interface ExerciseLog {
  id: string;
  name: string;
  sets: {
    weight: number;
    reps: number;
    rir: number;
  }[];
  notes?: string;
}

interface WorkoutLog {
  id: string;
  userId: string;
  date: string;
  routineId?: string;
  routineName?: string;
  duration: number;
  exercises: ExerciseLog[];
  notes?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export default function LogWorkoutPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [routineId, setRoutineId] = useState<string>("");
  const [routineName, setRoutineName] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [rating, setRating] = useState<number>(7);
  const [routines, setRoutines] = useState<any[]>([]);
  const [isLoadingRoutines, setIsLoadingRoutines] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/welcome");
    }
  }, [user, authLoading, router]);

  // Cargar rutinas del usuario
  useEffect(() => {
    if (authLoading || !user) return;
    
    const loadRoutines = async () => {
      try {
        // Cargar rutinas de Supabase
        const { data, error } = await supabase
          .from('workout_routines')
          .select('id, name')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error al cargar rutinas:", error);
          // Usar datos de ejemplo si hay error
          setRoutines(getSampleRoutines());
        } else {
          setRoutines(data || getSampleRoutines());
        }
      } catch (error) {
        console.error("Error al cargar rutinas:", error);
        // Usar datos de ejemplo en caso de error
        setRoutines(getSampleRoutines());
      } finally {
        setIsLoadingRoutines(false);
      }
    };
    
    loadRoutines();
  }, [user, authLoading]);

  // Añadir ejercicio
  const addExercise = () => {
    const newExercise: ExerciseLog = {
      id: uuidv4(),
      name: "",
      sets: [{ weight: 0, reps: 0, rir: 2 }],
      notes: ""
    };
    
    setExercises([...exercises, newExercise]);
  };

  // Eliminar ejercicio
  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  // Actualizar nombre de ejercicio
  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, name } : exercise
    ));
  };

  // Añadir serie a un ejercicio
  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [...exercise.sets, { ...lastSet }]
        };
      }
      return exercise;
    }));
  };

  // Eliminar serie de un ejercicio
  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId && exercise.sets.length > 1) {
        const newSets = [...exercise.sets];
        newSets.splice(setIndex, 1);
        return { ...exercise, sets: newSets };
      }
      return exercise;
    }));
  };

  // Actualizar serie
  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'rir', value: number) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...exercise, sets: newSets };
      }
      return exercise;
    }));
  };

  // Actualizar notas de ejercicio
  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, notes } : exercise
    ));
  };

  // Guardar registro de entrenamiento
  const handleSave = async () => {
    if (!user) return;
    
    // Validar que hay al menos un ejercicio
    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, añade al menos un ejercicio",
        variant: "destructive"
      });
      return;
    }
    
    // Validar que todos los ejercicios tienen nombre
    const invalidExercise = exercises.find(exercise => !exercise.name.trim());
    if (invalidExercise) {
      toast({
        title: "Error",
        description: "Todos los ejercicios deben tener un nombre",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    const newWorkoutLog: WorkoutLog = {
      id: uuidv4(),
      userId: user.id,
      date: date.toISOString().split('T')[0],
      routineId: routineId || undefined,
      routineName: routineName || undefined,
      duration,
      exercises,
      notes: notes.trim() || undefined,
      rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          id: newWorkoutLog.id,
          user_id: newWorkoutLog.userId,
          date: newWorkoutLog.date,
          routine_id: newWorkoutLog.routineId,
          routine_name: newWorkoutLog.routineName,
          duration: newWorkoutLog.duration,
          exercises: newWorkoutLog.exercises,
          notes: newWorkoutLog.notes,
          rating: newWorkoutLog.rating,
          created_at: newWorkoutLog.createdAt,
          updated_at: newWorkoutLog.updatedAt
        });
      
      if (error) {
        console.error("Error al guardar entrenamiento:", error);
        throw error;
      }
      
      toast({
        title: "Entrenamiento guardado",
        description: "Tu entrenamiento se ha guardado correctamente",
      });
      
      // Redirigir a la página de entrenamiento
      setTimeout(() => {
        router.push("/training");
      }, 500);
    } catch (error: any) {
      console.error("Error al guardar entrenamiento:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el entrenamiento",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="training" title="Registrar entrenamiento">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    );
  }

  return (
    <RoutinizeLayout activeTab="training" title="Registrar entrenamiento">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Registrar entrenamiento</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="routine">Rutina (opcional)</Label>
              <Select 
                value={routineId} 
                onValueChange={(value) => {
                  setRoutineId(value);
                  if (value) {
                    const selectedRoutine = routines.find(r => r.id === value);
                    setRoutineName(selectedRoutine?.name || "");
                  } else {
                    setRoutineName("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una rutina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna</SelectItem>
                  {routines.map(routine => (
                    <SelectItem key={routine.id} value={routine.id}>
                      {routine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <span className="text-sm font-medium">{duration} min</span>
              </div>
              <Slider
                id="duration"
                value={[duration]}
                min={5}
                max={180}
                step={5}
                onValueChange={(value) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5 min</span>
                <span>180 min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Ejercicios</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addExercise}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir ejercicio
                </Button>
              </div>
              
              {exercises.length > 0 ? (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <Card key={exercise.id} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            {index + 1}
                          </div>
                          <Input
                            value={exercise.name}
                            onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                            placeholder="Nombre del ejercicio"
                            className="max-w-xs"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 mb-1">
                          <div>Serie</div>
                          <div>Peso (kg)</div>
                          <div>Reps</div>
                          <div>RIR</div>
                        </div>
                        
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{setIndex + 1}</span>
                              {exercise.sets.length > 1 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="ml-1 h-6 w-6 p-0"
                                  onClick={() => removeSet(exercise.id, setIndex)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              )}
                            </div>
                            <Input
                              type="number"
                              value={set.weight}
                              onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="2.5"
                              className="h-8"
                            />
                            <Input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              min="0"
                              className="h-8"
                            />
                            <Select 
                              value={set.rir.toString()} 
                              onValueChange={(value) => updateSet(exercise.id, setIndex, 'rir', parseInt(value))}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => addSet(exercise.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir serie
                        </Button>
                      </div>
                      
                      <div className="mt-3">
                        <Label htmlFor={`notes-${exercise.id}`}>Notas</Label>
                        <Textarea
                          id={`notes-${exercise.id}`}
                          value={exercise.notes || ""}
                          onChange={(e) => updateExerciseNotes(exercise.id, e.target.value)}
                          placeholder="Notas sobre este ejercicio..."
                          className="mt-1 h-20"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">No hay ejercicios añadidos</p>
                  <Button 
                    variant="outline"
                    onClick={addExercise}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir ejercicio
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Valoración del entrenamiento</Label>
                <span className="text-sm font-medium">{rating}/10</span>
              </div>
              <Slider
                value={[rating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setRating(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Malo</span>
                <span>Excelente</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas generales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre este entrenamiento..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push("/training")}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
            disabled={isSaving || exercises.length === 0}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar entrenamiento
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  );
}

// Datos de ejemplo
function getSampleRoutines() {
  return [
    { id: "1", name: "Rutina de fuerza" },
    { id: "2", name: "Rutina de hipertrofia" },
    { id: "3", name: "Rutina de definición" }
  ];
}
