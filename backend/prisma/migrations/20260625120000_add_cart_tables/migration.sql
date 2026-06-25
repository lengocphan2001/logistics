-- Cart tables + note column (safe to re-run)
CREATE TABLE IF NOT EXISTS "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "carts_customerId_key" ON "carts"("customerId");

CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "providerAlias" TEXT NOT NULL,
    "skuId" TEXT,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "priceCny" DECIMAL(18,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT,
    "shopId" TEXT,
    "shopName" TEXT,
    "platform" TEXT,
    "properties" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cartId_itemId_skuId_key"
  ON "cart_items"("cartId", "itemId", "skuId");

CREATE INDEX IF NOT EXISTS "cart_items_cartId_idx" ON "cart_items"("cartId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'note'
  ) THEN
    ALTER TABLE "cart_items" ADD COLUMN "note" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'carts_customerId_fkey'
  ) THEN
    ALTER TABLE "carts"
      ADD CONSTRAINT "carts_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "customers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_cartId_fkey'
  ) THEN
    ALTER TABLE "cart_items"
      ADD CONSTRAINT "cart_items_cartId_fkey"
      FOREIGN KEY ("cartId") REFERENCES "carts"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
