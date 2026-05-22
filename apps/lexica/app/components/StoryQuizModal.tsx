'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, CheckCircle, XCircle } from 'lucide-react';
import { STORIES } from '../data/stories';
import { VOCAB_DATABASE } from '../data/vocabCards';
import { useLexicaStore } from '../store/lexicaStore';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface StoryQuizModalProps {
    storyId: string;
    part: 1 | 2; // Which part to unlock
    onClose: () => void;
    onSuccess?: (storyId: string, part: 1 | 2) => void; // Called when quiz is passed
}

export default function StoryQuizModal({ storyId, part, onClose, onSuccess }: StoryQuizModalProps) {
    const story = STORIES.find(s => s.id === storyId);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const submitStoryQuiz = useLexicaStore(state => state.submitStoryQuiz);
    const storyQuizAttempts = useLexicaStore(state => state.storyQuizAttempts);

    const { quizCorrect, quizWrong } = useSoundEffects();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Check cooldown (1 hour)
    const lastAttempt = part === 1
        ? storyQuizAttempts[storyId]?.part1LastAttempt
        : storyQuizAttempts[storyId]?.part2LastAttempt;
    const cooldownRemaining = lastAttempt
        // eslint-disable-next-line react-hooks/purity
        ? Math.max(0, 3600000 - (Date.now() - lastAttempt)) // 1 hour in ms
        : 0;
    const isOnCooldown = cooldownRemaining > 0;

    // Generate quiz questions
    const questions = useMemo(() => {
        if (!story) return [];

        const learnedWordIds = Array.from(learnedWords);
        const storyLearnedWords = story.vocabularyIds.filter(id => learnedWordIds.includes(id));

        // Get vocab data for learned words
        const vocabMap = new Map(VOCAB_DATABASE.map(v => [v.id, v]));
        const availableVocab = storyLearnedWords
            .map(id => vocabMap.get(id))
            .filter(Boolean);

        if (availableVocab.length < 3) return []; // Need at least 3 words

        // Generate 5 questions from learned words
        // eslint-disable-next-line react-hooks/purity
        const shuffled = [...availableVocab].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(5, shuffled.length));

        return selected.map(vocab => {
            // Get 3 wrong answers from other words
            const wrongOptions = availableVocab
                .filter(v => v!.id !== vocab!.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(v => v!.translationHint);

            const allOptions = [vocab!.translationHint, ...wrongOptions]
                .sort(() => Math.random() - 0.5);

            return {
                word: vocab!.word,
                wordVietnamese: vocab!.translationHint,
                correctAnswer: vocab!.translationHint,
                options: allOptions,
            };
        });
    }, [story, learnedWords]);

    if (!story || questions.length === 0) {
        return null;
    }

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;

    const handleAnswer = (answer: string) => {
        const newAnswers = [...selectedAnswers, answer];
        setSelectedAnswers(newAnswers);

        // Play sound feedback
        const isCorrect = answer === currentQ.correctAnswer;
        if (isCorrect) {
            quizCorrect();
        } else {
            quizWrong();
        }

        if (isLastQuestion) {
            // Calculate score
            const score = newAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
            const passed = score >= 4; // Need 4/5 correct
            submitStoryQuiz(storyId, part, score);
            setShowResults(true);

            // Call onSuccess callback if quiz passed (will trigger navigation to unlock page)
            if (passed && onSuccess) {
                onSuccess(storyId, part);
            }
        } else {
            setTimeout(() => {
                setCurrentQuestion(currentQuestion + 1);
            }, 500);
        }
    };

    const score = selectedAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
    const passed = score >= 4;

    if (isOnCooldown) {
        const minutesLeft = Math.ceil(cooldownRemaining / 60000);
        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-50 bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="text-center space-y-4">
                        <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
                            <Brain className="w-12 h-12 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Quiz Cooldown</h2>
                        <p className="text-slate-400">
                            Bạn cần đợi <span className="text-amber-400 font-bold">{minutesLeft} phút</span> nữa để thử lại quiz.
                        </p>
                        <p className="text-sm text-slate-500">
                            Hoặc học thêm từ để unlock tự nhiên!
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </motion.div>
            </>
        );
    }

    if (showResults) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-50 bg-slate-800 border-2 border-cyan-500/50 rounded-2xl p-6"
                >
                    <div className="text-center space-y-6">
                        <div className={`p-4 rounded-full w-fit mx-auto ${passed ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                            {passed ? (
                                <CheckCircle className="w-16 h-16 text-cyan-400" />
                            ) : (
                                <XCircle className="w-16 h-16 text-red-400" />
                            )}
                        </div>

                        <div>
                            <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-cyan-400' : 'text-red-400'}`}>
                                {score}/5
                            </h2>
                            <p className="text-xl font-bold text-white mb-1">
                                {passed ? '🎉 Passed!' : '💪 Try Again'}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {passed
                                    ? `Part ${part} đã được mở khóa!`
                                    : 'Bạn cần 4/5 để pass. Học thêm từ hoặc thử lại sau 1 giờ.'
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            {questions.map((q, idx) => {
                                const userAnswer = selectedAnswers[idx];
                                const correct = userAnswer === q.correctAnswer;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg border ${correct
                                            ? 'bg-cyan-500/10 border-cyan-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {correct ? (
                                                <CheckCircle className="w-4 h-4 text-cyan-400" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                            <span className="text-white font-medium">{q.word}</span>
                                        </div>
                                        {!correct && (
                                            <p className="text-xs text-slate-400 ml-6 mt-1">
                                                Đúng: {q.correctAnswer}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-bold transition-colors"
                        >
                            {passed ? 'Đọc Story!' : 'Đóng'}
                        </button>
                    </div>
                </motion.div>
            </>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-lg z-50 bg-slate-800 border border-cyan-500/30 rounded-2xl p-6"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Brain className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-xl font-bold text-white">Story Quiz - Part {part}</h2>
                        </div>
                        <p className="text-slate-400 text-sm">{story.title}</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            {questions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 flex-1 rounded-full ${idx < currentQuestion
                                        ? 'bg-cyan-400'
                                        : idx === currentQuestion
                                            ? 'bg-cyan-500/50'
                                            : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center">
                                <p className="text-sm text-slate-500 mb-2">What does this word mean?</p>
                                <p className="text-3xl font-bold text-white">{currentQ.word}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {currentQ.options.map((option, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(option)}
                                        className="p-4 bg-slate-700/50 hover:bg-cyan-500/20 border border-slate-600 hover:border-cyan-500/50 rounded-lg text-left transition-all group"
                                    >
                                        <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                                            {option}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <p className="text-center text-xs text-slate-500">
                        Cần 4/5 đúng để unlock • Question {currentQuestion + 1}/5
                    </p>
                </div>
            </motion.div>
        </>
    );
}
