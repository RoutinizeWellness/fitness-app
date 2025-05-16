"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { User } from "@supabase/supabase-js"
import * as supabaseLib from "@/lib/supabase"
import { supabase } from "@/lib/supabase-client"
import { signInWithGoogle as googleSignIn } from "@/lib/google-auth"
import { setupAdminProfessionalProfiles } from "@/lib/admin-service"

// Tipo para el perfil de usuario
interface UserProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string | null
  weight?: number | null
  height?: number | null
  goal?: string | null
  level?: string
  is_admin?: boolean
  created_at: string
  updated_at?: string
}

type AuthContextType = {
  user: any
  profile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función para crear un perfil simulado
const createMockProfile = (userId: string): UserProfile => {
  return {
    id: `mock-${userId.substring(0, 8)}`,
    user_id: userId,
    full_name: "Usuario Demo",
    avatar_url: null,
    weight: 70,
    height: 175,
    goal: "Mantenerme en forma",
    level: "Intermedio",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Cargar usuario actual al iniciar
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const { user: currentUser, error } = await supabaseLib.getCurrentUser()

        if (currentUser) {
          setUser(currentUser)

          // Cargar el perfil del usuario
          try {
            // Intentar obtener el perfil del usuario
            const { data: userProfile } = await supabaseLib.getUserProfile(currentUser.id)

            // Si se obtuvo un perfil, establecerlo
            if (userProfile) {
              setProfile(userProfile)
              // Verificar si el usuario es administrador
              const isAdminUser = userProfile.is_admin === true
              setIsAdmin(isAdminUser)

              // Si es administrador, configurar perfiles profesionales
              if (isAdminUser) {
                setupAdminProfessionalProfiles(currentUser.id)
                  .then(result => {
                    if (result.success) {
                      console.log("Perfiles profesionales del administrador configurados correctamente")
                    } else {
                      console.error("Error al configurar perfiles profesionales del administrador:", result.error)
                    }
                  })
                  .catch(error => {
                    console.error("Error al configurar perfiles profesionales del administrador:", error)
                  })
              }
            } else {
              // Si no hay perfil, crear uno simulado
              const mockProfile = createMockProfile(currentUser.id)
              setProfile(mockProfile)
              setIsAdmin(false)
            }
          } catch (error) {
            // En caso de cualquier error, usar un perfil simulado sin mostrar el error
            const mockProfile = createMockProfile(currentUser.id)
            setProfile(mockProfile)
            setIsAdmin(false)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error)
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabaseLib.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        // Cargar el perfil del usuario
        try {
          // Intentar obtener el perfil del usuario
          const { data: userProfile } = await supabaseLib.getUserProfile(session.user.id)

          // Si se obtuvo un perfil, establecerlo
          if (userProfile) {
            setProfile(userProfile)
            // Verificar si el usuario es administrador
            const isAdminUser = userProfile.is_admin === true
            setIsAdmin(isAdminUser)

            // Si es administrador, configurar perfiles profesionales
            if (isAdminUser) {
              setupAdminProfessionalProfiles(session.user.id)
                .then(result => {
                  if (result.success) {
                    console.log("Perfiles profesionales del administrador configurados correctamente")
                  } else {
                    console.error("Error al configurar perfiles profesionales del administrador:", result.error)
                  }
                })
                .catch(error => {
                  console.error("Error al configurar perfiles profesionales del administrador:", error)
                })
            }
          } else {
            // Si no hay perfil, crear uno simulado
            const mockProfile = createMockProfile(session.user.id)
            setProfile(mockProfile)
            setIsAdmin(false)
          }
        } catch (error) {
          // En caso de cualquier error, usar un perfil simulado sin mostrar el error
          const mockProfile = createMockProfile(session.user.id)
          setProfile(mockProfile)
          setIsAdmin(false)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Refrescar perfil de usuario
  const refreshProfile = async () => {
    if (!user) return

    try {
      // Intentar obtener el perfil del usuario
      const { data: userProfile } = await supabaseLib.getUserProfile(user.id)

      // Si se obtuvo un perfil, establecerlo
      if (userProfile) {
        setProfile(userProfile)
      } else if (profile) {
        // Si no hay perfil pero ya teníamos uno, actualizarlo
        setProfile({
          ...profile,
          updated_at: new Date().toISOString()
        })
      } else {
        // Si no hay perfil ni teníamos uno, crear uno simulado
        const mockProfile = createMockProfile(user.id)
        setProfile(mockProfile)
      }
    } catch (error) {
      // En caso de error, si ya teníamos un perfil, actualizarlo
      if (profile) {
        setProfile({
          ...profile,
          updated_at: new Date().toISOString()
        })
      } else {
        // Si no teníamos perfil, crear uno simulado
        const mockProfile = createMockProfile(user.id)
        setProfile(mockProfile)
      }
    }
  }

  // Registrar usuario
  const handleSignUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { user: signedUpUser, error } = await supabaseLib.signUpWithEmail(email, password)

      if (error) {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registro exitoso",
          description: "Por favor, verifica tu correo electrónico para confirmar tu cuenta.",
        })
      }

      return { data: { user: signedUpUser }, error }
    } catch (error) {
      console.error("Error en signUp:", error)
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  // Iniciar sesión con Google
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true)

      // Usar la implementación directa de google-auth.ts
      const { data, error } = await googleSignIn()

      if (error) {
        toast({
          title: "Error al iniciar sesión con Google",
          description: error.message,
          variant: "destructive",
        })
      }

      return { data, error }
    } catch (error) {
      console.error("Error en signInWithGoogle:", error)
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  // Iniciar sesión
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log("Iniciando sesión con:", email)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de autenticación:", error)
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        })
        return { data: null, error }
      }

      const signedInUser = data?.user
      const session = data?.session

      if (signedInUser) {
        console.log("Autenticación exitosa:", signedInUser)
        toast({
          title: "Bienvenido de nuevo",
          description: "Has iniciado sesión correctamente.",
        })

        // Establecer el usuario inmediatamente
        setUser(signedInUser)
        let userIsAdmin = false;

        // Cargar el perfil del usuario
        try {
          // Intentar obtener el perfil del usuario
          const { data: userProfile } = await supabaseLib.getUserProfile(signedInUser.id)

          if (userProfile) {
            // Si se obtuvo un perfil, establecerlo
            setProfile(userProfile)

            // Verificar si el usuario es administrador
            userIsAdmin = userProfile.is_admin === true
            setIsAdmin(userIsAdmin)

            // Si es administrador, configurar perfiles profesionales
            if (userIsAdmin) {
              setupAdminProfessionalProfiles(signedInUser.id)
                .then(result => {
                  if (result.success) {
                    console.log("Perfiles profesionales del administrador configurados correctamente")
                  } else {
                    console.error("Error al configurar perfiles profesionales del administrador:", result.error)
                  }
                })
                .catch(error => {
                  console.error("Error al configurar perfiles profesionales del administrador:", error)
                })
            }
          } else {
            try {
              // Si no hay perfil, intentar crear uno nuevo
              const { data: newProfile } = await supabaseLib.createUserProfile({
                user_id: signedInUser.id,
                full_name: "Usuario",
                level: "Principiante",
              })

              if (newProfile && Array.isArray(newProfile) && newProfile.length > 0) {
                // Si se creó correctamente, usar el primer perfil del array
                setProfile(newProfile[0])
              } else if (newProfile && !Array.isArray(newProfile)) {
                // Si se devolvió un objeto en lugar de un array
                setProfile(newProfile)
              } else {
                // Si no se pudo crear, usar uno simulado
                const mockProfile = createMockProfile(signedInUser.id)
                setProfile(mockProfile)
              }
            } catch (createError) {
              // Si hay error al crear, usar uno simulado
              const mockProfile = createMockProfile(signedInUser.id)
              setProfile(mockProfile)
            }
          }
        } catch (error) {
          // En caso de cualquier error, usar un perfil simulado
          const mockProfile = createMockProfile(signedInUser.id)
          setProfile(mockProfile)
        }

        // No redirigimos aquí, dejamos que la página de login maneje la redirección
        console.log("Autenticación completada, la redirección la manejará la página de login")
      }

      return { data: { user: signedInUser, session }, error }
    } catch (error) {
      console.error("Error en signIn:", error)
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabaseLib.signOut()

      if (error) {
        toast({
          title: "Error al cerrar sesión",
          description: error.message,
          variant: "destructive",
        })
      } else {
        router.push("/auth/login")
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente.",
        })
      }

      return { error }
    } catch (error) {
      console.error("Error en signOut:", error)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
