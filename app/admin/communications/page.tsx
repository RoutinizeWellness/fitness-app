"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton as Button } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Bell, 
  Send, 
  MessageSquare,
  Mail,
  Smartphone,
  Users,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  Brain
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

interface NotificationCampaign {
  id: string
  name: string
  type: 'push' | 'email' | 'sms' | 'in_app'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
  targetSegment: string
  title: string
  message: string
  scheduledAt?: Date
  sentCount: number
  openRate: number
  clickRate: number
  createdAt: Date
  aiOptimized: boolean
}

interface CommunicationStats {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  averageOpenRate: number
  averageClickRate: number
  engagementScore: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  condition: string
  action: string
  isActive: boolean
  executionCount: number
  successRate: number
}

export default function CommunicationsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([
    {
      id: '1',
      name: 'Welcome Series - Day 1',
      type: 'email',
      status: 'active',
      targetSegment: 'new_users',
      title: 'Welcome to Your Fitness Journey!',
      message: 'Get started with your personalized workout plan...',
      sentCount: 1250,
      openRate: 78.5,
      clickRate: 23.4,
      createdAt: new Date('2024-01-15'),
      aiOptimized: true
    },
    {
      id: '2',
      name: 'Workout Reminder - Evening',
      type: 'push',
      status: 'active',
      targetSegment: 'evening_users',
      title: 'Time for your evening workout!',
      message: 'Your personalized routine is ready. Let\'s get moving!',
      sentCount: 890,
      openRate: 65.2,
      clickRate: 18.7,
      createdAt: new Date('2024-01-12'),
      aiOptimized: true
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      type: 'email',
      status: 'scheduled',
      targetSegment: 'at_risk',
      title: 'We miss you! Come back stronger',
      message: 'Your fitness goals are waiting. Let\'s get back on track...',
      scheduledAt: new Date('2024-01-20'),
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date('2024-01-18'),
      aiOptimized: true
    }
  ])
  
  const [stats, setStats] = useState<CommunicationStats>({
    totalCampaigns: 15,
    activeCampaigns: 8,
    totalSent: 45230,
    averageOpenRate: 72.3,
    averageClickRate: 21.8,
    engagementScore: 87.5
  })
  
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Inactive User Alert',
      trigger: 'user_inactive_7_days',
      condition: 'completion_rate < 30%',
      action: 'send_motivation_email',
      isActive: true,
      executionCount: 156,
      successRate: 68.2
    },
    {
      id: '2',
      name: 'Workout Streak Celebration',
      trigger: 'workout_streak_7_days',
      condition: 'completion_rate > 80%',
      action: 'send_celebration_push',
      isActive: true,
      executionCount: 89,
      successRate: 92.1
    },
    {
      id: '3',
      name: 'Goal Achievement Notification',
      trigger: 'goal_completed',
      condition: 'any_goal_type',
      action: 'send_achievement_notification',
      isActive: true,
      executionCount: 234,
      successRate: 95.7
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<NotificationCampaign | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!user || profile?.email !== 'admin@routinize.com') {
      router.push('/dashboard')
      return
    }

    loadCommunicationData()
  }, [user, profile, router])

  const loadCommunicationData = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would load data from Supabase
      // For now, we're using mock data
      
      // Calculate stats from campaigns
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0)
      const avgOpenRate = campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length
      const avgClickRate = campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length
      
      setStats({
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalSent,
        averageOpenRate: Math.round(avgOpenRate * 10) / 10,
        averageClickRate: Math.round(avgClickRate * 10) / 10,
        engagementScore: 87.5
      })

    } catch (error) {
      console.error('Error loading communication data:', error)
      toast({
        title: "Error",
        description: "Failed to load communication data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCampaign = async (campaignData: Partial<NotificationCampaign>) => {
    try {
      const newCampaign: NotificationCampaign = {
        id: Date.now().toString(),
        name: campaignData.name || 'New Campaign',
        type: campaignData.type || 'push',
        status: 'draft',
        targetSegment: campaignData.targetSegment || 'all_users',
        title: campaignData.title || '',
        message: campaignData.message || '',
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date(),
        aiOptimized: false
      }

      setCampaigns(prev => [...prev, newCampaign])
      
      toast({
        title: "Campaign Created",
        description: "New communication campaign has been created",
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign",
        variant: "destructive"
      })
    }
  }

  const toggleCampaign = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              status: campaign.status === 'active' ? 'paused' : 'active'
            }
          : campaign
      ))

      const campaign = campaigns.find(c => c.id === campaignId)
      toast({
        title: `Campaign ${campaign?.status === 'active' ? 'Paused' : 'Activated'}`,
        description: `${campaign?.name} has been ${campaign?.status === 'active' ? 'paused' : 'activated'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle campaign status",
        variant: "destructive"
      })
    }
  }

  const optimizeWithAI = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              aiOptimized: true,
              title: campaign.title + ' (AI Optimized)',
              openRate: Math.min(95, campaign.openRate + Math.random() * 15),
              clickRate: Math.min(50, campaign.clickRate + Math.random() * 10)
            }
          : campaign
      ))

      toast({
        title: "AI Optimization Complete",
        description: "Campaign has been optimized using AI algorithms",
      })
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize campaign with AI",
        variant: "destructive"
      })
    }
  }

  const toggleAutomationRule = async (ruleId: string) => {
    try {
      setAutomationRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      ))

      const rule = automationRules.find(r => r.id === ruleId)
      toast({
        title: `Automation ${rule?.isActive ? 'Disabled' : 'Enabled'}`,
        description: `${rule?.name} has been ${rule?.isActive ? 'disabled' : 'enabled'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle automation rule",
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication & Notifications</h1>
            <p className="text-gray-600">AI-powered messaging and automated engagement system</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Communication Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                </div>
                <Play className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                </div>
                <Send className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold">{stats.averageOpenRate}%</p>
                </div>
                <Eye className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Click Rate</p>
                  <p className="text-2xl font-bold">{stats.averageClickRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-2xl font-bold">{stats.engagementScore}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {campaign.type === 'email' && <Mail className="h-5 w-5 mr-2" />}
                        {campaign.type === 'push' && <Bell className="h-5 w-5 mr-2" />}
                        {campaign.type === 'sms' && <Smartphone className="h-5 w-5 mr-2" />}
                        {campaign.type === 'in_app' && <MessageSquare className="h-5 w-5 mr-2" />}
                        {campaign.name}
                        {campaign.aiOptimized && (
                          <Badge variant="secondary" className="ml-2">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Optimized
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Target: {campaign.targetSegment} • Created: {campaign.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'scheduled' ? 'secondary' :
                        campaign.status === 'paused' ? 'destructive' : 'outline'
                      }>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">{campaign.title}</h4>
                      <p className="text-sm text-gray-600">{campaign.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{campaign.sentCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{campaign.openRate}%</div>
                        <div className="text-xs text-gray-600">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{campaign.clickRate}%</div>
                        <div className="text-xs text-gray-600">Click Rate</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleCampaign(campaign.id)}
                      >
                        {campaign.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      
                      {!campaign.aiOptimized && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => optimizeWithAI(campaign.id)}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          AI Optimize
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                AI-powered automated communication triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-gray-600">
                          When: {rule.trigger} | If: {rule.condition} | Then: {rule.action}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleAutomationRule(rule.id)}
                        />
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Executions</div>
                        <div className="font-medium">{rule.executionCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                        <div className="font-medium">{rule.successRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Performance metrics across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Campaigns</span>
                    <span className="font-medium">Open Rate: 75.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Push Notifications</span>
                    <span className="font-medium">Open Rate: 68.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SMS Messages</span>
                    <span className="font-medium">Open Rate: 92.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In-App Messages</span>
                    <span className="font-medium">Open Rate: 84.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Optimization Impact</CardTitle>
                <CardDescription>Performance improvement with AI optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Rate Improvement</span>
                    <span className="font-medium text-green-600">+23.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click Rate Improvement</span>
                    <span className="font-medium text-green-600">+18.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-medium text-green-600">+15.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unsubscribe Rate</span>
                    <span className="font-medium text-green-600">-8.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
