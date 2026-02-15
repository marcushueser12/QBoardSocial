-- QBoard Social - Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_bans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all non-deleted profiles, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Communities: Read if not deleted
CREATE POLICY "Communities are viewable" ON communities
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update community" ON communities
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM memberships m WHERE m.community_id = communities.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  );

-- Questions: Read all
CREATE POLICY "Questions are viewable" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admins and community admins can insert questions" ON questions
  FOR INSERT WITH CHECK (
    (scope = 'global' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    OR
    (scope = 'community' AND community_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM memberships m WHERE m.community_id = questions.community_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    ))
  );

-- Answers: Gating - can only read others' answers if you have answered the same question
-- Users can always read their own answers
CREATE POLICY "Users can read own answers" ON answers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read others' answers only if they have answered the same question (gating)
CREATE POLICY "Users can read others answers if they answered" ON answers
  FOR SELECT USING (
    auth.uid() != user_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM answers my_answer
      WHERE my_answer.question_id = answers.question_id
      AND my_answer.user_id = auth.uid()
      AND my_answer.deleted_at IS NULL
    )
  );

-- Admins bypass gating
CREATE POLICY "Admins can read all answers" ON answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can insert own answers" ON answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete own answers
CREATE POLICY "Users can update own answers" ON answers
  FOR UPDATE USING (auth.uid() = user_id);

-- Memberships
CREATE POLICY "Memberships are viewable" ON memberships
  FOR SELECT USING (true);

CREATE POLICY "Community owners can manage memberships" ON memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM communities c WHERE c.id = memberships.community_id AND c.owner_id = auth.uid())
  );

CREATE POLICY "Users can join open communities" ON memberships
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM communities c WHERE c.id = community_id AND c.visibility = 'open' AND c.deleted_at IS NULL)
  );

-- Reactions
CREATE POLICY "Reactions are viewable" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add own reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and update reports" ON reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Hidden answers
CREATE POLICY "Users can manage own hidden answers" ON hidden_answers
  FOR ALL USING (auth.uid() = user_id);

-- Invite codes: readable for validation
CREATE POLICY "Invite codes are viewable for join" ON invite_codes
  FOR SELECT USING (true);

CREATE POLICY "Community admins can manage invite codes" ON invite_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.community_id = invite_codes.community_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  );

-- Join requests
CREATE POLICY "Users can create join requests" ON join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own join requests" ON join_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Community admins can manage join requests" ON join_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.community_id = join_requests.community_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  );

-- Community bans
CREATE POLICY "Community admins can manage bans" ON community_bans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.community_id = community_bans.community_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  );
