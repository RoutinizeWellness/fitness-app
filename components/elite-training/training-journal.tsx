"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Search, 
  Plus,
  Tag,
  Calendar,
  Camera,
  Video,
  Mic,
  Download,
  Filter,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Heart,
  Zap,
  Moon,
  Utensils,
  Activity,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { eliteTrainingSystem, TrainingJournalEntry, ObjectiveMetrics, SubjectiveMetrics, PatternAnalysis } from "@/lib/elite-training/core-system"
import { format, subDays, startOfWeek, endOfWeek } from "date-fns"

interface TrainingJournalProps {
  userId: string
}

interface JournalTemplate {
  id: string
  name: string
  description: string
  fields: TemplateField[]
}

interface TemplateField {
  id: string
  name: string
  type: 'text' | 'number' | 'slider' | 'select' | 'multiselect'
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'strength_training',
    name: 'Strength Training',
    description: 'Comprehensive strength training session log',
    fields: [
      { id: 'session_rpe', name: 'Session RPE', type: 'slider', required: true, min: 1, max: 10 },
      { id: 'total_volume', name: 'Total Volume (kg)', type: 'number', required: true },
      { id: 'primary_lifts', name: 'Primary Lifts', type: 'multiselect', required: true, 
        options: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Row'] },
      { id: 'energy_level', name: 'Energy Level', type: 'slider', required: true, min: 1, max: 10 },
      { id: 'joint_pain', name: 'Joint Pain Areas', type: 'multiselect', required: false,
        options: ['Knees', 'Lower Back', 'Shoulders', 'Elbows', 'Wrists', 'Hips', 'Ankles'] }
    ]
  },
  {
    id: 'competition_prep',
    name: 'Competition Prep',
    description: 'Detailed competition preparation tracking',
    fields: [
      { id: 'weight', name: 'Body Weight (kg)', type: 'number', required: true },
      { id: 'body_fat', name: 'Body Fat %', type: 'number', required: false },
      { id: 'cardio_duration', name: 'Cardio Duration (min)', type: 'number', required: false },
      { id: 'posing_practice', name: 'Posing Practice (min)', type: 'number', required: false },
      { id: 'stage_readiness', name: 'Stage Readiness', type: 'slider', required: true, min: 1, max: 10 }
    ]
  },
  {
    id: 'recovery_day',
    name: 'Recovery Day',
    description: 'Active recovery and wellness tracking',
    fields: [
      { id: 'sleep_quality', name: 'Sleep Quality', type: 'slider', required: true, min: 1, max: 10 },
      { id: 'stress_level', name: 'Stress Level', type: 'slider', required: true, min: 1, max: 10 },
      { id: 'recovery_activities', name: 'Recovery Activities', type: 'multiselect', required: false,
        options: ['Massage', 'Stretching', 'Yoga', 'Meditation', 'Sauna', 'Ice Bath', 'Walking'] },
      { id: 'soreness_level', name: 'Overall Soreness', type: 'slider', required: true, min: 1, max: 10 }
    ]
  }
]

export function TrainingJournal({ userId }: TrainingJournalProps) {
  const { toast } = useToast()
  
  const [entries, setEntries] = useState<TrainingJournalEntry[]>([])
  const [patterns, setPatterns] = useState<PatternAnalysis[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [searchFilters, setSearchFilters] = useState({
    keywords: '',
    tags: [] as string[],
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    },
    rpeRange: { min: 1, max: 10 },
    moodRange: { min: 1, max: 10 }
  })
  
  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    templateId: '',
    objectiveData: {} as ObjectiveMetrics,
    subjectiveData: {
      mood: 7,
      energy: 7,
      motivation: 7,
      stress: 5,
      soreness: 3,
      notes: '',
      perceivedRecovery: 7
    } as SubjectiveMetrics
  })
  
  const [availableTags, setAvailableTags] = useState<string[]>([
    'strength', 'hypertrophy', 'cardio', 'recovery', 'competition', 'deload',
    'pr', 'technique', 'injury', 'breakthrough', 'plateau', 'experiment'
  ])
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadJournalEntries()
    loadPatternAnalyses()
  }, [userId])

  const loadJournalEntries = async () => {
    try {
      setIsLoading(true)
      const journalEntries = await eliteTrainingSystem.searchJournalEntries(userId, searchFilters)
      setEntries(journalEntries)
    } catch (error) {
      console.error('Error loading journal entries:', error)
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPatternAnalyses = async () => {
    try {
      const patternAnalyses = await eliteTrainingSystem.analyzePatterns(userId)
      setPatterns(patternAnalyses)
    } catch (error) {
      console.error('Error loading pattern analyses:', error)
    }
  }

  const createJournalEntry = async () => {
    try {
      if (!newEntry.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a title for your journal entry",
          variant: "destructive"
        })
        return
      }

      const entry = await eliteTrainingSystem.createJournalEntry({
        userId,
        date: new Date(),
        title: newEntry.title,
        content: newEntry.content,
        tags: newEntry.tags,
        templateId: newEntry.templateId || undefined,
        objectiveData: newEntry.objectiveData,
        subjectiveData: newEntry.subjectiveData,
        attachments: []
      })

      setEntries(prev => [entry, ...prev])
      setIsCreating(false)
      resetNewEntry()

      toast({
        title: "Entry Created",
        description: "Your training journal entry has been saved",
      })

      // Reload patterns after new entry
      loadPatternAnalyses()
    } catch (error) {
      console.error('Error creating journal entry:', error)
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive"
      })
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      title: '',
      content: '',
      tags: [],
      templateId: '',
      objectiveData: {},
      subjectiveData: {
        mood: 7,
        energy: 7,
        motivation: 7,
        stress: 5,
        soreness: 3,
        notes: '',
        perceivedRecovery: 7
      }
    })
    setSelectedTemplate('')
  }

  const addTag = (tag: string) => {
    if (!newEntry.tags.includes(tag)) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const applyTemplate = (templateId: string) => {
    const template = JOURNAL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setNewEntry(prev => ({
        ...prev,
        templateId,
        title: `${template.name} - ${format(new Date(), 'MMM dd, yyyy')}`
      }))
    }
  }

  const searchEntries = async () => {
    try {
      setIsLoading(true)
      const results = await eliteTrainingSystem.searchJournalEntries(userId, searchFilters)
      setEntries(results)
    } catch (error) {
      console.error('Error searching entries:', error)
      toast({
        title: "Search Error",
        description: "Failed to search journal entries",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportEntries = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      entries: entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString()
      })),
      patterns
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training_journal_${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Your training journal has been exported",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Elite Training Journal
              </CardTitle>
              <CardDescription>
                Advanced training documentation with pattern analysis
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportEntries} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Entry
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
        </TabsList>

        {/* Journal Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div>
                  <Label>Entry Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOURNAL_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter entry title..."
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe your training session, observations, and insights..."
                    rows={6}
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newEntry.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.filter(tag => !newEntry.tags.includes(tag)).map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Subjective Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mood (1-10)</Label>
                    <Slider
                      value={[newEntry.subjectiveData.mood]}
                      onValueChange={(value) => setNewEntry(prev => ({
                        ...prev,
                        subjectiveData: { ...prev.subjectiveData, mood: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {newEntry.subjectiveData.mood}
                    </div>
                  </div>

                  <div>
                    <Label>Energy (1-10)</Label>
                    <Slider
                      value={[newEntry.subjectiveData.energy]}
                      onValueChange={(value) => setNewEntry(prev => ({
                        ...prev,
                        subjectiveData: { ...prev.subjectiveData, energy: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {newEntry.subjectiveData.energy}
                    </div>
                  </div>

                  <div>
                    <Label>Stress (1-10)</Label>
                    <Slider
                      value={[newEntry.subjectiveData.stress]}
                      onValueChange={(value) => setNewEntry(prev => ({
                        ...prev,
                        subjectiveData: { ...prev.subjectiveData, stress: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {newEntry.subjectiveData.stress}
                    </div>
                  </div>

                  <div>
                    <Label>Soreness (1-10)</Label>
                    <Slider
                      value={[newEntry.subjectiveData.soreness]}
                      onValueChange={(value) => setNewEntry(prev => ({
                        ...prev,
                        subjectiveData: { ...prev.subjectiveData, soreness: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {newEntry.subjectiveData.soreness}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button onClick={createJournalEntry} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Entry
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Entries List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Journal Entries</h3>
                <p className="text-gray-600 mb-4">Start documenting your training journey</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Entry
                </Button>
              </div>
            ) : (
              entries.map(entry => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(entry.date), 'EEEE, MMMM dd, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{entry.content}</p>
                    
                    {/* Metrics Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Mood: {entry.subjectiveData.mood}/10</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Energy: {entry.subjectiveData.energy}/10</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Stress: {entry.subjectiveData.stress}/10</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Soreness: {entry.subjectiveData.soreness}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Pattern Analysis Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Pattern Analysis
              </CardTitle>
              <CardDescription>
                Discover correlations and insights from your training data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patterns.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Patterns Detected</h3>
                  <p className="text-gray-600">Add more journal entries to enable pattern analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patterns.map(pattern => (
                    <div key={pattern.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">
                          {pattern.variables.join(' vs ')} Correlation
                        </h4>
                        <Badge variant={
                          pattern.significance === 'high' ? 'default' :
                          pattern.significance === 'medium' ? 'secondary' : 'outline'
                        }>
                          {pattern.significance} significance
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">
                          Correlation: {(pattern.correlation * 100).toFixed(1)}% 
                          (Confidence: {pattern.confidence.toFixed(1)}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              pattern.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.abs(pattern.correlation) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-sm">Insights:</h5>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {pattern.insights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm">Recommendations:</h5>
                          <ul className="text-sm text-blue-600 list-disc list-inside">
                            {pattern.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Advanced Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keywords */}
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={searchFilters.keywords}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Search in titles and content..."
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={format(searchFilters.dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={format(searchFilters.dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              {/* RPE Range */}
              <div>
                <Label>RPE Range: {searchFilters.rpeRange.min} - {searchFilters.rpeRange.max}</Label>
                <div className="px-3">
                  <Slider
                    value={[searchFilters.rpeRange.min, searchFilters.rpeRange.max]}
                    onValueChange={(value) => setSearchFilters(prev => ({
                      ...prev,
                      rpeRange: { min: value[0], max: value[1] }
                    }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Mood Range */}
              <div>
                <Label>Mood Range: {searchFilters.moodRange.min} - {searchFilters.moodRange.max}</Label>
                <div className="px-3">
                  <Slider
                    value={[searchFilters.moodRange.min, searchFilters.moodRange.max]}
                    onValueChange={(value) => setSearchFilters(prev => ({
                      ...prev,
                      moodRange: { min: value[0], max: value[1] }
                    }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={searchEntries} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Entries
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
