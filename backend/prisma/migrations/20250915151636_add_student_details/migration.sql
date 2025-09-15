-- CreateTable
CREATE TABLE "StudentProfileDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT,
    "studentFullName" TEXT,
    "emailId" TEXT,
    "admissionMonth" TEXT,
    "admissionYear" INTEGER,
    "candidateMobile" TEXT,
    "parentMobile" TEXT,
    "bondPeriodCompleted" BOOLEAN,
    "placementThroughCDPC" BOOLEAN,
    "letterHeadCount" INTEGER,
    "facultySelection" TEXT,
    "semesterResults" JSONB,
    "universityPreferences" JSONB,
    "competitiveExams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfileDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfileDraft_userId_key" ON "StudentProfileDraft"("userId");

-- CreateIndex
CREATE INDEX "StudentProfileDraft_userId_idx" ON "StudentProfileDraft"("userId");

-- AddForeignKey
ALTER TABLE "StudentProfileDraft" ADD CONSTRAINT "StudentProfileDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
