-- ============================================
-- Study Buddy System
-- Chạy trong Supabase SQL Editor
-- ============================================

-- Profiles (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL DEFAULT 'Anonymous',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily activity snapshot (upserted each session)
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    words_swiped INT NOT NULL DEFAULT 0,
    words_learned_today INT NOT NULL DEFAULT 0,
    daily_goal INT NOT NULL DEFAULT 10,
    goal_met BOOLEAN NOT NULL DEFAULT FALSE,
    streak INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Buddy pairs
CREATE TABLE IF NOT EXISTS public.buddy_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    duo_streak INT NOT NULL DEFAULT 0,
    last_duo_date DATE,
    target_words INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_a_id, user_b_id),
    CHECK(user_a_id != user_b_id)
);

-- Buddy invites (6-char code, expires 48h)
CREATE TABLE IF NOT EXISTS public.buddy_invites (
    code TEXT PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '48 hours',
    accepted BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_invites ENABLE ROW LEVEL SECURITY;

-- Profiles: own row + buddies can read yours
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Buddies can read each other's profiles
CREATE POLICY "Buddies can read each other profiles"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.buddy_pairs
            WHERE (user_a_id = auth.uid() AND user_b_id = id)
               OR (user_b_id = auth.uid() AND user_a_id = id)
        )
    );

-- Daily activity: own rows + buddies can read
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

-- Buddy pairs: members can read, anyone can insert (for acceptance)
CREATE POLICY "Buddy members can read pairs"
    ON public.buddy_pairs FOR SELECT
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Anyone authenticated can insert pair"
    ON public.buddy_pairs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update duo streak"
    ON public.buddy_pairs FOR UPDATE
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Buddy invites: owner manages, anyone authenticated can read to accept
CREATE POLICY "Owner manages invite"
    ON public.buddy_invites FOR ALL USING (from_user_id = auth.uid());

CREATE POLICY "Anyone authenticated can read invite"
    ON public.buddy_invites FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can accept invite"
    ON public.buddy_invites FOR UPDATE USING (auth.uid() IS NOT NULL);
