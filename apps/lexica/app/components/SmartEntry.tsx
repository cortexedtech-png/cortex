'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, BookOpen, RotateCcw, Zap, BookMarked, ArrowRight } from 'lucide-react';
import { useLexicaStore } from '../store/lexicaStore';
import { getDueCards } from '../lib/eloAlgorithm';
import { STORIES, isStoryPreviewVisible } from '../data/stories';
import { useSoundEffects } from '../hooks/useSoundEffects';
import Link from 'next/link';

function getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getGreeting(): { text: string; icon: typeof Sun } {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return { text: 'Chào buổi sáng', icon: Sun };
    } else if (hour >= 12 && hour < 18) {
        return { text: 'Chào buổi chiều', icon: Cloud };
    } else {
        return { text: 'Chào buổi tối', icon: Moon };
    }
}

interface SmartEntryProps {
    onStartSession: () => void;
}

export default function SmartEntry({ onStartSession }: SmartEntryProps) {
    const { buttonPress } = useSoundEffects();

    const lastGoalSetDate = useLexicaStore(state => state.lastGoalSetDate);
    const dailyGoal = useLexicaStore(state => state.dailyGoal);
    const dailyProgress = useLexicaStore(state => state.dailyProgress);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const setDailyGoal = useLexicaStore(state => state.setDailyGoal);
    const checkAndResetDailyGoal = useLexicaStore(state => state.checkAndResetDailyGoal);

    const [sliderValue, setSliderValue] = useState(dailyGoal);
    const [manualShowSlider, setManualShowSlider] = useState(false); // Manual override

    const today = getTodayDateString();
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

    // Check and reset daily goal on mount
    useEffect(() => {
        checkAndResetDailyGoal();
    }, [checkAndResetDailyGoal]);

    // Calculate if we should show the slider (compute during render, not in effect)
    const hasSetGoalToday = typeof window !== 'undefined' ? sessionStorage.getItem(`goal_set_${today}`) : null;
    const shouldAutoShowSlider = !hasSetGoalToday && (!lastGoalSetDate || lastGoalSetDate !== today);
    const showSlider = manualShowSlider || shouldAutoShowSlider;

    // Get context data for Smart CTA
    const dueCards = getDueCards(cardProgress);
    const dueCount = dueCards.length;
    const learnedWordIds = Array.from(learnedWords);
    const visibleStories = STORIES.filter(story => isStoryPreviewVisible(story, learnedWordIds));
    const hasUnreadStory = visibleStories.length > 0;
    const remaining = Math.max(0, dailyGoal - dailyProgress);

    const handleStartWithGoal = () => {
        buttonPress();
        setDailyGoal(sliderValue);
        sessionStorage.setItem(`goal_set_${today}`, '1');
        onStartSession();
    };

    const handleContinue = () => {
        buttonPress();
        onStartSession();
    };

    // Show Daily Slider (First open of the day)
    if (showSlider) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] px-4 sm:px-6 text-center"
            >
                {/* Greeting */}
                <div className="mb-6 sm:mb-8">

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center"
                    >
                        <GreetingIcon className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{greeting.text}!</h2>
                    <p className="text-slate-400 text-xs sm:text-sm">Hôm nay bạn muốn học bao nhiêu từ?</p>
                </div>

                {/* Slider */}
                <div className="w-full max-w-sm mb-6 sm:mb-8">
                    <div className="mb-3 sm:mb-4">
                        <div className="text-5xl sm:text-6xl font-bold text-cyan-400 mb-2">
                            {sliderValue}
                        </div>
                        <div className="text-slate-500 text-sm">từ vựng</div>
                    </div>

                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        style={{
                            background: `linear-gradient(to right, rgb(6 182 212) 0%, rgb(6 182 212) ${((sliderValue - 5) / 25) * 100}%, rgb(51 65 85) ${((sliderValue - 5) / 25) * 100}%, rgb(51 65 85) 100%)`
                        }}
                    />

                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                        <span>30</span>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartWithGoal}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95"
                >
                    Bắt đầu học
                </button>

                {/* Info */}
                <p className="text-slate-600 text-xs mt-6 max-w-xs">
                    Bạn có thể thay đổi mục tiêu này bất cứ lúc nào trong Settings
                </p>
            </motion.div>
        );
    }

    // Show Smart CTA (Subsequent opens)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] px-4 sm:px-6"
        >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
                <p className="text-slate-400 text-sm">
                    {remaining > 0 ? (
                        <>Còn <span className="text-cyan-400 font-bold">{remaining} từ</span> để đạt mục tiêu hôm nay</>
                    ) : (
                        <>Bạn đã hoàn thành <span className="text-amber-400 font-bold">{dailyGoal} từ</span> hôm nay!</>
                    )}
                </p>
            </div>

            {/* Smart CTAs */}
            <div className="w-full max-w-md space-y-2.5 sm:space-y-3">
                {/* Priority 1: Due Cards > 5 */}
                {dueCount > 5 && (
                    <Link
                        href="/review"
                        onClick={() => buttonPress()}
                        className="flex items-center justify-between p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 transition-all group hover:scale-[1.02] active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-slate-600/50">
                                <RotateCcw className="w-6 h-6 text-slate-200" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Ôn tập đến hạn</p>
                                <p className="text-slate-400 text-sm">{dueCount} từ cần ôn ngay</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {/* Priority 2: Story Ready */}
                {hasUnreadStory && (
                    <Link
                        href="/stories"
                        onClick={() => buttonPress()}
                        className="flex items-center justify-between p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 transition-all group hover:scale-[1.02] active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-slate-600/50">
                                <BookMarked className="w-6 h-6 text-slate-200" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Câu chuyện mới</p>
                                <p className="text-slate-400 text-sm">Thực hành qua story mode</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {/* Priority 3: Continue Learning (Default) */}
                <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-between p-5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 transition-all group hover:scale-[1.02] active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-600/50">
                            <Zap className="w-6 h-6 text-slate-200" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-bold text-lg">
                                {remaining > 0 ? 'Tiếp tục học' : 'Học thêm'}
                            </p>
                            <p className="text-slate-400 text-sm">
                                {remaining > 0 ? `Còn ${remaining} từ mục tiêu` : 'Vượt mục tiêu hôm nay'}
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary Actions */}
                <div className="flex gap-3 mt-4">
                    <Link
                        href="/learned"
                        onClick={() => buttonPress()}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-slate-300 text-sm font-medium"
                    >
                        <BookOpen className="w-4 h-4" />
                        Từ đã học
                    </Link>
                    <button
                        onClick={() => {
                            buttonPress();
                            setManualShowSlider(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-slate-300 text-sm font-medium"
                    >
                        <Zap className="w-4 h-4" />
                        Đổi mục tiêu
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
