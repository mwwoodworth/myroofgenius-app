CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS announcements_active_idx
  ON announcements (start_time, end_time);
