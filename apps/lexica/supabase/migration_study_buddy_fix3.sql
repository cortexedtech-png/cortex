-- ============================================
-- Fix 3: Đơn giản hoá RLS policies trên profiles
-- (cross-table reference tới buddy_pairs gây PostgREST cache lỗi)
--
-- Chạy file này trong Supabase SQL Editor
-- ============================================

-- Bỏ hết SELECT policies cũ trên profiles
DROP POLICY IF EXISTS "Users can read own profile"           ON public.profiles;
DROP POLICY IF EXISTS "Buddies can read each other profiles" ON public.profiles;

-- Policy mới: mọi user đã xác thực đều đọc được nickname của nhau
-- (nickname không phải dữ liệu nhạy cảm)
CREATE POLICY "Authenticated users can read profiles"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Đảm bảo grants vẫn còn
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_pairs    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_invites  TO authenticated;
