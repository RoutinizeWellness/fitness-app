"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  FileText, 
  Download, 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Eye,
  Share,
  Settings,
  Brain,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'user_analytics' | 'engagement' | 'ai_performance' | 'business_intelligence'
  lastGenerated?: Date
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  isAutomated: boolean
  recipients: string[]
}

interface KPIMetric {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  category: string
  target?: number
}

interface CustomReport {
  id: string
  name: string
  description: string
  metrics: string[]
  filters: any
  visualization: 'table' | 'chart' | 'dashboard'
  createdAt: Date
  lastRun?: Date
}

export default function ReportsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [reportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'User Engagement Report',
      description: 'Comprehensive analysis of user engagement metrics',
      category: 'engagement',
      lastGenerated: new Date('2024-01-18'),
      frequency: 'weekly',
      isAutomated: true,
      recipients: ['admin@routinize.com', 'analytics@routinize.com']
    },
    {
      id: '2',
      name: 'AI Performance Dashboard',
      description: 'AI model accuracy, predictions, and optimization metrics',
      category: 'ai_performance',
      lastGenerated: new Date('2024-01-17'),
      frequency: 'daily',
      isAutomated: true,
      recipients: ['admin@routinize.com']
    },
    {
      id: '3',
      name: 'Business Intelligence Summary',
      description: 'Executive summary with key business metrics and trends',
      category: 'business_intelligence',
      lastGenerated: new Date('2024-01-15'),
      frequency: 'monthly',
      isAutomated: true,
      recipients: ['admin@routinize.com', 'ceo@routinize.com']
    },
    {
      id: '4',
      name: 'User Analytics Deep Dive',
      description: 'Detailed user behavior analysis and segmentation insights',
      category: 'user_analytics',
      frequency: 'weekly',
      isAutomated: false,
      recipients: ['admin@routinize.com']
    }
  ])
  
  const [kpiMetrics] = useState<KPIMetric[]>([
    {
      id: '1',
      name: 'Monthly Active Users',
      value: 12450,
      previousValue: 11230,
      unit: 'users',
      trend: 'up',
      category: 'User Growth',
      target: 15000
    },
    {
      id: '2',
      name: 'Average Session Duration',
      value: 24.5,
      previousValue: 22.1,
      unit: 'minutes',
      trend: 'up',
      category: 'Engagement'
    },
    {
      id: '3',
      name: 'Workout Completion Rate',
      value: 78.3,
      previousValue: 75.8,
      unit: '%',
      trend: 'up',
      category: 'Performance',
      target: 85
    },
    {
      id: '4',
      name: 'Churn Rate',
      value: 5.2,
      previousValue: 6.8,
      unit: '%',
      trend: 'down',
      category: 'Retention'
    },
    {
      id: '5',
      name: 'AI Recommendation Accuracy',
      value: 94.2,
      previousValue: 92.1,
      unit: '%',
      trend: 'up',
      category: 'AI Performance',
      target: 95
    },
    {
      id: '6',
      name: 'Revenue per User',
      value: 28.50,
      previousValue: 26.80,
      unit: '$',
      trend: 'up',
      category: 'Business'
    }
  ])
  
  const [customReports, setCustomReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'High-Risk User Analysis',
      description: 'Users with high churn probability and intervention strategies',
      metrics: ['churn_risk', 'engagement_score', 'last_activity'],
      filters: { churn_risk: '>60%' },
      visualization: 'table',
      createdAt: new Date('2024-01-10'),
      lastRun: new Date('2024-01-18')
    }
  ])
  
  const [selectedDateRange, setSelectedDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user || profile?.email !== 'admin@routinize.com') {
      router.push('/dashboard')
      return
    }
  }, [user, profile, router])

  const generateReport = async (templateId: string) => {
    try {
      setIsLoading(true)
      const template = reportTemplates.find(t => t.id === templateId)
      if (!template) return

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create mock report data
      const reportData = {
        template: template.name,
        generatedAt: new Date().toISOString(),
        dateRange: selectedDateRange,
        data: {
          summary: {
            totalUsers: 12450,
            activeUsers: 8920,
            engagementRate: 78.3,
            aiAccuracy: 94.2
          },
          metrics: kpiMetrics,
          insights: [
            'User engagement increased by 12% this month',
            'AI recommendation accuracy improved by 2.1%',
            'Churn rate decreased significantly in the at-risk segment'
          ]
        }
      }

      // Download report as JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report Generated",
        description: `${template.name} has been generated and downloaded`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportKPIDashboard = async () => {
    try {
      const dashboardData = {
        exportedAt: new Date().toISOString(),
        dateRange: selectedDateRange,
        kpis: kpiMetrics,
        summary: {
          totalMetrics: kpiMetrics.length,
          metricsOnTarget: kpiMetrics.filter(m => m.target && m.value >= m.target).length,
          improvingMetrics: kpiMetrics.filter(m => m.trend === 'up').length
        }
      }

      const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `KPI_Dashboard_${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Dashboard Exported",
        description: "KPI dashboard has been exported successfully",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export KPI dashboard",
        variant: "destructive"
      })
    }
  }

  if (!user || profile?.email !== 'admin@routinize.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence & Reports</h1>
            <p className="text-gray-600">Advanced analytics, KPI tracking, and automated reporting</p>
          </div>
          <div className="flex space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDateRange.from, "MMM dd")} - {format(selectedDateRange.to, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={selectedDateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setSelectedDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={exportKPIDashboard}>
              <Download className="h-4 w-4 mr-2" />
              Export Dashboard
            </Button>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiMetrics.map((metric) => (
            <Card key={metric.id} className={`border-l-4 ${
              metric.trend === 'up' ? 'border-l-green-500' :
              metric.trend === 'down' ? 'border-l-red-500' : 'border-l-gray-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">{metric.name}</div>
                  <div className="flex items-center">
                    {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {metric.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metric.value.toLocaleString()}{metric.unit}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    vs {metric.previousValue.toLocaleString()}{metric.unit}
                  </span>
                  {metric.target && (
                    <span className="text-gray-500">
                      Target: {metric.target.toLocaleString()}{metric.unit}
                    </span>
                  )}
                </div>
                {metric.target && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.value >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {template.name}
                        {template.isAutomated && (
                          <Badge variant="secondary" className="ml-2">
                            <Zap className="h-3 w-3 mr-1" />
                            Automated
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 font-medium">{template.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recipients:</span>
                        <span className="ml-2 font-medium">{template.recipients.length}</span>
                      </div>
                    </div>
                    
                    {template.lastGenerated && (
                      <div className="text-sm">
                        <span className="text-gray-600">Last generated:</span>
                        <span className="ml-2">{template.lastGenerated.toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => generateReport(template.id)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Generate Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Custom Reports</CardTitle>
                  <CardDescription>Create and manage custom analytical reports</CardDescription>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Custom Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      <Badge variant="outline">{report.visualization}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Metrics:</span>
                        <span className="ml-2">{report.metrics.length} selected</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last run:</span>
                        <span className="ml-2">{report.lastRun?.toLocaleDateString() || 'Never'}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Run Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Report Automation
              </CardTitle>
              <CardDescription>
                Automated report generation and distribution settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Automations</p>
                          <p className="text-2xl font-bold">
                            {reportTemplates.filter(t => t.isAutomated).length}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Reports This Month</p>
                          <p className="text-2xl font-bold">47</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Next Scheduled</p>
                          <p className="text-2xl font-bold">2h</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Automation Schedule</h3>
                  {reportTemplates.filter(t => t.isAutomated).map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">
                            Runs {template.frequency} • {template.recipients.length} recipients
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">Active</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
