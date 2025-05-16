// Tipos para entrenadores personales y nutricionistas

// Tipo base para profesionales
interface ProfessionalBase {
  id: string;
  userId: string;
  specialties: string[];
  experienceYears: number;
  certifications?: string[];
  bio?: string;
  hourlyRate?: number;
  availability?: {
    monday?: { start: string; end: string }[];
    tuesday?: { start: string; end: string }[];
    wednesday?: { start: string; end: string }[];
    thursday?: { start: string; end: string }[];
    friday?: { start: string; end: string }[];
    saturday?: { start: string; end: string }[];
    sunday?: { start: string; end: string }[];
  };
  maxClients: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipo para entrenadores personales
export interface TrainerProfile extends ProfessionalBase {
  // Propiedades específicas de entrenadores
  specializations?: {
    strengthTraining?: boolean;
    hypertrophy?: boolean;
    weightLoss?: boolean;
    endurance?: boolean;
    flexibility?: boolean;
    rehabilitation?: boolean;
    sports?: string[];
    other?: string[];
  };
}

// Tipo para nutricionistas
export interface NutritionistProfile extends ProfessionalBase {
  // Propiedades específicas de nutricionistas
  specializations?: {
    weightManagement?: boolean;
    sportsNutrition?: boolean;
    clinicalNutrition?: boolean;
    veganVegetarian?: boolean;
    eatingDisorders?: boolean;
    diabetesManagement?: boolean;
    foodAllergies?: boolean;
    other?: string[];
  };
}

// Tipo para relaciones cliente-profesional
export interface ClientRelationship {
  id: string;
  professionalId: string;
  clientId: string;
  professionalType: 'trainer' | 'nutritionist';
  status: 'pending' | 'active' | 'paused' | 'terminated';
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para asignaciones de entrenamiento
export interface TrainingAssignment {
  id: string;
  trainerId: string;
  clientId: string;
  routineId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  feedback?: string;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
  routine?: any; // Tipo WorkoutRoutine
}

// Tipo para asignaciones de nutrición
export interface NutritionAssignment {
  id: string;
  nutritionistId: string;
  clientId: string;
  mealPlanId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  feedback?: string;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
  mealPlan?: any; // Tipo MealPlan
}

// Tipo para mensajes entre profesionales y clientes
export interface ClientMessage {
  id: string;
  senderId: string;
  recipientId: string;
  relationshipId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Tipo para evaluaciones y seguimiento
export interface ClientAssessment {
  id: string;
  professionalId: string;
  clientId: string;
  professionalType: 'trainer' | 'nutritionist';
  assessmentDate: string;
  metrics: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    bmi?: number;
    waistCircumference?: number;
    hipCircumference?: number;
    chestCircumference?: number;
    armCircumference?: number;
    thighCircumference?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    restingHeartRate?: number;
    vo2Max?: number;
    strengthMetrics?: {
      [exercise: string]: {
        weight: number;
        reps: number;
        date: string;
      };
    };
    nutritionMetrics?: {
      calorieIntake?: number;
      proteinIntake?: number;
      carbIntake?: number;
      fatIntake?: number;
      waterIntake?: number;
      fiberIntake?: number;
      sugarIntake?: number;
      sodiumIntake?: number;
    };
    [key: string]: any; // Para métricas personalizadas
  };
  notes?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para pagos y facturación
export interface ProfessionalPayment {
  id: string;
  professionalId: string;
  clientId: string;
  professionalType: 'trainer' | 'nutritionist';
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  description?: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
}

// Tipo para cliente con su entrenador/nutricionista
export interface ClientWithProfessional {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientAvatar?: string;
  relationshipId: string;
  relationshipStatus: 'pending' | 'active' | 'paused' | 'terminated';
  startDate?: string;
  lastAssessmentDate?: string;
  lastMessageDate?: string;
  activeAssignments: number;
}

// Tipo para profesional con sus clientes
export interface ProfessionalWithClients {
  professionalId: string;
  professionalName: string;
  professionalType: 'trainer' | 'nutritionist';
  clients: ClientWithProfessional[];
  totalClients: number;
  activeClients: number;
  pendingClients: number;
}

// Tipo para resumen de actividad profesional
export interface ProfessionalActivitySummary {
  totalClients: number;
  activeClients: number;
  pendingRequests: number;
  assignmentsCreated: number;
  assignmentsCompleted: number;
  unreadMessages: number;
  upcomingAssessments: number;
  recentPayments: ProfessionalPayment[];
}
