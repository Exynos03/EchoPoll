import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Find a user by their OAuth ID.
   * @param oauthId - The OAuth provider ID (e.g., Google, GitHub).
   * @returns The user object if found, otherwise null.
   */
  async findUserByOAuthId(oauthId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { oauth_id: oauthId },
      });
      return user;
    } catch (error) {
      console.error("Error finding user by OAuth ID:", error);
      throw error;
    }
  }

  /**
   * Save a new user to the database.
   * @param userData - The user data to save.
   * @returns The newly created user object.
   */
  async saveUser(userData: {
    oauth_id: string;
    name: string;
    email: string;
    avatar?: string;
  }): Promise<User> {
    try {
      const newUser = await prisma.user.create({
        data: {
          oauth_id: userData.oauth_id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || null,
        },
      });
      return newUser;
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }
}
