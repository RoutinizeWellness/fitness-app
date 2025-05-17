import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from './auth-context'

export type UserProfile = {
  id: string
  userId: string
  fullName: string
  avatarUrl?: string
  weight?: number
  height?: number
  goal?: string
  level?: string
  isAdmin?: boolean
  createdAt: string
  updatedAt?: string
}

type ProfileContextType = {
  profile: UserProfile | null
  isLoading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      if (!data) {
        console.log('No profile found, creating default profile')
        return null
      }

      // Transform data to match our application's expected format
      const transformedProfile: UserProfile = {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name || 'User',
        avatarUrl: data.avatar_url,
        weight: data.weight,
        height: data.height,
        goal: data.goal,
        level: data.level || 'beginner',
        isAdmin: data.is_admin || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return transformedProfile
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    try {
      setIsLoading(true)
      
      const defaultProfile = {
        user_id: userId,
        full_name: 'User',
        level: 'beginner',
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()

      if (error) {
        console.error('Error creating default profile:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.error('No data returned after creating default profile')
        return null
      }

      // Transform data to match our application's expected format
      const transformedProfile: UserProfile = {
        id: data[0].id,
        userId: data[0].user_id,
        fullName: data[0].full_name || 'User',
        level: data[0].level || 'beginner',
        isAdmin: data[0].is_admin || false,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      }

      return transformedProfile
    } catch (error) {
      console.error('Unexpected error creating default profile:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    const fetchedProfile = await fetchProfile(user.id)
    
    if (fetchedProfile) {
      setProfile(fetchedProfile)
    } else {
      const defaultProfile = await createDefaultProfile(user.id)
      setProfile(defaultProfile)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setIsLoading(true)

      if (!user || !profile) {
        return { error: new Error('User or profile not found') }
      }

      // Prepare data for Supabase
      const supabaseData = {
        user_id: user.id,
        full_name: updates.fullName || profile.fullName,
        avatar_url: updates.avatarUrl,
        weight: updates.weight,
        height: updates.height,
        goal: updates.goal,
        level: updates.level || profile.level,
        is_admin: profile.isAdmin, // Don't allow updating admin status
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(supabaseData)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: 'Error updating profile',
          description: error.message,
          variant: 'destructive'
        })
        return { error }
      }

      // Update local state
      setProfile({
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })

      return { error: null }
    } catch (error) {
      console.error('Unexpected error updating profile:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    profile,
    isLoading,
    updateProfile,
    refreshProfile
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
