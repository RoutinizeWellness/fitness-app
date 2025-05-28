"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  TrendingUp,
  Calendar,
  Timer,
  Zap,
  Activity,
  Heart,
  Scale,
  Ruler,
  BarChart3,
  Trophy,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Calculator
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { eliteTrainingSystem, FitnessTest, TestType, TestResults, TestConditions } from "@/lib/elite-training/core-system"
import { format, differenceInDays } from "date-fns"

interface FitnessTestingProps {
  userId: string
}

interface TestProtocol {
  id: string
  name: string
  category: 'strength' | 'power' | 'endurance' | 'body_composition' | 'flexibility' | 'balance'
  description: string
  equipment: string[]
  duration: number
  instructions: string[]
  calculations: TestCalculation[]
  norms?: PerformanceNorm[]
}

interface TestCalculation {
  formula: string
  description: string
  variables: string[]
}

interface PerformanceNorm {
  ageRange: string
  gender: 'male' | 'female' | 'all'
  percentiles: { [key: number]: number }
}

const TEST_PROTOCOLS: TestProtocol[] = [
  {
    id: 'bench_press_1rm',
    name: 'Bench Press 1RM',
    category: 'strength',
    description: 'Direct or estimated 1-repetition maximum for bench press',
    equipment: ['Barbell', 'Bench', 'Plates', 'Safety bars'],
    duration: 30,
    instructions: [
      'Warm up thoroughly with light weights',
      'Perform 3-5 reps at 50% estimated 1RM',
      'Perform 2-3 reps at 70% estimated 1RM',
      'Perform 1 rep at 85% estimated 1RM',
      'Attempt 1RM with 3-5 minute rest between attempts',
      'Record successful lift or use submaximal formula'
    ],
    calculations: [
      {
        formula: '1RM = Weight × (1 + Reps/30)',
        description: 'Epley Formula for 1RM estimation',
        variables: ['Weight (kg)', 'Reps completed']
      },
      {
        formula: '1RM = Weight × (36/(37-Reps))',
        description: 'Brzycki Formula for 1RM estimation',
        variables: ['Weight (kg)', 'Reps completed']
      }
    ],
    norms: [
      {
        ageRange: '20-29',
        gender: 'male',
        percentiles: { 10: 0.8, 25: 1.0, 50: 1.2, 75: 1.5, 90: 1.8 }
      }
    ]
  },
  {
    id: 'vertical_jump',
    name: 'Vertical Jump Test',
    category: 'power',
    description: 'Measures explosive leg power and jumping ability',
    equipment: ['Jump mat or measuring tape', 'Wall or jump device'],
    duration: 15,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Reach up with dominant hand to mark standing reach',
      'Jump as high as possible using arm swing',
      'Mark highest point reached',
      'Perform 3 attempts with 1-minute rest',
      'Record best attempt'
    ],
    calculations: [
      {
        formula: 'Jump Height = Peak Height - Standing Reach',
        description: 'Vertical jump height calculation',
        variables: ['Peak Height (cm)', 'Standing Reach (cm)']
      },
      {
        formula: 'Power = 60.7 × Jump Height + 45.3 × Body Mass - 2055',
        description: 'Lewis Formula for power estimation',
        variables: ['Jump Height (cm)', 'Body Mass (kg)']
      }
    ]
  },
  {
    id: 'cooper_12min',
    name: 'Cooper 12-Minute Run',
    category: 'endurance',
    description: 'Estimates VO2max through distance covered in 12 minutes',
    equipment: ['Track or measured course', 'Stopwatch'],
    duration: 12,
    instructions: [
      'Warm up with light jogging for 5-10 minutes',
      'Run/walk as far as possible in exactly 12 minutes',
      'Maintain steady pace throughout',
      'Record total distance covered',
      'Cool down with walking'
    ],
    calculations: [
      {
        formula: 'VO2max = (Distance - 504.9) / 44.73',
        description: 'Cooper Formula for VO2max estimation',
        variables: ['Distance (meters)']
      }
    ]
  },
  {
    id: 'body_composition',
    name: 'Body Composition Assessment',
    category: 'body_composition',
    description: 'Comprehensive body composition analysis',
    equipment: ['Scale', 'Measuring tape', 'Calipers (optional)'],
    duration: 20,
    instructions: [
      'Measure in morning, fasted state',
      'Record body weight',
      'Measure waist circumference at narrowest point',
      'Measure hip circumference at widest point',
      'Take progress photos (front, side, back)',
      'Record additional measurements if available'
    ],
    calculations: [
      {
        formula: 'BMI = Weight / (Height²)',
        description: 'Body Mass Index calculation',
        variables: ['Weight (kg)', 'Height (m)']
      },
      {
        formula: 'WHR = Waist / Hip',
        description: 'Waist-to-Hip Ratio',
        variables: ['Waist (cm)', 'Hip (cm)']
      }
    ]
  },
  {
    id: 'plank_hold',
    name: 'Plank Hold Test',
    category: 'strength',
    description: 'Measures core strength and muscular endurance',
    equipment: ['Exercise mat', 'Stopwatch'],
    duration: 10,
    instructions: [
      'Start in forearm plank position',
      'Maintain straight line from head to heels',
      'Keep core engaged throughout',
      'Hold position as long as possible',
      'Stop when form breaks down',
      'Record total time held'
    ],
    calculations: [
      {
        formula: 'Core Endurance Score = Hold Time (seconds)',
        description: 'Direct measurement of core endurance',
        variables: ['Hold Time (seconds)']
      }
    ]
  }
]

export function FitnessTesting({ userId }: FitnessTestingProps) {
  const { toast } = useToast()
  
  const [testHistory, setTestHistory] = useState<FitnessTest[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<TestProtocol | null>(null)
  const [isTestingActive, setIsTestingActive] = useState(false)
  const [testTimer, setTestTimer] = useState(0)
  const [testResults, setTestResults] = useState<any>({})
  const [testConditions, setTestConditions] = useState<TestConditions>({
    temperature: 22,
    timeOfDay: format(new Date(), 'HH:mm'),
    lastMeal: 2,
    sleepQuality: 7,
    stressLevel: 5,
    priorActivity: 'none'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTestHistory()
  }, [userId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTestingActive && selectedProtocol) {
      interval = setInterval(() => {
        setTestTimer(prev => {
          const newTime = prev + 1
          if (newTime >= selectedProtocol.duration * 60) {
            setIsTestingActive(false)
            toast({
              title: "Test Complete",
              description: `${selectedProtocol.name} time limit reached`,
            })
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTestingActive, selectedProtocol, toast])

  const loadTestHistory = async () => {
    try {
      setIsLoading(true)
      const history = await eliteTrainingSystem.getTestHistory(userId)
      setTestHistory(history)
    } catch (error) {
      console.error('Error loading test history:', error)
      toast({
        title: "Error",
        description: "Failed to load test history",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startTest = (protocol: TestProtocol) => {
    setSelectedProtocol(protocol)
    setTestTimer(0)
    setTestResults({})
    setIsTestingActive(true)
    
    toast({
      title: "Test Started",
      description: `${protocol.name} is now active`,
    })
  }

  const pauseTest = () => {
    setIsTestingActive(false)
    toast({
      title: "Test Paused",
      description: "Timer has been paused",
    })
  }

  const resumeTest = () => {
    setIsTestingActive(true)
    toast({
      title: "Test Resumed",
      description: "Timer has been resumed",
    })
  }

  const completeTest = async () => {
    if (!selectedProtocol) return

    try {
      // Validate required results
      const requiredFields = selectedProtocol.calculations[0]?.variables || []
      const missingFields = requiredFields.filter(field => !testResults[field])
      
      if (missingFields.length > 0) {
        toast({
          title: "Incomplete Results",
          description: `Please enter: ${missingFields.join(', ')}`,
          variant: "destructive"
        })
        return
      }

      // Calculate primary metric based on protocol
      const primaryMetric = calculatePrimaryMetric(selectedProtocol, testResults)
      
      const testData: Omit<FitnessTest, 'id'> = {
        userId,
        testType: {
          category: selectedProtocol.category,
          name: selectedProtocol.name,
          protocol: selectedProtocol.id,
          equipment: selectedProtocol.equipment,
          duration: selectedProtocol.duration,
          instructions: selectedProtocol.instructions
        },
        date: new Date(),
        results: {
          primaryMetric,
          secondaryMetrics: calculateSecondaryMetrics(selectedProtocol, testResults),
          rawData: testResults
        },
        conditions: testConditions,
        notes: testResults.notes || ''
      }

      const savedTest = await eliteTrainingSystem.createFitnessTest(testData)
      setTestHistory(prev => [savedTest, ...prev])
      
      setIsTestingActive(false)
      setSelectedProtocol(null)
      setTestResults({})
      
      toast({
        title: "Test Completed",
        description: "Results have been saved successfully",
      })
    } catch (error) {
      console.error('Error completing test:', error)
      toast({
        title: "Error",
        description: "Failed to save test results",
        variant: "destructive"
      })
    }
  }

  const calculatePrimaryMetric = (protocol: TestProtocol, results: any) => {
    switch (protocol.id) {
      case 'bench_press_1rm':
        if (results.actualWeight) {
          return { value: results.actualWeight, unit: 'kg' }
        } else if (results.weight && results.reps) {
          // Use Epley formula
          const estimated1RM = results.weight * (1 + results.reps / 30)
          return { value: Math.round(estimated1RM * 10) / 10, unit: 'kg' }
        }
        break
      
      case 'vertical_jump':
        if (results.peakHeight && results.standingReach) {
          const jumpHeight = results.peakHeight - results.standingReach
          return { value: jumpHeight, unit: 'cm' }
        }
        break
      
      case 'cooper_12min':
        if (results.distance) {
          const vo2max = (results.distance - 504.9) / 44.73
          return { value: Math.round(vo2max * 10) / 10, unit: 'ml/kg/min' }
        }
        break
      
      case 'body_composition':
        if (results.weight && results.height) {
          const bmi = results.weight / (results.height * results.height)
          return { value: Math.round(bmi * 10) / 10, unit: 'kg/m²' }
        }
        break
      
      case 'plank_hold':
        if (results.holdTime) {
          return { value: results.holdTime, unit: 'seconds' }
        }
        break
    }
    
    return { value: 0, unit: '' }
  }

  const calculateSecondaryMetrics = (protocol: TestProtocol, results: any) => {
    const secondary: { [key: string]: { value: number; unit: string } } = {}
    
    switch (protocol.id) {
      case 'vertical_jump':
        if (results.peakHeight && results.standingReach && results.bodyMass) {
          const jumpHeight = results.peakHeight - results.standingReach
          const power = 60.7 * jumpHeight + 45.3 * results.bodyMass - 2055
          secondary.power = { value: Math.round(power), unit: 'watts' }
        }
        break
      
      case 'body_composition':
        if (results.waist && results.hip) {
          const whr = results.waist / results.hip
          secondary.whr = { value: Math.round(whr * 100) / 100, unit: 'ratio' }
        }
        break
    }
    
    return secondary
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTestCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Zap className="h-4 w-4" />
      case 'power': return <Target className="h-4 w-4" />
      case 'endurance': return <Heart className="h-4 w-4" />
      case 'body_composition': return <Scale className="h-4 w-4" />
      case 'flexibility': return <Activity className="h-4 w-4" />
      case 'balance': return <Timer className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getPerformanceLevel = (value: number, norms?: PerformanceNorm[]) => {
    if (!norms || norms.length === 0) return null
    
    const norm = norms[0] // Simplified - would normally match age/gender
    const percentiles = norm.percentiles
    
    if (value >= percentiles[90]) return { level: 'Elite', color: 'text-purple-600' }
    if (value >= percentiles[75]) return { level: 'Excellent', color: 'text-green-600' }
    if (value >= percentiles[50]) return { level: 'Good', color: 'text-blue-600' }
    if (value >= percentiles[25]) return { level: 'Fair', color: 'text-yellow-600' }
    return { level: 'Needs Improvement', color: 'text-red-600' }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Fitness Testing & Evaluation
          </CardTitle>
          <CardDescription>
            Comprehensive testing protocols for performance assessment
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protocols">Test Protocols</TabsTrigger>
          <TabsTrigger value="active">Active Test</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        {/* Test Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEST_PROTOCOLS.map(protocol => (
              <Card key={protocol.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-lg">
                        {getTestCategoryIcon(protocol.category)}
                        <span className="ml-2">{protocol.name}</span>
                      </CardTitle>
                      <CardDescription>{protocol.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {protocol.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm">Equipment Needed:</h5>
                      <p className="text-sm text-gray-600">{protocol.equipment.join(', ')}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm">Duration:</h5>
                      <p className="text-sm text-gray-600">{protocol.duration} minutes</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm">Instructions:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {protocol.instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                        {protocol.instructions.length > 3 && (
                          <li className="text-blue-600">+ {protocol.instructions.length - 3} more steps</li>
                        )}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => startTest(protocol)}
                      className="w-full"
                      disabled={isTestingActive}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Test Tab */}
        <TabsContent value="active" className="space-y-4">
          {!selectedProtocol ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Test</h3>
                <p className="text-gray-600">Select a test protocol to begin</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Test Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedProtocol.name}</CardTitle>
                      <CardDescription>
                        Duration: {selectedProtocol.duration} minutes
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatTime(testTimer)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((testTimer / (selectedProtocol.duration * 60)) * 100)}% Complete
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(testTimer / (selectedProtocol.duration * 60)) * 100} 
                    className="mt-2"
                  />
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    {isTestingActive ? (
                      <Button onClick={pauseTest} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={resumeTest} variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button onClick={() => setTestTimer(0)} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button onClick={completeTest} className="ml-auto">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Test
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Test Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedProtocol.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">{instruction}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Results Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProtocol.calculations[0]?.variables.map(variable => (
                    <div key={variable}>
                      <Label htmlFor={variable}>{variable}</Label>
                      <Input
                        id={variable}
                        type="number"
                        value={testResults[variable] || ''}
                        onChange={(e) => setTestResults(prev => ({
                          ...prev,
                          [variable]: parseFloat(e.target.value) || 0
                        }))}
                        placeholder={`Enter ${variable.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={testResults.notes || ''}
                      onChange={(e) => setTestResults(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      placeholder="Additional observations..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Test Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Conditions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperature (°C)</Label>
                    <Input
                      type="number"
                      value={testConditions.temperature}
                      onChange={(e) => setTestConditions(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value) || 22
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Time of Day</Label>
                    <Input
                      type="time"
                      value={testConditions.timeOfDay}
                      onChange={(e) => setTestConditions(prev => ({
                        ...prev,
                        timeOfDay: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Hours Since Last Meal</Label>
                    <Input
                      type="number"
                      value={testConditions.lastMeal}
                      onChange={(e) => setTestConditions(prev => ({
                        ...prev,
                        lastMeal: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Sleep Quality (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={testConditions.sleepQuality}
                      onChange={(e) => setTestConditions(prev => ({
                        ...prev,
                        sleepQuality: parseInt(e.target.value) || 7
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Test History Tab */}
        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading test history...</p>
            </div>
          ) : testHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Test History</h3>
                <p className="text-gray-600">Complete your first fitness test to see results here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testHistory.map(test => {
                const performanceLevel = getPerformanceLevel(
                  test.results.primaryMetric.value,
                  TEST_PROTOCOLS.find(p => p.id === test.testType.protocol)?.norms
                )
                
                return (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {getTestCategoryIcon(test.testType.category)}
                            <span className="ml-2">{test.testType.name}</span>
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(test.date), 'EEEE, MMMM dd, yyyy')}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {test.results.primaryMetric.value} {test.results.primaryMetric.unit}
                          </div>
                          {performanceLevel && (
                            <Badge variant="outline" className={performanceLevel.color}>
                              {performanceLevel.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {test.results.secondaryMetrics && Object.keys(test.results.secondaryMetrics).length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {Object.entries(test.results.secondaryMetrics).map(([key, metric]) => (
                            <div key={key} className="text-center">
                              <div className="font-medium">{metric.value} {metric.unit}</div>
                              <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {test.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Notes:</h5>
                          <p className="text-sm text-gray-700">{test.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
