/**
 * Core types for the CORTEX HUB ecosystem
 */

/**
 * Apps in the CORTEX HUB ecosystem
 */
export type AppSource =
  | 'lexica'
  | 'solilo'
  | 'dialecta'
  | 'oratio'
  | 'landing'
  | 'synapse'
  | 'cortex-core-api';

/**
 * Standard proficiency levels used across the ecosystem
 */
export type ProficiencyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

/**
 * Standard assessment metrics for language performance
 */
export interface AssessmentMetrics {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  // Support for specific scoring systems like IELTS
  bandScore?: number;
}

/**
 * Base User interface for CORTEX HUB
 */
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  targetBand?: number;
  currentBand?: number;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Linguistic performance profile for a user
 * Tracks ELO-based ratings for different linguistic components
 */
export interface LinguisticProfile {
  userId: string;
  fluencyElo: number;
  vocabElo: number;
  logicElo: number;
  reflexElo: number;
  lastUpdated: Date;
}

/**
 * User progress and statistics across the ecosystem
 */
export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // ISO Date string YYYY-MM-DD
  level: ProficiencyLevel;
}

/**
 * Base interface for learning content (questions, cards, etc.)
 */
export interface LearningContent {
  id: string;
  category: string;
  difficulty: ProficiencyLevel | string; // Allow string for app-specific levels (like 'easy')
  topic?: string;
  metadata?: Record<string, any>;
}

/**
 * Log entry for user actions across the CORTEX ecosystem
 */
export interface ActionLog {
  id: string;
  userId: string;
  appSource: AppSource;
  actionType: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

/**
 * Common structure for feedback/assessment results
 */
export interface SessionAssessment {
  id: string;
  sessionId: string; // match_id or session_id
  userId: string;
  metrics: AssessmentMetrics;
  feedbackTags?: string[];
  comments?: string;
}

/**
 * Synapse-specific types for Cyberpunk Survival Scenarios
 */
export interface SynapseChoice {
  particle: string;
  meaning: string;
  outcome: string;
  isCorrect: boolean;
  effect?: 'restore_life' | 'integrity_boost' | 'data_leak'; // Gameplay effects
}

export interface SynapseScenario {
  missionCode: string;
  baseVerb: string;
  narrative: string;
  choices: SynapseChoice[];
  technicalHint: string;
  isFinalBoss?: boolean; // Indicate last stage
}

export interface StoryArc {
  arcId: string;
  loreId: string;
  missionId?: string;
  stages: SynapseScenario[]; // always 5 stages
}

