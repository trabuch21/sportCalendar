export type RaceType = 'calle' | 'trail' | 'montaña' | 'postas' | 'natación' | 'triatlón' | 'duatlón' | 'otro';
export type RacePriority = 'máxima' | 'alta' | 'media' | 'baja' | 'ninguna';
export type RaceGoal = 'completar' | 'tiempo' | 'disfrutar' | 'ninguno';

export interface DisciplineDistance {
  distance: number; // in meters
  actualDistance?: number; // in meters
}

export interface TransitionTime {
  time: string; // HH:MM:SS format
}

export interface Race {
  id: string;
  userId: string;
  name: string;
  date: string; // ISO date string
  raceType: RaceType;
  distance: number; // in meters (total distance for single discipline races)
  actualDistance?: number; // in meters (if they ran more)
  // For triathlon/duathlon
  swimmingDistance?: DisciplineDistance;
  cyclingDistance?: DisciplineDistance;
  runningDistance?: DisciplineDistance; // Second run for triathlon, second run for duathlon
  firstRunDistance?: DisciplineDistance; // First run for duathlon only
  transition1Time?: TransitionTime; // T1: Swimming to Cycling (triathlon) or Running to Cycling (duathlon)
  transition2Time?: TransitionTime; // T2: Cycling to Running
  // Times
  targetTime?: string; // HH:MM:SS format (total time)
  actualTime?: string; // HH:MM:SS format (total time)
  // Individual discipline times (optional)
  swimmingTime?: string;
  cyclingTime?: string;
  runningTime?: string;
  firstRunTime?: string; // First run time for duathlon
  priority: RacePriority;
  goal: RaceGoal;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Workout types
export type IntensityType = 'TS' | 'TL' | 'TR' | 'Ca' | 'PA' | 'RC' | 'PL';

export interface Intensity {
  type: IntensityType;
  paceRange?: string;
}

export interface WorkoutStep {
  type: 'warmup' | 'cooldown' | 'run' | 'rest' | 'recover';
  distance?: number; // in meters
  duration?: number; // in seconds
  intensity?: Intensity;
  lapButtonPress?: boolean;
}

export interface WorkoutBlock {
  type: 'repetition';
  times: number;
  steps: (WorkoutStep | WorkoutBlock)[];
}

export interface ParsedWorkout {
  name?: string;
  date?: string;
  warmup: WorkoutStep;
  blocks: (WorkoutStep | WorkoutBlock)[];
  cooldown: WorkoutStep;
}

export const INTENSITY_PACE_RANGES: Record<IntensityType, string> = {
  TS: 'Trote Suave',
  TL: 'Trote Ligero',
  TR: 'Trote Rápido',
  Ca: 'Caminar',
  PA: 'Paso Ajustado',
  RC: 'Ritmo de Competición',
  PL: 'Pausa en el lugar',
};

export const INTENSITY_REFERENCES: Record<string, string> = {
  TS: 'Trote Suave',
  TL: 'Trote Ligero',
  TR: 'Trote Rápido',
  Ca: 'Caminar',
  PA: 'Paso Ajustado',
  RC: 'Ritmo de Competición',
  PL: 'Pausa en el lugar',
};
