'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Keyboard, Shuffle, Check, Flame, Grid3x3, X } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import SpeedQuiz from './SpeedQuiz';
import MemoryMatch from './MemoryMatch';
import TypeChallenge from './TypeChallenge';
import WordScramble from './WordScramble';
import TrueFalseBlitz from './TrueFalseBlitz';
import ComboChain from './ComboChain';
import WordBingo from './WordBingo';

interface GameHubProps {
    learnedWordIds: string[];
    todayWordIds: string[];
    onClose: () => void;
}

type GameType = 'speed' | 'memory' | 'type' | 'scramble' | 'truefalse' | 'combo' | 'bingo';

interface GameInfo {
    id: GameType;
    name: string;
    description: string;
    icon: typeof Zap;
    color: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    minWords: number;
}

const GAMES: GameInfo[] = [
    {
        id: 'speed',
        name: 'Speed Quiz',
        description: 'Trả lời nhanh dưới áp lực - Endless mode!',
        icon: Zap,
        color: 'cyan',
        difficulty: 'Hard',
        minWords: 4
    },
    {
        id: 'memory',
        name: 'Memory Match',
        description: 'Lật thẻ tìm cặp từ - nghĩa đúng',
        icon: Brain,
        color: 'cyan',
        difficulty: 'Easy',
        minWords: 6
    },
    {
        id: 'type',
        name: 'Type Challenge',
        description: 'Gõ từ tiếng Anh từ nghĩa tiếng Việt',
        icon: Keyboard,
        color: 'cyan',
        difficulty: 'Medium',
        minWords: 4
    },
    {
        id: 'scramble',
        name: 'Word Scramble',
        description: 'Sắp xếp chữ cái tạo thành từ đúng',
        icon: Shuffle,
        color: 'cyan',
        difficulty: 'Medium',
        minWords: 4
    },
    {
        id: 'truefalse',
        name: 'True/False Blitz',
        description: '60s trả lời True/False nhiều nhất có thể',
        icon: Check,
        color: 'cyan',
        difficulty: 'Easy',
        minWords: 10
    },
    {
        id: 'combo',
        name: 'Combo Chain',
        description: 'Xây dựng chuỗi combo cao nhất',
        icon: Flame,
        color: 'cyan',
        difficulty: 'Medium',
        minWords: 4
    },
    {
        id: 'bingo',
        name: 'Word Bingo',
        description: 'Hoàn thành hàng/cột/chéo để thắng',
        icon: Grid3x3,
        color: 'cyan',
        difficulty: 'Easy',
        minWords: 9
    }
];

const colorClasses = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500 bg-slate-700/50'
};

const difficultyColors = {
    Easy: 'text-slate-400',
    Medium: 'text-slate-400',
    Hard: 'text-slate-400'
};

export default function GameHub({ learnedWordIds, todayWordIds, onClose }: GameHubProps) {
    const { click } = useSoundEffects();
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

    const canPlayGame = (game: GameInfo) => learnedWordIds.length >= game.minWords;

    const handleSelectGame = (gameId: GameType) => {
        click();
        setSelectedGame(gameId);
    };

    const handleCloseGame = () => {
        click();
        setSelectedGame(null);
    };

    // Render selected game
    if (selectedGame === 'speed') {
        return <SpeedQuiz learnedWordIds={learnedWordIds} todayWordIds={todayWordIds} onClose={onClose} />;
    }
    if (selectedGame === 'memory') {
        return <MemoryMatch learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }
    if (selectedGame === 'type') {
        return <TypeChallenge learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }
    if (selectedGame === 'scramble') {
        return <WordScramble learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }
    if (selectedGame === 'truefalse') {
        return <TrueFalseBlitz learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }
    if (selectedGame === 'combo') {
        return <ComboChain learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }
    if (selectedGame === 'bingo') {
        return <WordBingo learnedWordIds={learnedWordIds} onClose={handleCloseGame} />;
    }

    // Game Hub Menu
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:max-w-4xl bg-slate-800 border-0 md:border border-slate-700 md:rounded-xl px-6 pb-6 pt-16 sm:p-8 relative min-h-full md:min-h-0"
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Vocabulary Games</h2>
                    <p className="text-sm sm:text-base text-slate-400">
                        Chọn game để ôn luyện từ vựng một cách vui vẻ!
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        {learnedWordIds.length} từ đã học • {todayWordIds.length} từ hôm nay
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {GAMES.map((game) => {
                        const Icon = game.icon;
                        const canPlay = canPlayGame(game);

                        return (
                            <motion.button
                                key={game.id}
                                whileHover={canPlay ? { scale: 1.02 } : {}}
                                whileTap={canPlay ? { scale: 0.98 } : {}}
                                onClick={() => canPlay && handleSelectGame(game.id)}
                                disabled={!canPlay}
                                className={`p-4 sm:p-5 rounded-xl border transition-all text-left ${canPlay
                                        ? colorClasses[game.color as keyof typeof colorClasses]
                                        : 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${canPlay ? 'bg-slate-700' : 'bg-slate-800/50'}`}>
                                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${canPlay ? 'text-cyan-400' : 'text-slate-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold text-base sm:text-lg ${canPlay ? 'text-white' : 'text-slate-500'}`}>
                                                {game.name}
                                            </h3>
                                            <span className={`text-[10px] sm:text-xs font-medium ${difficultyColors[game.difficulty]}`}>
                                                {game.difficulty}
                                            </span>
                                        </div>
                                        <p className={`text-xs sm:text-sm ${canPlay ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {game.description}
                                        </p>
                                    </div>
                                </div>

                                {!canPlay && (
                                    <div className="text-xs text-red-400">
                                        Cần ít nhất {game.minWords} từ để chơi
                                    </div>
                                )}

                                {canPlay && (
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Click để chơi →</span>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
