import { Socket } from "socket.io";
import {
  joinRoomSchema,
  newQuestionSchema,
  newAnswerSchema,
  voteSchema,
} from "../models/validation.model";
import {
  getRoomData,
  createQuestion,
  createAnswer,
  upvoteQuestion as upvoteQuestionService,
  downvoteQuestion as downvoteQuestionService,
} from "../services/socketRoom.service";
import { redisClient, subscribeToChannel } from "../config/redis";

export const joinRoom = async (socket: Socket, roomId: string) => {
  const validationResult = joinRoomSchema.safeParse({ roomId });

  if (!validationResult.success) {
    return socket.emit("error", { message: validationResult.error.errors });
  }

  socket.join(roomId);
  console.log("someone joined => ", roomId);
  subscribeToChannel(`room:${roomId}`, (message) => {
    const { type, data } = JSON.parse(message);
    socket.emit(type, data);
  });

  try {
    const roomData = await getRoomData(roomId);
    if (roomData) {
      socket.emit("roomHistory", roomData);
    }
  } catch (error) {
    console.error("Failed to fetch room data:", error);
    socket.emit("error", { message: "Failed to fetch room data" });
  }
};

export const newQuestion = async (
  socket: Socket,
  roomId: string,
  content: string,
  senderName?: string,
) => {
  const validationResult = newQuestionSchema.safeParse({
    roomId,
    content,
    senderName,
  });

  if (!validationResult.success) {
    return socket.emit("error", { message: validationResult.error.errors });
  }

  try {
    await createQuestion(roomId, content, senderName);
  } catch (error) {
    console.error("Failed to create new question:", error);
    socket.emit("error", { message: "Failed to create new question" });
  }
};

export const newAnswer = async (
  socket: Socket,
  roomId: string,
  content: string,
  questionId: string,
) => {
  const user = (socket.request as any).user;
  console.log("User in socket request:", user);

  if (!user) {
    return socket.emit("error", {
      message: "Unauthorized: Please log in",
    });
  }

  const validationResult = newAnswerSchema.safeParse({
    roomId,
    content,
    questionId,
  });

  if (!validationResult.success) {
    return socket.emit("error", { message: validationResult.error.errors });
  }

  try {
    await createAnswer(roomId, content, questionId);
  } catch (error) {
    console.error("Failed to create new answer:", error);
    socket.emit("error", { message: "Failed to create new answer" });
  }
};

export const upvoteQuestion = async (
  socket: Socket,
  roomId: string,
  questionId: string,
) => {
  const validationResult = voteSchema.safeParse({ roomId, questionId });

  if (!validationResult.success) {
    return socket.emit("error", { message: validationResult.error.errors });
  }

  const questionExists = await redisClient.exists(`question:${questionId}`);

  if (!questionExists) {
    return socket.emit("error", { message: "Invalid questionId" });
  }

  try {
    await upvoteQuestionService(roomId, questionId);
  } catch (error) {
    console.error("Failed to upvote question:", error);
    socket.emit("error", { message: "Failed to upvote question" });
  }
};

export const downvoteQuestion = async (
  socket: Socket,
  roomId: string,
  questionId: string,
) => {
  const validationResult = voteSchema.safeParse({ roomId, questionId });

  if (!validationResult.success) {
    return socket.emit("error", { message: validationResult.error.errors });
  }

  const questionExists = await redisClient.exists(`question:${questionId}`);

  if (!questionExists) {
    return socket.emit("error", { message: "Invalid questionId" });
  }

  try {
    await downvoteQuestionService(roomId, questionId);
  } catch (error) {
    console.error("Failed to downvote question:", error);
    socket.emit("error", { message: "Failed to downvote question" });
  }
};

export const leaveRoom = (socket: Socket, roomId: string) => {
  socket.leave(roomId);
};
