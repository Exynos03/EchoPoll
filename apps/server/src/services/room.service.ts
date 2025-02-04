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

  async getActiveRooms(creatorId: number) {
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

    async isRoomActive(roomId: string) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { expire_date: true },
      });
      if (!room) return false;
      return room.expire_date > new Date();
    }

}