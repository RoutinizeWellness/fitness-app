"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useSupabase } from "@/contexts/supabase-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Camera, User } from "lucide-react"
import { ProfileService, UserProfile } from "@/lib/services/profile-service"
import { toast } from "@/components/ui/use-toast"

interface ProfileEditorProps {
  onClose?: () => void
}

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Servicio de perfil
  const profileService = new ProfileService(supabase)
  
  // Cargar datos del perfil
  useEffect(() => {
    if (!user) return
    
    const loadProfile = async () => {
      try {
        const userProfile = await profileService.getUserProfile(user.id)
        
        if (userProfile) {
          setProfile(userProfile)
          setFullName(userProfile.full_name || "")
          setBio(userProfile.bio || "")
          setAvatarUrl(userProfile.avatar_url || null)
        } else {
          // Crear un perfil por defecto
          const defaultProfile: UserProfile = {
            id: "",
            user_id: user.id,
            full_name: user.user_metadata?.full_name || "",
            avatar_url: user.user_metadata?.avatar_url || null
          }
          
          setProfile(defaultProfile)
          setFullName(defaultProfile.full_name || "")
          setAvatarUrl(defaultProfile.avatar_url || null)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [user, supabase])
  
  // Manejar cambio de avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      })
      return
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }
    
    // Crear URL para previsualización
    const objectUrl = URL.createObjectURL(file)
    setAvatarUrl(objectUrl)
    setAvatarFile(file)
  }
  
  // Guardar cambios
  const handleSave = async () => {
    if (!user || !profile) return
    
    setIsSaving(true)
    
    try {
      // Primero, subir el avatar si hay uno nuevo
      let newAvatarUrl = avatarUrl
      
      if (avatarFile) {
        newAvatarUrl = await profileService.uploadAvatar(user.id, avatarFile)
        
        if (!newAvatarUrl) {
          throw new Error("Failed to upload avatar")
        }
      }
      
      // Actualizar el perfil
      const updatedProfile: UserProfile = {
        ...profile,
        full_name: fullName,
        bio: bio,
        avatar_url: newAvatarUrl
      }
      
      const result = await profileService.updateUserProfile(updatedProfile)
      
      if (result) {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
        
        // Actualizar estado local
        setProfile(result)
        setAvatarFile(null)
        
        // Cerrar el editor si hay una función de cierre
        if (onClose) {
          onClose()
        }
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#FDA758]" />
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-white rounded-3xl">
      <h2 className="text-[#573353] text-xl font-medium mb-6">Edit Profile</h2>
      
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div 
          className="relative w-24 h-24 rounded-full overflow-hidden bg-[#FDA758]/20 mb-3 cursor-pointer"
          onClick={handleAvatarClick}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-12 w-12 text-[#573353]" />
            </div>
          )}
          
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#FDA758] rounded-full flex items-center justify-center">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <p className="text-[#573353] text-sm">Tap to change profile photo</p>
      </div>
      
      {/* Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-[#573353] text-sm font-medium mb-1">
            Full Name
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border-gray-200 rounded-xl focus-visible:ring-[#FDA758]"
            placeholder="Your full name"
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-[#573353] text-sm font-medium mb-1">
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="border-gray-200 rounded-xl focus-visible:ring-[#FDA758]"
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-gray-200 text-[#573353]"
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSave}
          className="flex-1 bg-[#FDA758] hover:bg-[#FDA758]/90 text-white"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
