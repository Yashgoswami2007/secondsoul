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