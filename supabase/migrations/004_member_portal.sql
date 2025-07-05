-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE (user_id, product_id)
);

-- Simple support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);
