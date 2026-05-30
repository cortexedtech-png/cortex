-- ============================================
-- Thêm cột response cho game_challenges
-- Chạy trong Supabase SQL Editor sau migration đầu tiên
-- ============================================

ALTER TABLE public.game_challenges
    ADD COLUMN IF NOT EXISTS response_score INTEGER,
    ADD COLUMN IF NOT EXISTS response_nickname TEXT;

-- Cho phép update để lưu kết quả của người được thách đấu
CREATE POLICY "Anyone can update response"
    ON public.game_challenges FOR UPDATE
    USING (true)
    WITH CHECK (true);
