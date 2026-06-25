-- Warehouse country (CN = kho Trung Quốc, VN = kho Việt Nam)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WarehouseCountry') THEN
    CREATE TYPE "WarehouseCountry" AS ENUM ('CN', 'VN');
  END IF;
END $$;

ALTER TABLE "warehouses"
  ADD COLUMN IF NOT EXISTS "country" "WarehouseCountry" NOT NULL DEFAULT 'VN';

CREATE INDEX IF NOT EXISTS "warehouses_country_idx" ON "warehouses"("country");

INSERT INTO "warehouses" ("id", "name", "code", "address", "country", "updatedAt")
VALUES
  ('a1000001-0000-4000-8000-000000000001', 'Bằng Tường', 'CN-BT-01', 'Bằng Tường, Quảng Ninh, Trung Quốc', 'CN', NOW()),
  ('a1000001-0000-4000-8000-000000000002', 'Đông Hưng', 'CN-DH-01', 'Đông Hưng, Quảng Ninh, Trung Quốc', 'CN', NOW()),
  ('a1000001-0000-4000-8000-000000000003', 'Quảng Châu', 'CN-GZ-01', 'Quảng Châu, Quảng Đông, Trung Quốc', 'CN', NOW())
ON CONFLICT ("code") DO UPDATE SET
  "country" = EXCLUDED."country",
  "name" = EXCLUDED."name",
  "address" = EXCLUDED."address",
  "updatedAt" = NOW();
