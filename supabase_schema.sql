-- ══════════════════════════════════════════════════════════════
-- SECOND SOUL — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES (auto-created on user sign-up via trigger)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  email         TEXT,
  phone         TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_alerts          BOOLEAN DEFAULT TRUE,
  newsletter          BOOLEAN DEFAULT FALSE
);

-- Trigger: auto-insert profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email, phone, photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ──────────────────────────────────────────────────────────────
-- 2. ADDRESSES (for user address book)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label      TEXT DEFAULT 'Home',
  line1      TEXT NOT NULL,
  line2      TEXT,
  city       TEXT NOT NULL,
  state      TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- 3. PRODUCTS (managed by admin)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  size        TEXT,
  condition   SMALLINT CHECK (condition BETWEEN 1 AND 10),
  category    TEXT,
  fabric      TEXT,
  image_url   TEXT,
  is_new      BOOLEAN DEFAULT FALSE,
  available   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- 4. CART ITEMS (per user)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, product_id)   -- one row per user+product, update quantity instead
);


-- ──────────────────────────────────────────────────────────────
-- 5. WISHLIST ITEMS (per user)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, product_id)
);


-- ──────────────────────────────────────────────────────────────
-- 6. ORDERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id),
  customer_name    TEXT,
  phone            TEXT,
  email            TEXT,
  subtotal         NUMERIC(10, 2),
  shipping_cost    NUMERIC(10, 2) DEFAULT 0,
  total            NUMERIC(10, 2),
  status           TEXT DEFAULT 'Pending'
                   CHECK (status IN ('Pending','Processing','Shipped','Delivered','Cancelled')),
  payment_status   TEXT DEFAULT 'Pending'
                   CHECK (payment_status IN ('Pending','Paid','Failed')),
  payment_method   TEXT,
  shipping_address JSONB,         -- snapshot of address at time of order
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- 7. ORDER ITEMS (line items for each order)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT,              -- snapshot at time of order
  price       NUMERIC(10, 2),   -- snapshot at time of order
  size        TEXT,
  condition   SMALLINT,
  quantity    SMALLINT NOT NULL DEFAULT 1
);


-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ADDRESSES: users can CRUD their own addresses only
CREATE POLICY "Users manage own addresses"
  ON addresses FOR ALL USING (auth.uid() = user_id);

-- CART ITEMS: users can CRUD their own cart only
CREATE POLICY "Users manage own cart"
  ON cart_items FOR ALL USING (auth.uid() = user_id);

-- WISHLIST ITEMS: users can CRUD their own wishlist only
CREATE POLICY "Users manage own wishlist"
  ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- ORDERS: users can see their own orders; only service role can create/update
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS: readable if the parent order belongs to the user
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- PRODUCTS: anyone can read; only service role (admin) can write
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT USING (TRUE);


-- ══════════════════════════════════════════════════════════════
-- SEED: Insert current products from the frontend catalogue
-- (You can expand this with your actual products later)
-- ══════════════════════════════════════════════════════════════

INSERT INTO products (name, description, price, size, condition, category, is_new, available)
VALUES
  ('Vintage Levi''s 501', 'Classic straight-leg denim in vintage wash', 1299, 'M', 8, 'vintage', TRUE, TRUE),
  ('Champion Reverse Weave Hoodie', 'Heavyweight fleece hoodie, grey', 899, 'L', 9, 'streetwear', FALSE, TRUE),
  ('Floral Wrap Midi Dress', 'Silky floral wrap dress, perfect for summer', 1099, 'S', 9, 'women', TRUE, TRUE),
  ('Classic Bomber Jacket', 'Olive green bomber, lightly worn', 1699, 'M', 8, 'men', FALSE, TRUE),
  ('Leather Crossbody Bag', 'Tan leather crossbody, barely used', 1499, 'One Size', 9, 'accessories', FALSE, TRUE)
ON CONFLICT DO NOTHING;
