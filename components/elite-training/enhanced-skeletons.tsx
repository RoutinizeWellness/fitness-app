"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced Skeleton Components for Elite Training Dashboard

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF3E9]">
      <div className="max-w-md mx-auto bg-[#FFF3E9] min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-[#1B237E] to-[#573353] text-white p-6 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <SkeletonBox className="h-6 w-32 bg-white/20" />
              <SkeletonBox className="h-4 w-48 bg-white/10" />
            </div>
            <SkeletonBox className="h-8 w-8 rounded-full bg-white/20" />
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-5 w-5 rounded bg-white/20" />
                <SkeletonBox className="h-6 w-12 bg-white/20" />
              </div>
              <SkeletonBox className="h-3 w-20 bg-white/10 mt-2" />
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-5 w-5 rounded bg-white/20" />
                <SkeletonBox className="h-6 w-12 bg-white/20" />
              </div>
              <SkeletonBox className="h-3 w-20 bg-white/10 mt-2" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-4">
          {/* Tabs Skeleton */}
          <div className="bg-white/50 rounded-xl p-1">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Performance Overview Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-4">
            <div className="flex items-center">
              <SkeletonBox className="h-5 w-5 rounded mr-2" />
              <SkeletonBox className="h-5 w-32" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <SkeletonBox className="h-8 w-16 mx-auto" />
                <SkeletonBox className="h-4 w-20 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <SkeletonBox className="h-8 w-16 mx-auto" />
                <SkeletonBox className="h-4 w-20 mx-auto" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-12" />
              </div>
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-4">
            <SkeletonBox className="h-5 w-24" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center space-y-1">
                  <SkeletonBox className="h-5 w-5 rounded" />
                  <SkeletonBox className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-4">
            <SkeletonBox className="h-5 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SkeletonBox className="w-2 h-2 rounded-full mr-3" />
                    <SkeletonBox className="h-4 w-32" />
                  </div>
                  <SkeletonBox className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PerformanceChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="space-y-4">
        {/* Chart area */}
        <div className="relative">
          <SkeletonBox className="w-full h-40 rounded-lg" />
          {/* Simulated chart lines */}
          <div className="absolute inset-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBox key={i} className="h-0.5 w-full opacity-30" />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <SkeletonBox className="w-3 h-3 rounded mr-2" />
            <SkeletonBox className="h-3 w-16" />
          </div>
          <div className="flex items-center">
            <SkeletonBox className="w-3 h-3 rounded mr-2" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProgressRingSkeleton({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center">
      <SkeletonBox
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      <SkeletonBox className="h-3 w-16 mt-2" />
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      {/* Days header */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBox key={i} className="h-4 w-4 mx-auto" />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-2 border-gray-200 rounded-lg p-2 min-h-[60px] space-y-1">
            <SkeletonBox className="h-4 w-4" />
            <SkeletonBox className="h-2 w-full" />
            <SkeletonBox className="h-2 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendIndicatorSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-4 w-20" />
      </div>
      <div className="flex items-center">
        <SkeletonBox className="h-4 w-4 rounded mr-1" />
        <SkeletonBox className="h-4 w-12" />
      </div>
    </div>
  )
}

export function GoalCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center">
            <SkeletonBox className="h-4 w-4 rounded mr-2" />
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-4 w-16 rounded-full ml-2" />
          </div>
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-3/4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-3 w-20" />
            </div>
            <SkeletonBox className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-3 w-24" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <SkeletonBox className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

export function AIInsightsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Success Probability */}
      <div className="p-4 bg-blue-50 rounded-lg space-y-3">
        <SkeletonBox className="h-5 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <SkeletonBox className="h-4 w-32" />
              <div className="flex items-center">
                <SkeletonBox className="w-2 h-2 rounded-full mr-2" />
                <SkeletonBox className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-green-50 rounded-lg space-y-3">
        <SkeletonBox className="h-5 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="p-4 bg-purple-50 rounded-lg space-y-3">
        <SkeletonBox className="h-5 w-36" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Base Skeleton Box Component with Animation
interface SkeletonBoxProps {
  className?: string
  style?: React.CSSProperties
}

function SkeletonBox({ className = "", style }: SkeletonBoxProps) {
  return (
    <motion.div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const touch = e.touches[0]
      const distance = Math.max(0, touch.clientY - 100)
      setPullDistance(Math.min(distance, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 60) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setIsPulling(false)
    setPullDistance(0)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-lg"
            style={{ marginTop: pullDistance / 2 }}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#1B237E]"
                animate={{ rotate: pullDistance * 3.6 }}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </motion.svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: isPulling ? pullDistance / 4 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
