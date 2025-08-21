-- CreateTable
CREATE TABLE "SupportingDocument" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportingDocument_requestId_idx" ON "SupportingDocument"("requestId");

-- AddForeignKey
ALTER TABLE "SupportingDocument" ADD CONSTRAINT "SupportingDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LORRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
