'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Trophy, Save, Sparkles, BookMarked, RotateCcw, Gamepad2, Zap } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import GameHub from '../components/GameHub';
import {
    STORIES,
    getStoryLearnedCount,
    isStoryPreviewVisible,
    canUnlockPart1Naturally,
    canTakePart1Quiz,
    isStoryPart1Unlocked,
    canUnlockPart2Naturally,
    canTakePart2Quiz,
    isStoryPart2Unlocked
} from '../data/stories';
import { getProgressStats } from '../lib/eloAlgorithm';
import LearnedWordsList from '../components/LearnedWordsList';
import SRSCalendar from '../components/SRSCalendar';
import OnboardingModal from '../components/OnboardingModal';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';

function getLevelLabel(level: string) {
    switch (level) {
        case 'beginner':
            return 'Cơ bản';
        case 'intermediate':
            return 'Trung cấp';
        case 'advanced':
            return 'Nâng cao';
        case 'expert':
            return 'Chuyên gia';
        default:
            return 'Mixed';
    }
}

function getLevelBadgeClasses(level: string) {
    switch (level) {
        case 'beginner':
            return 'bg-slate-800 text-slate-400 border-slate-700';
        case 'intermediate':
            return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'advanced':
            return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        case 'expert':
            return 'bg-cyan-500/30 text-cyan-200 border-cyan-500/40';
        default:
            return 'bg-slate-800 text-slate-400 border-slate-700';
    }
}

export default function LearnedPage() {
    const router = useRouter();
    const [showHelp, setShowHelp] = useState(false);
    const [showGameHub, setShowGameHub] = useState(false);
    const { buttonPress, click } = useSoundEffects();
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const todayLearnedWords = useLexicaStore(state => state.todayLearnedWords);
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const unlockedStoryPart1 = useLexicaStore(state => state.unlockedStoryPart1);
    const readStories = useLexicaStore(state => state.readStories);
    const readStoryPart1 = useLexicaStore(state => state.readStoryPart1);
    const storyQuizAttempts = useLexicaStore(state => state.storyQuizAttempts);
    // Removed: openStoryQuizModal, showStoryUnlock, closeStoryUnlockModal - now using routes
    const learnedWordIds = Array.from(learnedWords);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const userStats = useLexicaStore(state => state.userStats);
    const visibleStories = STORIES.filter(story => isStoryPreviewVisible(story, learnedWordIds));
    const progressStats = getProgressStats(cardProgress);

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
            {showHelp && (
                <OnboardingModal onComplete={() => setShowHelp(false)} />
            )}
            {/* Help Button */}
            <button
                onClick={() => {
                    click();
                    setShowHelp(true);
                }}
                className="fixed bottom-5 right-5 z-50 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 hover:border-cyan-500 hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-400 hover:text-cyan-400 text-sm font-bold"
                aria-label="Hướng dẫn"
            >
                ?
            </button>
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Quay lại trang chính</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Từ đã học
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-8 text-base flex-wrap">
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Tổng số</span>
                            <span className="text-white font-bold text-2xl tracking-tight">{learnedCount}</span>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Thành thạo</span>
                            <span className="text-amber-400 font-bold text-2xl tracking-tight flex items-center gap-1.5">
                                {masteredCount}
                                <Trophy className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Stories</span>
                            <span className="text-cyan-400 font-bold text-2xl tracking-tight flex items-center gap-1.5">
                                {unlockedStories.length}<span className="text-slate-600 text-sm font-medium">/{STORIES.length}</span>
                                <BookMarked className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {learnedCount > 0 && (
                    <div className="mb-6 px-4 py-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
                            <span>Tiến độ thành thạo</span>
                            <span className="text-cyan-400">{Math.round((masteredCount / learnedCount) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                style={{ width: `${(masteredCount / learnedCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Vocabulary Games Card */}
            {learnedCount >= 4 && (
                <div className="max-w-5xl mx-auto mb-8">
                    <button
                        onClick={() => {
                            buttonPress();
                            setShowGameHub(true);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 transition-all hover:scale-[1.01] active:scale-95 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="text-left">
                                <div className="text-cyan-200 font-semibold text-sm mb-1">
                                    Vocabulary Games
                                </div>
                                <div className="text-cyan-400/70 text-xs">
                                    7 games để ôn tập từ vựng
                                </div>
                            </div>
                        </div>
                        <span className="text-cyan-400 text-lg font-bold">→</span>
                    </button>
                </div>
            )}

            {/* SRS Calendar */}
            <div className="max-w-5xl mx-auto mb-8">
                <SRSCalendar cardProgress={cardProgress} />
                {progressStats.dueToday > 0 && (
                    <Link href="/review" className="mt-3 flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition-all hover:scale-[1.01] active:scale-95">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <RotateCcw className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-amber-200 font-semibold text-sm">Ôn tập hôm nay</div>
                                <div className="text-amber-400/70 text-xs">{progressStats.dueToday} từ cần ôn</div>
                            </div>
                        </div>
                        <span className="text-amber-400 text-lg font-bold">→</span>
                    </Link>
                )}
            </div>

            {/* Stories Section */}
            {visibleStories.length > 0 && (
                <div className="max-w-5xl mx-auto mb-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BookMarked className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-2xl font-bold text-white">Story Packs</h2>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
                            {visibleStories.length}
                        </span>
                    </div>

                    <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                        {visibleStories.map((story) => {
                            const storyId = story.id;
                            const learnedCountForStory = getStoryLearnedCount(story, learnedWordIds);

                            // Check unlock status for both parts
                            const part1Unlocked = isStoryPart1Unlocked(story, learnedWordIds, unlockedStoryPart1, storyQuizAttempts);
                            const part2Unlocked = isStoryPart2Unlocked(story, learnedWordIds, unlockedStories, storyQuizAttempts);

                            // Check quiz eligibility
                            const canQuizPart1 = canTakePart1Quiz(story, learnedWordIds);
                            const canQuizPart2 = canTakePart2Quiz(story, learnedWordIds);

                            // Check if parts have been read
                            const part1Read = readStoryPart1.includes(storyId);
                            const fullRead = readStories.includes(storyId);

                            return (
                                <div
                                    key={storyId}
                                    className="w-full px-4 py-4 rounded-lg border bg-slate-700/30 border-slate-600/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <BookMarked className={`w-5 h-5 ${part2Unlocked ? 'text-cyan-400' : part1Unlocked ? 'text-cyan-500/70' : 'text-slate-500'}`} />
                                                <span className="text-lg font-semibold text-white">
                                                    {story.title}
                                                </span>
                                            </div>
                                            <div className="ml-8">
                                                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                                    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getLevelBadgeClasses(story.difficultyLevel)}`}>
                                                        {getLevelLabel(story.difficultyLevel)}
                                                    </span>
                                                    <span className="text-sm text-slate-500">
                                                        {learnedCountForStory}/7
                                                    </span>
                                                    <span className="text-slate-600">•</span>
                                                    <span className="text-sm text-slate-500">
                                                        {story.darkComedyLevel === 'extreme' ? 'Dark comedy cực mạnh' : story.darkComedyLevel === 'high' ? 'Dark comedy cao' : 'Dark comedy vừa'}
                                                    </span>

                                                    {/* Status badges */}
                                                    {part2Unlocked && !fullRead && (
                                                        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                                            Full Unread
                                                        </span>
                                                    )}
                                                    {part1Unlocked && !part1Read && !part2Unlocked && (
                                                        <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                                                            Part 1 Unread
                                                        </span>
                                                    )}
                                                    {fullRead && (
                                                        <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-400 text-xs font-medium">
                                                            ✓ Completed
                                                        </span>
                                                    )}
                                                    {!part1Unlocked && learnedCountForStory >= 2 && (
                                                        <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
                                                            Preview
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${part2Unlocked ? 'bg-cyan-400' : part1Unlocked ? 'bg-cyan-500/70' : 'bg-slate-500'}`}
                                                        style={{ width: `${(learnedCountForStory / 7) * 100}%` }}
                                                    />
                                                </div>

                                                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                                    {story.teaser}
                                                </p>

                                                {/* Action buttons - 6 states */}
                                                <div className="flex flex-wrap gap-2">
                                                    {/* State 1: Locked (0-1 words) */}
                                                    {learnedCountForStory < 2 && (
                                                        <p className="text-xs text-slate-500">
                                                            Thu thập thêm {2 - learnedCountForStory} từ để xem preview
                                                        </p>
                                                    )}

                                                    {/* State 2: Preview (2-3 words) */}
                                                    {learnedCountForStory >= 2 && !part1Unlocked && !canQuizPart1 && (
                                                        <p className="text-xs text-slate-500">
                                                            Thu thập thêm {story.part1QuizRequirement - learnedCountForStory} từ để unlock Part 1
                                                        </p>
                                                    )}

                                                    {/* State 3: Quiz Available (3+ words, Part 1 locked) */}
                                                    {!part1Unlocked && canQuizPart1 && learnedCountForStory < 4 && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    buttonPress();
                                                                    router.push(`/story/${storyId}/unlock-quiz?part=1`);
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-lg text-xs font-medium transition-all"
                                                            >
                                                                <Zap className="w-3.5 h-3.5" />
                                                                Unlock Part 1 (Quiz)
                                                            </button>
                                                            <span className="text-xs text-slate-500 self-center">hoặc học thêm {4 - learnedCountForStory} từ</span>
                                                        </>
                                                    )}

                                                    {/* State 4: Part 1 Unlocked */}
                                                    {part1Unlocked && !part2Unlocked && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    buttonPress();
                                                                    router.push(`/story/${storyId}?part=part1`);
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-medium transition-all"
                                                            >
                                                                <BookOpen className="w-4 h-4" />
                                                                {part1Read ? 'Đọc lại Part 1' : 'Đọc Part 1'}
                                                            </button>
                                                            {canQuizPart2 && learnedCountForStory < 7 && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            buttonPress();
                                                                            router.push(`/story/${storyId}/unlock-quiz?part=2`);
                                                                        }}
                                                                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-lg text-sm font-medium transition-all"
                                                                    >
                                                                        <Zap className="w-4 h-4" />
                                                                        Unlock Ending (Quiz)
                                                                    </button>
                                                                    <span className="text-xs text-slate-500 self-center">hoặc học thêm {7 - learnedCountForStory} từ</span>
                                                                </>
                                                            )}
                                                            {!canQuizPart2 && learnedCountForStory < 7 && (
                                                                <p className="text-xs text-slate-500 self-center">
                                                                    Thu thập thêm {Math.max(story.part2QuizRequirement - learnedCountForStory, 7 - learnedCountForStory)} từ để tiếp tục
                                                                </p>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* State 6: Full Story Unlocked */}
                                                    {part2Unlocked && (
                                                        <button
                                                            onClick={() => {
                                                                buttonPress();
                                                                router.push(`/story/${storyId}?part=full`);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg text-sm font-bold transition-all"
                                                        >
                                                            <BookOpen className="w-4 h-4" />
                                                            {fullRead ? 'Đọc lại Full Story' : 'Đọc Full Story'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                </div>
            )}

            {/* Learned Words List */}
            <div className="max-w-5xl mx-auto">
                <LearnedWordsList />
            </div>

            {/* Footer Info */}
            <div className="max-w-5xl mx-auto mt-12 text-center space-y-2">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Dữ liệu được lưu an toàn trong localStorage
                </p>
                <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
                    Mỗi ngày bạn học, bộ não sẽ mạnh hơn một chút
                    <Sparkles className="w-3.5 h-3.5" />
                </p>
            </div>

            {/* Game Hub Modal */}
            {showGameHub && (
                <GameHub
                    learnedWordIds={Array.from(learnedWords)}
                    todayWordIds={Array.from(todayLearnedWords)}
                    onClose={() => setShowGameHub(false)}
                />
            )}

            {/* Story unlock now handled by /story/[id]/unlock route */}
        </div>
    );
}
