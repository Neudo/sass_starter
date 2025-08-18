-- Add Google Analytics integration tables

-- Store Google OAuth tokens per user
CREATE TABLE IF NOT EXISTS google_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Store import jobs and their status
CREATE TABLE IF NOT EXISTS ga_import_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ga_property_id TEXT NOT NULL,
  ga_property_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_sessions INTEGER DEFAULT 0,
  imported_sessions INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add RLS policies
ALTER TABLE google_auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga_import_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can view own Google tokens" ON google_auth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Google tokens" ON google_auth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Google tokens" ON google_auth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Google tokens" ON google_auth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own import jobs
CREATE POLICY "Users can view own import jobs" ON ga_import_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own import jobs" ON ga_import_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import jobs" ON ga_import_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_google_auth_tokens_user_id ON google_auth_tokens(user_id);
CREATE INDEX idx_ga_import_jobs_site_id ON ga_import_jobs(site_id);
CREATE INDEX idx_ga_import_jobs_user_id ON ga_import_jobs(user_id);
CREATE INDEX idx_ga_import_jobs_status ON ga_import_jobs(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_google_auth_tokens_updated_at 
  BEFORE UPDATE ON google_auth_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ga_import_jobs_updated_at 
  BEFORE UPDATE ON ga_import_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();