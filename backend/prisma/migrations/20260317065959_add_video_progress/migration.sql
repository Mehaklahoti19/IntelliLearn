-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN "videoProgress" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookmarked_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookmarked_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmarked_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bookmarked_courses" ("course_id", "created_at", "id", "user_id") SELECT "course_id", "created_at", "id", "user_id" FROM "bookmarked_courses";
DROP TABLE "bookmarked_courses";
ALTER TABLE "new_bookmarked_courses" RENAME TO "bookmarked_courses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
