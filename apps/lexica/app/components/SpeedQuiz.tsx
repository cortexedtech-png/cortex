'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, X, Clock, Flame, Target, Star } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';
import ChallengeButton from './ChallengeButton';

interface SpeedQuizProps {
    learnedWordIds: string[];
    todayWordIds?: string[];
    onClose: () => void;
    onGameEnd?: (score: number) => void;
}

type QuizMode = 'all' | 'today';

interface QuizQuestion {
    wordId: string;
    word: string;
    correctAnswer: string;
    options: string[];
}

const TIME_PER_QUESTION = 8; // seconds
const STREAK_BONUS_MULTIPLIER = 0.5; // +50% per streak
const SPEED_BONUS_MAX = 500; // Max bonus for instant answer

/** Fisher-Yates shuffle — trả về mảng mới đã xáo */
function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function SpeedQuiz({ learnedWordIds, todayWordIds = [], onClose, onGameEnd }: SpeedQuizProps) {
    const { click, quizCorrect, quizWrong, levelUp } = useSoundEffects();

    // Shuffle queue — đảm bảo mỗi từ xuất hiện 1 lần trước khi lặp lại
    const wordQueueRef = useRef<string[]>([]);

    const [mode, setMode] = useState<QuizMode | null>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // High scores from localStorage (lazy initialization)
    const [highScoreAll, setHighScoreAll] = useState(() =>
        parseInt(localStorage.getItem('speedquiz_highscore_all') || '0')
    );
    const [highScoreToday, setHighScoreToday] = useState(() =>
        parseInt(localStorage.getItem('speedquiz_highscore_today') || '0')
    );

    // Generate random question
    const generateQuestion = useCallback((wordIds: string[]): QuizQuestion | null => {
        if (wordIds.length === 0) return null;

        // Lấy từ tiếp theo từ shuffle queue, refill khi hết
        if (wordQueueRef.current.length === 0) {
            wordQueueRef.current = shuffleArray(wordIds);
        }
        const randomWordId = wordQueueRef.current.pop()!;
        const wordData = VOCAB_DATABASE.find(w => w.id === randomWordId);
        if (!wordData) return null;

        // Get 3 random wrong answers from other learned words
        const otherWords = wordIds.filter(id => id !== randomWordId);
        const wrongAnswers: string[] = [];
        while (wrongAnswers.length < 3 && otherWords.length > 0) {
            const randomId = otherWords.splice(Math.floor(Math.random() * otherWords.length), 1)[0];
            const wrongWord = VOCAB_DATABASE.find(w => w.id === randomId);
            if (wrongWord && !wrongAnswers.includes(wrongWord.translationHint)) {
                wrongAnswers.push(wrongWord.translationHint);
            }
        }

        // Shuffle options
        const options = [wordData.translationHint, ...wrongAnswers].sort(() => Math.random() - 0.5);

        return {
            wordId: randomWordId,
            word: wordData.word,
            correctAnswer: wordData.translationHint,
            options
        };
    }, []);

    // Start game
    const startGame = (selectedMode: QuizMode) => {
        click();
        setMode(selectedMode);
        setGameState('playing');
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setQuestionCount(0);
        setTimeLeft(TIME_PER_QUESTION);
        setSelectedAnswer(null);
        setIsCorrect(null);

        const wordIds = selectedMode === 'today' ? todayWordIds : learnedWordIds;
        // Khởi tạo shuffle queue khi bắt đầu game mới
        wordQueueRef.current = shuffleArray(wordIds);
        const question = generateQuestion(wordIds);
        setCurrentQuestion(question);
    };

    // End game
    const endGame = useCallback(() => {
        setGameState('gameover');

        // Save high score
        if (mode === 'all' && score > highScoreAll) {
            localStorage.setItem('speedquiz_highscore_all', score.toString());
            setHighScoreAll(score);
            levelUp();
        } else if (mode === 'today' && score > highScoreToday) {
            localStorage.setItem('speedquiz_highscore_today', score.toString());
            setHighScoreToday(score);
            levelUp();
        }
        onGameEnd?.(score);
    }, [mode, score, highScoreAll, highScoreToday, levelUp, onGameEnd]);

    // Handle timeout
    const handleTimeout = useCallback(() => {
        quizWrong();
        setIsCorrect(false);
        setStreak(0);

        setTimeout(() => {
            endGame();
        }, 1500);
    }, [quizWrong, endGame]);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || isCorrect !== null) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [gameState, isCorrect, handleTimeout]);

    // Handle answer selection
    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !currentQuestion) return;

        click();
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);

        if (correct) {
            quizCorrect();

            // Calculate score
            const baseScore = 100;
            const timeBonus = Math.round((timeLeft / TIME_PER_QUESTION) * SPEED_BONUS_MAX);
            const streakMultiplier = 1 + (streak * STREAK_BONUS_MULTIPLIER);
            const earnedPoints = Math.round((baseScore + timeBonus) * streakMultiplier);

            setScore(prev => prev + earnedPoints);
            setStreak(prev => prev + 1);
            setBestStreak(prev => Math.max(prev, streak + 1));

            // Next question after delay
            setTimeout(() => {
                setSelectedAnswer(null);
                setIsCorrect(null);
                setQuestionCount(prev => prev + 1);
                setTimeLeft(TIME_PER_QUESTION);

                const wordIds = mode === 'today' ? todayWordIds : learnedWordIds;
                const question = generateQuestion(wordIds);
                setCurrentQuestion(question);
            }, 1000);
        } else {
            quizWrong();
            setStreak(0);

            // Game over after delay
            setTimeout(() => {
                endGame();
            }, 1500);
        }
    };

    const timeProgress = (timeLeft / TIME_PER_QUESTION) * 100;
    const currentHighScore = mode === 'today' ? highScoreToday : highScoreAll;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <div className="w-full md:max-w-2xl h-full md:h-auto">
                {/* Menu State */}
                {gameState === 'menu' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border-0 md:border border-cyan-500/30 md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative w-full min-h-full md:min-h-0"
                    >
                        <button
                            onClick={() => {
                                click();
                                onClose();
                            }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Speed Quiz</h2>
                            <p className="text-sm sm:text-base text-slate-400">Ôn tập siêu tốc - Endless mode!</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                            {/* All Words Mode */}
                            <button
                                onClick={() => startGame('all')}
                                disabled={learnedWordIds.length < 4}
                                className="w-full p-3 sm:p-4 rounded-xl bg-slate-700/30 border border-cyan-500/30 hover:border-cyan-500 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                                        <div className="text-left">
                                            <div className="text-base sm:text-lg font-semibold text-white">Tất cả từ đã học</div>
                                            <div className="text-xs sm:text-sm text-slate-400">{learnedWordIds.length} từ • High Score: {highScoreAll}</div>
                                        </div>
                                    </div>
                                </div>
                                {learnedWordIds.length < 4 && (
                                    <p className="text-xs text-red-400 mt-2">Cần ít nhất 4 từ để chơi</p>
                                )}
                            </button>

                            {/* Today Words Mode */}
                            <button
                                onClick={() => startGame('today')}
                                disabled={todayWordIds.length < 4}
                                className="w-full p-3 sm:p-4 rounded-xl bg-slate-700/30 border border-amber-500/30 hover:border-amber-500 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                                        <div className="text-left">
                                            <div className="text-base sm:text-lg font-semibold text-white">Từ học hôm nay</div>
                                            <div className="text-xs sm:text-sm text-slate-400">{todayWordIds.length} từ • High Score: {highScoreToday}</div>
                                        </div>
                                    </div>
                                </div>
                                {todayWordIds.length < 4 && (
                                    <p className="text-xs text-red-400 mt-2">Cần học ít nhất 4 từ hôm nay</p>
                                )}
                            </button>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span>Mỗi câu có {TIME_PER_QUESTION}s - Trả lời nhanh được bonus!</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span>Streak bonus: +{STREAK_BONUS_MULTIPLIER * 100}% điểm mỗi chuỗi đúng</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-red-400" />
                                <span>Sai 1 câu = Game Over!</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Playing State */}
                {gameState === 'playing' && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 border-0 md:border border-cyan-500/30 md:rounded-xl px-4 pb-4 pt-12 sm:p-6 md:p-8 relative w-full min-h-full md:min-h-0"
                    >
                        {/* Header Stats */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="text-center">
                                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase mb-1">Score</div>
                                    <div className="text-lg sm:text-2xl font-bold text-yellow-400">{score}</div>
                                </div>
                                <div className="w-px h-8 sm:h-10 bg-slate-700"></div>
                                <div className="text-center">
                                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase mb-1">Streak</div>
                                    <div className="text-lg sm:text-2xl font-bold text-orange-400 flex items-center gap-1">
                                        {streak}
                                        {streak > 0 && <Flame className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </div>
                                </div>
                                <div className="w-px h-8 sm:h-10 bg-slate-700"></div>
                                <div className="text-center">
                                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase mb-1">Questions</div>
                                    <div className="text-lg sm:text-2xl font-bold text-cyan-400">{questionCount + 1}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] sm:text-xs text-slate-500 uppercase mb-1">High</div>
                                <div className="text-base sm:text-xl font-bold text-slate-400">{currentHighScore}</div>
                            </div>
                        </div>

                        {/* Timer Bar */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-500">Time Left</span>
                                <span className={`font-bold font-mono ${timeLeft < 3 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                                    {timeLeft.toFixed(1)}s
                                </span>
                            </div>
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${timeLeft < 3 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${timeProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <div className="mb-6 sm:mb-8">
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">
                                    {currentQuestion.word}
                                </div>
                                <div className="text-sm sm:text-base text-slate-400">Chọn nghĩa đúng:</div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectOption = option === currentQuestion.correctAnswer;
                                    const showResult = selectedAnswer !== null;

                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={!showResult ? { scale: 1.02 } : {}}
                                            whileTap={!showResult ? { scale: 0.98 } : {}}
                                            onClick={() => handleAnswer(option)}
                                            disabled={showResult}
                                            className={`p-3 sm:p-4 rounded-xl text-left text-sm sm:text-base font-medium transition-all border ${showResult
                                                ? isCorrectOption
                                                    ? 'bg-green-500/20 border-green-500 text-green-300'
                                                    : isSelected
                                                        ? 'bg-red-500/20 border-red-500 text-red-300'
                                                        : 'bg-slate-700/30 border-slate-600 text-slate-400'
                                                : 'bg-slate-700/50 border-slate-600 hover:border-cyan-500 text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-xs sm:text-sm font-bold">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="flex-1">{option}</span>
                                                {showResult && isCorrectOption && (
                                                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Multiplier Display */}
                        {streak > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center mt-4"
                            >
                                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                                    <span className="text-orange-400 font-bold text-xs sm:text-base">
                                        {(1 + streak * STREAK_BONUS_MULTIPLIER).toFixed(1)}x Multiplier!
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Game Over State */}
                {gameState === 'gameover' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border-0 md:border border-cyan-500/30 md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative text-center w-full min-h-full md:min-h-0"
                    >
                        <div className="mb-6">
                            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over!</h2>
                            {score > currentHighScore && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center justify-center gap-2 text-yellow-400 text-base sm:text-lg font-bold"
                                >
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                                    NEW HIGH SCORE!
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                            <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4">
                                <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">Final Score</div>
                                <div className="text-xl sm:text-3xl font-bold text-yellow-400">{score}</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4">
                                <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">Best Streak</div>
                                <div className="text-xl sm:text-3xl font-bold text-orange-400">{bestStreak}</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4">
                                <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">Questions</div>
                                <div className="text-xl sm:text-3xl font-bold text-cyan-400">{questionCount}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    click();
                                    setGameState('menu');
                                }}
                                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-base sm:text-lg transition-all"
                            >
                                Chơi lại
                            </button>
                            <ChallengeButton gameType="speed" score={score} />
                            <button
                                onClick={() => {
                                    click();
                                    onClose();
                                }}
                                className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
