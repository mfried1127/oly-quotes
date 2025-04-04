-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  part_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  list_price DECIMAL(10, 2) NOT NULL
);

-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(5, 4) NOT NULL -- Stored as decimal (e.g., 0.1 for 10%)
);

-- Insert sample products
INSERT INTO products (part_number, description, list_price)
VALUES 
  ('ABC123', 'Widget A', 45.00),
  ('DEF456', 'Widget B', 30.00),
  ('GHI789', 'Gadget C', 75.50),
  ('JKL012', 'Tool D', 120.00),
  ('MNO345', 'Component E', 15.75)
ON CONFLICT (part_number) DO NOTHING;

-- Insert sample discounts
INSERT INTO discounts (name, value)
VALUES 
  ('No Discount', 0),
  ('Standard (10%)', 0.1),
  ('Preferred (20%)', 0.2),
  ('Premium (30%)', 0.3)
ON CONFLICT DO NOTHING;
