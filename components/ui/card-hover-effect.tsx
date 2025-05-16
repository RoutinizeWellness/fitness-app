"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export interface CardHoverEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string
    description: string
    icon?: React.ReactNode
    link?: string
  }[]
  className?: string
}

export function CardHoverEffect({ items, className, ...props }: CardHoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} {...props}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-6 h-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/10 dark:bg-primary/20 block rounded-lg"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="rounded-lg border border-border p-6 h-full bg-card shadow-sm relative z-10">
            <div className="flex items-center gap-4">
              {item.icon && <div className="p-2 rounded-full bg-primary/10 text-primary">{item.icon}</div>}
              <h3 className="text-lg font-semibold">{item.title}</h3>
            </div>
            <p className="mt-4 text-muted-foreground">{item.description}</p>
            {item.link && (
              <div className="mt-4">
                <a href={item.link} className="text-primary hover:underline inline-flex items-center gap-1">
                  Saber más
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
