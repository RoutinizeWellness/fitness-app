'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getTrainingTemplates, createRoutineFromTemplate } from '@/lib/supabase-training-templates';
import { WorkoutRoutine, WorkoutDay, ExerciseSet } from '@/lib/types/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  ArrowLeftIcon,
  DumbbellIcon,
  ClockIcon,
  CalendarIcon,
  PlusCircleIcon,
  InfoIcon,
  TargetIcon,
  ListIcon,
  TimerIcon,
  FlameIcon,
  BarChart3Icon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<WorkoutRoutine | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);

        const { templates: fetchedTemplates, error: fetchError } = await getTrainingTemplates();

        if (fetchError) {
          setError('Failed to load template: ' + JSON.stringify(fetchError));
        } else {
          const foundTemplate = fetchedTemplates.find(t => t.id === params.id);

          if (foundTemplate) {
            setTemplate(foundTemplate);
          } else {
            setError('Template not found');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('An unexpected error occurred while loading the template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  const handleCreateFromTemplate = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a routine from a template.",
        variant: "destructive"
      });
      return;
    }

    if (!template) {
      toast({
        title: "Error",
        description: "Template not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingTemplate(true);

      const { routine, error: createError } = await createRoutineFromTemplate(template.id, user.id);

      if (createError) {
        console.error('Error creating routine from template:', createError);
        toast({
          title: "Error",
          description: "Failed to create routine from template.",
          variant: "destructive"
        });
      } else if (routine) {
        toast({
          title: "Success",
          description: "Routine created successfully.",
        });

        // Redirect to the routine page
        setTimeout(() => {
          router.push(`/training/routine/${routine.id}`);
        }, 500);
      }

      setCreatingTemplate(false);
    } catch (err) {
      console.error('Error creating routine from template:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setCreatingTemplate(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Template not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/training/periodized-templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/training/periodized-templates')}
          className="mr-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{template.name}</h1>
          <p className="text-gray-600">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Workout Schedule</CardTitle>
              <CardDescription>
                {template.days.length} workout days per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={template.days[0]?.id || "day1"}>
                <TabsList className="mb-4">
                  {template.days.map((day, index) => (
                    <TabsTrigger key={day.id} value={day.id}>
                      Day {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {template.days.map((day) => (
                  <TabsContent key={day.id} value={day.id}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{day.name}</h3>
                        <p className="text-gray-600">{day.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {day.targetMuscleGroups.map((muscle, index) => (
                          <Badge key={index} variant="outline">
                            {muscle.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>~{day.estimatedDuration} min</span>
                        </div>
                        <div className="flex items-center">
                          <DumbbellIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{day.exerciseSets?.length || 0} exercises</span>
                        </div>
                        <div className="flex items-center">
                          <TargetIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Difficulty: {day.difficulty}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="font-medium">Exercises</h4>
                        <Accordion type="single" collapsible className="w-full">
                          {day.exerciseSets?.map((exercise, index) => (
                            <AccordionItem key={exercise.id} value={exercise.id}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-3">
                                      {index + 1}
                                    </span>
                                    <span>{exercise.name}</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pl-12 space-y-3">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center">
                                      <ListIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>Sets: {exercise.sets}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <BarChart3Icon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>Reps: {exercise.reps}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <FlameIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>RIR: {exercise.rir}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <TimerIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>Rest: {exercise.restSeconds}s</span>
                                    </div>
                                  </div>

                                  {exercise.notes && (
                                    <div className="flex items-start">
                                      <InfoIcon className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                      <span className="text-sm">{exercise.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      template.goal === 'hypertrophy' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      template.goal === 'strength' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      template.goal === 'weight_loss' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }
                  >
                    {template.goal.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50">
                    {template.level}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50">
                    {typeof template.frequency === 'number'
                      ? `${template.frequency} days/week`
                      : template.frequency}
                  </Badge>
                  {template.includesDeload && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Includes Deload
                    </Badge>
                  )}
                  {template.source && (
                    <Badge variant="outline" className={
                      template.source === 'nippard' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      template.source === 'cbum' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50'
                    }>
                      {template.source === 'nippard' ? 'Jeff Nippard' :
                       template.source === 'cbum' ? 'CBUM' :
                       template.source}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Training Split</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {template.days.map((day, index) => (
                      <div key={index} className="bg-gray-100 rounded p-2 text-center text-xs">
                        <div className="font-medium">Day {index + 1}</div>
                        <div className="text-gray-600 truncate">{day.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Features</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Scientifically designed training split</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Progressive overload principles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span className="text-sm">Balanced volume and intensity</span>
                    </li>
                    {template.includesDeload && (
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Programmed deload periods</span>
                      </li>
                    )}
                    {template.source === 'nippard' && (
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Based on Jeff Nippard's scientific approach</span>
                      </li>
                    )}
                    {template.source === 'cbum' && (
                      <li className="flex items-start">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">Based on Chris Bumstead's training methodology</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateFromTemplate}
                disabled={creatingTemplate}
              >
                {creatingTemplate ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Creating Routine...
                  </>
                ) : (
                  <>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Use This Template
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
