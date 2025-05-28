"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedList } from "@/components/ui/animated-list"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/lib/contexts/auth-context"
import {
  Calendar,
  Edit,
  Save,
  Trash2,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  Smile,
  Frown,
  Meh,
  Heart,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipos de emociones disponibles
const EMOTIONS = [
  { value: "happy", label: "Feliz", icon: <Smile className="h-4 w-4 text-green-500" /> },
  { value: "sad", label: "Triste", icon: <Frown className="h-4 w-4 text-blue-500" /> },
  { value: "angry", label: "Enojado", icon: <ThumbsDown className="h-4 w-4 text-red-500" /> },
  { value: "anxious", label: "Ansioso", icon: <Meh className="h-4 w-4 text-yellow-500" /> },
  { value: "calm", label: "Tranquilo", icon: <Heart className="h-4 w-4 text-purple-500" /> },
  { value: "grateful", label: "Agradecido", icon: <ThumbsUp className="h-4 w-4 text-teal-500" /> },
  { value: "neutral", label: "Neutral", icon: <Meh className="h-4 w-4 text-gray-500" /> }
]

interface JournalEntry {
  id?: string
  user_id: string
  date: string
  title: string
  content: string
  emotion: string
  created_at?: string
}

export function EmotionalJournal() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Estado para el formulario de entrada
  const [currentEntry, setCurrentEntry] = useState<Omit<JournalEntry, "user_id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    title: "",
    content: "",
    emotion: "neutral"
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  // Cargar entradas del diario
  useEffect(() => {
    if (user) {
      loadJournalEntries()
    }
  }, [user])

  // Cargar entradas del diario desde Supabase
  const loadJournalEntries = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Crear tabla si no existe
      const { error: createError } = await supabase.rpc('create_emotional_journal_if_not_exists')

      if (createError) {
        console.error("Error creating table:", createError)
      }

      const { data, error } = await supabase
        .from("emotional_journal")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: sortOrder === "asc" })

      if (error) {
        throw error
      }

      setEntries(data || [])
    } catch (error) {
      console.error("Error loading journal entries:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las entradas del diario",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar entrada del diario
  const saveJournalEntry = async () => {
    if (!user) return

    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa el título y el contenido",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      const entryData = {
        user_id: user.id,
        ...currentEntry
      }

      let result

      if (editingId) {
        // Actualizar entrada existente
        result = await supabase
          .from("emotional_journal")
          .update(entryData)
          .eq("id", editingId)
          .eq("user_id", user.id)

        if (result.error) throw result.error

        toast({
          title: "Actualizado",
          description: "Tu entrada del diario ha sido actualizada correctamente",
        })
      } else {
        // Insertar nueva entrada
        result = await supabase
          .from("emotional_journal")
          .insert(entryData)

        if (result.error) throw result.error

        toast({
          title: "Guardado",
          description: "Tu entrada del diario ha sido guardada correctamente",
        })
      }

      // Recargar entradas y resetear formulario
      await loadJournalEntries()
      resetForm()
    } catch (error) {
      console.error("Error saving journal entry:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la entrada del diario",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Editar entrada existente
  const editEntry = (entry: JournalEntry) => {
    setCurrentEntry({
      date: entry.date,
      title: entry.title,
      content: entry.content,
      emotion: entry.emotion
    })
    setEditingId(entry.id)

    // Scroll al formulario
    document.getElementById("journal-form")?.scrollIntoView({ behavior: "smooth" })
  }

  // Eliminar entrada
  const deleteEntry = async (id: string) => {
    if (!user) return

    if (!confirm("¿Estás seguro de que deseas eliminar esta entrada?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("emotional_journal")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      // Recargar entradas
      await loadJournalEntries()

      // Si estábamos editando esta entrada, resetear el formulario
      if (editingId === id) {
        resetForm()
      }

      toast({
        title: "Eliminado",
        description: "La entrada del diario ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la entrada del diario",
        variant: "destructive"
      })
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      title: "",
      content: "",
      emotion: "neutral"
    })
    setEditingId(null)
  }

  // Filtrar entradas según término de búsqueda
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener icono de emoción
  const getEmotionIcon = (emotion: string) => {
    const found = EMOTIONS.find(e => e.value === emotion)
    return found ? found.icon : <Meh className="h-4 w-4 text-gray-500" />
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
  }

  return (
    <div className="space-y-6">
      {/* Formulario de entrada del diario */}
      <Card id="journal-form">
        <CardHeader>
          <CardTitle>{editingId ? "Editar entrada" : "Nueva entrada"}</CardTitle>
          <CardDescription>
            Registra tus pensamientos y emociones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-date">Fecha</Label>
              <Input
                id="entry-date"
                type="date"
                value={currentEntry.date}
                onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-emotion">¿Cómo te sientes?</Label>
              <Select
                value={currentEntry.emotion}
                onValueChange={(value) => setCurrentEntry({...currentEntry, emotion: value})}
              >
                <SelectTrigger id="entry-emotion">
                  <SelectValue placeholder="Selecciona una emoción" />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map((emotion) => (
                    <SelectItem key={emotion.value} value={emotion.value}>
                      <div className="flex items-center">
                        {emotion.icon}
                        <span className="ml-2">{emotion.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-title">Título</Label>
            <Input
              id="entry-title"
              placeholder="Título de tu entrada"
              value={currentEntry.title}
              onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-content">Contenido</Label>
            <Textarea
              id="entry-content"
              placeholder="Escribe tus pensamientos aquí..."
              rows={6}
              value={currentEntry.content}
              onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetForm}>
            {editingId ? "Cancelar" : "Limpiar"}
          </Button>

          <Button onClick={saveJournalEntry} disabled={isSaving}>
            {isSaving ? (
              <>
                <LoadingAnimation size="sm" type="spinner" showText={false} className="mr-2" />
                {editingId ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Lista de entradas del diario */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Mis entradas</CardTitle>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-full sm:w-[200px]"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadJournalEntries}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingAnimation />
            </div>
          ) : filteredEntries.length > 0 ? (
            <AnimatedList
              items={filteredEntries.map((entry) => (
                <AnimatedCard key={entry.id} className="border" hoverEffect="lift">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getEmotionIcon(entry.emotion)}
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editEntry(entry)}
                          aria-label="Editar entrada"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id!)}
                          aria-label="Eliminar entrada"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      <Calendar className="inline-block h-3 w-3 mr-1" />
                      {formatDate(entry.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{entry.content}</p>
                  </CardContent>
                </AnimatedCard>
              ))}
              animationType="stagger"
              staggerDelay={0.05}
              emptyState={
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No se encontraron entradas que coincidan con tu búsqueda.
                  </p>
                </div>
              }
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No hay entradas en tu diario emocional. ¡Comienza a registrar tus pensamientos y emociones!
              </p>
              <Button onClick={() => document.getElementById("journal-form")?.scrollIntoView({ behavior: "smooth" })}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera entrada
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
