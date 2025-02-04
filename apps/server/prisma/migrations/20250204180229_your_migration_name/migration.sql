/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_room_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender_name" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
