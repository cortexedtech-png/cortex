'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Trophy, X, Sparkles } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface WordBingoProps {
    learnedWordIds: string[];
    onClose: () => void;
}

type Cell = {
    word: string;
    meaning: string;
    isMarked: boolean;
};

export default function WordBingo({ learnedWordIds, onClose }: WordBingoProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();

    const [grid, setGrid] = useState<Cell[][]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<{ word: string; meaning: string } | null>(null);
    const [score, setScore] = useState(0);
    const [bingos, setBingos] = useState(0);
    const [lives, setLives] = useState(3);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('wordBingo_highScore');
        return saved ? parseInt(saved) : null;
    });
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const initializeGrid = () => {
        // Get 9 random words for 3x3 grid
        const selectedCards = learnedWordIds
            .map(id => VOCAB_DATABASE.find(card => card.id === id))
            .filter(card => card !== undefined)
            .sort(() => Math.random() - 0.5)
            .slice(0, 9);

        const newGrid: Cell[][] = [];
        let index = 0;
        for (let i = 0; i < 3; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < 3; j++) {
                const card = selectedCards[index++];
                row.push({
                    word: card.word,
                    meaning: card.translationHint,
                    isMarked: false
                });
            }
            newGrid.push(row);
        }

        setGrid(newGrid);
        generateQuestion(newGrid);
    };

    const generateQuestion = (currentGrid: Cell[][]) => {
        // Get unmarked cells
        const unmarked: Cell[] = [];
        currentGrid.forEach(row => {
            row.forEach(cell => {
                if (!cell.isMarked) unmarked.push(cell);
            });
        });

        if (unmarked.length === 0) return;

        // eslint-disable-next-line react-hooks/purity
        const randomCell = unmarked[Math.floor(Math.random() * unmarked.length)];
        setCurrentQuestion({
            word: randomCell.word,
            meaning: randomCell.meaning
        });
        setFeedback(null);
    };

    const startGame = () => {
        click();
        setIsPlaying(true);
        setGameWon(false);
        setGameOver(false);
        setScore(0);
        setBingos(0);
        setLives(3);
        setFeedback(null);
        initializeGrid();
    };

    const checkBingos = (newGrid: Cell[][]): number => {
        let count = 0;

        // Check rows
        for (let i = 0; i < 3; i++) {
            if (newGrid[i].every(cell => cell.isMarked)) count++;
        }

        // Check columns
        for (let j = 0; j < 3; j++) {
            if (newGrid.every(row => row[j].isMarked)) count++;
        }

        // Check diagonals
        if (newGrid[0][0].isMarked && newGrid[1][1].isMarked && newGrid[2][2].isMarked) count++;
        if (newGrid[0][2].isMarked && newGrid[1][1].isMarked && newGrid[2][0].isMarked) count++;

        return count;
    };

    const handleCellClick = (row: number, col: number) => {
        if (!currentQuestion || feedback !== null) return;

        const cell = grid[row][col];
        if (cell.isMarked) return;

        click();

        if (cell.word === currentQuestion.word) {
            quizCorrect();
            setFeedback('correct');

            const newGrid = grid.map((r, i) =>
                r.map((c, j) =>
                    i === row && j === col ? { ...c, isMarked: true } : c
                )
            );
            setGrid(newGrid);

            const newBingos = checkBingos(newGrid);
            const bingoChange = newBingos - bingos;

            if (bingoChange > 0) {
                setScore(s => s + (bingoChange * 500) + 100);
                setBingos(newBingos);
            } else {
                setScore(s => s + 100);
            }

            // Check if all cells marked
            const allMarked = newGrid.every(r => r.every(c => c.isMarked));
            if (allMarked) {
                setGameWon(true);
                if (score + 100 > (highScore || 0)) {
                    setHighScore(score + 100);
                    localStorage.setItem('wordBingo_highScore', (score + 100).toString());
                }
            } else {
                setTimeout(() => {
                    generateQuestion(newGrid);
                }, 800);
            }
        } else {
            quizWrong();
            setFeedback('wrong');
            const newLives = lives - 1;
            setLives(newLives);
            setScore(s => Math.max(0, s - 50));

            if (newLives === 0) {
                setGameOver(true);
                setIsPlaying(false);
            } else {
                setTimeout(() => {
                    setFeedback(null);
                }, 1000);
            }
        }
    };

    const getCellColor = (cell: Cell, row: number, col: number) => {
        if (cell.isMarked) return 'bg-cyan-500/20 border-cyan-500';

        // Highlight if part of bingo
        const inRow = grid[row].every(c => c.isMarked);
        const inCol = grid.every(r => r[col].isMarked);
        const inDiag1 = row === col && grid[0][0].isMarked && grid[1][1].isMarked && grid[2][2].isMarked;
        const inDiag2 = row + col === 2 && grid[0][2].isMarked && grid[1][1].isMarked && grid[2][0].isMarked;

        if (inRow || inCol || inDiag1 || inDiag2) {
            return 'bg-cyan-500/10 border-cyan-500/50';
        }

        return 'bg-slate-700/50 border-slate-600 hover:border-pink-500';
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
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Grid3x3 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Word Bingo</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Hoàn thành hàng/cột/chéo để thắng!
                    </p>
                </div>

                {!isPlaying && !gameWon && !gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Grid3x3 className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                            <h3 className="text-base font-bold text-white mb-2">Cách chơi</h3>
                            <div className="text-sm text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                                <p>• Nhìn từ tiếng Anh</p>
                                <p>• Click ô có nghĩa đúng trên lưới</p>
                                <p>• Hoàn thành hàng/cột/chéo = Bingo!</p>
                                <p>• Mỗi Bingo +500 điểm</p>
                                <p>• Sai → -1 mạng & -50 điểm</p>
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

                {isPlaying && !gameWon && !gameOver && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {/* Stats */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-5 h-5 rounded-full border-2 ${i < lives ? 'bg-red-500 border-red-400' : 'bg-slate-700 border-slate-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <Sparkles className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 font-bold">
                                        {bingos} Bingo{bingos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-white">
                                {score}
                            </div>
                        </div>

                        {/* Question */}
                        <motion.div
                            key={currentQuestion.word}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${feedback === 'correct'
                                ? 'bg-green-500/10 border-green-500'
                                : feedback === 'wrong'
                                    ? 'bg-red-500/10 border-red-500'
                                    : 'bg-slate-700/50 border-slate-600'
                                }`}
                        >
                            <p className="text-xs text-slate-500 mb-1">Find the meaning:</p>
                            <p className="text-xl sm:text-2xl font-bold text-cyan-400">
                                {currentQuestion.word}
                            </p>
                        </motion.div>

                        {/* Bingo Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mx-auto max-w-md">
                            {grid.map((row, i) =>
                                row.map((cell, j) => (
                                    <motion.button
                                        key={`${i}-${j}`}
                                        onClick={() => handleCellClick(i, j)}
                                        whileHover={{ scale: cell.isMarked ? 1 : 1.05 }}
                                        whileTap={{ scale: cell.isMarked ? 1 : 0.95 }}
                                        disabled={cell.isMarked || feedback !== null}
                                        className={`aspect-square rounded-lg border-2 p-2 flex items-center justify-center text-center transition-all ${getCellColor(cell, i, j)
                                            }`}
                                    >
                                        {cell.isMarked ? (
                                            <Sparkles className="w-6 h-6 text-cyan-400" />
                                        ) : (
                                            <span className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-3">
                                                {cell.meaning}
                                            </span>
                                        )}
                                    </motion.button>
                                ))
                            )}
                        </div>

                        <div className="text-center text-xs text-slate-500">
                            {grid.flat().filter(c => c.isMarked).length}/9 marked
                        </div>
                    </motion.div>
                )}

                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <X className="w-10 h-10 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Game Over!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Score</p>
                                <p className="text-xl font-bold text-cyan-400">{score}</p>
                            </div>
                            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Bingos</p>
                                <p className="text-xl font-bold text-white">{bingos}</p>
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {gameWon && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <Trophy className="w-16 h-16 text-cyan-400 mx-auto" />
                        <h3 className="text-2xl font-bold text-white">BINGO!</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Score</p>
                                <p className="text-xl font-bold text-cyan-400">{score}</p>
                            </div>
                            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                <p className="text-xs text-slate-500 mb-1">Bingos</p>
                                <p className="text-xl font-bold text-white">{bingos}</p>
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
