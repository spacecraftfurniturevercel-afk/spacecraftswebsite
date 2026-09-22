-- Activate ONLY the SKUs in the allowlist; deactivate everything else.
-- Run in Supabase SQL Editor. Review the PREVIEW queries first.

BEGIN;

-- 1) Preview: SKUs in allowlist that are NOT in the database
WITH allowlist(sku) AS (
  SELECT unnest(ARRAY[
    'jf-1400', 'jf-1020', 'jf-7040', 'jf-1155', 'jf-7090', 'jf-5900', 'jf-5909',
    'jf-9030', 'jf-9050', 'jf-9070', 'jf-9090', 'jf-7070', 'fw-4343', 'fw-5555',
    'fw-2255', 'jf-7020', 'jf-7190', 'fw-4545', 'jf-5250', 'jf-5240', 'jf-5270-3f',
    'jf-5270-4f', 'jf-5210-5f', 'jf-9020', 'jf-9040', 'jf-7180', 'jf-7080',
    'jf-5210-4f', 'jf-1010', 'jf-1155d', 'jf-1500', 'jf-1500wo', 'jf-5151',
    'jf-5010', 'jf-5020+5090', 'jf-1130', 'jf-1100', 'fw-2207', 'jf-7190c',
    'fw-4656', 'fw-5540', 'jf-5555', 'jf-5595', 'jf-5180', 'jf-5252', 'jf-9000',
    'jf-9060', 'jf-9005', 'jf-7050', 'jf-7200', 'fw-1155', 'fw-235', 'jf-1400wo',
    'jf-7700', 'jf-5900-k', 'jf-5909-k', 'jf-5151-k'
  ]::text[]) AS sku
)
SELECT a.sku AS missing_in_db
FROM allowlist a
LEFT JOIN products p ON lower(trim(p.sku)) = a.sku
WHERE p.id IS NULL
ORDER BY a.sku;

-- 2) Preview: products that will become INACTIVE (run separately if you prefer)
-- WITH allowlist(sku) AS ( ... same array ... )
-- SELECT p.id, p.sku, p.name, p.is_active
-- FROM products p
-- WHERE lower(trim(coalesce(p.sku, ''))) NOT IN (SELECT sku FROM allowlist)
-- ORDER BY p.name;

-- 3) Apply
WITH allowlist(sku) AS (
  SELECT unnest(ARRAY[
    'jf-1400', 'jf-1020', 'jf-7040', 'jf-1155', 'jf-7090', 'jf-5900', 'jf-5909',
    'jf-9030', 'jf-9050', 'jf-9070', 'jf-9090', 'jf-7070', 'fw-4343', 'fw-5555',
    'fw-2255', 'jf-7020', 'jf-7190', 'fw-4545', 'jf-5250', 'jf-5240', 'jf-5270-3f',
    'jf-5270-4f', 'jf-5210-5f', 'jf-9020', 'jf-9040', 'jf-7180', 'jf-7080',
    'jf-5210-4f', 'jf-1010', 'jf-1155d', 'jf-1500', 'jf-1500wo', 'jf-5151',
    'jf-5010', 'jf-5020+5090', 'jf-1130', 'jf-1100', 'fw-2207', 'jf-7190c',
    'fw-4656', 'fw-5540', 'jf-5555', 'jf-5595', 'jf-5180', 'jf-5252', 'jf-9000',
    'jf-9060', 'jf-9005', 'jf-7050', 'jf-7200', 'fw-1155', 'fw-235', 'jf-1400wo',
    'jf-7700', 'jf-5900-k', 'jf-5909-k', 'jf-5151-k'
  ]::text[]) AS sku
)
UPDATE products p
SET is_active = EXISTS (
  SELECT 1 FROM allowlist a WHERE a.sku = lower(trim(p.sku))
);

COMMIT;

-- 4) Verify
SELECT
  COUNT(*) FILTER (WHERE is_active) AS active_count,
  COUNT(*) FILTER (WHERE NOT is_active) AS inactive_count,
  COUNT(*) AS total
FROM products;

SELECT sku, name, is_active
FROM products
WHERE is_active
ORDER BY sku;
