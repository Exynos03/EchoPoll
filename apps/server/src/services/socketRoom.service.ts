import { v4 as uuidv4 } from "uuid";
import {
  publishMessage,
  redisClient,
  subscribeToChannel,
} from "../config/redis";
import { sendMessageToKafka } from "../config/kafka";
import prisma from "../config/prisma";

export const getRoomData = async (roomId: string) => {
  const roomData = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });

  if (roomData) {
    return {
      questions: roomData.questions.map((question) => ({
        id: question.id,
        content: question.content,
        senderName: question.sender_name,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        timestamp: question.created_at,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          content: answer.content,
          timestamp: answer.created_at,
        })),
      })),
    };
  }
  return null;
};

export const createQuestion = async (
  roomId: string,
  content: string,
  senderName?: string,
) => {
  const questionId = uuidv4();
  const messageData = {
    type: "newQuestion",
    data: {
      questionId,
      roomId,
      content,
      senderName: senderName || "Anonymous",
      upvotes: 0,
      downvotes: 0,
      timestamp: new Date(),
    },
  };

  await redisClient.setex(`question:${questionId}`, 86400, "valid");
  await publishMessage(`room:${roomId}`, JSON.stringify(messageData));
  await sendMessageToKafka("room-chat", JSON.stringify(messageData));

  return messageData.data;
};

export const createAnswer = async (
  roomId: string,
  content: string,
  questionId: string,
) => {
  const messageData = {
    type: "newAnswer",
    data: {
      roomId,
      content,
      questionId,
      timestamp: new Date(),
    },
  };

  await publishMessage(`room:${roomId}`, JSON.stringify(messageData));
  await sendMessageToKafka("room-chat", JSON.stringify(messageData));

  return messageData.data;
};

export const upvoteQuestion = async (roomId: string, questionId: string) => {
  const messageData = {
    type: "upvoteQuestion",
    data: {
      roomId,
      questionId,
      timestamp: new Date(),
    },
  };

  await publishMessage(`room:${roomId}`, JSON.stringify(messageData));
  await sendMessageToKafka("room-chat", JSON.stringify(messageData));

  return messageData.data;
};

export const downvoteQuestion = async (roomId: string, questionId: string) => {
  const messageData = {
    type: "downvoteQuestion",
    data: {
      roomId,
      questionId,
      timestamp: new Date(),
    },
  };

  await publishMessage(`room:${roomId}`, JSON.stringify(messageData));
  await sendMessageToKafka("room-chat", JSON.stringify(messageData));

  return messageData.data;
};
