'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getTrainingTemplates, createRoutineFromTemplate } from '@/lib/supabase-training-templates';
import { WorkoutRoutine } from '@/lib/types/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  SearchIcon,
  FilterIcon,
  DumbbellIcon,
  ClockIcon,
  CalendarIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  ArrowRightIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PeriodizedTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WorkoutRoutine[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutRoutine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);

        const { templates: fetchedTemplates, error: fetchError } = await getTrainingTemplates();

        if (fetchError) {
          setError('Failed to load templates: ' + JSON.stringify(fetchError));
        } else {
          setTemplates(fetchedTemplates);
          setFilteredTemplates(fetchedTemplates);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('An unexpected error occurred while loading templates');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...templates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(template => template.level === levelFilter);
    }

    // Apply goal filter
    if (goalFilter !== 'all') {
      filtered = filtered.filter(template => template.goal === goalFilter);
    }

    // Apply frequency filter
    if (frequencyFilter !== 'all') {
      filtered = filtered.filter(template => {
        if (frequencyFilter === '5') return template.frequency === '5 days/week' || template.frequency === 5;
        if (frequencyFilter === '6') return template.frequency === '6 days/week' || template.frequency === 6;
        if (frequencyFilter === '7') return template.frequency === '7 days/week' || template.frequency === 7;
        return true;
      });
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'standard') {
        filtered = filtered.filter(template => template.source === 'standard' || !template.source);
      } else if (activeTab === 'nippard') {
        filtered = filtered.filter(template => template.source === 'nippard');
      } else if (activeTab === 'cbum') {
        filtered = filtered.filter(template => template.source === 'cbum');
      } else if (activeTab === 'upper_lower') {
        filtered = filtered.filter(template => template.split === 'upper_lower');
      } else if (activeTab === 'specialized') {
        filtered = filtered.filter(template => template.frequency === '7 days/week' || template.frequency === 7);
      }
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, levelFilter, goalFilter, frequencyFilter, activeTab]);

  const handleCreateFromTemplate = async (templateId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a routine from a template.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingTemplate(templateId);

      const { routine, error: createError } = await createRoutineFromTemplate(templateId, user.id);

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

      setCreatingTemplate(null);
    } catch (err) {
      console.error('Error creating routine from template:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setCreatingTemplate(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/training')}>
          Go Back to Training
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Periodized Training Templates</h1>
          <p className="text-gray-600 mt-1">
            Select from our scientifically-designed periodized training templates
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/training')}
          className="mt-4 md:mt-0"
        >
          <ArrowRightIcon className="h-4 w-4 mr-2" />
          Back to Training
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Training Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="5">5 days/week</SelectItem>
                <SelectItem value="6">6 days/week</SelectItem>
                <SelectItem value="7">7 days/week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="standard">Standard PPL</TabsTrigger>
          <TabsTrigger value="nippard">Jeff Nippard</TabsTrigger>
          <TabsTrigger value="cbum">CBUM</TabsTrigger>
          <TabsTrigger value="upper_lower">Upper/Lower</TabsTrigger>
          <TabsTrigger value="specialized">Specialized</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FilterIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search query to find more templates.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setLevelFilter('all');
            setGoalFilter('all');
            setFrequencyFilter('all');
            setActiveTab('all');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
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

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{template.days.length} workout days</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>~{Math.round(template.days.reduce((acc, day) =>
                      acc + (day.estimatedDuration || 45), 0) / template.days.length)} min/workout</span>
                  </div>
                  <div className="flex items-center">
                    <DumbbellIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{template.days.reduce((acc, day) =>
                      acc + (day.exerciseSets?.length || 0), 0)} total exercises</span>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/training/template/${template.id}`)}
                >
                  <ChevronRightIcon className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={() => handleCreateFromTemplate(template.id)}
                  disabled={!!creatingTemplate}
                  className={creatingTemplate === template.id ? 'opacity-80' : ''}
                >
                  {creatingTemplate === template.id ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Use Template
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
