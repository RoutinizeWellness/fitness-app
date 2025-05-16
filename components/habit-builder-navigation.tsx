"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart2,
  BookOpen,
  User,
  Plus,
  Bell,
  Search,
  Calendar,
  Settings
} from "lucide-react"

interface HabitBuilderNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  notifications?: number
}

export default function HabitBuilderNavigation({
  activeTab,
  setActiveTab,
  notifications = 0
}: HabitBuilderNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle navigation
  const handleNavigation = (tab: string) => {
    setActiveTab(tab)

    // Navigate to the appropriate page
    switch (tab) {
      case "home":
        router.push("/dashboard")
        break
      case "add":
        router.push("/add-habit")
        break
      case "stats":
        router.push("/training")
        break
      case "calendar":
        router.push("/habit-calendar")
        break
      case "profile":
        router.push("/profile")
        break
    }
  }

  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[#FFF5EB]/95 backdrop-blur-md shadow-sm"
            : "bg-[#FFF5EB]"
        )}
      >
        <div className="container max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/images/monumental-logo.svg"
              alt="Monumental Logo"
              className="h-8 mr-2"
            />
            <h1 className="text-xl font-bold text-[#573353] tracking-wide">
              MONUMENTAL
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#573353" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FDA758] text-white text-xs flex items-center justify-center shadow-sm font-medium">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-10 shadow-md">
        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => handleNavigation("home")}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke={activeTab === "home" ? "#FDA758" : "#573353"}
                strokeOpacity={activeTab === "home" ? "1" : "0.7"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-xs font-medium ${activeTab === "home" ? "text-[#FDA758]" : "text-[#573353]/70"}`}>Home</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => handleNavigation("stats")}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 20L6 10M18 20L18 10M12 8V4M12 20V16M4 8H8M16 8H20M4 12H20M4 16H8M16 16H20"
                stroke={activeTab === "stats" ? "#FDA758" : "#573353"}
                strokeOpacity={activeTab === "stats" ? "1" : "0.7"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-xs font-medium ${activeTab === "stats" ? "text-[#FDA758]" : "text-[#573353]/70"}`}>Training</span>
        </button>

        <button
          className="flex flex-col items-center relative w-[20%]"
          onClick={() => handleNavigation("add")}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#FDA758] to-[#FE9870] flex items-center justify-center absolute -top-[26px] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="w-7 h-7 mt-8"></div>
          <span className="text-xs font-medium text-[#573353]/70">Add</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => handleNavigation("calendar")}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                stroke={activeTab === "calendar" ? "#FDA758" : "#573353"}
                strokeOpacity={activeTab === "calendar" ? "1" : "0.7"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
              <path d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01"
                stroke={activeTab === "calendar" ? "#FDA758" : "#573353"}
                strokeOpacity={activeTab === "calendar" ? "1" : "0.7"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-xs font-medium ${activeTab === "calendar" ? "text-[#FDA758]" : "text-[#573353]/70"}`}>Calendar</span>
        </button>

        <button
          className="flex flex-col items-center w-[20%]"
          onClick={() => handleNavigation("profile")}
        >
          <div className="w-7 h-7 flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                stroke={activeTab === "profile" ? "#FDA758" : "#573353"}
                strokeOpacity={activeTab === "profile" ? "1" : "0.7"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-xs font-medium ${activeTab === "profile" ? "text-[#FDA758]" : "text-[#573353]/70"}`}>Profile</span>
        </button>
      </div>
    </>
  )
}
