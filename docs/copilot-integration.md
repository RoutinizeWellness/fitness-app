# Integración con Microsoft Copilot Studio

Este documento describe la integración de Microsoft Copilot Studio con nuestra aplicación de fitness.

## Descripción general

Microsoft Copilot Studio es una plataforma que permite crear asistentes virtuales personalizados sin necesidad de conocimientos de programación. En nuestra aplicación, utilizamos Microsoft Copilot Studio para proporcionar asistencia conversacional a los usuarios, ayudándoles con diversas tareas relacionadas con el fitness.

## Componentes de la integración

La integración consta de los siguientes componentes:

1. **Componente de chat (CopilotChat)**: Un componente de chat flotante que permite a los usuarios interactuar con el asistente virtual en cualquier parte de la aplicación.

2. **Servicio de Copilot (CopilotService)**: Un servicio que maneja la comunicación con Microsoft Copilot Studio, proporcionando respuestas contextuales basadas en el módulo actual y las preferencias del usuario.

3. **API de Copilot (api/copilot)**: Un endpoint de API que procesa las solicitudes al bot de Microsoft Copilot Studio y devuelve respuestas personalizadas.

4. **Página de demostración (copilot-demo)**: Una página de demostración que muestra las capacidades del asistente virtual.

## Configuración

Para configurar la integración con Microsoft Copilot Studio, sigue estos pasos:

1. Crea un bot en Microsoft Copilot Studio (https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio).

2. Configura las variables de entorno en tu archivo `.env.local`:

```
NEXT_PUBLIC_COPILOT_API_URL=https://tu-bot.api.powerva.microsoft.com
NEXT_PUBLIC_COPILOT_API_KEY=tu-api-key
```

3. Personaliza el bot según tus necesidades, añadiendo temas, entidades y flujos de conversación.

## Uso

El asistente virtual está disponible en toda la aplicación a través del botón flotante en la esquina inferior derecha. Los usuarios pueden interactuar con el asistente para:

- Obtener información sobre entrenamientos, nutrición, sueño y bienestar
- Recibir recomendaciones personalizadas
- Navegar a diferentes partes de la aplicación
- Registrar actividades y comidas
- Recibir motivación y consejos

## Personalización contextual

El asistente utiliza información contextual para proporcionar respuestas más relevantes:

- **Módulo actual**: El asistente adapta sus respuestas según el módulo en el que se encuentra el usuario (entrenamiento, nutrición, sueño, bienestar).
- **Perfil del usuario**: El asistente utiliza información del perfil del usuario, como su nivel de entrenamiento, preferencias dietéticas y objetivos.
- **Historial de conversación**: El asistente mantiene un historial de la conversación para proporcionar respuestas coherentes.

## Extensión

Para extender las capacidades del asistente virtual, puedes:

1. Añadir nuevos temas y entidades en Microsoft Copilot Studio.
2. Implementar nuevas funciones en el servicio de Copilot.
3. Enriquecer el contexto enviado a Microsoft Copilot Studio con más información del usuario y su actividad.

## Solución de problemas

Si encuentras problemas con la integración, verifica:

1. Que las variables de entorno estén correctamente configuradas.
2. Que el bot en Microsoft Copilot Studio esté activo y accesible.
3. Que la conexión a Internet esté funcionando correctamente.
4. Los registros de la consola para ver si hay errores específicos.

## Recursos

- [Documentación de Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [API de Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/developer/api-reference)
- [Mejores prácticas para diseñar bots conversacionales](https://learn.microsoft.com/en-us/microsoft-copilot-studio/design-bot-conversation)
