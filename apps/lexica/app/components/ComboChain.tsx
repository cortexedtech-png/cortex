'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, X, Zap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface ComboChainProps {
    learnedWordIds: string[];
    onClose: () => void;
}

export default function ComboChain({ learnedWordIds, onClose }: ComboChainProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    const [currentCard, setCurrentCard] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [highScore, setHighScore] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('comboChain_highScore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const generateQuestion = () => {
        const randomId = learnedWordIds[Math.floor(Math.random() * learnedWordIds.length)];
        const card = VOCAB_DATABASE.find(c => c.id === randomId);
        if (!card) return;

        // Get 3 wrong answers
        const wrongOptions = VOCAB_DATABASE
            .filter(c => learnedWordIds.includes(c.id) && c.id !== card.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(c => c.translationHint);

        // Shuffle with correct answer
        const allOptions = [card.translationHint, ...wrongOptions].sort(() => Math.random() - 0.5);

        setCurrentCard(card);
        setOptions(allOptions);
        setFeedback(null);
        setSelectedAnswer(null);
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setAnswered(0);
        generateQuestion();
    };

    const handleAnswer = (answer: string) => {
        if (!currentCard || feedback !== null) return;

        click();
        setSelectedAnswer(answer);

        if (answer === currentCard.translationHint) {
            quizCorrect();
            setFeedback('correct');
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > maxCombo) {
                setMaxCombo(newCombo);
                if (newCombo > (highScore || 0)) {
                    setHighScore(newCombo);
                    localStorage.setItem('comboChain_highScore', newCombo.toString());
                }
            }

            // Score increases exponentially with combo
            const points = 100 * Math.pow(1.5, Math.min(combo, 10));
            setScore(s => Math.round(s + points));
            setAnswered(a => a + 1);

            setTimeout(() => {
                generateQuestion();
            }, 800);
        } else {
            quizWrong();
            setFeedback('wrong');
            setCombo(0); // Reset combo but don't end game

            setTimeout(() => {
                generateQuestion();
            }, 1500);
        }
    };

    const getComboColor = () => {
        if (combo >= 10) return 'text-cyan-400';
        if (combo >= 5) return 'text-cyan-300';
        return 'text-slate-400';
    };

    const getComboText = () => {
        if (combo >= 10) return 'ON FIRE!';
        if (combo >= 5) return 'GREAT!';
        return '';
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
                    <div className="flex items-center justify-center gap-2">
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Combo Chain</h2>
                    </div>
                </div>

                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Flame className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Cách chơi</h3>
                            <div className="text-sm text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Trả lời đúng → Combo tăng</p>
                                <p>• Combo càng cao → Điểm nhân lên</p>
                                <p>• Sai → Combo về 0 (không game over)</p>
                                <p>• Mục tiêu: Combo chain dài nhất!</p>
                            </div>
                        </div>

                        {highScore !== null && highScore > 0 && (
                            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
                                <Trophy className="w-4 h-4" />
                                <span>Best Combo: {highScore}</span>
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

                {isPlaying && currentCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Stats Bar */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-400">
                                {answered} answered
                            </div>
                            <div className="text-lg font-bold text-white">
                                {Math.round(score)}
                            </div>
                        </div>

                        {/* Combo Display */}
                        <div className={`text-center p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg`}>
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Flame className={`w-8 h-8 ${getComboColor()}`} />
                                <motion.p
                                    key={combo}
                                    initial={{ scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`text-5xl font-bold ${getComboColor()}`}
                                >
                                    {combo}
                                </motion.p>
                                <Flame className={`w-8 h-8 ${getComboColor()}`} />
                            </div>
                            <p className={`text-sm font-bold ${getComboColor()}`}>
                                {getComboText() || 'COMBO CHAIN'}
                            </p>
                            <p className={`text-xs mt-1 transition-opacity ${maxCombo > 0 ? 'text-slate-500 opacity-100' : 'text-slate-700 opacity-0'}`}>
                                Best: {maxCombo > 0 ? maxCombo : '-'}
                            </p>
                        </div>

                        {/* Question */}
                        <motion.div
                            key={answered}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`p-6 rounded-lg border-2 text-center transition-all ${feedback === 'correct'
                                    ? 'bg-green-500/10 border-green-500'
                                    : feedback === 'wrong'
                                        ? 'bg-red-500/10 border-red-500'
                                        : 'bg-slate-700/50 border-slate-600'
                                }`}
                        >
                            <p className="text-xs text-slate-500 mb-2">English word:</p>
                            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                                {currentCard.word}
                            </p>
                        </motion.div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2">
                            {options.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentCard.translationHint;
                                const showResult = feedback !== null;

                                return (
                                    <motion.button
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleAnswer(option)}
                                        disabled={feedback !== null}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${showResult && isCorrect
                                                ? 'bg-green-500/20 border-green-500 text-white'
                                                : showResult && isSelected
                                                    ? 'bg-red-500/20 border-red-500 text-white'
                                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-cyan-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${showResult && isCorrect
                                                    ? 'border-green-500 text-green-400'
                                                    : showResult && isSelected
                                                        ? 'border-red-500 text-red-400'
                                                        : 'border-slate-500 text-slate-500'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="text-sm sm:text-base">{option}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Multiplier Info */}
                        <div className="text-center text-xs text-slate-500">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Điểm nhân: {combo > 0 ? `×${(1.5 ** Math.min(combo - 1, 10)).toFixed(1)}` : '×1.0'}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
