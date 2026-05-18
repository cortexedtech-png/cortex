'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, RotateCcw, Trophy, X, Clock } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { VOCAB_DATABASE } from '../data/vocabCards';

interface MemoryMatchProps {
    learnedWordIds: string[];
    onClose: () => void;
}

type CardData = {
    id: string;
    type: 'word' | 'meaning';
    content: string;
    pairId: string;
};

type Card = CardData & {
    isFlipped: boolean;
    isMatched: boolean;
};

export default function MemoryMatch({ learnedWordIds, onClose }: MemoryMatchProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<string[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [time, setTime] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [highScore, setHighScore] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('memoryMatch_highScore');
        if (saved) setHighScore(parseInt(saved));
        initializeGame();
    }, []);

    useEffect(() => {
        if (isComplete) return;
        const timer = setInterval(() => setTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, [isComplete]);

    const initializeGame = () => {
        // Get 6 random words
        const selectedWords = learnedWordIds
            .map(id => VOCAB_DATABASE.find(card => card.id === id))
            .filter(card => card !== undefined)
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

        // Create pairs: word and meaning
        const pairs: CardData[] = [];
        selectedWords.forEach(card => {
            pairs.push({
                id: `${card.id}-word`,
                type: 'word',
                content: card.word,
                pairId: card.id
            });
            pairs.push({
                id: `${card.id}-meaning`,
                type: 'meaning',
                content: card.translationHint,
                pairId: card.id
            });
        });

        // Shuffle and initialize
        const shuffled = pairs
            .sort(() => Math.random() - 0.5)
            .map(card => ({
                ...card,
                isFlipped: false,
                isMatched: false
            }));

        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setTime(0);
        setIsComplete(false);
    };

    const handleCardClick = (cardId: string) => {
        const card = cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) return;

        click();
        const newFlipped = [...flippedCards, cardId];
        setFlippedCards(newFlipped);

        // Update card flip state
        setCards(cards.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        ));

        // Check for match
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const card1 = cards.find(c => c.id === newFlipped[0])!;
            const card2 = cards.find(c => c.id === newFlipped[1])!;

            if (card1.pairId === card2.pairId) {
                // Match!
                quizCorrect();
                setMatches(m => m + 1);
                setCards(cards.map(c =>
                    newFlipped.includes(c.id) ? { ...c, isMatched: true } : c
                ));
                setFlippedCards([]);

                // Check if game complete
                if (matches + 1 === 6) {
                    setIsComplete(true);
                    const score = moves + 1;
                    if (!highScore || score < highScore) {
                        setHighScore(score);
                        localStorage.setItem('memoryMatch_highScore', score.toString());
                    }
                }
            } else {
                // No match - flip back after delay
                quizWrong();
                setTimeout(() => {
                    setCards(cards.map(c =>
                        newFlipped.includes(c.id) && !c.isMatched
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start md:items-center justify-center md:p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:max-w-2xl bg-slate-800 border-0 md:border border-slate-700 md:rounded-xl px-4 pb-4 pt-12 sm:p-8 relative min-h-full md:min-h-0 md:max-h-[90vh] md:overflow-y-auto"
            >
                <button
                    onClick={() => { click(); onClose(); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-4 sm:mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Brain className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Memory Match</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">Lật thẻ tìm cặp từ - nghĩa đúng</p>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-center">
                        <p className="text-xs text-slate-500">Moves</p>
                        <p className="text-lg font-bold text-white">{moves}</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <p className="text-xs text-slate-500">Time</p>
                        </div>
                        <p className="text-lg font-bold text-white">{formatTime(time)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500">Matched</p>
                        <p className="text-lg font-bold text-cyan-400">{matches}/6</p>
                    </div>
                    <button
                        onClick={() => { click(); initializeGame(); }}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all"
                    >
                        <RotateCcw className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                    {cards.map((card) => (
                        <motion.button
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                            className={`aspect-square rounded-lg border-2 p-2 sm:p-3 flex items-center justify-center text-center transition-all ${card.isMatched
                                    ? 'bg-cyan-500/20 border-cyan-500 opacity-50'
                                    : card.isFlipped
                                        ? 'bg-slate-700 border-slate-600'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            {card.isFlipped || card.isMatched ? (
                                <span className={`text-xs sm:text-sm font-medium ${card.type === 'word' ? 'text-cyan-400' : 'text-slate-300'
                                    }`}>
                                    {card.content}
                                </span>
                            ) : (
                                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Completion */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                    >
                        <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-white mb-1">Hoàn thành!</h3>
                        <p className="text-sm text-slate-400">
                            {moves} moves • {formatTime(time)}
                        </p>
                        {highScore !== null && (
                            <p className="text-xs text-cyan-400 mt-1">
                                Best: {highScore} moves
                            </p>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
