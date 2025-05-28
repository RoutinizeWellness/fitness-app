"use client"

import React, { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedListProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  keyExtractor: (item: any, index: number) => string
  className?: string
  itemClassName?: string
  emptyMessage?: string
  isLoading?: boolean
}

export function AnimatedList({
  items,
  renderItem,
  keyExtractor,
  className = "",
  itemClassName = "",
  emptyMessage = "No hay elementos para mostrar",
  isLoading = false
}: AnimatedListProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
