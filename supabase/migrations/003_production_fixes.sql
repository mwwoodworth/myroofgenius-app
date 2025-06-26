-- Add missing user_id column
ALTER TABLE roof_analyses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add performance indices
CREATE INDEX IF NOT EXISTS idx_roof_analyses_user_id ON roof_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_session ON copilot_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- Add RLS policies for roof_analyses
ALTER TABLE roof_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON roof_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON roof_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
