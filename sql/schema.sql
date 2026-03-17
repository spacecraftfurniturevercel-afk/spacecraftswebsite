-- SQL schema for Spacecrafts Furniture (Postgres / Supabase)
-- Run in Supabase SQL editor

-- Users and profiles
create table if not exists profiles (
  id uuid primary key default auth.uid(),
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text unique not null
);

create index if not exists idx_categories_slug on categories(slug);

-- Brands
create table if not exists brands (
  id serial primary key,
  name text not null,
  slug text unique not null
);

-- Products
create table if not exists products (
  id serial primary key,
  name text not null,
  slug text not null,
  category_id int references categories(id) on delete set null,
  brand_id int references brands(id) on delete set null,
  description text,
  price numeric(10,2) not null,
  discount_price numeric(10,2),
  stock int default 0,
  rating numeric(2,1) default 0,
  review_count int default 0,
  dimensions jsonb,
  material text,
  warranty text,
  delivery_info text,
  tags text[],
  created_at timestamptz default now()
);

create unique index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand on products(brand_id);

-- Product images
create table if not exists product_images (
  id serial primary key,
  product_id int references products(id) on delete cascade,
  url text not null,
  alt text,
  position int default 0
);

-- Reviews
create table if not exists reviews (
  id serial primary key,
  product_id int references products(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  created_at timestamptz default now()
);

-- Addresses
create table if not exists addresses (
  id serial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  label text,
  line1 text,
  line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  phone text,
  is_default boolean default false
);

-- Cart items
create table if not exists cart_items (
  id serial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  product_id int references products(id) on delete set null,
  quantity int default 1,
  created_at timestamptz default now(),
  unique (profile_id, product_id)
);

-- Wishlist
create table if not exists wishlist_items (
  id serial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  product_id int references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (profile_id, product_id)
);

-- Orders & order items
create table if not exists orders (
  id serial primary key,
  profile_id uuid references profiles(id) on delete set null,
  address_id int references addresses(id) on delete set null,
  total numeric(10,2) not null,
  currency text default 'INR',
  stripe_session_id text,
  status text default 'placed',
  tracking_number text,
  created_at timestamptz default now()
);

create index if not exists idx_orders_profile on orders(profile_id);

create table if not exists order_items (
  id serial primary key,
  order_id int references orders(id) on delete cascade,
  product_id int references products(id) on delete set null,
  name text,
  unit_price numeric(10,2),
  quantity int default 1
);

-- Stores
create table if not exists stores (
  id serial primary key,
  name text,
  slug text unique,
  address text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  phone text
);

-- Indexes for search/SEO
create index if not exists idx_products_name on products using gin (to_tsvector('english', name || ' ' || coalesce(description,'')));

-- Seed minimal data
insert into categories (name, slug) values
('Sofas','sofas'),
('Chairs','chairs'),
('Tables','tables'),
('Beds','beds'),
('Dining Sets','dining-sets'),
('Outdoor Furniture','outdoor-furniture'),
('Racks & Storage','racks-storage'),
('Mattresses','mattresses'),
('Home Decor','home-decor'),
('Top Brands','top-brands')
on conflict (slug) do nothing;

insert into brands (name, slug) values
('Orion Furnishings','orion-furnishings'),
('Stellar Home','stellar-home'),
('Nova Interiors','nova-interiors')
on conflict (slug) do nothing;

-- Example products (minimal)
insert into products (name, slug, category_id, brand_id, description, price, discount_price, stock, rating, review_count, dimensions, material, warranty, delivery_info, tags)
values
('Modern 3-Seater Sofa','modern-3-seater-sofa', (select id from categories where slug='sofas'), (select id from brands where slug='orion-furnishings'), 'A comfortable modern 3-seater sofa with premium fabric and wooden legs. Ideal for living rooms. SEO content: modern sofa, 3 seater, fabric sofa, comfortable.', 49999.00, 39999.00, 12, 4.5, 120, '{"width":200,"depth":90,"height":85}', 'Fabric & Wood', '2 years', 'Free delivery in 7-10 days', array['sofa','3-seater','living-room'])
on conflict (slug) do nothing;

insert into product_images (product_id, url, alt, position)
values ((select id from products where slug='modern-3-seater-sofa'), 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80', 'Modern 3-seater sofa - front', 0)
on conflict do nothing;

insert into stores (name, slug, address, city, state, postal_code, latitude, longitude, phone)
values ('Spacecrafts Flagship Store','spacecrafts-flagship','123 Orbit Rd','Bengaluru','Karnataka','560001',12.9716,77.5946,'+91-80-12345678')
on conflict (slug) do nothing;

-- RLS policies (examples) - enable RLS per table in Supabase UI and then add policies like below
-- Example for profiles table (allow owners)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Profiles are private" ON profiles FOR SELECT USING (auth.uid() = id);

-- RLS policy examples for Supabase (run these after enabling RLS for each table)
-- Enable RLS on tables
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to insert/select/update their own profile row
-- CREATE POLICY "Profiles: select own" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses: allow owners to manage their addresses
-- CREATE POLICY "Addresses: manage own" ON addresses FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Cart items: allow users to manage their own cart items
-- CREATE POLICY "Cart: manage own" ON cart_items FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Wishlist: allow users to manage their wishlist
-- CREATE POLICY "Wishlist: manage own" ON wishlist_items FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- Orders: allow users to create orders and view their own orders
-- CREATE POLICY "Orders: create" ON orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
-- CREATE POLICY "Orders: select own" ON orders FOR SELECT USING (auth.uid() = profile_id);

-- For admin actions (product create/update), create a Postgres role or use service_role key from server.
-- Do NOT expose service_role key on client.

