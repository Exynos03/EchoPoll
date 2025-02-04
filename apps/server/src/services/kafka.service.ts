import { consumeMessages } from '../config/kafka';
import prisma from '../config/prisma';

const startKafkaConsumer = async () => {
  await consumeMessages('room-messages', async (message) => {
    const { type, data } = JSON.parse(message);

    try {
      if (type === 'newQuestion') {
        // Persist question in PostgreSQL
        await prisma.question.create({
          data: {
            id: data.questionId,
            room_id: data.roomId,
            content: data.question,
            sender_name: data.senderName,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            created_at: data.timestamp,
          },
        });
        
      } else if (type === 'newAnswer') {
        // Persist answer in PostgreSQL
        await prisma.answer.create({
          data: {
            room_id: data.roomId,
            question_id: data.questionId,
            content: data.answer,
            created_at: data.timestamp,
          },
        });
        
      } else if (type === 'upvoteQuestion') {
        // Increment upvotes for the question
        await prisma.question.update({
          where: { id: data.questionId },
          data: { upvotes: { increment: 1 } },
        });
        
      } else if (type === 'downvoteQuestion') {
        // Increment downvotes for the question
        await prisma.question.update({
          where: { id: data.questionId },
          data: { downvotes: { increment: 1 } },
        });
        
      }
    } catch (error) {
      console.error('Failed to process Kafka message:', error);
    }
  });
};

export { startKafkaConsumer };