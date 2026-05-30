'use client';

import { useState } from 'react';
import { Swords, Copy, Check } from 'lucide-react';
import { createChallenge, getSavedNickname, saveNickname, type GameType } from '../lib/challenges';

interface ChallengeButtonProps {
    gameType: GameType;
    score: number;
}

export default function ChallengeButton({ gameType, score }: ChallengeButtonProps) {
    const [status, setStatus] = useState<'idle' | 'entering' | 'creating' | 'done'>('idle');
    const [nickname, setNickname] = useState(() => getSavedNickname() || '');

    const create = async (name: string) => {
        setStatus('creating');
        saveNickname(name);
        const id = await createChallenge(gameType, score, name);
        if (id) {
            const url = `${window.location.origin}/challenge/${id}`;
            await navigator.clipboard.writeText(url);
        }
        setStatus('done');
        setTimeout(() => setStatus('idle'), 3500);
    };

    const handleClick = () => {
        if (status !== 'idle') return;
        if (getSavedNickname()) {
            create(getSavedNickname()!);
        } else {
            setStatus('entering');
        }
    };

    if (status === 'entering') {
        return (
            <div className="flex gap-2">
                <input
                    autoFocus
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && nickname.trim() && create(nickname)}
                    placeholder="Tên hiển thị của bạn..."
                    maxLength={20}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                    onClick={() => nickname.trim() && create(nickname)}
                    disabled={!nickname.trim()}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-all"
                >
                    OK
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={status !== 'idle'}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
        >
            {status === 'done' ? (
                <><span className="text-cyan-300">Copied! Hãy gửi cho bạn bè link này nhaaa!</span></>
            ) : status === 'creating' ? (
                <><div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" /> Đang tạo link...</>
            ) : (
                <><Swords className="w-4 h-4 text-cyan-400" /> Thách bạn bè!</>
            )}
        </button>
    );
}
