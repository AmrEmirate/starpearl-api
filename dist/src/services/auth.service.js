"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = require("bcrypt");
const crypto_1 = __importDefault(require("crypto"));
const auth_repository_1 = require("../repositories/auth.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
const createToken_1 = require("../utils/createToken");
const hashPassword_1 = require("../utils/hashPassword");
const cloudinary_1 = require("../config/cloudinary");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = require("../config/prisma");
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    async registerBuyer(data) {
        logger_1.default.info(`Registering buyer: ${data.email}`);
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError_1.default("Email already exists", 400);
        }
        const passwordHash = await (0, hashPassword_1.hashPassword)(data.password);
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
    async registerSeller(data) {
        logger_1.default.info(`Registering seller: ${data.email}`);
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError_1.default("Email already exists", 400);
        }
        const passwordHash = await (0, hashPassword_1.hashPassword)(data.password);
        const newUser = await this.authRepository.createSeller({
            email: data.email,
            name: data.name,
            passwordHash,
            role: "SELLER",
            googleId: null,
        }, data.storeName);
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
    async login(data) {
        logger_1.default.info(`Processing login for: ${data.email}`);
        const account = await this.authRepository.findUserByEmail(data.email);
        if (!account) {
            throw new AppError_1.default("Account is not exist", 404);
        }
        if (account.role === "SELLER") {
            const store = await prisma_1.prisma.store.findUnique({
                where: { userId: account.id },
            });
            if (store?.status !== "APPROVED") {
                throw new AppError_1.default(`Your seller account is ${store?.status?.toLowerCase() || "not approved"}. Please contact admin.`, 403);
            }
        }
        if (!account.passwordHash) {
            throw new AppError_1.default("Please login with Google", 400);
        }
        const comparePass = await (0, bcrypt_1.compare)(data.password, account.passwordHash);
        if (!comparePass) {
            throw new AppError_1.default("Password is wrong", 400);
        }
        const token = (0, createToken_1.createToken)(account, "24h");
        const { passwordHash: _, ...userWithoutPassword } = account;
        return { user: userWithoutPassword, token };
    }
    async updateProfileImage(userId, file) {
        logger_1.default.info(`Updating profile image for user: ${userId}`);
        if (!file) {
            throw new AppError_1.default("No file uploaded", 400);
        }
        const upload = await (0, cloudinary_1.cloudinaryUpload)(file);
        const updatedUser = await this.authRepository.updateUserAvatar(userId, upload.secure_url);
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;
        return {
            message: "Change image profile success",
            imageUrl: upload.secure_url,
            user: userWithoutPassword,
        };
    }
    async resetPassword(data) {
        logger_1.default.info(`Requesting password reset for: ${data.email}`);
        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.authRepository.saveResetToken(user.id, resetToken, passwordResetExpires);
        // In a real app, send email here.
        return {
            message: "Reset password link sent to email",
            token: resetToken, // Returning for testing purposes
        };
    }
    async confirmResetPassword(data) {
        const user = await this.authRepository.findUserByResetToken(data.token);
        if (!user) {
            throw new AppError_1.default("Token is invalid or has expired", 400);
        }
        const passwordHash = await (0, hashPassword_1.hashPassword)(data.newPassword);
        await prisma_1.prisma.user.update({
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
exports.AuthService = AuthService;
