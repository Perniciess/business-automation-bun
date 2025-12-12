-- CreateTable
CREATE TABLE "senders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderFullname" TEXT NOT NULL,
    "senderPassport" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "receivers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiverFullname" TEXT NOT NULL,
    "receiverAccountNumber" TEXT NOT NULL,
    "receiverSwift" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "statementId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "statements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "statements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "statements_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "senders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "statements_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "receivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "senders_senderPassport_key" ON "senders"("senderPassport");

-- CreateIndex
CREATE UNIQUE INDEX "receivers_receiverAccountNumber_key" ON "receivers"("receiverAccountNumber");

-- CreateIndex
CREATE INDEX "attachments_statementId_idx" ON "attachments"("statementId");

-- CreateIndex
CREATE INDEX "statements_senderId_idx" ON "statements"("senderId");

-- CreateIndex
CREATE INDEX "statements_receiverId_idx" ON "statements"("receiverId");

-- CreateIndex
CREATE INDEX "statements_status_idx" ON "statements"("status");

-- CreateIndex
CREATE INDEX "statements_createdAt_idx" ON "statements"("createdAt");

-- CreateIndex
CREATE INDEX "statements_status_createdAt_idx" ON "statements"("status", "createdAt");
