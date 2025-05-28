/**
 * Tipos para el onboarding de principiantes absolutos en fitness
 */

// Motivación principal para comenzar
export type BeginnerMotivation = 
  | 'energy' // Para sentirme con más energía en mi día a día
  | 'health' // Para mejorar mi salud general
  | 'appearance' // Para verme mejor físicamente
  | 'new_experience' // Para probar algo nuevo y diferente
  | 'stress_reduction'; // Para reducir el estrés

// Tiempo disponible para ejercicio
export type AvailableTime = 
  | '10-15' // 10-15 minutos
  | '20-30' // 20-30 minutos
  | '30-45' // 30-45 minutos
  | 'variable'; // Varía según el día

// Limitaciones físicas
export type PhysicalLimitation = 
  | 'none' // Ninguna
  | 'knees' // Rodillas
  | 'lower_back' // Espalda baja
  | 'upper_back' // Espalda alta
  | 'shoulders' // Hombros
  | 'wrists' // Muñecas
  | 'ankles' // Tobillos
  | 'medical_condition' // Condición médica diagnosticada
  | 'unsure'; // No estoy seguro/prefiero no decirlo

// Lugar de ejercicio
export type ExerciseLocation = 
  | 'home_no_equipment' // En casa sin equipamiento
  | 'home_basic_equipment' // En casa con equipamiento básico
  | 'gym' // En un gimnasio
  | 'outdoors' // Al aire libre
  | 'mixed'; // Combinación de lugares

// Equipamiento básico disponible
export type BasicEquipment = 
  | 'dumbbells' // Mancuernas
  | 'resistance_bands' // Bandas elásticas
  | 'mat' // Esterilla
  | 'bench' // Banco
  | 'pull_up_bar' // Barra de dominadas
  | 'kettlebell' // Pesa rusa
  | 'jump_rope'; // Cuerda para saltar

// Sentimiento inicial
export type InitialFeeling = 
  | 'excited_nervous' // Emocionado pero un poco nervioso
  | 'motivated_ready' // Motivado y listo para empezar
  | 'skeptical_willing' // Escéptico pero dispuesto a intentarlo
  | 'overwhelmed'; // Abrumado, necesito que sea muy simple

// Misiones de onboarding
export type OnboardingMission = 
  | 'explore_sections' // Explorar cada sección principal
  | 'complete_mini_routine' // Completar primera mini-rutina
  | 'log_meal' // Registrar primera comida
  | 'set_goal'; // Establecer primer objetivo

// Pantallas de onboarding
export type OnboardingScreen = 
  | 'welcome' // Pantalla de bienvenida
  | 'navigation' // Pantalla de navegación
  | 'training' // Pantalla de entrenamiento
  | 'nutrition' // Pantalla de nutrición
  | 'tracking' // Pantalla de seguimiento
  | 'questionnaire' // Cuestionario inicial
  | 'complete'; // Onboarding completado

// Interfaz para el perfil de principiante
export interface BeginnerProfile {
  user_id: string;
  motivation: BeginnerMotivation;
  available_time: AvailableTime;
  physical_limitations: PhysicalLimitation[];
  exercise_location: ExerciseLocation[];
  basic_equipment?: BasicEquipment[];
  initial_feeling: InitialFeeling;
  onboarding_completed: boolean;
  missions_completed: OnboardingMission[];
  created_at: string;
  updated_at: string;
}

// Interfaz para el estado del onboarding
export interface BeginnerOnboardingState {
  currentScreen: OnboardingScreen;
  profile: Partial<BeginnerProfile>;
  sectionsVisited: number;
  missionsCompleted: OnboardingMission[];
}

// Interfaz para las pantallas de onboarding
export interface OnboardingScreenContent {
  title: string;
  subtitle: string;
  imageSrc: string;
  missionText?: string;
  ctaText?: string;
  ctaAction?: () => void;
}

// Interfaz para las preguntas del cuestionario
export interface QuestionnaireQuestion {
  id: string;
  question: string;
  explanation: string;
  type: 'single' | 'multiple';
  options: {
    value: string;
    label: string;
    subOptions?: {
      value: string;
      label: string;
    }[];
  }[];
}

// Interfaz para los datos del cuestionario
export interface QuestionnaireData {
  motivation: BeginnerMotivation;
  availableTime: AvailableTime;
  physicalLimitations: PhysicalLimitation[];
  exerciseLocation: ExerciseLocation[];
  basicEquipment?: BasicEquipment[];
  initialFeeling: InitialFeeling;
}
