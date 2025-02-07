import Redis from "ioredis";
import { RoomService } from "../services/room.service";

export const redisClient: Redis = new Redis({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
});

redisClient.on("error", (err: Error) =>
  console.error("Redis Client Error", err),
);

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.ping(); // Simple check to confirm connection
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
};

const publishMessage = async (
  channel: string,
  message: string,
): Promise<void> => {
  await redisClient.publish(channel, message);
};

const subscribeToChannel = async (
  channel: string,
  callback: (message: string) => void,
): Promise<void> => {
  const subscriber: Redis = redisClient.duplicate();

  await subscriber.subscribe(channel);
  console.log(`Subscribed to channel: ${channel}`);

  subscriber.on("message", (subscribedChannel: string, message: string) => {
    if (subscribedChannel === channel) {
      callback(message);
    }
  });
};

const restoreRoomsToRedis = async () => {
  const roomService = new RoomService();
  const activeRooms = await roomService.getActiveRooms();

  for (const room of activeRooms) {
    const expireInSeconds = Math.floor(
      (new Date(room.expire_date).getTime() - Date.now()) / 1000,
    );

    if (expireInSeconds > 0) {
      await redisClient.setex(`room:${room.id}`, expireInSeconds, "active");
    }
  }

  console.log("Rooms restored successfully.");
};

export {
  connectRedis,
  publishMessage,
  subscribeToChannel,
  restoreRoomsToRedis,
};
