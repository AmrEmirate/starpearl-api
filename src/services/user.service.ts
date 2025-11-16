import { User } from "../generated/prisma";
import { UserRepository } from "../repositories/user.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async getUserProfile(userId: string) {
    logger.info(`Fetching profile for user: ${userId}`);
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async updateUserProfile(userId: string, data: { name?: string }) {
    logger.info(`Updating profile for user: ${userId}`);
    
    // Kita hanya akan proses data yang diizinkan (contoh: name)
    const updateData: Partial<Pick<User, "name">> = {};
    if (data.name) {
      updateData.name = data.name;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}