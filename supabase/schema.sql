-- ============================================
-- TalentFlow — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles (Master Directory)
CREATE TABLE profiles (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT '',
  location TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  internal_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project ↔ Candidate junction
CREATE TABLE project_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  status TEXT DEFAULT 'pending',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email)
);

-- 4. Candidate comments (historical tracking)
CREATE TABLE candidate_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  author TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Team Views (controlled sharing)
CREATE TABLE team_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  visible_fields TEXT[] DEFAULT ARRAY['name', 'role', 'image_url'],
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_project_candidates_project ON project_candidates(project_id);
CREATE INDEX idx_project_candidates_email ON project_candidates(email);
CREATE INDEX idx_candidate_comments_project ON candidate_comments(project_id);
CREATE INDEX idx_candidate_comments_email ON candidate_comments(email);
CREATE INDEX idx_team_views_token ON team_views(share_token);
CREATE INDEX idx_team_views_project ON team_views(project_id);

-- Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage: Create a bucket called 'attachments'
-- Go to Supabase Dashboard → Storage → New Bucket
-- Name: attachments
-- Public: true
-- ============================================

-- RLS Policies (permissive for no-auth app)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_views ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_candidates" ON project_candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on candidate_comments" ON candidate_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on team_views" ON team_views FOR ALL USING (true) WITH CHECK (true);
