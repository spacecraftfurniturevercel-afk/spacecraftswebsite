-- SEC 01: Catalog tables — public READ only. No anon/authenticated writes.
-- Run this in the Spacecrafts Supabase SQL Editor (production project).
-- Service role (used by Next.js API/admin) bypasses RLS and can still write.

DO $$
DECLARE
  t text;
  pol record;
  catalog text[] := ARRAY[
    'products',
    'categories',
    'brands',
    'product_images',
    'product_categories',
    'product_variants',
    'product_offers',
    'product_specifications',
    'product_stores',
    'warranty_options',
    'emi_options',
    'brand_collections'
  ];
BEGIN
  FOREACH t IN ARRAY catalog LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'skip missing table %', t;
      CONTINUE;
    END IF;

    EXECUTE format(
      'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.%I FROM PUBLIC, anon, authenticated',
      t
    );
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', t);

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- Do not FORCE RLS: service_role must keep bypassing for admin/API writes.
    EXECUTE format('ALTER TABLE public.%I NO FORCE ROW LEVEL SECURITY', t);

    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t || '_public_read',
      t
    );

    RAISE NOTICE 'locked catalog table %', t;
  END LOOP;
END $$;

-- Confirm: write policies on catalog should be none; select-only for anon.
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'products','categories','brands','product_images','product_categories',
    'product_variants','product_offers','product_specifications','product_stores',
    'warranty_options','emi_options','brand_collections'
  )
ORDER BY tablename, cmd, policyname;
