'use client';

import { useMemo, useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, RotateCcw, BookOpen, Zap, Flame } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { getDueCards } from '../lib/eloAlgorithm';
import { useSoundEffects } from '../hooks/useSoundEffects';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'word-to-meaning' | 'meaning-to-word' | 'fill-in' | 'context-pick';

interface Question {
    cardId: string;
    type: QuestionType;
    prompt: string;
    answer: string;     // correct answer text
    options: string[];  // 4 shuffled MCQ options (empty for meaning-to-word type-in)
    optionWords?: string[];  // for context-pick: word to blank in each option
    word: string;
    ipa: string;
    scenario: string;   // full scenario for post-answer reveal
    meaning: string;    // translationHint for post-answer reveal
}

interface Result {
    cardId: string;
    word: string;
    correct: boolean;
    type: QuestionType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIMER_SECONDS = 15;

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(answer: string, pool: string[], count = 4): string[] {
    const distractors = shuffle(pool.filter(s => s !== answer)).slice(0, count - 1);
    return shuffle([answer, ...distractors]);
}

function blank(sentence: string, word: string): string {
    return sentence.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '______');
}

function highlightBlank(sentence: string) {
    const parts = sentence.split('______');
    return parts.map((p, i) => (
        i < parts.length - 1
            ? <span key={i}>{p}<span className="inline-block bg-slate-600 rounded px-2 mx-0.5 text-slate-600 select-none font-mono">______</span></span>
            : <span key={i}>{p}</span>
    ));
}

function highlightWord(sentence: string, word: string) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = sentence.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) =>
        p.toLowerCase() === word.toLowerCase()
            ? <span key={i} className="text-cyan-400 font-bold">{p}</span>
            : <span key={i}>{p}</span>
    );
}

function buildQuestions(dueCardIds: string[]): Question[] {
    const wordPool = VOCAB_DATABASE.map(c => c.word);
    const meaningPool = VOCAB_DATABASE.map(c => c.translationHint);
    const types: QuestionType[] = ['word-to-meaning', 'meaning-to-word', 'fill-in', 'context-pick'];

    return shuffle(dueCardIds).map(cardId => {
        const card = VOCAB_DATABASE.find(c => c.id === cardId);
        if (!card) return null;

        const type = types[Math.floor(Math.random() * types.length)];
        const base = {
            cardId,
            word: card.word,
            ipa: card.ipa ?? '',
            scenario: card.scenario,
            meaning: card.translationHint,
        };

        if (type === 'word-to-meaning') {
            return { ...base, type, prompt: card.word, answer: card.translationHint, options: buildOptions(card.translationHint, meaningPool) };
        }
        if (type === 'meaning-to-word') {
            return { ...base, type, prompt: card.translationHint, answer: card.word.toUpperCase(), options: [] };
        }
        if (type === 'fill-in') {
            return {
                ...base, type,
                prompt: blank(card.scenario, card.word),
                answer: card.word.toUpperCase(),
                options: buildOptions(card.word.toUpperCase(), wordPool.map(w => w.toUpperCase())),
            };
        }
        // context-pick: which sentence fits this word?
        const distractorCards = shuffle(VOCAB_DATABASE.filter(c => c.id !== cardId)).slice(0, 3);
        const allOptions = shuffle([
            { scenario: card.scenario, word: card.word },
            ...distractorCards.map(c => ({ scenario: c.scenario, word: c.word }))
        ]);
        return {
            ...base,
            type,
            prompt: card.word,
            answer: card.scenario,
            options: allOptions.map(o => o.scenario),
            optionWords: allOptions.map(o => o.word),
        };
    }).filter(Boolean) as Question[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TYPE_LABEL: Record<QuestionType, string> = {
    'word-to-meaning': 'Từ → Nghĩa',
    'meaning-to-word': 'Nghĩa → Từ  ·  gõ đáp án',
    'fill-in': 'Điền từ vào câu',
    'context-pick': 'Câu nào dùng đúng từ này?',
};

function RevealPanel({ question, onContinue }: { question: Question; onContinue: () => void }) {
    const { buttonPress } = useSoundEffects();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-white/20 bg-white/[0.03] p-4"
        >
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Đáp án đúng</p>
            <div className="flex items-baseline gap-2.5 mb-1">
                <p className="text-2xl font-bold text-white tracking-wide">{question.word}</p>
                {question.ipa && <p className="text-slate-500 text-sm font-mono">/{question.ipa}/</p>}
            </div>
            <p className="text-cyan-300 text-sm mb-3">{question.meaning}</p>
            <p className="text-slate-400 text-sm italic leading-relaxed border-t border-slate-700/60 pt-3">
                &ldquo;{highlightWord(question.scenario, question.word)}&rdquo;
            </p>
            <button
                onClick={() => {
                    buttonPress();
                    onContinue();
                }}
                className="mt-4 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors active:scale-95"
            >
                Tiếp tục →
            </button>
        </motion.div>
    );
}

function QuestionCard({
    question,
    index,
    total,
    streak,
    onAnswer,
}: {
    question: Question;
    index: number;
    total: number;
    streak: number;
    onAnswer: (correct: boolean) => void;
}) {
    const { click } = useSoundEffects();
    const [selected, setSelected] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [typedInput, setTypedInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [showReveal, setShowReveal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Countdown timer
    useEffect(() => {
        if (answered) return;
        if (timeLeft <= 0) {
            const t = setTimeout(() => {
                setAnswered(true);
                setIsCorrect(false);
                setShowReveal(true);
            }, 0);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, answered]);

    // Auto-focus type-in input
    useEffect(() => {
        if (question.type === 'meaning-to-word') inputRef.current?.focus();
    }, [question.type]);

    const handleSelect = (option: string) => {
        if (answered) return;
        click();
        setSelected(option);
        setAnswered(true);
        const correct = option === question.answer;
        setIsCorrect(correct);
        if (correct) {
            setTimeout(() => onAnswer(true), 900);
        } else {
            setShowReveal(true);
        }
    };

    const handleTypeSubmit = () => {
        if (answered || typedInput.trim().length === 0) return;
        click();
        const correct = typedInput.trim().toUpperCase() === question.answer;
        setAnswered(true);
        setIsCorrect(correct);
        if (correct) {
            setTimeout(() => onAnswer(true), 900);
        } else {
            setShowReveal(true);
        }
    };

    const timerPct = (timeLeft / TIMER_SECONDS) * 100;
    const promptBorder = answered
        ? 'bg-white/[0.03] border-white/30'
        : 'bg-white/[0.02] border-white/20';

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Progress bar + counter + streak badge */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${(index / total) * 100}%` }}
                    />
                </div>
                <span className="text-slate-400 text-xs font-medium shrink-0">{index + 1}/{total}</span>
                <AnimatePresence>
                    {streak >= 3 && (
                        <motion.span
                            key="streak"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shrink-0"
                        >
                            <Flame className="w-3 h-3" /> {streak}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Timer bar */}
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-5">
                {!answered && (
                    <motion.div
                        className="h-full bg-cyan-400 rounded-full"
                        animate={{ width: `${timerPct}%` }}
                        transition={{ duration: 0.95, ease: 'linear' }}
                    />
                )}
            </div>

            {/* Question prompt */}
            <div className={`border rounded-xl p-5 mb-4 transition-colors duration-300 ${promptBorder}`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2.5">{TYPE_LABEL[question.type]}</p>

                {question.type === 'fill-in' ? (
                    <p className="text-slate-200 text-base leading-relaxed italic">
                        &ldquo;{highlightBlank(question.prompt)}&rdquo;
                    </p>
                ) : question.type === 'meaning-to-word' ? (
                    <p className="text-slate-200 text-base leading-relaxed">{question.prompt}</p>
                ) : (
                    <p className="text-3xl font-bold text-white tracking-wide">{question.prompt}</p>
                )}

                {answered && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${isCorrect ? 'text-cyan-400' : 'text-slate-400'}`}
                    >
                        {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {isCorrect ? 'Chính xác!' : timeLeft <= 0 ? 'Hết giờ!' : 'Sai rồi'}
                    </motion.div>
                )}
            </div>

            {/* MCQ options (all types except meaning-to-word) */}
            {question.type !== 'meaning-to-word' && (
                <div className="space-y-2">
                    {question.options.map((option, i) => {
                        const isSelected = selected === option;
                        const isCorrectOpt = option === question.answer;
                        let cls = 'bg-white/[0.02] border-white/20 text-slate-300 hover:border-cyan-500/50 hover:bg-white/[0.04] active:scale-[0.99]';
                        if (answered && isCorrectOpt) cls = 'bg-cyan-500/10 border-cyan-500/50 text-white';
                        else if (answered && isSelected && !isCorrectOpt) cls = 'bg-white/[0.03] border-white/30 text-slate-400';
                        else if (answered) cls = 'bg-white/[0.01] border-white/5 text-slate-600';

                        const isLong = question.type === 'context-pick';
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(option)}
                                disabled={answered}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-left transition-all flex items-start gap-3 ${cls}`}
                            >
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                                    {answered && isCorrectOpt ? <Check className="w-3 h-3" /> :
                                        answered && isSelected && !isCorrectOpt ? <X className="w-3 h-3" /> :
                                            String.fromCharCode(65 + i)}
                                </span>
                                <span className={isLong ? 'italic leading-snug' : ''}>
                                    {isLong
                                        ? highlightBlank(blank(option, question.optionWords?.[i] ?? question.word))
                                        : option}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Type-in input (meaning-to-word) */}
            {question.type === 'meaning-to-word' && (
                <div className="space-y-3">
                    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 transition-colors ${answered
                        ? isCorrect ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/30 bg-white/[0.03]'
                        : 'border-white/20 bg-white/[0.02] focus-within:border-cyan-500'
                        }`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={typedInput}
                            onChange={e => setTypedInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
                            disabled={answered}
                            placeholder="Gõ từ tiếng Anh..."
                            className="flex-1 bg-transparent text-white text-xl font-bold tracking-widest outline-none placeholder:text-slate-600 placeholder:font-normal placeholder:text-base placeholder:tracking-normal"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {answered && isCorrect && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                        {answered && !isCorrect && <X className="w-5 h-5 text-slate-400 shrink-0" />}
                    </div>
                    {!answered ? (
                        <button
                            onClick={handleTypeSubmit}
                            disabled={typedInput.trim().length === 0}
                            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors active:scale-95"
                        >
                            Kiểm tra →
                        </button>
                    ) : !isCorrect && (
                        <p className="text-slate-400 text-sm text-center">
                            Đáp án: <span className="text-white font-bold tracking-wider">{question.answer}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Reveal panel after wrong answer */}
            {showReveal && (
                <RevealPanel question={question} onContinue={() => { setShowReveal(false); onAnswer(false); }} />
            )}
        </motion.div>
    );
}

function ResultScreen({
    results,
    maxStreak,
    onRetry,
}: {
    results: Result[];
    maxStreak: number;
    onRetry: () => void;
}) {
    const { buttonPress } = useSoundEffects();
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const accuracy = Math.round((correct / total) * 100);
    const wrong = results.filter(r => !r.correct);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Score */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{accuracy}%</p>
                <p className="text-slate-400 text-sm">{correct}/{total} câu đúng</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/[0.02] border border-white/20 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-500 font-medium mb-1">Độ chính xác</p>
                    <p className="text-2xl font-bold text-white">{accuracy}%</p>
                </div>
                <div className="bg-white/[0.02] border border-white/20 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-500 font-medium mb-1">Combo cao nhất</p>
                    <p className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-1">
                        {maxStreak >= 3 && <Flame className="w-4 h-4" />}{maxStreak}
                    </p>
                </div>
            </div>

            {/* Accuracy bar */}
            <div className="h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden mb-5">
                <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${accuracy}%` }}
                />
            </div>

            {/* Wrong answers review */}
            {wrong.length > 0 && (
                <div className="mb-5">
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2.5">Xem lại từ sai ({wrong.length})</p>
                    <div className="space-y-2">
                        {wrong.map(r => {
                            const card = VOCAB_DATABASE.find(c => c.id === r.cardId);
                            return (
                                <div key={r.cardId} className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/20 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-white font-bold tracking-wide text-sm">{r.word}</span>
                                        {card?.ipa && <span className="text-slate-500 text-xs font-mono">/{card.ipa}/</span>}
                                    </div>
                                    {card && (
                                        <>
                                            <p className="text-cyan-400 text-xs pl-5">{card.translationHint}</p>
                                            <p className="text-slate-500 text-xs italic pl-5 leading-snug">
                                                &ldquo;{highlightWord(card.scenario, r.word)}&rdquo;
                                            </p>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
                {wrong.length > 0 && (
                    <button
                        onClick={() => {
                            buttonPress();
                            onRetry();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 bg-white/[0.02] text-slate-300 hover:border-cyan-500/50 hover:text-white hover:bg-white/[0.04] transition-all text-sm font-semibold active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Ôn lại từ sai ({wrong.length})
                    </button>
                )}
                <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-colors active:scale-95"
                >
                    <Zap className="w-4 h-4" />
                    Học tiếp
                </Link>
                <Link
                    href="/learned"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30 text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                    <BookOpen className="w-4 h-4" />
                    Xem từ đã học
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ReviewPageContent() {
    const searchParams = useSearchParams();
    const testAll = searchParams.get('all') === '1';

    const cardProgress = useLexicaStore(state => state.cardProgress);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const submitReviewAnswer = useLexicaStore(state => state.submitReviewAnswer);

    const dueCardIds = useMemo(() => {
        if (testAll) {
            // Test mode: use all learned words that exist in VOCAB_DATABASE
            const vocabIds = new Set(VOCAB_DATABASE.map(c => c.id));
            return Array.from(learnedWords).filter(id => vocabIds.has(id));
        }
        return getDueCards(cardProgress).map(p => p.cardId);
    }, [cardProgress, learnedWords, testAll]);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<Result[]>([]);
    const [done, setDone] = useState(false);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);

    // Build questions once dueCardIds is known (store may hydrate after mount)
    useEffect(() => {
        if (dueCardIds.length > 0 && questions.length === 0 && !done) {
            const t = setTimeout(() => setQuestions(buildQuestions(dueCardIds)), 0);
            return () => clearTimeout(t);
        }
    }, [dueCardIds, questions.length, done]);

    const handleAnswer = useCallback((correct: boolean) => {
        const q = questions[currentIndex];
        const card = VOCAB_DATABASE.find(c => c.id === q.cardId);

        submitReviewAnswer(q.cardId, correct);

        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));

        const newResult: Result = {
            cardId: q.cardId,
            word: card?.word ?? q.cardId,
            correct,
            type: q.type,
        };

        setResults(prev => [...prev, newResult]);

        if (currentIndex + 1 >= questions.length) {
            setDone(true);
        } else {
            setCurrentIndex(i => i + 1);
        }
    }, [questions, currentIndex, submitReviewAnswer, streak]);

    const handleRetry = useCallback(() => {
        const wrongIds = results.filter(r => !r.correct).map(r => r.cardId);
        const retryQuestions = buildQuestions(wrongIds);
        setQuestions(retryQuestions);
        setCurrentIndex(0);
        setResults([]);
        setDone(false);
        setStreak(0);
        setMaxStreak(0);
    }, [results]);

    // No due cards (store hydrated, genuinely empty)
    if (dueCardIds.length === 0 && questions.length === 0 && !done) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-2">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Không có từ cần ôn!</h1>
                <p className="text-slate-400 text-sm max-w-xs">Bạn đã ôn hết tất cả từ đến hạn. Tiếp tục học từ mới nhé.</p>
                <Link
                    href="/"
                    className="mt-4 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-colors"
                >
                    Học từ mới
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group text-sm"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Thoát
                    </Link>
                    <div className="text-center">
                        <p className="text-white font-bold">Ôn tập</p>
                        <p className="text-slate-500 text-xs">{testAll ? `${dueCardIds.length} từ (test)` : `${dueCardIds.length} từ đến hạn`}</p>
                    </div>
                    <div className="w-12" /> {/* spacer */}
                </div>

                <AnimatePresence mode="wait">
                    {done ? (
                        <ResultScreen key="results" results={results} maxStreak={maxStreak} onRetry={handleRetry} />
                    ) : questions.length === 0 ? (
                        <div key="loading" className="flex justify-center py-20">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
                        </div>
                    ) : (
                        <QuestionCard
                            key={currentIndex}
                            question={questions[currentIndex]}
                            index={currentIndex}
                            total={questions.length}
                            streak={streak}
                            onAnswer={handleAnswer}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Wrapper với Suspense boundary ────────────────────────────────────────────

function ReviewPageFallback() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<ReviewPageFallback />}>
            <ReviewPageContent />
        </Suspense>
    );
}
