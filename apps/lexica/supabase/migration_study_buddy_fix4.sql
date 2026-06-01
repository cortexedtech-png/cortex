-- ============================================
-- Fix 4: Idempotent — chạy bao nhiêu lần cũng OK
-- ============================================

-- First ensure the profiles table has the nickname column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname TEXT NOT NULL DEFAULT 'Anonymous';

-- profiles policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Buddies can read each other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_select"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND length(nickname) BETWEEN 1 AND 20);

-- Grants (lặp lại cho chắc)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_pairs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_invites TO authenticated;

-- Force PostgREST reload schema cache
NOTIFY pgrst, 'reload schema';
