"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts"
import {
  TrendingUp, TrendingDown, Calendar, Target, Zap, Trophy,
  Plus, ChevronRight, Star, Brain, Activity, Clock, Award,
  ArrowUp, ArrowDown, Minus, Sparkles, Fire, CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SafeClientButton } from "@/components/ui/safe-client-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns"

// Enhanced Performance Chart Component
interface PerformanceChartProps {
  data: Array<{
    date: string
    performance: number
    volume: number
    intensity: number
  }>
  height?: number
}

export function PerformanceChart({ data, height = 200 }: PerformanceChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B237E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1B237E" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FEA800" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FEA800" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="performance"
            stroke="#1B237E"
            fillOpacity={1}
            fill="url(#performanceGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#FEA800"
            fillOpacity={1}
            fill="url(#volumeGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Animated Progress Ring Component
interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showValue?: boolean
}

export function ProgressRing({ 
  value, 
  size = 80, 
  strokeWidth = 8, 
  color = "#1B237E", 
  label,
  showValue = true 
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={animatedValue}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: '#E5E7EB',
            pathTransitionDuration: 1.5,
          })}
          text={showValue ? `${Math.round(animatedValue)}%` : ''}
        />
      </div>
      {label && (
        <span className="text-xs text-gray-600 mt-2 text-center">{label}</span>
      )}
    </motion.div>
  )
}

// Trend Indicator Component
interface TrendIndicatorProps {
  value: number
  previousValue: number
  label: string
  format?: (value: number) => string
}

export function TrendIndicator({ value, previousValue, label, format = (v) => v.toString() }: TrendIndicatorProps) {
  const change = value - previousValue
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0
  const isPositive = change > 0
  const isNeutral = change === 0

  const TrendIcon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown
  const trendColor = isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between"
    >
      <div>
        <div className="text-2xl font-bold text-[#1B237E]">{format(value)}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
      <div className={`flex items-center ${trendColor}`}>
        <TrendIcon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">
          {Math.abs(percentChange).toFixed(1)}%
        </span>
      </div>
    </motion.div>
  )
}

// Quick Goal Creation Modal
interface QuickGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goal: any) => void
}

export function QuickGoalModal({ isOpen, onClose, onSave }: QuickGoalModalProps) {
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    category: 'performance',
    type: 'micro',
    targetValue: 0,
    unit: '',
    deadline: ''
  })

  const handleSave = () => {
    if (!goalData.title.trim()) return
    
    onSave({
      ...goalData,
      deadline: new Date(goalData.deadline)
    })
    
    // Reset form
    setGoalData({
      title: '',
      description: '',
      category: 'performance',
      type: 'micro',
      targetValue: 0,
      unit: '',
      deadline: ''
    })
    
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-[#1B237E]" />
            Quick Goal
          </DialogTitle>
          <DialogDescription>
            Create a quick goal to track your progress
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Title</label>
            <Input
              value={goalData.title}
              onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Run 5km under 25 minutes"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={goalData.type} onValueChange={(value) => setGoalData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">Micro Goal</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={goalData.category} onValueChange={(value) => setGoalData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="body_composition">Body Comp</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Target</label>
              <Input
                type="number"
                value={goalData.targetValue}
                onChange={(e) => setGoalData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                placeholder="100"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={goalData.unit}
                onChange={(e) => setGoalData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="kg, reps, min"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Deadline</label>
            <Input
              type="date"
              value={goalData.deadline}
              onChange={(e) => setGoalData(prev => ({ ...prev, deadline: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <SafeClientButton variant="outline" onClick={onClose}>
              Cancel
            </SafeClientButton>
            <SafeClientButton onClick={handleSave} disabled={!goalData.title.trim()}>
              Create Goal
            </SafeClientButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Achievement Celebration Component
interface AchievementCelebrationProps {
  achievement: {
    title: string
    description: string
    type: 'goal' | 'milestone' | 'streak' | 'pr'
  }
  isVisible: boolean
  onClose: () => void
}

export function AchievementCelebration({ achievement, isVisible, onClose }: AchievementCelebrationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getIcon = () => {
    switch (achievement.type) {
      case 'goal': return Trophy
      case 'milestone': return Star
      case 'streak': return Fire
      case 'pr': return Award
      default: return CheckCircle
    }
  }

  const Icon = getIcon()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <Card className="bg-gradient-to-r from-[#FEA800] to-[#FF6767] text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="mr-3"
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{achievement.title}</h3>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Weekly Calendar Component
interface WeeklyCalendarProps {
  events: Array<{
    date: Date
    title: string
    type: 'workout' | 'test' | 'goal_deadline' | 'rest'
  }>
}

export function WeeklyCalendar({ events }: WeeklyCalendarProps) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-[#1B237E] text-white'
      case 'test': return 'bg-[#FEA800] text-white'
      case 'goal_deadline': return 'bg-[#FF6767] text-white'
      case 'rest': return 'bg-[#B1AFE9] text-[#573353]'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-2 rounded-lg border-2 min-h-[60px] cursor-pointer
                ${isToday ? 'border-[#1B237E] bg-[#1B237E]/5' : 'border-gray-200'}
              `}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-[#1B237E]' : 'text-gray-700'}`}>
                {format(date, 'd')}
              </div>
              
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs px-1 py-0.5 rounded ${getEventColor(event.type)}`}
                  >
                    {event.title.length > 8 ? `${event.title.slice(0, 8)}...` : event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
