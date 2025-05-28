# Asistente de IA para Routinize

Este documento describe la implementación del asistente de IA mejorado para la aplicación Routinize, utilizando OpenAI para proporcionar respuestas personalizadas a los usuarios.

## Descripción General

El asistente de IA de Routinize es un chatbot inteligente que ayuda a los usuarios a navegar por la aplicación, responder preguntas y proporcionar recomendaciones personalizadas. Utiliza la API de OpenAI para generar respuestas contextuales y mantiene un historial de conversación para proporcionar una experiencia coherente.

## Componentes Principales

### 1. Servicio de Asistente de IA

El servicio `AIAssistantService` gestiona la comunicación con la API de OpenAI y mantiene el contexto de la conversación. Sus principales características son:

- Gestión del historial de conversación
- Almacenamiento del contexto del usuario
- Comunicación con la API de OpenAI
- Persistencia del historial en Supabase

**Ubicación**: `./lib/services/ai-assistant-service.ts`

### 2. Endpoint de API

El endpoint de API `assistant` maneja las solicitudes al asistente de IA y devuelve las respuestas al cliente. Sus principales características son:

- Autenticación de usuarios
- Enriquecimiento del contexto con datos del usuario
- Comunicación con OpenAI
- Procesamiento de respuestas

**Ubicación**: `./app/api/assistant/route.ts`

### 3. Componente de Interfaz de Usuario

El componente `AIAssistantEnhanced` proporciona la interfaz de usuario para interactuar con el asistente. Sus principales características son:

- Interfaz de chat con mensajes del usuario y del asistente
- Sugerencias de mensajes
- Acciones recomendadas
- Persistencia del historial de conversación

**Ubicación**: `./components/ai-assistant-enhanced.tsx`

## Flujo de Datos

1. El usuario envía un mensaje a través del componente `AIAssistantEnhanced`
2. El componente llama al servicio `AIAssistantService`
3. El servicio envía una solicitud al endpoint de API `assistant`
4. El endpoint enriquece el contexto con datos del usuario y envía una solicitud a OpenAI
5. OpenAI genera una respuesta basada en el contexto y el historial
6. El endpoint procesa la respuesta y la devuelve al servicio
7. El servicio actualiza el historial de conversación y devuelve la respuesta al componente
8. El componente muestra la respuesta al usuario

## Personalización del Asistente

El asistente se personaliza utilizando el contexto del usuario, que incluye:

- Información básica del usuario (nombre, ID)
- Módulo actual de la aplicación
- Nivel de entrenamiento
- Preferencias dietéticas
- Objetivos del usuario
- Datos recientes de entrenamiento, nutrición, sueño y bienestar

Este contexto se utiliza para generar respuestas más relevantes y personalizadas.

## Almacenamiento de Datos

El historial de conversación y el contexto del usuario se almacenan en Supabase en la tabla `conversation_history`. Esto permite que el asistente recuerde conversaciones anteriores y proporcione una experiencia coherente.

## Integración con la Aplicación

El asistente se integra en la aplicación de varias formas:

1. **Componente global**: El asistente está disponible en toda la aplicación a través del layout principal.
2. **Página de ayuda**: Una página dedicada que utiliza el asistente como principal fuente de ayuda.
3. **Contexto específico de módulo**: El asistente se adapta al módulo actual de la aplicación (entrenamiento, nutrición, etc.).

## Configuración de OpenAI

El asistente utiliza el modelo `gpt-3.5-turbo` de OpenAI con los siguientes parámetros:

- **Temperature**: 0.7 (equilibrio entre creatividad y coherencia)
- **Max tokens**: 500 (longitud máxima de respuesta)
- **Top p**: 1 (diversidad de respuestas)
- **Frequency penalty**: 0 (no penalizar repeticiones)
- **Presence penalty**: 0 (no penalizar temas nuevos)

## Seguridad y Privacidad

El asistente implementa varias medidas de seguridad:

1. **Autenticación**: Solo los usuarios autenticados pueden utilizar el asistente.
2. **Row Level Security**: Las políticas de RLS en Supabase garantizan que los usuarios solo puedan acceder a sus propios datos.
3. **Sanitización de entrada**: Las entradas del usuario se validan antes de procesarse.

## Próximos Pasos

Para mejorar el asistente en el futuro, se podrían implementar las siguientes características:

1. **Fine-tuning del modelo**: Entrenar el modelo con datos específicos de fitness y bienestar.
2. **Integración con funciones de la aplicación**: Permitir que el asistente realice acciones directamente (registrar entrenamientos, comidas, etc.).
3. **Análisis de sentimiento**: Detectar el estado de ánimo del usuario y adaptar las respuestas.
4. **Soporte multilingüe**: Añadir soporte para más idiomas.
5. **Integración con voz**: Permitir interacciones por voz con el asistente.

## Requisitos Técnicos

Para implementar el asistente, se necesitan los siguientes requisitos:

1. **API Key de OpenAI**: Necesaria para comunicarse con la API de OpenAI.
2. **Supabase**: Para almacenar el historial de conversación y el contexto del usuario.
3. **Next.js 13+**: Para el enrutamiento de API y la renderización del componente.
4. **React 18+**: Para la interfaz de usuario del asistente.

## Uso del Asistente

Para utilizar el asistente en un componente personalizado:

```tsx
import { AIAssistantEnhanced } from "@/components/ai-assistant-enhanced"

export default function MyComponent() {
  return (
    <div>
      <h1>Mi Componente</h1>
      <AIAssistantEnhanced 
        initialMessage="¿En qué puedo ayudarte con tu entrenamiento hoy?" 
        currentModule="training" 
      />
    </div>
  )
}
```

Para actualizar el contexto del asistente desde cualquier componente:

```tsx
import { aiAssistantService } from "@/lib/services/ai-assistant-service"

// Actualizar el contexto
aiAssistantService.updateContext({
  currentModule: "nutrition",
  dietPreferences: ["vegetarian", "low-carb"]
})
```
