'use client';

import Link from 'next/link';
import { BookOpen, Trophy, Save, Sparkles, BookMarked, RotateCcw, Gamepad2, FlaskConical, ArrowDown } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import GameHub from '../components/GameHub';
import { getProgressStats } from '../lib/eloAlgorithm';
import LearnedWordsList from '../components/LearnedWordsList';
import SRSCalendar from '../components/SRSCalendar';
import OnboardingModal from '../components/OnboardingModal';
import { useState, useMemo, useEffect } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

export default function LearnedPage() {
    const [showHelp, setShowHelp] = useState(false);
    const [showGameHub, setShowGameHub] = useState(false);
    const [showLabsGuide, setShowLabsGuide] = useState(false);
    const { buttonPress, click } = useSoundEffects();
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const todayLearnedWords = useLexicaStore(state => state.todayLearnedWords);
    const masteredCount = useLexicaStore(state => state.getMasteredWordsCount());
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const progressStats = getProgressStats(cardProgress);

    // Get words with lab modules
    const labWords = useMemo(() => {
        const learnedWordIds = Array.from(learnedWords);
        return VOCAB_DATABASE.filter(card =>
            learnedWordIds.includes(card.id) &&
            (card.surgeryModule || card.upgradeModule)
        );
    }, [learnedWords]);

    // Auto-dismiss guide and scroll
    useEffect(() => {
        if (showLabsGuide) {
            // Scroll to vocabulary section immediately
            document.getElementById('vocabulary-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                setShowLabsGuide(false);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [showLabsGuide]);

    return (
        <div className="min-h-screen bg-slate-900 px-3 sm:px-4 py-6 sm:py-8 pb-20">
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

                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                        <BookOpen className="w-7 sm:w-8 h-7 sm:h-8 text-cyan-400" />
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                            Từ đã học
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-6 sm:gap-8 text-base flex-wrap">
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Tổng số</span>
                            <span className="text-white font-bold text-xl sm:text-2xl tracking-tight">{learnedCount}</span>
                        </div>
                        <div className="w-px h-8 sm:h-10 bg-slate-800"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Thành thạo</span>
                            <span className="text-amber-400 font-bold text-xl sm:text-2xl tracking-tight flex items-center gap-1.5">
                                {masteredCount}
                                <Trophy className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {learnedCount > 0 && (
                    <div className="mb-6 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/40 rounded-xl sm:rounded-2xl border border-slate-700/50">
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
                <div id="practice-section" className="max-w-5xl mx-auto mb-6 sm:mb-8">
                    <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-cyan-400" />
                        Thực hành
                    </h2>
                    <div className="space-y-3">
                        <button
                            data-tour-id="game-hub-button"
                            onClick={() => {
                                buttonPress();
                                setShowGameHub(true);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-[1.01] active:scale-95 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-700/50">
                                    <Gamepad2 className="w-5 h-5 text-slate-200" />
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-semibold text-sm mb-1">
                                        Vocabulary Games
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        7 games để ôn tập từ vựng
                                    </div>
                                </div>
                            </div>
                            <span className="text-slate-400 text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                        </button>

                        {progressStats.dueToday > 0 && (
                            <Link href="/review" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-[1.01] active:scale-95 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-700/50">
                                        <RotateCcw className="w-5 h-5 text-slate-200" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold text-sm">Ôn tập hôm nay</div>
                                        <div className="text-slate-400 text-xs">{progressStats.dueToday} từ cần ôn</div>
                                    </div>
                                </div>
                                <span className="text-slate-400 text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        )}

                        <Link
                            href="/stories"
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-[1.01] active:scale-95 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-700/50">
                                    <BookMarked className="w-5 h-5 text-slate-200" />
                                </div>
                                <div>
                                    <div className="text-white font-semibold text-sm mb-0.5">Story Packs</div>
                                    <div className="text-slate-400 text-xs">
                                        Thực hành qua câu chuyện dark comedy
                                    </div>
                                </div>
                            </div>
                            <span className="text-slate-400 text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                        </Link>

                        {labWords.length > 0 && (
                            <button
                                onClick={() => {
                                    buttonPress();
                                    setShowLabsGuide(true);
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-[1.01] active:scale-95 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-700/50">
                                        <FlaskConical className="w-5 h-5 text-slate-200" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-semibold text-sm mb-0.5">Deep Dive Labs</div>
                                        <div className="text-slate-400 text-xs">
                                            {labWords.length} từ có Surgery/Upgrade module
                                        </div>
                                    </div>
                                </div>
                                <span className="text-slate-400 text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Vocabulary Warehouse Section */}
            <div id="vocabulary-section" className="max-w-5xl mx-auto mb-6 sm:mb-8">
                {/* Labs Guide Hint */}
                {showLabsGuide && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center gap-2 sm:gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ArrowDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 flex-shrink-0" />
                        <p className="text-cyan-300 text-xs sm:text-sm flex-1">
                            Nhấn vào bất kỳ từ nào để xem Surgery Lab và Upgrade Lab
                        </p>
                        <button
                            onClick={() => setShowLabsGuide(false)}
                            className="text-cyan-400/60 hover:text-cyan-400 text-lg leading-none flex-shrink-0"
                        >
                            ×
                        </button>
                    </div>
                )}

                <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    Kho từ vựng
                </h2>

                {/* SRS Calendar */}
                <div className="mb-4 sm:mb-6">
                    <SRSCalendar cardProgress={cardProgress} />
                </div>

                {/* Learned Words List */}
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
