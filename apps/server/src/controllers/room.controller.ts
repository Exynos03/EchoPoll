import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

// Define User type with `id` property
interface User {
  id: number; // Assuming `id` is a string, change to `number` if needed
}

interface AuthenticatedRequest extends Request {
  user?: User; // Make `user` optional
}

const roomService = new RoomService();

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, expireDate } = req.body;

    // Ensure `req.user` exists before accessing `id`
    if (!req.user || !req.user.id) {
      return res.status(401).json({ responseCode: 0, message: "Unauthorized: User not found" });
    }

    const creatorId = req.user.id;
    const room = await roomService.createRoom(name, creatorId, expireDate);

    res.status(201).json({ responseCode: 1, roomId: room.id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ responseCode: 0, message: "Failed to create room", error: errorMessage });
  }
};
