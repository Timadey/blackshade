-- Migration: Add slug column to boards table
-- Run this in your Supabase SQL Editor

-- Add slug column (nullable first to allow existing rows)
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing boards (if any)
-- This creates a simple 6-char slug from the first 6 chars of the UUID
UPDATE public.boards 
SET slug = LOWER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 6))
WHERE slug IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE public.boards ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.boards ADD CONSTRAINT boards_slug_unique UNIQUE (slug);
ALTER TABLE public.boards ADD CONSTRAINT slug_length CHECK (char_length(slug) = 6);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
