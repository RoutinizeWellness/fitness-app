"use client"

import React, { useState, useEffect } from "react"
import {
  Settings, Brain, Zap, Target, Calendar, Clock,
  TrendingUp, Activity, Dumbbell, RefreshCw, Save,
  AlertCircle, CheckCircle, Info, BarChart3, Users
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { eliteTrainingSystem, TrainingPlan, TrainingPhase, Goal } from "@/lib/elite-training/core-system"
import { format, addWeeks, differenceInWeeks } from "date-fns"

interface PlanOptimizationProps {
  userId: string
}

interface OptimizationSettings {
  autoAdjustments: boolean
  volumeProgression: number
  intensityProgression: number
  recoveryFactor: number
  equipmentAvailable: string[]
  timeConstraints: {
    sessionsPerWeek: number
    sessionDuration: number
  }
  priorityGoals: string[]
}

interface PlanTemplate {
  id: string
  name: string
  description: string
  type: 'strength' | 'hypertrophy' | 'power' | 'endurance' | 'sport_specific'
  duration: number
  phases: TemplatePhase[]
  suitableFor: string[]
}

interface TemplatePhase {
  name: string
  duration: number
  focus: string[]
  volumeMultiplier: number
  intensityRange: { min: number; max: number }
}

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'linear_strength',
    name: 'Linear Strength Progression',
    description: 'Classic linear periodization for strength gains',
    type: 'strength',
    duration: 12,
    phases: [
      {
        name: 'Hypertrophy Base',
        duration: 4,
        focus: ['volume', 'technique'],
        volumeMultiplier: 1.2,
        intensityRange: { min: 65, max: 75 }
      },
      {
        name: 'Strength Development',
        duration: 4,
        focus: ['strength', 'power'],
        volumeMultiplier: 1.0,
        intensityRange: { min: 75, max: 85 }
      },
      {
        name: 'Peak Strength',
        duration: 3,
        focus: ['max_strength', 'neural_adaptation'],
        volumeMultiplier: 0.8,
        intensityRange: { min: 85, max: 95 }
      },
      {
        name: 'Deload',
        duration: 1,
        focus: ['recovery'],
        volumeMultiplier: 0.6,
        intensityRange: { min: 60, max: 70 }
      }
    ],
    suitableFor: ['intermediate', 'advanced']
  },
  {
    id: 'conjugate_method',
    name: 'Conjugate Method',
    description: 'Westside Barbell conjugate system for advanced athletes',
    type: 'strength',
    duration: 16,
    phases: [
      {
        name: 'Max Effort Upper',
        duration: 4,
        focus: ['max_strength', 'neural_power'],
        volumeMultiplier: 0.9,
        intensityRange: { min: 90, max: 100 }
      },
      {
        name: 'Dynamic Effort Lower',
        duration: 4,
        focus: ['speed_strength', 'power'],
        volumeMultiplier: 1.1,
        intensityRange: { min: 50, max: 60 }
      },
      {
        name: 'Repetition Method',
        duration: 4,
        focus: ['hypertrophy', 'work_capacity'],
        volumeMultiplier: 1.3,
        intensityRange: { min: 65, max: 80 }
      },
      {
        name: 'Competition Prep',
        duration: 4,
        focus: ['peaking', 'technique'],
        volumeMultiplier: 0.7,
        intensityRange: { min: 85, max: 100 }
      }
    ],
    suitableFor: ['advanced', 'elite']
  },
  {
    id: 'hypertrophy_focus',
    name: 'Hypertrophy Specialization',
    description: 'Volume-focused program for muscle growth',
    type: 'hypertrophy',
    duration: 8,
    phases: [
      {
        name: 'Volume Accumulation',
        duration: 3,
        focus: ['volume', 'metabolic_stress'],
        volumeMultiplier: 1.4,
        intensityRange: { min: 65, max: 75 }
      },
      {
        name: 'Intensification',
        duration: 3,
        focus: ['progressive_overload', 'strength'],
        volumeMultiplier: 1.1,
        intensityRange: { min: 75, max: 85 }
      },
      {
        name: 'Deload',
        duration: 1,
        focus: ['recovery', 'technique'],
        volumeMultiplier: 0.6,
        intensityRange: { min: 60, max: 70 }
      },
      {
        name: 'Specialization',
        duration: 1,
        focus: ['weak_points', 'refinement'],
        volumeMultiplier: 1.2,
        intensityRange: { min: 70, max: 80 }
      }
    ],
    suitableFor: ['beginner', 'intermediate', 'advanced']
  }
]

const EQUIPMENT_OPTIONS = [
  'Barbell', 'Dumbbells', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar',
  'Cable Machine', 'Smith Machine', 'Leg Press', 'Lat Pulldown', 'Rowing Machine',
  'Squat Rack', 'Bench', 'Olympic Plates', 'Adjustable Dumbbells'
]

export function PlanOptimization({ userId }: PlanOptimizationProps) {
  const { toast } = useToast()
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('plans')

  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    autoAdjustments: true,
    volumeProgression: 5,
    intensityProgression: 2.5,
    recoveryFactor: 1.0,
    equipmentAvailable: [],
    timeConstraints: {
      sessionsPerWeek: 4,
      sessionDuration: 90
    },
    priorityGoals: []
  })

  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    type: 'strength' as const,
    duration: 12,
    templateId: '',
    customPhases: [] as TemplatePhase[]
  })

  useEffect(() => {
    loadPlans()
    loadGoals()
  }, [userId])

  const loadPlans = async () => {
    try {
      const userPlans = await eliteTrainingSystem.getUserTrainingPlans(userId)
      setPlans(userPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
      toast({
        title: "Error",
        description: "Failed to load training plans",
        variant: "destructive"
      })
    }
  }

  const loadGoals = async () => {
    try {
      const userGoals = await eliteTrainingSystem.getUserGoals(userId)
      setGoals(userGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const optimizePlan = async (planId: string) => {
    try {
      setIsOptimizing(true)

      // Get recent performance data
      const performanceData = await eliteTrainingSystem.getRecentPerformanceData(userId)

      // Run AI optimization
      const optimizedPlan = await eliteTrainingSystem.optimizeTrainingPlan(userId, planId)

      // Update local state
      setPlans(prev => prev.map(plan =>
        plan.id === planId ? optimizedPlan : plan
      ))

      toast({
        title: "Plan Optimized",
        description: "Your training plan has been optimized based on recent performance data",
      })
    } catch (error) {
      console.error('Error optimizing plan:', error)
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize training plan",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const createPlanFromTemplate = async (template: PlanTemplate) => {
    try {
      const plan = await eliteTrainingSystem.createTrainingPlan({
        userId,
        name: newPlan.name || template.name,
        description: newPlan.description || template.description,
        type: template.type,
        duration: template.duration,
        currentWeek: 1,
        goals: optimizationSettings.priorityGoals,
        phases: template.phases.map(phase => ({
          id: `phase_${Date.now()}_${Math.random()}`,
          name: phase.name,
          duration: phase.duration,
          focus: phase.focus,
          volumeMultiplier: phase.volumeMultiplier,
          intensityRange: phase.intensityRange,
          exercises: [],
          deloadWeek: phase.name.toLowerCase().includes('deload') ? phase.duration : undefined
        })),
        autoAdjustments: optimizationSettings.autoAdjustments
      })

      setPlans(prev => [plan, ...prev])
      setIsCreating(false)
      setNewPlan({
        name: '',
        description: '',
        type: 'strength',
        duration: 12,
        templateId: '',
        customPhases: []
      })

      toast({
        title: "Plan Created",
        description: "New training plan has been created successfully",
      })
    } catch (error) {
      console.error('Error creating plan:', error)
      toast({
        title: "Error",
        description: "Failed to create training plan",
        variant: "destructive"
      })
    }
  }

  const getPlanProgress = (plan: TrainingPlan) => {
    return (plan.currentWeek / plan.duration) * 100
  }

  const getCurrentPhase = (plan: TrainingPlan) => {
    let weekCount = 0
    for (const phase of plan.phases) {
      weekCount += phase.duration
      if (plan.currentWeek <= weekCount) {
        return phase
      }
    }
    return plan.phases[plan.phases.length - 1]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Plan Optimization & Creation
              </CardTitle>
              <CardDescription>
                AI-powered training plan generation and optimization
              </CardDescription>
            </div>
            <SafeClientButton onClick={() => setIsCreating(true)}>
              <Target className="h-4 w-4 mr-1" />
              Create Plan
            </SafeClientButton>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {plans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Plans</h3>
                <p className="text-gray-600 mb-4">Create your first AI-optimized training plan</p>
                <SafeClientButton onClick={() => setIsCreating(true)}>
                  <Target className="h-4 w-4 mr-1" />
                  Create Plan
                </SafeClientButton>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plans.map(plan => {
                const progress = getPlanProgress(plan)
                const currentPhase = getCurrentPhase(plan)

                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-medium">{plan.name}</h3>
                            <Badge variant="outline" className="ml-2">
                              {plan.type}
                            </Badge>
                            {plan.autoAdjustments && (
                              <Badge variant="secondary" className="ml-2">
                                <Brain className="h-3 w-3 mr-1" />
                                AI-Optimized
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>Week {plan.currentWeek} of {plan.duration}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Current Phase: {currentPhase.name}</span>
                              <span>{progress.toFixed(1)}% complete</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <SafeClientButton
                            variant="outline"
                            size="sm"
                            onClick={() => optimizePlan(plan.id)}
                            disabled={isOptimizing}
                          >
                            {isOptimizing ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Settings className="h-3 w-3" />
                            )}
                          </SafeClientButton>
                          <SafeClientButton
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <Info className="h-3 w-3" />
                          </SafeClientButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLAN_TEMPLATES.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{template.type}</Badge>
                      <span className="text-sm text-gray-600">{template.duration} weeks</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Phases:</h4>
                      <div className="space-y-1">
                        {template.phases.map((phase, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            • {phase.name} ({phase.duration}w)
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Suitable for:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.suitableFor.map(level => (
                          <Badge key={level} variant="secondary" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <SafeClientButton
                      className="w-full"
                      size="sm"
                      onClick={() => createPlanFromTemplate(template)}
                    >
                      Use Template
                    </SafeClientButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>
                Configure how AI optimizes your training plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-adjustments */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-adjustments</h4>
                  <p className="text-sm text-gray-600">Allow AI to automatically adjust your plan</p>
                </div>
                <Switch
                  checked={optimizationSettings.autoAdjustments}
                  onCheckedChange={(checked) =>
                    setOptimizationSettings(prev => ({ ...prev, autoAdjustments: checked }))
                  }
                />
              </div>

              {/* Volume Progression */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Volume Progression</h4>
                  <span className="text-sm text-gray-600">{optimizationSettings.volumeProgression}%</span>
                </div>
                <Slider
                  value={[optimizationSettings.volumeProgression]}
                  onValueChange={([value]) =>
                    setOptimizationSettings(prev => ({ ...prev, volumeProgression: value }))
                  }
                  max={15}
                  min={2.5}
                  step={2.5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Weekly volume increase percentage</p>
              </div>

              {/* Intensity Progression */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Intensity Progression</h4>
                  <span className="text-sm text-gray-600">{optimizationSettings.intensityProgression}%</span>
                </div>
                <Slider
                  value={[optimizationSettings.intensityProgression]}
                  onValueChange={([value]) =>
                    setOptimizationSettings(prev => ({ ...prev, intensityProgression: value }))
                  }
                  max={5}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Weekly intensity increase percentage</p>
              </div>

              {/* Recovery Factor */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Recovery Factor</h4>
                  <span className="text-sm text-gray-600">{optimizationSettings.recoveryFactor}x</span>
                </div>
                <Slider
                  value={[optimizationSettings.recoveryFactor]}
                  onValueChange={([value]) =>
                    setOptimizationSettings(prev => ({ ...prev, recoveryFactor: value }))
                  }
                  max={1.5}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust based on recovery capacity</p>
              </div>

              {/* Time Constraints */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sessions per Week</label>
                  <Input
                    type="number"
                    value={optimizationSettings.timeConstraints.sessionsPerWeek}
                    onChange={(e) => setOptimizationSettings(prev => ({
                      ...prev,
                      timeConstraints: {
                        ...prev.timeConstraints,
                        sessionsPerWeek: parseInt(e.target.value) || 4
                      }
                    }))}
                    min={2}
                    max={7}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Session Duration (min)</label>
                  <Input
                    type="number"
                    value={optimizationSettings.timeConstraints.sessionDuration}
                    onChange={(e) => setOptimizationSettings(prev => ({
                      ...prev,
                      timeConstraints: {
                        ...prev.timeConstraints,
                        sessionDuration: parseInt(e.target.value) || 90
                      }
                    }))}
                    min={30}
                    max={180}
                  />
                </div>
              </div>

              {/* Equipment Available */}
              <div>
                <h4 className="font-medium mb-2">Available Equipment</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EQUIPMENT_OPTIONS.map(equipment => (
                    <label key={equipment} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={optimizationSettings.equipmentAvailable.includes(equipment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOptimizationSettings(prev => ({
                              ...prev,
                              equipmentAvailable: [...prev.equipmentAvailable, equipment]
                            }))
                          } else {
                            setOptimizationSettings(prev => ({
                              ...prev,
                              equipmentAvailable: prev.equipmentAvailable.filter(eq => eq !== equipment)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span>{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Goals */}
              <div>
                <h4 className="font-medium mb-2">Priority Goals</h4>
                <div className="space-y-2">
                  {goals.map(goal => (
                    <label key={goal.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={optimizationSettings.priorityGoals.includes(goal.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOptimizationSettings(prev => ({
                              ...prev,
                              priorityGoals: [...prev.priorityGoals, goal.id]
                            }))
                          } else {
                            setOptimizationSettings(prev => ({
                              ...prev,
                              priorityGoals: prev.priorityGoals.filter(id => id !== goal.id)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span>{goal.title}</span>
                      <Badge variant="outline" className="text-xs">{goal.category}</Badge>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Plan Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Plan Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <p className="text-sm text-gray-600">Average goal achievement rate</p>
              </CardContent>
            </Card>

            {/* Optimization Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Optimization Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">+23%</div>
                <p className="text-sm text-gray-600">Performance improvement with AI</p>
              </CardContent>
            </Card>

            {/* Adherence Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Adherence Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <p className="text-sm text-gray-600">Workout completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Plan Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.map(plan => {
                  const progress = getPlanProgress(plan)
                  const effectiveness = Math.random() * 30 + 70 // Mock effectiveness score

                  return (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium">{plan.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {plan.type}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{effectiveness.toFixed(1)}% effective</span>
                      </div>
                      <Progress value={effectiveness} className="h-2" />
                      <div className="text-xs text-gray-500">
                        Week {plan.currentWeek} of {plan.duration} • {progress.toFixed(1)}% complete
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
