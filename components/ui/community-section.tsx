"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CommunityMember {
  id: string
  name: string
  avatarUrl: string
}

interface CommunitySectionProps {
  title: string
  tagName?: string
  description?: string
  questionText?: string
  memberCount?: number
  members?: CommunityMember[]
  className?: string
  darkMode?: boolean
}

export function CommunitySection({
  title,
  tagName,
  description = "Check out posts & questions",
  questionText = "Have a question?",
  memberCount = 0,
  members = [],
  className,
  darkMode = false
}: CommunitySectionProps) {
  const router = useRouter()
  
  const handleAskQuestion = () => {
    router.push("/community/ask")
  }
  
  const handleViewTag = () => {
    if (tagName) {
      router.push(`/community/tag/${tagName.replace("#", "")}`)
    }
  }
  
  // Mostrar solo los primeros 3 miembros
  const displayedMembers = members.slice(0, 3)
  
  return (
    <div className={cn(
      "w-full",
      darkMode ? "text-white" : "text-gray-800",
      className
    )}>
      <h2 className={cn(
        "text-2xl font-bold mb-6",
        darkMode ? "text-white" : "text-gray-800"
      )}>
        {title}
      </h2>
      
      {tagName && (
        <button
          onClick={handleViewTag}
          className={cn(
            "flex items-center justify-between w-full p-4 rounded-xl mb-6",
            darkMode 
              ? "bg-gray-800 hover:bg-gray-700" 
              : "bg-white border border-gray-200 hover:bg-gray-50"
          )}
        >
          <div>
            <span className={cn(
              "text-lg font-medium",
              darkMode ? "text-teal-400" : "text-teal-500"
            )}>
              {tagName}
            </span>
            <p className={cn(
              "text-sm mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              {description}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-5 w-5",
            darkMode ? "text-gray-400" : "text-gray-500"
          )} />
        </button>
      )}
      
      <div className="mb-6">
        <p className={cn(
          "text-lg font-medium mb-4",
          darkMode ? "text-white" : "text-gray-800"
        )}>
          {questionText}
        </p>
        
        <div className="flex items-center mb-4">
          <div className="flex -space-x-3 mr-4">
            {displayedMembers.map((member) => (
              <div 
                key={member.id} 
                className="relative w-10 h-10 rounded-full border-2 border-gray-900 overflow-hidden"
              >
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${member.name}&background=random`;
                  }}
                />
              </div>
            ))}
          </div>
          
          <div>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Ask the {memberCount.toLocaleString()} others
            </p>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              growing one.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAskQuestion}
          className={cn(
            "w-full flex items-center justify-center py-4 rounded-full",
            darkMode 
              ? "bg-gray-800 text-white hover:bg-gray-700" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          )}
        >
          Ask a question <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </div>
  )
}
