import { getSupabaseClient } from './supabase';

export type GameType = 'speed' | 'type' | 'truefalse' | 'scramble' | 'combo';

export interface GameChallenge {
    id: string;
    game_type: GameType;
    score: number;
    nickname: string;
    created_at: string;
    response_score?: number | null;
    response_nickname?: string | null;
}

export const GAME_LABELS: Record<GameType, string> = {
    speed: 'Speed Quiz',
    type: 'Type Challenge',
    truefalse: 'True/False Blitz',
    scramble: 'Word Scramble',
    combo: 'Combo Chain',
};

export const SCORE_LABELS: Record<GameType, string> = {
    speed: 'điểm',
    type: 'điểm',
    truefalse: 'điểm',
    scramble: 'điểm',
    combo: 'combo tối đa',
};

/** Lấy nickname đã lưu, hoặc null nếu chưa đặt */
export function getSavedNickname(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lexica_nickname');
}

/** Lưu nickname vào localStorage */
export function saveNickname(nickname: string): void {
    localStorage.setItem('lexica_nickname', nickname.trim());
}

/** Tạo challenge mới trong Supabase, trả về ID */
export async function createChallenge(
    gameType: GameType,
    score: number,
    nickname: string,
): Promise<string | null> {
    const supabase = getSupabaseClient();
    if (!supabase) { console.error('Supabase not configured'); return null; }

    const { data, error } = await supabase
        .from('game_challenges')
        .insert({ game_type: gameType, score, nickname: nickname.trim() || 'Anonymous' })
        .select('id')
        .single();

    if (error || !data) {
        console.error('Failed to create challenge:', error);
        return null;
    }
    return data.id as string;
}

/** Lưu kết quả của người được thách đấu vào challenge */
export async function saveResponse(id: string, score: number, nickname: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase
        .from('game_challenges')
        .update({ response_score: score, response_nickname: nickname.trim() || 'Anonymous' })
        .eq('id', id);
    if (error) console.error('Failed to save response:', error);
    return !error;
}

/** Lấy thông tin challenge theo ID */
export async function fetchChallenge(id: string): Promise<GameChallenge | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('game_challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data as GameChallenge;
}
