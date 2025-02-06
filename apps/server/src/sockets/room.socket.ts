import { Server } from 'socket.io';
import { publishMessage, subscribeToChannel } from '../config/redis';
import { sendMessageToKafka } from '../config/kafka';
import { joinRoomSchema, newAnswerSchema, newQuestionSchema, voteSchema } from '../models/validation.model';
import { User } from "@prisma/client";


/**
 * Sets up Socket.IO and Redis Pub/Sub for real-time room communication.
 * @param io - The Socket.IO server instance.
 */
const setupRoomSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId: string) => {
        // Validate input
        const validationResult = joinRoomSchema.safeParse({ roomId});

        if (!validationResult.success) {
          return socket.emit('error', { message: validationResult.error.errors });
        }
      
        socket.join(roomId);

      // Subscribe to Redis channel for the room
      subscribeToChannel(`room:${roomId}`, (message) => {
        const { type, data } = JSON.parse(message);
        socket.emit(type, data); // Emit the message to the user
      });
    });

    // Handle new question
    socket.on('newQuestion', async (roomId: string, content: string, senderName?: string) => {
       // Validate input
       const validationResult = newQuestionSchema.safeParse({ roomId});

       if (!validationResult.success) {
         return socket.emit('error', { message: validationResult.error.errors });
       }
      
      const messageData = {
        type: 'newQuestion',
        data: {
          roomId,
          content,
          senderName: senderName || 'Anonymous', // Default to 'Anonymous' if no name is provided
          upvotes: 0,
          downvotes: 0,
          timestamp: new Date(),
        },
      };

      try {
        // Publish to Redis channel
        await publishMessage(`room:${roomId}`, JSON.stringify(messageData));

        // Send to Kafka for persistence
        await sendMessageToKafka('room-chat', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish new question:', error);
      }
    });

    // Handle new answer (only room creator can answer)
    socket.on('newAnswer', async (roomId: string, content: string, questionId: string) => {
       // Validate input
       try {

        // Ensure user is logged in
        const user = (socket.request as any).user;

        if (!user) {
          return socket.emit("error", { message: "Unauthorized: Please log in" });
        }

      console.log("Authenticated User:", user);
       const validationResult = newAnswerSchema.safeParse({ roomId});

       if (!validationResult.success) {
         return socket.emit('error', { message: validationResult.error.errors });
       }
      
      const messageData = {
        type: 'newAnswer',
        data: {
          roomId,
          content,
          questionId,
          timestamp: new Date(),
        },
      };

      
        // Publish to Redis channel
        await publishMessage(`room:${roomId}`, JSON.stringify(messageData));

        // Send to Kafka for persistence
        await sendMessageToKafka('room-chat', JSON.stringify(messageData));

      } catch (error) {
        console.error("Error handling newAnswer:", error);
        socket.emit("error", { message: "Internal Server Error" });
      }
    });

    // Handle upvote for a question
    socket.on('upvoteQuestion', async (roomId: string, questionId: string) => {
       // Validate input
       const validationResult = voteSchema.safeParse({ roomId});

       if (!validationResult.success) {
         return socket.emit('error', { message: validationResult.error.errors });
       }
      
      const messageData = {
        type: 'upvoteQuestion',
        data: {
          roomId,
          questionId,
          timestamp: new Date(),
        },
      };

      try {
        // Publish to Redis channel
        await publishMessage(`room:${roomId}`, JSON.stringify(messageData));

        // Send to Kafka for persistence
        await sendMessageToKafka('room-chat', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish upvote:', error);
      }
    });

    // Handle downvote for a question
    socket.on('downvoteQuestion', async (roomId: string, questionId: string) => {
      const validationResult = voteSchema.safeParse({ roomId});

      if (!validationResult.success) {
        return socket.emit('error', { message: validationResult.error.errors });
      }

      const messageData = {
        type: 'downvoteQuestion',
        data: {
          roomId,
          questionId,
          timestamp: new Date(),
        },
      };

      try {
        // Publish to Redis channel
        await publishMessage(`room:${roomId}`, JSON.stringify(messageData));

        // Send to Kafka for persistence
        await sendMessageToKafka('room-chat', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish downvote:', error);
      }
    });

    // Leave a room
    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export { setupRoomSocket };