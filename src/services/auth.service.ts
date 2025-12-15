import { compare } from "bcrypt";
import crypto from "crypto";
import { AuthRepository } from "../repositories/auth.repository";
import AppError from "../utils/AppError";
import { createToken } from "../utils/createToken";
import { hashPassword } from "../utils/hashPassword";
import { cloudinaryUpload } from "../config/cloudinary";
import { User } from "@prisma/client";
import logger from "../utils/logger";
import { prisma } from "../config/prisma";

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  public async registerBuyer(data: any) {
    logger.info(`Registering buyer: ${data.email}`);
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await this.authRepository.createUser({
      email: data.email,
      name: data.name,
      passwordHash,
      role: "BUYER",
      googleId: null,
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  public async registerSeller(data: any) {
    logger.info(`Registering seller: ${data.email}`);
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await this.authRepository.createSeller(
      {
        email: data.email,
        name: data.name,
        passwordHash,
        role: "SELLER",
        googleId: null,
      },
      data.storeName
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  public async login(data: { email: string; password: string }) {
    logger.info(`Processing login for: ${data.email}`);
    const account = await this.authRepository.findUserByEmail(data.email);
    if (!account) {
      throw new AppError("Account is not exist", 404);
    }

    if (account.role === "SELLER") {
      const store = await prisma.store.findUnique({
        where: { userId: account.id },
      });
      if (store?.status !== "APPROVED") {
        throw new AppError(
          `Your seller account is ${
            store?.status?.toLowerCase() || "not approved"
          }. Please contact admin.`,
          403
        );
      }
    }

    if (!account.passwordHash) {
      throw new AppError("Please login with Google", 400);
    }

    const comparePass = await compare(data.password, account.passwordHash);
    if (!comparePass) {
      throw new AppError("Password is wrong", 400);
    }

    const token = createToken(account, "24h");
    const { passwordHash: _, ...userWithoutPassword } = account;

    return { user: userWithoutPassword, token };
  }

  public async updateProfileImage(userId: string, file: Express.Multer.File) {
    logger.info(`Updating profile image for user: ${userId}`);
    if (!file) {
      throw new AppError("No file uploaded", 400);
    }

    const upload = await cloudinaryUpload(file);
    const updatedUser = await this.authRepository.updateUserAvatar(
      userId,
      upload.secure_url
    );

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return {
      message: "Change image profile success",
      imageUrl: upload.secure_url,
      user: userWithoutPassword,
    };
  }
  public async resetPassword(data: { email: string }) {
    logger.info(`Requesting password reset for: ${data.email}`);
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.authRepository.saveResetToken(
      user.id,
      resetToken,
      passwordResetExpires
    );

    // In a real app, send email here.
    return {
      message: "Reset password link sent to email",
      token: resetToken, // Returning for testing purposes
    };
  }

  public async confirmResetPassword(data: {
    token: string;
    newPassword: string;
  }) {
    const user = await this.authRepository.findUserByResetToken(data.token);
    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    const passwordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Password successfully updated" };
  }
}
