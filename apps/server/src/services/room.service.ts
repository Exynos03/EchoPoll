import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomService {
  async createRoom(name: string, creatorId: number, expireDate: Date) {
    return prisma.room.create({
      data: {
        name,
        creator_id: creatorId,
        expire_date: expireDate,
      },
    });
  }
}