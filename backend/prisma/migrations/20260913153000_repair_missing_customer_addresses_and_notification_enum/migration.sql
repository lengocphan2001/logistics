-- Repair databases created from an older partial baseline.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WALLET_DEPOSIT_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WALLET_WITHDRAWAL_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WALLET_REQUEST_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WALLET_REQUEST_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ORDER_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ORDER_STATUS_UPDATED';

CREATE TABLE IF NOT EXISTS "customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "receiverAddress" TEXT NOT NULL,
    "receiverProvince" TEXT,
    "receiverDistrict" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "customer_addresses_customerId_isDefault_idx"
ON "customer_addresses"("customerId", "isDefault");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customer_addresses_customerId_fkey'
  ) THEN
    ALTER TABLE "customer_addresses"
      ADD CONSTRAINT "customer_addresses_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "customers"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
