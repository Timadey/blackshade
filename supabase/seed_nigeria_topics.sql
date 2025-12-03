-- Seed Data for Nigeria Topics
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
  user_id uuid;
  board_politics uuid;
  board_japa uuid;
  board_music uuid;
  board_lagos uuid;
BEGIN
  -- 1. Create a dummy user for seeding (or use an existing one if you know the ID)
  -- For this script, we'll try to pick the first user found, or create a placeholder if none exists.
  -- Ideally, you should replace this with your own user ID to "own" these posts.
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please sign up at least one user first.';
    RETURN;
  END IF;

  -- 2. Create Boards
  INSERT INTO boards (title, description, creator_id, slug, settings)
  VALUES 
    ('Nigeria Politics 🇳🇬', 'Unfiltered discussions on the state of the nation. No holds barred.', user_id, 'nigeria-politics', '{"privacy": "public"}')
  RETURNING id INTO board_politics;

  INSERT INTO boards (title, description, creator_id, slug, settings)
  VALUES 
    ('Japa Plans ✈️', 'Tips, frustrations, and success stories about leaving the country.', user_id, 'japa-plans', '{"privacy": "public"}')
  RETURNING id INTO board_japa;

  INSERT INTO boards (title, description, creator_id, slug, settings)
  VALUES 
    ('Afrobeats vs The World 🎵', 'Davido, Wizkid, Burna... who is the real 001?', user_id, 'afrobeats-wars', '{"privacy": "public"}')
  RETURNING id INTO board_music;

  INSERT INTO boards (title, description, creator_id, slug, settings)
  VALUES 
    ('Lagos Living 🌉', 'Traffic, rent, and the madness of Eko.', user_id, 'lagos-living', '{"privacy": "public"}')
  RETURNING id INTO board_lagos;

  -- 3. Insert Messages (Politics)
  INSERT INTO messages (content, board_id, user_id, created_at) VALUES 
    ('The exchange rate is actually insane right now. How are businesses surviving? 📉', board_politics, user_id, NOW() - INTERVAL '2 hours'),
    ('We need to talk about the cost of fuel. It is affecting everything from food to transport.', board_politics, user_id, NOW() - INTERVAL '5 hours'),
    ('Is there any hope for the next election cycle? Or are we just recycling the same old leaders?', board_politics, user_id, NOW() - INTERVAL '1 day');

  -- 4. Insert Messages (Japa)
  INSERT INTO messages (content, board_id, user_id, created_at) VALUES 
    ('Finally got my visa approved! 🇬🇧 The wait was worth it. Don''t give up guys.', board_japa, user_id, NOW() - INTERVAL '30 minutes'),
    ('Canada or UK? Which one is better for tech bros right now? The job market seems tough everywhere.', board_japa, user_id, NOW() - INTERVAL '4 hours'),
    ('The amount of money needed for Proof of Funds now is scary. Who has 30M lying around?', board_japa, user_id, NOW() - INTERVAL '2 days');

  -- 5. Insert Messages (Music)
  INSERT INTO messages (content, board_id, user_id, created_at) VALUES 
    ('Burna Boy''s stage presence is unmatched. Argue with your keypad. 🦍', board_music, user_id, NOW() - INTERVAL '1 hour'),
    ('Unpopular opinion: Wizkid''s old songs > New album. Don''t drag me.', board_music, user_id, NOW() - INTERVAL '6 hours'),
    ('Amapiano has taken over completely. Is Afrobeats losing its identity?', board_music, user_id, NOW() - INTERVAL '3 days');

  -- 6. Insert Messages (Lagos)
  INSERT INTO messages (content, board_id, user_id, created_at) VALUES 
    ('Third Mainland Bridge traffic will humble you. Left home at 5am, got to work at 9am. 😭', board_lagos, user_id, NOW() - INTERVAL '15 minutes'),
    ('Landlords in Lekki asking for 2 years rent upfront + legal + agency + caution + breathing fee. Tired.', board_lagos, user_id, NOW() - INTERVAL '3 hours'),
    ('Danfo drivers are a different breed entirely. One just scratched my car and told me to "dey look front".', board_lagos, user_id, NOW() - INTERVAL '1 day');

END $$;
