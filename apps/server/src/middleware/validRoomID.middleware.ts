import { Socket } from "socket.io";
import { redisClient } from "../config/redis";
import { RoomService } from "../services/room.service";

interface CustomSocket extends Socket {
    roomId?: string;
}

export const validateRoomID = async (socket: CustomSocket, next: (err?: Error) => void) => {
    try {
        const { roomId } = socket.handshake.auth;
        console.log(socket.handshake)
        if (!roomId || typeof roomId !== "string") {
            return next(new Error("Room ID is required and must be a string"));
        }

        let roomExists = await redisClient.exists(`room:${roomId}`);

        if (!roomExists) {
            // Room is not in Redis, check PostgreSQL
            const roomService = new RoomService()
            const room = await roomService.isActiveRoom(roomId);

            if (!room) {
                return next(new Error("Invalid or expired Room ID"));
            }

            const ttl = Math.floor((room.expire_date.getTime() - Date.now()) / 1000); 
            if (ttl > 0) {
                await redisClient.set(`room:${roomId}`, "active", "EX", ttl);
            }
        }

        socket.roomId = roomId;
        next();
    } catch (error) {
        console.error("Room validation error:", error);
        next(new Error("Internal Server Error"));
    }
};
