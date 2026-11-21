-- AlterTable
ALTER TABLE "Course" ADD COLUMN "objectives" JSONB;
ALTER TABLE "Course" ADD COLUMN "outcomes" JSONB;

-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "prerequisiteCourseId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'HARD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoursePrerequisite_prerequisiteCourseId_fkey" FOREIGN KEY ("prerequisiteCourseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LearningPathCourse" (
    "learningPathId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "stageIndex" INTEGER NOT NULL DEFAULT 1,
    "stageTitle" TEXT,

    PRIMARY KEY ("learningPathId", "courseId"),
    CONSTRAINT "LearningPathCourse_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearningPathCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LearningPathCourse" ("courseId", "learningPathId", "orderIndex") SELECT "courseId", "learningPathId", "orderIndex" FROM "LearningPathCourse";
DROP TABLE "LearningPathCourse";
ALTER TABLE "new_LearningPathCourse" RENAME TO "LearningPathCourse";
CREATE INDEX "LearningPathCourse_courseId_idx" ON "LearningPathCourse"("courseId");
CREATE TABLE "new_Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'CHECKPOINT',
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "maxAttempts" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Quiz" ("createdAt", "description", "id", "lessonId", "maxAttempts", "passingScore", "shuffleQuestions", "title", "updatedAt") SELECT "createdAt", "description", "id", "lessonId", "maxAttempts", "passingScore", "shuffleQuestions", "title", "updatedAt" FROM "Quiz";
DROP TABLE "Quiz";
ALTER TABLE "new_Quiz" RENAME TO "Quiz";
CREATE INDEX "Quiz_lessonId_idx" ON "Quiz"("lessonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CoursePrerequisite_courseId_idx" ON "CoursePrerequisite"("courseId");

-- CreateIndex
CREATE INDEX "CoursePrerequisite_prerequisiteCourseId_idx" ON "CoursePrerequisite"("prerequisiteCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePrerequisite_courseId_prerequisiteCourseId_key" ON "CoursePrerequisite"("courseId", "prerequisiteCourseId");

