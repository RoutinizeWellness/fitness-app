'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { createPeriodizedPplPlan } from '@/lib/periodized-training-service';
import { PplFrequency, PplVariant } from '@/lib/templates/ppl-templates-fixed';
import { TrainingLevel, TrainingGoal } from '@/lib/types/periodization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format, addMonths } from 'date-fns';
import { CalendarIcon, InfoIcon, CheckCircleIcon, AlertTriangleIcon, LoaderIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function CreatePeriodizedPlanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [planName, setPlanName] = useState('');
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [level, setLevel] = useState<TrainingLevel>('intermediate');
  const [frequency, setFrequency] = useState<PplFrequency>(5);
  const [variant, setVariant] = useState<PplVariant>('standard');
  const [duration, setDuration] = useState(3); // in months
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [priorityMuscleGroups, setPriorityMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([
    'barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl'
  ]);
  const [includeNutritionPlan, setIncludeNutritionPlan] = useState(true);
  const [includeDeloads, setIncludeDeloads] = useState(true);

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a training plan');
      return;
    }

    if (!planName) {
      setError('Please enter a name for your training plan');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await createPeriodizedPplPlan(
        user.id,
        planName,
        goal,
        level,
        frequency,
        variant,
        duration,
        startDate.toISOString(),
        {
          priorityMuscleGroups,
          equipment,
          includeNutritionPlan,
          includeDeloads
        }
      );

      setSuccess(true);
      setLoading(false);

      // Redirect to the training dashboard after a short delay
      setTimeout(() => {
        router.push('/training');
      }, 2000);
    } catch (err) {
      console.error('Error creating periodized plan:', err);
      setError('Failed to create training plan. Please try again.');
      setLoading(false);
    }
  };

  const handlePriorityMuscleGroupChange = (muscleGroup: string) => {
    setPriorityMuscleGroups(current =>
      current.includes(muscleGroup)
        ? current.filter(m => m !== muscleGroup)
        : [...current, muscleGroup]
    );
  };

  const handleEquipmentChange = (item: string) => {
    setEquipment(current =>
      current.includes(item)
        ? current.filter(e => e !== item)
        : [...current, item]
    );
  };

  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your periodized training plan has been created successfully. Redirecting to your training dashboard...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Periodized Training Plan</CardTitle>
          <CardDescription>
            Design a scientifically-structured training plan with macrocycles, mesocycles, and microcycles
            for optimal progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium",
                    activeStep === step
                      ? "bg-primary text-primary-foreground"
                      : activeStep > step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <div className="absolute top-0 left-0 h-1 bg-muted w-full rounded-full"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(activeStep - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="My Periodized Training Plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Training Goal</Label>
                <RadioGroup
                  value={goal}
                  onValueChange={(value) => setGoal(value as TrainingGoal)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hypertrophy" id="hypertrophy" />
                    <Label htmlFor="hypertrophy">Hypertrophy (Muscle Growth)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strength" id="strength" />
                    <Label htmlFor="strength">Strength</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weight_loss" id="weight_loss" />
                    <Label htmlFor="weight_loss">Weight Loss</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general_fitness" id="general_fitness" />
                    <Label htmlFor="general_fitness">General Fitness</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <RadioGroup
                  value={level}
                  onValueChange={(value) => setLevel(value as TrainingLevel)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="elite" id="elite" />
                    <Label htmlFor="elite">Elite</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Training Frequency</Label>
                <RadioGroup
                  value={frequency.toString()}
                  onValueChange={(value) => setFrequency(parseInt(value) as PplFrequency)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="freq-5" />
                    <Label htmlFor="freq-5">5 days/week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6" id="freq-6" />
                    <Label htmlFor="freq-6">6 days/week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="freq-7" />
                    <Label htmlFor="freq-7">7 days/week</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Training Style</Label>
                <RadioGroup
                  value={variant}
                  onValueChange={(value) => setVariant(value as PplVariant)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard Push/Pull/Legs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nippard" id="nippard" />
                    <Label htmlFor="nippard">Jeff Nippard's Scientific Approach</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cbum" id="cbum" />
                    <Label htmlFor="cbum">Chris Bumstead's Training Style</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="volume_focus" id="volume_focus" />
                    <Label htmlFor="volume_focus">Volume-Focused Approach</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strength_focus" id="strength_focus" />
                    <Label htmlFor="strength_focus">Strength-Focused Approach</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Plan Duration</Label>
                <div className="pt-2">
                  <Slider
                    value={[duration]}
                    min={1}
                    max={12}
                    step={1}
                    onValueChange={(value) => setDuration(value[0])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>1 month</span>
                    <span>{duration} {duration === 1 ? 'month' : 'months'}</span>
                    <span>12 months</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  End date: {format(addMonths(startDate, duration), 'PPP')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-nutrition"
                    checked={includeNutritionPlan}
                    onCheckedChange={(checked) => setIncludeNutritionPlan(checked as boolean)}
                  />
                  <Label htmlFor="include-nutrition">Include Nutrition Periodization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-deloads"
                    checked={includeDeloads}
                    onCheckedChange={(checked) => setIncludeDeloads(checked as boolean)}
                  />
                  <Label htmlFor="include-deloads">Include Programmed Deloads</Label>
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Priority Muscle Groups (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves'].map((muscle) => (
                    <div key={muscle} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscle}`}
                        checked={priorityMuscleGroups.includes(muscle)}
                        onCheckedChange={() => handlePriorityMuscleGroupChange(muscle)}
                      />
                      <Label htmlFor={`muscle-${muscle}`}>{muscle.charAt(0).toUpperCase() + muscle.slice(1)}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select muscle groups you want to prioritize in your training plan
                </p>
              </div>

              <div className="space-y-2">
                <Label>Available Equipment</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['barbell', 'dumbbell', 'cable', 'pullup_bar', 'leg_press', 'leg_extension', 'leg_curl', 'smith_machine', 'hack_squat'].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${item}`}
                        checked={equipment.includes(item)}
                        onCheckedChange={() => handleEquipmentChange(item)}
                      />
                      <Label htmlFor={`equipment-${item}`}>{item.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push('/training')}>
              Cancel
            </Button>
          )}

          {activeStep < 4 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Creating Plan...
                </>
              ) : (
                'Create Plan'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
