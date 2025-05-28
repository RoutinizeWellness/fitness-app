"use client"

import React, { useState, useEffect } from "react"
import {
  Target, Plus, Edit, Trash2, Calendar, TrendingUp,
  CheckCircle, Clock, AlertCircle, Star, Brain,
  BarChart3, Trophy, Zap, Activity, Users, Award
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { eliteTrainingSystem, Goal, Milestone } from "@/lib/elite-training/core-system"
import { format, differenceInDays, isAfter, isBefore } from "date-fns"

interface GoalManagementProps {
  userId: string
}

interface GoalFormData {
  type: 'primary' | 'secondary' | 'micro'
  category: 'performance' | 'body_composition' | 'skill' | 'competitive'
  title: string
  description: string
  targetValue: number
  unit: string
  deadline: string
  priority: number
  parentGoalId?: string
}

const GOAL_CATEGORIES = [
  { value: 'performance', label: 'Performance', icon: Zap, color: 'text-blue-600' },
  { value: 'body_composition', label: 'Body Composition', icon: Activity, color: 'text-green-600' },
  { value: 'skill', label: 'Skill Development', icon: Brain, color: 'text-purple-600' },
  { value: 'competitive', label: 'Competitive', icon: Trophy, color: 'text-yellow-600' }
]

const GOAL_TYPES = [
  { value: 'primary', label: 'Primary Goal', description: 'Main long-term objective' },
  { value: 'secondary', label: 'Secondary Goal', description: 'Supporting objective' },
  { value: 'micro', label: 'Micro Goal', description: 'Short-term milestone' }
]

export function GoalManagement({ userId }: GoalManagementProps) {
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [goalForm, setGoalForm] = useState<GoalFormData>({
    type: 'primary',
    category: 'performance',
    title: '',
    description: '',
    targetValue: 0,
    unit: '',
    deadline: '',
    priority: 1,
    parentGoalId: undefined
  })

  useEffect(() => {
    loadGoals()
  }, [userId])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      const userGoals = await eliteTrainingSystem.getUserGoals(userId)
      setGoals(userGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createGoal = async () => {
    try {
      if (!goalForm.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a goal title",
          variant: "destructive"
        })
        return
      }

      const newGoal = await eliteTrainingSystem.createGoal({
        userId,
        type: goalForm.type,
        category: goalForm.category,
        title: goalForm.title,
        description: goalForm.description,
        targetValue: goalForm.targetValue,
        currentValue: 0,
        unit: goalForm.unit,
        deadline: new Date(goalForm.deadline),
        priority: goalForm.priority,
        parentGoalId: goalForm.parentGoalId,
        subGoals: [],
        milestones: [],
        status: 'active'
      })

      setGoals(prev => [newGoal, ...prev])
      setIsCreating(false)
      resetForm()

      toast({
        title: "Goal Created",
        description: "Your new goal has been added successfully",
      })
    } catch (error) {
      console.error('Error creating goal:', error)
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      })
    }
  }

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      await eliteTrainingSystem.updateGoalProgress(goalId, newValue)
      setGoals(prev => prev.map(goal =>
        goal.id === goalId
          ? { ...goal, currentValue: newValue }
          : goal
      ))

      toast({
        title: "Progress Updated",
        description: "Goal progress has been updated",
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setGoalForm({
      type: 'primary',
      category: 'performance',
      title: '',
      description: '',
      targetValue: 0,
      unit: '',
      deadline: '',
      priority: 1,
      parentGoalId: undefined
    })
  }

  const getGoalProgress = (goal: Goal) => {
    if (goal.targetValue === 0) return 0
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  const getGoalStatus = (goal: Goal) => {
    const progress = getGoalProgress(goal)
    const daysUntilDeadline = differenceInDays(goal.deadline, new Date())

    if (progress >= 100) return { status: 'completed', color: 'text-green-600', icon: CheckCircle }
    if (daysUntilDeadline < 0) return { status: 'overdue', color: 'text-red-600', icon: AlertCircle }
    if (daysUntilDeadline <= 7) return { status: 'urgent', color: 'text-orange-600', icon: Clock }
    return { status: 'active', color: 'text-blue-600', icon: Target }
  }

  const getPrimaryGoals = () => goals.filter(goal => goal.type === 'primary')
  const getSecondaryGoals = () => goals.filter(goal => goal.type === 'secondary')
  const getMicroGoals = () => goals.filter(goal => goal.type === 'micro')

  const getGoalsByCategory = (category: string) =>
    goals.filter(goal => goal.category === category)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Goal Management System
              </CardTitle>
              <CardDescription>
                Multi-objective goal tracking with AI-powered insights
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <SafeClientButton>
                  <Plus className="h-4 w-4 mr-1" />
                  New Goal
                </SafeClientButton>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set up a new training objective with specific targets
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Goal Type</label>
                    <Select value={goalForm.type} onValueChange={(value: any) => setGoalForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={goalForm.category} onValueChange={(value: any) => setGoalForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center">
                              <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={goalForm.title}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Bench Press 100kg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the goal..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Target Value</label>
                      <Input
                        type="number"
                        value={goalForm.targetValue}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Unit</label>
                      <Input
                        value={goalForm.unit}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="kg, reps, cm..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Deadline</label>
                    <Input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <SafeClientButton variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </SafeClientButton>
                    <SafeClientButton onClick={createGoal}>
                      Create Goal
                    </SafeClientButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Goal Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {GOAL_CATEGORIES.map(category => {
              const categoryGoals = getGoalsByCategory(category.value)
              const completedGoals = categoryGoals.filter(goal => getGoalProgress(goal) >= 100).length

              return (
                <Card key={category.value}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <category.icon className={`h-5 w-5 mr-2 ${category.color}`} />
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-gray-500">
                            {completedGoals}/{categoryGoals.length} completed
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {categoryGoals.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Active Goals List */}
          <div className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Set</h3>
                  <p className="text-gray-600 mb-4">Create your first training goal to get started</p>
                  <SafeClientButton onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Goal
                  </SafeClientButton>
                </CardContent>
              </Card>
            ) : (
              goals.map(goal => {
                const progress = getGoalProgress(goal)
                const status = getGoalStatus(goal)
                const category = GOAL_CATEGORIES.find(c => c.value === goal.category)

                return (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {category && <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />}
                            <h3 className="font-medium">{goal.title}</h3>
                            <Badge variant="outline" className="ml-2">
                              {goal.type}
                            </Badge>
                            <status.icon className={`h-4 w-4 ml-2 ${status.color}`} />
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{progress.toFixed(1)}% complete</span>
                              <span>Due: {format(goal.deadline, 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <SafeClientButton
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGoal(goal)}
                          >
                            <Edit className="h-3 w-3" />
                          </SafeClientButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          {/* Primary Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Primary Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getPrimaryGoals().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No primary goals set</p>
              ) : (
                <div className="space-y-3">
                  {getPrimaryGoals().map(goal => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{getGoalProgress(goal).toFixed(1)}%</div>
                          <Progress value={getGoalProgress(goal)} className="w-20 h-2" />
                        </div>
                      </div>

                      {/* Sub-goals */}
                      {goal.subGoals.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Sub-goals:</h5>
                          {goal.subGoals.map(subGoalId => {
                            const subGoal = goals.find(g => g.id === subGoalId)
                            return subGoal ? (
                              <div key={subGoalId} className="text-sm text-gray-600 mb-1">
                                • {subGoal.title} ({getGoalProgress(subGoal).toFixed(1)}%)
                              </div>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secondary Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Secondary Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getSecondaryGoals().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No secondary goals set</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getSecondaryGoals().map(goal => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                        <Progress value={getGoalProgress(goal)} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Micro Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-600" />
                Micro Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getMicroGoals().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No micro goals set</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getMicroGoals().map(goal => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <div className="mt-2">
                        <Progress value={getGoalProgress(goal)} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Goal Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {goals.length > 0 ?
                    ((goals.filter(g => getGoalProgress(g) >= 100).length / goals.length) * 100).toFixed(1)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-600">
                  {goals.filter(g => getGoalProgress(g) >= 100).length} of {goals.length} goals completed
                </p>
              </CardContent>
            </Card>

            {/* Average Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Average Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {goals.length > 0 ?
                    (goals.reduce((sum, goal) => sum + getGoalProgress(goal), 0) / goals.length).toFixed(1)
                    : 0
                  }%
                </div>
                <p className="text-sm text-gray-600">Across all active goals</p>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Urgent Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {goals.filter(goal => {
                    const daysUntilDeadline = differenceInDays(goal.deadline, new Date())
                    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0
                  }).length}
                </div>
                <p className="text-sm text-gray-600">Due within 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Goal Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map(goal => {
                  const progress = getGoalProgress(goal)
                  const category = GOAL_CATEGORIES.find(c => c.value === goal.category)

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {category && <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />}
                          <span className="font-medium">{goal.title}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {goal.type}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Goal Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations for your goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Success Probability Analysis */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Success Probability Analysis</h4>
                  <div className="space-y-2">
                    {goals.filter(goal => goal.successProbability).map(goal => (
                      <div key={goal.id} className="flex justify-between items-center">
                        <span className="text-sm">{goal.title}</span>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            (goal.successProbability || 0) >= 80 ? 'bg-green-500' :
                            (goal.successProbability || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium">{goal.successProbability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Smart Recommendations</h4>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Consider breaking down large goals into smaller milestones</li>
                    <li>• Focus on goals with approaching deadlines</li>
                    <li>• Review and adjust unrealistic targets</li>
                    <li>• Celebrate completed micro-goals to maintain motivation</li>
                  </ul>
                </div>

                {/* Pattern Recognition */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Pattern Recognition</h4>
                  <p className="text-sm text-purple-800">
                    Based on your goal completion patterns, you tend to perform better with
                    shorter-term objectives. Consider setting more micro-goals to maintain momentum.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
