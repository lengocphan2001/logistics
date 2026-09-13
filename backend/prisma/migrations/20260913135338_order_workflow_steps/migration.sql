-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PURCHASED', 'OUT_OF_STOCK', 'PRICE_CHANGED', 'REFUNDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'QUOTED';
ALTER TYPE "OrderStatus" ADD VALUE 'AWAITING_CN_ARRIVAL';
ALTER TYPE "OrderStatus" ADD VALUE 'AT_CN_WAREHOUSE';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "purchasedPriceCny" DECIMAL(18,2),
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusNote" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "cnWarehouseId" TEXT,
ADD COLUMN     "purchaseOrderCode" TEXT,
ADD COLUMN     "quoteApprovedAt" TIMESTAMP(3),
ADD COLUMN     "quoteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "quoteNote" TEXT,
ADD COLUMN     "quotedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_assignedToId_idx" ON "orders"("assignedToId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_cnWarehouseId_fkey" FOREIGN KEY ("cnWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

