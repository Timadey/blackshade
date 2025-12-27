-- Migration: Fix Board Update Constraints and RLS Policies
-- Description: Removes the strict 6-character slug constraint and adds an update policy for boards.

-- 1. Remove the strict 6-char constraint
ALTER TABLE public.boards 
DROP CONSTRAINT IF EXISTS slug_length;

-- 2. Add a more flexible constraint (3-50 characters)
ALTER TABLE public.boards
ADD CONSTRAINT slug_length_flexible CHECK (char_length(slug) >= 3 AND char_length(slug) <= 50);

-- 3. Add UPDATE policy for board owners
-- (Check if policy already exists to be safe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'boards' AND policyname = 'Users can update own boards.'
    ) THEN
        CREATE POLICY "Users can update own boards."
        ON public.boards FOR UPDATE
        USING (auth.uid() = creator_id)
        WITH CHECK (auth.uid() = creator_id);
    END IF;
END $$;
