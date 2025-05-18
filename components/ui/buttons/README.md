# Componentes de Botones

Esta carpeta contiene una colección completa de componentes de botones para la aplicación Routinize Wellness.

## Componentes Disponibles

### Botones Básicos

- `Button`: El componente de botón básico de Shadcn UI.
- `ImprovedButton`: Un botón mejorado con efectos, animaciones y más opciones.
- `IconButton`: Un botón específico para iconos con tooltip y badge.
- `LoadingButton`: Un botón con estados de carga, éxito y error.

### Botones Especiales

- `FabButton`: Un botón flotante (Floating Action Button) con opciones de menú.
- `QuickActionButton`: Un botón de acción rápida con icono y etiqueta.
- `ButtonGroup`: Un grupo de botones conectados.
- `SegmentedButton`: Un botón segmentado con opciones seleccionables.

## Uso Básico

```tsx
import { ImprovedButton } from "@/components/ui/buttons";

export default function MyComponent() {
  return (
    <ImprovedButton variant="primary" withEffect="scale">
      Botón Mejorado
    </ImprovedButton>
  );
}
```

## Variantes de Botones

Todos los botones admiten las siguientes variantes:

- `default`: Estilo predeterminado (primario)
- `destructive`: Para acciones destructivas
- `outline`: Con borde y fondo transparente
- `secondary`: Estilo secundario
- `ghost`: Sin fondo ni borde
- `link`: Estilo de enlace

Además, los botones mejorados admiten estas variantes adicionales:

- `primary`: Color principal de la app (#FDA758)
- `green`: Color verde de la app (#5DE292)
- `purple`: Color púrpura de la app (#8C80F8)
- `pink`: Color rosa de la app (#FF7285)
- `blue`: Color azul de la app (#5CC2FF)
- `gradient`: Gradiente del color primario
- `subtle`: Versión sutil del color primario
- `success`: Verde para acciones exitosas
- `warning`: Ámbar para advertencias
- `info`: Azul para información

## Efectos de Botones

Los botones mejorados admiten los siguientes efectos:

- `scale`: Efecto de escala al hacer hover y click
- `lift`: Efecto de elevación al hacer hover
- `rotate`: Efecto de rotación al hacer hover
- `pulse`: Efecto de pulso al hacer hover
- `none`: Sin efecto

```tsx
<ImprovedButton withEffect="lift" variant="primary">
  Botón con Efecto
</ImprovedButton>
```

## Botones con Iconos

```tsx
import { ImprovedButton } from "@/components/ui/buttons";
import { Heart } from "lucide-react";

// Icono a la izquierda
<ImprovedButton leftIcon={<Heart />}>
  Me gusta
</ImprovedButton>

// Icono a la derecha
<ImprovedButton rightIcon={<ChevronRight />}>
  Ver más
</ImprovedButton>

// Solo icono
<IconButton 
  icon={<Heart />} 
  variant="primary" 
  tooltip="Me gusta"
/>
```

## Botones de Carga

```tsx
import { LoadingButton } from "@/components/ui/buttons";

// Botón con estado de carga
<LoadingButton 
  isLoading={isLoading} 
  onClick={handleClick}
>
  Guardar
</LoadingButton>

// Botón con texto de carga
<LoadingButton 
  isLoading={isLoading} 
  loadingText="Guardando..." 
  onClick={handleClick}
>
  Guardar
</LoadingButton>

// Botón con progreso
<LoadingButton 
  status={status} 
  loadingVariant="progress"
  progressValue={progress}
  onClick={handleClick}
>
  Subir Archivo
</LoadingButton>
```

## Botones Flotantes (FAB)

```tsx
import { FabButton } from "@/components/ui/buttons";
import { Plus, Edit, Trash } from "lucide-react";

// FAB básico
<FabButton 
  icon={<Plus />} 
  position="bottom-right" 
  variant="primary"
/>

// FAB con etiqueta
<FabButton 
  icon={<Plus />} 
  label="Crear" 
  showLabel 
  position="bottom-right" 
  variant="primary"
/>

// FAB con menú
<FabButton 
  icon={<Plus />} 
  position="bottom-right" 
  variant="primary"
  withMenu
  menuItems={[
    { icon: <Edit />, label: "Editar", onClick: handleEdit },
    { icon: <Trash />, label: "Eliminar", onClick: handleDelete }
  ]}
/>
```

## Botones de Acción Rápida

```tsx
import { QuickActionButton } from "@/components/ui/buttons";
import { Home, Bell } from "lucide-react";

<QuickActionButton 
  icon={<Home />} 
  label="Inicio" 
  variant="primary"
/>

<QuickActionButton 
  icon={<Bell />} 
  label="Notificaciones" 
  variant="primary"
  badge={3}
/>
```

## Grupos de Botones

```tsx
import { ButtonGroup, Button } from "@/components/ui/buttons";

<ButtonGroup>
  <Button variant="outline">Día</Button>
  <Button variant="outline">Semana</Button>
  <Button variant="outline">Mes</Button>
</ButtonGroup>

<ButtonGroup variant="pills">
  <Button variant="ghost" className={active === "day" ? "active" : ""}>Día</Button>
  <Button variant="ghost" className={active === "week" ? "active" : ""}>Semana</Button>
  <Button variant="ghost" className={active === "month" ? "active" : ""}>Mes</Button>
</ButtonGroup>
```

## Botones Segmentados

```tsx
import { SegmentedButton } from "@/components/ui/buttons";

<SegmentedButton 
  options={[
    { value: "day", label: "Día" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" }
  ]}
  value={value}
  onChange={setValue}
/>

<SegmentedButton 
  options={[
    { value: "day", label: "Día", icon: <Calendar /> },
    { value: "week", label: "Semana", icon: <Calendar /> },
    { value: "month", label: "Mes", icon: <Calendar /> }
  ]}
  value={value}
  onChange={setValue}
  variant="primary"
  shape="rounded"
/>
```

## Demostración

Puedes ver todos los componentes de botones en acción en la página de demostración:

```
/ui/buttons
```

## Actualización de Botones Existentes

Para actualizar los botones existentes en la aplicación, puedes usar el script:

```bash
node scripts/update-buttons.js
```

Este script buscará todos los archivos `.tsx` y `.jsx` en la aplicación y actualizará los botones existentes para usar los nuevos componentes de botones mejorados.
