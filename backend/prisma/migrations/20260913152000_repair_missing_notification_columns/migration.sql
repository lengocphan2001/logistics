-- Repair notifications created from an older partial schema.
ALTER TABLE "notifications"
ADD COLUMN IF NOT EXISTS "walletTransactionId" TEXT,
ADD COLUMN IF NOT EXISTS "orderId" TEXT;
