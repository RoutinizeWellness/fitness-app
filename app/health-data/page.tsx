"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Heart,
  LineChart,
  Moon,
  RefreshCw,
  Watch,
  Dumbbell,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function HealthDataPage() {
  const router = useRouter()

  // Redirigir a la nueva implementación
  useEffect(() => {
    router.replace('/health-data/new')
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-md mx-auto p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-4">
            <h1 className="font-bold">Health Data</h1>
            <p className="text-sm text-gray-500">Synced from your connected devices</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Connected Devices</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/connect-device")}>
              Manage
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Card className="border-none shadow-sm min-w-[140px]">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-green-100 text-green-600 rounded-full p-2 mb-2">
                  <AppleIcon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Apple Watch</div>
                <div className="text-xs text-gray-500">Last sync: 5m ago</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm min-w-[140px]">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-2 mb-2">
                  <Watch className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Add Device</div>
                <div className="text-xs text-primary">Connect now</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="heart">Heart</TabsTrigger>
              <TabsTrigger value="sleep">Sleep</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Today's Activity</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium">Steps</div>
                        </div>
                        <div className="text-sm font-medium">8,432 / 10,000</div>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                            <Flame className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium">Calories</div>
                        </div>
                        <div className="text-sm font-medium">1,845 / 2,500</div>
                      </div>
                      <Progress value={74} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                            <Timer className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium">Active Minutes</div>
                        </div>
                        <div className="text-sm font-medium">42 / 60</div>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium">Distance</div>
                        </div>
                        <div className="text-sm font-medium">5.2 km</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                    <LineChart className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Weekly activity chart</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Avg. Steps</div>
                      <div className="text-lg font-bold">9,245</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        12% from last week
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Avg. Calories</div>
                      <div className="text-lg font-bold">2,145</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        8% from last week
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heart" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Heart Rate</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative">
                      <div className="text-5xl font-bold text-center">72</div>
                      <div className="text-sm text-gray-500 text-center">BPM</div>
                      <Heart className="absolute -top-2 -right-6 h-6 w-6 text-red-500 animate-pulse" />
                    </div>
                  </div>

                  <div className="h-[150px] flex items-center justify-center bg-gray-100 rounded-md">
                    <LineChart className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Heart rate chart</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-gray-100 rounded-md p-3 text-center">
                      <div className="text-sm text-gray-500">Resting</div>
                      <div className="text-lg font-bold">62</div>
                      <div className="text-xs">BPM</div>
                    </div>

                    <div className="bg-gray-100 rounded-md p-3 text-center">
                      <div className="text-sm text-gray-500">Average</div>
                      <div className="text-lg font-bold">72</div>
                      <div className="text-xs">BPM</div>
                    </div>

                    <div className="bg-gray-100 rounded-md p-3 text-center">
                      <div className="text-sm text-gray-500">Max</div>
                      <div className="text-lg font-bold">142</div>
                      <div className="text-xs">BPM</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Workout Heart Rate Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Peak (90-100%)</div>
                        <div className="text-sm">15 min</div>
                      </div>
                      <Progress value={15} className="h-2 bg-red-100">
                        <div className="h-full bg-red-500 rounded-full" />
                      </Progress>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Cardio (70-90%)</div>
                        <div className="text-sm">28 min</div>
                      </div>
                      <Progress value={28} className="h-2 bg-orange-100">
                        <div className="h-full bg-orange-500 rounded-full" />
                      </Progress>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Fat Burn (50-70%)</div>
                        <div className="text-sm">42 min</div>
                      </div>
                      <Progress value={42} className="h-2 bg-yellow-100">
                        <div className="h-full bg-yellow-500 rounded-full" />
                      </Progress>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Last Night's Sleep</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold">7h 12m</div>
                      <div className="text-sm text-gray-500">Total sleep time</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">11:38 PM - 6:50 AM</div>
                      <div className="text-sm text-gray-500">Sleep schedule</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-8 bg-gray-100 rounded-md flex overflow-hidden">
                      <div className="bg-indigo-900 h-full" style={{ width: "15%" }} title="Deep sleep: 1h 5m" />
                      <div className="bg-indigo-600 h-full" style={{ width: "55%" }} title="Core sleep: 4h 0m" />
                      <div className="bg-indigo-400 h-full" style={{ width: "20%" }} title="REM sleep: 1h 27m" />
                      <div className="bg-gray-300 h-full" style={{ width: "10%" }} title="Awake: 40m" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-900 mr-1" />
                        Deep: 1h 5m
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1" />
                        Core: 4h 0m
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1" />
                        REM: 1h 27m
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mr-1" />
                        Awake: 40m
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-primary/10 text-primary rounded-md p-1.5 mr-3">
                          <Moon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium">Sleep Score</div>
                      </div>
                      <div className="text-sm font-medium">82/100</div>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Weekly Sleep</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                    <LineChart className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Weekly sleep chart</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Avg. Sleep Time</div>
                      <div className="text-lg font-bold">7h 24m</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        5% from last week
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Avg. Sleep Score</div>
                      <div className="text-lg font-bold">78/100</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        3% from last week
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fitness Insights</CardTitle>
                  <CardDescription>AI-powered analysis of your health data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Your resting heart rate has decreased by 4 BPM over the last month, indicating improved
                          cardiovascular fitness.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Your sleep quality improves on days when you complete a workout before 7 PM.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Your recovery is optimal when you get at least 7 hours of sleep with 20% or more in deep sleep
                          phases.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Workout Recommendations</CardTitle>
                  <CardDescription>Based on your health data and recovery status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center border rounded-lg p-3">
                      <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Ready for High Intensity</h3>
                        <p className="text-sm text-gray-500">Your recovery status is optimal</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary/10 text-primary rounded-full p-1.5 mt-0.5">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Based on your heart rate variability and sleep quality, today is ideal for a challenging
                          strength training session.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.91-3.83.91s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z" />
    </svg>
  )
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Flame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function Lightbulb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function Timer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
