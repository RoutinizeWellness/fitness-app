/**
 * Sistema de Retos y Comunidad
 * Basado en principios de gamificación, motivación y adherencia
 * Inspirado en documentos como "Cómo pasar de entrenador online a Emprendedor Fitness"
 */

import { v4 as uuidv4 } from "uuid";
import { TrainingLevel, TrainingGoal } from "./advanced-periodization";

// Tipos para el sistema de retos
export type ChallengeCategory = 
  | 'strength' 
  | 'hypertrophy' 
  | 'endurance' 
  | 'consistency' 
  | 'nutrition'
  | 'recovery'
  | 'skill'
  | 'transformation'
  | 'community';

export type ChallengeDifficulty = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'elite';

export type ChallengeStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'failed';

export type ChallengeFrequency = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'yearly' 
  | 'one_time';

export type CommunityRole = 
  | 'member' 
  | 'contributor' 
  | 'mentor' 
  | 'moderator' 
  | 'admin';

// Interfaces para el sistema de retos
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: number; // En días
  points: number;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  startDate?: string;
  endDate?: string;
  isGroupChallenge: boolean;
  maxParticipants?: number;
  frequency: ChallengeFrequency;
  tags: string[];
  imageUrl?: string;
}

export interface ChallengeRequirement {
  id: string;
  description: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'social' | 'metric';
  targetValue: number;
  unit?: string;
  frequency?: string; // Ej: "3 veces por semana"
  isRequired: boolean;
  verificationMethod: 'self_reported' | 'photo' | 'video' | 'data_tracking' | 'coach_verification';
}

export interface ChallengeReward {
  id: string;
  description: string;
  type: 'points' | 'badge' | 'achievement' | 'discount' | 'physical' | 'feature_unlock';
  value: number | string;
  imageUrl?: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  progress: number; // Porcentaje (0-100)
  startDate: string;
  completionDate?: string;
  requirementProgress: {
    requirementId: string;
    currentValue: number;
    isCompleted: boolean;
    evidence?: string; // URL a foto/video
  }[];
  notes?: string;
}

// Interfaces para el sistema de comunidad
export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  createdAt: string;
  createdBy: string;
  rules: string[];
  activeChallenges: string[]; // IDs de retos activos
  imageUrl?: string;
  coverImageUrl?: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  groupId: string;
  role: CommunityRole;
  joinedAt: string;
  contributionPoints: number;
  badges: string[];
  isActive: boolean;
  lastActive?: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  groupId?: string;
  content: string;
  mediaUrls?: string[];
  tags: string[];
  challengeId?: string;
  workoutId?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isPublic: boolean;
}

export interface SocialInteraction {
  id: string;
  type: 'like' | 'comment' | 'share' | 'mention' | 'follow';
  userId: string;
  targetId: string; // ID del post, comentario, usuario, etc.
  targetType: 'post' | 'comment' | 'user' | 'group' | 'challenge';
  content?: string; // Para comentarios
  createdAt: string;
}

// Biblioteca de retos predefinidos
export const PREDEFINED_CHALLENGES: Challenge[] = [
  {
    id: "challenge-001",
    title: "Reto de 30 días de entrenamiento",
    description: "Completa al menos 20 entrenamientos en 30 días para desarrollar el hábito de consistencia.",
    category: "consistency",
    difficulty: "beginner",
    duration: 30,
    points: 500,
    requirements: [
      {
        id: uuidv4(),
        description: "Completa al menos 20 entrenamientos",
        type: "workout",
        targetValue: 20,
        frequency: "Durante 30 días",
        isRequired: true,
        verificationMethod: "data_tracking"
      },
      {
        id: uuidv4(),
        description: "Comparte tu progreso semanalmente",
        type: "social",
        targetValue: 4,
        frequency: "Una vez por semana",
        isRequired: false,
        verificationMethod: "self_reported"
      }
    ],
    rewards: [
      {
        id: uuidv4(),
        description: "500 puntos de experiencia",
        type: "points",
        value: 500
      },
      {
        id: uuidv4(),
        description: "Insignia de Consistencia",
        type: "badge",
        value: "consistency_badge",
        imageUrl: "/badges/consistency.png"
      }
    ],
    isGroupChallenge: false,
    frequency: "monthly",
    tags: ["consistencia", "hábitos", "principiante"]
  },
  {
    id: "challenge-002",
    title: "Reto de Fuerza: 100kg en Press de Banca",
    description: "Alcanza un press de banca de 100kg (o tu peso corporal si pesas menos).",
    category: "strength",
    difficulty: "intermediate",
    duration: 90,
    points: 1000,
    requirements: [
      {
        id: uuidv4(),
        description: "Logra un press de banca de 100kg (o tu peso corporal)",
        type: "metric",
        targetValue: 100,
        unit: "kg",
        isRequired: true,
        verificationMethod: "video"
      },
      {
        id: uuidv4(),
        description: "Sigue el programa recomendado",
        type: "workout",
        targetValue: 24,
        frequency: "2 veces por semana",
        isRequired: false,
        verificationMethod: "data_tracking"
      }
    ],
    rewards: [
      {
        id: uuidv4(),
        description: "1000 puntos de experiencia",
        type: "points",
        value: 1000
      },
      {
        id: uuidv4(),
        description: "Insignia de Fuerza",
        type: "badge",
        value: "strength_badge",
        imageUrl: "/badges/strength.png"
      },
      {
        id: uuidv4(),
        description: "Acceso a programas avanzados de fuerza",
        type: "feature_unlock",
        value: "advanced_strength_programs"
      }
    ],
    isGroupChallenge: false,
    frequency: "one_time",
    tags: ["fuerza", "press de banca", "intermedio"]
  },
  {
    id: "challenge-003",
    title: "Transformación en 12 Semanas",
    description: "Transforma tu físico en 12 semanas siguiendo un programa estructurado de entrenamiento y nutrición.",
    category: "transformation",
    difficulty: "intermediate",
    duration: 84,
    points: 2000,
    requirements: [
      {
        id: uuidv4(),
        description: "Completa al menos 40 entrenamientos",
        type: "workout",
        targetValue: 40,
        frequency: "3-4 veces por semana",
        isRequired: true,
        verificationMethod: "data_tracking"
      },
      {
        id: uuidv4(),
        description: "Sigue el plan nutricional al menos al 80%",
        type: "nutrition",
        targetValue: 80,
        unit: "%",
        isRequired: true,
        verificationMethod: "self_reported"
      },
      {
        id: uuidv4(),
        description: "Fotos de antes y después",
        type: "social",
        targetValue: 1,
        isRequired: true,
        verificationMethod: "photo"
      }
    ],
    rewards: [
      {
        id: uuidv4(),
        description: "2000 puntos de experiencia",
        type: "points",
        value: 2000
      },
      {
        id: uuidv4(),
        description: "Insignia de Transformación",
        type: "badge",
        value: "transformation_badge",
        imageUrl: "/badges/transformation.png"
      },
      {
        id: uuidv4(),
        description: "Descuento del 20% en suplementos",
        type: "discount",
        value: "20% en suplementos"
      }
    ],
    isGroupChallenge: true,
    maxParticipants: 50,
    frequency: "quarterly",
    tags: ["transformación", "nutrición", "antes y después"]
  },
  {
    id: "challenge-004",
    title: "Reto de Comunidad: 10,000 Repeticiones",
    description: "Como comunidad, completar 10,000 repeticiones de un ejercicio elegido en un mes.",
    category: "community",
    difficulty: "beginner",
    duration: 30,
    points: 300,
    requirements: [
      {
        id: uuidv4(),
        description: "Contribuir al menos 200 repeticiones al total",
        type: "workout",
        targetValue: 200,
        isRequired: true,
        verificationMethod: "self_reported"
      },
      {
        id: uuidv4(),
        description: "Compartir al menos 2 videos de tus series",
        type: "social",
        targetValue: 2,
        isRequired: false,
        verificationMethod: "video"
      }
    ],
    rewards: [
      {
        id: uuidv4(),
        description: "300 puntos de experiencia",
        type: "points",
        value: 300
      },
      {
        id: uuidv4(),
        description: "Insignia de Comunidad",
        type: "badge",
        value: "community_badge",
        imageUrl: "/badges/community.png"
      }
    ],
    isGroupChallenge: true,
    maxParticipants: 100,
    frequency: "monthly",
    tags: ["comunidad", "volumen", "equipo"]
  },
  {
    id: "challenge-005",
    title: "Reto de Recuperación: 30 Días de Sueño Óptimo",
    description: "Mejora tu recuperación durmiendo al menos 7 horas cada noche durante 30 días.",
    category: "recovery",
    difficulty: "beginner",
    duration: 30,
    points: 400,
    requirements: [
      {
        id: uuidv4(),
        description: "Duerme al menos 7 horas cada noche",
        type: "recovery",
        targetValue: 25,
        unit: "días",
        frequency: "Diariamente",
        isRequired: true,
        verificationMethod: "self_reported"
      },
      {
        id: uuidv4(),
        description: "Implementa una rutina de relajación antes de dormir",
        type: "recovery",
        targetValue: 20,
        unit: "días",
        isRequired: false,
        verificationMethod: "self_reported"
      }
    ],
    rewards: [
      {
        id: uuidv4(),
        description: "400 puntos de experiencia",
        type: "points",
        value: 400
      },
      {
        id: uuidv4(),
        description: "Insignia de Recuperación",
        type: "badge",
        value: "recovery_badge",
        imageUrl: "/badges/recovery.png"
      }
    ],
    isGroupChallenge: false,
    frequency: "monthly",
    tags: ["recuperación", "sueño", "bienestar"]
  }
];

// Grupos de comunidad predefinidos
export const PREDEFINED_COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: "group-001",
    name: "Principiantes en el Fitness",
    description: "Grupo para personas que están comenzando su viaje fitness. Comparte tus dudas, progresos y motivación.",
    category: "beginner",
    memberCount: 0,
    isPrivate: false,
    requiresApproval: false,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    rules: [
      "Sé respetuoso con todos los miembros",
      "No se permite spam o publicidad no autorizada",
      "Comparte solo información verificada y confiable"
    ],
    activeChallenges: ["challenge-001", "challenge-004"],
    imageUrl: "/groups/beginners.jpg"
  },
  {
    id: "group-002",
    name: "Powerlifting y Fuerza",
    description: "Comunidad dedicada al entrenamiento de fuerza y powerlifting. Comparte tus PRs, técnicas y programas.",
    category: "strength",
    memberCount: 0,
    isPrivate: false,
    requiresApproval: false,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    rules: [
      "Sé respetuoso con todos los miembros",
      "Enfócate en la técnica correcta y segura",
      "Comparte tus logros y ayuda a otros a mejorar"
    ],
    activeChallenges: ["challenge-002"],
    imageUrl: "/groups/powerlifting.jpg"
  },
  {
    id: "group-003",
    name: "Transformación Física",
    description: "Grupo para quienes buscan una transformación física significativa. Comparte tus progresos, dificultades y éxitos.",
    category: "transformation",
    memberCount: 0,
    isPrivate: false,
    requiresApproval: false,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    rules: [
      "Sé respetuoso y positivo con todos los miembros",
      "No se permiten comentarios negativos sobre el cuerpo de otros",
      "Comparte tus progresos y motiva a los demás"
    ],
    activeChallenges: ["challenge-003"],
    imageUrl: "/groups/transformation.jpg"
  },
  {
    id: "group-004",
    name: "Nutrición y Alimentación Saludable",
    description: "Comunidad enfocada en nutrición para el rendimiento y la salud. Comparte recetas, consejos y dudas.",
    category: "nutrition",
    memberCount: 0,
    isPrivate: false,
    requiresApproval: false,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    rules: [
      "No promover dietas extremas o peligrosas",
      "Respetar las diferentes aproximaciones a la nutrición",
      "Compartir información basada en evidencia científica"
    ],
    activeChallenges: [],
    imageUrl: "/groups/nutrition.jpg"
  }
];

// Funciones para el sistema de retos
export function getChallengesByLevel(level: TrainingLevel): Challenge[] {
  const difficultyMap: Record<TrainingLevel, ChallengeDifficulty[]> = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['intermediate', 'advanced'],
    elite: ['advanced', 'elite']
  };
  
  return PREDEFINED_CHALLENGES.filter(challenge => 
    difficultyMap[level].includes(challenge.difficulty as ChallengeDifficulty)
  );
}

export function getChallengesByCategory(category: ChallengeCategory): Challenge[] {
  return PREDEFINED_CHALLENGES.filter(challenge => challenge.category === category);
}

export function getChallengeProgress(userChallenge: UserChallenge): number {
  const totalRequirements = userChallenge.requirementProgress.length;
  const completedRequirements = userChallenge.requirementProgress.filter(req => req.isCompleted).length;
  
  return Math.round((completedRequirements / totalRequirements) * 100);
}

// Funciones para el sistema de comunidad
export function getRecommendedGroups(
  userLevel: TrainingLevel,
  userGoals: TrainingGoal[],
  userInterests: string[]
): CommunityGroup[] {
  // Implementación simplificada - en una versión real se usaría un algoritmo más sofisticado
  return PREDEFINED_COMMUNITY_GROUPS.filter(group => {
    // Filtrar por nivel
    if (group.category === 'beginner' && userLevel !== 'beginner') return false;
    if (group.category === 'advanced' && (userLevel !== 'advanced' && userLevel !== 'elite')) return false;
    
    // Filtrar por intereses
    const matchesInterest = userInterests.some(interest => 
      group.name.toLowerCase().includes(interest.toLowerCase()) || 
      group.description.toLowerCase().includes(interest.toLowerCase()) ||
      group.category.toLowerCase().includes(interest.toLowerCase())
    );
    
    // Filtrar por objetivos
    const matchesGoal = userGoals.some(goal => 
      group.category.toLowerCase().includes(goal.toLowerCase())
    );
    
    return matchesInterest || matchesGoal;
  });
}

export function getGroupChallenges(groupId: string): Challenge[] {
  const group = PREDEFINED_COMMUNITY_GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  
  return PREDEFINED_CHALLENGES.filter(challenge => 
    group.activeChallenges.includes(challenge.id)
  );
}
