/*
  Warnings:

  - You are about to drop the column `format` on the `Transcription` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transcription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transcription" ("content", "createdAt", "duration", "id", "language", "title", "updatedAt", "userId") SELECT "content", "createdAt", "duration", "id", "language", "title", "updatedAt", "userId" FROM "Transcription";
DROP TABLE "Transcription";
ALTER TABLE "new_Transcription" RENAME TO "Transcription";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
