import { User } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import * as bcrypt from "bcrypt";

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

    const updateData: Partial<Pick<User, "name">> = {};
    if (data.name) {
      updateData.name = data.name;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData
    );

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public async changePassword(
    userId: string,
    data: { oldPassword: string; newPassword: string }
  ) {
    logger.info(`Changing password for user: ${userId}`);
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.passwordHash) {
      throw new AppError("User has no password set", 400);
    }

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid old password", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(data.newPassword, salt);

    await this.userRepository.updateUser(userId, {
      passwordHash: newPasswordHash,
    });

    return { message: "Password updated successfully" };
  }
}
