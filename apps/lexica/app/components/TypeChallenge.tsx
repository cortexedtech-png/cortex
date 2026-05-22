'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Trophy, X, Clock, Zap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

import { VocabCardData } from './VocabCard';

interface TypeChallengeProps {
    learnedWordIds: string[];
    onClose: () => void;
}

export default function TypeChallenge({ learnedWordIds, onClose }: TypeChallengeProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();
    const inputRef = useRef<HTMLInputElement>(null);

    const [currentCard, setCurrentCard] = useState<Omit<VocabCardData, 'state'> | null>(null);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [time, setTime] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('typeChallenge_highScore');
        return saved ? parseInt(saved) : null;
    });
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    useEffect(() => {
        if (!isPlaying || gameOver) return;
        const timer = setInterval(() => {
            setTime(t => {
                if (t <= 1) {
                    setGameOver(true);
                    if (score > (highScore || 0)) {
                        setHighScore(score);
                        localStorage.setItem('typeChallenge_highScore', score.toString());
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlaying, gameOver, score, highScore]);

    const getRandomWord = () => {
        const randomId = learnedWordIds[Math.floor(Math.random() * learnedWordIds.length)];
        return VOCAB_DATABASE.find(card => card.id === randomId);
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setAnswered(0);
        setTime(60);
        setInput('');
        setFeedback(null);
        setCurrentCard(getRandomWord() ?? null);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const checkAnswer = () => {
        if (!currentCard || !input.trim()) return;

        const userAnswer = input.trim().toLowerCase();
        const correctAnswer = currentCard.word.toLowerCase();

        if (userAnswer === correctAnswer) {
            quizCorrect();
            setFeedback('correct');
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) setBestStreak(newStreak);

            // Score: 100 base + 50 per streak
            const points = 100 + (newStreak * 50);
            setScore(s => s + points);
            setAnswered(a => a + 1);

            setTimeout(() => {
                setInput('');
                setFeedback(null);
                setCurrentCard(getRandomWord() ?? null);
                inputRef.current?.focus();
            }, 500);
        } else {
            quizWrong();
            setFeedback('wrong');
            setStreak(0);

            setTimeout(() => {
                setFeedback(null);
                setInput('');
                setCurrentCard(getRandomWord() ?? null);
                inputRef.current?.focus();
            }, 1000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:max-w-2xl bg-slate-800 border-0 md:border border-slate-700 md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative min-h-full md:min-h-0 md:max-h-[90vh] md:overflow-y-auto"
            >
                <button
                    onClick={() => { click(); onClose(); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Keyboard className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Type Challenge</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Gõ từ tiếng Anh từ nghĩa tiếng Việt - 60 giây!
                    </p>
                </div>

                {!isPlaying && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Keyboard className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Cách chơi</h3>
                            <div className="text-sm text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Nhìn nghĩa tiếng Việt</p>
                                <p>• Gõ từ tiếng Anh chính xác</p>
                                <p>• Càng nhanh càng nhiều điểm</p>
                                <p>• Streak +50 điểm mỗi câu</p>
                            </div>
                        </div>

                        {highScore !== null && (
                            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
                                <Trophy className="w-4 h-4" />
                                <span>High Score: {highScore}</span>
                            </div>
                        )}

                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all"
                        >
                            Bắt đầu
                        </button>
                    </motion.div>
                )}

                {isPlaying && !gameOver && currentCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Stats Bar */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span className={`font-bold ${time <= 10 ? 'text-red-400' : 'text-white'}`}>
                                    {time}s
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span className="font-bold text-cyan-400">
                                    Streak: {streak}
                                </span>
                            </div>
                            <div className="text-white font-bold">
                                {score}
                            </div>
                        </div>

                        {/* Question */}
                        <div className="p-8 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
                            <p className="text-xs text-slate-500 mb-2">Nghĩa tiếng Việt:</p>
                            <p className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                {currentCard.translationHint}
                            </p>
                        </div>

                        {/* Input */}
                        <div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type the English word..."
                                className={`w-full px-4 py-3 bg-slate-700 border-2 rounded-lg text-white text-lg text-center transition-all outline-none ${feedback === 'correct'
                                    ? 'border-green-500 bg-green-500/10'
                                    : feedback === 'wrong'
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-slate-600 focus:border-cyan-500'
                                    }`}
                                disabled={feedback !== null}
                            />
                            {feedback === 'wrong' && (
                                <p className="text-sm text-red-400 text-center mt-2">
                                    Correct: {currentCard.word}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={checkAnswer}
                            disabled={!input.trim() || feedback !== null}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-all"
                        >
                            Submit (Enter)
                        </button>

                        <div className="text-center text-xs text-slate-500">
                            {answered} answered
                        </div>
                    </motion.div>
                )}

                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <Trophy className="w-16 h-16 text-cyan-400 mx-auto" />
                        <h3 className="text-2xl font-bold text-white">Time&apos;s Up!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Score</p>
                                <p className="text-2xl font-bold text-cyan-400">{score}</p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Answered</p>
                                <p className="text-2xl font-bold text-white">{answered}</p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Best Streak</p>
                                <p className="text-2xl font-bold text-cyan-400">{bestStreak}</p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">High Score</p>
                                <p className="text-2xl font-bold text-cyan-400">{highScore}</p>
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all"
                        >
                            Play Again
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
