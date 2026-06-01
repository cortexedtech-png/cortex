-- ============================================
-- Fix 2: Tạo lại các bảng bị thiếu
-- (migration_study_buddy.sql dùng uuid_generate_v4() không có sẵn
--  trong Supabase project mới → daily_activity, buddy_pairs,
--  buddy_invites chưa được tạo → RLS policy trên profiles crash)
--
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================

-- Tạo daily_activity (dùng gen_random_uuid() thay uuid_generate_v4)
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    words_swiped INT NOT NULL DEFAULT 0,
    words_learned_today INT NOT NULL DEFAULT 0,
    daily_goal INT NOT NULL DEFAULT 10,
    goal_met BOOLEAN NOT NULL DEFAULT FALSE,
    streak INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Tạo buddy_pairs
CREATE TABLE IF NOT EXISTS public.buddy_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    duo_streak INT NOT NULL DEFAULT 0,
    last_duo_date DATE,
    target_words INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_a_id, user_b_id),
    CHECK(user_a_id != user_b_id)
);

-- Tạo buddy_invites
CREATE TABLE IF NOT EXISTS public.buddy_invites (
    code TEXT PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '48 hours',
    accepted BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_pairs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_invites  ENABLE ROW LEVEL SECURITY;

-- daily_activity
DROP POLICY IF EXISTS "Users manage own activity"           ON public.daily_activity;
DROP POLICY IF EXISTS "Buddies can read each other activity" ON public.daily_activity;

CREATE POLICY "Users manage own activity"
    ON public.daily_activity FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Buddies can read each other activity"
    ON public.daily_activity FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.buddy_pairs
            WHERE (user_a_id = auth.uid() AND user_b_id = user_id)
               OR (user_b_id = auth.uid() AND user_a_id = user_id)
        )
    );

-- buddy_pairs
DROP POLICY IF EXISTS "Buddy members can read pairs"       ON public.buddy_pairs;
DROP POLICY IF EXISTS "Anyone authenticated can insert pair" ON public.buddy_pairs;
DROP POLICY IF EXISTS "Members can update duo streak"      ON public.buddy_pairs;
DROP POLICY IF EXISTS "Members can delete own pair"        ON public.buddy_pairs;

CREATE POLICY "Buddy members can read pairs"
    ON public.buddy_pairs FOR SELECT
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Anyone authenticated can insert pair"
    ON public.buddy_pairs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update duo streak"
    ON public.buddy_pairs FOR UPDATE
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Members can delete own pair"
    ON public.buddy_pairs FOR DELETE
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- buddy_invites
DROP POLICY IF EXISTS "Owner manages invite"                ON public.buddy_invites;
DROP POLICY IF EXISTS "Anyone authenticated can read invite" ON public.buddy_invites;
DROP POLICY IF EXISTS "Anyone authenticated can accept invite" ON public.buddy_invites;

CREATE POLICY "Owner manages invite"
    ON public.buddy_invites FOR ALL USING (from_user_id = auth.uid());

CREATE POLICY "Anyone authenticated can read invite"
    ON public.buddy_invites FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can accept invite"
    ON public.buddy_invites FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── Grants ───────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_pairs    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_invites  TO authenticated;
