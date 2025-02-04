import express from 'express';
import { createRoom } from '../controllers/room.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import validateRequest from '../middleware/validateRequest.middleware';
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1, "Name is required"), // Ensures name is a non-empty string
  expireDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Expire date must be in the future",
  }), 
});

const roomRouter = express.Router();

// Only authenticated users can create a room
roomRouter.post('/create', isAuthenticated, validateRequest(bodySchema), createRoom);

export default roomRouter;