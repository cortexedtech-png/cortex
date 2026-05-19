'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Sparkles, Trophy, Swords, Eye, Volume2, Check, X as XIcon, Mic, RotateCcw } from 'lucide-react';
import { useVocalSwipe } from '../hooks/useVocalSwipe';
import { useLexicaStore } from '../store/lexicaStore';
import ReviewQuiz from './ReviewQuiz';

export type CardState = 'seed' | 'sprout' | 'gold' | 'mastered';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface VocabCardData {
    id: string;
    word: string;
    ipa?: string;
    elo: number;
    level: DifficultyLevel;
    scenario: string;
    translationHint: string;
    state: CardState;
    isBossCard?: boolean;

    upgradeModule?: {
        simpleSentence: string;
        targetSlot: string;
        academicOptions: {
            text: string;
            nuance: string;
            formalityScore: number;
        }[];
    };

    surgeryModule?: {
        prefix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        prefix2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        root: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        root2?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
        suffix?: { text: string; meaning: string; relatedWords?: { word: string; meaning: string }[] };
    };
}

interface VocabCardProps {
    card: VocabCardData;
    index: number;
    onSwipe: (direction: 'left' | 'right', source?: 'manual' | 'voice' | 'quiz') => void;
    revealed?: boolean;
    onReveal?: () => void;
}

export default function VocabCard({ card, index, onSwipe, revealed: controlledRevealed, onReveal }: VocabCardProps) {
    const [internalRevealed, setInternalRevealed] = useState(false);
    const swipeMode = useLexicaStore(state => state.swipeMode);
    const cardProgress = useLexicaStore(state => state.cardProgress[card.id]);
    const markAsMastered = useLexicaStore(state => state.markAsMastered);

    const revealed = controlledRevealed !== undefined ? controlledRevealed : internalRevealed;
    const handleReveal = onReveal ?? (() => setInternalRevealed(true));

    const isBossCard = card.isBossCard || false;
    const isVoiceSwipeRequired = isBossCard || (swipeMode === 'voice' && index === 0);
    const isReviewCard = Boolean(cardProgress);

    const handleMarkAsMastered = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAsMastered(card.id);
    };

    const speakWord = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(card.word);

            // Get available voices and find an English one
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice =>
                voice.lang.startsWith('en-') && voice.lang !== 'en-VI'
            );

            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            utterance.lang = 'en-US';
            utterance.rate = 0.8;

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    };

    const {
        state: vocalState,
        hitsRemaining,
        streakCount,
        startListening,
        stopListening,
        setHolding,
        canStartListening,
    } = useVocalSwipe({
        targetWord: card.word,
        onSuccess: () => {
            onSwipe('right', 'voice');
        },
        enabled: isVoiceSwipeRequired,
    });

    return (
        <div className="relative w-full">
            <motion.div
                data-tour-id="swipe-actions"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.7}
                whileDrag={{ scale: 1.05 }}
                onDragEnd={(_event, info) => {
                    const threshold = 150;
                    if (Math.abs(info.offset.x) > threshold) {
                        const direction = info.offset.x > 0 ? 'right' : 'left';
                        if (direction === 'right' && isVoiceSwipeRequired) return;
                        onSwipe(direction);
                    }
                }}
                animate={{ y: index * 5, scale: 1 - index * 0.02, rotate: 0 }}
                className="w-full"
                style={{ userSelect: 'none', zIndex: 100 - index }}
            >
                <div
                    className="relative mx-4 h-100 rounded-2xl bg-slate-800 p-6 border border-slate-700 overflow-hidden"
                    style={{ boxShadow: index > 0 ? '0 -4px 12px rgba(0,0,0,0.3)' : 'none' }}
                >
                    {/* Normal content */}
                    {isBossCard && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 text-[10px] font-bold uppercase flex items-center gap-1">
                            <Swords className="w-3 h-3" /> BOSS
                        </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-60">
                        {card.state === 'seed' && <div className="p-1 bg-slate-700/30 rounded-lg"><Sprout className="w-4 h-4 text-green-400" /></div>}
                        {card.state === 'sprout' && <div className="p-1 bg-slate-700/30 rounded-lg"><Leaf className="w-4 h-4 text-cyan-400" /></div>}
                        {card.state === 'gold' && <div className="p-1 bg-slate-700/30 rounded-lg"><Sparkles className="w-4 h-4 text-yellow-400" /></div>}
                        {card.state === 'mastered' && <div className="p-1 bg-slate-700/30 rounded-lg"><Trophy className="w-4 h-4 text-yellow-400" /></div>}
                    </div>
                    <div className="absolute top-3 left-3 px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500 text-[10px] font-mono opacity-60">
                        {card.elo}
                    </div>
                    {isReviewCard && (
                        <div className="absolute top-10 left-3 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-300/15 text-amber-300 text-[10px] font-semibold flex items-center gap-1 opacity-80">
                            <RotateCcw className="w-2.5 h-2.5" />
                            ÔN
                        </div>
                    )}

                    <div className={`${isBossCard ? 'mt-16' : 'mt-12'} mb-8 text-center`}>
                        <p className="text-lg text-slate-200 leading-relaxed">{card.scenario}</p>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                        {isVoiceSwipeRequired ? (
                            /* Voice mode: word info always visible + mic controls */
                            <div className="space-y-2">
                                {/* Word + IPA + meaning — all in one card */}
                                <div className="px-3 py-2.5 rounded-lg border bg-slate-700/60 border-slate-600">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-100 font-semibold text-sm">{card.word}</span>
                                                {card.ipa && <span className="text-slate-500 text-xs font-mono">/{card.ipa}/</span>}
                                            </div>
                                            <p className="text-slate-400 text-xs truncate">{card.translationHint}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); speakWord(); }}
                                            className="shrink-0 text-slate-400 hover:text-cyan-400 transition-colors"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onPointerDown={(e) => { e.preventDefault(); setHolding(true); startListening(); }}
                                    onPointerUp={() => { setHolding(false); stopListening(); }}
                                    onPointerLeave={() => { setHolding(false); stopListening(); }}
                                    disabled={!canStartListening}
                                    className={`w-full px-4 py-3 rounded-lg border font-semibold text-sm transition-colors flex items-center justify-center gap-2 select-none touch-none disabled:cursor-not-allowed ${vocalState === 'LISTENING' ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-200 scale-[0.98]' :
                                        vocalState === 'SUCCESS' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' :
                                            vocalState === 'FAIL' ? 'bg-slate-700/80 border-slate-600 text-slate-300' :
                                                vocalState === 'HIT_1' || vocalState === 'HIT_2' ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300' :
                                                    streakCount > 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20' :
                                                        'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                                        }`}
                                >
                                    <Mic className={`w-4 h-4 ${vocalState === 'LISTENING' ? 'animate-pulse' : ''}`} />
                                    {vocalState === 'LISTENING' ? 'Đang nghe...' :
                                        vocalState === 'SUCCESS' ? '✓ Hoàn hảo!' :
                                            vocalState === 'FAIL' ? 'Thử lại' :
                                                vocalState === 'HIT_1' ? '1/3 ✓' :
                                                    vocalState === 'HIT_2' ? '2/3 ✓' :
                                                        streakCount > 0 ? `${streakCount}/3 ✓` :
                                                            'Giữ để nói'}
                                    <div className="ml-auto flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className={`w-2 h-2 rounded-full ${i < 3 - hitsRemaining ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                                        ))}
                                    </div>
                                </button>
                            </div>
                        ) : !revealed ? (
                            <div className="space-y-2">
                                <button data-tour-id="reveal-button" onClick={handleReveal} className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors active:scale-95 flex items-center justify-center gap-2">
                                    <Eye className="w-4 h-4 text-slate-300" />
                                    <p className="text-sm text-slate-300 font-medium">Nhấn để xem nghĩa</p>
                                </button>
                            </div>
                        ) : isReviewCard && index === 0 ? (
                            <ReviewQuiz card={card} onSwipe={onSwipe} />
                        ) : (
                            <div className="space-y-3">
                                <div className="px-4 py-3 rounded-lg bg-slate-700/80 border border-slate-600 w-full">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <p className="text-base text-slate-200 font-medium">{card.word}</p>
                                        <button onClick={(e) => { e.stopPropagation(); speakWord(); }} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {card.ipa && <p className="text-xs text-slate-500 text-center mb-1 font-mono">/{card.ipa}/</p>}
                                    <p className="text-sm text-slate-400 text-center">{card.translationHint}</p>
                                </div>
                                {!isReviewCard && index === 0 && (
                                    <button
                                        onClick={handleMarkAsMastered}
                                        className="w-full py-2 text-[11px] font-bold text-slate-500 hover:text-cyan-400 transition-colors border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg flex items-center justify-center gap-1.5 group"
                                    >
                                        <Check className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        TÔI ĐÃ BIẾT TỪ NÀY
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isVoiceSwipeRequired && (
                    <>
                        <motion.div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <XIcon className="w-16 h-16 text-red-400" />
                        </motion.div>
                        <motion.div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-0" style={{ opacity: 0 }}>
                            <Check className="w-16 h-16 text-green-400" />
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
