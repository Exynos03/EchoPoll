import { Server } from "socket.io";
import {
  joinRoom,
  newQuestion,
  newAnswer,
  upvoteQuestion,
  downvoteQuestion,
  leaveRoom,
} from "../controllers/socketRoom.controller";

const setupRoomSocket = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId: string) => joinRoom(socket, roomId));
    socket.on(
      "newQuestion",
      (roomId: string, content: string, senderName?: string) =>
        newQuestion(socket, roomId, content, senderName),
    );
    socket.on(
      "newAnswer",
      (roomId: string, content: string, questionId: string) =>
        newAnswer(socket, roomId, content, questionId),
    );
    socket.on("upvoteQuestion", (roomId: string, questionId: string) =>
      upvoteQuestion(socket, roomId, questionId),
    );
    socket.on("downvoteQuestion", (roomId: string, questionId: string) =>
      downvoteQuestion(socket, roomId, questionId),
    );
    socket.on("leaveRoom", (roomId: string) => leaveRoom(socket, roomId));
    socket.on("disconnect", () =>
      console.log(`User disconnected: ${socket.id}`),
    );
  });
};

export { setupRoomSocket };
