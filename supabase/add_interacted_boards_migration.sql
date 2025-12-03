-- Migration: Add function to get boards a user has interacted with
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_interacted_boards(user_uuid uuid)
RETURNS SETOF boards
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.*
  FROM boards b
  LEFT JOIN messages m ON b.id = m.board_id
  LEFT JOIN reactions r ON m.id = r.message_id
  WHERE b.creator_id = user_uuid
     OR m.author_id = user_uuid
     OR r.user_id = user_uuid
  ORDER BY b.created_at DESC;
END;
$$;
