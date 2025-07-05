-- License keys for premium products
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_license boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS license_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  license_key text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  expires_at timestamp with time zone,
  revoked boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_license_user ON license_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_license_key ON license_keys(license_key);
