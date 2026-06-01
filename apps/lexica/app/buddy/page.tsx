'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame, Zap, Target, Plus, Copy, Check, UserX, ArrowLeft, Loader2, LogOut, BookOpen, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useActivitySync } from '../hooks/useActivitySync';
import { useLexicaStore } from '../store/lexicaStore';
import AuthGate from '../components/AuthGate';
import { getMyBuddies, createInviteCode, acceptInvite, removeBuddy, checkAndUpdateDuoStreak, type BuddyInfo } from '../lib/buddy';
import { upsertProfile } from '../lib/auth';

export default function BuddyPage() {
    useActivitySync(); // sync activity khi ở trang này

    const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
    const currentStreak = useLexicaStore(s => s.currentStreak);
    const dailyProgress = useLexicaStore(s => s.dailyProgress);
    const dailyGoal = useLexicaStore(s => s.dailyGoal);

    const [buddies, setBuddies] = useState<BuddyInfo[]>([]);
    const [loadingBuddies, setLoadingBuddies] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [joinError, setJoinError] = useState('');
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [editingNickname, setEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');
    const [savingNickname, setSavingNickname] = useState(false);

    // Load buddies when user changes
    useEffect(() => {
        if (!user) return;
        const loadBuddies = async () => {
            setLoadingBuddies(true);
            try {
                console.log('Starting buddy data load...');
                const list = await getMyBuddies(user.id);
                console.log('Buddy data loaded:', list);
                setBuddies(list);
                // Update duo streaks in background
                for (const b of list) {
                    checkAndUpdateDuoStreak(b.pairId, user.id, b.id);
                }
            } catch (error) {
                console.error('Error loading buddies:', error);
            } finally {
                setLoadingBuddies(false);
            }
        };
        loadBuddies();
    }, [user]);

    const handleCreateCode = async () => {
        if (!user) return;
        const code = await createInviteCode(user.id);
        setInviteCode(code);
    };

    const handleCopyCode = async () => {
        if (!inviteCode) return;
        await navigator.clipboard.writeText(inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleJoin = async () => {
        if (!user || !joinCode.trim()) return;
        setJoinStatus('loading');
        const result = await acceptInvite(joinCode, user.id);
        if (result.success) {
            setJoinStatus('success');
            setJoinCode('');
            setShowAddPanel(false);
            // Reload buddies after accepting invite
            setLoadingBuddies(true);
            const list = await getMyBuddies(user.id);
            setBuddies(list);
            setLoadingBuddies(false);
        } else {
            setJoinStatus('error');
            setJoinError(result.error ?? 'Lỗi không xác định');
        }
    };

    const handleRemoveBuddy = async (pairId: string) => {
        await removeBuddy(pairId);
        setBuddies(prev => prev.filter(b => b.pairId !== pairId));
    };

    const goalMet = dailyProgress >= dailyGoal;

    const handleSaveNickname = async () => {
        if (!user || !nicknameInput.trim() || nicknameInput.length > 20) {
            setJoinError('Nickname must be 1-20 characters');
            return;
        }
        setSavingNickname(true);
        await upsertProfile(user.id, nicknameInput.trim());
        await refreshProfile();
        setSavingNickname(false);
        setEditingNickname(false);
    };

    // ── Loading ──────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    // ── Not logged in ────────────────────────────────────
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6">
                    <div className="text-center space-y-2">
                        <Users className="w-10 h-10 text-cyan-400 mx-auto" />
                        <h1 className="text-xl font-bold text-white">Study Buddy</h1>
                        <p className="text-slate-400 text-sm">Học cùng bạn bè, duy trì chuỗi đôi, tạo động lực mỗi ngày.</p>
                    </div>
                    <AuthGate reason="Cần lưu tài khoản để kết nối với bạn bè. Không cần mật khẩu." />
                    <Link href="/" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    // ── Logged in ────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-900 pb-8">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/buddy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            <Users className="w-4 h-4" />
                        </Link>
                        {editingNickname ? (
                            <div className="flex items-center gap-1">
                                <input
                                    autoFocus
                                    value={nicknameInput}
                                    onChange={e => setNicknameInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleSaveNickname();
                                        if (e.key === 'Escape') setEditingNickname(false);
                                    }}
                                    maxLength={20}
                                    className="w-28 px-2 py-0.5 bg-slate-700 border border-cyan-500 rounded text-white text-sm focus:outline-none"
                                />
                                <button
                                    onClick={handleSaveNickname}
                                    disabled={savingNickname || !nicknameInput.trim()}
                                    className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-colors"
                                >
                                    {savingNickname ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setNicknameInput(profile?.nickname ?? ''); setEditingNickname(true); }}
                                className="flex items-center gap-1 font-bold text-white text-sm hover:text-cyan-300 transition-colors group"
                            >
                                {profile?.nickname ?? 'Đặt tên'}
                                <Pencil className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            </button>
                        )}
                    </div>
                    <button onClick={signOut} className="text-slate-500 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
                {/* My stats today */}
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">Hôm nay của bạn</p>
                    <div className="grid grid-cols-3 gap-3">
                        <StatPill icon={<Flame className="w-4 h-4 text-orange-400" />} label="Streak" value={`${currentStreak} ngày`} />
                        <StatPill
                            icon={<Target className="w-4 h-4 text-cyan-400" />}
                            label="Tiến độ"
                            value={`${dailyProgress}/${dailyGoal}`}
                            highlight={goalMet}
                        />
                        <StatPill
                            icon={<BookOpen className="w-4 h-4 text-purple-400" />}
                            label="Mục tiêu"
                            value={goalMet ? 'Đạt' : 'Chưa'}
                            highlight={goalMet}
                        />
                    </div>
                </div>

                {/* Buddies list */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-bold text-sm uppercase tracking-wide">Study Buddies ({buddies.length}/5)</h2>
                        {buddies.length < 5 && (
                            <button
                                onClick={() => setShowAddPanel(v => !v)}
                                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm bạn
                            </button>
                        )}
                    </div>

                    {/* Add buddy panel */}
                    <AnimatePresence>
                        {showAddPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-4">
                                    {/* Create invite */}
                                    <div className="space-y-2">
                                        <p className="text-slate-400 text-xs">Tạo mã mời cho bạn bè</p>
                                        {inviteCode ? (
                                            <div className="flex gap-2">
                                                <div className="flex-1 px-4 py-2 bg-slate-700 rounded-lg text-white font-mono text-lg tracking-widest text-center">
                                                    {inviteCode}
                                                </div>
                                                <button
                                                    onClick={handleCopyCode}
                                                    className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all"
                                                >
                                                    {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleCreateCode}
                                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all"
                                            >
                                                Tạo mã mời
                                            </button>
                                        )}
                                        {inviteCode && (
                                            <p className="text-slate-500 text-xs text-center">Hết hạn sau 48 giờ</p>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-700" />

                                    {/* Enter invite code */}
                                    <div className="space-y-2">
                                        <p className="text-slate-400 text-xs">Nhập mã từ bạn bè</p>
                                        <div className="flex gap-2">
                                            <input
                                                value={joinCode}
                                                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinStatus('idle'); }}
                                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                                placeholder="ABC123"
                                                maxLength={6}
                                                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono placeholder-slate-500 text-center text-lg tracking-widest focus:outline-none focus:border-cyan-500 transition-colors uppercase"
                                            />
                                            <button
                                                onClick={handleJoin}
                                                disabled={joinCode.length < 6 || joinStatus === 'loading'}
                                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-lg transition-all flex items-center"
                                            >
                                                {joinStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'OK'}
                                            </button>
                                        </div>
                                        {joinStatus === 'error' && <p className="text-red-400 text-xs">{joinError}</p>}
                                        {joinStatus === 'success' && <p className="text-green-400 text-xs">Đã kết nối!</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Buddy cards */}
                    {loadingBuddies ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        </div>
                    ) : buddies.length === 0 ? (
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 border-dashed text-center space-y-2">
                            <Users className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="text-slate-400 text-sm">Chưa có buddy nào</p>
                            <p className="text-slate-500 text-xs">Tạo mã mời và gửi cho bạn bè để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {buddies.map(buddy => (
                                <BuddyCard
                                    key={buddy.id}
                                    buddy={buddy}
                                    myGoalMet={goalMet}
                                    onRemove={() => handleRemoveBuddy(buddy.pairId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────
function StatPill({ icon, label, value, highlight }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className={`rounded-xl p-3 text-center space-y-1 ${highlight ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-700/50'}`}>
            <div className="flex justify-center">{icon}</div>
            <div className="text-white font-bold text-sm">{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
        </div>
    );
}

function BuddyCard({ buddy, myGoalMet, onRemove }: {
    buddy: BuddyInfo;
    myGoalMet: boolean;
    onRemove: () => void;
}) {
    const [confirmRemove, setConfirmRemove] = useState(false);
    const buddyGoalMet = buddy.today ? buddy.today.goal_met : false;
    const duoActive = myGoalMet && buddyGoalMet;
    const buddyStudiedToday = !!buddy.today;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-slate-800 rounded-2xl p-4 border transition-all ${duoActive ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-slate-700'}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-white font-semibold text-sm">{buddy.nickname}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {/* Personal streak */}
                            <span className="text-orange-400 text-xs flex items-center gap-0.5">
                                <Flame className="w-3 h-3" />
                                {buddy.today?.streak ?? 0}
                            </span>
                            {/* ELO Rating */}
                            <span className="text-xs text-slate-400 flex items-center gap-0.5">
                                <Target className="w-3 h-3" />
                                {buddy.today?.words_swiped || 0}/{buddy.today?.daily_goal || 0}
                            </span>
                            {/* Duo streak */}
                            <span className={`text-xs flex items-center gap-0.5 ${duoActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                                <Zap className="w-3 h-3" />
                                {buddy.duoStreak} đôi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Today status */}
                <div className="text-right">
                    {buddyStudiedToday ? (
                        <div className="space-y-0.5">
                            <div className="text-xs text-slate-400">
                                {buddy.today!.words_swiped}/{buddy.today!.daily_goal} thẻ
                            </div>
                            <div className={`text-xs font-medium ${buddyGoalMet ? 'text-cyan-500' : 'text-slate-400'}`}>
                                {buddyGoalMet ? 'Đạt mục tiêu' : 'Đang học'}
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-500 text-xs">Chưa học hôm nay</span>
                    )}
                </div>
            </div>

            {/* Duo streak banner */}
            {duoActive && (
                <div className="mt-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-3 py-2 text-center">
                    <span className="text-cyan-500 text-xs font-medium flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" /> Cả hai đều đạt mục tiêu hôm nay! Chuỗi đôi +1
                    </span>
                </div>
            )}

            {/* Remove button */}
            <div className="mt-3 flex justify-end">
                {confirmRemove ? (
                    <div className="flex gap-2">
                        <button onClick={() => setConfirmRemove(false)} className="text-slate-400 hover:text-white text-xs transition-colors">Hủy</button>
                        <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-xs transition-colors flex items-center gap-1">
                            <UserX className="w-3 h-3" /> Xác nhận xóa
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmRemove(true)} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
                        Xóa buddy
                    </button>
                )}
            </div>
        </motion.div>
    );
}
