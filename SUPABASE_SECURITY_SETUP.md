# Supabase Security Setup Guide

This document outlines the security policies and setup required for the Second Soul application to work properly with Supabase.

## 1. Profiles Table Updates

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Add constraint to ensure role is one of the allowed values
ALTER TABLE profiles ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'customer'));

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email, phone, photo_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'  -- Default role is customer
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 2. Additional Security Policies

Run the following SQL commands to add admin access policies:

```sql
-- Additional policies for admin access

-- PRODUCTS: admins can read and write
CREATE POLICY "Admins can manage products"
  ON products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
ALTER POLICY "Products are publicly readable"
  ON products FOR SELECT USING (TRUE);

-- ORDERS: admins can read and update all orders
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
ALTER POLICY "Users can view own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

-- ORDER ITEMS: admins can read all order items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
ALTER POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
```

## 3. Existing Security Policies

The following policies are already included in your `supabase_schema.sql` file:

```sql
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
```

## 4. Setting Up an Admin User

To make a user an admin, you need to manually update their role in the database:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';  -- Replace with the admin user's email
```

## 5. Testing Security

After applying these policies, test the following:

1. Regular users can:
   - View their own profile
   - Manage their own addresses
   - Manage their own cart items
   - Manage their own wishlist items
   - View their own orders and order items
   - View all products (read-only)

2. Admin users can:
   - Do everything regular users can
   - Manage all products (create, update, delete)
   - Manage all orders (view, update status)
   - View all order items

3. Unauthenticated users can:
   - View all products (read-only)
   - Not access any user-specific data
```