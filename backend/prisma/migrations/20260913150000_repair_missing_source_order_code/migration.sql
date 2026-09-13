-- Repair databases where the baseline order columns were only partially created.
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "sourceOrderCode" TEXT;