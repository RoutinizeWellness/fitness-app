"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  Dumbbell, 
  Utensils, 
  Moon, 
  Heart, 
  User,
  BarChart2
} from "lucide-react"

import { cn } from "@/lib/utils"

interface MobileNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MobileNav({ className, ...props }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Training",
      href: "/training",
      icon: Dumbbell,
    },
    {
      name: "Nutrition",
      href: "/nutrition",
      icon: Utensils,
    },
    {
      name: "Sleep",
      href: "/sleep",
      icon: Moon,
    },
    {
      name: "Wellness",
      href: "/wellness",
      icon: Heart,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background px-4 pb-2 pt-2 backdrop-blur-lg md:hidden",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-md p-2 text-muted-foreground transition-colors",
                isActive ? "text-primary" : "hover:text-foreground"
              )}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-2 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
              </div>
              <span className="mt-1 text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
