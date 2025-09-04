-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "admissionMonth" TEXT NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "candidateMobile" TEXT NOT NULL,
    "parentMobile" TEXT NOT NULL,
    "bondPeriodCompleted" BOOLEAN NOT NULL,
    "placementThroughCDPC" BOOLEAN NOT NULL,
    "letterHeadCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "facultySelection" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterResult" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "attendance" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemesterResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "universityName" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "intakeMonth" TEXT NOT NULL,
    "intakeYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveExam" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "score" TEXT,
    "scorecardFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitiveExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_userId_idx" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "SemesterResult_profileId_idx" ON "SemesterResult"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SemesterResult_profileId_semester_key" ON "SemesterResult"("profileId", "semester");

-- CreateIndex
CREATE INDEX "UniversityPreference_profileId_idx" ON "UniversityPreference"("profileId");

-- CreateIndex
CREATE INDEX "CompetitiveExam_profileId_idx" ON "CompetitiveExam"("profileId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterResult" ADD CONSTRAINT "SemesterResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPreference" ADD CONSTRAINT "UniversityPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveExam" ADD CONSTRAINT "CompetitiveExam_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
