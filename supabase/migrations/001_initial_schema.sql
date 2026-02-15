-- QBoard Social - Initial Schema
-- Extends Supabase auth.users

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Case-insensitive username uniqueness
CREATE UNIQUE INDEX profiles_username_lower_idx ON profiles (LOWER(username));

-- Communities (before questions - FK dependency)
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  rules TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  visibility TEXT NOT NULL DEFAULT 'open' CHECK (visibility IN ('open', 'private', 'invite_only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Questions (global and community)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'community')),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique: one global question per date
CREATE UNIQUE INDEX questions_global_unique_idx ON questions (effective_date)
  WHERE scope = 'global' AND community_id IS NULL;

-- Partial unique: one community question per community per date
CREATE UNIQUE INDEX questions_community_unique_idx ON questions (community_id, effective_date)
  WHERE community_id IS NOT NULL;

CREATE INDEX questions_effective_date_idx ON questions (effective_date);
CREATE INDEX questions_community_id_idx ON questions (community_id);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(question_id, user_id)
);

CREATE INDEX answers_question_user_idx ON answers (question_id, user_id);
CREATE INDEX answers_question_created_idx ON answers (question_id, created_at DESC);
CREATE INDEX answers_user_id_idx ON answers (user_id);

-- Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX memberships_user_community_idx ON memberships (user_id, community_id);

-- Reactions (likes)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'like' CHECK (type IN ('like')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

CREATE INDEX reactions_answer_id_idx ON reactions (answer_id);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('answer', 'user', 'community')),
  target_id UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reports_status_idx ON reports (status);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON notifications (user_id);

-- Hidden answers (user-specific)
CREATE TABLE hidden_answers (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, answer_id)
);

-- Invite codes
CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  max_uses INT,
  use_count INT DEFAULT 0
);

-- Join requests (for private communities)
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Community bans
CREATE TABLE community_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);
