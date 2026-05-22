'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Target, Flame, Trophy, TrendingUp, Calendar, PieChart as PieChartIcon, MousePointerClick, Volume2, VolumeX, Hand, Mic, RotateCcw, Trash2 } from 'lucide-react';
import CortexSection from '../components/CortexSection';
import { useLexicaStore } from '../store/lexicaStore';
import { getProgressStats } from '../lib/eloAlgorithm';
import ActivityHeatmap from '../components/ActivityHeatmap';
import ELOChart from '../components/ELOChart';
import AccuracyChart from '../components/AccuracyChart';
import CardStatesPieChart from '../components/CardStatesPieChart';
import CountUp from '../components/CountUp';
import { useSoundEffects } from '../hooks/useSoundEffects';

function StatsPageContent() {
    const learnedCount = useLexicaStore(state => state.learnedWords.size);
    const learnedWords = useLexicaStore(state => state.learnedWords);
    const currentStreak = useLexicaStore(state => state.currentStreak);
    const longestStreak = useLexicaStore(state => state.longestStreak);
    const userStats = useLexicaStore(state => state.userStats);
    const highestElo = useLexicaStore(state => state.highestElo);
    const cardProgress = useLexicaStore(state => state.cardProgress);
    const studyHistory = useLexicaStore(state => state.studyHistory);
    const soundEnabled = useLexicaStore(state => state.soundEnabled);
    const toggleSound = useLexicaStore(state => state.toggleSound);
    const swipeMode = useLexicaStore(state => state.swipeMode);
    const setSwipeMode = useLexicaStore(state => state.setSwipeMode);
    const autoReviewInDeck = useLexicaStore(state => state.autoReviewInDeck);
    const toggleAutoReview = useLexicaStore(state => state.toggleAutoReview);
    const resetProgress = useLexicaStore(state => state.resetProgress);
    const { click } = useSoundEffects();

    const [showResetDialog, setShowResetDialog] = useState(false);

    const progressStats = getProgressStats(cardProgress);
    const accuracy = userStats.totalSwipes > 0
        ? Math.round((userStats.correctSwipes / userStats.totalSwipes) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Trang chủ
                    </Link>
                    <h1 className="text-md md:text-2xl font-bold text-white ">Cài đặt & Thống kê</h1>
                    <div className="w-10 md:w-20" /> {/* spacer */}
                </div>

                {/* Settings Section */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-cyan-500/15' : 'bg-slate-700/60'
                                    }`}>
                                    {soundEnabled ? (
                                        <Volume2 className="w-5 h-5 text-cyan-400" />
                                    ) : (
                                        <VolumeX className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Âm thanh</p>
                                    <p className="text-slate-500 text-xs">Hiệu ứng âm thanh khi học</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    click();
                                    toggleSound();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Swipe Mode Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${swipeMode === 'voice' ? 'bg-purple-500/15' : 'bg-cyan-500/15'
                                    }`}>
                                    {swipeMode === 'voice' ? (
                                        <Mic className="w-5 h-5 text-purple-400" />
                                    ) : (
                                        <Hand className="w-5 h-5 text-cyan-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Chế độ học</p>
                                    <p className="text-slate-500 text-xs">
                                        {swipeMode === 'voice' ? 'Voice (nói để học)' : 'Touch (vuốt thẻ)'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    click();
                                    setSwipeMode(swipeMode === 'touch' ? 'voice' : 'touch');
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${swipeMode === 'voice' ? 'bg-purple-500' : 'bg-cyan-500'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${swipeMode === 'voice' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Auto-Review Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 md:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${autoReviewInDeck ? 'bg-amber-500/15' : 'bg-slate-700/60'
                                    }`}>
                                    <RotateCcw className={`w-5 h-5 ${autoReviewInDeck ? 'text-amber-400' : 'text-slate-500'}`} />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Tự động ôn tập trong deck</p>
                                    <p className="text-slate-500 text-xs">
                                        {autoReviewInDeck
                                            ? 'Tự động thêm từ cần ôn vào deck học (1 lần/phiên)'
                                            : 'Tắt - chỉ ôn tập qua trang /review riêng'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    click();
                                    toggleAutoReview();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoReviewInDeck ? 'bg-amber-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoReviewInDeck ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Hidden Reset Button */}
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-700/50">
                            <button
                                onClick={() => {
                                    click();
                                    setShowResetDialog(true);
                                }}
                                className="w-full p-3 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all group"
                            >
                                <div className="flex items-center justify-center gap-2 text-red-400/60 group-hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Reset toàn bộ tiến trình</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cortex Hub Section */}
                <CortexSection />

                {/* Featured Streak Card */}
                {(() => {
                    const MILESTONES = [3, 7, 14, 30, 60, 100];
                    const MAX_TRACK = 100;
                    const fillPct = Math.min((currentStreak / MAX_TRACK) * 100, 100);
                    const nextMilestone = MILESTONES.find(m => m > currentStreak) ?? null;
                    const MILESTONE_LABELS: Record<number, string> = {
                        3: '3 ngày',
                        7: '1 tuần',
                        14: '2 tuần',
                        30: '1 tháng',
                        60: '2 tháng',
                        100: '100 ngày'
                    };

                    return (
                        <div className={`rounded-xl border p-6 mb-8 ${currentStreak >= 7
                            ? 'bg-orange-500/8 border-orange-500/30'
                            : currentStreak >= 3
                                ? 'bg-amber-500/8 border-amber-500/20'
                                : 'bg-slate-800/40 border-slate-700'
                            }`}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${currentStreak >= 7 ? 'bg-orange-500/20' : 'bg-slate-700/60'
                                        }`}>
                                        <Flame className={`w-7 h-7 ${currentStreak >= 7
                                            ? 'text-orange-400'
                                            : currentStreak >= 3
                                                ? 'text-amber-400'
                                                : 'text-slate-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                            Streak
                                        </div>
                                        <div className={`text-3xl font-bold ${currentStreak >= 7
                                            ? 'text-orange-400'
                                            : currentStreak >= 3
                                                ? 'text-amber-400'
                                                : 'text-slate-300'
                                            }`}>
                                            {currentStreak} <span className="text-lg font-normal text-slate-400">
                                                ngày liên tiếp
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {longestStreak > 0 && (
                                    <div className="text-right">
                                        <div className="text-xs text-slate-600">Kỷ lục</div>
                                        <div className="text-lg font-bold text-slate-400">{longestStreak} ngày</div>
                                    </div>
                                )}
                            </div>

                            {/* Milestone track */}
                            <div className="space-y-2">
                                <div className="relative h-2.5 bg-slate-800 rounded-full">
                                    {/* Fill bar */}
                                    <div
                                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${currentStreak >= 30
                                            ? 'bg-linear-to-r from-orange-500 to-red-400'
                                            : currentStreak >= 7
                                                ? 'bg-linear-to-r from-amber-400 to-orange-500'
                                                : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${fillPct}%` }}
                                    />
                                    {/* Milestone markers */}
                                    {MILESTONES.map(m => (
                                        <div
                                            key={m}
                                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                            style={{ left: `${(m / MAX_TRACK) * 100}%` }}
                                        >
                                            <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${currentStreak >= m
                                                ? 'bg-orange-400 border-orange-300'
                                                : 'bg-slate-700 border-slate-600'
                                                }`} />
                                        </div>
                                    ))}
                                </div>
                                {/* Labels */}
                                <div className="relative h-4">
                                    {MILESTONES.map(m => (
                                        <span
                                            key={m}
                                            className={`absolute text-[9px] -translate-x-1/2 transition-colors font-mono ${currentStreak >= m ? 'text-orange-400/80' : 'text-slate-600'
                                                }`}
                                            style={{ left: `${(m / MAX_TRACK) * 100}%` }}
                                        >
                                            {MILESTONE_LABELS[m]}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-right mt-2">
                                    <span className="text-xs text-slate-500">
                                        {nextMilestone
                                            ? `${nextMilestone - currentStreak} ngày nữa đến mốc ${MILESTONE_LABELS[nextMilestone]}`
                                            : '🏆 Đã đạt tất cả mốc!'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Words Learned */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-cyan-500/15">
                                <BookOpen className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Từ đã học</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            <CountUp end={learnedCount} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            <CountUp end={progressStats.mastered} /> thành thạo
                        </p>
                    </div>

                    {/* Total Swipes */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/15">
                                <MousePointerClick className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Tổng swipes</span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            <CountUp end={userStats.totalSwipes} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            <CountUp end={userStats.correctSwipes} /> đúng
                        </p>
                    </div>

                    {/* Accuracy Rate */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/15">
                                <Target className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-slate-400 text-sm whitespace-nowrap">Độ chính xác</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                            <CountUp end={accuracy} suffix="%" />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            trung bình
                        </p>
                    </div>

                    {/* ELO Rating (Combined) */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-amber-500/15">
                                <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-slate-400 text-sm">ELO Rating</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-400">
                            <CountUp end={userStats.currentElo} />
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            cao nhất: <span className="text-orange-400 font-semibold"><CountUp end={highestElo} /></span>
                        </p>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 focus:outline-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white">Lịch hoạt động</h2>
                        <span className="text-xs text-slate-500">(365 ngày qua)</span>
                    </div>
                    <ActivityHeatmap studyHistory={studyHistory} />
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* ELO Progress Chart */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-bold text-white">Tiến độ ELO</h2>
                            <span className="text-xs text-slate-500">(30 ngày)</span>
                        </div>
                        <ELOChart studyHistory={studyHistory} currentElo={userStats.currentElo} />
                    </div>

                    {/* Card States Chart */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                        <div className="flex items-center gap-3 mb-4">
                            <PieChartIcon className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-bold text-white">Phân bổ từ vựng</h2>
                        </div>
                        <CardStatesPieChart cardProgress={cardProgress} learnedWords={learnedWords} />
                    </div>
                </div>

                {/* Accuracy Trend Chart - Full width */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 focus:outline-none">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-5 h-5 text-green-400" />
                        <h2 className="text-lg font-bold text-white">Xu hướng Accuracy</h2>
                        <span className="text-xs text-slate-500">(30 ngày)</span>
                    </div>
                    <AccuracyChart studyHistory={studyHistory} />
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            {showResetDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResetDialog(false)}>
                    <div className="bg-slate-800 border-2 border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">Xác nhận Reset</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Bạn có chắc chắn muốn reset toàn bộ tiến trình? Hành động này sẽ xóa:
                                </p>
                                <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                        Tất cả từ vựng đã học ({learnedCount} từ)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                        Streak hiện tại ({currentStreak} ngày)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                        Thống kê và lịch sử học tập
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                        Level đã chọn và Story Mode progress
                                    </li>
                                </ul>
                                <p className="mt-4 text-xs text-red-400 font-medium">
                                    ⚠️ Không thể hoàn tác!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetDialog(false)}
                                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium text-sm transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    click();
                                    resetProgress();
                                    setShowResetDialog(false);
                                    // Optionally redirect to home
                                    window.location.href = '/';
                                }}
                                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-500/20"
                            >
                                Xác nhận Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Wrapper with Suspense boundary
function StatsPageFallback() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
        </div>
    );
}

export default function StatsPage() {
    return (
        <Suspense fallback={<StatsPageFallback />}>
            <StatsPageContent />
        </Suspense>
    );
}
