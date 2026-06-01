-- ============================================
-- Fix: Grant permissions + missing DELETE policy
-- Chạy trong Supabase SQL Editor sau migration_study_buddy.sql
-- ============================================

-- 1. Grant table-level access cho role authenticated
--    (Tables tạo qua SQL Editor không tự cấp quyền này)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activity   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_pairs      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_invites    TO authenticated;

-- 2. Thêm DELETE policy cho buddy_pairs (bị thiếu trong migration đầu)
DROP POLICY IF EXISTS "Members can delete own pair" ON public.buddy_pairs;
CREATE POLICY "Members can delete own pair"
    ON public.buddy_pairs FOR DELETE
    USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- 3. Bỏ policy SELECT trùng lặp trên profiles
--    ("Buddies can read each other profiles" đã bao gồm trường hợp đọc profile bản thân)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
