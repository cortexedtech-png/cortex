'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { getProfile, upsertProfile, signOut as authSignOut, type Profile, type User } from '../lib/auth';
import { getSavedNickname } from '../lib/challenges';

interface AuthContextValue {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (u: User) => {
        let p = await getProfile(u.id);
        if (!p) {
            // Lần đầu đăng nhập — tạo profile với nickname từ localStorage nếu có
            const nickname = getSavedNickname() ?? u.email?.split('@')[0] ?? 'Anonymous';
            p = await upsertProfile(u.id, nickname);
        }
        setProfile(p);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user);
    }, [user, loadProfile]);

    useEffect(() => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            Promise.resolve().then(() => setLoading(false));
            return;
        }

        // Lấy session ban đầu (xử lý magic link redirect tự động)
        supabase.auth.getSession().then(({ data }) => {
            const u = data.session?.user ?? null;
            setUser(u);
            if (u) loadProfile(u).finally(() => setLoading(false));
            else setLoading(false);
        });

        // Lắng nghe thay đổi auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) loadProfile(u);
            else setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    const signOut = async () => {
        await authSignOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
