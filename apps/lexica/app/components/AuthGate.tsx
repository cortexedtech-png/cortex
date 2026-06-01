'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, LogIn } from 'lucide-react';
import { signInWithEmail } from '../lib/auth';

interface AuthGateProps {
    /** Text mô tả tại sao cần đăng nhập */
    reason?: string;
    /** Callback khi user đã đăng nhập (auth state change xử lý tự động qua AuthProvider) */
    onSent?: () => void;
}

export default function AuthGate({ reason, onSent }: AuthGateProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async () => {
        if (!email.trim() || status === 'sending') return;
        setStatus('sending');
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/buddy` : '';
        const { error } = await signInWithEmail(email, redirectTo);
        if (error) {
            setErrorMsg(error);
            setStatus('error');
        } else {
            setStatus('sent');
            onSent?.();
        }
    };

    if (status === 'sent') {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <h3 className="text-lg font-bold text-white">Kiểm tra email của bạn!</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                    Chúng tôi đã gửi link đăng nhập tới <span className="text-cyan-400">{email}</span>.
                    Click vào link để tiếp tục.
                </p>
                <p className="text-slate-500 text-xs">Không tìm thấy? Kiểm tra thư mục spam.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <LogIn className="w-8 h-8 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Lưu tài khoản</h3>
                <p className="text-slate-400 text-sm">
                    {reason ?? 'Nhập email để lưu tiến độ và kết nối với bạn bè. Không cần mật khẩu.'}
                </p>
            </div>

            <div className="flex gap-2">
                <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!email.trim() || status === 'sending'}
                    className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-xl transition-all flex items-center gap-2"
                >
                    {status === 'sending'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Mail className="w-4 h-4" />}
                </button>
            </div>

            {status === 'error' && (
                <p className="text-red-400 text-xs text-center">{errorMsg}</p>
            )}

            <p className="text-slate-500 text-xs text-center">
                Chỉ dùng để xác thực. Không spam, không mật khẩu.
            </p>
        </div>
    );
}
