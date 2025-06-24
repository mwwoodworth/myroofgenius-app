-- Products table with enhanced fields
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  price_id text NOT NULL, -- Stripe price ID
  category text,
  features text, -- Comma-separated features
  image_url text,
  file_url text, -- Digital product download URL
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES products(id),
  stripe_session_id text UNIQUE,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Mike Woodworth',
  category text,
  image_url text,
  published boolean DEFAULT false,
  published_at timestamp with time zone,
  read_time text DEFAULT '5 min read',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Orders are viewable by owner" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Published blog posts are viewable by everyone" 
  ON blog_posts FOR SELECT 
  USING (published = true);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);