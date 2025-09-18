/*
  Warnings:

  - Added the required column `updatedAt` to the `Transcription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transcription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transcription" ("content", "createdAt", "duration", "format", "id", "language", "title") SELECT "content", "createdAt", "duration", "format", "id", "language", "title" FROM "Transcription";
DROP TABLE "Transcription";
ALTER TABLE "new_Transcription" RENAME TO "Transcription";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT,
    "name" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("clerkId", "createdAt", "credits", "id", "name", "plan") SELECT "clerkId", "createdAt", "credits", "id", "name", "plan" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
