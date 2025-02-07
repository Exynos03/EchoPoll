import { consumeMessages } from "../config/kafka";
import prisma from "../config/prisma";
import { redisClient } from "../config/redis";

const startKafkaConsumer = async () => {
  await consumeMessages("room-chat", async (message) => {
    const { type, data } = JSON.parse(message);

    try {
      if (type === "newQuestion") {
        // Persist question in PostgreSQL
        const {
          questionId,
          roomId,
          content,
          senderName,
          upvotes,
          downvotes,
          timestamp,
        } = data;

        try {
          const question = await prisma.question.create({
            data: {
              id: questionId,
              room_id: roomId,
              content,
              sender_name: senderName,
              upvotes,
              downvotes,
              created_at: timestamp,
            },
          });
        } catch (error) {
          console.error("Failed to create question in PostgreSQL:", error);
        }
      } else if (type === "newAnswer") {
        // Persist answer in PostgreSQL
        try {
          await prisma.answer.create({
            data: {
              room_id: data.roomId,
              question_id: data.questionId,
              content: data.content,
              created_at: data.timestamp,
            },
          });
        } catch (error) {
          console.error("Failed to create answer in PostgreSQL:", error);
        }
      } else if (type === "upvoteQuestion") {
        // Increment upvotes for the question
        try {
          await prisma.question.update({
            where: { id: data.questionId },
            data: { upvotes: { increment: 1 } },
          });
        } catch (error) {
          console.error("Failed to upvote question:", error);
        }
      } else if (type === "downvoteQuestion") {
        // Increment downvotes for the question
        try {
          await prisma.question.update({
            where: { id: data.questionId },
            data: { downvotes: { increment: 1 } },
          });
        } catch (error) {
          console.error("Failed to downvote question:", error);
        }
      }
    } catch (error) {
      console.error("Failed to process Kafka message:", error);
    }
  });
};

export { startKafkaConsumer };
