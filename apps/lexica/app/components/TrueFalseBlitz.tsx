'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon, Trophy, Clock } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface TrueFalseBlitzProps {
    learnedWordIds: string[];
    onClose: () => void;
}

type Question = {
    word: string;
    meaning: string;
    isCorrect: boolean;
};

export default function TrueFalseBlitz({ learnedWordIds, onClose }: TrueFalseBlitzProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [time, setTime] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('trueFalseBlitz_highScore');
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
                        localStorage.setItem('trueFalseBlitz_highScore', score.toString());
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlaying, gameOver, score, highScore]);

    const generateQuestion = (): Question => {
        // Get all learned cards
        const learnedCards = VOCAB_DATABASE.filter(c =>
            learnedWordIds.includes(c.id)
        );

        if (learnedCards.length === 0) {
            return { word: '', meaning: '', isCorrect: true };
        }

        // Random select a card
        const correctCard = learnedCards[Math.floor(Math.random() * learnedCards.length)];

        // 50% chance of correct pairing
        const isCorrect = Math.random() > 0.5;

        if (isCorrect) {
            return {
                word: correctCard.word,
                meaning: correctCard.translationHint,
                isCorrect: true
            };
        } else {
            // Get a different random meaning
            const otherCards = learnedCards.filter(c => c.id !== correctCard.id);
            const wrongCard = otherCards.length > 0
                ? otherCards[Math.floor(Math.random() * otherCards.length)]
                : correctCard;

            return {
                word: correctCard.word,
                meaning: wrongCard.translationHint,
                isCorrect: false
            };
        }
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setAnswered(0);
        setCorrectCount(0);
        setTime(60);
        setFeedback(null);
        setCurrentQuestion(generateQuestion());
    };

    const handleAnswer = (userAnswer: boolean) => {
        if (!currentQuestion || feedback !== null) return;

        const isCorrect = userAnswer === currentQuestion.isCorrect;

        if (isCorrect) {
            quizCorrect();
            setFeedback('correct');
            setScore(s => s + 100);
            setCorrectCount(c => c + 1);
        } else {
            quizWrong();
            setFeedback('wrong');
        }

        setAnswered(a => a + 1);

        setTimeout(() => {
            setFeedback(null);
            setCurrentQuestion(generateQuestion());
        }, 500);
    };

    const accuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

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
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Check className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">True/False Blitz</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                        60 giây - trả lời True/False nhiều nhất có thể!
                    </p>
                </div>

                {!isPlaying && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Check className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Cách chơi</h3>
                            <div className="text-sm text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Xem cặp từ - nghĩa</p>
                                <p>• Nhấn TRUE nếu đúng, FALSE nếu sai</p>
                                <p>• Càng nhanh càng nhiều điểm</p>
                                <p>• 100 điểm mỗi câu đúng</p>
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

                {isPlaying && !gameOver && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Stats Bar */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span className={`font-bold ${time <= 10 ? 'text-red-400' : 'text-white'}`}>
                                    {time}s
                                </span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {answered} answered
                            </div>
                            <div className="text-lg font-bold text-white">
                                {score}
                            </div>
                        </div>

                        {/* Question Card */}
                        <motion.div
                            key={answered}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-8 rounded-lg border-2 text-center transition-all ${feedback === 'correct'
                                ? 'bg-green-500/10 border-green-500'
                                : feedback === 'wrong'
                                    ? 'bg-red-500/10 border-red-500'
                                    : 'bg-slate-700/50 border-slate-600'
                                }`}
                        >
                            <p className="text-sm text-slate-500 mb-4">Is this correct?</p>

                            <div className="space-y-3">
                                <div className="p-4 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-cyan-400 mb-1">English</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-white">
                                        {currentQuestion.word}
                                    </p>
                                </div>

                                <div className="flex items-center justify-center text-slate-500 my-2">
                                    <div className="w-8 h-0.5 bg-slate-600"></div>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Tiếng Việt</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                        {currentQuestion.meaning}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Answer Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAnswer(true)}
                                disabled={feedback !== null}
                                className="py-6 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-cyan-500 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-6 h-6" />
                                TRUE
                            </button>
                            <button
                                onClick={() => handleAnswer(false)}
                                disabled={feedback !== null}
                                className="py-6 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-cyan-500 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                <XIcon className="w-6 h-6" />
                                FALSE
                            </button>
                        </div>

                        {/* Accuracy */}
                        <div className="text-center text-sm text-slate-400">
                            Accuracy: <span className={correctCount / answered >= 0.8 ? 'text-green-400' : 'text-slate-300'}>
                                {accuracy}%
                            </span>
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
                                <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                                <p className="text-2xl font-bold text-cyan-400">{accuracy}%</p>
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
