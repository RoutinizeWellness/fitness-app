"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FOOD_CATEGORIES, SUPERMARKETS } from "@/lib/data/spanish-foods-database"
import { Loader2 } from "lucide-react"

// Esquema de validación para el formulario
const foodFormSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  servingSize: z.coerce.number().min(0, {
    message: "El tamaño de la porción debe ser un número positivo",
  }),
  servingUnit: z.string().min(1, {
    message: "La unidad de la porción es obligatoria",
  }),
  calories: z.coerce.number().min(0, {
    message: "Las calorías deben ser un número positivo",
  }),
  protein: z.coerce.number().min(0, {
    message: "Las proteínas deben ser un número positivo",
  }),
  carbs: z.coerce.number().min(0, {
    message: "Los carbohidratos deben ser un número positivo",
  }),
  fat: z.coerce.number().min(0, {
    message: "Las grasas deben ser un número positivo",
  }),
  fiber: z.coerce.number().min(0, {
    message: "La fibra debe ser un número positivo",
  }).optional(),
  sugar: z.coerce.number().min(0, {
    message: "El azúcar debe ser un número positivo",
  }).optional(),
  category: z.string({
    required_error: "La categoría es obligatoria",
  }),
  supermarket: z.string().optional(),
  brand: z.string().optional(),
  region: z.string().optional(),
  description: z.string().optional(),
  isVerified: z.boolean().default(false),
  alternativeFoods: z.string().optional(),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

interface AddFoodFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AddFoodForm({ onSuccess, className }: AddFoodFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valores por defecto para el formulario
  const defaultValues: Partial<FoodFormValues> = {
    servingSize: 100,
    servingUnit: "g",
    fiber: 0,
    sugar: 0,
    isVerified: true,
  };

  // Inicializar formulario
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues,
  });

  // Manejar envío del formulario
  const onSubmit = async (data: FoodFormValues) => {
    setIsSubmitting(true);

    try {
      // Preparar datos para enviar a la API
      const foodData = {
        id: `es-custom-${uuidv4().slice(0, 8)}`, // Generar ID único
        ...data,
        // Convertir string de alimentos alternativos a array
        alternative_foods: data.alternativeFoods
          ? data.alternativeFoods.split(',').map(id => id.trim())
          : undefined,
        is_verified: data.isVerified
      };

      // Enviar datos a la API
      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token' // Esto debería ser un token real en producción
        },
        body: JSON.stringify(foodData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el alimento');
      }

      const responseData = await response.json();

      // Mostrar mensaje de éxito
      toast({
        title: "Alimento guardado",
        description: `El alimento "${data.name}" ha sido guardado correctamente.`,
      });

      // Resetear formulario
      form.reset(defaultValues);

      // Llamar a callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar alimento:', error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Añadir Nuevo Alimento</CardTitle>
        <CardDescription>
          Añade un nuevo alimento a la base de datos. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Manzana Fuji" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(FOOD_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tamaño de porción */}
              <FormField
                control={form.control}
                name="servingSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño de porción *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unidad de porción */}
              <FormField
                control={form.control}
                name="servingUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">Gramos (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="unidad">Unidad</SelectItem>
                        <SelectItem value="porción">Porción</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información nutricional */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Información Nutricional (por porción)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Calorías */}
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calorías (kcal) *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Proteínas */}
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proteínas (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Carbohidratos */}
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohidratos (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grasas */}
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grasas (g) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fibra */}
                <FormField
                  control={form.control}
                  name="fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fibra (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Azúcar */}
                <FormField
                  control={form.control}
                  name="sugar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Azúcar (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Información Adicional (opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supermercado */}
                <FormField
                  control={form.control}
                  name="supermarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supermercado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un supermercado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Ninguno</SelectItem>
                          {Object.entries(SUPERMARKETS).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Marca */}
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Hacendado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Región */}
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Región</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Andalucía" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alimentos alternativos */}
                <FormField
                  control={form.control}
                  name="alternativeFoods"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alimentos alternativos</FormLabel>
                      <FormControl>
                        <Input placeholder="IDs separados por comas" {...field} />
                      </FormControl>
                      <FormDescription>
                        IDs de alimentos alternativos, separados por comas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del alimento"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Verificado */}
                <FormField
                  control={form.control}
                  name="isVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Verificado</FormLabel>
                        <FormDescription>
                          Marcar si la información nutricional ha sido verificada
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Alimento
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
