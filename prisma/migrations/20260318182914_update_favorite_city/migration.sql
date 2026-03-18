/*
  Warnings:

  - You are about to drop the column `country` on the `FavoriteCity` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `FavoriteCity` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `FavoriteCity` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoriteCity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteCity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FavoriteCity" ("cityName", "createdAt", "id", "orderIndex", "userId") SELECT "cityName", "createdAt", "id", "orderIndex", "userId" FROM "FavoriteCity";
DROP TABLE "FavoriteCity";
ALTER TABLE "new_FavoriteCity" RENAME TO "FavoriteCity";
CREATE UNIQUE INDEX "FavoriteCity_userId_cityName_key" ON "FavoriteCity"("userId", "cityName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
