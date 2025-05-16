"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutinizeLayout } from "@/components/routinize-layout";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addHours } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Save, Moon, Sun, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PulseLoader } from "@/components/ui/enhanced-skeletons";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase-client";
import { v4 as uuidv4 } from "uuid";

// Tipos
interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LogSleepPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [bedTime, setBedTime] = useState<Date>(new Date(new Date().setHours(22, 0, 0, 0)));
  const [wakeTime, setWakeTime] = useState<Date>(new Date(new Date().setHours(6, 0, 0, 0)));
  const [quality, setQuality] = useState<number>(7);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Calcular duración del sueño en horas
  const calculateDuration = (): number => {
    const bedTimeMs = bedTime.getTime();
    const wakeTimeMs = wakeTime.getTime();
    
    // Si la hora de despertar es anterior a la hora de acostarse, asumimos que es del día siguiente
    let durationMs = wakeTimeMs - bedTimeMs;
    if (durationMs < 0) {
      durationMs += 24 * 60 * 60 * 1000; // Añadir 24 horas
    }
    
    return Math.round((durationMs / (60 * 60 * 1000)) * 10) / 10; // Redondear a 1 decimal
  };

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/welcome");
    }
  }, [user, authLoading, router]);

  // Guardar registro de sueño
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const newSleepLog: SleepLog = {
      id: uuidv4(),
      userId: user.id,
      date: date.toISOString().split('T')[0],
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      duration: calculateDuration(),
      quality,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('sleep_logs')
        .insert({
          id: newSleepLog.id,
          user_id: newSleepLog.userId,
          date: newSleepLog.date,
          bed_time: newSleepLog.bedTime,
          wake_time: newSleepLog.wakeTime,
          duration: newSleepLog.duration,
          quality: newSleepLog.quality,
          notes: newSleepLog.notes,
          created_at: newSleepLog.createdAt,
          updated_at: newSleepLog.updatedAt
        });
      
      if (error) {
        console.error("Error al guardar registro de sueño:", error);
        throw error;
      }
      
      toast({
        title: "Registro guardado",
        description: "Tu registro de sueño se ha guardado correctamente",
      });
      
      // Redirigir a la página de sueño
      setTimeout(() => {
        router.push("/sleep");
      }, 500);
    } catch (error: any) {
      console.error("Error al guardar registro de sueño:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el registro de sueño",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <RoutinizeLayout activeTab="sleep" title="Registrar sueño">
        <div className="container mx-auto p-4 pb-20 flex items-center justify-center min-h-[80vh]">
          <PulseLoader message="Cargando..." />
        </div>
      </RoutinizeLayout>
    );
  }

  return (
    <RoutinizeLayout activeTab="sleep" title="Registrar sueño">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Registrar sueño</h1>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de acostarse</Label>
                <div className="flex items-center">
                  <Moon className="h-5 w-5 mr-2 text-blue-500" />
                  <Select 
                    value={bedTime.getHours().toString().padStart(2, '0')} 
                    onValueChange={(value) => {
                      const newBedTime = new Date(bedTime);
                      newBedTime.setHours(parseInt(value));
                      setBedTime(newBedTime);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="mx-1">:</span>
                  <Select 
                    value={bedTime.getMinutes().toString().padStart(2, '0')} 
                    onValueChange={(value) => {
                      const newBedTime = new Date(bedTime);
                      newBedTime.setMinutes(parseInt(value));
                      setBedTime(newBedTime);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                        <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                          {min.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Hora de despertar</Label>
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                  <Select 
                    value={wakeTime.getHours().toString().padStart(2, '0')} 
                    onValueChange={(value) => {
                      const newWakeTime = new Date(wakeTime);
                      newWakeTime.setHours(parseInt(value));
                      setWakeTime(newWakeTime);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="mx-1">:</span>
                  <Select 
                    value={wakeTime.getMinutes().toString().padStart(2, '0')} 
                    onValueChange={(value) => {
                      const newWakeTime = new Date(wakeTime);
                      newWakeTime.setMinutes(parseInt(value));
                      setWakeTime(newWakeTime);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
                        <SelectItem key={min} value={min.toString().padStart(2, '0')}>
                          {min.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Duración del sueño</Label>
                <span className="text-sm font-medium">{calculateDuration()} horas</span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-md">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <span>Te acostaste a las {format(bedTime, "HH:mm")} y te despertaste a las {format(wakeTime, "HH:mm")}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Calidad del sueño</Label>
                <span className="text-sm font-medium">{quality}/10</span>
              </div>
              <Slider
                value={[quality]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setQuality(value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Mala</span>
                <span>Excelente</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Cómo te sentiste al despertar? ¿Algún factor que afectó tu sueño?"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push("/sleep")}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar registro
              </>
            )}
          </Button>
        </div>
      </div>
    </RoutinizeLayout>
  );
}
