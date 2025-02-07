import { PrismaClient, Room } from "@prisma/client";
import { publishMessage, redisClient } from "../config/redis";
import { sendMessageToKafka } from "../config/kafka";

// interface Room {
//   id: number;
//   name: string;
//   creator_id: number;
//   expire_date: Date;
// }

const prisma = new PrismaClient();

export class RoomService {
  async createRoom(
    name: string,
    creatorId: number,
    expireDate: Date,
  ): Promise<Room> {
    try {
      const room: Room = await prisma.room.create({
        data: {
          name,
          creator_id: creatorId,
          expire_date: expireDate,
        },
      });

      const roomId = room.id;
      const expireInSeconds = Math.floor(
        (expireDate.getTime() - Date.now()) / 1000,
      );

      if (expireInSeconds > 0) {
        await redisClient.setex(`room:${roomId}`, expireInSeconds, "active");
      }

      return room;
    } catch (error) {
      console.error("Error creating room:", error);
      throw new Error("Failed to create room");
    }
  }

  async getActiveRoomsByCreatorId(creatorId: number) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return prisma.room.findMany({
      where: {
        creator_id: creatorId,
        expire_date: {
          gt: threeDaysAgo,
        },
      },
    });
  }

  async isActiveRoom(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || room.expire_date <= new Date()) {
      return null;
    }

    return room; // Returns the full room data if active
  }

  async sendMessageToRoom(
    roomId: string,
    senderName: string | null,
    content: string,
  ) {
    // If senderName is not provided, default to 'Anonymous'
    const sender = senderName || "anonymous";

    // Create the message payload
    const message = JSON.stringify({
      roomId,
      senderName: sender,
      content,
    });

    // Publish the message to the Redis channel for the room
    await publishMessage(`room:${roomId}`, message);

    // Send the message to Kafka for persistence
    await sendMessageToKafka("eurora-app-group", message);
  }

  async getActiveRooms() {
    try {
      const activeRooms = await prisma.room.findMany({
        where: {
          expire_date: {
            gt: new Date(), // Fetch rooms where expire_date is greater than the current time
          },
        },
        select: {
          id: true,
          name: true,
          expire_date: true,
          created_at: true,
        },
        orderBy: {
          created_at: "desc", // Sort by newest rooms first
        },
      });

      return activeRooms;
    } catch (error) {
      console.error("Error fetching active rooms:", error);
      throw new Error("Failed to fetch active rooms");
    }
  }
}
