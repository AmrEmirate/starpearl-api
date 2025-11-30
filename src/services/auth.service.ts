import { compare } from "bcrypt";
import { AuthRepository } from "../repositories/auth.repository";
import AppError from "../utils/AppError";
import { createToken } from "../utils/createToken";
import { hashPassword } from "../utils/hashPassword";
import { cloudinaryUpload } from "../config/cloudinary";
import { User } from "../generated/prisma";
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
}
