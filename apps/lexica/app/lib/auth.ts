import { getSupabaseClient } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type { Session, User };

export interface Profile {
    id: string;
    nickname: string;
    created_at: string;
}

/** Gửi magic link về email */
export async function signInWithEmail(email: string, redirectTo: string): Promise<{ error: string | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };

    const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: redirectTo },
    });

    return { error: error?.message ?? null };
}

/** Đăng xuất */
export async function signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
}

/** Lấy session hiện tại */
export async function getSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
}

/** Lấy user hiện tại */
export async function getCurrentUser(): Promise<User | null> {
    const session = await getSession();
    return session?.user ?? null;
}

/** Lấy profile từ Supabase */
export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data as Profile | null;
}

/** Tạo profile lần đầu sau khi đăng nhập */
export async function upsertProfile(userId: string, nickname: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const clean = nickname.trim() || 'Anonymous';

    // Thử UPDATE trước (tránh dùng on_conflict gây lỗi PostgREST cache)
    const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update({ nickname: clean })
        .eq('id', userId)
        .select('*')
        .single();
    if (!updateErr && updated) return updated as Profile;

    // Nếu row chưa tồn tại → INSERT
    const { data: inserted } = await supabase
        .from('profiles')
        .insert({ id: userId, nickname: clean })
        .select('*')
        .single();
    return inserted as Profile | null;
}
