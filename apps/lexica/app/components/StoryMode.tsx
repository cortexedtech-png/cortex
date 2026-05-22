'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Trophy, Volume2, ArrowRight } from 'lucide-react';
import { STORIES, parseStoryContentWithIds } from '../data/stories';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { useLexicaStore } from '../store/lexicaStore';
import StoryComprehensionQuiz from './StoryComprehensionQuiz';
import { useSoundEffects } from '../hooks/useSoundEffects';

const VOCAB_ID_BY_WORD = new Map(
    VOCAB_DATABASE.map(vocab => [vocab.word.trim().toLowerCase(), vocab.id])
);

const VOCAB_BY_ID = new Map(
    VOCAB_DATABASE.map(vocab => [vocab.id, vocab])
);

interface StoryVocabDialogData {
    word: string;
    ipa?: string;
    translationHint: string;
    scenario?: string;
    level?: string;
}

interface StoryModeProps {
    storyId: string;
    part: 'part1' | 'part2' | 'full'; // Which part to display
    onClose: () => void;
    onFinish: (partRead: 'part1' | 'full') => void;
    onNavigateToPart2?: () => void; // Optional callback for Part 2 navigation (for routing context)
}

export default function StoryMode({ storyId, part, onClose, onFinish, onNavigateToPart2 }: StoryModeProps) {
    const { buttonPress, click } = useSoundEffects();
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState<StoryVocabDialogData | null>(null);
    const [showComprehensionQuiz, setShowComprehensionQuiz] = useState(false);
    const story = STORIES.find(s => s.id === storyId);
    const unlockedStories = useLexicaStore(state => state.unlockedStories);
    const unlockedStoryPart1 = useLexicaStore(state => state.unlockedStoryPart1);
    const openStory = useLexicaStore(state => state.openStory);

    if (!story) return null;

    // Determine which content to show
    const contentToShow = part === 'part1'
        ? story.part1Content
        : part === 'full'
            ? story.content // Full story (part1 + part2)
            : story.content; // Default to full

    const contentSegments = parseStoryContentWithIds(contentToShow, story.vocabularyIds);
    const isPart1Only = part === 'part1';
    const isPart2Unlocked = unlockedStories.includes(storyId);
    const showContinueCTA = isPart1Only && isPart2Unlocked;

    // Get appropriate questions
    const quizQuestions = isPart1Only ? story.part1Questions : story.fullStoryQuestions;

    // Handle quiz completion
    const handleQuizComplete = (score: number, passed: boolean) => {
        setShowComprehensionQuiz(false);

        // Continue with original flow
        if (isPart1Only) {
            onFinish('part1');
            if (onNavigateToPart2) {
                onNavigateToPart2();
            } else {
                openStory?.(storyId, 'full');
            }
        } else {
            // Full story complete - just mark as read
            onFinish('full');
        }
    };

    const handleRetryReading = () => {
        setShowComprehensionQuiz(false);
        setHasScrolledToEnd(false);
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show quiz instead of proceeding
    if (showComprehensionQuiz) {
        return (
            <StoryComprehensionQuiz
                storyId={storyId}
                part={isPart1Only ? 'part1' : 'full'}
                questions={quizQuestions}
                onComplete={handleQuizComplete}
                onRetry={handleRetryReading}
            />
        );
    }

    // Track scroll to show CTA
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
        if (scrolledToBottom && !hasScrolledToEnd) {
            setHasScrolledToEnd(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-cyan-400" />
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {story.title}
                                {isPart1Only && <span className="ml-2 text-sm text-cyan-400">• Part 1</span>}
                            </h1>
                            <p className="text-xs text-slate-500">
                                {story.vocabularyIds.length} từ vựng
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            click();
                            onClose();
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Story Content */}
            <div
                className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
                onScroll={handleScroll}
            >
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Story text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert max-w-none"
                    >
                        <div className="text-slate-300 text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                            {contentSegments.map((segment, index) => {
                                if (segment.isVocab) {
                                    return (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                const normalizedWord = segment.text.trim().toLowerCase();
                                                const exactVocabId = VOCAB_ID_BY_WORD.get(normalizedWord);
                                                const exactVocab = exactVocabId ? VOCAB_BY_ID.get(exactVocabId) : undefined;
                                                const fallbackVocab = segment.vocabId ? VOCAB_BY_ID.get(segment.vocabId) : undefined;
                                                const resolved = exactVocab || fallbackVocab;

                                                if (resolved) {
                                                    setSelectedVocab({
                                                        word: segment.text.toUpperCase(),
                                                        ipa: resolved.ipa,
                                                        translationHint: resolved.translationHint,
                                                        scenario: resolved.scenario,
                                                        level: resolved.level,
                                                    });
                                                    return;
                                                }

                                                setSelectedVocab({
                                                    word: segment.text.toUpperCase(),
                                                    translationHint: 'Định nghĩa cho từ này đang được cập nhật.',
                                                    scenario: 'Từ này đang được dùng trong ngữ cảnh câu chuyện.',
                                                    level: story.difficultyLevel === 'mixed' ? 'intermediate' : story.difficultyLevel,
                                                });
                                            }}
                                            className="text-cyan-400 font-semibold bg-cyan-500/10 px-1 rounded hover:bg-cyan-500/20 cursor-pointer transition-colors border-b-2 border-cyan-500/30 hover:border-cyan-400"
                                            title="Click to see definition"
                                        >
                                            {segment.text}
                                        </motion.button>
                                    );
                                }
                                return <span key={index}>{segment.text}</span>;
                            })}
                        </div>
                    </motion.div>

                    {/* Vocabulary summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-cyan-400" />
                            Từ vựng trong câu chuyện này
                        </h3>
                        <p className="text-xs text-slate-500">
                            Bạn đã học được {story.vocabularyIds.length} từ được làm nổi bật bên trên
                        </p>
                    </motion.div>

                    {/* Continue to Part 2 CTA (only show if viewing Part 1 and Part 2 is unlocked) */}
                    {showContinueCTA && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-2 border-cyan-500/50 rounded-2xl p-6 space-y-4"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-white">
                                    🎉 Part 2 Ready!
                                </h3>
                                <p className="text-slate-300 text-sm">
                                    Bạn đã hoàn thành 60% câu chuyện. Tiếp tục đọc phần kết?
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    buttonPress();
                                    setShowComprehensionQuiz(true); // Show quiz instead of proceeding
                                }}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Đọc Part 2</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* Full Story Completion (only show if reading full story and scrolled to end) */}
                    {!isPart1Only && hasScrolledToEnd && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-0.5">Hoàn thành câu chuyện</h3>
                                    <p className="text-xs text-slate-400">Làm quiz để kiểm tra comprehension của bạn</p>
                                </div>
                                <button
                                    onClick={() => {
                                        buttonPress();
                                        setShowComprehensionQuiz(true);
                                    }}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-bold transition-all active:scale-95"
                                >
                                    <span>Làm Quiz</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom padding for mobile */}
                    <div className="h-20 lg:h-8" />
                </div>
            </div>

            {/* Bottom hint (mobile only) */}
            {!hasScrolledToEnd && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden sticky bottom-0 bg-slate-900 p-4 text-center border-t border-slate-800"
                >
                    <p className="text-slate-500 text-sm">👇 Cuộn xuống để xem tiếp</p>
                </motion.div>
            )}

            {/* Vocabulary Detail Modal */}
            <AnimatePresence>
                {selectedVocab && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVocab(null)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-slate-800 border-2 border-cyan-500/50 rounded-2xl p-6 z-50 shadow-2xl"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => {
                                    click();
                                    setSelectedVocab(null);
                                }}
                                className="absolute top-4 right-4 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            {/* Word */}
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                                    {selectedVocab.word}
                                </h2>
                                <div className="flex items-center gap-3">
                                    {selectedVocab.ipa && (
                                        <span className="text-slate-400 text-sm font-mono">
                                            {selectedVocab.ipa}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            click();
                                            const utterance = new SpeechSynthesisUtterance(selectedVocab.word);
                                            utterance.lang = 'en-US';
                                            utterance.rate = 0.8;
                                            speechSynthesis.speak(utterance);
                                        }}
                                        className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                                        title="Hear pronunciation"
                                    >
                                        <Volume2 className="w-4 h-4 text-cyan-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Definition */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                                    Meaning
                                </h3>
                                <p className="text-white text-sm">
                                    {selectedVocab.translationHint}
                                </p>
                            </div>

                            {/* Example Scenario */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                                    Example
                                </h3>
                                <p className="text-slate-300 text-sm italic leading-relaxed">
                                    &ldquo;{selectedVocab.scenario || 'Không có ví dụ cho từ này.'}&rdquo;
                                </p>
                            </div>

                            {/* Level Badge */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-500">Level</span>
                                <span className="text-xs font-semibold text-cyan-400 uppercase">
                                    {selectedVocab.level || 'intermediate'}
                                </span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
