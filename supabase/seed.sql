-- Seed: Create today's global question and optionally set first user as admin
-- Run after migrations. To make a user admin, update their email in the last statement.

-- Insert today's global question if none exists
INSERT INTO questions (scope, community_id, effective_date, text, created_by)
SELECT 'global', NULL, CURRENT_DATE, 'What made you smile today?', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM questions
  WHERE scope = 'global' AND effective_date = CURRENT_DATE
);

-- To make a user admin, run (replace with actual user id):
-- UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';
