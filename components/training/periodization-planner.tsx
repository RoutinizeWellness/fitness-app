'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  PeriodizationPlan,
  TrainingCycle,
  TrainingLevel,
  TrainingGoal
} from '@/lib/types/periodization';
import {
  createPeriodizationPlan,
  generateTrainingCycles,
  getActivePeriodizationPlan,
  getTrainingCycles
} from '@/lib/periodization-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle } from 'lucide-react';

// Form schema for creating a periodization plan
const planFormSchema = z.object({
  name: z.string().min(3, {
    message: 'El nombre debe tener al menos 3 caracteres.',
  }),
  description: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'elite'], {
    required_error: 'Por favor selecciona tu nivel de entrenamiento.',
  }),
  goal: z.enum(['strength', 'hypertrophy', 'endurance', 'power', 'weight_loss', 'body_recomposition', 'general_fitness', 'sport_specific'], {
    required_error: 'Por favor selecciona tu objetivo de entrenamiento.',
  }),
  frequency: z.coerce.number().min(1).max(7),
  startDate: z.date({
    required_error: 'Por favor selecciona una fecha de inicio.',
  }),
  duration: z.coerce.number().min(4).max(52),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

// Training level options
const trainingLevelOptions = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'elite', label: 'Elite' },
];

// Training goal options
const trainingGoalOptions = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'power', label: 'Potencia' },
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'body_recomposition', label: 'Recomposición corporal' },
  { value: 'general_fitness', label: 'Fitness general' },
  { value: 'sport_specific', label: 'Específico para deporte' },
];

// Training phase colors
const phaseColors: Record<string, string> = {
  'anatomical_adaptation': 'bg-blue-100 text-blue-800 border-blue-300',
  'hypertrophy': 'bg-purple-100 text-purple-800 border-purple-300',
  'strength': 'bg-red-100 text-red-800 border-red-300',
  'power': 'bg-orange-100 text-orange-800 border-orange-300',
  'endurance': 'bg-green-100 text-green-800 border-green-300',
  'deload': 'bg-gray-100 text-gray-800 border-gray-300',
  'recovery': 'bg-teal-100 text-teal-800 border-teal-300',
  'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'peaking': 'bg-pink-100 text-pink-800 border-pink-300',
  'metabolic': 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

// Phase name translations
const phaseTranslations: Record<string, string> = {
  'anatomical_adaptation': 'Adaptación Anatómica',
  'hypertrophy': 'Hipertrofia',
  'strength': 'Fuerza',
  'power': 'Potencia',
  'endurance': 'Resistencia',
  'deload': 'Descarga',
  'recovery': 'Recuperación',
  'maintenance': 'Mantenimiento',
  'peaking': 'Pico de Rendimiento',
  'metabolic': 'Metabólico',
};

export default function PeriodizationPlanner() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<PeriodizationPlan | null>(null);
  const [trainingCycles, setTrainingCycles] = useState<TrainingCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);

  // Form for creating a new periodization plan
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      description: '',
      level: 'intermediate' as TrainingLevel,
      goal: 'hypertrophy' as TrainingGoal,
      frequency: 4,
      startDate: new Date(),
      duration: 12,
    },
  });

  // Load active plan and training cycles
  useEffect(() => {
    async function loadPlan() {
      if (!user?.id) return;

      setLoading(true);
      try {
        const plan = await getActivePeriodizationPlan(user.id);
        setActivePlan(plan);

        if (plan) {
          const cycles = await getTrainingCycles(plan.id);
          setTrainingCycles(cycles);

          // Find current week
          const now = new Date();
          const currentCycle = cycles.find(cycle =>
            new Date(cycle.startDate) <= now && new Date(cycle.endDate) >= now
          );

          if (currentCycle) {
            setCurrentWeek(currentCycle.weekNumber || 1);
          }
        }
      } catch (error) {
        console.error('Error loading periodization plan:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [user?.id]);

  // Create a new periodization plan
  async function onSubmit(values: PlanFormValues) {
    if (!user?.id) return;

    setCreating(true);
    try {
      // Create plan
      const plan = await createPeriodizationPlan(
        user.id,
        values.level,
        values.goal,
        values.frequency,
        values.name,
        values.description
      );

      if (plan) {
        // Generate training cycles
        const cycles = await generateTrainingCycles(
          plan.id,
          values.level,
          values.goal,
          values.startDate.toISOString(),
          values.duration
        );

        setActivePlan(plan);
        if (cycles) {
          setTrainingCycles(cycles);
        }

        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error creating periodization plan:', error);
    } finally {
      setCreating(false);
    }
  }

  // Render phase badge
  function renderPhaseBadge(phase: string) {
    const colorClass = phaseColors[phase] || 'bg-gray-100 text-gray-800 border-gray-300';
    const phaseName = phaseTranslations[phase] || phase;

    return (
      <Badge variant="outline" className={cn('font-medium', colorClass)}>
        {phaseName}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planificación de Entrenamiento</h2>
          <p className="text-muted-foreground">
            Planifica tu entrenamiento a largo plazo para maximizar tus resultados.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="cycles">Ciclos de Entrenamiento</TabsTrigger>
          <TabsTrigger value="create">Crear Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : activePlan ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{activePlan.name}</CardTitle>
                  <CardDescription>{activePlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Nivel</h4>
                      <p className="font-medium">{trainingLevelOptions.find(o => o.value === activePlan.level)?.label}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Objetivo</h4>
                      <p className="font-medium">{trainingGoalOptions.find(o => o.value === activePlan.goal)?.label}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Frecuencia</h4>
                      <p className="font-medium">{activePlan.frequency} días por semana</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Progreso</h4>
                    {currentWeek && trainingCycles.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana {currentWeek}</span>
                          <span>Semana {trainingCycles[trainingCycles.length - 1].weekNumber}</span>
                        </div>
                        <Progress value={(currentWeek / (trainingCycles[trainingCycles.length - 1].weekNumber || 1)) * 100} />
                      </div>
                    ) : (
                      <p>No hay datos de progreso disponibles</p>
                    )}
                  </div>

                  {currentWeek && (
                    <>
                      <Separator />

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Semana Actual</h4>
                        {trainingCycles.filter(c => c.weekNumber === currentWeek).map(cycle => (
                          <div key={cycle.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{cycle.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(cycle.startDate), 'PPP', { locale: es })} - {format(new Date(cycle.endDate), 'PPP', { locale: es })}
                                </p>
                              </div>
                              {renderPhaseBadge(cycle.phase)}
                            </div>
                            <p className="text-sm">{cycle.notes}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {currentWeek && (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Recomendaciones para esta semana</AlertTitle>
                  <AlertDescription>
                    {trainingCycles.find(c => c.weekNumber === currentWeek)?.phase === 'deload' ? (
                      <p>Esta es una semana de descarga. Reduce el volumen y/o intensidad para permitir la recuperación completa.</p>
                    ) : (
                      <p>Enfócate en {phaseTranslations[trainingCycles.find(c => c.weekNumber === currentWeek)?.phase || '']?.toLowerCase() || 'tu entrenamiento'} esta semana.</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No tienes un plan activo</CardTitle>
                <CardDescription>Crea un plan de periodización para optimizar tus resultados a largo plazo.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setActiveTab('create')}>Crear Plan</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : trainingCycles.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingCycles.map(cycle => (
                  <Card key={cycle.id} className={cn(
                    cycle.weekNumber === currentWeek ? 'border-primary' : '',
                    cycle.isDeload ? 'bg-gray-50' : ''
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{cycle.name}</CardTitle>
                        {renderPhaseBadge(cycle.phase)}
                      </div>
                      <CardDescription>
                        {format(new Date(cycle.startDate), 'PPP', { locale: es })} - {format(new Date(cycle.endDate), 'PPP', { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Volumen</p>
                          <p className="font-medium">{cycle.volume}/10</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intensidad</p>
                          <p className="font-medium">{cycle.intensity}/10</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frecuencia</p>
                          <p className="font-medium">{cycle.frequency} días</p>
                        </div>
                      </div>
                      <p className="text-sm">{cycle.notes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : activePlan ? (
            <Card>
              <CardHeader>
                <CardTitle>No hay ciclos de entrenamiento</CardTitle>
                <CardDescription>No se encontraron ciclos de entrenamiento para tu plan actual.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No tienes un plan activo</CardTitle>
                <CardDescription>Crea un plan de periodización para ver los ciclos de entrenamiento.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setActiveTab('create')}>Crear Plan</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Plan de Periodización</CardTitle>
              <CardDescription>
                Configura tu plan de entrenamiento a largo plazo basado en tus objetivos y nivel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Plan</FormLabel>
                        <FormControl>
                          <Input placeholder="Mi plan de entrenamiento" {...field} />
                        </FormControl>
                        <FormDescription>
                          Un nombre para identificar tu plan de entrenamiento.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descripción de los objetivos y enfoque del plan..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Una breve descripción de tu plan y objetivos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Entrenamiento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu nivel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {trainingLevelOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Tu nivel actual de experiencia en entrenamiento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo Principal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu objetivo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {trainingGoalOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Tu objetivo principal de entrenamiento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia Semanal</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={7} {...field} />
                          </FormControl>
                          <FormDescription>
                            Días de entrenamiento por semana (1-7).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración (Semanas)</FormLabel>
                          <FormControl>
                            <Input type="number" min={4} max={52} {...field} />
                          </FormControl>
                          <FormDescription>
                            Duración del plan en semanas (4-52).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Fecha de inicio del plan de entrenamiento.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Creando...
                      </>
                    ) : (
                      'Crear Plan'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
