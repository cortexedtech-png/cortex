/**
 * E2E Test Helpers: Shared state setup utilities for Playwright tests
 *
 * Chiến lược: Inject trạng thái vào localStorage TRƯỚC khi trang load
 * bằng page.addInitScript(). Zustand's persist middleware sẽ hydrate từ
 * localStorage này khi store được khởi tạo.
 *
 * Key localStorage: 'lexica-storage' (định nghĩa trong lexicaStore.ts)
 */

import { Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Kiểu dữ liệu cho state cần inject
// ---------------------------------------------------------------------------
interface LexicaPersistedState {
  hasSeenOnboarding: boolean;
  hasSeenWelcome: boolean;
  selectedLevel: string | null;
  energy: number;
  maxEnergy: number;
  lastEnergyReset: number;
  userStats: {
    currentElo: number;
    totalSwipes: number;
    correctSwipes: number;
    wrongSwipes: number;
    recentSwipes: unknown[];
    seenCardIds: string[];
  };
  cardProgress: Record<string, unknown>;
  learnedWords: string[];
  todayLearnedWords: string[];
  lastLearnedWordsReset: string;
  swipeMode: 'touch' | 'voice';
  soundEnabled: boolean;
  autoReviewInDeck: boolean;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  highestElo: number;
  studyHistory: Record<string, unknown>;
  dailyGoal: number;
  dailyProgress: number;
  lastGoalSetDate: string | null;
  userArchetype: string | null;
  unlockedStories: string[];
  unlockedStoryPart1: string[];
  readStories: string[];
  readStoryPart1: string[];
  storyQuizAttempts: Record<string, unknown>;
  testScore: number | null;
  recommendedLevel: string | null;
  isInTest: boolean;
}

// ---------------------------------------------------------------------------
// Helper: format ngày YYYY-MM-DD theo giờ địa phương
// ---------------------------------------------------------------------------
function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function midnightTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
}

// ---------------------------------------------------------------------------
// State cơ bản: đã hoàn thành onboarding, đã chọn level
// Dùng để bypass toàn bộ luồng onboarding/test và vào thẳng trang chủ
// ---------------------------------------------------------------------------
export function makeBypassState(
  overrides: Partial<LexicaPersistedState> = {}
): LexicaPersistedState {
  return {
    hasSeenOnboarding: true,
    hasSeenWelcome: true,
    selectedLevel: 'intermediate',
    energy: 30,
    maxEnergy: 30,
    lastEnergyReset: midnightTimestamp(),
    userStats: {
      currentElo: 1000,
      totalSwipes: 0,
      correctSwipes: 0,
      wrongSwipes: 0,
      recentSwipes: [],
      seenCardIds: [],
    },
    cardProgress: {},
    learnedWords: [],
    todayLearnedWords: [],
    lastLearnedWordsReset: todayString(),
    swipeMode: 'touch',
    soundEnabled: false, // tắt âm thanh trong môi trường test
    autoReviewInDeck: false,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    highestElo: 1000,
    studyHistory: {},
    dailyGoal: 15,
    dailyProgress: 0,
    lastGoalSetDate: null,
    userArchetype: 'tech',
    unlockedStories: [],
    unlockedStoryPart1: [],
    readStories: [],
    readStoryPart1: [],
    storyQuizAttempts: {},
    testScore: null,
    recommendedLevel: null,
    isInTest: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// State "fresh": chưa onboarding (để test luồng onboarding)
// ---------------------------------------------------------------------------
export function makeFreshState(): Partial<LexicaPersistedState> {
  return {
    hasSeenOnboarding: false,
    hasSeenWelcome: false,
    selectedLevel: null,
  };
}

// ---------------------------------------------------------------------------
// Inject localStorage state trước khi trang load
// ---------------------------------------------------------------------------
export async function injectLexicaState(
  page: Page,
  state: Partial<LexicaPersistedState>
): Promise<void> {
  const storageValue = JSON.stringify({ state, version: 0 });

  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: 'lexica-storage', value: storageValue }
  );
}

// ---------------------------------------------------------------------------
// Xóa toàn bộ localStorage (simulate fresh install)
// ---------------------------------------------------------------------------
export async function clearLexicaState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}
