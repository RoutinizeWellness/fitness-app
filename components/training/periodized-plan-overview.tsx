'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { getActivePeriodizedPlan } from '@/lib/periodized-training-service';
import { EnhancedMacroCycle, EnhancedMesoCycle, EnhancedMicroCycle } from '@/lib/macrocycle-periodization';
import { DeloadRecommendation } from '@/lib/deload-recommendation-service';
import { WorkoutRoutine } from '@/lib/types/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, BarChart3Icon, ActivityIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from 'date-fns';

interface PeriodizedPlanOverviewProps {
  userId?: string;
}

export default function PeriodizedPlanOverview({ userId }: PeriodizedPlanOverviewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [periodizedPlan, setPeriodizedPlan] = useState<{
    macrocycle: EnhancedMacroCycle | null;
    currentMesocycle: EnhancedMesoCycle | null;
    currentMicrocycle: EnhancedMicroCycle | null;
    currentRoutine: WorkoutRoutine | null;
    deloadRecommendation: DeloadRecommendation | null;
  }>({
    macrocycle: null,
    currentMesocycle: null,
    currentMicrocycle: null,
    currentRoutine: null,
    deloadRecommendation: null
  });
  
  useEffect(() => {
    const fetchPeriodizedPlan = async () => {
      try {
        setLoading(true);
        const id = userId || user?.id;
        
        if (!id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        const plan = await getActivePeriodizedPlan(id);
        setPeriodizedPlan(plan);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching periodized plan:', err);
        setError('Failed to load periodized training plan');
        setLoading(false);
      }
    };
    
    fetchPeriodizedPlan();
  }, [userId, user?.id]);
  
  const { macrocycle, currentMesocycle, currentMicrocycle, currentRoutine, deloadRecommendation } = periodizedPlan;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!macrocycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Training Plan</CardTitle>
          <CardDescription>You don't have an active periodized training plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Create a periodized training plan to optimize your progress with scientifically-designed
            macrocycles, mesocycles, and microcycles.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/training/create-plan')}>
            Create Training Plan
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Calculate progress percentages
  const calculateMacrocycleProgress = () => {
    const start = new Date(macrocycle.startDate);
    const end = new Date(macrocycle.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  const calculateMesocycleProgress = () => {
    if (!currentMesocycle) return 0;
    
    const start = new Date(currentMesocycle.startDate);
    const end = new Date(currentMesocycle.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  const calculateMicrocycleProgress = () => {
    if (!currentMicrocycle) return 0;
    
    const start = new Date(currentMicrocycle.startDate);
    const end = new Date(currentMicrocycle.endDate);
    const now = new Date();
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  const macrocycleProgress = calculateMacrocycleProgress();
  const mesocycleProgress = calculateMesocycleProgress();
  const microcycleProgress = calculateMicrocycleProgress();
  
  // Format phase names for display
  const formatPhase = (phase: string) => {
    return phase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{macrocycle.name}</CardTitle>
              <CardDescription>{macrocycle.description}</CardDescription>
            </div>
            <Badge variant={macrocycle.primaryGoal === 'hypertrophy' ? 'default' : 
                           macrocycle.primaryGoal === 'strength' ? 'destructive' : 
                           macrocycle.primaryGoal === 'weight_loss' ? 'secondary' : 'outline'}>
              {macrocycle.primaryGoal.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Macrocycle Progress</span>
                <span>{macrocycleProgress}%</span>
              </div>
              <Progress value={macrocycleProgress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{format(new Date(macrocycle.startDate), 'MMM d, yyyy')}</span>
                <span>{format(new Date(macrocycle.endDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {currentMesocycle && (
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Current Mesocycle: {currentMesocycle.name}</span>
                  <span>{mesocycleProgress}%</span>
                </div>
                <Progress value={mesocycleProgress} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Phase: {formatPhase(currentMesocycle.phase)}</span>
                  <span>{currentMesocycle.includesDeload ? 'Includes Deload' : 'No Deload'}</span>
                </div>
              </div>
            )}
            
            {currentMicrocycle && (
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Current Week: {currentMicrocycle.name}</span>
                  <span>{microcycleProgress}%</span>
                </div>
                <Progress value={microcycleProgress} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Volume: {currentMicrocycle.volume}/10</span>
                  <span>Intensity: {currentMicrocycle.intensity}/10</span>
                  <span>RIR: {currentMicrocycle.targetRIR}</span>
                </div>
              </div>
            )}
            
            {deloadRecommendation && (
              <Alert className={deloadRecommendation.urgency === 'critical' ? 'bg-red-100 border-red-400' : 
                              deloadRecommendation.urgency === 'high' ? 'bg-amber-100 border-amber-400' : 
                              'bg-blue-100 border-blue-400'}>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Deload Recommended ({deloadRecommendation.urgency} priority)</AlertTitle>
                <AlertDescription>
                  {deloadRecommendation.reasons[0]}
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={() => router.push('/training/deload')}>
                      View Deload Plan
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/training/plan-details')}>
            View Full Plan
          </Button>
          <Button onClick={() => router.push('/training/workout')}>
            Start Today's Workout
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Training Focus</CardTitle>
            </CardHeader>
            <CardContent>
              {currentMesocycle && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Phase: {formatPhase(currentMesocycle.phase)}</h4>
                    <p className="text-sm text-muted-foreground">{currentMesocycle.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Primary Focus</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentMesocycle.primaryFocus.map((focus, index) => (
                        <Badge key={index} variant="outline">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Special Techniques</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentMesocycle.specialTechniques.slice(0, 3).map((technique, index) => (
                        <Badge key={index} variant="secondary">{technique}</Badge>
                      ))}
                      {currentMesocycle.specialTechniques.length > 3 && (
                        <Badge variant="secondary">+{currentMesocycle.specialTechniques.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {currentRoutine && (
            <Card>
              <CardHeader>
                <CardTitle>Current Routine</CardTitle>
                <CardDescription>{currentRoutine.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentRoutine.days.slice(0, 4).map((day, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-medium">{day.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{day.description}</p>
                      <div className="text-xs">
                        {day.targetMuscleGroups.map((muscle, i) => (
                          <span key={i} className="inline-block bg-muted rounded-full px-2 py-1 mr-1 mb-1">
                            {muscle.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {currentRoutine.days.length > 4 && (
                  <div className="text-center mt-2">
                    <Button variant="link" onClick={() => router.push('/training/routine')}>
                      View all {currentRoutine.days.length} days
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Schedule content would go here */}
                <p className="text-muted-foreground">Schedule view is under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Training Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Metrics content would go here */}
                <p className="text-muted-foreground">Metrics view is under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
