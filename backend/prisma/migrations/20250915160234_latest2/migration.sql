-- AlterEnum
ALTER TYPE "LORStatus" ADD VALUE 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "LORRequest" ADD COLUMN     "copies" INTEGER,
ADD COLUMN     "requestData" JSONB;

-- CreateTable
CREATE TABLE "LORRequestComment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LORRequestComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LORRequestComment_requestId_idx" ON "LORRequestComment"("requestId");

-- CreateIndex
CREATE INDEX "LORRequestComment_authorId_idx" ON "LORRequestComment"("authorId");

-- AddForeignKey
ALTER TABLE "LORRequestComment" ADD CONSTRAINT "LORRequestComment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LORRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LORRequestComment" ADD CONSTRAINT "LORRequestComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
