-- CreateEnum
CREATE TYPE "NotificationRecipientType" AS ENUM ('USER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'WALLET_DEPOSIT_REQUEST',
  'WALLET_WITHDRAWAL_REQUEST',
  'WALLET_REQUEST_APPROVED',
  'WALLET_REQUEST_REJECTED'
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
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipientType_recipientId_readAt_idx" ON "notifications"("recipientType", "recipientId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_recipientType_recipientId_createdAt_idx" ON "notifications"("recipientType", "recipientId", "createdAt");
