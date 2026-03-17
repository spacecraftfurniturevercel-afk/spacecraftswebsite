-- RLS policy scripts for Supabase
-- Run these in the Supabase SQL editor. Enable RLS per table before creating policies.

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select and update their own profile
CREATE POLICY "Profiles: select own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Addresses: users can manage their addresses
-- Addresses: split policies so INSERT uses WITH CHECK and other commands use USING
CREATE POLICY "Addresses: select own" ON addresses FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Addresses: insert own" ON addresses FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Addresses: update own" ON addresses FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Addresses: delete own" ON addresses FOR DELETE USING (auth.uid() = profile_id);

-- Cart items: users can manage their cart entries
-- Cart items: split policies per command to satisfy INSERT restrictions
CREATE POLICY "Cart: select own" ON cart_items FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Cart: insert own" ON cart_items FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Cart: update own" ON cart_items FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Cart: delete own" ON cart_items FOR DELETE USING (auth.uid() = profile_id);

-- Wishlist: allow users to manage their wishlist
-- Wishlist: split policies per command
CREATE POLICY "Wishlist: select own" ON wishlist_items FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Wishlist: insert own" ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Wishlist: update own" ON wishlist_items FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Wishlist: delete own" ON wishlist_items FOR DELETE USING (auth.uid() = profile_id);

-- Orders: allow users to insert orders (they must set profile_id to their auth.uid()) and select their own orders
CREATE POLICY "Orders: create own" ON orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Orders: select own" ON orders FOR SELECT USING (auth.uid() = profile_id);

-- Reviews: allow insert for authenticated users (they set profile_id)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to insert reviews where profile_id matches their auth.uid()
CREATE POLICY "Reviews: insert authenticated" ON reviews FOR INSERT WITH CHECK (auth.role() IS NOT NULL AND auth.uid() = profile_id);
-- Allow everyone to select reviews (adjust if you need privacy)
CREATE POLICY "Reviews: select public" ON reviews FOR SELECT USING (true);

-- Product images: allow server/service_role to manage; restrict client from inserting directly unless via server
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
-- Product images management restricted to service_role (server)
-- Allow public SELECT so images are readable by the site (use signed URLs if you need access control)
CREATE POLICY "Product images: select public" ON product_images FOR SELECT USING (true);
CREATE POLICY "Product images: insert server only" ON product_images FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Product images: update server only" ON product_images FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Product images: delete server only" ON product_images FOR DELETE USING (auth.role() = 'service_role');

-- Note: Replace or refine policies as per your app roles (admin, staff). Server-side admin operations should use the SUPABASE_SERVICE_ROLE_KEY and not be exposed to clients.
