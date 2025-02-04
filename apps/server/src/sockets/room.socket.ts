import { Server } from 'socket.io';
import { publishMessage, subscribeToChannel } from '../config/redis';
import { sendMessageToKafka } from '../config/kafka';

/**
 * Sets up Socket.IO and Redis Pub/Sub for real-time room communication.
 * @param io - The Socket.IO server instance.
 */
const setupRoomSocket = (io: Server) => {
  io.on('connection', (socket) => {

    // Join a room
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);

      // Subscribe to Redis channel for the room
      subscribeToChannel(`room:${roomId}`, (message) => {
        const { type, data } = JSON.parse(message);
        socket.emit(type, data); // Emit the message to the user
      });
    });

    // Handle new question
    socket.on('newQuestion', async (roomId: string, content: string, senderName?: string) => {
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
        await sendMessageToKafka('eurora-app-group', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish new question:', error);
      }
    });

    // Handle new answer (only room creator can answer)
    socket.on('newAnswer', async (roomId: string, content: string, questionId: string) => {
      const messageData = {
        type: 'newAnswer',
        data: {
          roomId,
          content,
          questionId,
          timestamp: new Date(),
        },
      };

      try {
        // Publish to Redis channel
        await publishMessage(`room:${roomId}`, JSON.stringify(messageData));

        // Send to Kafka for persistence
        await sendMessageToKafka('eurora-app-group', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish new answer:', error);
      }
    });

    // Handle upvote for a question
    socket.on('upvoteQuestion', async (roomId: string, questionId: string) => {
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
        await sendMessageToKafka('eurora-app-group', JSON.stringify(messageData));

      } catch (error) {
        console.error('Failed to publish upvote:', error);
      }
    });

    // Handle downvote for a question
    socket.on('downvoteQuestion', async (roomId: string, questionId: string) => {
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
        await sendMessageToKafka('eurora-app-group', JSON.stringify(messageData));

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