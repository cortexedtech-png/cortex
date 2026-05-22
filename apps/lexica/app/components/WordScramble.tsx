'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Trophy, X, RotateCcw, Lightbulb, SkipForward, Heart, Delete } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

import { VocabCardData } from './VocabCard';

interface WordScrambleProps {
    learnedWordIds: string[];
    onClose: () => void;
}

export default function WordScramble({ learnedWordIds, onClose }: WordScrambleProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    const [currentCard, setCurrentCard] = useState<Omit<VocabCardData, 'state'> | null>(null);
    const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [lives, setLives] = useState(3);
    const [reshuffleCount, setReshuffleCount] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('wordScramble_highScore');
        return saved ? parseInt(saved) : null;
    });
    const [showHint, setShowHint] = useState(false);

    // Keyboard event handler
    // (moved below handleClearLast/handleKeyboardLetter declarations to avoid before-declaration errors)

    const scrambleWord = (word: string): string[] => {
        const letters = word.split('');
        // Shuffle until it's different from original
        let shuffled = [...letters];
        do {
            shuffled = letters.sort(() => Math.random() - 0.5);
        } while (shuffled.join('') === word && word.length > 1);
        return shuffled;
    };

    const getRandomWord = () => {
        const randomId = learnedWordIds[Math.floor(Math.random() * learnedWordIds.length)];
        const card = VOCAB_DATABASE.find(c => c.id === randomId);
        if (card) {
            setCurrentCard(card);
            setScrambledLetters(scrambleWord(card.word));
            setSelectedIndices([]);
            setShowHint(false);
            setReshuffleCount(0);
        }
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setStreak(0);
        setComboCount(0);
        setLives(3);
        setAnswered(0);
        getRandomWord();
    };

    const handleLetterClick = (index: number) => {
        if (selectedIndices.includes(index)) return;
        click();
        const newSelected = [...selectedIndices, index];
        setSelectedIndices(newSelected);

        // Check if word is complete
        if (newSelected.length === scrambledLetters.length) {
            const userWord = newSelected.map(i => scrambledLetters[i]).join('');
            if (!currentCard) return;
            const correctWord = currentCard.word;

            if (userWord.toLowerCase() === correctWord.toLowerCase()) {
                quizCorrect();
                const newStreak = streak + 1;
                setStreak(newStreak);
                const newCombo = comboCount + 1;
                setComboCount(newCombo);

                // Combo reward: Every 3 correct gives +1 life (max 5)
                if (newCombo >= 3 && lives < 5) {
                    setLives(l => Math.min(5, l + 1));
                    setComboCount(0);
                }

                // Score: 200 base + 100 per streak
                const points = 200 + (newStreak * 100);
                setScore(s => s + points);
                setAnswered(a => a + 1);

                setTimeout(() => {
                    getRandomWord();
                }, 800);
            } else {
                quizWrong();
                const newLives = lives - 1;
                setLives(newLives);
                setStreak(0);
                setComboCount(0);
                setSelectedIndices([]);

                if (newLives === 0) {
                    setGameOver(true);
                    if (score > (highScore || 0)) {
                        setHighScore(score);
                        localStorage.setItem('wordScramble_highScore', score.toString());
                    }
                }
            }
        }
    };

    const handleSkip = () => {
        if (!currentCard) return;
        click();
        const newLives = lives - 1;
        setLives(newLives);
        setStreak(0);
        setComboCount(0);

        if (newLives === 0) {
            setGameOver(true);
            if (score > (highScore || 0)) {
                setHighScore(score);
                localStorage.setItem('wordScramble_highScore', score.toString());
            }
        } else {
            getRandomWord();
        }
    };

    const handleReshuffle = () => {
        if (!currentCard || reshuffleCount >= 3) return;
        click();
        setScrambledLetters(scrambleWord(currentCard.word));
        setSelectedIndices([]);
        setReshuffleCount(c => c + 1);
    };

    const handleHint = () => {
        click();
        setShowHint(true);
    };

    const handleClearLast = () => {
        if (selectedIndices.length === 0) return;
        click();
        setSelectedIndices(prev => prev.slice(0, -1));
    };

    const handleClearAll = () => {
        if (selectedIndices.length === 0) return;
        click();
        setSelectedIndices([]);
    };

    const handleKeyboardLetter = (key: string) => {
        // Find first unselected letter that matches the key
        const matchingIndex = scrambledLetters.findIndex((letter, index) =>
            letter.toLowerCase() === key && !selectedIndices.includes(index)
        );

        if (matchingIndex !== -1) {
            handleLetterClick(matchingIndex);
        }
    };

    // Keyboard event handler (after handleClearLast and handleKeyboardLetter are declared)
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Handle backspace/delete - remove last selected letter
            if (key === 'backspace' || key === 'delete') {
                e.preventDefault();
                handleClearLast();
                return;
            }

            // Handle letter keys - select matching unselected letter
            if (key.length === 1 && /[a-z]/.test(key)) {
                e.preventDefault();
                handleKeyboardLetter(key);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, gameOver, selectedIndices, scrambledLetters]);

    const getUserWord = () => {
        return selectedIndices.map(i => scrambledLetters[i]).join('');
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
                        <Shuffle className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Word Scramble</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Sắp xếp chữ cái tạo thành từ đúng
                    </p>
                </div>

                {!isPlaying && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Shuffle className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Cách chơi</h3>
                            <div className="text-sm text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Nhìn nghĩa + chữ cái xáo trộn</p>
                                <p>• Click hoặc gõ chữ cái theo thứ tự</p>
                                <p>• Backspace/Delete: xoá chữ cuối</p>
                                <p>• 3 mạng - sai/skip mất 1 mạng</p>
                                <p>• Combo 3 lần đúng → +1 mạng (max 5)</p>
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
                        {/* Stats */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {[...Array(Math.min(5, lives))].map((_, i) => (
                                    <Heart
                                        key={i}
                                        className="w-5 h-5 fill-red-500 text-red-500"
                                    />
                                ))}
                                {[...Array(Math.max(0, 5 - lives))].map((_, i) => (
                                    <Heart
                                        key={`empty-${i}`}
                                        className="w-5 h-5 text-slate-600"
                                    />
                                ))}
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-500">Combo</div>
                                <div className="text-sm font-bold text-cyan-400">{comboCount}/3</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Score</div>
                                <div className="text-lg font-bold text-white">{score}</div>
                            </div>
                        </div>

                        {/* Streak Badge */}
                        {streak > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center gap-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                            >
                                <Shuffle className="w-3 h-3 text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-400">Streak × {streak}</span>
                            </motion.div>
                        )}

                        {/* Meaning */}
                        <div className="p-6 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
                            <p className="text-xs text-slate-500 mb-2">Nghĩa:</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {currentCard.translationHint}
                            </p>
                            {showHint && (
                                <p className="text-sm text-cyan-400 mt-2">
                                    Hint: {currentCard.word.charAt(0).toUpperCase()}...
                                </p>
                            )}
                        </div>

                        {/* User's Answer */}
                        <div className="min-h-16 p-4 bg-slate-900/50 rounded-lg border-2 border-slate-600 flex items-center justify-between">
                            <div className="flex-1 text-center">
                                {selectedIndices.length > 0 ? (
                                    <p className="text-2xl font-bold text-cyan-400 tracking-wider">
                                        {getUserWord()}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-500">Click or type letters...</p>
                                )}
                            </div>
                            {selectedIndices.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="ml-2 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
                                    title="Clear all (or press Backspace)"
                                >
                                    <Delete className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Scrambled Letters */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {scrambledLetters.map((letter, index) => {
                                const isSelected = selectedIndices.includes(index);
                                const selectionOrder = selectedIndices.indexOf(index);

                                return (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleLetterClick(index)}
                                        whileHover={{ scale: isSelected ? 1 : 1.1 }}
                                        whileTap={{ scale: isSelected ? 1 : 0.95 }}
                                        disabled={isSelected}
                                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 font-bold text-xl transition-all ${isSelected
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 opacity-50'
                                            : 'bg-slate-700 border-slate-600 text-white hover:border-cyan-500'
                                            }`}
                                    >
                                        {letter.toUpperCase()}
                                        {isSelected && (
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {selectionOrder + 1}
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={handleReshuffle}
                                disabled={reshuffleCount >= 3}
                                className="py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span className="text-xs">Shuffle ({reshuffleCount}/3)</span>
                            </button>
                            <button
                                onClick={handleHint}
                                disabled={showHint}
                                className="py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <Lightbulb className="w-3 h-3" />
                                <span className="text-xs">Hint</span>
                            </button>
                            <button
                                onClick={handleSkip}
                                className="py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                            >
                                <SkipForward className="w-3 h-3" />
                                <span className="text-xs">Skip</span>
                            </button>
                        </div>

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
                        <h3 className="text-2xl font-bold text-white">Game Over!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Score</p>
                                <p className="text-2xl font-bold text-cyan-400">{score}</p>
                            </div>
                            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Answered</p>
                                <p className="text-2xl font-bold text-white">{answered}</p>
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
