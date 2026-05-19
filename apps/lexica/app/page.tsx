'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, BookOpen, Award, Settings, RotateCcw, X, BarChart3, AlertCircle, TrendingDown, Zap, Check, Mic, Hand, Brain } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import EnergyBar from './components/EnergyBar';
import ErrorBoundary from './components/ErrorBoundary';
import SwipeDeck from './components/SwipeDeck';
import InteractiveTour, { getTourSteps } from './components/InteractiveTour';
import { useTour } from './hooks/useTour';
// Story modals now handled by routes: /story/[id], /story/[id]/unlock-quiz, /story/[id]/unlock
// Level selection now handled by route: /level-select
import { useLexicaStore, initializeLexicaStore } from './store/lexicaStore';
import { getDifficultyAnalysis, getProgressStats } from './lib/eloAlgorithm';
import { useSoundEffects } from './hooks/useSoundEffects';

function HomeContent() {
  const energy = useLexicaStore(state => state.energy);
  const maxEnergy = useLexicaStore(state => state.maxEnergy);
  const currentStreak = useLexicaStore(state => state.currentStreak);
  const userStats = useLexicaStore(state => state.userStats);
  const cardProgress = useLexicaStore(state => state.cardProgress);
  const learnedCount = useLexicaStore(state => state.learnedWords.size);
  const selectedLevel = useLexicaStore(state => state.selectedLevel);
  const hasSeenWelcome = useLexicaStore(state => state.hasSeenWelcome);
  const isInTest = useLexicaStore(state => state.isInTest);
  const testScore = useLexicaStore(state => state.testScore);
  const recommendedLevel = useLexicaStore(state => state.recommendedLevel);
  const swipeMode = useLexicaStore(state => state.swipeMode);
  const hasSeenOnboarding = useLexicaStore(state => state.hasSeenOnboarding);
  const completeOnboarding = useLexicaStore(state => state.completeOnboarding);

  const setSelectedLevel = useLexicaStore(state => state.setSelectedLevel);
  const startTest = useLexicaStore(state => state.startTest);
  const skipToManual = useLexicaStore(state => state.skipToManual);
  const completeTest = useLexicaStore(state => state.completeTest);
  const acceptRecommendedLevel = useLexicaStore(state => state.acceptRecommendedLevel);
  const resetProgress = useLexicaStore(state => state.resetProgress);
  const setSwipeMode = useLexicaStore(state => state.setSwipeMode);

  // Removed: Story modal states - now using routes (/story/[id], /story/[id]/unlock-quiz, /story/[id]/unlock)
  const markStoryAsRead = useLexicaStore(state => state.markStoryAsRead);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { buttonPress, click } = useSoundEffects();
  const { startTour, hasSeenTour } = useTour();

  // Helper function to change level - ensures proper redirect to /level-select
  const handleChangeLevel = () => {
    // Set hasSeenWelcome to true to skip test welcome screen
    const store = useLexicaStore.getState();
    if (!store.hasSeenWelcome) {
      store.skipToManual(); // This sets hasSeenWelcome: true
    }
    setSelectedLevel(null);
  };
  const previewDue = Number(searchParams.get('reviewPreview') ?? 0);
  const forceCortexReminder = searchParams.get('cortexReminder') === '1';

  // Mobile stats modal state
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(() => false);
  const [showCortexReminder, setShowCortexReminder] = useState(false);

  // Difficulty status notification state
  const [showDifficultyStatus, setShowDifficultyStatus] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  // Initialize store on mount
  useEffect(() => {
    initializeLexicaStore();
  }, []);

  // Redirect to onboarding or test if needed
  useEffect(() => {
    // Skip redirects if we're in preview mode (for testing modals)
    if (forceCortexReminder || previewDue > 0) {
      return;
    }

    // First time user → Onboarding
    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // Onboarding done but no level selected AND hasn't seen test welcome → Test
    // If user has seen welcome (clicked "Tự chọn level"), let them choose manually
    if (!selectedLevel && !isInTest && testScore === null && !hasSeenWelcome) {
      router.replace('/test');
      return;
    }

    // In test flow → Navigate to test pages
    if (isInTest && !selectedLevel) {
      router.replace('/test/quiz');
      return;
    }

    // Test completed but not accepted → Show result
    if (testScore !== null && !selectedLevel) {
      router.replace('/test/result');
      return;
    }

    // User has completed onboarding, seen test welcome, but no level selected → Level Select
    // This happens when user clicks "Tự chọn level" or "Đổi level"
    if (!selectedLevel && hasSeenWelcome && !isInTest && testScore === null) {
      router.replace('/level-select');
      return;
    }
  }, [hasSeenOnboarding, selectedLevel, isInTest, testScore, hasSeenWelcome, router, forceCortexReminder, previewDue]);

  // Debug: Get difficulty analysis
  const analysis = getDifficultyAnalysis(userStats);
  const progressStats = getProgressStats(cardProgress);
  const dueToday = previewDue || progressStats.dueToday;

  // Show review prompt once per day when there are due cards
  useEffect(() => {
    // ?reviewPreview=N forces the modal instantly (dev/preview only)
    if (previewDue > 0) {
      const t = setTimeout(() => setShowReviewPrompt(true), 0);
      return () => clearTimeout(t);
    }
    const todayKey = `reviewPromptShown_${new Date().toDateString()}`;
    if (progressStats.dueToday > 0 && !sessionStorage.getItem(todayKey)) {
      sessionStorage.setItem(todayKey, '1');
      const t = setTimeout(() => setShowReviewPrompt(true), 800);
      return () => clearTimeout(t);
    }
  }, [progressStats.dueToday, previewDue]);

  // Show Cortex Hub reminder after every 25 words learned (if not connected)
  useEffect(() => {
    // ?cortexReminder=1 forces the modal instantly (dev/preview only)
    if (forceCortexReminder) {
      const t = setTimeout(() => setShowCortexReminder(true), 0);
      return () => clearTimeout(t);
    }

    // Check if already connected
    const cortexUserId = localStorage.getItem('cortex_user_id');
    if (cortexUserId) return; // Already connected, no need to remind

    // Check when last dismissed
    const lastDismissedStr = localStorage.getItem('cortex_reminder_dismissed');
    if (lastDismissedStr) {
      const lastDismissed = new Date(lastDismissedStr);
      const now = new Date();
      const hoursSinceDismiss = (now.getTime() - lastDismissed.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) return; // Dismissed within last 24 hours
    }

    // Check learned count - show every 25 words
    const lastShownCount = parseInt(localStorage.getItem('cortex_reminder_last_count') || '0');
    if (learnedCount >= lastShownCount + 25 && learnedCount > 0) {
      const t = setTimeout(() => {
        setShowCortexReminder(true);
        localStorage.setItem('cortex_reminder_last_count', learnedCount.toString());
      }, 1500); // Show after 1.5s delay
      return () => clearTimeout(t);
    }
  }, [learnedCount, forceCortexReminder]);

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'very-hard':
      case 'challenging':
        return {
          icon: TrendingDown,
          color: 'text-slate-300',
          bgColor: 'bg-slate-700/50',
          borderColor: 'border-slate-600',
        };
      case 'too-easy':
      case 'easy':
        return {
          icon: TrendingUp,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30',
        };
      case 'perfect':
        return {
          icon: Zap,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30',
        };
      default:
        return {
          icon: Check,
          color: 'text-slate-400',
          bgColor: 'bg-slate-700/50',
          borderColor: 'border-slate-600',
        };
    }
  };

  const statusDisplay = getStatusDisplay(analysis.status);
  const isVoiceMode = swipeMode === 'voice';

  // Track status changes and show notification
  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    // Only show if status actually changed (not initial load)
    if (previousStatus !== null && previousStatus !== analysis.status) {
      // Schedule state update for next tick to avoid cascading renders
      const showTimer = setTimeout(() => {
        setShowDifficultyStatus(true);
      }, 0);

      // Auto-hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowDifficultyStatus(false);
      }, 5000);

      // Update ref for next comparison
      previousStatusRef.current = analysis.status;

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    // Set initial value
    if (previousStatus === null) {
      previousStatusRef.current = analysis.status;
    }
  }, [analysis.status]);

  return (
    <div className="relative h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Review Prompt Modal */}
      <AnimatePresence>
        {showReviewPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20">
                  <RotateCcw className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Ôn tập hôm nay</h2>
              </div>
              <p className="text-slate-300 text-sm mb-1">
                Bạn có <span className="text-amber-400 font-bold">{previewDue || progressStats.dueToday} từ</span> cần ôn lại hôm nay.
              </p>
              <p className="text-slate-500 text-xs mb-6">
                Ôn tập giúp củng cố trí nhớ và tăng tốc độ ghi nhớ dài hạn.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    click();
                    setShowReviewPrompt(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-colors"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    buttonPress();
                    setShowReviewPrompt(false);
                    router.push('/review');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold transition-colors"
                >
                  Ôn ngay →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cortex Hub Reminder Modal */}
      <AnimatePresence>
        {showCortexReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="w-full max-w-sm bg-slate-800 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20">
                  <Brain className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Kết nối Cortex Hub</h2>
              </div>
              <p className="text-slate-300 text-sm mb-1">
                Bạn đã học được <span className="text-cyan-400 font-bold">{learnedCount} từ</span>! 🎉
              </p>
              <p className="text-slate-400 text-xs mb-6">
                Kết nối Cortex Hub để đồng bộ tiến độ học tập của bạn qua tất cả ứng dụng trong hệ sinh thái Cortex. Dữ liệu được phân tích bằng AI để cải thiện hiệu quả học tập.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    click();
                    setShowCortexReminder(false);
                    localStorage.setItem('cortex_reminder_dismissed', new Date().toISOString());
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-colors"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    buttonPress();
                    setShowCortexReminder(false);
                    const HUB_URL = process.env.NEXT_PUBLIC_CORTEX_HUB_URL || 'http://localhost:3000';
                    window.open(HUB_URL, '_blank');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-bold transition-colors"
                >
                  Kết nối ngay →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo - Top Left */}
      <div className="hidden lg:block fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          LEXICA
        </h1>
      </div>

      {/* Help Button - top-left on mobile, bottom-right on desktop */}
      <button
        onClick={() => {
          click();
          startTour(getTourSteps());
        }}
        className="lg:hidden fixed top-25.5 left-4 z-50 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 hover:border-cyan-500 hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-400 hover:text-cyan-400 text-sm font-bold"
        aria-label="Hướng dẫn"
      >
        ?
      </button>
      <button
        onClick={() => {
          click();
          startTour(getTourSteps());
        }}
        className="hidden lg:flex fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 hover:border-cyan-500 hover:bg-slate-600 transition-colors items-center justify-center text-slate-400 hover:text-cyan-400 text-sm font-bold"
        aria-label="Hướng dẫn"
      >
        ?
      </button>

      {/* Interactive Tour Component */}
      <InteractiveTour autoStart={hasSeenOnboarding && selectedLevel !== null && !hasSeenTour} />

      {/* Energy Bar Header */}
      <EnergyBar currentEnergy={energy} maxEnergy={maxEnergy} streak={currentStreak} />

      {/* Mobile Quick Level Switch */}
      <div className="lg:hidden fixed top-25.5 right-4 z-40">
        <button
          onClick={() => {
            click();
            handleChangeLevel();
          }}
          className="px-3 py-2 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          Đổi level
        </button>
      </div>

      {/* Main Content Area - Two Column Layout on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 px-4 pt-4 pb-16 lg:pt-8 lg:pb-8 max-w-6xl mx-auto w-full overflow-hidden">

        {/* Left Column - Swipe Deck */}
        <div className="w-full lg:flex-1 lg:max-w-lg flex flex-col items-center justify-center lg:h-full lg:min-h-150">
          {/* Swipe Deck */}
          <div className="w-full max-w-md flex items-center justify-center" data-tour-id="swipe-deck">
            <ErrorBoundary>
              <SwipeDeck />
            </ErrorBoundary>
          </div>
        </div>

        {/* Difficulty Status Notification - Fixed to avoid layout shift */}
        <AnimatePresence>
          {showDifficultyStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40"
            >
              <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${statusDisplay.bgColor} ${statusDisplay.borderColor} shadow-lg backdrop-blur-sm`}>
                <statusDisplay.icon className={`w-6 h-6 ${statusDisplay.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className={`text-base font-bold ${statusDisplay.color}`}>
                    {analysis.message.split(' - ')[0]}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    {analysis.message.split(' - ')[1]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    click();
                    setShowDifficultyStatus(false);
                  }}
                  className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation Bar - Fixed */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 px-3 py-3 pb-safe">
          <div className="flex items-center justify-center gap-1.5 max-w-md mx-auto">
            {/* Stats Modal Toggle */}
            <button
              onClick={() => {
                click();
                setShowMobileStats(true);
              }}
              className="flex-1 py-2 bg-slate-800/60 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors active:scale-95 flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300 text-xs font-medium whitespace-nowrap">Cài đặt</span>
            </button>

            {/* Learned Words Link */}
            <Link href="/learned" className="flex-1">
              <div className="py-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-500 transition-colors active:scale-95 cursor-pointer flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300 text-xs font-medium whitespace-nowrap">Đã học</span>
                <span className="text-cyan-400 text-xs font-semibold">({learnedCount})</span>
              </div>
            </Link>

            {/* Review Link */}
            {dueToday > 0 && (
              <Link href="/review" className="shrink-0">
                <div className="py-2 px-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 transition-colors active:scale-95 cursor-pointer flex items-center justify-center gap-1">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 text-xs font-medium whitespace-nowrap">Ôn ({dueToday})</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Right Column - Stats Sidebar */}
        <div className="hidden lg:block w-full lg:w-72 xl:w-80 shrink-0">
          {/* Desktop Full Stats Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:p-6 space-y-4 lg:space-y-5">

            {/* Voice/Touch Mode Toggle */}
            <div className="space-y-3 pb-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Chế độ swipe</span>
                <button
                  data-tour-id="voice-mode-toggle"
                  onClick={() => {
                    click();
                    setSwipeMode(isVoiceMode ? 'touch' : 'voice');
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isVoiceMode
                    ? 'bg-cyan-500/12 border-cyan-400/35 text-cyan-200'
                    : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:border-slate-400/60'
                    }`}
                >
                  {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
                  {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
                </button>
              </div>
            </div>

            {/* Performance Stats - Hidden on mobile, shown in compact grid above */}
            <div className="hidden lg:block space-y-3">
              <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Performance</h3>

              <div className="flex justify-between items-center group" title="Your current ELO rating" data-tour-id="elo-rating">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm">ELO Rating</span>
                </div>
                <span className="text-cyan-400 font-mono font-semibold">{userStats.currentElo}</span>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Progress</h3>

              <div className="flex justify-between items-center" title="Words you've started learning" data-tour-id="learned-counter">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300 text-sm">Learned</span>
                </div>
                <span className="text-cyan-400 font-semibold">{learnedCount}</span>
              </div>

              <div className="flex justify-between items-center" title="Words you've fully mastered">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Mastered</span>
                </div>
                <span className="text-white font-semibold">{progressStats.mastered}</span>
              </div>
            </div>

            {/* Learned Words Link - Desktop */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <Link href="/learned" data-tour-id="learned-words-link">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-200 text-sm font-medium">Xem từ đã học</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-semibold">({learnedCount})</span>
                  </div>
                </div>
              </Link>
              {dueToday > 0 && (
                <Link href="/review" data-tour-id="review-link">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-200 text-sm font-medium">Ôn tập hôm nay</span>
                      </div>
                      <span className="text-amber-400 text-sm font-semibold">{dueToday} từ</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Stats Link */}
            <div className="pt-4 border-t border-slate-700">
              <Link href="/stats">
                <div className="w-full px-4 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <BarChart3 className="w-4 h-4" />
                  Cài đặt
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  click();
                  handleChangeLevel();
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-600/50 hover:border-slate-500 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Đổi level
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    click();
                    resetProgress();
                  }}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 text-sm font-medium transition-colors border border-slate-600/30 hover:border-slate-600 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Progress
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Stats Modal */}
      <AnimatePresence>
        {showMobileStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileStats(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t-2 border-cyan-500/30 rounded-t-3xl z-50 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Thống kê</h3>
                <button
                  onClick={() => {
                    click();
                    setShowMobileStats(false);
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Voice/Touch Mode Toggle */}
                <div className="space-y-3 pb-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Chế độ swipe</span>
                    <button
                      onClick={() => {
                        click();
                        setSwipeMode(isVoiceMode ? 'touch' : 'voice');
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${isVoiceMode
                        ? 'bg-cyan-500/12 border-cyan-400/35 text-cyan-200'
                        : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:border-slate-400/60'
                        }`}
                    >
                      {isVoiceMode ? <Mic className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
                      {isVoiceMode ? 'Voice Mode' : 'Touch Mode'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Voice mode yêu cầu đọc đúng từ trên cùng 3 lần liên tiếp.
                  </p>
                </div>

                {/* Performance Stats */}
                <div className="space-y-3">
                  <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Performance</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 text-sm">ELO Rating</span>
                    </div>
                    <span className="text-cyan-400 font-mono font-semibold">{userStats.currentElo}</span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Progress</h3>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 text-sm">Learned</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{learnedCount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">Mastered</span>
                    </div>
                    <span className="text-white font-semibold">{progressStats.mastered}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <Link href="/stats">
                    <button
                      onClick={() => {
                        click();
                        setShowMobileStats(false);
                      }}
                      className="w-full mb-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Xem thống kê chi tiết
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      click();
                      handleChangeLevel();
                      setShowMobileStats(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-600/50 hover:border-slate-500 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Đổi level
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => {
                        click();
                        resetProgress();
                        setShowMobileStats(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 text-sm font-medium transition-colors border border-slate-600/30 hover:border-slate-600 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Progress
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Story modals now handled by dedicated routes */}
    </div>
  );
}

// ─── Wrapper với Suspense boundary ────────────────────────────────────────────

function HomePageFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomeContent />
    </Suspense>
  );
}
