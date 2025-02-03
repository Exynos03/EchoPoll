import express from 'express';
import { createRoom } from '../controllers/room.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import validateRequest from '../middleware/validateRequest.middleware';
import { z } from "zod";
import { User} from '@prisma/client';

const bodySchema = z.object({
  name: z.string().min(1, "Name is required"), // Ensures name is a non-empty string
  expireDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Expire date must be in the future",
  }), 
});


// const userSchema = z.object({
//     id: z.number().int(), // User ID, an integer
//     oauth_id: z.string().min(1, "OAuth ID is required"), // OAuth provider ID (e.g., Google, GitHub)
//     name: z.string().min(1, "Name is required"), // User's name (non-empty string)
//     email: z.string().email("Invalid email address").min(1, "Email is required"), // User's email (valid email format)
//     avatar: z.string().url().optional(), // Avatar URL (optional)
//     created_at: z.date(), // Timestamp of account creation
//   });

const roomRouter = express.Router();

// Only authenticated users can create a room
roomRouter.post('/rooms', isAuthenticated, validateRequest(bodySchema), createRoom);

export default roomRouter;