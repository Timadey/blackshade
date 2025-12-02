-- Migration: Create webhook for push notifications using pg_net
-- Run this in your Supabase SQL Editor

-- Enable the pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the function to call the edge function
CREATE OR REPLACE FUNCTION public.handle_new_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for replies
  IF NEW.parent_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reply-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_new_reply ON public.messages;
CREATE TRIGGER on_new_reply
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_reply();
