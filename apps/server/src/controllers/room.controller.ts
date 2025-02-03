import { Request, response, Response } from 'express';
import { RoomService } from '../services/room.service';

const roomService = new RoomService();

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { name, expireDate } = req.body;
        const creatorId = req.user.id; // Assuming `req.user` is set by your auth middleware

        const room = await roomService.createRoom(name, creatorId, expireDate);

        res.status(201).json({ responseCode: 1, roomId: room.id });
  } catch (error) {
    res.status(500).json({responseCode: 0, message: 'Failed to create room', error: error.message });
  }
};