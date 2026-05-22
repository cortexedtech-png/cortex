'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { HandHeart, Sprout, Leaf, Sparkles, Trophy, Volume2, ChevronLeft, ChevronRight, X, FlaskConical, Scissors, TrendingUp } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { type VocabCardData as BaseCardData } from './VocabCard';
import { type UserCardProgress } from '../lib/eloAlgorithm';
import SurgeryLab from './SurgeryLab';
import UpgradeLab from './UpgradeLab';
import { AnimatePresence } from 'framer-motion';

type CardWithProgress = Omit<BaseCardData, 'state'> & { progress?: UserCardProgress };

const PAGE_SIZE = 10;

const STATE_ICON = { seed: Sprout, sprout: Leaf, gold: Sparkles, mastered: Trophy } as const;
const STATE_COLOR = { seed: 'text-slate-500', sprout: 'text-cyan-500', gold: 'text-cyan-400', mastered: 'text-amber-400' } as const;
const STATE_LABEL = { seed: 'Mầm non', sprout: 'Đang nhớ', gold: 'Thuộc tốt', mastered: 'Thành thạo' } as const;
const LEVEL_LABEL: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', expert: 'Chuyên gia' };
const LEVEL_COLOR: Record<string, string> = {
    beginner: 'bg-slate-800 text-slate-400 border-slate-700',
    intermediate: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    advanced: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    expert: 'bg-cyan-500/30 text-cyan-200 border-cyan-500/40',
};

function formatNextReviewFull(nextReviewAt?: number, isMastered?: boolean) {
    if (isMastered) return 'Đã thành thạo';
    if (!nextReviewAt) return 'Chưa có lịch ôn';
    const nextReviewDate = new Date(nextReviewAt);
    const now = new Date();
    if (nextReviewAt <= now.getTime()) return 'Cần ôn ngay hôm nay';
    if (nextReviewDate.toDateString() === now.toDateString()) {
        return `Ôn lại lúc ${nextReviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Ôn lại ${nextReviewDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}

function formatNextReview(nextReviewAt?: number, isMastered?: boolean) {
    if (isMastered) return 'Mastered';
    if (!nextReviewAt) return 'Chưa có lịch ôn';
    const nextReviewDate = new Date(nextReviewAt);
    const now = new Date();
    if (nextReviewAt <= now.getTime()) return 'Hôm nay';
    if (nextReviewDate.toDateString() === now.toDateString()) {
        return nextReviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return nextReviewDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function highlightWord(sentence: string, word: string) {
    const regex = new RegExp(`(${word})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, i) =>
        regex.test(part)
            ? <span key={i} className="text-cyan-300 font-bold">{part}</span>
            : <span key={i}>{part}</span>
    );
}

function WordDetailModal({ card, onClose }: { card: CardWithProgress; onClose: () => void }) {
    const state = card.progress?.state || 'seed';
    const StateIcon = STATE_ICON[state];
    const stateColor = STATE_COLOR[state];
    const [labMode, setLabMode] = useState<'none' | 'surgery' | 'upgrade'>('none');
    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(card.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-6 sm:pb-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Word header */}
                <div className="mb-5">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-bold text-white tracking-wide">{card.word}</span>
                        <button onClick={speakWord} className="text-slate-500 hover:text-cyan-400 transition-colors">
                            <Volume2 className="w-5 h-5" />
                        </button>
                    </div>
                    {card.ipa && (
                        <p className="text-slate-500 font-mono text-sm mb-2">/{card.ipa}/</p>
                    )}
                    <p className="text-slate-300 text-base">{card.translationHint}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${LEVEL_COLOR[card.level] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                        {LEVEL_LABEL[card.level] || card.level}
                    </span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium ${stateColor}`}>
                        <StateIcon className="w-3 h-3" />
                        {STATE_LABEL[state]}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 font-mono">
                        ELO {card.elo}
                    </span>
                </div>

                {/* Example sentence */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Ví dụ</p>
                    <p className="text-slate-200 text-sm leading-relaxed italic">
                        &ldquo;{highlightWord(card.scenario, card.word)}&rdquo;
                    </p>
                </div>

                {/* SRS info */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Lịch ôn tập</span>
                    <span className={card.progress?.state === 'mastered' ? 'text-amber-400' :
                        (card.progress?.nextReviewAt && card.progress.nextReviewAt <= (now || 0) ? 'text-amber-400' : 'text-slate-400')}>
                        {formatNextReviewFull(card.progress?.nextReviewAt, card.progress?.state === 'mastered')}
                    </span>
                </div>

                {/* Deep Dive Labs */}
                {(card.surgeryModule || card.upgradeModule) && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase mb-4">
                            <FlaskConical className="w-4 h-4 text-cyan-400" />
                            Deep Dive Training
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {card.surgeryModule && (
                                <button
                                    onClick={() => setLabMode('surgery')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-500/20 border-2 border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 transition-all group"
                                >
                                    <Scissors className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold text-cyan-200 uppercase tracking-tight">Surgery Lab</span>
                                </button>
                            )}
                            {card.upgradeModule && (
                                <button
                                    onClick={() => setLabMode('upgrade')}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-500/20 border-2 border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 transition-all group"
                                >
                                    <TrendingUp className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold text-amber-200 uppercase tracking-tight">Upgrade Lab</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Lab Overlays */}
            <AnimatePresence>
                {labMode === 'surgery' && card.surgeryModule && (
                    <div
                        className="fixed inset-0 z-[120] bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SurgeryLab
                            word={card.word}
                            module={card.surgeryModule}
                            onSuccess={() => setLabMode('none')}
                            onFail={() => { }}
                            onClose={() => setLabMode('none')}
                        />
                    </div>
                )}
                {labMode === 'upgrade' && card.upgradeModule && (
                    <div
                        className="fixed inset-0 z-[120] bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UpgradeLab
                            word={card.word}
                            module={card.upgradeModule}
                            onSuccess={() => setLabMode('none')}
                            onFail={() => { }}
                            onClose={() => setLabMode('none')}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function LearnedWordsList() {
    const learnedWordsSize = useLexicaStore(state => state.learnedWords.size);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const [page, setPage] = useState(0);
    const [selectedCard, setSelectedCard] = useState<CardWithProgress | null>(null);
    const [now, setNow] = useState<number>(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const learnedWords = useMemo(() => {
        return useLexicaStore.getState().getLearnedWordsList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [learnedWordsSize]);

    const learnedCards = useMemo(() => {
        return learnedWords
            .map(cardId => {
                const card = VOCAB_DATABASE.find(c => c.id === cardId);
                const progress = cardProgress[cardId];
                return card ? { ...card, progress } : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                const stateOrder = { mastered: 0, gold: 1, sprout: 2, seed: 3 };
                return (stateOrder[a!.progress?.state || 'seed'] || 999) - (stateOrder[b!.progress?.state || 'seed'] || 999);
            }) as CardWithProgress[];
    }, [learnedWords, cardProgress]);

    const totalPages = Math.ceil(learnedCards.length / PAGE_SIZE);
    const pageCards = learnedCards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const speakWord = useCallback((e: React.MouseEvent, word: string) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    if (learnedCards.length === 0) {
        return (
            <div className="text-slate-500 text-center py-8 flex flex-col items-center gap-2">
                <HandHeart className="w-8 h-8" />
                <p>Chưa học từ nào. Bắt đầu swipe thôi!</p>
            </div>
        );
    }

    return (
        <div>
            {selectedCard && (
                <WordDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
            )}
            <div className="space-y-1.5">
                {pageCards.map(card => {
                    if (!card) return null;
                    const state = card.progress?.state || 'seed';
                    const StateIcon = STATE_ICON[state];
                    const stateColor = STATE_COLOR[state];
                    const reviewLabel = formatNextReview(card.progress?.nextReviewAt, state === 'mastered');
                    const isDue = state !== 'mastered' && card.progress?.nextReviewAt && card.progress.nextReviewAt <= (now || 0);

                    return (
                        <button
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 hover:bg-slate-700/50 transition-all text-left cursor-pointer group"
                        >
                            <StateIcon className={`w-3.5 h-3.5 shrink-0 ${stateColor}`} />
                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{card.word}</span>
                                    <span
                                        onClick={(e) => speakWord(e, card.word)}
                                        className="text-slate-600 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                                        title="Nghe phát âm"
                                    >
                                        <Volume2 className="w-3 h-3" />
                                    </span>
                                    {(card.surgeryModule || card.upgradeModule) && (
                                        <div className="flex gap-1 shrink-0">
                                            {card.surgeryModule && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" title="Có Surgery Lab" />}
                                            {card.upgradeModule && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" title="Có Upgrade Lab" />}
                                        </div>
                                    )}
                                </div>
                                <span className="text-slate-500 text-[10px] md:text-xs truncate">{card.translationHint}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] md:text-xs ${isDue ? 'text-amber-400' : 'text-slate-600'}`}>
                                    {reviewLabel}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </button>
                    <span className="text-xs text-slate-500">
                        {page + 1} / {totalPages} ({learnedCards.length} từ)
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
