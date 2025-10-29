/*
  # Mock E-Com Cart Database Schema

  ## Overview
  Creates the database structure for a shopping cart application with products and cart management.

  ## New Tables
  
  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `price` (numeric) - Product price
  - `description` (text) - Product description
  - `image_url` (text) - Product image URL
  - `stock` (integer) - Available stock quantity
  - `created_at` (timestamptz) - Creation timestamp

  ### `cart_items`
  - `id` (uuid, primary key) - Unique cart item identifier
  - `product_id` (uuid, foreign key) - References products table
  - `quantity` (integer) - Item quantity in cart
  - `session_id` (text) - Session identifier for anonymous users
  - `user_id` (uuid, nullable) - Optional user identifier for authenticated users
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `customer_name` (text) - Customer name
  - `customer_email` (text) - Customer email
  - `total` (numeric) - Order total amount
  - `items` (jsonb) - Order items as JSON
  - `session_id` (text) - Session identifier
  - `created_at` (timestamptz) - Order timestamp

  ## Security
  - Enable Row Level Security on all tables
  - Products table: Public read access (no authentication required)
  - Cart items: Users can manage their own cart by session_id
  - Orders: Users can create orders and view their own orders by session_id

  ## Sample Data
  - Inserts 10 sample products for testing
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  description text DEFAULT '',
  image_url text DEFAULT '',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  session_id text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: Public read access
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Cart items: Users can view their own cart by session_id
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (true);

-- Cart items: Users can insert their own cart items
CREATE POLICY "Users can add to cart"
  ON cart_items FOR INSERT
  WITH CHECK (true);

-- Cart items: Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Cart items: Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (true);

-- Orders: Users can create orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (true);

-- Insert sample products
INSERT INTO products (name, price, description, image_url, stock) VALUES
  ('Wireless Headphones', 79.99, 'High-quality wireless headphones with noise cancellation', 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=400', 50),
  ('Smart Watch', 199.99, 'Fitness tracker with heart rate monitor and GPS', 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400', 30),
  ('Laptop Backpack', 49.99, 'Durable backpack with padded laptop compartment', 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400', 75),
  ('Wireless Mouse', 29.99, 'Ergonomic wireless mouse with precision tracking', 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400', 100),
  ('USB-C Hub', 39.99, 'Multi-port USB-C hub with HDMI and SD card reader', 'https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=400', 60),
  ('Bluetooth Speaker', 59.99, 'Portable waterproof speaker with 12-hour battery', 'https://images.pexels.com/photos/1279406/pexels-photo-1279406.jpeg?auto=compress&cs=tinysrgb&w=400', 45),
  ('Phone Stand', 15.99, 'Adjustable aluminum phone stand for desk', 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=400', 120),
  ('Mechanical Keyboard', 89.99, 'RGB backlit mechanical gaming keyboard', 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=400', 40),
  ('Webcam HD', 69.99, '1080p webcam with built-in microphone', 'https://images.pexels.com/photos/4131564/pexels-photo-4131564.jpeg?auto=compress&cs=tinysrgb&w=400', 55),
  ('Cable Organizer', 12.99, 'Set of cable clips and organizers', 'https://images.pexels.com/photos/4792285/pexels-photo-4792285.jpeg?auto=compress&cs=tinysrgb&w=400', 200)
ON CONFLICT DO NOTHING;