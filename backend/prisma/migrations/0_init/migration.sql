-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE_MANAGER', 'DRIVER');
-- CreateEnum
CREATE TYPE "WarehouseCountry" AS ENUM ('CN', 'VN');
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW_REQUEST', 'CANCELLED', 'DEPOSIT_PAID', 'PURCHASED', 'SHOP_SHIPPED', 'IN_TRANSIT_TO_VN', 'AT_VN_WAREHOUSE', 'PAID', 'COMPLETED', 'COMPLAINT', 'DELIVERY_REQUESTED');
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'BANK_TRANSFER', 'BALANCE');
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CONSIGNMENT', 'PROXY_ORDER', 'PROXY_PAYMENT', 'PROXY_PURCHASE');
-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'ORDER_DEPOSIT', 'ORDER_PAYMENT', 'ORDER_REFUND');
-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
-- CreateEnum
CREATE TYPE "NotificationRecipientType" AS ENUM ('USER', 'CUSTOMER');
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WALLET_DEPOSIT_REQUEST', 'WALLET_WITHDRAWAL_REQUEST', 'WALLET_REQUEST_APPROVED', 'WALLET_REQUEST_REJECTED', 'ORDER_CREATED', 'ORDER_STATUS_UPDATED');
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "warehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "country" "WarehouseCountry" NOT NULL DEFAULT 'VN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "shippingAddress" TEXT,
    "bankInfo" JSONB,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "billOfLadingCode" TEXT NOT NULL,
    "type" "OrderType" NOT NULL DEFAULT 'PROXY_PURCHASE',
    "status" "OrderStatus" NOT NULL DEFAULT 'DEPOSIT_PAID',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "senderName" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "receiverAddress" TEXT NOT NULL,
    "receiverProvince" TEXT,
    "receiverDistrict" TEXT,
    "weight" DECIMAL(10,2),
    "length" DECIMAL(10,2),
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "declaredValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "codAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "feeTransfer" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "feeInsurance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "feeExtra" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "walletPaidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "estimatedDelivery" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "note" TEXT,
    "customerId" TEXT,
    "createdById" TEXT,
    "driverId" TEXT,
    "warehouseId" TEXT,
    "platform" TEXT,
    "shopId" TEXT,
    "shopName" TEXT,
    "shopUrl" TEXT,
    "itemsTotalCny" DECIMAL(18,2),
    "sourceTrackingCode" TEXT,
    "sourceOrderCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "providerAlias" TEXT NOT NULL,
    "skuId" TEXT,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "priceCny" DECIMAL(18,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCny" DECIMAL(18,2) NOT NULL,
    "url" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "cart_items" (
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
-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "vndPerCny" DECIMAL(12,4) NOT NULL DEFAULT 3500,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,2) NOT NULL,
    "vndAmount" DECIMAL(18,2),
    "exchangeRate" DECIMAL(12,4),
    "note" TEXT,
    "rejectReason" TEXT,
    "referenceCode" TEXT,
    "balanceBefore" DECIMAL(18,2),
    "balanceAfter" DECIMAL(18,2),
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdById" TEXT,
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "customer_addresses" (
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
-- CreateTable
CREATE TABLE "shipping_rates" (
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
-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientType" "NotificationRecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "walletTransactionId" TEXT,
    "orderId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
-- CreateIndex
CREATE INDEX "warehouses_country_idx" ON "warehouses"("country");
-- CreateIndex
CREATE UNIQUE INDEX "customers_username_key" ON "customers"("username");
-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
-- CreateIndex
CREATE UNIQUE INDEX "orders_billOfLadingCode_key" ON "orders"("billOfLadingCode");
-- CreateIndex
CREATE INDEX "orders_billOfLadingCode_idx" ON "orders"("billOfLadingCode");
-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");
-- CreateIndex
CREATE INDEX "orders_type_idx" ON "orders"("type");
-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
-- CreateIndex
CREATE UNIQUE INDEX "carts_customerId_key" ON "carts"("customerId");
-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");
-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_itemId_skuId_key" ON "cart_items"("cartId", "itemId", "skuId");
-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_code_key" ON "wallet_transactions"("code");
-- CreateIndex
CREATE INDEX "wallet_transactions_customerId_idx" ON "wallet_transactions"("customerId");
-- CreateIndex
CREATE INDEX "wallet_transactions_orderId_idx" ON "wallet_transactions"("orderId");
-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");
-- CreateIndex
CREATE INDEX "wallet_transactions_status_idx" ON "wallet_transactions"("status");
-- CreateIndex
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");
-- CreateIndex
CREATE INDEX "customer_addresses_customerId_isDefault_idx" ON "customer_addresses"("customerId", "isDefault");
-- CreateIndex
CREATE UNIQUE INDEX "shipping_rates_method_key" ON "shipping_rates"("method");
-- CreateIndex
CREATE INDEX "notifications_recipientType_recipientId_readAt_idx" ON "notifications"("recipientType", "recipientId", "readAt");
-- CreateIndex
CREATE INDEX "notifications_recipientType_recipientId_createdAt_idx" ON "notifications"("recipientType", "recipientId", "createdAt");
-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
