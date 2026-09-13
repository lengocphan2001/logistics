-- Repair databases that were marked with the baseline migration before all
-- baseline objects had been created.
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "sourceTrackingCode" TEXT;

CREATE TABLE IF NOT EXISTS "shipping_rates" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerKgVnd" DECIMAL(18,2) NOT NULL,
    "minChargeVnd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "estimatedDays" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "shipping_rates_method_key"
ON "shipping_rates"("method");
