import { Request, Response } from "express";
import { RoomService } from "../services/room.service";
import { User } from "@prisma/client";

const roomService = new RoomService();

export const createRoom = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, expireDate } = req.body;
    const user = req.user as User;
    const creatorId = user.id;

    const activeRooms = await roomService.getActiveRoomsByCreatorId(creatorId);
    if (activeRooms.length >= 5) {
      res.status(400).json({
        responseCode: 2,
        message: "Room limit exceeded. You can only have up to 5 active rooms.",
      });
      return;
    }

    const room = await roomService.createRoom(name, creatorId, expireDate);
    res.status(201).json({ responseCode: 1, roomId: room.id });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({
      responseCode: 0,
      message: "Failed to create room",
      error: errorMessage,
    });
  }
};
