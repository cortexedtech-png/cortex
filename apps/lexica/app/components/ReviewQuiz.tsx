'use client';

import { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { VocabCardData } from './VocabCard';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface ReviewQuizProps {
    card: VocabCardData;
    onSwipe: (direction: 'left' | 'right', source?: 'manual' | 'voice' | 'quiz') => void;
}

export default function ReviewQuiz({ card, onSwipe }: ReviewQuizProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const { quizCorrect, quizWrong } = useSoundEffects();

    const options = useMemo(() => {
        const others = VOCAB_DATABASE.filter(c => c.id !== card.id);
        // eslint-disable-next-line react-hooks/purity
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
        const all = [card.translationHint, ...shuffled.map(c => c.translationHint)];
        // eslint-disable-next-line react-hooks/purity
        return all.sort(() => Math.random() - 0.5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [card.id]);

    const handleSelect = (option: string) => {
        if (answered) return;
        setSelected(option);
        setAnswered(true);
        const isCorrect = option === card.translationHint;

        // Play sound feedback
        if (isCorrect) {
            quizCorrect();
        } else {
            quizWrong();
        }

        setTimeout(() => {
            onSwipe(isCorrect ? 'right' : 'left', 'quiz');
        }, 700);
    };

    return (
        <div className="space-y-1.5">
            <p className="text-[11px] text-amber-300/80 text-center font-medium">Chọn nghĩa đúng của <span className="font-bold text-amber-200">{card.word}</span>:</p>
            {options.map((option, i) => {
                const isSelected = selected === option;
                const isCorrect = option === card.translationHint;

                let cls = 'bg-slate-700/60 border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700/80 active:scale-[0.98]';
                if (answered && isCorrect) {
                    cls = 'bg-green-500/20 border-green-500/50 text-green-300';
                } else if (answered && isSelected && !isCorrect) {
                    cls = 'bg-red-500/20 border-red-500/50 text-red-300';
                } else if (answered) {
                    cls = 'bg-slate-700/30 border-slate-700 text-slate-500';
                }

                return (
                    <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        disabled={answered}
                        className={`w-full px-3 py-2 rounded-lg border text-xs text-left transition-colors flex items-center gap-2 ${cls}`}
                    >
                        {answered && isCorrect && <Check className="w-3 h-3 shrink-0 text-green-400" />}
                        {answered && isSelected && !isCorrect && <X className="w-3 h-3 shrink-0 text-red-400" />}
                        <span className="line-clamp-1">{option}</span>
                    </button>
                );
            })}
        </div>
    );
}
