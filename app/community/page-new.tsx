"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Heart, MessageSquare, Share2 } from "lucide-react"
import { getCommunityActivities, addCommunityActivity, getUserProfile, type CommunityActivity } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function CommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<CommunityActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [postText, setPostText] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Load community activities
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getCommunityActivities()

        if (error) {
          throw error
        }

        if (data) {
          setActivities(data)
        }
      } catch (error) {
        console.error("Error loading activities:", error)
        toast({
          title: "Error",
          description: "Could not load community activities",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Load user profile
  useEffect(() => {
    if (!user?.id) return

    const loadUserProfile = async () => {
      try {
        const { data, error } = await getUserProfile(user.id)

        if (error) {
          throw error
        }

        if (data) {
          setUserProfile(data)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }

    loadUserProfile()
  }, [user?.id])

  // Post new activity
  const handlePost = async () => {
    if (!user?.id || !postText.trim()) return

    setIsPosting(true)
    try {
      const newActivity = {
        user_id: user.id,
        content: postText,
        type: "post",
      }

      const { data, error } = await addCommunityActivity(newActivity)

      if (error) {
        throw error
      }

      // Update activities list
      const { data: updatedActivities } = await getCommunityActivities()
      if (updatedActivities) {
        setActivities(updatedActivities)
      }

      setPostText("")
      toast({
        title: "Success",
        description: "Your post has been shared with the community",
      })
    } catch (error) {
      console.error("Error posting:", error)
      toast({
        title: "Error",
        description: "Could not publish your post",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      const now = new Date()
      const postDate = new Date(timestamp)
      const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`
      }
    } catch (error) {
      return "41m ago" // Default fallback
    }
  }

  return (
    <div className="w-[414px] h-[896px] bg-[#FFF3E9] overflow-hidden mx-auto relative">
      {/* Background */}
      <img className="absolute left-[20px] top-[297px] w-[374px] h-[164px]" src="/images/habit-builder/background0.svg" alt="" />
      
      {/* Post 4 */}
      <div className="absolute left-[20px] top-[640px] w-[374px] h-[164px]">
        <img className="absolute left-[0px] top-[0px] w-[374px] h-[164px]" src="/images/habit-builder/background0.svg" alt="" />
        <div className="absolute left-[36px] top-[704px] text-[#573353] font-['Manrope-Medium'] text-[14px] leading-[20px] tracking-[-0.03em] font-medium w-[343px]">
          James Clear&#039;s Habit&#039;s Academy course has tremendously changed my life for the better! Having been a self improvement aficionado for decades...
        </div>
        <img className="absolute left-[352px] top-[651px] w-[32px] h-[32px]" src="/images/habit-builder/share-post0.svg" alt="" />
        
        <div className="absolute left-[36px] top-[653px] w-[82px] h-[28px]">
          <img className="absolute left-[0px] top-[0px] w-[28px] h-[28px] rounded-full" src="/images/habit-builder/ellipse-8380.png" alt="" />
          <div className="absolute left-[42px] top-[0px] text-[#573353] font-['Manrope-Bold'] text-[14px] leading-[14px] tracking-[-0.03em] font-bold">
            Colin
          </div>
          <div className="absolute left-[42px] top-[14px] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            41m ago
          </div>
        </div>
        
        <div className="absolute left-[323px] top-[779px] w-[67px] h-[11px]">
          <div className="absolute left-[326px] top-[779px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium">
            3.1k
          </div>
          <div className="absolute left-[368px] top-[779px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium opacity-50">
            22
          </div>
          <img className="absolute left-[355px] top-[779px] w-[10px] h-[10px]" src="/images/habit-builder/speech-bubble-10.svg" alt="" />
          <img className="absolute left-[323px] top-[779px] w-[12px] h-[10px]" src="/images/habit-builder/vector0.svg" alt="" />
        </div>
      </div>
      
      {/* Post 3 */}
      <div className="absolute left-[20px] top-[469px] w-[374px] h-[164px]">
        <img className="absolute left-[0px] top-[0px] w-[374px] h-[164px]" src="/images/habit-builder/background0.svg" alt="" />
        <div className="absolute left-[36px] top-[533px] text-[#573353] font-['Manrope-Medium'] text-[14px] leading-[20px] tracking-[-0.03em] font-medium w-[348px]">
          This course contains the most complete material on habit formation that I&#039;ve seen. There is just enough theory to explain the principles, and not so much...
        </div>
        <img className="absolute left-[352px] top-[480px] w-[32px] h-[32px]" src="/images/habit-builder/share-post1.svg" alt="" />
        
        <div className="absolute left-[40px] top-[480px] w-[78px] h-[28px]">
          <div className="absolute left-[0px] top-[0px] text-[#573353] font-['Manrope-Bold'] text-[14px] leading-[14px] tracking-[-0.03em] font-bold">
            Al
          </div>
          <div className="absolute left-[0px] top-[14px] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            41m ago
          </div>
          <img className="absolute left-[0px] top-[0px] w-[28px] h-[28px] rounded-full" src="/images/habit-builder/ellipse-8410.png" alt="" />
        </div>
        
        <div className="absolute left-[323px] top-[607px] w-[67px] h-[11px]">
          <div className="absolute left-[326px] top-[607px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium">
            3.1k
          </div>
          <div className="absolute left-[368px] top-[607px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium opacity-50">
            22
          </div>
          <img className="absolute left-[355px] top-[607px] w-[10px] h-[10px]" src="/images/habit-builder/speech-bubble-10.svg" alt="" />
          <img className="absolute left-[323px] top-[607px] w-[12px] h-[10px]" src="/images/habit-builder/vector0.svg" alt="" />
        </div>
      </div>
      
      {/* Post 2 */}
      <div className="absolute left-[20px] top-[297px] w-[348px] h-[138px]">
        <div className="absolute left-[36px] top-[361px] text-[#573353] font-['Manrope-Medium'] text-[14px] leading-[20px] tracking-[-0.03em] font-medium w-[337px]">
          I loved the course! I&#039;ve been trying to break all this great stuff down into manageable chunks to help my clients develop healthy habits and achieve their personal...
        </div>
        <img className="absolute left-[352px] top-[307px] w-[32px] h-[32px]" src="/images/habit-builder/share-post0.svg" alt="" />
        
        <div className="absolute left-[36px] top-[309px] w-[99px] h-[28px]">
          <img className="absolute left-[0px] top-[0px] w-[28px] h-[28px] rounded-full" src="/images/habit-builder/ellipse-8411.png" alt="" />
          <div className="absolute left-[42px] top-[0px] text-[#573353] font-['Manrope-Bold'] text-[14px] leading-[14px] tracking-[-0.03em] font-bold">
            Gretchen
          </div>
          <div className="absolute left-[42px] top-[14px] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            41m ago
          </div>
        </div>
        
        <div className="absolute left-[323px] top-[435px] w-[67px] h-[11px]">
          <div className="absolute left-[326px] top-[435px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium">
            3.1k
          </div>
          <div className="absolute left-[368px] top-[435px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium opacity-50">
            22
          </div>
          <img className="absolute left-[355px] top-[435px] w-[10px] h-[10px]" src="/images/habit-builder/speech-bubble-10.svg" alt="" />
          <img className="absolute left-[323px] top-[435px] w-[12px] h-[10px]" src="/images/habit-builder/vector0.svg" alt="" />
        </div>
      </div>
      
      {/* Post 1 */}
      <div className="absolute left-[20px] top-[125px] w-[374px] h-[164px]">
        <img className="absolute left-[0px] top-[0px] w-[374px] h-[164px]" src="/images/habit-builder/background0.svg" alt="" />
        <div className="absolute left-[36px] top-[189px] text-[#573353] font-['Manrope-Medium'] text-[14px] leading-[20px] tracking-[-0.03em] font-medium w-[343px]">
          Man, you&#039;re my new guru! Viewing the lessons for a second time. Thoroughly pleased. And impressed that you draw from scientific literature in telling memorable...
        </div>
        
        <div className="absolute left-[36px] top-[137px] w-[87px] h-[28px]">
          <div className="absolute left-[42px] top-[0px] text-[#573353] font-['Manrope-Bold'] text-[14px] leading-[14px] tracking-[-0.03em] font-bold">
            Jerome
          </div>
          <div className="absolute left-[42px] top-[14px] text-[#573353] font-['Manrope-Medium'] text-[12px] leading-[14px] tracking-[-0.03em] font-medium opacity-50">
            41m ago
          </div>
          <img className="absolute left-[0px] top-[0px] w-[28px] h-[28px] rounded-full" src="/images/habit-builder/image0.png" alt="" />
        </div>
        
        <img className="absolute left-[352px] top-[135px] w-[32px] h-[32px]" src="/images/habit-builder/share-post0.svg" alt="" />
        
        <div className="absolute left-[323px] top-[263px] w-[67px] h-[11px]">
          <div className="absolute left-[326px] top-[263px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium">
            3.1k
          </div>
          <div className="absolute left-[368px] top-[263px] text-[#573353] text-center font-['Manrope-Medium'] text-[8px] tracking-[-0.03em] font-medium opacity-50">
            22
          </div>
          <img className="absolute left-[355px] top-[263px] w-[10px] h-[10px]" src="/images/habit-builder/speech-bubble-10.svg" alt="" />
          <img className="absolute left-[323px] top-[263px] w-[12px] h-[10px]" src="/images/habit-builder/vector0.svg" alt="" />
        </div>
      </div>
      
      {/* Header */}
      <div className="absolute left-[10px] top-[28px] w-[64px] h-[65px] overflow-hidden">
        <div className="absolute left-[15.62%] top-[16.92%] right-[15.62%] bottom-[15.38%] bg-[#573353] rounded-[25px] opacity-10"></div>
        <img className="absolute left-[10px] top-[11px] w-[44px] h-[44px]" src="/images/habit-builder/hamburger-menu0.svg" alt="" />
      </div>
      
      <img className="absolute left-[350px] top-[39px]" src="/images/habit-builder/profile4.svg" alt="" />
      
      <div className="absolute left-[162px] top-[45px] w-[91px] h-[32px]">
        <div className="absolute left-[-3.3%] top-[0%] right-[-4.4%] bottom-[0%] text-[#573353] text-center font-['Manrope-Bold'] text-[18px] leading-[32px] tracking-[-0.03em] font-bold">
          Community
        </div>
      </div>
      
      {/* Bottom Menu */}
      <div className="absolute left-[0px] top-[772px] w-[414px] h-[124px]">
        <img className="absolute left-[0px] top-[44px] right-[0px] bottom-[0px] w-full h-[64.52%]" src="/images/habit-builder/menu1.svg" alt="" />
        <img className="absolute left-[42.27%] top-[0px] right-[42.27%] bottom-[48.39%] w-[15.46%] h-[51.61%]" src="/images/habit-builder/plus-button0.svg" alt="" />
      </div>
    </div>
  )
}
