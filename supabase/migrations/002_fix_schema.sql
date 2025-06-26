-- Add user_id to roof_analyses
ALTER TABLE roof_analyses
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_roof_analyses_user_id ON roof_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_session ON copilot_messages(session_id);

-- Enable RLS and policy for roof analyses
ALTER TABLE roof_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Analyses are viewable by owner"
ON roof_analyses FOR SELECT
USING (auth.uid() = user_id);
