-- Migration: Add reactions table for message reactions
-- Run this in your Supabase SQL Editor

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one reaction per user per message per emoji
  CONSTRAINT unique_user_message_emoji UNIQUE (message_id, user_id, emoji)
);

-- Enable RLS on reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "Reactions are viewable by everyone."
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions."
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions."
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS reactions_message_id_idx ON public.reactions(message_id);
CREATE INDEX IF NOT EXISTS reactions_user_id_idx ON public.reactions(user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
