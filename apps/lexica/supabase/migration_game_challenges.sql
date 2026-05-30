-- ============================================
-- Lexica Game Challenges
-- Chạy trong Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.game_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_type TEXT NOT NULL CHECK (game_type IN ('speed', 'type', 'truefalse', 'scramble', 'combo')),
    score INTEGER NOT NULL CHECK (score >= 0),
    nickname TEXT NOT NULL DEFAULT 'Anonymous',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read/insert (no auth needed for anonymous challenges)
ALTER TABLE public.game_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read challenges"
    ON public.game_challenges FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create challenges"
    ON public.game_challenges FOR INSERT
    WITH CHECK (true);

-- Auto-delete challenges older than 7 days (keep DB clean)
-- Run as a Supabase scheduled function or pg_cron if needed
-- DELETE FROM public.game_challenges WHERE created_at < NOW() - INTERVAL '7 days';
