-- Migration: Add function to get board statistics
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_board_stats(board_uuid uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  message_count integer;
  reaction_count integer;
BEGIN
  -- Count messages in the board
  SELECT count(*) INTO message_count
  FROM messages
  WHERE board_id = board_uuid;

  -- Count reactions for messages in the board
  SELECT count(*) INTO reaction_count
  FROM reactions r
  JOIN messages m ON r.message_id = m.id
  WHERE m.board_id = board_uuid;

  RETURN json_build_object(
    'message_count', message_count,
    'reaction_count', reaction_count
  );
END;
$$;
