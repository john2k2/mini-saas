/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "page" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name") SELECT "createdAt", "email", "emailVerified", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "idx_user_activity_user_date" ON "UserActivity"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_user_activity_action_date" ON "UserActivity"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_user_activity_user_action" ON "UserActivity"("userId", "action");

-- CreateIndex
CREATE INDEX "idx_page_view_user_date" ON "PageView"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_page_view_page_date" ON "PageView"("page", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_page_view_ip_date" ON "PageView"("ip", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_api_usage_user_date" ON "ApiUsage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_api_usage_endpoint_date" ON "ApiUsage"("endpoint", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_api_usage_status_date" ON "ApiUsage"("status", "createdAt" DESC);
