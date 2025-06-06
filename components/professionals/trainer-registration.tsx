"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Award, BadgeCheck, Calendar, Clock, Dumbbell, Info, Plus, Save, X } from "lucide-react"
import { Card3D, Card3DContent, Card3DHeader, Card3DTitle } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createTrainerProfile } from "@/lib/professional-service"
import { useAuth } from "@/lib/auth/auth-context"

// Esquema de validación para el formulario
const trainerFormSchema = z.object({
  specialties: z.array(z.string()).min(1, {
    message: "Selecciona al menos una especialidad",
  }),
  experienceYears: z.number().min(0, {
    message: "Los años de experiencia no pueden ser negativos",
  }),
  certifications: z.array(z.string()).optional(),
  bio: z.string().min(10, {
    message: "La biografía debe tener al menos 10 caracteres",
  }).max(500, {
    message: "La biografía no puede exceder los 500 caracteres",
  }),
  hourlyRate: z.number().min(0, {
    message: "La tarifa por hora no puede ser negativa",
  }),
  maxClients: z.number().min(1, {
    message: "Debes aceptar al menos 1 cliente",
  }).max(100, {
    message: "El número máximo de clientes no puede exceder 100",
  }),
  specializations: z.object({
    strengthTraining: z.boolean().optional(),
    hypertrophy: z.boolean().optional(),
    weightLoss: z.boolean().optional(),
    endurance: z.boolean().optional(),
    flexibility: z.boolean().optional(),
    rehabilitation: z.boolean().optional(),
    sports: z.array(z.string()).optional(),
    other: z.array(z.string()).optional(),
  }),
});

type TrainerFormValues = z.infer<typeof trainerFormSchema>;

export function TrainerRegistration() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCertification, setNewCertification] = useState("");
  const [newSport, setNewSport] = useState("");
  const [newOtherSpecialization, setNewOtherSpecialization] = useState("");

  // Valores por defecto del formulario
  const defaultValues: Partial<TrainerFormValues> = {
    specialties: [],
    experienceYears: 0,
    certifications: [],
    bio: "",
    hourlyRate: 0,
    maxClients: 20,
    specializations: {
      strengthTraining: false,
      hypertrophy: false,
      weightLoss: false,
      endurance: false,
      flexibility: false,
      rehabilitation: false,
      sports: [],
      other: [],
    },
  };

  const form = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues,
  });

  // Opciones de especialidades
  const specialtyOptions = [
    { value: "strength_training", label: "Entrenamiento de fuerza" },
    { value: "hypertrophy", label: "Hipertrofia" },
    { value: "weight_loss", label: "Pérdida de peso" },
    { value: "functional_training", label: "Entrenamiento funcional" },
    { value: "sports_specific", label: "Entrenamiento específico para deportes" },
    { value: "rehabilitation", label: "Rehabilitación" },
    { value: "senior_fitness", label: "Fitness para adultos mayores" },
    { value: "youth_fitness", label: "Fitness para jóvenes" },
    { value: "group_training", label: "Entrenamiento en grupo" },
    { value: "online_coaching", label: "Coaching online" },
  ];

  // Función para añadir certificación
  const addCertification = () => {
    if (!newCertification.trim()) return;

    const currentCertifications = form.getValues("certifications") || [];
    form.setValue("certifications", [...currentCertifications, newCertification]);
    setNewCertification("");
  };

  // Función para eliminar certificación
  const removeCertification = (index: number) => {
    const currentCertifications = form.getValues("certifications") || [];
    form.setValue("certifications", currentCertifications.filter((_, i) => i !== index));
  };

  // Función para añadir deporte
  const addSport = () => {
    if (!newSport.trim()) return;

    const currentSports = form.getValues("specializations.sports") || [];
    form.setValue("specializations.sports", [...currentSports, newSport]);
    setNewSport("");
  };

  // Función para eliminar deporte
  const removeSport = (index: number) => {
    const currentSports = form.getValues("specializations.sports") || [];
    form.setValue("specializations.sports", currentSports.filter((_, i) => i !== index));
  };

  // Función para añadir otra especialización
  const addOtherSpecialization = () => {
    if (!newOtherSpecialization.trim()) return;

    const currentOther = form.getValues("specializations.other") || [];
    form.setValue("specializations.other", [...currentOther, newOtherSpecialization]);
    setNewOtherSpecialization("");
  };

  // Función para eliminar otra especialización
  const removeOtherSpecialization = (index: number) => {
    const currentOther = form.getValues("specializations.other") || [];
    form.setValue("specializations.other", currentOther.filter((_, i) => i !== index));
  };

  // Función para enviar el formulario
  const onSubmit = async (data: TrainerFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrarte como entrenador",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: profile, error } = await createTrainerProfile({
        userId: user.id,
        specialties: data.specialties,
        experienceYears: data.experienceYears,
        certifications: data.certifications,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        maxClients: data.maxClients,
        isVerified: false, // Inicialmente no verificado
        specializations: data.specializations,
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Tu perfil de entrenador ha sido creado. Ahora puedes comenzar a gestionar clientes.",
      });

      // Redirigir al dashboard de entrenador
      router.push("/trainer-dashboard");
    } catch (error) {
      console.error("Error al registrar entrenador:", error);
      toast({
        title: "Error",
        description: "No se pudo completar el registro. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">Registro de Entrenador Personal</h2>
      </div>

      <Card3D>
        <Card3DHeader>
          <Card3DTitle>Información Profesional</Card3DTitle>
        </Card3DHeader>
        <Card3DContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidades</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {specialtyOptions.map((option) => (
                        <FormItem key={option.value} className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, option.value]);
                                } else {
                                  field.onChange(current.filter((value) => value !== option.value));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{option.label}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de experiencia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa por hora (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía profesional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu experiencia, enfoque y filosofía como entrenador..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Esta información será visible para potenciales clientes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Certificaciones</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Añadir certificación..."
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                  />
                  <Button3D type="button" onClick={addCertification}>
                    <Plus className="h-4 w-4" />
                  </Button3D>
                </div>
                <div className="space-y-2">
                  {form.watch("certifications")?.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-primary" />
                        <span>{cert}</span>
                      </div>
                      <Button3D
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCertification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button3D>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button3D type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Registrando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Completar registro
                    </>
                  )}
                </Button3D>
              </div>
            </form>
          </Form>
        </Card3DContent>
      </Card3D>
    </div>
  );
}
