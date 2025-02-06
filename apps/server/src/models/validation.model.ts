import { z } from 'zod';

// Validation schema for joining a room
export const joinRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

// Validation schema for new question
export const newQuestionSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  content: z.string().min(1, "Content cannot be empty"),
  senderName: z.string().optional(),
});

// Validation schema for answering a question
export const newAnswerSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  content: z.string().min(1, "Content cannot be empty"),
  questionId: z.string().min(1, "Question ID is required"),
});

// Validation schema for voting on a question
export const voteSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
});

