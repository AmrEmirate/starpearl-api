"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
const bcrypt = __importStar(require("bcrypt"));
class UserService {
    userRepository;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    async getUserProfile(userId) {
        logger_1.default.info(`Fetching profile for user: ${userId}`);
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async updateUserProfile(userId, data) {
        logger_1.default.info(`Updating profile for user: ${userId}`);
        const updateData = {};
        if (data.name) {
            updateData.name = data.name;
        }
        if (Object.keys(updateData).length === 0) {
            throw new AppError_1.default("No valid fields to update", 400);
        }
        const updatedUser = await this.userRepository.updateUser(userId, updateData);
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async changePassword(userId, data) {
        logger_1.default.info(`Changing password for user: ${userId}`);
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        if (!user.passwordHash) {
            throw new AppError_1.default("User has no password set", 400);
        }
        const isPasswordValid = await bcrypt.compare(data.oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError_1.default("Invalid old password", 400);
        }
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(data.newPassword, salt);
        await this.userRepository.updateUser(userId, {
            passwordHash: newPasswordHash,
        });
        return { message: "Password updated successfully" };
    }
}
exports.UserService = UserService;
