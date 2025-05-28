/**
 * Supabase Database Types
 * 
 * This file contains TypeScript types for the Supabase database schema.
 * These types are used to ensure type safety when interacting with the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          weight: number | null
          height: number | null
          goal: string | null
          level: string | null
          is_admin: boolean | null
          experience_level: string | null
          interface_mode: string | null
          experience_details: Json | null
          onboarding_completed: boolean | null
          advanced_features_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          weight?: number | null
          height?: number | null
          goal?: string | null
          level?: string | null
          is_admin?: boolean | null
          experience_level?: string | null
          interface_mode?: string | null
          experience_details?: Json | null
          onboarding_completed?: boolean | null
          advanced_features_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          weight?: number | null
          height?: number | null
          goal?: string | null
          level?: string | null
          is_admin?: boolean | null
          experience_level?: string | null
          interface_mode?: string | null
          experience_details?: Json | null
          onboarding_completed?: boolean | null
          advanced_features_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_interface_preferences: {
        Row: {
          id: string
          user_id: string
          interface_mode: string | null
          theme: string | null
          color_scheme: string | null
          show_advanced_metrics: boolean | null
          show_scientific_explanations: boolean | null
          show_detailed_analytics: boolean | null
          show_periodization_tools: boolean | null
          simplified_navigation: boolean | null
          show_tutorial_tips: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          interface_mode?: string | null
          theme?: string | null
          color_scheme?: string | null
          show_advanced_metrics?: boolean | null
          show_scientific_explanations?: boolean | null
          show_detailed_analytics?: boolean | null
          show_periodization_tools?: boolean | null
          simplified_navigation?: boolean | null
          show_tutorial_tips?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          interface_mode?: string | null
          theme?: string | null
          color_scheme?: string | null
          show_advanced_metrics?: boolean | null
          show_scientific_explanations?: boolean | null
          show_detailed_analytics?: boolean | null
          show_periodization_tools?: boolean | null
          simplified_navigation?: boolean | null
          show_tutorial_tips?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          muscle_group: string[]
          secondary_muscle_groups: string[] | null
          difficulty: string | null
          equipment: string[] | null
          is_compound: boolean | null
          image_url: string | null
          video_url: string | null
          instructions: string | null
          tips: string[] | null
          alternatives: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          muscle_group: string[]
          secondary_muscle_groups?: string[] | null
          difficulty?: string | null
          equipment?: string[] | null
          is_compound?: boolean | null
          image_url?: string | null
          video_url?: string | null
          instructions?: string | null
          tips?: string[] | null
          alternatives?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          muscle_group?: string[]
          secondary_muscle_groups?: string[] | null
          difficulty?: string | null
          equipment?: string[] | null
          is_compound?: boolean | null
          image_url?: string | null
          video_url?: string | null
          instructions?: string | null
          tips?: string[] | null
          alternatives?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      workout_routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          goal: string | null
          level: string | null
          frequency: number | null
          days: Json
          is_template: boolean | null
          is_public: boolean | null
          periodization_type: string | null
          mesocycle_data: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          goal?: string | null
          level?: string | null
          frequency?: number | null
          days: Json
          is_template?: boolean | null
          is_public?: boolean | null
          periodization_type?: string | null
          mesocycle_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          goal?: string | null
          level?: string | null
          frequency?: number | null
          days?: Json
          is_template?: boolean | null
          is_public?: boolean | null
          periodization_type?: string | null
          mesocycle_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          day_id: string | null
          date: string
          start_time: string | null
          end_time: string | null
          duration: number | null
          exercises: Json
          notes: string | null
          rating: number | null
          fatigue_level: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          day_id?: string | null
          date: string
          start_time?: string | null
          end_time?: string | null
          duration?: number | null
          exercises: Json
          notes?: string | null
          rating?: number | null
          fatigue_level?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          day_id?: string | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          duration?: number | null
          exercises?: Json
          notes?: string | null
          rating?: number | null
          fatigue_level?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      food_database: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber: number | null
          sugar: number | null
          sodium: number | null
          cholesterol: number | null
          is_spanish_product: boolean | null
          region: string | null
          supermarket: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category?: string | null
          serving_size: number
          serving_unit: string
          calories: number
          protein: number
          carbs: number
          fat: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          cholesterol?: number | null
          is_spanish_product?: boolean | null
          region?: string | null
          supermarket?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category?: string | null
          serving_size?: number
          serving_unit?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          fiber?: number | null
          sugar?: number | null
          sodium?: number | null
          cholesterol?: number | null
          is_spanish_product?: boolean | null
          region?: string | null
          supermarket?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
