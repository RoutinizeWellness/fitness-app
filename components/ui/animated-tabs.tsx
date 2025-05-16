"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type TabItem = {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  content: React.ReactNode
}

interface AnimatedTabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabsClassName?: string
  contentClassName?: string
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline"
}

export function AnimatedTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  tabsClassName,
  contentClassName,
  orientation = "horizontal",
  variant = "default",
}: AnimatedTabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue || items[0]?.value)

  React.useEffect(() => {
    if (value) {
      setSelectedTab(value)
    }
  }, [value])

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue)
    if (onValueChange) {
      onValueChange(tabValue)
    }
  }

  const isVertical = orientation === "vertical"

  return (
    <div className={cn("w-full", isVertical && "flex flex-row gap-6", className)}>
      <div
        className={cn(
          "relative",
          isVertical ? "flex flex-col space-y-2 min-w-[200px]" : "flex space-x-1",
          variant === "pills" && "p-1 bg-muted rounded-lg",
          variant === "underline" && "border-b",
          tabsClassName,
        )}
      >
        {items.map((item) => {
          const isActive = selectedTab === item.value
          return (
            <button
              key={item.value}
              onClick={() => handleTabChange(item.value)}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-all",
                isVertical ? "text-left" : "text-center",
                variant === "default" && [
                  "rounded-md",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                ],
                variant === "pills" && [
                  "rounded-md",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                ],
                variant === "underline" && [
                  "rounded-none px-4",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                ],
                "flex items-center gap-2",
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {variant === "default" && isActive && (
                <motion.div
                  layoutId="default-tab-indicator"
                  className="absolute inset-0 bg-primary rounded-md z-[-1]"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              {variant === "pills" && isActive && (
                <motion.div
                  layoutId="pill-tab-indicator"
                  className="absolute inset-0 bg-primary rounded-md z-[-1]"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              {variant === "underline" && isActive && (
                <motion.div
                  layoutId="underline-tab-indicator"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          )
        })}
      </div>
      <div className={cn("mt-2 flex-1", contentClassName)}>
        {items.map((item) => (
          <div
            key={item.value}
            className={cn(
              "transition-opacity duration-300",
              selectedTab === item.value ? "block opacity-100" : "hidden opacity-0",
            )}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
