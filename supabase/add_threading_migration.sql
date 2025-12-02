-- Migration: Add threading support to messages
-- Run this in your Supabase SQL Editor

-- Add parent_id column to messages table for threading
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.messages(id) ON DELETE CASCADE;

-- Create index for faster thread queries
CREATE INDEX IF NOT EXISTS messages_parent_id_idx ON public.messages(parent_id);

-- Add reply_count column for performance (optional but recommended)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_count integer DEFAULT 0;

-- Function to update reply count
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE public.messages 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE public.messages 
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update reply counts
DROP TRIGGER IF EXISTS update_message_reply_count ON public.messages;
CREATE TRIGGER update_message_reply_count
  AFTER INSERT OR DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_count();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
